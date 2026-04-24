import express, { Request, Response, Router } from 'express';
import Job from '../models/Job';
import CandidateProfile from '../models/CandidateProfile';
import Application from '../models/Application';
import Notification from '../models/Notification';
import User from '../models/User';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import config from '../config';
import { requireAuth, requireRole } from '../middleware/auth';
import { ok, fail } from '../utils/apiResponse';

const router: Router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

async function extractTextFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  if (!config.geminiApiKey) return '';
  const base64 = buffer.toString('base64');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: 'Extract all text from this CV/resume image. Return only the raw text, no formatting.' }
        ]}],
        generationConfig: { temperature: 0 }
      })
    }
  );
  if (!response.ok) return '';
  const body = await response.json();
  return body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function parseProfileFromCV(text: string): Promise<any> {
  if (!config.geminiApiKey || !text.trim()) return null;
  const prompt = `Extract structured profile data from this CV/resume text. Return ONLY a valid JSON object, no markdown, no commentary.
Schema:
{
  "fullName": string,
  "professionalTitle": string,
  "location": string,
  "yearsExperience": number,
  "summary": string,
  "skills": string[],
  "education": string,
  "email": string,
  "phone": string,
  "linkedinUrl": string,
  "githubUrl": string,
  "experiences": [{"role":string,"company":string,"startDate":string,"endDate":string,"description":string,"technologies":string[]}]
}
Rules:
- yearsExperience must be a number (infer from work history dates if not stated)
- skills must be a flat array of strings (no objects)
- education is a single summary string (degree, institution, year)
- summary is a 2-3 sentence professional summary
- Use empty string or 0 or [] for unknown fields, never null

CV Text:
${text.slice(0, 10000)}`;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
      })
    }
  );
  if (!response.ok) return null;
  const body = await response.json();
  const raw = body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return null;
  }
}

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
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');

    const allowed = ['fullName', 'professionalTitle', 'location', 'yearsExperience', 'summary', 'linkedinUrl', 'githubUrl', 'portfolioUrl', 'email', 'phone', 'whatsappNumber', 'skills', 'education', 'availabilityStatus', 'availabilityType', 'avatarUrl', 'visibility'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) (profile as any)[key] = req.body[key];
    }
    profile.completionPct = calculateCompletion(profile);
    await profile.save();
    return ok(res, profile);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/candidate/profile/experience', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const { role, company, startDate, endDate, description, technologies, isCurrent } = req.body;
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');

    (profile.experiences as any).push({ role, company, startDate, endDate, description, technologies: technologies || [], isCurrent: isCurrent || false });
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
    if (Array.isArray(req.body.technologies)) exp.technologies = req.body.technologies;
    if (req.body.isCurrent !== undefined) exp.isCurrent = req.body.isCurrent;
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
    const mime = req.file.mimetype;

    if (mime === 'application/pdf') {
      try {
        const data = await (pdfParse as any)(req.file.buffer);
        extractedText = data.text;
      } catch (e) {
        console.error('PDF parsing error', e);
      }
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword'
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = result.value;
      } catch (e) {
        console.error('DOCX parsing error', e);
      }
    } else if (mime.startsWith('image/')) {
      try {
        extractedText = await extractTextFromImage(req.file.buffer, mime);
      } catch (e) {
        console.error('Image OCR error', e);
      }
    }

    profile.cv = {
      fileName: req.file.originalname,
      storageUrl: 'local',
      uploadedAt: new Date(),
      extractedText: extractedText.trim()
    };

    const parsed = await parseProfileFromCV(extractedText);
    if (parsed) {
      if (parsed.fullName) profile.fullName = parsed.fullName;
      if (parsed.professionalTitle) profile.professionalTitle = parsed.professionalTitle;
      if (parsed.location) profile.location = parsed.location;
      if (typeof parsed.yearsExperience === 'number') profile.yearsExperience = parsed.yearsExperience;
      if (Array.isArray(parsed.skills) && parsed.skills.length) profile.skills = parsed.skills;
      if (parsed.education) profile.education = parsed.education;
      if (parsed.summary) profile.summary = parsed.summary;
      if (parsed.email) profile.email = parsed.email;
      if (parsed.phone) profile.phone = parsed.phone;
      if (parsed.linkedinUrl) profile.linkedinUrl = parsed.linkedinUrl;
      if (parsed.githubUrl) profile.githubUrl = parsed.githubUrl;
      if (Array.isArray(parsed.experiences) && parsed.experiences.length) {
        profile.experiences = parsed.experiences.map((exp: any) => ({
          role: exp.role || '',
          company: exp.company || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          description: exp.description || '',
          technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
          isCurrent: exp.isCurrent || false,
        }));
      }
    }

    profile.completionPct = calculateCompletion(profile);
    await profile.save();

    return ok(res, { cv: profile.cv, parsed });
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
      deadline: job.deadline ?? null,
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

// ── LANGUAGES ────────────────────────────────────────────────────────────────

router.post('/candidate/profile/language', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const { name, proficiency } = req.body;
    if (!name) return fail(res, 400, 'VALIDATION_ERROR', 'Language name is required');
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');
    (profile.languages as any).push({ name, proficiency: proficiency || 'Fluent' });
    await profile.save();
    return ok(res, (profile.languages as any)[(profile.languages as any).length - 1]);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.patch('/candidate/profile/language/:languageId', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');
    const lang = (profile.languages as any).id(req.params.languageId);
    if (!lang) return fail(res, 404, 'NOT_FOUND', 'Language not found');
    if (req.body.name) lang.name = req.body.name;
    if (req.body.proficiency) lang.proficiency = req.body.proficiency;
    await profile.save();
    return ok(res, lang);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.delete('/candidate/profile/language/:languageId', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');
    const lang = (profile.languages as any).id(req.params.languageId);
    if (!lang) return fail(res, 404, 'NOT_FOUND', 'Language not found');
    lang.deleteOne();
    await profile.save();
    return ok(res, { deleted: true });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

// ── CERTIFICATIONS ────────────────────────────────────────────────────────────

router.post('/candidate/profile/certification', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const { name, issuer, issueDate, imageUrl } = req.body;
    if (!name) return fail(res, 400, 'VALIDATION_ERROR', 'Certification name is required');
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');
    (profile.certifications as any).push({ name, issuer: issuer || '', issueDate: issueDate || '', imageUrl: imageUrl || '' });
    await profile.save();
    return ok(res, (profile.certifications as any)[(profile.certifications as any).length - 1]);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.patch('/candidate/profile/certification/:certificationId', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');
    const cert = (profile.certifications as any).id(req.params.certificationId);
    if (!cert) return fail(res, 404, 'NOT_FOUND', 'Certification not found');
    if (req.body.name) cert.name = req.body.name;
    if (req.body.issuer !== undefined) cert.issuer = req.body.issuer;
    if (req.body.issueDate !== undefined) cert.issueDate = req.body.issueDate;
    if (req.body.imageUrl !== undefined) cert.imageUrl = req.body.imageUrl;
    await profile.save();
    return ok(res, cert);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.delete('/candidate/profile/certification/:certificationId', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');
    const cert = (profile.certifications as any).id(req.params.certificationId);
    if (!cert) return fail(res, 404, 'NOT_FOUND', 'Certification not found');
    cert.deleteOne();
    await profile.save();
    return ok(res, { deleted: true });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

// ── PROJECTS ─────────────────────────────────────────────────────────────────

router.post('/candidate/profile/project', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const { name, description, technologies, role, link, startDate, endDate } = req.body;
    if (!name) return fail(res, 400, 'VALIDATION_ERROR', 'Project name is required');
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');
    (profile.projects as any).push({ name, description: description || '', technologies: technologies || [], role: role || '', link: link || '', startDate: startDate || '', endDate: endDate || '' });
    await profile.save();
    return ok(res, (profile.projects as any)[(profile.projects as any).length - 1]);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.patch('/candidate/profile/project/:projectId', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');
    const proj = (profile.projects as any).id(req.params.projectId);
    if (!proj) return fail(res, 404, 'NOT_FOUND', 'Project not found');
    if (req.body.name) proj.name = req.body.name;
    if (req.body.description !== undefined) proj.description = req.body.description;
    if (Array.isArray(req.body.technologies)) proj.technologies = req.body.technologies;
    if (req.body.role !== undefined) proj.role = req.body.role;
    if (req.body.link !== undefined) proj.link = req.body.link;
    if (req.body.startDate !== undefined) proj.startDate = req.body.startDate;
    if (req.body.endDate !== undefined) proj.endDate = req.body.endDate;
    await profile.save();
    return ok(res, proj);
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.delete('/candidate/profile/project/:projectId', requireAuth, requireRole(['candidate', 'admin']), async (req: Request, res: Response) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return fail(res, 404, 'NOT_FOUND', 'Profile not found');
    const proj = (profile.projects as any).id(req.params.projectId);
    if (!proj) return fail(res, 404, 'NOT_FOUND', 'Project not found');
    proj.deleteOne();
    await profile.save();
    return ok(res, { deleted: true });
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
