@echo off
echo ========================================
echo  TPT Local WP Assistant Installer
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo Then run this installer again.
    pause
    exit /b 1
)

echo Node.js found! Installing TPT Local WP Assistant...
echo.

npm install

if %errorlevel% neq 0 (
    echo ERROR: Installation failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo To start the GUI version, run: npm run gui
echo To use the CLI version, run: npx tpt-wp-dev start /path/to/plugin
echo.
echo Your desktop shortcut should be created automatically.
echo.
pause
