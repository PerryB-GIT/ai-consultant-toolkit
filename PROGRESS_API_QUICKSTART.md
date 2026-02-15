# Progress API Quick Start

## Setup (5 minutes)

### 1. Create Vercel KV Store

```bash
# Go to: https://vercel.com/dashboard/stores
# Click: Create Database → KV
# Name: ai-toolkit-progress
# Region: us-east-1 (or closest to you)
# Connect to: ai-consultant-toolkit-web
```

### 2. Deploy

```bash
vercel deploy --prod
```

That's it! Environment variables are auto-injected.

### 3. Test

```bash
node scripts/test-progress-api.js https://ai-consultant-toolkit-web.vercel.app
```

## API Endpoints

### Progress: `/api/progress/[sessionId]`

**Store:**
```bash
curl -X POST https://your-domain.vercel.app/api/progress/test-123 \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "currentStep": 1,
    "completedSteps": [],
    "currentAction": "Starting setup",
    "toolStatus": {},
    "errors": [],
    "timestamp": "2026-02-15T12:00:00Z",
    "phase": "phase1",
    "complete": false
  }'
```

**Get:**
```bash
curl https://your-domain.vercel.app/api/progress/test-123
```

### Error Log: `/api/progress/[sessionId]/log`

**Add:**
```bash
curl -X POST https://your-domain.vercel.app/api/progress/test-123/log \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "gmail",
    "error": "Install failed",
    "suggestedFix": "Run npm install again",
    "timestamp": "2026-02-15T12:00:00Z",
    "step": 1
  }'
```

**Get:**
```bash
curl https://your-domain.vercel.app/api/progress/test-123/log
```

## PowerShell Usage

```powershell
# Store progress
$sessionId = "my-session"
$progress = @{
    sessionId = $sessionId
    currentStep = 1
    completedSteps = @()
    currentAction = "Starting"
    toolStatus = @{}
    errors = @()
    timestamp = (Get-Date -Format o)
    phase = "phase1"
    complete = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-domain.vercel.app/api/progress/$sessionId" `
    -Method POST -Body $progress -ContentType "application/json"

# Get progress
$current = Invoke-RestMethod -Uri "https://your-domain.vercel.app/api/progress/$sessionId"
```

## Full Example

See: `scripts/example-progress-update.ps1`

```powershell
.\scripts\example-progress-update.ps1
```

## Troubleshooting

**"Cannot connect to KV"**
→ Set up Vercel KV in dashboard and deploy

**"Session not found (404)"**
→ Data expires after 1 hour or session doesn't exist

**CORS errors**
→ Already configured, should work from any origin

## Documentation

- Full API docs: `app/api/progress/README.md`
- Vercel KV setup: `app/api/progress/VERCEL_KV_SETUP.md`
- Implementation details: `PROGRESS_API_IMPLEMENTATION.md`
- TypeScript types: `types/progress.ts`
