# Testing Guide - AI Consultant Toolkit

Complete guide for testing the end-to-end onboarding flow.

---

## 🎯 Quick Start (5-Minute Test)

Test the validation API and dashboard without running the full setup script.

### Step 1: Use Mock Data

```bash
# Navigate to project
cd C:/Users/Jakeb/workspace/ai-consultant-toolkit

# Copy mock test file
cp scripts/test-data/mock-success.json ~/setup-results.json
```

### Step 2: Test the Dashboard

1. Visit: **https://ai-consultant-toolkit.vercel.app**
2. Click "Upload Results" or navigate to `/results`
3. Upload `mock-success.json`
4. Verify the validation results display correctly

### Expected Results:

✅ **Valid: true**
- Summary: "8/8 tools installed successfully"
- Stats: { ok: 8, error: 0, skipped: 0, total: 8 }
- Recommendations: "All requirements met. Proceed to CLI authentication."

---

## 🧪 Full Test (Mac/Windows Script Execution)

Test the actual setup scripts and end-to-end flow.

### Windows Testing

#### Prerequisites:
- Windows 10/11
- Administrator access
- Internet connection
- 30-60 minutes available

#### Steps:

```powershell
# 1. Download the script
cd C:\temp
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-windows.ps1" -OutFile "setup-windows.ps1"

# 2. Run as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force
.\setup-windows.ps1

# Expected output: setup-results.json at C:\Users\YourName\setup-results.json
```

#### 3. Validate Results

```powershell
# Check the JSON file
cat ~/setup-results.json

# Upload to dashboard
# Visit: https://ai-consultant-toolkit.vercel.app/results
# Upload the JSON file
```

---

### macOS Testing

#### Prerequisites:
- macOS 11+
- Terminal access
- Internet connection
- 20-40 minutes available

#### Steps:

```bash
# 1. Download the script
cd ~/Downloads
curl -o setup-mac.sh https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/mac/setup-mac.sh

# 2. Make executable and run
chmod +x setup-mac.sh
./setup-mac.sh

# Expected output: setup-results.json at ~/setup-results.json
```

#### 3. Validate Results

```bash
# Check the JSON file
cat ~/setup-results.json

# Upload to dashboard
# Visit: https://ai-consultant-toolkit.vercel.app/results
# Upload the JSON file
```

---

## 📋 Expected Results at Each Step

### 1. Script Execution Phase

**Windows:**
```
================================================================
   AI Consultant Toolkit - Windows Setup
================================================================

> Checking Chocolatey...
  [OK] Chocolatey already installed (2.3.0)

> Checking Git...
  [OK] Git already installed (2.43.0)

> Checking GitHub CLI...
  [OK] GitHub CLI already installed (2.42.0)

> Checking Node.js...
  [OK] Node.js already installed (20.11.0)

> Checking Python...
  [OK] Python already installed (3.11.8)

> Checking WSL2...
  [OK] WSL2 already installed (2.0.0)

> Checking Claude Code CLI...
  [INFO] Installing Claude Code via npm...
  [OK] Claude Code installed (2.1.0)

> Checking Docker Desktop...
  [OK] Docker already installed (25.0.3)

================================================================
   Setup Complete!
================================================================
Results: C:\Users\Perry\setup-results.json
Duration: 145.32s
```

**macOS:**
```
AI Consultant Toolkit - macOS Setup
System: macOS 14.3.0 (Apple Silicon)

[INFO] Checking Homebrew...
[OK] Homebrew installed (4.2.5)

[INFO] Checking Git...
[OK] Git installed (2.43.0)

[INFO] Checking GitHub CLI...
[OK] GitHub CLI installed (2.42.0)

[INFO] Checking Node.js...
[OK] Node.js installed (20.11.0)

[INFO] Checking Python...
[OK] Python installed (3.12.1)

[INFO] Checking Claude Code...
[INFO] Installing Claude Code via npm...
[OK] Claude Code installed (2.1.0)

[INFO] Checking Docker...
[OK] Docker installed (25.0.3)

Setup complete! Results: /Users/perry/setup-results.json
Duration: 89s
```

### 2. JSON Output Structure

```json
{
  "os": "Windows 11 Pro 10.0.22631",
  "architecture": "x64",
  "timestamp": "2026-02-13T18:30:45Z",
  "results": {
    "chocolatey": { "status": "OK", "version": "2.3.0", "installed": false },
    "git": { "status": "OK", "version": "2.43.0", "installed": false },
    "github_cli": { "status": "OK", "version": "2.42.0", "installed": false },
    "nodejs": { "status": "OK", "version": "20.11.0", "installed": false },
    "python": { "status": "OK", "version": "3.11.8", "installed": false },
    "wsl2": { "status": "OK", "version": "2.0.0", "installed": false, "restart_required": false },
    "claude": { "status": "OK", "version": "2.1.0", "installed": true },
    "docker": { "status": "OK", "version": "25.0.3", "installed": false }
  },
  "errors": [],
  "duration_seconds": 145.32
}
```

### 3. Validation API Response

**Request:**
```bash
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @setup-results.json
```

**Response (Success):**
```json
{
  "valid": true,
  "summary": "8/8 tools installed successfully",
  "stats": {
    "ok": 8,
    "error": 0,
    "skipped": 0,
    "total": 8
  },
  "issues": [],
  "recommendations": [
    "All requirements met. Proceed to CLI authentication."
  ],
  "os": "Windows 11 Pro 10.0.22631",
  "duration": 145.32
}
```

**Response (Partial Success with Version Issues):**
```json
{
  "valid": false,
  "summary": "7/8 tools installed successfully",
  "stats": {
    "ok": 7,
    "error": 0,
    "skipped": 1,
    "total": 8
  },
  "issues": [
    "Node.js version 16.14.0 is below minimum required 18.0.0"
  ],
  "recommendations": [
    "Node.js version is outdated. Update to v18+ via: choco upgrade nodejs-lts -y",
    "1 optional tool(s) were skipped."
  ],
  "os": "Windows 11 Pro 10.0.22631",
  "duration": 89.45
}
```

**Response (Multiple Errors):**
```json
{
  "valid": false,
  "summary": "5/8 tools installed successfully",
  "stats": {
    "ok": 5,
    "error": 3,
    "skipped": 0,
    "total": 8
  },
  "issues": [
    "Claude CLI installation failed. Try: npm install -g @anthropic-ai/claude-code",
    "Docker Desktop installation failed"
  ],
  "recommendations": [
    "3 tool(s) failed to install: claude, docker, wsl2",
    "Try running the setup script again with administrator privileges",
    "Claude CLI installation failed. Try: npm install -g @anthropic-ai/claude-code",
    "WSL2 installation may require a system restart. Please restart and run the script again"
  ],
  "os": "Windows 11 Pro 10.0.22631",
  "duration": 234.67
}
```

### 4. Dashboard Display

The `/results` page should display:

**Header:**
```
✅ Setup Validation Results
Validation Status: SUCCESS
```

**Summary Card:**
```
Summary: 8/8 tools installed successfully
Operating System: Windows 11 Pro 10.0.22631
Duration: 145.32 seconds
```

**Tool Status Table:**
| Tool | Status | Version | Installed |
|------|--------|---------|-----------|
| Chocolatey | ✅ OK | 2.3.0 | No (Already present) |
| Git | ✅ OK | 2.43.0 | No (Already present) |
| GitHub CLI | ✅ OK | 2.42.0 | No (Already present) |
| Node.js | ✅ OK | 20.11.0 | No (Already present) |
| Python | ✅ OK | 3.11.8 | No (Already present) |
| WSL2 | ✅ OK | 2.0.0 | No (Already present) |
| Claude Code | ✅ OK | 2.1.0 | Yes (Newly installed) |
| Docker | ✅ OK | 25.0.3 | No (Already present) |

**Recommendations:**
```
✅ All requirements met. Proceed to CLI authentication.
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: PowerShell Execution Policy

**Error:**
```
setup-windows.ps1 cannot be loaded because running scripts is disabled on this system
```

**Fix:**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
```

### Issue 2: Script Not Running as Administrator

**Error:**
```
#Requires -RunAsAdministrator
The script 'setup-windows.ps1' cannot be run because it requires elevation
```

**Fix:**
```powershell
# Right-click PowerShell → Run as Administrator
# Then run the script
.\setup-windows.ps1
```

### Issue 3: Chocolatey Install Fails

**Error:**
```
[FAIL] Chocolatey install failed: The remote server returned an error: (403) Forbidden
```

**Fix:**
```powershell
# Manually install Chocolatey first
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Then run setup script again
.\setup-windows.ps1
```

### Issue 4: Node.js Not Found After Install

**Error:**
```
node: command not found
```

**Fix:**
```powershell
# Refresh environment variables
refreshenv
# OR restart PowerShell
```

### Issue 5: Claude CLI Install Fails

**Error:**
```
npm ERR! code EACCES
npm ERR! syscall access
```

**Fix:**
```powershell
# Run PowerShell as Administrator
npm install -g @anthropic-ai/claude-code --force
```

### Issue 6: WSL2 Requires Restart

**Error:**
```
[WARN] You must restart Windows to complete WSL2 installation
```

**Fix:**
```powershell
Restart-Computer
# After restart, run script again if needed
```

### Issue 7: Docker Desktop Won't Start

**Error:**
```
Docker Desktop requires WSL2
```

**Fix:**
1. Ensure WSL2 is installed (check script output)
2. Restart computer if WSL2 was just installed
3. Manually start Docker Desktop from Start Menu
4. Enable "Use WSL2 based engine" in Docker Desktop settings

### Issue 8: Dashboard Upload Fails

**Error:**
```
Failed to upload file
```

**Fix:**
1. Check file is valid JSON: `cat ~/setup-results.json | jq .`
2. Check file size (should be < 1MB)
3. Try uploading via cURL:
```bash
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @setup-results.json
```

### Issue 9: Validation API Returns 400

**Error:**
```json
{
  "valid": false,
  "error": "Invalid JSON format",
  "details": [...]
}
```

**Fix:**
1. Validate JSON syntax: `cat setup-results.json | jq .`
2. Check required fields are present (os, timestamp, results, errors, duration_seconds)
3. Ensure all tool results have status, version, and installed fields

### Issue 10: Homebrew PATH Issues (macOS)

**Error:**
```
brew: command not found
```

**Fix (Apple Silicon):**
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

**Fix (Intel):**
```bash
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

---

## ✅ Success Criteria Checklist

### Script Execution:
- [ ] Script completes without errors
- [ ] setup-results.json file is generated
- [ ] All required tools show status: "OK" or "SKIPPED"
- [ ] Duration is reasonable (< 10 minutes for existing tools, < 60 min for fresh install)

### JSON Output:
- [ ] Valid JSON syntax
- [ ] Contains all required fields (os, timestamp, results, errors, duration_seconds)
- [ ] Each tool result has status, version, installed fields
- [ ] Errors array is empty (or contains expected warnings)

### Validation API:
- [ ] API accepts the JSON
- [ ] Returns valid: true (if no critical issues)
- [ ] Provides accurate summary stats
- [ ] Lists all issues (if any)
- [ ] Provides helpful recommendations

### Dashboard:
- [ ] Upload accepts the file
- [ ] Validation results display correctly
- [ ] Tool status table shows all tools
- [ ] Recommendations are helpful
- [ ] UI is responsive (mobile + desktop)

### Post-Setup:
- [ ] Can run: `claude --version`
- [ ] Can authenticate: `claude auth login`
- [ ] Can start chat: `claude`
- [ ] GitHub CLI works: `gh auth status`
- [ ] Docker works (if installed): `docker --version`

---

## 📊 Testing Scenarios

### Scenario 1: Fresh Windows Install (All Tools Missing)

**Setup:**
- Clean Windows 11 VM
- No dev tools installed

**Expected:**
- All tools install successfully
- Duration: 30-60 minutes
- Restart required for WSL2
- All tools marked as "installed": true

### Scenario 2: Partial Setup (Some Tools Present)

**Setup:**
- Windows with Git and Node.js already installed
- No Claude CLI or Docker

**Expected:**
- Git and Node.js marked as "installed": false
- Claude CLI and Docker install
- Duration: 5-15 minutes
- No restart required

### Scenario 3: Everything Already Installed

**Setup:**
- Full dev environment (all tools present)

**Expected:**
- All tools marked as "installed": false
- Duration: < 2 minutes
- No changes to system

### Scenario 4: Version Mismatch (Outdated Tools)

**Setup:**
- Node.js v16 installed (below minimum v18)

**Expected:**
- Validation fails: "Node.js version below minimum"
- Recommendation: "Update to v18+ via: choco upgrade nodejs-lts -y"

### Scenario 5: Critical Error (Missing Permissions)

**Setup:**
- Run script without Administrator privileges

**Expected:**
- Script fails early
- Error: "Requires elevation"
- No system changes

### Scenario 6: Network Issues (No Internet)

**Setup:**
- Disconnect network during Chocolatey install

**Expected:**
- Chocolatey install fails
- Error logged in errors array
- Script continues to check other tools
- Validation fails

---

## 🔧 Mock Data Testing

Use the test data files to quickly validate the API and dashboard without running scripts.

### Test Files:

#### 1. `mock-success.json` - Perfect Setup
- All 8 tools installed
- No errors
- Expected: valid: true

#### 2. `mock-partial.json` - Some Tools Missing
- Claude CLI and Docker missing
- All other tools present
- Expected: valid: true (optional tools can be missing)

#### 3. `mock-failure.json` - Critical Errors
- Node.js outdated (v16.0.0 < v18.0.0)
- Claude CLI failed to install
- Multiple errors
- Expected: valid: false

### Quick Test Commands:

```bash
# Test success scenario
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-success.json

# Test partial scenario
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-partial.json

# Test failure scenario
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-failure.json
```

---

## 📝 Test Documentation Template

When testing, document your results:

```markdown
# Test Run Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**OS:** Windows 11 / macOS 14.3
**Environment:** Fresh Install / Partial Setup / Full Setup

## Pre-Test State:
- [ ] List existing tools
- [ ] Note versions
- [ ] Document any custom configurations

## Test Execution:
- Start Time: HH:MM
- End Time: HH:MM
- Duration: XX minutes

## Results:
- Tools Installed: X/8
- Errors Encountered: X
- Validation Status: PASS/FAIL

## Issues Found:
1. Issue description
2. Issue description

## Recommendations:
- Update script to...
- Add better error handling for...
- Improve documentation on...

## Screenshots:
- Attach script output
- Attach validation results
- Attach dashboard UI

## Overall Assessment:
[PASS/FAIL] - Brief summary
```

---

## 🚀 Next Steps After Successful Testing

1. **Document Results:** Save test report
2. **Update Scripts:** Fix any issues found
3. **Update Documentation:** Improve unclear sections
4. **Create Tutorial Video:** Screen record the process
5. **Client Testing:** Test with real client (if ready)

---

## 📞 Support & Resources

- **Dashboard:** https://ai-consultant-toolkit.vercel.app
- **GitHub:** https://github.com/PerryB-GIT/ai-consultant-toolkit
- **Mac Script:** `scripts/mac/setup-mac.sh`
- **Windows Script:** `scripts/windows/setup-windows.ps1`
- **Mock Data:** `scripts/test-data/`
- **Laptop Testing Guide:** `LAPTOP-TEST-SETUP-GUIDE.md`

---

**Happy Testing!** 🎉
