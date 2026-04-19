import app from './app';
import config from './config';
import { connectDb } from './db';

async function bootstrap(): Promise<void> {
  try {
    await connectDb();
    app.listen(config.port, () => {
      console.log(`Backend listening on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
}

void bootstrap();
