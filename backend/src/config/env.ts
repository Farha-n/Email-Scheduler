import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env = {
  PORT: Number(process.env.PORT ?? "4000"),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  FRONTEND_URL: getEnv("FRONTEND_URL", "http://localhost:5173"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  REDIS_URL: getEnv("REDIS_URL", "redis://localhost:6379"),
  SESSION_SECRET: getEnv("SESSION_SECRET", "change-me"),
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL", "http://localhost:4000/api/auth/google/callback"),
  ETHEREAL_USER: getEnv("ETHEREAL_USER"),
  ETHEREAL_PASS: getEnv("ETHEREAL_PASS"),
  EMAIL_WORKER_CONCURRENCY: Number(process.env.EMAIL_WORKER_CONCURRENCY ?? "5"),
  MIN_SEND_DELAY_MS: Number(process.env.MIN_SEND_DELAY_MS ?? "2000"),
  MAX_EMAILS_PER_HOUR_PER_SENDER: Number(process.env.MAX_EMAILS_PER_HOUR_PER_SENDER ?? "200")
};
