import { Queue } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

const connection = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

export const emailQueue = new Queue('emailQueue', { connection });
