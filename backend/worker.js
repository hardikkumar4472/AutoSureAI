import { Worker } from 'bullmq';
import { sendOtpEmail } from './utils/sendOtpEmail.js';
import { sendPasswordResetEmail } from './utils/sendPasswordResetEmail.js';
import dotenv from 'dotenv';
dotenv.config();

const connection = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const emailWorker = new Worker('emailQueue', async job => {
  const { type, email, otp } = job.data;
  console.log(`Processing email job: ${type} for ${email}`);
  
  if (type === 'otp') {
    await sendOtpEmail(email, otp);
  } else if (type === 'password_reset') {
    await sendPasswordResetEmail(email, otp);
  }
}, { connection });

emailWorker.on('completed', job => {
  console.log(`Email job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
  console.log(`Email job ${job.id} has failed with ${err.message}`);
});

console.log("Worker started...");
