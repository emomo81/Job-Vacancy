import mongoose, { Connection } from 'mongoose';
import config from './config';

export async function connectDb(): Promise<Connection> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongodbUri);
  return mongoose.connection;
}
