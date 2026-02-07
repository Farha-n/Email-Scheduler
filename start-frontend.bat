@echo off
echo Starting ReachInbox Frontend...
echo.
cd /d "%~dp0frontend"
call npm run dev
