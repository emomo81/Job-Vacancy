import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import app from './app';
import config from './config';
import { connectDb } from './db';

async function bootstrap(): Promise<void> {
  try {
    console.log('Connecting to MongoDB...');
    await connectDb();
    console.log('MongoDB connected ✓');
    app.listen(config.port, () => {
      console.log(`Backend listening on http://localhost:${config.port}`);
    });
  } catch (error: any) {
    console.error('=== STARTUP FAILED ===');
    console.error('Reason:', error?.message ?? error);
    console.error('Stack:', error?.stack);
    // flush stdout/stderr before exiting
    process.stdout.write('', () => process.exit(1));
  }
}

void bootstrap();
