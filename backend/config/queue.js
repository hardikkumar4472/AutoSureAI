import { Queue } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

const DISCONNECT_REDIS = true;

const connection = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

export const emailQueue = DISCONNECT_REDIS
  ? { add: async (name, data) => console.log(`⚠️ Redis Disabled: Job ${name} skipped`, data) }
  : new Queue('emailQueue', { connection });
