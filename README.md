# Rankr — AI-Powered Talent Screening

Rankr automates recruitment by running AI-driven candidate screening with Google Gemini. Recruiters create jobs, upload candidate pools, and get ranked results with reasoning in seconds. Candidates get a portal to browse open roles and track applications.

**Stack:** Next.js 16 · Express.js · MongoDB Atlas · Google Gemini API

---

## Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **MongoDB Atlas** account — [cloud.mongodb.com](https://cloud.mongodb.com) (free tier works)
- **Google Gemini API key** — [aistudio.google.com](https://aistudio.google.com)

---

## Local Development

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

| Role | Start at | Flow |
|------|----------|------|
| Recruiter | `/auth` → create recruiter account | Dashboard → create job → Candidates → import pool → Screening → run → Results |
| Candidate | `/auth` → create candidate account | `/candidate/jobs` → browse & apply |

---

## Deployment

**Architecture:** Frontend (Next.js) on **Vercel** · Backend (Express) on **Render**

### Step 1 — Deploy Backend to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint** — Render will detect `render.yaml` automatically
   - Or go to **New Web Service**, connect the repo, and configure manually:
     - **Root Directory:** `backend`
     - **Build Command:** `npm install`
     - **Start Command:** `npm run start`
     - **Node Version:** 20
3. Add these environment variables in Render → Settings → Environment:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_ACCESS_SECRET` | Long random string |
| `JWT_REFRESH_SECRET` | Long random string |
| `GEMINI_API_KEY` | Your Gemini API key |
| `CLIENT_URL` | Your Vercel frontend URL (add after Step 2) |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `JWT_ACCESS_EXPIRES` | `15m` |
| `JWT_REFRESH_EXPIRES` | `7d` |

4. Note the service URL — e.g. `https://rankr-backend.onrender.com`

> **Free tier note:** Render free services spin down after 15 min of inactivity. The first request after sleep takes ~30s. Upgrade to a paid plan to avoid this.

---

### Step 2 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
2. Vercel auto-detects Next.js — no framework config needed
3. Add one environment variable in Vercel → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://rankr-backend.onrender.com/api/v1` |

4. Deploy

---

### Step 3 — Connect them

After both are live:
- In Render, update `CLIENT_URL` to your Vercel URL (e.g. `https://rankr.vercel.app`)
- Trigger a redeploy on Render so CORS picks up the new origin

---

## Environment Variables Reference

### Frontend (`.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000/api/v1` | Backend API base URL |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public app URL |

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Yes | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `CLIENT_URL` | Yes | Frontend URL (for CORS) |
| `PORT` | No — default `4000` | Backend server port |
| `GEMINI_MODEL` | No — default `gemini-2.5-flash` | Gemini model ID |
| `JWT_ACCESS_EXPIRES` | No — default `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES` | No — default `7d` | Refresh token lifetime |
