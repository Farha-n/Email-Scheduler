import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env.js";
export const redisConnection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null
});
export const emailQueue = new Queue("email-send", {
    connection: redisConnection,
    defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: 1000
    }
});
