import express, { Request, Response, Router } from 'express';
import multer from 'multer';

import Job from '../models/Job';
import CandidateProfile from '../models/CandidateProfile';
import Application from '../models/Application';
import Organization from '../models/Organization';
import JobCandidatePool from '../models/JobCandidatePool';
import ScreeningResult from '../models/ScreeningResult';
import ScreeningRun from '../models/ScreeningRun';
import Shortlist from '../models/Shortlist';
import Notification from '../models/Notification';
import { batchScoreCandidates } from '../services/geminiService';
import { notifyShortlisted } from '../services/twilioService';
import { parseCsvBuffer, parseExcelBuffer, parsePdfBuffer, parseDocxBuffer, parseRankrJsonBuffer, ParsedCandidate } from '../services/fileParserService';
import { requireAuth, requireRole } from '../middleware/auth'
import { ok, fail } from '../utils/apiResponse'

const router: Router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function toArray(input: any): any[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return String(input).split(',').map((v) => v.trim()).filter(Boolean);
}

router.get('/recruiter/applications', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const organization = await Organization.findById(req.user.organizationId).lean();
    if (!organization) {
      return ok(res, { company: null, jobs: [], applications: [] });
    }

    const jobs = await Job.find({ organizationId: organization._id }).sort({ createdAt: -1 }).lean();
    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
      .sort({ appliedAt: -1 })
      .populate('jobId')
      .populate('candidateProfileId')
      .lean();

    const mappedApplications = applications.map((app: any) => {
      const job = app.jobId as any;
      const candidate = app.candidateProfileId as any;

      return {
        id: app._id,
        jobId: job?._id,
        jobTitle: job?.title || 'Unknown Role',
        company: organization.name,
        candidateName: candidate?.fullName || 'Unknown Candidate',
        candidateTitle: candidate?.professionalTitle || 'Candidate',
        location: candidate?.location || 'Remote',
        status: app.status,
        matchScore: app.matchScore,
        feedback: app.feedback,
        appliedAt: app.appliedAt,
        skills: candidate?.skills || [],
      };
    });

    const shortlistDocs = await Shortlist.find({ jobId: { $in: jobIds } }).lean();
    const shortlistByJob = new Map<string, number>();
    shortlistDocs.forEach((item) => {
      const key = String(item.jobId);
      shortlistByJob.set(key, (shortlistByJob.get(key) || 0) + 1);
    });

    return ok(res, {
      company: organization.name,
      jobs: jobs.map((job) => ({
        id: job._id,
        title: job.title,
        department: job.department,
        experienceLevel: job.experienceLevel,
        employmentType: job.employmentType,
        requiredSkills: job.requiredSkills,
        minYearsExperience: job.minYearsExperience,
        education: job.education,
        description: job.description,
        niceToHave: job.niceToHave,
        location: job.location,
        status: job.status,
        createdAt: job.createdAt,
        shortlistedCount: shortlistByJob.get(String(job._id)) || 0,
      })),
      applications: mappedApplications,
      shortlistTotal: shortlistDocs.length,
    });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

async function persistParsedCandidates(jobId: any, userId: any, parsed: ParsedCandidate[]): Promise<{ imported: number; skipped: number }> {
  if (!parsed.length) return { imported: 0, skipped: 0 };

  const profiles = await CandidateProfile.insertMany(parsed.map((p) => ({
    source: p.source,
    fullName: p.fullName,
    professionalTitle: p.professionalTitle,
    location: p.location,
    yearsExperience: p.yearsExperience,
    skills: p.skills,
    education: p.education,
    summary: p.summary,
    completionPct: p.completionPct,
    cv: p.cv || { fileName: '', storageUrl: '', uploadedAt: null, extractedText: '' },
  })));

  const poolDocs = profiles.map((profile) => ({
    jobId,
    candidateProfileId: profile._id,
    source: profile.source,
    addedBy: userId,
    status: 'pending_screening',
  }));

  const applicationDocs = profiles.map((profile) => ({
    jobId,
    candidateProfileId: profile._id,
    candidateUserId: null,
    status: 'applied',
    matchScore: 0,
    feedback: 'Imported candidate — pending AI screening.',
    appliedAt: new Date(),
  }));

  await Promise.all([
    JobCandidatePool.insertMany(poolDocs),
    Application.insertMany(applicationDocs),
  ]);

  return { imported: profiles.length, skipped: 0 };
}

router.post('/jobs/:jobId/candidates/import/rankr-json', requireAuth, requireRole(['recruiter', 'admin']), upload.single('file'), async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return fail(res, 404, 'NOT_FOUND', 'Job not found');
    if (!req.file) return fail(res, 400, 'VALIDATION_ERROR', 'No file uploaded');

    let parsed: ParsedCandidate[] = [];
    try {
      parsed = await parseRankrJsonBuffer(req.file.buffer);
    } catch (e: any) {
      return fail(res, 400, 'PARSE_ERROR', `Invalid Rankr JSON: ${e.message}`);
    }

    if (!parsed.length) return fail(res, 400, 'EMPTY_FILE', 'No valid candidates found in file');

    const result = await persistParsedCandidates(job._id, req.user._id, parsed);
    return ok(res, result);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/jobs/:jobId/candidates/import/external-csv', requireAuth, requireRole(['recruiter', 'admin']), upload.single('file'), async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return fail(res, 404, 'NOT_FOUND', 'Job not found');
    if (!req.file) return fail(res, 400, 'VALIDATION_ERROR', 'No file uploaded');

    const mime = req.file.mimetype || '';
    const name = req.file.originalname?.toLowerCase() || '';
    const isExcel = mime.includes('spreadsheetml') || mime.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.xls');

    let parsed: ParsedCandidate[] = [];
    try {
      parsed = isExcel ? parseExcelBuffer(req.file.buffer) : parseCsvBuffer(req.file.buffer);
    } catch (e: any) {
      return fail(res, 400, 'PARSE_ERROR', `Could not parse file: ${e.message}`);
    }

    if (!parsed.length) {
      return fail(res, 400, 'EMPTY_FILE', 'No valid candidate rows found. Expected headers: Full Name, Title, Location, Years of Experience, Skills, Education, Summary');
    }

    const result = await persistParsedCandidates(job._id, req.user._id, parsed);
    return ok(res, result);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/jobs/:jobId/candidates/import/external-pdf', requireAuth, requireRole(['recruiter', 'admin']), upload.array('files', 20), async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return fail(res, 404, 'NOT_FOUND', 'Job not found');

    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length && (req as any).file) files.push((req as any).file);
    if (!files.length) return fail(res, 400, 'VALIDATION_ERROR', 'No files uploaded');

    const parsed: ParsedCandidate[] = [];
    const failed: string[] = [];

    for (const file of files) {
      const name = file.originalname?.toLowerCase() || '';
      const isDocx = name.endsWith('.docx') || file.mimetype?.includes('wordprocessingml');
      try {
        const candidate = isDocx
          ? await parseDocxBuffer(file.buffer, file.originalname)
          : await parsePdfBuffer(file.buffer, file.originalname);
        if (candidate) parsed.push(candidate);
        else failed.push(file.originalname);
      } catch (e) {
        failed.push(file.originalname);
      }
    }

    if (!parsed.length) return fail(res, 400, 'EMPTY_FILE', 'No candidates could be extracted from uploaded resumes');

    const result = await persistParsedCandidates(job._id, req.user._id, parsed);
    return ok(res, { ...result, failed });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/jobs/:jobId/candidates', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const pool = await JobCandidatePool.find({ jobId: req.params.jobId, status: { $ne: 'removed' } }).lean();
    return ok(res, { total: pool.length, rankr: pool.filter((p) => p.source === 'rankr').length, external: pool.filter((p) => p.source === 'external').length });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/jobs/:jobId/results', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const latestRun = await ScreeningRun.findOne({ jobId: req.params.jobId }).sort({ createdAt: -1 }).lean();
    if (!latestRun) return ok(res, [], { total: 0, page: 1, limit: 20, totalPages: 0 });

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const minScore = req.query.minScore ? Number(req.query.minScore) : 0;
    const maxScore = req.query.maxScore ? Number(req.query.maxScore) : 100;
    const recommendations = toArray(req.query.recommendation);
    const sources = toArray(req.query.source);

    const query: any = {
      screeningRunId: latestRun._id,
      score: { $gte: minScore, $lte: maxScore },
    };

    if (recommendations.length) {
      query.recommendation = { $in: recommendations };
    }

    if (sources.length) {
      query.source = { $in: sources };
    }

    const total = await ScreeningResult.countDocuments(query);

    const results = await ScreeningResult.find(query)
      .sort({ score: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('candidateProfileId')
      .lean();

    const shortlistIds = await Shortlist.find({ jobId: req.params.jobId }).distinct('candidateProfileId');
    const shortlistSet = new Set(shortlistIds.map((id) => id.toString()));

    const data = results.map((item: any) => {
      const profile = item.candidateProfileId as any;
      return {
        id: profile?._id,
        resultId: item._id,
        name: profile?.fullName || 'Unknown',
        role: profile?.professionalTitle || 'Candidate',
        score: item.score,
        recommendation: item.recommendation,
        source: item.source,
        skills: profile?.skills || [],
        location: profile?.location || '',
        appliedDate: profile?.createdAt,
        experienceYears: profile?.yearsExperience || 0,
        education: profile?.education || '',
        summary: profile?.summary || '',
        reasoning: item.reasoning,
        strengths: item.strengths || [],
        gaps: item.gaps || [],
        matched: item.matchedSkills || [],
        rank: item.rank || 0,
        shortlisted: shortlistSet.has(String(profile?._id)),
      };
    });

    return ok(res, data, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      runId: latestRun._id,
      runStatus: latestRun.status,
    });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/jobs/:jobId/shortlist', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const { candidateProfileId, note } = req.body;
    if (!candidateProfileId) return fail(res, 400, 'VALIDATION_ERROR', 'candidateProfileId is required');

    const existing = await Shortlist.findOne({ jobId: req.params.jobId, candidateProfileId });
    let notificationResult = null;

    if (!existing) {
      await Shortlist.create({
        jobId: req.params.jobId,
        candidateProfileId,
        addedBy: req.user._id,
        note: note || '',
      });

      // Sync with Application status
      const application = await Application.findOneAndUpdate(
        { jobId: req.params.jobId, candidateProfileId },
        { $set: { status: 'shortlisted', updatedAt: new Date() } },
        { new: true }
      );

      // In-app notification
      if (application?.candidateUserId) {
        await Notification.create({
          userId: application.candidateUserId,
          type: 'application_update',
          title: 'Application Shortlisted!',
          message: 'Congratulations! Your application has been shortlisted by the recruiter.',
          meta: { jobId: req.params.jobId, applicationId: application._id.toString() },
          isRead: false,
          createdAt: new Date(),
        });
      }

      // SMS + WhatsApp notification via Twilio
      const [profile, job] = await Promise.all([
        CandidateProfile.findById(candidateProfileId).lean(),
        Job.findById(req.params.jobId).lean(),
      ]);

      if (profile && job && (profile.phone || profile.whatsappNumber)) {
        const latestResult = await ScreeningResult.findOne({
          jobId: job._id,
          candidateProfileId: profile._id,
        }).sort({ createdAt: -1 }).lean();

        notificationResult = await notifyShortlisted({
          candidateName: profile.fullName,
          phone: profile.phone || '',
          whatsappNumber: profile.whatsappNumber || '',
          jobTitle: job.title,
          companyName: 'Rankr',
          skills: profile.skills || [],
          score: latestResult?.score ?? 0,
        });
      }
    }

    return ok(res, { shortlisted: true, notification: notificationResult });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.delete('/jobs/:jobId/shortlist/:candidateProfileId', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    await Shortlist.deleteOne({
      jobId: req.params.jobId,
      candidateProfileId: req.params.candidateProfileId,
    });

    // Sync with Application status (revert to applied)
    await Application.updateOne(
      { jobId: req.params.jobId, candidateProfileId: req.params.candidateProfileId },
      { $set: { status: 'applied', updatedAt: new Date() } }
    );

    return ok(res, { shortlisted: false });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/jobs/:jobId/analyze-applications', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return fail(res, 404, 'NOT_FOUND', 'Job not found');

    const applications = await Application.find({
      jobId: job._id,
      status: { $in: ['applied', 'in_review', 'shortlisted'] }
    }).populate('candidateProfileId');

    const run = await ScreeningRun.create({
      jobId: job._id,
      startedBy: req.user._id,
      status: 'running',
      totalCandidates: applications.length,
      processedCandidates: 0,
      progressPct: 0,
    });

    const candidates = applications
      .map((app) => app.candidateProfileId as any)
      .filter(Boolean);

    const evaluations = await batchScoreCandidates(job, candidates, {
      batchSize: 8,
      onProgress: async (done, total) => {
        run.processedCandidates = done;
        run.progressPct = Math.round((done / Math.max(1, total)) * 100);
        await run.save();
      },
    });

    const screeningResults: any[] = [];
    let processed = 0;

    for (const app of applications) {
      const candidate: any = app.candidateProfileId;
      if (!candidate) continue;
      const result = evaluations.get(String(candidate._id));
      if (!result) continue;

      app.matchScore = result.score;
      app.feedback = result.reasoning;
      app.status = 'in_review';
      app.updatedAt = new Date();
      await app.save();

      screeningResults.push({
        screeningRunId: run._id,
        jobId: job._id,
        candidateProfileId: candidate._id,
        score: result.score,
        recommendation: result.recommendation,
        matchedSkills: result.matchedSkills || [],
        strengths: result.strengths || [],
        gaps: result.gaps || [],
        reasoning: result.reasoning || '',
        rank: 0,
        source: candidate.source || 'external',
      });
      processed++;
    }

    if (screeningResults.length > 0) {
      screeningResults.sort((a, b) => b.score - a.score);
      screeningResults.forEach((r, i) => r.rank = i + 1);
      await ScreeningResult.insertMany(screeningResults);
    }

    run.status = 'completed';
    run.processedCandidates = processed;
    run.progressPct = 100;
    run.finishedAt = new Date();
    await run.save();

    return ok(res, { analyzed: processed, runId: run._id });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/applications/:id/shortlist', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return fail(res, 404, 'NOT_FOUND', 'Application not found');

    app.status = 'shortlisted';
    app.updatedAt = new Date();
    await app.save();

    const existing = await Shortlist.findOne({ jobId: app.jobId, candidateProfileId: app.candidateProfileId });
    if (!existing) {
      await Shortlist.create({
        jobId: app.jobId,
        candidateProfileId: app.candidateProfileId,
        addedBy: req.user._id,
        note: 'Shortlisted directly from applications portal',
      });
    }

    if (app.candidateUserId) {
      await Notification.create({
        userId: app.candidateUserId,
        type: 'application_update',
        title: 'Application Shortlisted!',
        message: 'Congratulations! Your application was shortlisted by the recruiter.',
        meta: { applicationId: app._id.toString() },
        isRead: false,
        createdAt: new Date(),
      });
    }

    // SMS + WhatsApp notification via Twilio
    let notificationResult = null;
    const [profile, job] = await Promise.all([
      CandidateProfile.findById(app.candidateProfileId).lean(),
      Job.findById(app.jobId).lean(),
    ]);

    if (profile && job && (profile.phone || profile.whatsappNumber)) {
      const latestResult = await ScreeningResult.findOne({
        jobId: job._id,
        candidateProfileId: profile._id,
      }).sort({ createdAt: -1 }).lean();

      notificationResult = await notifyShortlisted({
        candidateName: profile.fullName,
        phone: profile.phone || '',
        whatsappNumber: profile.whatsappNumber || '',
        jobTitle: job.title,
        companyName: 'Rankr',
        skills: profile.skills || [],
        score: latestResult?.score ?? app.matchScore ?? 0,
      });
    }

    return ok(res, { success: true, notification: notificationResult });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

export default router;
