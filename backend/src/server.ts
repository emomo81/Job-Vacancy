import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import app from './app';
import config from './config';
import { connectDb } from './db';

// Keep Render free tier awake — ping self every 10 minutes
function startKeepAlive(port: number): void {
  const isRender = !!process.env.RENDER;
  if (!isRender) return; // only run in production on Render

  const url = `http://localhost:${port}/api/v1/health`;
  setInterval(async () => {
    try {
      await fetch(url);
      console.log('[keep-alive] ping ok');
    } catch {
      // silently ignore — server may be busy
    }
  }, 10 * 60 * 1000); // every 10 minutes
}

async function bootstrap(): Promise<void> {
  try {
    console.log('Connecting to MongoDB...');
    await connectDb();
    console.log('MongoDB connected ✓');
    app.listen(config.port, () => {
      console.log(`Backend listening on http://localhost:${config.port}`);
      startKeepAlive(config.port);
    });
  } catch (error: any) {
    // Write to stdout so Render captures it (stderr is not always shown)
    process.stdout.write(`=== STARTUP FAILED ===\n`);
    process.stdout.write(`Reason: ${error?.message ?? error}\n`);
    process.stdout.write(`Stack: ${error?.stack ?? 'none'}\n`, () => process.exit(1));
  }
}

void bootstrap();
