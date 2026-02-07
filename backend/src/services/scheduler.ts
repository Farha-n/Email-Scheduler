import { emailQueue } from "../queue/queue";
import { prisma } from "../db/prisma";

export const scheduleEmails = async (params: {
  subject: string;
  body: string;
  recipients: string[];
  startTime: Date;
  delayBetweenSeconds: number;
  senderEmail: string;
  userId?: number;
  hourlyLimit: number;
}) => {
  const nowMs = Date.now();
  const baseTimeMs = Math.max(params.startTime.getTime(), nowMs);

  const schedulePlan = params.recipients.map((recipient, index) => ({
    recipient,
    scheduledTime: new Date(baseTimeMs + index * params.delayBetweenSeconds * 1000)
  }));

  const created = await prisma.$transaction(
    schedulePlan.map((entry) =>
      prisma.email.create({
        data: {
          recipient: entry.recipient,
          subject: params.subject,
          body: params.body,
          scheduledTime: entry.scheduledTime,
          status: "scheduled",
          senderEmail: params.senderEmail,
          userId: params.userId
        }
      })
    )
  );

  type EmailRow = Awaited<ReturnType<typeof prisma.email.create>>;

  await Promise.all(
    created.map((email: EmailRow) =>
      emailQueue.add(
        "send-email",
        {
          emailId: email.id,
          senderEmail: email.senderEmail,
          hourlyLimit: params.hourlyLimit
        },
        {
          jobId: `email-${email.id}`,
          delay: Math.max(0, email.scheduledTime.getTime() - nowMs)
        }
      )
    )
  );

  return created;
};
