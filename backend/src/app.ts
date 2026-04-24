import express, { Express } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import config from './config';
import { ok } from './utils/apiResponse';
import authRoutes from './routes/auth';
import jobsRoutes from './routes/jobs';
import candidatesRoutes from './routes/candidates';
import screeningRoutes from './routes/screening';
import candidatePortalRoutes from './routes/candidatePortal';
import settingsRoutes from './routes/settings';

const app: Express = express();

app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// General API rate limit: 300 requests per minute per IP
app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
}));

// Stricter limit for file upload endpoints: 20 uploads per minute per IP
app.use('/api/v1/jobs', rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  skip: (req) => !req.path.includes('/import') && !req.path.includes('/candidates/import'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Upload limit reached, please try again later.' } },
}));

// Auth endpoints: 20 attempts per 15 minutes per IP (brute-force protection)
app.use('/api/v1/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many auth attempts, please try again later.' } },
}));

app.get('/api/v1/health', (req, res) => ok(res, { status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1', candidatesRoutes);
app.use('/api/v1', screeningRoutes);
app.use('/api/v1', candidatePortalRoutes);
app.use('/api/v1', settingsRoutes);

export default app;
