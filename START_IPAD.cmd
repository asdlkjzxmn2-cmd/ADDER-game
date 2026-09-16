@echo off
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 (
  node server.cjs
) else if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.cjs
) else (
  echo Node.js is required ONLY for this local preview server.
  echo Install Node.js LTS from https://nodejs.org or use GitHub Pages.
  echo Offline PC play needs no installation: open ADDER_V16.html.
)
pause
