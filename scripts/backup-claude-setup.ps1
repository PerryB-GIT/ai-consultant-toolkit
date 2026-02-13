# Backup Claude Code Setup Script
# Creates a complete backup of your Claude Code environment
# Run this on your main laptop before transferring to test laptop

Write-Host "🔄 Claude Code Backup Utility" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Create backup directory
$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmm'
$backupDir = "$HOME\Desktop\claude-backup-$timestamp"
Write-Host "📁 Creating backup directory: $backupDir" -ForegroundColor Yellow

try {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Host "✅ Directory created" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create directory: $_" -ForegroundColor Red
    exit 1
}

# Backup .claude directory
Write-Host ""
Write-Host "📦 Backing up Claude Code configuration..." -ForegroundColor Yellow
if (Test-Path "$HOME\.claude") {
    Copy-Item -Path "$HOME\.claude" -Destination "$backupDir\claude" -Recurse -Force
    Write-Host "✅ .claude/ backed up" -ForegroundColor Green
} else {
    Write-Host "⚠️  .claude/ not found" -ForegroundColor Yellow
}

# Backup AWS credentials
Write-Host ""
Write-Host "📦 Backing up AWS credentials..." -ForegroundColor Yellow
if (Test-Path "$HOME\.aws") {
    Copy-Item -Path "$HOME\.aws" -Destination "$backupDir\aws" -Recurse -Force
    Write-Host "✅ .aws/ backed up" -ForegroundColor Green
} else {
    Write-Host "⚠️  .aws/ not found" -ForegroundColor Yellow
}

# Backup SSH keys
Write-Host ""
Write-Host "📦 Backing up SSH keys..." -ForegroundColor Yellow
if (Test-Path "$HOME\.ssh") {
    Copy-Item -Path "$HOME\.ssh" -Destination "$backupDir\ssh" -Recurse -Force
    Write-Host "✅ .ssh/ backed up" -ForegroundColor Green
} else {
    Write-Host "⚠️  .ssh/ not found" -ForegroundColor Yellow
}

# Export git config
Write-Host ""
Write-Host "📦 Exporting git configuration..." -ForegroundColor Yellow
try {
    git config --global --list | Out-File -FilePath "$backupDir\git-config.txt"
    Write-Host "✅ git config exported" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not export git config" -ForegroundColor Yellow
}

# List installed npm packages
Write-Host ""
Write-Host "📦 Listing npm global packages..." -ForegroundColor Yellow
try {
    npm list -g --depth=0 | Out-File -FilePath "$backupDir\npm-globals.txt"
    Write-Host "✅ npm packages listed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not list npm packages" -ForegroundColor Yellow
}

# List installed Python packages
Write-Host ""
Write-Host "📦 Listing Python packages..." -ForegroundColor Yellow
try {
    pip list | Out-File -FilePath "$backupDir\python-packages.txt"
    Write-Host "✅ Python packages listed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not list Python packages" -ForegroundColor Yellow
}

# Backup credentials file
Write-Host ""
Write-Host "📦 Backing up credentials reference..." -ForegroundColor Yellow
if (Test-Path "$HOME\.credentials\auth-reference.md") {
    New-Item -ItemType Directory -Path "$backupDir\credentials" -Force | Out-Null
    Copy-Item -Path "$HOME\.credentials\auth-reference.md" -Destination "$backupDir\credentials\" -Force
    Write-Host "✅ Credentials reference backed up" -ForegroundColor Green
} else {
    Write-Host "⚠️  Credentials reference not found" -ForegroundColor Yellow
}

# Create manifest
Write-Host ""
Write-Host "📝 Creating backup manifest..." -ForegroundColor Yellow

$manifest = @"
Claude Code Backup Manifest
============================

Created: $(Get-Date)
Hostname: $env:COMPUTERNAME
User: $env:USERNAME
Backup Directory: $backupDir

Contents:
---------
$(if (Test-Path "$backupDir\claude") { "✅" } else { "❌" }) .claude/ (skills, settings, credentials)
$(if (Test-Path "$backupDir\aws") { "✅" } else { "❌" }) .aws/ (credentials, config)
$(if (Test-Path "$backupDir\ssh") { "✅" } else { "❌" }) .ssh/ (keys)
$(if (Test-Path "$backupDir\git-config.txt") { "✅" } else { "❌" }) git-config.txt
$(if (Test-Path "$backupDir\npm-globals.txt") { "✅" } else { "❌" }) npm-globals.txt
$(if (Test-Path "$backupDir\python-packages.txt") { "✅" } else { "❌" }) python-packages.txt
$(if (Test-Path "$backupDir\credentials") { "✅" } else { "❌" }) credentials/ (auth reference)

Restore Instructions:
---------------------

1. Transfer this backup directory to the new laptop
2. On new laptop, run: restore-claude-setup.ps1
3. Follow prompts to restore each component

Manual Restore Steps:
---------------------

PowerShell commands to restore:

# Restore .claude directory
Copy-Item -Path ".\claude" -Destination "`$HOME\.claude" -Recurse -Force

# Restore .aws credentials
Copy-Item -Path ".\aws" -Destination "`$HOME\.aws" -Recurse -Force

# Restore .ssh keys
Copy-Item -Path ".\ssh" -Destination "`$HOME\.ssh" -Recurse -Force

# Restore credentials
Copy-Item -Path ".\credentials" -Destination "`$HOME\.credentials" -Recurse -Force

Post-Restore Actions:
---------------------

After restoring, you'll need to re-authenticate:
- AWS: aws configure
- GCP: gcloud auth login
- GitHub: gh auth login
- Claude Code: claude auth login (if needed)

Notes:
------
- Sensitive files (API keys, SSH keys) are included in this backup
- Keep this backup secure and encrypted
- Delete after successful restore on new laptop
- Test all authentications after restore

"@

$manifest | Out-File -FilePath "$backupDir\README.txt"
Write-Host "✅ Manifest created" -ForegroundColor Green

# Calculate backup size
$backupSize = (Get-ChildItem -Path $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ BACKUP COMPLETE" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Location: $backupDir" -ForegroundColor White
Write-Host "📊 Size: $([Math]::Round($backupSize, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review README.txt in backup folder"
Write-Host "2. Transfer backup to test laptop"
Write-Host "3. Run restore-claude-setup.ps1 on test laptop"
Write-Host ""
Write-Host "⚠️  SECURITY: This backup contains sensitive credentials!" -ForegroundColor Red
Write-Host "   - Keep it encrypted"
Write-Host "   - Delete after successful restore"
Write-Host "   - Don't share or commit to git"
Write-Host ""

# Open backup folder
Write-Host "Press Enter to open backup folder..."
$null = Read-Host
Start-Process explorer.exe -ArgumentList $backupDir
