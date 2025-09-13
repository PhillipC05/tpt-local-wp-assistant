param(
    [switch]$SkipDependencies
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " TPT Local WP Assistant Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking if Node.js is installed..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Then run this installer again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
if (-not $SkipDependencies) {
    Write-Host "Installing TPT Local WP Assistant..." -ForegroundColor Yellow
    npm install

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Installation failed!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the GUI version, run: npm run gui" -ForegroundColor Cyan
Write-Host "To use the CLI version, run: npx tpt-wp-dev start /path/to/plugin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your desktop shortcut should be created automatically." -ForegroundColor Yellow
Write-Host ""

# Create desktop shortcut
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "TPT Local WP Assistant.lnk"

if (Test-Path $shortcutPath) {
    Write-Host "Desktop shortcut already exists." -ForegroundColor Gray
} else {
    try {
        $WshShell = New-Object -comObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($shortcutPath)
        $Shortcut.TargetPath = "cmd.exe"
        $Shortcut.Arguments = "/c cd /d `"$PSScriptRoot`" && npm run gui"
        $Shortcut.WorkingDirectory = $PSScriptRoot
        $Shortcut.IconLocation = "imageres.dll,15"
        $Shortcut.Description = "TPT Local WP Assistant - WordPress Plugin Development Environment"
        $Shortcut.Save()
        Write-Host "Desktop shortcut created successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Could not create desktop shortcut automatically." -ForegroundColor Yellow
        Write-Host "You can create one manually pointing to: npm run gui" -ForegroundColor Gray
    }
}

Read-Host "Press Enter to exit"
