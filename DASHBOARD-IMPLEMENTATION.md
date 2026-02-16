# Unified Setup Dashboard - Implementation Guide

## Overview

The unified `/setup` page shows real-time progress for Phase 1 Windows setup scripts.

## User Flow

### Step 1: User Arrives at Dashboard
```
URL: https://ai-consultant-toolkit.vercel.app/setup
```

Dashboard displays:
- Welcome message
- Platform detection (Windows/Mac/Linux)
- "Start Setup" button

### Step 2: Start Setup
User clicks "Start Setup" button:

1. **Generate Session ID**
   ```typescript
   const sessionId = crypto.randomUUID();
   ```

2. **Display Instructions**
   Show platform-specific command with embedded session ID:

   **Windows:**
   ```powershell
   # Open PowerShell as Administrator
   cd C:\Users\[YourUsername]\Downloads
   .\setup-windows.ps1 -SessionId "abc123-def456"
   ```

   **Mac:**
   ```bash
   cd ~/Downloads
   chmod +x setup-mac.sh
   ./setup-mac.sh --session-id abc123-def456
   ```

3. **Show Live Progress Section**
   Immediately show the progress tracking UI with:
   - Session ID display
   - Step progress (0/8 tools installed)
   - Real-time status updates
   - Error log (if any)

### Step 3: Script Runs
As the user runs the script:

1. **Script sends progress updates**
   ```
   POST /api/progress/{sessionId}
   {
     "currentStep": 1,
     "completedSteps": [],
     "currentAction": "Checking Chocolatey...",
     "toolStatus": {
       "chocolatey": { "status": "installing" }
     },
     "errors": [],
     "timestamp": "2026-02-16T10:30:00Z"
   }
   ```

2. **Dashboard polls for updates**
   ```typescript
   useEffect(() => {
     const interval = setInterval(async () => {
       const response = await fetch(`/api/progress/${sessionId}`);
       const data = await response.json();
       setProgress(data);
     }, 1000); // Poll every second

     return () => clearInterval(interval);
   }, [sessionId]);
   ```

3. **Real-time UI updates**
   - Progress bar advances
   - Tool statuses change (pending → installing → success/error)
   - Current action text updates
   - Errors appear in log

### Step 4: Completion
When script finishes:

1. **Final update sent**
   ```json
   {
     "complete": true,
     "currentStep": 9,
     "completedSteps": [1,2,3,4,5,6,7,8],
     "toolStatus": { /* all tools with final status */ }
   }
   ```

2. **Dashboard shows results**
   - Success message
   - Summary of installed tools
   - Any errors or warnings
   - Next steps button → Phase 2

## Dashboard UI Components

### 1. Session Header
```tsx
<div className="session-info">
  <p>Session ID: <code>{sessionId}</code></p>
  <p>Started: {startTime}</p>
  <p>Duration: {duration}</p>
</div>
```

### 2. Progress Bar
```tsx
<ProgressBar
  current={completedSteps.length}
  total={8}
  label={currentAction}
/>
```

### 3. Tool Status Grid
```tsx
<div className="tool-grid">
  {tools.map(tool => (
    <ToolCard
      key={tool.name}
      name={tool.name}
      status={toolStatus[tool.name]?.status || 'pending'}
      version={toolStatus[tool.name]?.version}
      error={toolStatus[tool.name]?.error}
    />
  ))}
</div>
```

### 4. Live Activity Log
```tsx
<div className="activity-log">
  {activities.map(activity => (
    <div className="activity-item">
      <span className="timestamp">{activity.timestamp}</span>
      <span className="action">{activity.action}</span>
    </div>
  ))}
</div>
```

### 5. Error Panel (if errors exist)
```tsx
{errors.length > 0 && (
  <div className="error-panel">
    <h3>Issues Detected</h3>
    {errors.map(error => (
      <ErrorCard
        tool={error.tool}
        message={error.message}
        suggestedFix={error.suggestedFix}
      />
    ))}
  </div>
)}
```

## API Routes Needed

### 1. POST /api/progress/:sessionId
Receives progress updates from setup script.

**Request:**
```json
{
  "sessionId": "abc123",
  "currentStep": 1,
  "completedSteps": [],
  "currentAction": "Installing Git...",
  "toolStatus": { "git": { "status": "installing" } },
  "errors": [],
  "timestamp": "2026-02-16T10:30:00Z",
  "phase": "phase1",
  "complete": false
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "abc123"
}
```

### 2. GET /api/progress/:sessionId
Retrieves current progress for dashboard polling.

**Response:**
```json
{
  "sessionId": "abc123",
  "currentStep": 3,
  "completedSteps": [1, 2],
  "currentAction": "Installing Node.js...",
  "toolStatus": {
    "chocolatey": { "status": "success", "version": "2.4.0" },
    "git": { "status": "success", "version": "2.47.1" },
    "nodejs": { "status": "installing" }
  },
  "errors": [],
  "complete": false,
  "startTime": "2026-02-16T10:25:00Z",
  "lastUpdate": "2026-02-16T10:30:00Z"
}
```

### 3. POST /api/progress/:sessionId/log
Receives error logs from script.

**Request:**
```json
{
  "tool": "docker",
  "error": "WSL2 not installed",
  "suggestedFix": "Install WSL2 first, then retry Docker",
  "timestamp": "2026-02-16T10:35:00Z",
  "step": 8
}
```

## Data Storage

### Redis (Recommended)
```typescript
// Store session data with 24-hour expiry
await redis.setex(
  `setup:${sessionId}`,
  86400, // 24 hours
  JSON.stringify(progressData)
);
```

### Vercel KV (Alternative)
```typescript
import { kv } from '@vercel/kv';

await kv.set(`setup:${sessionId}`, progressData, {
  ex: 86400 // 24 hours
});
```

## Testing the Integration

### Test 1: Happy Path
1. Open `/setup` page
2. Click "Start Setup"
3. Copy command with session ID
4. Run in PowerShell (with `-SkipDocker` for speed)
5. Verify dashboard updates in real-time
6. Confirm completion shows correctly

### Test 2: Error Handling
1. Start setup with invalid permissions (not admin)
2. Verify errors appear in dashboard
3. Check suggested fixes are displayed
4. Ensure partial progress is saved

### Test 3: Network Interruption
1. Start setup
2. Disconnect network mid-setup
3. Verify script continues (silently fails on API calls)
4. Reconnect network
5. Verify dashboard catches up

### Test 4: Multiple Sessions
1. Open two browser windows
2. Start setup in both (different session IDs)
3. Run both scripts simultaneously
4. Verify each dashboard shows only its own progress

## Security Considerations

1. **Session ID Validation**
   - Must be valid UUID format
   - No SQL injection risk (UUID is safe)

2. **Rate Limiting**
   - Limit progress updates to 10/second per session
   - Prevents API abuse

3. **Data Expiry**
   - Auto-delete session data after 24 hours
   - Prevents database bloat

4. **CORS**
   - Allow POST from any origin (public tool)
   - No authentication required (non-sensitive data)

## Next Steps

1. **Implement API routes** (`/api/progress/:sessionId`)
2. **Create dashboard UI** (`/setup` page)
3. **Test integration** with Windows script
4. **Add Mac support** (update `setup-mac.sh` similarly)
5. **Add Linux support** (update `setup-linux.sh`)

---

**Version**: 1.0.0
**Last Updated**: 2026-02-16
**Status**: Ready for implementation
