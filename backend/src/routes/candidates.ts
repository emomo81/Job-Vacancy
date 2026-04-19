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
import { scoreCandidate } from '../services/geminiService';
import { requireAuth, requireRole } from '../middleware/auth'
import { ok, fail } from '../utils/apiResponse'

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function toArray(input: any): any[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return String(input).split(',').map((v) => v.trim()).filter(Boolean);
}

function pseudoCandidates(source: string, count: number): any[] {
  const candidates = [];
  for (let i = 0; i < count; i += 1) {
    const idx = Math.floor(Math.random() * 10000);
    candidates.push({
      source,
      fullName: `Candidate ${idx}`,
      professionalTitle: source === 'rankr' ? 'Rankr Talent' : 'External Applicant',
      location: 'Remote',
      yearsExperience: Math.floor(Math.random() * 10) + 1,
      skills: ['JavaScript', 'TypeScript', 'Node.js', 'React'].sort(() => 0.5 - Math.random()).slice(0, 3),
      education: 'Bachelor\'s',
      summary: 'Imported candidate profile',
      completionPct: 60,
    });
  }
  return candidates;
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

async function importCandidates({ jobId, userId, source, count }: { jobId: any; userId: any; source: string; count: number }): Promise<number> {
  const profiles = await CandidateProfile.insertMany(pseudoCandidates(source, count));
  const poolDocs = profiles.map((profile) => ({
    jobId,
    candidateProfileId: profile._id,
    source,
    addedBy: userId,
    status: 'pending_screening',
  }));
  await JobCandidatePool.insertMany(poolDocs);
  return profiles.length;
}

router.post('/jobs/:jobId/candidates/import/rankr-json', requireAuth, requireRole(['recruiter', 'admin']), upload.single('file'), async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return fail(res, 404, 'NOT_FOUND', 'Job not found');

    const imported = await importCandidates({
      jobId: job._id,
      userId: req.user._id,
      source: 'rankr',
      count: 6,
    });

    return ok(res, { imported });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/jobs/:jobId/candidates/import/external-csv', requireAuth, requireRole(['recruiter', 'admin']), upload.single('file'), async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return fail(res, 404, 'NOT_FOUND', 'Job not found');

    const imported = await importCandidates({
      jobId: job._id,
      userId: req.user._id,
      source: 'external',
      count: 4,
    });

    return ok(res, { imported });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/jobs/:jobId/candidates/import/external-pdf', requireAuth, requireRole(['recruiter', 'admin']), upload.single('file'), async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return fail(res, 404, 'NOT_FOUND', 'Job not found');

    const imported = await importCandidates({
      jobId: job._id,
      userId: req.user._id,
      source: 'external',
      count: 4,
    });

    return ok(res, { imported });
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

      // Notify candidate if possible
      if (application?.candidateUserId) {
        await Notification.create({
          userId: application.candidateUserId,
          type: 'application_update',
          title: 'Application Shortlisted!',
          message: 'Congratulations! Your application has been shortlisted by the recruiter.',
          meta: { jobId: req.params.jobId, applicationId: application._id.toString() },
          isRead: false,
          createdAt: new Date()
        });
      }
    }

    return ok(res, { shortlisted: true });
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

    let processed = 0;
    const screeningResults: any[] = [];

    const evalPromises = applications.map(async (app) => {
      try {
        const candidate: any = app.candidateProfileId;
        if (!candidate) return null;

        const result = await scoreCandidate(job, candidate);

        app.matchScore = result.score;
        app.feedback = result.reasoning;
        app.status = 'in_review';
        app.updatedAt = new Date();
        await app.save();

        return {
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
        };
      } catch (e) {
        console.error(`Error processing candidate in application ${app._id}:`, e);
        return null;
      }
    });

    const evaluatedResults = await Promise.all(evalPromises);
    for (const res of evaluatedResults) {
      if (res) {
        screeningResults.push(res);
        processed++;
      }
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
        createdAt: new Date()
      });
    }

    return ok(res, { success: true });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

export default router;
