# Restore Claude Code Setup Script
# Restores Claude Code environment from backup
# Run this on your test laptop after transferring the backup

param(
    [string]$BackupPath = ""
)

Write-Host "🔄 Claude Code Restore Utility" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Get backup path if not provided
if ([string]::IsNullOrEmpty($BackupPath)) {
    Write-Host "📁 Enter the path to your backup folder:" -ForegroundColor Yellow
    Write-Host "   (e.g., C:\Users\YourName\Desktop\claude-backup-2026-02-13)" -ForegroundColor Gray
    $BackupPath = Read-Host "Path"
}

# Validate backup path
if (-not (Test-Path $BackupPath)) {
    Write-Host "❌ Backup folder not found: $BackupPath" -ForegroundColor Red
    Write-Host "Please check the path and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Backup folder found: $BackupPath" -ForegroundColor Green
Write-Host ""

# Check for README
if (Test-Path "$BackupPath\README.txt") {
    Write-Host "📋 Backup Manifest:" -ForegroundColor Cyan
    Write-Host "-------------------" -ForegroundColor Cyan
    Get-Content "$BackupPath\README.txt" | Select-Object -First 15
    Write-Host ""
}

Write-Host "⚠️  WARNING: This will overwrite existing configuration!" -ForegroundColor Yellow
Write-Host "Press Enter to continue or Ctrl+C to cancel..."
$null = Read-Host

# Restore .claude directory
Write-Host ""
Write-Host "📦 Restoring Claude Code configuration..." -ForegroundColor Yellow
if (Test-Path "$BackupPath\claude") {
    try {
        Copy-Item -Path "$BackupPath\claude" -Destination "$HOME\.claude" -Recurse -Force
        Write-Host "✅ .claude/ restored" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to restore .claude/: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  .claude/ not found in backup" -ForegroundColor Yellow
}

# Restore AWS credentials
Write-Host ""
Write-Host "📦 Restoring AWS credentials..." -ForegroundColor Yellow
if (Test-Path "$BackupPath\aws") {
    try {
        New-Item -ItemType Directory -Path "$HOME\.aws" -Force | Out-Null
        Copy-Item -Path "$BackupPath\aws\*" -Destination "$HOME\.aws\" -Recurse -Force
        Write-Host "✅ .aws/ restored" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to restore .aws/: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  .aws/ not found in backup" -ForegroundColor Yellow
}

# Restore SSH keys
Write-Host ""
Write-Host "📦 Restoring SSH keys..." -ForegroundColor Yellow
if (Test-Path "$BackupPath\ssh") {
    try {
        New-Item -ItemType Directory -Path "$HOME\.ssh" -Force | Out-Null
        Copy-Item -Path "$BackupPath\ssh\*" -Destination "$HOME\.ssh\" -Recurse -Force

        # Set correct permissions on SSH keys
        $sshFiles = Get-ChildItem "$HOME\.ssh" -File
        foreach ($file in $sshFiles) {
            icacls $file.FullName /inheritance:r /grant:r "${env:USERNAME}:F" | Out-Null
        }

        Write-Host "✅ .ssh/ restored (with correct permissions)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to restore .ssh/: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  .ssh/ not found in backup" -ForegroundColor Yellow
}

# Restore credentials
Write-Host ""
Write-Host "📦 Restoring credentials reference..." -ForegroundColor Yellow
if (Test-Path "$BackupPath\credentials") {
    try {
        New-Item -ItemType Directory -Path "$HOME\.credentials" -Force | Out-Null
        Copy-Item -Path "$BackupPath\credentials\*" -Destination "$HOME\.credentials\" -Recurse -Force
        Write-Host "✅ credentials/ restored" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to restore credentials/: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  credentials/ not found in backup" -ForegroundColor Yellow
}

# Display git config for manual restoration
Write-Host ""
Write-Host "📦 Git configuration..." -ForegroundColor Yellow
if (Test-Path "$BackupPath\git-config.txt") {
    Write-Host "⚠️  Git config must be restored manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run these commands:" -ForegroundColor Cyan

    $gitConfig = Get-Content "$BackupPath\git-config.txt"
    foreach ($line in $gitConfig) {
        if ($line -match "^([^=]+)=(.+)$") {
            $key = $matches[1]
            $value = $matches[2]
            Write-Host "  git config --global $key `"$value`"" -ForegroundColor Gray
        }
    }
    Write-Host ""
} else {
    Write-Host "⚠️  git-config.txt not found in backup" -ForegroundColor Yellow
}

# Display npm packages for installation
Write-Host ""
Write-Host "📦 npm packages..." -ForegroundColor Yellow
if (Test-Path "$BackupPath\npm-globals.txt") {
    Write-Host "ℹ️  Review npm-globals.txt for packages to reinstall" -ForegroundColor Cyan
    Write-Host "   Location: $BackupPath\npm-globals.txt" -ForegroundColor Gray
} else {
    Write-Host "⚠️  npm-globals.txt not found in backup" -ForegroundColor Yellow
}

# Display Python packages for installation
Write-Host ""
Write-Host "📦 Python packages..." -ForegroundColor Yellow
if (Test-Path "$BackupPath\python-packages.txt") {
    Write-Host "ℹ️  Review python-packages.txt for packages to reinstall" -ForegroundColor Cyan
    Write-Host "   Location: $BackupPath\python-packages.txt" -ForegroundColor Gray
} else {
    Write-Host "⚠️  python-packages.txt not found in backup" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ RESTORE COMPLETE" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Post-restore instructions
Write-Host "📋 POST-RESTORE ACTIONS REQUIRED:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Re-authenticate services:" -ForegroundColor Cyan
Write-Host "   aws configure" -ForegroundColor Gray
Write-Host "   gcloud auth login" -ForegroundColor Gray
Write-Host "   gh auth login" -ForegroundColor Gray
Write-Host "   claude auth login" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test Claude Code:" -ForegroundColor Cyan
Write-Host "   claude --version" -ForegroundColor Gray
Write-Host "   claude" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Verify skills loaded:" -ForegroundColor Cyan
Write-Host "   ls ~/.claude/skills/" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test MCP servers:" -ForegroundColor Cyan
Write-Host "   Check ~/.claude/settings.json" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Restore git config (if needed):" -ForegroundColor Cyan
Write-Host "   See commands above" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 TIP: Keep the backup until you've verified everything works!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to exit..."
$null = Read-Host
