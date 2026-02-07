# ReachInbox Email Scheduler

## Overview
This is a small email scheduler: a backend API + worker and a simple React dashboard. Stack is Express, BullMQ, Redis, PostgreSQL, Ethereal SMTP, React, TypeScript, and Tailwind CSS.

## Requirements
- Node.js 18+
- Redis (local or Docker)
- PostgreSQL (local or Docker)

## Backend: How to Run

1) Make sure Redis and PostgreSQL are running.

2) Set backend environment variables in `backend/.env`:
- `DATABASE_URL` (PostgreSQL connection string)
- `REDIS_URL` (Redis connection string)
- `SESSION_SECRET` (any long random string)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` (default `http://localhost:4000/api/auth/google/callback`)
- `ETHEREAL_USER`
- `ETHEREAL_PASS`
- `EMAIL_WORKER_CONCURRENCY` (default 5)
- `MIN_SEND_DELAY_MS` (default 2000)
- `MAX_EMAILS_PER_HOUR_PER_SENDER` (default 200)

3) Install dependencies:
- cd backend
- npm install

4) Prisma setup:
- npm run prisma:generate
- npm run prisma:migrate

5) Start backend (API + worker):
- npm run dev

## Frontend: How to Run

1) Set frontend environment variables in `frontend/.env`:
- `VITE_API_BASE_URL` (default `http://localhost:4000`)

2) Install dependencies:
- cd frontend
- npm install

3) Start frontend:
- npm run dev

## Ethereal Email Setup
1) Create a test account on Ethereal.
2) Put the Ethereal `user` and `pass` in `ETHEREAL_USER` and `ETHEREAL_PASS` in `backend/.env`.
3) Sent emails show up in the Ethereal web inbox (they do not reach real inboxes).

## API Endpoints
- POST /api/emails/schedule
- GET /api/emails/scheduled
- GET /api/emails/sent
- DELETE /api/emails/:id
- GET /api/auth/me
- POST /api/auth/logout
- GET /api/auth/google

## Architecture Overview
- The API writes email rows to PostgreSQL and enqueues delayed BullMQ jobs in Redis.
- The worker runs in the same backend process and handles `send-email` jobs.
- Email delivery uses Ethereal SMTP via Nodemailer.
- Redis-backed counters enforce per-sender hourly limits across worker instances.

## Scheduling, Persistence, and Idempotency
- Each email is stored in PostgreSQL with status `scheduled`, `sent`, or `failed`.
- Each email is added to BullMQ as a delayed job based on its scheduled time.
- BullMQ + Redis persist jobs, so future jobs survive restarts without duplication.
- Idempotency uses a unique job ID per email plus a DB status check before send.

## Concurrency, Delay, and Rate Limiting
- Worker concurrency is configurable via `EMAIL_WORKER_CONCURRENCY`.
- Minimum delay between sends is enforced by the BullMQ limiter using `MIN_SEND_DELAY_MS`.
- Per-sender hourly limits are enforced with Redis counters keyed by hour and sender:
  - `email_count:YYYYMMDDHH:sender@example.com`
- If a sender exceeds the limit, the job is rescheduled to the next hour and the email's `scheduledTime` is updated.

## Testing Restart Persistence

1) Schedule emails 5-10 minutes in the future.

2) Stop backend:
- Ctrl+C or kill process.

3) Start again:
- npm run dev

4) Verify:
- Jobs remain in BullMQ queue.
- Emails still send at the original time.
- No duplicates are created (status check in DB prevents re-send).

## Testing Rate Limiting

1) Set in .env:
- MAX_EMAILS_PER_HOUR_PER_SENDER=5

2) Upload CSV with 20 emails from same sender.

Expected behavior:
- First 5 emails send immediately.
- Remaining 15 are automatically rescheduled to the next hour window.
- Order is preserved as much as possible.
- No jobs are dropped.

## Design Notes
- No cron jobs are used.
- No node-cron or agenda.
- Scheduling is purely BullMQ delayed jobs backed by Redis.
- Future execution survives restarts.

## Features Implemented

### Backend
- Schedule emails with delayed BullMQ jobs
- Persistent scheduling across restarts
- Per-sender hourly rate limiting with Redis
- Worker concurrency control and minimum delay between sends
- Zone-aware spacing and hourly caps
- Ethereal SMTP delivery
- Google OAuth login and user persistence

### Frontend
- Google login screen
- Dashboard with header and logout
- Scheduled and sent email lists with status
- Compose modal for CSV upload and scheduling
- Delivery zone picker
- Delete scheduled emails

## Demo Video

Add a short demo video (<=5 min) showing:
- Scheduling emails from the frontend
- Viewing Scheduled & Sent tables
- Server restart with persistence
- Rate limiting behavior

## Assumptions / Trade-offs
- Session storage uses the in-memory store for simplicity; replace with Redis store for production.
- Hourly limit values are capped by `MAX_EMAILS_PER_HOUR_PER_SENDER`.
