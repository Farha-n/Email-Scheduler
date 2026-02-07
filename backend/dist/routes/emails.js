import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { scheduleEmails } from "../services/scheduler.js";
import { env } from "../config/env.js";
export const emailsRouter = Router();
const scheduleSchema = z.object({
    subject: z.string().min(1),
    body: z.string().min(1),
    recipients: z.array(z.string().email()).min(1),
    startTime: z.string().datetime(),
    delayBetween: z.number().min(1),
    hourlyLimit: z.number().min(1)
});
emailsRouter.post("/schedule", requireAuth, async (req, res) => {
    const parsed = scheduleSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }
    const user = req.user;
    const hourlyLimit = Math.min(parsed.data.hourlyLimit, env.MAX_EMAILS_PER_HOUR_PER_SENDER);
    const created = await scheduleEmails({
        subject: parsed.data.subject,
        body: parsed.data.body,
        recipients: parsed.data.recipients,
        startTime: new Date(parsed.data.startTime),
        delayBetweenSeconds: parsed.data.delayBetween,
        senderEmail: user.email,
        userId: user.id,
        hourlyLimit
    });
    return res.json({ scheduled: created.length });
});
emailsRouter.get("/scheduled", requireAuth, async (req, res) => {
    const user = req.user;
    const emails = await prisma.email.findMany({
        where: { userId: user.id, status: "scheduled" },
        orderBy: { scheduledTime: "asc" }
    });
    res.json({ emails });
});
emailsRouter.get("/sent", requireAuth, async (req, res) => {
    const user = req.user;
    const emails = await prisma.email.findMany({
        where: { userId: user.id, status: { in: ["sent", "failed"] } },
        orderBy: { sentAt: "desc" }
    });
    res.json({ emails });
});
