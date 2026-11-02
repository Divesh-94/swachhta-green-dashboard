@echo off
title Swachhta Green Dashboard Launcher
echo ========================================================
echo Starting Swachhta & Green Compliance Monitoring Project
echo ========================================================

:: 1. Start MongoDB on port 27018 with local project data directory
echo [1/3] Starting MongoDB Database on port 27018...
start "MongoDB (Port 27018)" /min "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --port 27018 --dbpath "%~dp0backend\data"

timeout /t 2 /nobreak >nul

:: 2. Start Backend
echo [2/3] Starting Backend API (Port 5000)...
start "Backend API (Port 5000)" cmd /k "cd /d "%~dp0backend" && node server.js"

timeout /t 2 /nobreak >nul

:: 3. Start Frontend
echo [3/3] Starting Frontend React App (Port 5173)...
start "Frontend UI (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul

:: 4. Open in browser
echo [Done] Opening Dashboard in browser...
start http://localhost:5173

echo.
echo ========================================================
echo  All services are running!
echo  - Frontend Web UI:  http://localhost:5173
echo  - Backend REST API: http://localhost:5000
echo  - MongoDB Database: mongodb://127.0.0.1:27018
echo ========================================================
echo.
