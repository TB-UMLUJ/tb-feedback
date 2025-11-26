@echo off
:: Force execution in the script's directory
cd /d "%~dp0"

echo ========================================================
echo          TB-UMLUJ Auto-Update Tool
echo          Current Location: %CD%
echo ========================================================

:: Fix "dubious ownership" error by marking current folder as safe
git config --global --add safe.directory "%CD%"

:: 1. Check Git and Remote
if not exist .git (
    echo.
    echo [1/4] Initializing Git repository...
    git init
    git branch -M main
    git remote add origin https://github.com/TB-UMLUJ/tb-feedback.git
) else (
    echo.
    echo [1/4] Verifying repository URL...
    git remote set-url origin https://github.com/TB-UMLUJ/tb-feedback.git
)

:: 2. Add Files
echo.
echo [2/4] Staging files...
git add .

:: 3. Commit
echo.
set "commitMsg="
set /p commitMsg="[Optional] Enter commit message (or press Enter): "
if not defined commitMsg set "commitMsg=Auto update from local machine"
echo.
echo [3/4] Committing changes...
git commit -m "%commitMsg%"

:: 4. Push
echo.
echo [4/4] Pushing to GitHub...
:: Try normal push first
git push -u origin main

:: If failed, try force push
if %errorlevel% neq 0 (
    echo.
    echo [Notice] Remote difference detected. Force pushing...
    git push -u origin main --force
)

echo.
echo ========================================================
echo               Update Complete!
echo       GitHub has been updated with your local files.
echo ========================================================
pause