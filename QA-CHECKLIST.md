# AI Consultant Toolkit - QA Checklist

## Pre-Flight Testing (Before Party)

### 1. Dashboard Homepage ✅
- [x] Loads at https://ai-consultant-toolkit.vercel.app
- [x] Download buttons work (macOS and Windows)
- [x] Progress bar displays correctly
- [x] All 11 steps visible
- [x] File upload component visible

### 2. API Endpoints ✅
- [x] POST /api/progress/[sessionId] - accepts progress data
- [x] GET /api/progress/[sessionId] - retrieves session data
- [x] POST /api/progress/[sessionId]/log - accepts error logs
- [x] POST /api/validate-output - validates Phase 1 results
- [x] POST /api/validate-output - validates Phase 2 results

### 3. Live Dashboard ✅
- [x] /live/[sessionId] loads and connects
- [x] Polls every 2 seconds for updates
- [x] Displays current action
- [x] Shows tool statuses
- [x] Auto-redirects when complete=true

### 4. Results Page ✅
- [x] Displays Phase 1 results correctly
- [x] Displays Phase 2 results correctly
- [x] Shows stats (ok, error, skipped, total)
- [x] Lists recommendations
- [x] Phase 2 promotion visible
- [x] Download buttons for Phase 2 scripts

### 5. Real Setup Script (Windows) ✅
- [x] Generates session ID
- [x] Prints live dashboard URL
- [x] Sends progress updates to API
- [x] completedSteps uses numbers not strings
- [x] Error logging with suggested fixes
- [x] Graceful degradation (works offline)

## Test Passes for Party

### Test User 1: Fresh Windows Install
**Session ID:** Will be generated on run
**What to test:**
- Run setup-windows.ps1
- Watch live dashboard in browser
- Verify all tools install
- Check results page after completion

### Test User 2: Partial Install (Some tools already exist)
**Session ID:** Will be generated on run
**What to test:**
- Run on machine with Git/Node already installed
- Verify script skips existing tools
- Check that progress still tracks correctly
- Confirm results show "already installed" status

### Test User 3: Error Scenario (Simulate failure)
**Session ID:** Will be generated on run
**What to test:**
- Disconnect internet mid-install
- Verify error logging works
- Check that suggested fixes display
- Confirm script continues to completion

## Critical User Journey

1. **Email Received** → User gets onboarding email
2. **Dashboard Visit** → Opens https://ai-consultant-toolkit.vercel.app
3. **Download Script** → Downloads setup-windows.ps1
4. **Run Script** → Right-click → Run with PowerShell (as Admin)
5. **Copy URL** → Script prints live dashboard URL
6. **Watch Progress** → Opens URL in browser, sees real-time updates
7. **Completion** → Auto-redirects to results page
8. **Next Steps** → Sees Phase 2 promotion and downloads Phase 2 script

## Known Issues to Watch For

### Fixed (Should NOT occur):
- ✅ completedSteps sending strings instead of numbers
- ✅ Results page crashing on auto-redirect
- ✅ Progress API returning 500 errors (KV now configured)

### Potential Issues (Monitor):
- ⚠️ Chocolatey install can be slow (2-3 minutes)
- ⚠️ WSL2 may require restart
- ⚠️ Docker Desktop requires manual download if Chocolatey fails
- ⚠️ Claude Code installation needs npm (installed by Node.js first)

## Success Metrics

**Phase 1 Complete = Success if:**
- [ ] Live dashboard showed all 8 tool installations
- [ ] Results page loaded without errors
- [ ] User can see what installed successfully vs errors
- [ ] User received clear next steps

**Full Success = Phase 2 Complete if:**
- [ ] All 5 skills installed
- [ ] EA persona configured
- [ ] MCP servers set up
- [ ] User can run `claude` command

## Quick Test Commands

### Test Progress API:
```bash
# Test session
curl -X POST https://ai-consultant-toolkit.vercel.app/api/progress/test-123 \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","currentStep":1,"completedSteps":[],"currentAction":"Testing","toolStatus":{},"errors":[],"timestamp":"2026-02-15T12:00:00Z","phase":"phase1","complete":false}'

# Get session
curl https://ai-consultant-toolkit.vercel.app/api/progress/test-123
```

### Test Live Dashboard:
```bash
# Run mock test
cd C:/Users/Jakeb/ai-consultant-toolkit-web
powershell -ExecutionPolicy Bypass -File ./test-live-progress.ps1
```

## Party Test Protocol

### Setup (Before someone arrives):
1. Have email ready to send to test user
2. Bookmark https://ai-consultant-toolkit.vercel.app
3. Have test laptop ready (Windows 10/11)

### During Test:
1. Send onboarding email to test user
2. Have them open dashboard on their phone
3. Run setup-windows.ps1 on test laptop
4. Watch live dashboard update in real-time
5. Take photos/video of:
   - Terminal showing progress
   - Browser showing live dashboard
   - Results page after completion

### After Test:
1. Ask user for feedback
2. Note any errors or confusion
3. Check if they understood next steps
4. Get testimonial if it worked well!

## Rollback Plan

If something breaks during party testing:
1. Previous working deployment: https://github.com/PerryB-GIT/ai-consultant-toolkit/commit/1e248cf
2. Can revert via Vercel dashboard
3. Offline mode: Script still generates setup-results.json for manual validation

---

**Last Updated:** 2026-02-15
**Status:** ✅ Production Ready
**Tested By:** Claude Sonnet 4.5
**Live URL:** https://ai-consultant-toolkit.vercel.app
