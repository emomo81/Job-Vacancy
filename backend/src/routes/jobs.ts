import express, { Request, Response, Router } from 'express';

import Job from '../models/Job';
import User from '../models/User';
import { requireAuth, requireRole } from '../middleware/auth';
import { ok, fail } from '../utils/apiResponse';

const router: Router = express.Router();

router.post('/', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const {
      title,
      department,
      experienceLevel,
      employmentType,
      requiredSkills,
      minYearsExperience,
      education,
      description,
      niceToHave,
      location,
    } = req.body;

    if (!title || title.trim().length < 3) {
      return fail(res, 400, 'VALIDATION_ERROR', 'title must be at least 3 characters');
    }

    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return fail(res, 400, 'VALIDATION_ERROR', 'requiredSkills must have at least one skill');
    }

    const user = await User.findById(req.user._id);
    if (!user?.organizationId) {
      return fail(res, 400, 'VALIDATION_ERROR', 'Recruiter must belong to an organization');
    }

    const job = await Job.create({
      organizationId: user.organizationId,
      createdBy: user._id,
      title: title.trim(),
      department: department || '',
      experienceLevel: experienceLevel || 'Intermediate',
      employmentType: employmentType || 'Full-Time',
      requiredSkills,
      minYearsExperience: Number(minYearsExperience || 0),
      education: education || 'Any',
      description: description || '',
      niceToHave: niceToHave || '',
      location: location || '',
      status: 'open',
    });

    return ok(res, job);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.patch('/:jobId', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.organizationId) {
      return fail(res, 400, 'VALIDATION_ERROR', 'Recruiter must belong to an organization');
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.jobId, organizationId: user.organizationId },
      {
        $set: {
          title: req.body.title,
          department: req.body.department,
          experienceLevel: req.body.experienceLevel,
          employmentType: req.body.employmentType,
          requiredSkills: req.body.requiredSkills,
          minYearsExperience: Number(req.body.minYearsExperience || 0),
          education: req.body.education,
          description: req.body.description,
          niceToHave: req.body.niceToHave,
          location: req.body.location,
          status: req.body.status,
        },
      },
      { new: true }
    ).lean();

    if (!job) return fail(res, 404, 'NOT_FOUND', 'Job not found');

    return ok(res, job);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const query = req.user.role === 'recruiter'
      ? { organizationId: req.user.organizationId }
      : { status: 'open' };

    const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();
    return ok(res, jobs);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/:jobId', requireAuth, async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return fail(res, 404, 'NOT_FOUND', 'Job not found');
    return ok(res, job);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

export default router;
