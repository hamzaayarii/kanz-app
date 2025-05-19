@echo off
echo Starting AccountingManagementApp in fast mode...
echo.

echo Starting optimized backend server...
cd /d %~dp0backend
start cmd /k "nodemon optimized-server.js"

timeout /t 3 /nobreak > nul

echo Starting optimized frontend application...
cd /d %~dp0frontend
start cmd /k "npm run start:fast"

echo.
echo Application is starting in fast mode! Please wait a moment for both services to be ready.
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API is available at: http://localhost:5000
