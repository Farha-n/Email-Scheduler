import { Worker } from "bullmq";
import { emailQueue, redisConnection } from "../queue/queue";
import { env } from "../config/env";
import { prisma } from "../db/prisma";
import { sendEmail } from "../services/emailService";
import { checkHourlyLimit } from "../services/rateLimiter";

export const emailWorker = new Worker(
  emailQueue.name,
  async (job) => {
    const { emailId, senderEmail, hourlyLimit } = job.data as {
      emailId: number;
      senderEmail: string;
      hourlyLimit: number;
    };

    const email = await prisma.email.findUnique({ where: { id: emailId } });
    if (!email || email.status === "sent") {
      return;
    }

    const limit = hourlyLimit || env.MAX_EMAILS_PER_HOUR_PER_SENDER;
    const limitCheck = await checkHourlyLimit(senderEmail, limit);
    if (!limitCheck.allowed && limitCheck.retryAt) {
      await prisma.email.update({
        where: { id: emailId },
        data: { scheduledTime: new Date(limitCheck.retryAt) }
      });
      await job.moveToDelayed(limitCheck.retryAt, job.token as string);
      return;
    }

    try {
      await sendEmail({
        from: senderEmail,
        to: email.recipient,
        subject: email.subject,
        body: email.body
      });

      await prisma.email.update({
        where: { id: emailId },
        data: { status: "sent", sentAt: new Date() }
      });
    } catch (error) {
      await prisma.email.update({
        where: { id: emailId },
        data: { status: "failed", sentAt: new Date() }
      });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: env.EMAIL_WORKER_CONCURRENCY,
    limiter: {
      max: 1,
      duration: env.MIN_SEND_DELAY_MS
    }
  }
);

emailWorker.on("failed", (job, err) => {
  if (!job) {
    return;
  }
  console.error(`Job ${job.id} failed`, err);
});
