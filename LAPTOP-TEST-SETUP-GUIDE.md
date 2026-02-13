# Test Laptop Setup Guide - AI Consultant Toolkit

**Purpose:** Test the AI Consultant Toolkit onboarding process on a clean Windows laptop

**Date:** February 13, 2026

---

## 🎯 TESTING OBJECTIVES

1. **Validate Windows Script:** Test `setup-windows.ps1` on clean Windows install
2. **Validate Dashboard:** Test web onboarding flow end-to-end
3. **Validate JSON Upload:** Test validation API with real script output
4. **Mirror Current Setup:** Clone Perry's exact Claude Code environment

---

## 📋 PREREQUISITES (Have These Ready)

### Accounts & Credentials:
- [ ] Anthropic account (claude.ai)
- [ ] Anthropic API key (console.anthropic.com/settings/keys)
- [ ] GitHub account (github.com/PerryB-GIT)
- [ ] AWS account credentials
- [ ] Google account (perry.bailes@gmail.com)
- [ ] GCP project access

### Files to Transfer:
- [ ] `~/.claude/.credentials.json` (from main laptop)
- [ ] `~/.claude/skills/` folder (all your custom skills)
- [ ] `~/.aws/credentials` (AWS config)
- [ ] `~/.ssh/` keys (if needed for GitHub)

---

## 🚀 OPTION 1: Test the Windows Setup Script (Fresh Install)

**Objective:** Validate the onboarding process as if you were a new client.

### Step 1: Download the Setup Script

Visit: https://github.com/PerryB-GIT/ai-consultant-toolkit

Download: `scripts/windows/setup-windows.ps1`

Or via PowerShell:
```powershell
# Create temp directory
mkdir C:\temp\toolkit-test
cd C:\temp\toolkit-test

# Download script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-windows.ps1" -OutFile "setup-windows.ps1"
```

### Step 2: Run the Script

```powershell
# Run as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force
.\setup-windows.ps1
```

**Expected Output:** `setup-results.json`

### Step 3: Test the Dashboard

1. Visit: https://ai-consultant-toolkit.vercel.app
2. Upload `setup-results.json`
3. Verify validation results
4. Check troubleshooting hints

### Step 4: Document Results

Note any:
- Errors during installation
- Missing tools
- Unclear instructions
- Time taken for each step

---

## 🔄 OPTION 2: Mirror Your Current Setup (Full Clone)

**Objective:** Replicate your exact Claude Code environment on the test laptop.

### Step 1: Backup Current Setup (Main Laptop)

Run this on your main laptop:

```powershell
# Create backup directory
$backupDir = "$HOME\Desktop\claude-backup-$(Get-Date -Format 'yyyy-MM-dd')"
New-Item -ItemType Directory -Path $backupDir -Force

# Backup Claude Code config
Copy-Item -Path "$HOME\.claude" -Destination "$backupDir\claude" -Recurse -Force

# Backup AWS credentials
Copy-Item -Path "$HOME\.aws" -Destination "$backupDir\aws" -Recurse -Force

# Backup SSH keys
Copy-Item -Path "$HOME\.ssh" -Destination "$backupDir\ssh" -Recurse -Force

# Backup Git config
git config --global --list > "$backupDir\git-config.txt"

# List installed npm global packages
npm list -g --depth=0 > "$backupDir\npm-globals.txt"

# List installed Python packages
pip list > "$backupDir\python-packages.txt"

# Create manifest
@"
Claude Code Backup Manifest
Created: $(Get-Date)
Hostname: $env:COMPUTERNAME
User: $env:USERNAME

Contents:
- .claude/ (skills, settings, credentials)
- .aws/ (credentials, config)
- .ssh/ (keys)
- git-config.txt
- npm-globals.txt
- python-packages.txt

To restore on new laptop:
1. Install Claude Code
2. Copy .claude/ to ~/.claude/
3. Copy .aws/ to ~/.aws/
4. Copy .ssh/ to ~/.ssh/
5. Restore git config
6. Install npm/python packages
"@ | Out-File -FilePath "$backupDir\README.txt"

Write-Host "✅ Backup created: $backupDir"
Write-Host "📦 Ready to transfer to test laptop"
```

### Step 2: Transfer to Test Laptop

**Options:**
- USB drive
- OneDrive/Dropbox
- Network share
- Email (if small enough)

### Step 3: Restore on Test Laptop

Run this on test laptop:

```powershell
# Set backup directory path
$backupDir = "C:\path\to\claude-backup-2026-02-13"

# Install Claude Code first
npm install -g @anthropic-ai/claude-code

# Restore .claude directory
Copy-Item -Path "$backupDir\claude" -Destination "$HOME\.claude" -Recurse -Force

# Restore AWS credentials
New-Item -ItemType Directory -Path "$HOME\.aws" -Force
Copy-Item -Path "$backupDir\aws\*" -Destination "$HOME\.aws\" -Recurse -Force

# Restore SSH keys
New-Item -ItemType Directory -Path "$HOME\.ssh" -Force
Copy-Item -Path "$backupDir\ssh\*" -Destination "$HOME\.ssh\" -Recurse -Force

# Restore git config
# (Manually run git config commands from git-config.txt)

Write-Host "✅ Restore complete"
Write-Host "⚠️  You may need to:"
Write-Host "   - Authenticate gcloud: gcloud auth login"
Write-Host "   - Authenticate AWS: aws configure"
Write-Host "   - Authenticate GitHub: gh auth login"
Write-Host "   - Test Claude Code: claude --version"
```

---

## 🔌 OPTION 3: Remote Access (Telnet/SSH)

**Objective:** Test remotely without physical access to the laptop.

### Prerequisites on Test Laptop:

1. **Enable SSH Server:**
```powershell
# Run as Administrator
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# Open firewall
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

2. **Find IP Address:**
```powershell
ipconfig | Select-String "IPv4"
```

### From Main Laptop:

```powershell
# SSH into test laptop
ssh YourUsername@TestLaptopIP

# Run setup script remotely
# (Follow Option 1 steps via SSH)
```

---

## 📧 EMAIL PACKAGE CONTENTS

I'll send you an email with:

1. **This setup guide** (LAPTOP-TEST-SETUP-GUIDE.md)
2. **Windows setup script** (setup-windows.ps1)
3. **Backup PowerShell script** (backup-claude-setup.ps1)
4. **Restore PowerShell script** (restore-claude-setup.ps1)
5. **Test checklist** (what to validate)
6. **Dashboard URL** (https://ai-consultant-toolkit.vercel.app)
7. **GitHub repo link** (for manual download if needed)

---

## ✅ TEST CHECKLIST

### Phase 1: Prerequisites (10 min)
- [ ] Windows 10/11 installed
- [ ] Administrator access
- [ ] Internet connection
- [ ] Antivirus temporarily disabled (if blocking installs)

### Phase 2: Script Execution (20-40 min)
- [ ] Downloaded setup-windows.ps1
- [ ] Ran as Administrator
- [ ] Script completed without errors
- [ ] setup-results.json generated

### Phase 3: Tool Verification (10 min)
- [ ] Chocolatey installed: `choco --version`
- [ ] Git installed: `git --version`
- [ ] Node.js installed: `node --version`
- [ ] Python installed: `python --version`
- [ ] Claude Code installed: `claude --version`
- [ ] WSL2 installed (if applicable)

### Phase 4: Dashboard Testing (10 min)
- [ ] Visited https://ai-consultant-toolkit.vercel.app
- [ ] ProgressBar displays correctly
- [ ] Uploaded setup-results.json
- [ ] Validation API responded
- [ ] Received recommendations

### Phase 5: Claude Code Testing (15 min)
- [ ] Authenticated: `claude auth login`
- [ ] Started chat: `claude`
- [ ] Tested basic commands
- [ ] Verified skills loaded

### Phase 6: Full Environment (30 min)
- [ ] AWS CLI authenticated
- [ ] GCP CLI authenticated
- [ ] GitHub CLI authenticated
- [ ] MCP servers configured
- [ ] Custom skills installed

---

## 🐛 COMMON ISSUES & FIXES

### Issue: PowerShell Execution Policy
**Error:** "cannot be loaded because running scripts is disabled"
**Fix:**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
```

### Issue: Chocolatey Not in PATH
**Error:** "choco: command not found"
**Fix:**
```powershell
refreshenv
# Or restart PowerShell
```

### Issue: Node.js Not Found After Install
**Error:** "node: command not found"
**Fix:**
```powershell
# Restart PowerShell
# Or manually add to PATH
```

### Issue: WSL2 Requires Restart
**Error:** "WSL2 installation incomplete"
**Fix:**
```powershell
Restart-Computer
# Then re-run script
```

### Issue: Claude Code Authentication Fails
**Error:** "Invalid API key"
**Fix:**
- Get fresh API key from console.anthropic.com/settings/keys
- Run: `claude auth login`
- Paste new key

---

## 📊 SUCCESS METRICS

**Goal:** Validate that the toolkit can onboard a client in under 60 minutes.

Track:
- ⏱️ **Total Time:** Start to finish
- ✅ **Completion Rate:** Did all tools install?
- 🐛 **Error Count:** How many errors encountered?
- 💬 **Support Needed:** Did you need to troubleshoot?
- 📝 **Documentation Quality:** Were instructions clear?

**Target:**
- Time: < 60 minutes
- Completion: 100%
- Errors: 0-2 minor
- Support: Minimal
- Documentation: Clear

---

## 📞 SUPPORT

If you encounter issues during testing:

1. **Check Known Issues:** `scripts/windows/IMPLEMENTATION_STATUS.md`
2. **Review Logs:** Windows Event Viewer
3. **Screenshot Errors:** Save for documentation
4. **Note Time Spent:** Track bottlenecks

---

## 🎯 NEXT STEPS AFTER TESTING

### If Successful:
1. Document what worked well
2. Update scripts if needed
3. Add to test case documentation
4. Ready for real client testing

### If Issues Found:
1. Document all errors
2. Note unclear instructions
3. Identify bottlenecks
4. Create issue tickets
5. Fix and re-test

---

**Testing Time Estimate:**
- Option 1 (Fresh Install): 1-1.5 hours
- Option 2 (Mirror Setup): 30-45 minutes
- Option 3 (Remote Access): 1-2 hours

**Recommended:** Start with Option 1 (fresh install test) to validate the real client experience.

---

**Files Attached to Email:**
1. This guide (LAPTOP-TEST-SETUP-GUIDE.md)
2. Windows script (setup-windows.ps1)
3. Backup script (backup-claude-setup.ps1)
4. Restore script (restore-claude-setup.ps1)
5. Test checklist (TEST-CHECKLIST.md)

**Live Resources:**
- Dashboard: https://ai-consultant-toolkit.vercel.app
- GitHub: https://github.com/PerryB-GIT/ai-consultant-toolkit
- Documentation: See repo /docs folder

---

**Good luck with testing!** 🚀

Let me know if you find any issues or have suggestions for improvement.

— Perry & Claude
