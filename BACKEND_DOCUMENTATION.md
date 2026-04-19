# Rankr Backend Documentation (MongoDB + Gemini API)

## 1. Objective

This document defines the complete backend required to make the current frontend fully functional.

Primary goals:

1. Replace all mock and local state flows with persistent APIs.
2. Use MongoDB as the primary database.
3. Use Gemini API for AI-assisted candidate screening and ranking.
4. Keep the architecture compatible with Next.js App Router (`app/api/*`) or an external Node.js service.

## 2. Current Frontend Coverage and Required Backend Support

The frontend currently contains two portals:

1. Recruiter portal
2. Candidate portal

### 2.1 Recruiter Portal Screens

1. Auth page (`/auth`) with sign in and account creation.
2. Job creation page (`/dashboard`) with role requirements.
3. Candidate upload page (`/candidates`) for JSON/CSV/PDF sources.
4. Screening page (`/screening`) showing job + progress.
5. Results page (`/results`) with filtering, shortlist, reasoning details, export.
6. Settings page (`/settings`) for account info and preferences.

### 2.2 Candidate Portal Screens

1. Browse jobs (`/candidate/jobs`) with search/filter and smart matches.
2. Applications (`/candidate/applications`) with status and updates.
3. Profile (`/candidate/profile`) with skills, work history, CV, preferences.

### 2.3 Existing API Surface

Only one route currently exists:

1. `GET /api/candidates/shortlisted` (mock data)

All other behavior is currently local-only and must be backed by real APIs.

## 3. Proposed Backend Architecture

## 3.1 Technology

1. Runtime: Node.js (inside Next.js route handlers or separate Express/Fastify API).
2. Database: MongoDB Atlas.
3. ODM: Mongoose (or official MongoDB driver if preferred).
4. Auth: JWT with refresh token rotation (or NextAuth if desired).
5. File storage: Cloudinary / AWS S3 / Azure Blob (choose one) for CV and source file uploads.
6. Queue/background processing: BullMQ + Redis (recommended) for screening jobs.
7. AI: Gemini API for profile extraction (PDF/CSV parsing enhancement), scoring, and reasoning.

## 3.2 Service Boundaries

1. Auth Service: users, sessions, roles.
2. Recruiter Service: jobs, candidate sources, screening runs, shortlists.
3. Candidate Service: candidate profiles, applications, preferences.
4. AI Screening Service: feature extraction, scoring, ranking, rationale generation.
5. Notification Service: in-app notifications and email hooks.

## 4. Core Domain Model

## 4.1 Roles

1. `recruiter`
2. `candidate`
3. `admin` (optional)

## 4.2 MongoDB Collections

1. `users`
2. `organizations`
3. `jobs`
4. `candidate_profiles`
5. `candidate_experiences`
6. `candidate_documents`
7. `job_candidate_pool`
8. `screening_runs`
9. `screening_results`
10. `shortlists`
11. `applications`
12. `notifications`
13. `audit_logs`

## 4.3 Schema Definitions (Implementation Shape)

### users

```json
{
  "_id": "ObjectId",
  "email": "string",
  "passwordHash": "string",
  "role": "recruiter|candidate|admin",
  "fullName": "string",
  "organizationId": "ObjectId|null",
  "avatarUrl": "string|null",
  "isEmailVerified": true,
  "status": "active|suspended",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Indexes:

1. unique `email`
2. `role`

### organizations

```json
{
  "_id": "ObjectId",
  "name": "string",
  "slug": "string",
  "ownerUserId": "ObjectId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Indexes:

1. unique `slug`
2. `ownerUserId`

### jobs

```json
{
  "_id": "ObjectId",
  "organizationId": "ObjectId",
  "createdBy": "ObjectId",
  "title": "string",
  "department": "string",
  "experienceLevel": "Entry Level|Intermediate|Expert",
  "employmentType": "Full-Time|Part-Time|Contract|Remote",
  "requiredSkills": ["string"],
  "minYearsExperience": 3,
  "education": "High School|Bachelor's|Master's|PhD|Any",
  "description": "string",
  "niceToHave": "string",
  "location": "string|null",
  "status": "draft|open|closed|archived",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Indexes:

1. `organizationId, status, createdAt`
2. text index on `title, description, requiredSkills`

### candidate_profiles

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId|null",
  "source": "rankr|external",
  "fullName": "string",
  "professionalTitle": "string",
  "location": "string",
  "yearsExperience": 7,
  "skills": ["string"],
  "education": "string",
  "summary": "string",
  "linkedinUrl": "string|null",
  "visibility": {
    "openToWork": true,
    "visibleToRecruiters": true,
    "remote": true,
    "fulltime": true
  },
  "completionPct": 75,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Indexes:

1. `userId`
2. `source`
3. text index on `fullName, professionalTitle, skills, summary`

### candidate_experiences

```json
{
  "_id": "ObjectId",
  "candidateProfileId": "ObjectId",
  "role": "string",
  "company": "string",
  "startDate": "string",
  "endDate": "string",
  "description": "string",
  "sortOrder": 1,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Indexes:

1. `candidateProfileId, sortOrder`

### candidate_documents

```json
{
  "_id": "ObjectId",
  "candidateProfileId": "ObjectId|null",
  "uploadedBy": "ObjectId",
  "documentType": "cv|portfolio|other",
  "mimeType": "application/pdf",
  "fileName": "string",
  "fileSize": 123456,
  "storageUrl": "string",
  "parseStatus": "pending|processing|completed|failed",
  "parsedData": {
    "skills": ["string"],
    "experienceYears": 5,
    "education": "string",
    "summary": "string"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Indexes:

1. `candidateProfileId`
2. `uploadedBy, createdAt`

### job_candidate_pool

This maps candidates imported for a specific job.

```json
{
  "_id": "ObjectId",
  "jobId": "ObjectId",
  "candidateProfileId": "ObjectId",
  "source": "rankr|external",
  "addedBy": "ObjectId",
  "status": "pending_screening|screened|removed",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Indexes:

1. unique `jobId, candidateProfileId`
2. `jobId, status`

### screening_runs

```json
{
  "_id": "ObjectId",
  "jobId": "ObjectId",
  "startedBy": "ObjectId",
  "status": "queued|running|completed|failed|cancelled",
  "totalCandidates": 34,
  "processedCandidates": 12,
  "progressPct": 35,
  "model": "gemini-2.0-flash",
  "startedAt": "Date",
  "finishedAt": "Date|null",
  "errorMessage": "string|null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Indexes:

1. `jobId, createdAt`
2. `status, createdAt`

### screening_results

```json
{
  "_id": "ObjectId",
  "screeningRunId": "ObjectId",
  "jobId": "ObjectId",
  "candidateProfileId": "ObjectId",
  "score": 88,
  "recommendation": "hire|consider|pass",
  "matchedSkills": ["string"],
  "strengths": ["string"],
  "gaps": ["string"],
  "reasoning": "string",
  "rank": 2,
  "source": "rankr|external",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Indexes:

1. unique `screeningRunId, candidateProfileId`
2. `jobId, score`
3. `jobId, recommendation`

### shortlists

```json
{
  "_id": "ObjectId",
  "jobId": "ObjectId",
  "candidateProfileId": "ObjectId",
  "addedBy": "ObjectId",
  "note": "string|null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Indexes:

1. unique `jobId, candidateProfileId`

### applications

```json
{
  "_id": "ObjectId",
  "jobId": "ObjectId",
  "candidateProfileId": "ObjectId",
  "candidateUserId": "ObjectId|null",
  "status": "applied|in_review|shortlisted|rejected|hired",
  "matchScore": 88,
  "feedback": "string",
  "appliedAt": "Date",
  "updatedAt": "Date"
}
```

Indexes:

1. unique `jobId, candidateProfileId`
2. `candidateUserId, appliedAt`
3. `jobId, status`

### notifications

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "type": "application_update|screening_complete|system",
  "title": "string",
  "message": "string",
  "isRead": false,
  "meta": {},
  "createdAt": "Date"
}
```

Indexes:

1. `userId, isRead, createdAt`

## 5. API Contract

Base path:

1. `/api/v1`

Response envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "error": null
}
```

Error envelope:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable error message",
    "details": []
  }
}
```

## 5.1 Auth Endpoints

1. `POST /auth/register`
2. `POST /auth/login`
3. `POST /auth/logout`
4. `POST /auth/refresh`
5. `GET /auth/me`

Register request:

```json
{
  "role": "recruiter|candidate",
  "fullName": "string",
  "email": "string",
  "password": "string",
  "companyName": "string"
}
```

## 5.2 Recruiter Job Endpoints

1. `POST /jobs` create job (from `/dashboard`).
2. `GET /jobs` list jobs (for recruiter).
3. `GET /jobs/:jobId` job detail.
4. `PATCH /jobs/:jobId` update job.
5. `DELETE /jobs/:jobId` archive/delete job.

Create job request:

```json
{
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "experienceLevel": "Expert",
  "employmentType": "Full-Time",
  "requiredSkills": ["Node.js", "TypeScript", "MongoDB"],
  "minYearsExperience": 5,
  "education": "Bachelor's",
  "description": "...",
  "niceToHave": "...",
  "location": "Remote"
}
```

## 5.3 Candidate Source Import Endpoints

1. `POST /jobs/:jobId/candidates/import/rankr-json`
2. `POST /jobs/:jobId/candidates/import/external-csv`
3. `POST /jobs/:jobId/candidates/import/external-pdf`
4. `GET /jobs/:jobId/candidates` list candidate pool with filters.
5. `DELETE /jobs/:jobId/candidates/:candidateProfileId` remove from pool.

File upload approach:

1. Use `multipart/form-data`.
2. Return async import task id if parsing is long.

## 5.4 Screening Endpoints

1. `POST /jobs/:jobId/screening-runs` start screening.
2. `GET /jobs/:jobId/screening-runs/latest` get latest run status.
3. `GET /screening-runs/:runId` status detail.
4. `POST /screening-runs/:runId/cancel` cancel run.
5. `GET /jobs/:jobId/results` ranked results (filters + pagination).

Results query parameters:

1. `search`
2. `minScore`
3. `maxScore`
4. `recommendation=hire,consider`
5. `source=rankr,external`
6. `expLevel=Junior,Intermediate,Expert`
7. `sortBy=score|rank|appliedDate|name`
8. `order=asc|desc`
9. `page`
10. `limit`

## 5.5 Shortlist Endpoints

1. `POST /jobs/:jobId/shortlist` add candidate.
2. `DELETE /jobs/:jobId/shortlist/:candidateProfileId` remove candidate.
3. `GET /jobs/:jobId/shortlist` list shortlisted candidates.

## 5.6 Export Endpoints

1. `GET /jobs/:jobId/results/export?format=csv`
2. `GET /jobs/:jobId/results/export?format=json`

## 5.7 Candidate Profile Endpoints

1. `GET /candidate/profile`
2. `PATCH /candidate/profile`
3. `POST /candidate/profile/experience`
4. `PATCH /candidate/profile/experience/:experienceId`
5. `DELETE /candidate/profile/experience/:experienceId`
6. `POST /candidate/profile/cv` upload CV.
7. `DELETE /candidate/profile/cv/:documentId`

## 5.8 Candidate Jobs and Applications Endpoints

1. `GET /candidate/jobs` browse jobs.
2. `GET /candidate/jobs/smart-matches` jobs with match score.
3. `POST /candidate/jobs/:jobId/apply` apply to job.
4. `GET /candidate/applications` list candidate applications.
5. `GET /candidate/applications/:applicationId` details.

## 5.9 Settings and Notifications Endpoints

1. `GET /settings/account`
2. `PATCH /settings/account`
3. `GET /notifications`
4. `PATCH /notifications/:notificationId/read`
5. `POST /notifications/read-all`

## 6. Gemini API Integration Specification

## 6.1 Purpose

Gemini is used for:

1. Candidate resume/profile semantic extraction.
2. Job-candidate fit scoring assistance.
3. Human-readable reasoning, strengths, and gaps.

## 6.2 Model Choice

Recommended initial model:

1. `gemini-2.0-flash` for fast screening throughput.

Optional:

1. `gemini-2.5-pro` for deeper reasoning when recruiter requests detailed analysis.

## 6.3 Prompt Strategy

System prompt goals:

1. Strictly evaluate only against job criteria.
2. Return deterministic JSON schema.
3. Avoid protected-class bias language.
4. Provide concise, evidence-based rationale.

Prompt input:

1. Job object (normalized).
2. Candidate object (normalized).
3. Optional parsed CV text chunks.

Expected model output JSON schema:

```json
{
  "score": 0,
  "recommendation": "hire|consider|pass",
  "matchedSkills": ["string"],
  "strengths": ["string"],
  "gaps": ["string"],
  "reasoning": "string"
}
```

Guardrails:

1. Validate with Zod before storing.
2. Reject if score outside 0-100.
3. Fallback to deterministic rules if model output invalid.

## 6.4 Hybrid Scoring (Recommended)

Do not rely on LLM score alone.

Final score formula:

$$
S_{final} = 0.6 \times S_{rules} + 0.4 \times S_{gemini}
$$

Where:

1. `S_rules` is algorithmic score from exact skills, years, education, keyword overlaps.
2. `S_gemini` is model-generated semantic fit.

Recommendation thresholds:

1. `hire`: score >= 85
2. `consider`: score 70-84
3. `pass`: score < 70

## 6.5 AI Reliability and Cost Controls

1. Cache AI responses by hash of `(jobVersion + candidateVersion + model)`.
2. Batch screening in queue workers.
3. Add request timeout and retry policy (max 2 retries).
4. Record model latency and token usage in logs.

## 7. Screening Workflow (End-to-End)

1. Recruiter creates job.
2. Recruiter imports candidates (JSON/CSV/PDF).
3. Backend normalizes candidate profiles into `candidate_profiles`.
4. Recruiter starts screening run.
5. Queue processes each candidate:
   1. Build rule-based features.
   2. Request Gemini evaluation.
   3. Merge scores and generate final recommendation.
   4. Upsert `screening_results`.
6. Backend updates progress in `screening_runs`.
7. Frontend polls latest run endpoint every 2-3 seconds.
8. When completed, results page fetches ranked candidates.

## 8. Validation Rules

## 8.1 Jobs

1. Title minimum 3 chars.
2. At least 1 required skill.
3. `minYearsExperience` between 0 and 20.

## 8.2 Candidate Profiles

1. Full name required.
2. Skills max 100 entries.
3. Experience records max 1000 chars description.

## 8.3 File Uploads

1. Allowed: `.json`, `.csv`, `.pdf`, `.docx`.
2. Max file size: 10 MB (configurable).
3. Virus scan hook before parsing (recommended for production).

## 9. Security and Compliance

1. Hash passwords with `bcrypt` (`cost >= 12`).
2. Use short-lived access token and rotating refresh tokens.
3. Enforce role-based authorization on every protected route.
4. Store secrets in environment variables only.
5. Validate all inputs using Zod.
6. Add rate limits for auth and AI endpoints.
7. Log sensitive actions in `audit_logs`.
8. Remove PII from AI prompts where not needed.

## 10. Environment Variables

```env
NODE_ENV=development
PORT=3000

MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=rankr

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash

REDIS_URL=redis://localhost:6379

FILE_STORAGE_PROVIDER=s3
S3_BUCKET=...
S3_REGION=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

APP_URL=http://localhost:3000
```

## 11. Frontend Mapping Matrix

### Recruiter

1. `/auth`
   1. `POST /auth/login`
   2. `POST /auth/register`
2. `/dashboard`
   1. `POST /jobs`
   2. `PATCH /jobs/:jobId`
3. `/candidates`
   1. `POST /jobs/:jobId/candidates/import/rankr-json`
   2. `POST /jobs/:jobId/candidates/import/external-csv`
   3. `POST /jobs/:jobId/candidates/import/external-pdf`
   4. `GET /jobs/:jobId/candidates`
4. `/screening`
   1. `POST /jobs/:jobId/screening-runs`
   2. `GET /screening-runs/:runId`
5. `/results`
   1. `GET /jobs/:jobId/results`
   2. `POST /jobs/:jobId/shortlist`
   3. `DELETE /jobs/:jobId/shortlist/:candidateProfileId`
   4. `GET /jobs/:jobId/results/export`
6. `/settings`
   1. `GET /settings/account`
   2. `PATCH /settings/account`

### Candidate

1. `/candidate/jobs`
   1. `GET /candidate/jobs`
   2. `GET /candidate/jobs/smart-matches`
   3. `POST /candidate/jobs/:jobId/apply`
2. `/candidate/applications`
   1. `GET /candidate/applications`
3. `/candidate/profile`
   1. `GET /candidate/profile`
   2. `PATCH /candidate/profile`
   3. `POST/PATCH/DELETE /candidate/profile/experience/*`
   4. `POST /candidate/profile/cv`

## 12. Implementation Phases

## Phase 1 (Foundation)

1. Setup MongoDB connection, models, and migrations.
2. Implement auth and RBAC middleware.
3. Replace localStorage user profile with `/auth/me` and `/candidate/profile`.

## Phase 2 (Recruiter Core)

1. Implement job CRUD.
2. Implement candidate import endpoints.
3. Persist candidate pool per job.

## Phase 3 (AI Screening)

1. Add screening run creation and status tracking.
2. Add Gemini integration with strict JSON output.
3. Save results and rankings.

## Phase 4 (Results and Shortlist)

1. Implement filtering, sorting, pagination on results endpoint.
2. Implement shortlist endpoints.
3. Implement CSV/JSON export.

## Phase 5 (Candidate Portal)

1. Implement candidate job browse and apply.
2. Implement applications timeline/status.
3. Implement profile edit and CV upload.

## Phase 6 (Hardening)

1. Rate limiting, audit logs, retries, observability.
2. Caching and queue optimization.
3. Integration tests and load tests.

## 13. Minimum Test Plan

1. Auth:
   1. register/login/logout/refresh success and failure.
2. Jobs:
   1. create/update/list with validation failure tests.
3. Imports:
   1. parse valid and invalid JSON/CSV/PDF.
4. Screening:
   1. run transitions `queued -> running -> completed`.
   2. invalid Gemini output fallback.
5. Results:
   1. filtering and sorting correctness.
6. Candidate:
   1. profile CRUD and application flow.

## 14. Suggested Folder Structure

```txt
src/
  api/
    auth/
    jobs/
    candidates/
    screening/
    results/
    shortlist/
    profile/
    applications/
  db/
    models/
    indexes/
    connection.ts
  services/
    ai/
      gemini.client.ts
      screening.service.ts
    files/
    auth/
    notifications/
  queues/
    screening.queue.ts
    screening.worker.ts
  middleware/
    auth.ts
    role.ts
    validate.ts
  schemas/
    zod/
  utils/
    scoring.ts
```

## 15. Immediate Backend Build Checklist

1. Add dependencies:
   1. `mongoose`
   2. `zod`
   3. `bcrypt`
   4. `jsonwebtoken`
   5. `multer`
   6. `csv-parse`
   7. `pdf-parse` (or equivalent)
   8. `bullmq`
   9. `ioredis`
   10. Gemini SDK package
2. Create base DB models.
3. Replace the mock `GET /api/candidates/shortlisted` route with DB-backed result endpoint.
4. Wire frontend pages to real endpoints incrementally by phase.

---

This document is the implementation baseline. After approval, implementation should proceed phase-by-phase, starting with Auth + Job + Candidate import + Screening foundations.
