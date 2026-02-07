import { emailQueue } from "../queue/queue.js";
import { prisma } from "../db/prisma.js";
export const scheduleEmails = async (params) => {
    const now = Date.now();
    const baseTime = Math.max(params.startTime.getTime(), now);
    const created = await prisma.$transaction(params.recipients.map((recipient, index) => {
        const scheduledTime = new Date(baseTime + index * params.delayBetweenSeconds * 1000);
        return prisma.email.create({
            data: {
                recipient,
                subject: params.subject,
                body: params.body,
                scheduledTime,
                status: "scheduled",
                senderEmail: params.senderEmail,
                userId: params.userId
            }
        });
    }));
    await Promise.all(created.map((email) => emailQueue.add("send-email", {
        emailId: email.id,
        senderEmail: email.senderEmail,
        hourlyLimit: params.hourlyLimit
    }, {
        jobId: `email:${email.id}`,
        delay: Math.max(0, email.scheduledTime.getTime() - now)
    })));
    return created;
};
