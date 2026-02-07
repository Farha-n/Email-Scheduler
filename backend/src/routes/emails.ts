import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth";
import { scheduleEmails } from "../services/scheduler";
import { emailQueue } from "../queue/queue";
import { env } from "../config/env";
import { deliveryZoneIds, getDeliveryZoneRule, type DeliveryZoneId } from "../services/deliveryZones";

export const emailsRouter = Router();

const scheduleSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  recipients: z.array(z.string().email()).min(1),
  startTime: z.string().datetime(),
  delayBetween: z.number().min(1),
  hourlyLimit: z.number().min(1),
  zoneId: z.enum(deliveryZoneIds).optional()
});

const normalizeDelay = (delayBetween: number, multiplier: number) =>
  Math.max(1, Math.round(delayBetween * multiplier));

const normalizeHourlyLimit = (requested: number, zoneCap: number, globalCap: number) =>
  Math.min(requested, zoneCap, globalCap);

emailsRouter.post("/schedule", requireAuth, async (req, res) => {
  const parsed = scheduleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const user = req.user as { id: number; email: string };
  const zoneRule = getDeliveryZoneRule(parsed.data.zoneId as DeliveryZoneId | undefined);
  const delayBetweenSeconds = normalizeDelay(parsed.data.delayBetween, zoneRule.delayMultiplier);
  const hourlyLimit = normalizeHourlyLimit(
    parsed.data.hourlyLimit,
    zoneRule.hourlyLimitCap,
    env.MAX_EMAILS_PER_HOUR_PER_SENDER
  );

  const created = await scheduleEmails({
    subject: parsed.data.subject,
    body: parsed.data.body,
    recipients: parsed.data.recipients,
    startTime: new Date(parsed.data.startTime),
    delayBetweenSeconds,
    senderEmail: user.email,
    userId: user.id,
    hourlyLimit
  });

  return res.json({ scheduled: created.length });
});

emailsRouter.get("/scheduled", requireAuth, async (req, res) => {
  const user = req.user as { id: number };
  const emails = await prisma.email.findMany({
    where: { userId: user.id, status: "scheduled" },
    orderBy: { scheduledTime: "asc" }
  });
  res.json({ emails });
});

emailsRouter.get("/sent", requireAuth, async (req, res) => {
  const user = req.user as { id: number };
  const emails = await prisma.email.findMany({
    where: { userId: user.id, status: { in: ["sent", "failed"] } },
    orderBy: { sentAt: "desc" }
  });
  res.json({ emails });
});

emailsRouter.delete("/:id", requireAuth, async (req, res) => {
  const user = req.user as { id: number };
  const emailId = Number(req.params.id);

  if (!Number.isInteger(emailId)) {
    return res.status(400).json({ error: "Invalid email id" });
  }

  const email = await prisma.email.findFirst({
    where: { id: emailId, userId: user.id }
  });

  if (!email) {
    return res.status(404).json({ error: "Email not found" });
  }

  if (email.status === "scheduled") {
    await emailQueue.remove(`email-${email.id}`);
  }
  await prisma.email.delete({ where: { id: email.id } });

  return res.json({ success: true });
});
