# Vercel KV Setup Instructions

**Project:** AI Consultant Toolkit
**Required for:** Real-time progress tracking
**Time:** 5 minutes

---

## Step-by-Step Setup

### 1. Open Vercel Dashboard
```
https://vercel.com/perryb-git/ai-consultant-toolkit
```

### 2. Navigate to Storage Tab
- Click on your project: **ai-consultant-toolkit**
- Click the **Storage** tab in the top navigation

### 3. Create KV Database
- Click **Create Database**
- Select **KV** (Redis-compatible key-value store)
- Click **Continue**

### 4. Configure Database
**Name:** `ai-toolkit-progress` (or any name you prefer)

**Region:** Select closest to your users
- **Recommended:** `iad1` (Washington D.C., USA East)
- **Alternative:** `sfo1` (San Francisco, USA West)

**Plan:** Free (included)
- Storage: 256 MB
- Requests: 3,000/day (plenty for this use case)

### 5. Connect to Project
- Check the box: **Connect to ai-consultant-toolkit**
- Click **Create & Continue**

### 6. Environment Variables (Auto-Injected)
Vercel automatically adds these to your project:
```
KV_REST_API_URL=https://...upstash.io
KV_REST_API_TOKEN=***
```

**No manual configuration needed!** ✅

### 7. Deploy (Auto-Deploy Already Running)
Since you just pushed to GitHub, Vercel is already deploying. The new environment variables will be available on the next deployment.

**Check deployment status:**
```
https://vercel.com/perryb-git/ai-consultant-toolkit/deployments
```

---

## Verification

### Test the API Endpoints

**1. Check if KV is connected:**
```bash
curl https://ai-consultant-toolkit.vercel.app/api/progress/test-123
# Expected: {"error": "Session not found"}
# This confirms KV is working (404 is expected for non-existent session)
```

**2. Create a test session:**
```bash
curl -X POST https://ai-consultant-toolkit.vercel.app/api/progress/test-123 \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "currentStep": 1,
    "completedSteps": [],
    "currentAction": "Testing KV setup",
    "toolStatus": {},
    "errors": [],
    "timestamp": "2026-02-15T12:00:00Z",
    "phase": "phase1",
    "complete": false
  }'

# Expected: 200 OK
```

**3. Retrieve the session:**
```bash
curl https://ai-consultant-toolkit.vercel.app/api/progress/test-123
# Expected: Returns the progress data you just posted
```

**4. Test the live dashboard:**
```
https://ai-consultant-toolkit.vercel.app/live/test-123
# Should show the test progress
```

---

## Testing with PowerShell Script

Run the test script to simulate a full setup:

```powershell
cd C:/Users/Jakeb/ai-consultant-toolkit-web/scripts/windows
.\test-progress-updates.ps1
```

This will:
1. Generate a session ID
2. Print the live dashboard URL
3. Send simulated progress updates
4. You can watch in real-time!

---

## Troubleshooting

### "Environment variables not found"
**Cause:** Vercel hasn't redeployed with new env vars yet

**Fix:**
1. Wait for current deployment to finish
2. Or trigger manual redeploy:
   ```bash
   cd C:/Users/Jakeb/ai-consultant-toolkit-web
   git commit --allow-empty -m "chore: trigger redeploy for KV env vars"
   git push origin main
   ```

### "Session not found" on POST
**Cause:** KV not properly connected

**Fix:**
1. Go to Vercel Dashboard → Storage
2. Click on your KV database
3. Verify it shows "Connected to ai-consultant-toolkit"
4. If not, click "Connect to Project" and select ai-consultant-toolkit

### API returns 500 errors
**Cause:** Missing environment variables

**Fix:**
1. Vercel Dashboard → Project Settings → Environment Variables
2. Verify these exist:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
3. If missing, reconnect KV database to project

---

## Quick Verification Checklist

- [ ] Vercel KV database created
- [ ] Database connected to ai-consultant-toolkit project
- [ ] Environment variables auto-injected (KV_REST_API_URL, KV_REST_API_TOKEN)
- [ ] Deployment finished (check deployments tab)
- [ ] Test API endpoint returns 404 (not 500)
- [ ] Can POST progress data successfully
- [ ] Live dashboard loads at /live/[sessionId]

---

## What Happens Next

Once KV is set up:

1. **Windows users** run `setup-windows.ps1`
2. Script prints: "📊 View live progress at: https://ai-consultant-toolkit.vercel.app/live/abc-123"
3. User opens link in browser
4. Dashboard polls every 2 seconds
5. User sees real-time progress updates
6. Script completes → Auto-redirects to results page

---

## Cost

**Free Tier Limits:**
- Storage: 256 MB
- Requests: 3,000/day
- Bandwidth: Unlimited

**Typical Usage:**
- 1 setup session = ~25-30 requests
- Storage per session: ~5 KB
- Can handle **100+ setups per day** on free tier

**Cost:** $0/month ✅

---

## Visual Guide

### Creating KV Database:

```
Vercel Dashboard
  └─ Projects
      └─ ai-consultant-toolkit
          └─ Storage tab
              └─ Create Database button
                  └─ Select "KV"
                      └─ Name: ai-toolkit-progress
                      └─ Region: iad1
                      └─ [✓] Connect to ai-consultant-toolkit
                      └─ Create & Continue
```

### Result:
```
✓ KV Database created
✓ Environment variables injected
✓ Ready for deployment
```

---

## Support

If you encounter issues:

1. **Check deployment logs:**
   ```
   https://vercel.com/perryb-git/ai-consultant-toolkit/deployments
   ```

2. **Check KV dashboard:**
   ```
   https://vercel.com/perryb-git/ai-consultant-toolkit/stores
   ```

3. **Test with example script:**
   ```powershell
   .\scripts\test-progress-api.js https://ai-consultant-toolkit.vercel.app
   ```

---

**Setup Time:** ~5 minutes
**Difficulty:** Easy
**Prerequisites:** None (just need Vercel project access)

Ready to test! 🚀
