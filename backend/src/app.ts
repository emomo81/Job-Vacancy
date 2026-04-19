import express, { Express } from 'express';
import cors from 'cors';
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

app.get('/api/v1/health', (req, res) => ok(res, { status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1', candidatesRoutes);
app.use('/api/v1', screeningRoutes);
app.use('/api/v1', candidatePortalRoutes);
app.use('/api/v1', settingsRoutes);

export default app;
