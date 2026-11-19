@echo off
echo ===================================================
echo Starting JobStack React Frontend on http://localhost:3000
echo ===================================================
start http://localhost:3000
python -m http.server 3000
pause
