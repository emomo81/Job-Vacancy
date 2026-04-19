import express, { Request, Response, Router } from 'express';
import Job from '../models/Job';
import CandidateProfile from '../models/CandidateProfile';
import Application from '../models/Application';
import Notification from '../models/Notification';
import User from '../models/User';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { requireAuth, requireRole } from '../middleware/auth';
import { ok, fail } from '../utils/apiResponse';

const router: Router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
function computeMatch(job: any, profile: any): number {
  const requiredSkills = (job.requiredSkills || []).map((s: string) => s.toLowerCase());
  const candidateSkills = (profile.skills || []).map((s: string) => s.toLowerCase());
  const matched = requiredSkills.filter((skill: string) => candidateSkills.includes(skill));
  const skillRatio = requiredSkills.length ? matched.length / requiredSkills.length : 0.5;
  const expRatio = Math.min(1, (profile.yearsExperience || 0) / Math.max(1, job.minYearsExperience || 1));
  const score = Math.round(skillRatio * 75 + expRatio * 25);
  return Math.max(0, Math.min(100, score));
}

export function calculateCompletion(profile: any): number {
  let score = 0;
  if (profile.fullName && profile.location && profile.professionalTitle) score += 20;
  if (profile.skills && profile.skills.length >= 2) score += 20;
  if (profile.experiences && profile.experiences.length >= 1) score += 20;
  if (profile.education && profile.education.trim()) score += 20;
  if (profile.cv && profile.cv.storageUrl && profile.cv.storageUrl !== '') score += 20;
  return score;
}

router.get('/candidate/profile', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    let profile: any = await CandidateProfile.findOne({ userId: req.user._id }).lean();
    if (!profile) {
      const created = await CandidateProfile.create({
        userId: req.user._id,
        source: 'rankr',
        fullName: req.user.fullName,
        professionalTitle: 'Candidate',
      });
      profile = created.toObject();
    }
    return ok(res, profile);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.patch('/candidate/profile', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const update = req.body;
    let profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');

    Object.assign(profile, update);
    profile.completionPct = calculateCompletion(profile);
    await profile.save();
    return ok(res, profile);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/candidate/profile/experience', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const { role, company, startDate, endDate, description } = req.body;
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');

    (profile.experiences as any).push({ role, company, startDate, endDate, description });
    profile.completionPct = calculateCompletion(profile);
    await profile.save();
    return ok(res, (profile.experiences as any)[(profile.experiences as any).length - 1]);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.patch('/candidate/profile/experience/:experienceId', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');

    const exp = (profile.experiences as any).id(req.params.experienceId);
    if (!exp) return fail(res, 404, 'NOT_FOUND', 'Experience not found');

    exp.role = req.body.role ?? exp.role;
    exp.company = req.body.company ?? exp.company;
    exp.startDate = req.body.startDate ?? exp.startDate;
    exp.endDate = req.body.endDate ?? exp.endDate;
    exp.description = req.body.description ?? exp.description;
    await profile.save();

    return ok(res, exp);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.delete('/candidate/profile/experience/:experienceId', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');

    const exp = (profile.experiences as any).id(req.params.experienceId);
    if (!exp) return fail(res, 404, 'NOT_FOUND', 'Experience not found');

    exp.deleteOne();
    profile.completionPct = calculateCompletion(profile);
    await profile.save();

    return ok(res, { deleted: true });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/candidate/profile/cv', requireAuth, requireRole(['candidate', 'admin']), upload.single('cv'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return fail(res, 400, 'NO_FILE', 'No file uploaded');
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');

    let extractedText = '';
    if (req.file.mimetype === 'application/pdf') {
      try {
        const data = await (pdfParse as any)(req.file.buffer);
        extractedText = data.text;
      } catch (e) {
        console.error('PDF parsing error', e);
      }
    } else {
      extractedText = req.file.buffer.toString('utf-8');
    }

    profile.cv = {
      fileName: req.file.originalname,
      storageUrl: 'local',
      uploadedAt: new Date(),
      extractedText: extractedText.trim()
    };
    profile.completionPct = calculateCompletion(profile);
    await profile.save();

    return ok(res, profile.cv);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/candidate/jobs', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id }).lean();
    const jobs = await Job.find({ status: 'open' }).sort({ createdAt: -1 }).lean();

    const mapped = jobs.map((job) => ({
      id: job._id,
      title: job.title,
      company: 'Recruiter Organization',
      department: job.department,
      experienceLevel: job.experienceLevel,
      education: job.education,
      location: job.location || 'Remote',
      type: job.employmentType,
      salary: 'Competitive',
      posted: job.createdAt,
      match: profile ? computeMatch(job, profile) : 50,
      tags: (job.requiredSkills || []).slice(0, 4),
      requiredSkills: job.requiredSkills || [],
      minYearsExperience: job.minYearsExperience || 0,
      description: job.description || '',
      niceToHave: job.niceToHave || '',
    }));

    return ok(res, mapped);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/candidate/jobs/smart-matches', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id }).lean();
    const jobs = await Job.find({ status: 'open' }).sort({ createdAt: -1 }).lean();

    const mapped = jobs
      .map((job) => ({
        id: job._id,
        title: job.title,
        company: 'Recruiter Organization',
        location: job.location || 'Remote',
        type: job.employmentType,
        salary: 'Competitive',
        posted: job.createdAt,
        match: profile ? computeMatch(job, profile) : 50,
        tags: (job.requiredSkills || []).slice(0, 4),
      }))
      .filter((job) => job.match >= 85)
      .sort((a, b) => b.match - a.match);

    return ok(res, mapped);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/candidate/jobs/:jobId/apply', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id }).lean();
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Candidate profile not found');

    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return fail(res, 404, 'NOT_FOUND', 'Job not found');

    const score = computeMatch(job, profile);

    const existing = await Application.findOne({ jobId: job._id, candidateProfileId: profile._id });
    if (!existing) {
      await Application.create({
        jobId: job._id,
        candidateProfileId: profile._id,
        candidateUserId: req.user._id,
        status: 'applied',
        matchScore: score,
      });

      const recruiters = await User.find({
        organizationId: job.organizationId,
        role: { $in: ['recruiter', 'admin'] },
      }).lean();

      await Notification.create([
        ...recruiters.map((recruiter) => ({
          userId: recruiter._id,
          type: 'application_update',
          title: 'New application received',
          message: `${req.user.fullName} applied to ${job.title}.`,
          meta: { jobId: job._id.toString(), candidateProfileId: profile._id.toString() },
        })),
        {
          userId: req.user._id,
          type: 'application_update',
          title: 'Application submitted',
          message: `Your application for ${job.title} was submitted successfully.`,
          meta: { jobId: job._id.toString(), candidateProfileId: profile._id.toString() },
        },
      ]);
    }

    return ok(res, { applied: true, matchScore: score });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/candidate/applications', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id }).lean();
    if (!profile) return ok(res, []);

    const applications = await Application.find({ candidateProfileId: profile._id }).sort({ appliedAt: -1 }).populate('jobId').lean();

    const data = applications.map((app: any) => ({
      id: app._id,
      jobId: app.jobId?._id,
      jobTitle: app.jobId?.title || 'Unknown Role',
      role: app.jobId?.title || 'Unknown Role',
      company: 'Recruiter Organization',
      date: app.appliedAt,
      status: app.status,
      match: app.matchScore,
      feedback: app.feedback,
      location: app.jobId?.location || 'Remote',
      description: app.jobId?.description || '',
      skills: app.jobId?.requiredSkills || [],
      department: app.jobId?.department || '',
      experienceLevel: app.jobId?.experienceLevel || 'Intermediate',
      employmentType: app.jobId?.employmentType || 'Full-Time',
      education: app.jobId?.education || 'Any',
      minYearsExperience: app.jobId?.minYearsExperience || 0,
      niceToHave: app.jobId?.niceToHave || '', 
      salary: 'Competitive',
    }));

    return ok(res, data);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.delete('/candidate/applications/:id', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id }).lean();
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Candidate profile not found');

    const app = await Application.findOneAndDelete({ 
      _id: req.params.id, 
      candidateProfileId: profile._id 
    });

    if (!app) return fail(res, 404, 'NOT_FOUND', 'Application not found or unauthorized');

    return ok(res, { success: true, message: 'Application withdrawn successfully' });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/notifications', requireAuth, async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30).lean();
    return ok(res, notifications);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.delete('/notifications', requireAuth, async (req: Request, res: Response) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    return ok(res, { success: true, message: 'All notifications cleared' });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.delete('/notifications/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const deleted = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return fail(res, 404, 'NOT_FOUND', 'Notification not found');
    return ok(res, { success: true, message: 'Notification deleted' });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

export default router;
