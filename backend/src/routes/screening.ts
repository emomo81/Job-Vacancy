import express, { Request, Response, Router } from 'express';

import Job from '../models/Job';
import JobCandidatePool from '../models/JobCandidatePool';
import CandidateProfile from '../models/CandidateProfile';
import ScreeningRun from '../models/ScreeningRun';
import ScreeningResult from '../models/ScreeningResult';
import Notification from '../models/Notification';
import { batchScoreCandidates } from '../services/geminiService';
import { requireAuth, requireRole } from '../middleware/auth';
import { ok, fail } from '../utils/apiResponse';

const router: Router = express.Router();

async function runScreeningAsync(runId: any, userId: any): Promise<void> {
  const run = await ScreeningRun.findById(runId);
  if (!run) return;

  try {
  const job = await Job.findById(run.jobId).lean();
  if (!job) {
    run.status = 'failed';
    run.errorMessage = 'Job not found';
    run.finishedAt = new Date();
    await run.save();
    return;
  }

  const pool = await JobCandidatePool.find({ jobId: job._id, status: { $ne: 'removed' } }).lean();
  const candidateIds = pool.map((p) => p.candidateProfileId);
  const candidates = await CandidateProfile.find({ _id: { $in: candidateIds } }).lean();

  run.status = 'running';
  run.totalCandidates = candidates.length;
  run.processedCandidates = 0;
  run.progressPct = 0;
  await run.save();

  await ScreeningResult.deleteMany({ screeningRunId: run._id });

  const evaluations = await batchScoreCandidates(job, candidates, {
    batchSize: 8,
    onProgress: async (done, total) => {
      run.processedCandidates = done;
      run.progressPct = Math.round((done / Math.max(1, total)) * 100);
      await run.save();
    },
  });

  const resultDocs = candidates.map((candidate) => {
    const result = evaluations.get(String(candidate._id));
    if (!result) return null;
    return {
      screeningRunId: run._id,
      jobId: job._id,
      candidateProfileId: candidate._id,
      score: result.score,
      recommendation: result.recommendation,
      matchedSkills: result.matchedSkills,
      strengths: result.strengths,
      gaps: result.gaps,
      reasoning: result.reasoning,
      rank: 0,
      source: candidate.source || 'external',
    };
  }).filter(Boolean);

  if (resultDocs.length) {
    await ScreeningResult.insertMany(resultDocs);
  }

  await JobCandidatePool.updateMany(
    { jobId: job._id, candidateProfileId: { $in: candidates.map((c) => c._id) } },
    { $set: { status: 'screened' } }
  );

  const ranked = await ScreeningResult.find({ screeningRunId: run._id }).sort({ score: -1 }).lean();
  for (let i = 0; i < ranked.length; i += 1) {
    await ScreeningResult.updateOne({ _id: ranked[i]._id }, { $set: { rank: i + 1 } });
  }

  run.status = 'completed';
  run.finishedAt = new Date();
  run.progressPct = 100;
  await run.save();

  await Notification.create({
    userId,
    type: 'screening_complete',
    title: 'Screening complete',
    message: `${job.title} screening completed with ${ranked.length} evaluated candidates.`,
    meta: { jobId: job._id.toString(), runId: run._id.toString() },
  });
  } catch (err: any) {
    console.error('[Screening] runScreeningAsync error:', err?.message);
    try {
      const run2 = await ScreeningRun.findById(runId);
      if (run2 && run2.status !== 'completed') {
        run2.status = 'failed';
        run2.errorMessage = err?.message || 'Unknown error';
        run2.finishedAt = new Date();
        await run2.save();
      }
    } catch { /* ignore secondary failure */ }
  }
}

router.post('/jobs/:jobId/screening-runs', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return fail(res, 404, 'NOT_FOUND', 'Job not found');
    if (req.user.role !== 'admin' && String((job as any).organizationId) !== String(req.user.organizationId)) {
      return fail(res, 403, 'FORBIDDEN', 'Access denied');
    }

    const run = await ScreeningRun.create({
      jobId: job._id,
      startedBy: req.user._id,
      status: 'queued',
      totalCandidates: 0,
      processedCandidates: 0,
      progressPct: 0,
    });

    void runScreeningAsync(run._id, req.user._id);

    return ok(res, run);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/jobs/:jobId/screening-runs/latest', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const run = await ScreeningRun.findOne({ jobId: req.params.jobId }).sort({ createdAt: -1 }).lean();
    if (!run) return fail(res, 404, 'NOT_FOUND', 'No screening run found');
    return ok(res, run);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/screening-runs/:runId', requireAuth, requireRole(['recruiter', 'admin']), async (req: Request, res: Response) => {
  try {
    const run = await ScreeningRun.findById(req.params.runId).lean();
    if (!run) return fail(res, 404, 'NOT_FOUND', 'Screening run not found');
    return ok(res, run);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

export default router;
