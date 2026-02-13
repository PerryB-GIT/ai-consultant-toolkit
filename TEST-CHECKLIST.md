# Test Laptop - Validation Checklist

**Tester:** Perry Bailes
**Date:** _______________
**Laptop Model:** _______________
**Windows Version:** _______________

---

## ⏱️ TIME TRACKING

| Phase | Start Time | End Time | Duration | Notes |
|-------|------------|----------|----------|-------|
| Prerequisites | | | | |
| Script Download | | | | |
| Script Execution | | | | |
| Tool Verification | | | | |
| Dashboard Testing | | | | |
| Claude Setup | | | | |
| **TOTAL** | | | | **Target: <60 min** |

---

## ✅ PHASE 1: Prerequisites (Target: 10 min)

- [ ] Windows 10/11 confirmed
- [ ] Administrator access confirmed
- [ ] Internet connection stable
- [ ] Antivirus temporarily disabled (if needed)
- [ ] PowerShell version 5.1 or higher

**Issues Encountered:**
```
(None / List any)
```

---

## ✅ PHASE 2: Script Download (Target: 2 min)

- [ ] Visited GitHub repo
- [ ] Downloaded setup-windows.ps1
- [ ] Saved to accessible location
- [ ] File size verified (~2-3 KB)

**Download Method Used:**
- [ ] Direct GitHub download
- [ ] PowerShell Invoke-WebRequest
- [ ] Transferred from USB
- [ ] Other: _______________

**Issues Encountered:**
```
(None / List any)
```

---

## ✅ PHASE 3: Script Execution (Target: 30 min)

### Pre-Execution
- [ ] Opened PowerShell as Administrator
- [ ] Set execution policy: `Set-ExecutionPolicy Bypass -Scope Process -Force`
- [ ] Navigated to script directory
- [ ] Ran: `.\setup-windows.ps1`

### During Execution
- [ ] Chocolatey installation started
- [ ] Git installation started
- [ ] Node.js installation started
- [ ] Python installation started
- [ ] WSL2 installation started (if applicable)
- [ ] Claude Code installation started
- [ ] Docker prompt appeared (if included)

### Post-Execution
- [ ] Script completed without fatal errors
- [ ] setup-results.json generated
- [ ] JSON file location noted: _______________

**Warnings/Errors:**
```
(List any warnings or errors with timestamps)
```

**Restart Required?** [ ] Yes [ ] No
- If yes, restarted at: _______________

---

## ✅ PHASE 4: Tool Verification (Target: 10 min)

### Chocolatey
- [ ] Installed: `choco --version`
- [ ] Version: _______________

### Git
- [ ] Installed: `git --version`
- [ ] Version: _______________
- [ ] GitBash available: [ ] Yes [ ] No

### Node.js & npm
- [ ] Node installed: `node --version`
- [ ] Node version: _______________
- [ ] npm installed: `npm --version`
- [ ] npm version: _______________

### Python
- [ ] Python installed: `python --version`
- [ ] Python version: _______________
- [ ] pip installed: `pip --version`
- [ ] pip version: _______________

### WSL2
- [ ] WSL2 installed: `wsl --version`
- [ ] Ubuntu/Debian available: [ ] Yes [ ] No

### Claude Code CLI
- [ ] Installed: `claude --version`
- [ ] Version: _______________

### Docker (if installed)
- [ ] Docker Desktop installed: [ ] Yes [ ] No [ ] Skipped
- [ ] Version: _______________

**Issues Encountered:**
```
(Tools not found, version mismatches, PATH issues, etc.)
```

---

## ✅ PHASE 5: Dashboard Testing (Target: 10 min)

### Access Dashboard
- [ ] Visited: https://ai-consultant-toolkit.vercel.app
- [ ] Page loaded successfully
- [ ] Support Forge theme visible (purple/black)
- [ ] ProgressBar component displayed

### Upload JSON
- [ ] Located setup-results.json
- [ ] Uploaded to dashboard
- [ ] Upload successful
- [ ] Validation API responded
- [ ] Response time: _______________

### Review Results
- [ ] Validation status shown: [ ] Valid [ ] Invalid
- [ ] Tool statistics displayed
- [ ] Issues listed (if any)
- [ ] Recommendations provided
- [ ] Results make sense

**API Response:**
```json
(Paste validation response)
```

**Issues Encountered:**
```
(Upload failures, API errors, incorrect validation, etc.)
```

---

## ✅ PHASE 6: Claude Code Setup (Target: 15 min)

### Authentication
- [ ] Ran: `claude auth login`
- [ ] Anthropic API key entered
- [ ] Authentication successful
- [ ] Test command: `claude --version` works

### Basic Testing
- [ ] Started chat: `claude`
- [ ] Received response
- [ ] Tested basic prompt
- [ ] Exited successfully

**Issues Encountered:**
```
(Auth failures, API key issues, connection errors, etc.)
```

---

## ✅ PHASE 7: Full Environment Setup (Target: 30 min)

### AWS CLI
- [ ] Installed: `aws --version`
- [ ] Authenticated: `aws configure`
- [ ] Test: `aws sts get-caller-identity` works

### GCP CLI
- [ ] Installed: `gcloud --version`
- [ ] Authenticated: `gcloud auth login`
- [ ] Test: `gcloud projects list` works

### GitHub CLI
- [ ] Installed: `gh --version`
- [ ] Authenticated: `gh auth login`
- [ ] Test: `gh repo list` works

### MCP Servers
- [ ] Transferred MCP config from main laptop: [ ] Yes [ ] No
- [ ] MCPs configured in `~/.claude/settings.json`
- [ ] Tested MCP connection: [ ] Success [ ] Failed

### Custom Skills
- [ ] Transferred skills from main laptop: [ ] Yes [ ] No
- [ ] Skills location: `~/.claude/skills/`
- [ ] Skill count: _______________
- [ ] Tested sample skill: [ ] Success [ ] Failed

**Issues Encountered:**
```
(Authentication failures, MCP issues, skill problems, etc.)
```

---

## 📊 OVERALL ASSESSMENT

### Success Criteria

**Time:** _____ minutes (Target: <60)
- [ ] Met target [ ] Exceeded target

**Completion Rate:** _____ / _____ tools installed
- [ ] 100% [ ] 90-99% [ ] <90%

**Error Count:** _____ errors
- [ ] 0 errors [ ] 1-2 minor [ ] 3+ errors

**Documentation Quality:**
- [ ] Excellent - clear and complete
- [ ] Good - mostly clear with minor gaps
- [ ] Fair - some confusion
- [ ] Poor - needs significant improvement

### Would You Recommend This to a Client?
- [ ] Yes, ready for production
- [ ] Yes, with minor improvements
- [ ] No, needs significant work
- [ ] No, fundamentally flawed

**Reasoning:**
```
(Explain your recommendation)
```

---

## 🐛 BUGS & ISSUES FOUND

### Critical Issues (Blockers)
```
1. (Issue description, steps to reproduce)
2.
```

### Major Issues (Significant delays)
```
1.
2.
```

### Minor Issues (Annoying but not blocking)
```
1.
2.
```

---

## 💡 IMPROVEMENT SUGGESTIONS

### Script Improvements
```
1.
2.
```

### Documentation Improvements
```
1.
2.
```

### Dashboard Improvements
```
1.
2.
```

### Process Improvements
```
1.
2.
```

---

## 📸 SCREENSHOTS

**Captured screenshots of:**
- [ ] Dashboard home page
- [ ] ProgressBar component
- [ ] JSON upload result
- [ ] API validation response
- [ ] Any errors encountered
- [ ] Final installed tools list

**Screenshot location:** _______________

---

## ✅ SIGN-OFF

**Test Completed By:** _______________
**Date:** _______________
**Time:** _______________

**Overall Result:**
- [ ] PASS - Ready for client testing
- [ ] PASS WITH ISSUES - Needs fixes before client testing
- [ ] FAIL - Significant rework required

**Signature:** _______________

---

**Next Steps:**
1. Document all findings in GitHub issues
2. Update scripts based on feedback
3. Re-test if changes made
4. Schedule real client pilot test

**Files to Include with Report:**
- [ ] This completed checklist
- [ ] setup-results.json
- [ ] Screenshots (if any)
- [ ] Error logs (if any)
- [ ] Video recording (optional)
