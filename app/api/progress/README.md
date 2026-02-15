# Progress Tracking API

Real-time progress tracking endpoints for AI Consultant Toolkit setup automation.

## Endpoints

### Store/Retrieve Progress

**POST** `/api/progress/[sessionId]`

Store or update progress data for a setup session.

**Request Body:**
```json
{
  "sessionId": "unique-session-id",
  "currentStep": 3,
  "completedSteps": [1, 2],
  "currentAction": "Installing Gmail MCP server",
  "toolStatus": {
    "gmail": { "status": "installing" },
    "calendar": { "status": "success", "version": "1.0.0" },
    "drive": { "status": "error", "error": "Authentication failed" }
  },
  "errors": [
    {
      "tool": "drive",
      "error": "Authentication failed",
      "suggestedFix": "Run: cd ~/mcp-servers/google-drive && npm run auth"
    }
  ],
  "timestamp": "2026-02-15T12:00:00Z",
  "phase": "phase1",
  "complete": false
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "unique-session-id"
}
```

---

**GET** `/api/progress/[sessionId]`

Retrieve current progress for a session.

**Response:**
```json
{
  "sessionId": "unique-session-id",
  "currentStep": 3,
  "completedSteps": [1, 2],
  "currentAction": "Installing Gmail MCP server",
  "toolStatus": { ... },
  "errors": [ ... ],
  "timestamp": "2026-02-15T12:00:00Z",
  "phase": "phase1",
  "complete": false
}
```

**404 Response:**
```json
{
  "error": "Session not found"
}
```

---

### Error Logging

**POST** `/api/progress/[sessionId]/log`

Append an error to the session's error log.

**Request Body:**
```json
{
  "tool": "gmail",
  "error": "npm install failed",
  "suggestedFix": "Run: npm cache clean --force && npm install",
  "timestamp": "2026-02-15T12:00:00Z",
  "step": 3
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "unique-session-id",
  "totalErrors": 2
}
```

---

**GET** `/api/progress/[sessionId]/log`

Retrieve all errors for a session.

**Response:**
```json
{
  "errors": [
    {
      "tool": "gmail",
      "error": "npm install failed",
      "suggestedFix": "Run: npm cache clean --force && npm install",
      "timestamp": "2026-02-15T12:00:00Z",
      "step": 3
    }
  ]
}
```

## Data Retention

- All progress data is stored in Vercel KV with a **1-hour TTL**
- After 1 hour, session data is automatically deleted
- For persistent storage, implement a separate database solution

## CORS

All endpoints support CORS for local script access:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Environment Variables

Vercel KV requires the following environment variables (automatically configured on Vercel):
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

For local development, create a Vercel KV store and add these to `.env.local`.

## Example Usage (PowerShell)

```powershell
# Store progress
$sessionId = "my-setup-session"
$progress = @{
  sessionId = $sessionId
  currentStep = 1
  completedSteps = @()
  currentAction = "Starting Phase 1"
  toolStatus = @{}
  errors = @()
  timestamp = (Get-Date -Format o)
  phase = "phase1"
  complete = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-domain.vercel.app/api/progress/$sessionId" `
  -Method POST `
  -Body $progress `
  -ContentType "application/json"

# Retrieve progress
$currentProgress = Invoke-RestMethod -Uri "https://your-domain.vercel.app/api/progress/$sessionId"

# Log an error
$errorEntry = @{
  tool = "gmail"
  error = "Install failed"
  suggestedFix = "Run npm install again"
  timestamp = (Get-Date -Format o)
  step = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-domain.vercel.app/api/progress/$sessionId/log" `
  -Method POST `
  -Body $errorEntry `
  -ContentType "application/json"

# Get all errors
$errors = Invoke-RestMethod -Uri "https://your-domain.vercel.app/api/progress/$sessionId/log"
```

## Example Usage (JavaScript/Node)

```javascript
const sessionId = 'my-setup-session';
const baseUrl = 'https://your-domain.vercel.app';

// Store progress
const progress = {
  sessionId,
  currentStep: 1,
  completedSteps: [],
  currentAction: 'Starting Phase 1',
  toolStatus: {},
  errors: [],
  timestamp: new Date().toISOString(),
  phase: 'phase1',
  complete: false,
};

await fetch(`${baseUrl}/api/progress/${sessionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(progress),
});

// Retrieve progress
const currentProgress = await fetch(`${baseUrl}/api/progress/${sessionId}`)
  .then(res => res.json());

// Log an error
const errorEntry = {
  tool: 'gmail',
  error: 'Install failed',
  suggestedFix: 'Run npm install again',
  timestamp: new Date().toISOString(),
  step: 1,
};

await fetch(`${baseUrl}/api/progress/${sessionId}/log`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(errorEntry),
});

// Get all errors
const errors = await fetch(`${baseUrl}/api/progress/${sessionId}/log`)
  .then(res => res.json());
```

## TypeScript Types

All types are available in `/types/progress.ts`:

```typescript
import type {
  ProgressData,
  ProgressError,
  ErrorLogEntry,
  ToolStatusInfo,
  ProgressResponse,
  ErrorLogResponse,
} from '@/types/progress';
```
