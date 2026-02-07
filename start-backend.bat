@echo off
echo Starting ReachInbox Backend...
echo.
echo Make sure Redis and PostgreSQL are running first!
echo.
cd /d "%~dp0backend"
call npm run prisma:migrate
call npm run dev
