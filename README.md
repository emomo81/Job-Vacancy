# Rankr-AI-Powered Talent Screening

Rankr automates recruitment by running AI-driven candidate screening with Google Gemini. Recruiters create jobs, upload candidate pools (CSV, Excel, or PDF resumes), and get ranked results with reasoning in seconds. Candidates get a portal to browse open roles, apply, upload a CV, and track applications.

**Built for the Umurava AI Hackathon 2026.**

**Stack:** Next.js 16 · React 19 · Redux Toolkit · Express.js · MongoDB Atlas · Google Gemini (2.5 Flash)

---

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Local development](#local-development)
3. [Deployment](#deployment)
4. [Architecture](#architecture)
5. [AI decision flow](#ai-decision-flow)
6. [Assumptions & limitations](#assumptions--limitations)
7. [Environment variables](#environment-variables-reference)

---

## Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **MongoDB Atlas** account — [cloud.mongodb.com](https://cloud.mongodb.com) (free tier works)
- **Google Gemini API key** — [aistudio.google.com](https://aistudio.google.com)

---

## Local development

### 1. Install dependencies

```bash
# Frontend (from repo root)
npm install

# Backend
cd backend && npm install && cd ..
```

### 2. Configure environment variables

**Frontend** — copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

`.env.local` needs no changes for local dev (defaults point to `localhost:4000`).

**Backend** — copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/rankr
JWT_ACCESS_SECRET=<any long random string>
JWT_REFRESH_SECRET=<another long random string>
GEMINI_API_KEY=<your Gemini API key>
```

### 3. Start both servers

**Terminal 1 — Backend** (port 4000):

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend** (port 3000):

```bash
npm run dev
```

### 4. Test the app

| Role      | Start at                              | Flow                                                                              |
| --------- | ------------------------------------- | --------------------------------------------------------------------------------- |
| Recruiter | `/auth` → create recruiter account    | Dashboard → create job → Candidates → import pool → Screening → run → Results     |
| Candidate | `/auth` → create candidate account    | `/candidate/jobs` → browse → upload CV (auto-filled profile) → apply → track     |

---

## Deployment

**Architecture:** Frontend (Next.js) on **Vercel** · Backend (Express) on **Render**

### Step 1 — Deploy backend to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint** — Render detects `render.yaml` automatically
   - Or **New Web Service** → connect repo manually:
     - **Root Directory:** `backend`
     - **Build Command:** `npm install`
     - **Start Command:** `npm run start`
     - **Node Version:** 20
3. Add these environment variables in Render → Settings → Environment:

| Variable              | Value                                           |
| --------------------- | ----------------------------------------------- |
| `MONGODB_URI`         | Your Atlas connection string                    |
| `JWT_ACCESS_SECRET`   | Long random string                              |
| `JWT_REFRESH_SECRET`  | Long random string                              |
| `GEMINI_API_KEY`      | Your Gemini API key                             |
| `CLIENT_URL`          | Your Vercel frontend URL (add after Step 2)     |
| `GEMINI_MODEL`        | `gemini-2.5-flash`                              |
| `JWT_ACCESS_EXPIRES`  | `15m`                                           |
| `JWT_REFRESH_EXPIRES` | `7d`                                            |

4. Note the service URL — e.g. `https://rankr-backend.onrender.com`

> **Free tier note:** Render free services spin down after 15 min of inactivity. The first request after sleep takes ~30s.

### Step 2 — Deploy frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
2. Vercel auto-detects Next.js — no framework config needed
3. Add one environment variable in Vercel → Settings → Environment Variables:

| Variable                  | Value                                           |
| ------------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://rankr-backend.onrender.com/api/v1`   |

4. Deploy

### Step 3 — Connect them

- In Render, update `CLIENT_URL` to your Vercel URL
- Trigger a redeploy on Render so CORS picks up the new origin

---

## Architecture

```
┌──────────────────────────┐        HTTPS / JSON        ┌──────────────────────────┐
│  Next.js 16 Frontend     │ ◄────────────────────────► │  Express Backend         │
│  (Vercel, App Router)    │    Bearer JWT (access)     │  (Render, Node 20)       │
│                          │    + refresh-token rotation│                          │
│  • Redux Toolkit store   │                            │  • JWT auth middleware   │
│  • Role-based routing    │                            │  • Multer uploads        │
│  • Tailwind + Framer     │                            │  • Mongoose ODM          │
└──────────────────────────┘                            └────────┬─────────────────┘
                                                                 │
                                                                 ├──► MongoDB Atlas
                                                                 │    (users, jobs,
                                                                 │     profiles, runs,
                                                                 │     results, notifs)
                                                                 │
                                                                 └──► Google Gemini
                                                                      (gemini-2.5-flash)
                                                                      • CV text extraction
                                                                      • Batch candidate
                                                                        ranking
```

### Key modules

| Area               | File                                                 | Responsibility                                              |
| ------------------ | ---------------------------------------------------- | ----------------------------------------------------------- |
| File parsing       | `backend/src/services/fileParserService.ts`          | CSV / Excel / PDF / DOCX → structured candidate objects     |
| AI scoring         | `backend/src/services/geminiService.ts`              | Single + **batch** Gemini evaluation with rule-based blend  |
| Candidate import   | `backend/src/routes/candidates.ts`                   | Real parsing, persistence, batch analysis                   |
| Screening pipeline | `backend/src/routes/screening.ts`                    | Async screening run with progress tracking                  |
| Candidate portal   | `backend/src/routes/candidatePortal.ts`              | CV upload → Gemini parse → profile auto-fill                |
| State management   | `store/`                                             | Redux Toolkit slices: `auth`, `profile`, `ui`               |
| API client         | `utils/api-client.ts`                                | Fetch wrapper with silent JWT refresh                       |

---

## AI decision flow

Rankr uses a **hybrid scoring model** that blends deterministic rule-based matching with Gemini's contextual reasoning. This prevents two failure modes common in LLM-only scoring: hallucinated matches ("this candidate is a perfect fit!" when skills don't match) and brittle output (API errors leaving recruiters with no ranking).

### Step 1 — Ingest

Recruiter uploads candidates via one of three pipelines:

- **CSV / Excel** (`csv-parse`, `xlsx`) — header aliases (`Full Name`, `Title`, `Skills`, etc.) are normalized, rows without a name are skipped.
- **PDF / DOCX resumes** (`pdf-parse`, `mammoth`) — raw text is extracted, then Gemini is prompted with a strict JSON schema to return `{ fullName, professionalTitle, skills[], yearsExperience, education, summary }`. If Gemini fails, a regex-based fallback extracts name, years, and skill keywords.
- **Rankr JSON** — structured talent pool payload from partner sources.

Each candidate's CV text is stored on `CandidateProfile.cv.extractedText` so scoring can reference raw context.

### Step 2 — Rule-based baseline

For every `(job, candidate)` pair, the backend computes:

```
skillRatio = (matched required skills) / (total required skills)
expRatio   = min(1, candidateYears / jobMinYears)
ruleScore  = 70 * skillRatio + 30 * expRatio         // 0–100
```

This is a floor: even if Gemini is unavailable, every candidate gets a reproducible score.

### Step 3 — Gemini batch evaluation

Candidates are sent to Gemini in **batches of 8** (configurable in `geminiService.ts`). One round-trip scores up to 8 candidates — ~5× faster than per-candidate calls, and cheaper. The prompt asks Gemini to return a JSON array of:

```ts
{
  id: string,             // candidate _id for deterministic mapping
  score: number,          // 0-100
  recommendation: "hire" | "consider" | "pass",
  matchedSkills: string[],
  strengths: string[],    // 2–4 bullets
  gaps: string[],         // 1–3 bullets
  reasoning: string,      // 2–3 sentences
}
```

`responseMimeType: "application/json"` forces structured output. If the parse fails (invalid JSON, timeout, quota), the candidate silently falls back to the rule score + templated reasoning — so a single bad API response never breaks the run.

### Step 4 — Blend & rank

```
finalScore = 0.5 * ruleScore + 0.5 * geminiScore
```

50/50 blend — deterministic scoring anchors the ranking in verifiable criteria (skill coverage, experience) while Gemini's judgment accounts for context the rule layer misses (relevance of summary, nice-to-haves, quality of experience).

The recommendation threshold:

| Score  | Recommendation |
| ------ | -------------- |
| 85–100 | `hire`         |
| 70–84  | `consider`     |
| 0–69   | `pass`         |

Results are sorted by `finalScore` desc, assigned a `rank`, and persisted to `ScreeningResult`. Progress updates (`processedCandidates`, `progressPct`) are written to `ScreeningRun` after each batch so the recruiter UI can poll a live progress bar.

### Step 5 — Recruiter review

Recruiter sees a ranked list with per-candidate reasoning, strengths, gaps, and matched skills. Shortlisting a candidate triggers a notification for the applicant (if they applied via the Rankr portal).

---

## Assumptions & limitations

### Assumptions

- **English resumes.** Gemini prompts and regex fallbacks assume English-language CVs. Non-English resumes will often parse but with lower fidelity on skills/education fields.
- **Recruiters vet shortlists manually.** Rankings are a triage tool — the recommendation is advisory, not a hiring decision. Final interviews and decisions remain human.
- **Self-reported accuracy.** Rankr does not verify claimed experience or education. A candidate who lies on a resume will score based on what they wrote.
- **One organization per recruiter.** The data model assumes a recruiter is tied to a single `Organization`; multi-tenant recruiters are not supported.
- **Resumes are 1–3 pages of text.** PDFs longer than ~12,000 characters are truncated before being sent to Gemini.

### Limitations

- **Gemini free-tier rate limits.** Batches of 8 reduce call volume, but large pools (100+ candidates) may hit quota. The rule-score fallback keeps the ranking usable when this happens, but AI reasoning will be absent for skipped candidates.
- **No scanned-image CV parsing at import.** The `/import/external-pdf` endpoint extracts text via `pdf-parse` only — scanned image PDFs (no embedded text) will fail parsing. The candidate portal CV upload supports image OCR via Gemini Vision; the bulk import path does not.
- **CSV schema expectations.** Column headers outside the known alias list are ignored. Custom HRIS exports may need header renaming. Canonical headers: `Full Name`, `Title`, `Location`, `Years of Experience`, `Skills` (comma-separated), `Education`, `Summary`.
- **Synchronous screening runs.** Runs execute in-process on the Express server — a Render free-tier restart mid-run leaves the run stuck at `running`. Production would move this to a queue (BullMQ, Vercel Queues).
- **No resume PII redaction.** CV text is stored verbatim and sent to Gemini. For a production deployment handling sensitive data, add PII stripping before the Gemini call and encrypt `CandidateProfile.cv.extractedText` at rest.
- **Bias in LLM judgment.** Gemini can reflect biases in its training data. The 50/50 blend with a deterministic skill-matching rule is an intentional mitigation, but organizations deploying this for real hiring should audit score distributions across demographic dimensions before trusting it.
- **No retries on Gemini failures.** A single batch failure means those 8 candidates fall back to rule scores. Adding exponential-backoff retries is a straightforward improvement for hardening.

---

## Environment variables reference

### Frontend (`.env.local`)

| Variable                   | Default                             | Description          |
| -------------------------- | ----------------------------------- | -------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000/api/v1`      | Backend API base URL |
| `NEXT_PUBLIC_APP_URL`      | `http://localhost:3000`             | Public app URL       |

### Backend (`backend/.env`)

| Variable              | Required               | Description                            |
| --------------------- | ---------------------- | -------------------------------------- |
| `MONGODB_URI`         | Yes                    | MongoDB Atlas connection string        |
| `JWT_ACCESS_SECRET`   | Yes                    | Secret for signing access tokens       |
| `JWT_REFRESH_SECRET`  | Yes                    | Secret for signing refresh tokens      |
| `GEMINI_API_KEY`      | Yes                    | Google Gemini API key                  |
| `CLIENT_URL`          | Yes                    | Frontend URL (for CORS)                |
| `PORT`                | No — default `4000`    | Backend server port                    |
| `GEMINI_MODEL`        | No — default `gemini-2.5-flash` | Gemini model ID               |
| `JWT_ACCESS_EXPIRES`  | No — default `15m`     | Access token lifetime                  |
| `JWT_REFRESH_EXPIRES` | No — default `7d`      | Refresh token lifetime                 |

---

## License

Built for the Umurava AI Hackathon 2026. See [LICENSE](LICENSE) if included, otherwise © the authors.
