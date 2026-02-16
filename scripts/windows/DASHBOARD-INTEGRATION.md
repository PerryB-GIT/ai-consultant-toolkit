# Dashboard Integration Guide

## How the Unified Dashboard Works with setup-windows.ps1

### Flow Overview

1. **User visits**: `https://ai-consultant-toolkit.vercel.app/setup`
2. **Dashboard generates** a unique session ID (e.g., `abc123-def456`)
3. **Dashboard displays** instructions with the session ID embedded
4. **User runs**: `.\setup-windows.ps1 -SessionId "abc123-def456"`
5. **Script sends** real-time progress updates to the dashboard
6. **Dashboard shows** live progress as the setup runs

### Session ID Handling

The script now supports two modes:

#### Mode 1: Standalone (Auto-generated Session ID)
```powershell
.\setup-windows.ps1
```
- Generates a new GUID session ID automatically
- Displays: "Generated new session ID: [guid]"
- User can manually navigate to dashboard to view

#### Mode 2: Dashboard-integrated (Provided Session ID)
```powershell
.\setup-windows.ps1 -SessionId "abc123-def456"
```
- Uses the session ID provided by the dashboard
- Displays: "Using provided session ID: abc123-def456"
- Dashboard auto-updates as script runs

### Dashboard URLs

The script now displays the unified dashboard URL:

**Start of script:**
```
==================================================
  Watch Live Progress:
  https://ai-consultant-toolkit.vercel.app/setup
==================================================
```

**End of script:**
```
==================================================
  Final Results:
  https://ai-consultant-toolkit.vercel.app/setup
==================================================
```

### API Endpoint

All progress updates are sent to:
```
https://ai-consultant-toolkit.vercel.app/api/progress/{sessionId}
```

The dashboard polls this endpoint to show real-time updates.

### Progress Updates

The script sends progress at key points:

| Step | Tool | Status Updates |
|------|------|----------------|
| 1 | Chocolatey | checking → installing → success/error |
| 2 | Git | checking → installing → success/error |
| 3 | GitHub CLI | checking → installing → success/error |
| 4 | Node.js | checking → installing → success/error |
| 5 | Python | checking → installing → success/error |
| 6 | WSL2 | checking → installing → success/error |
| 7 | Claude Code | checking → installing → success/error |
| 8 | Docker Desktop | checking → installing → success/error |
| 9 | Complete | - | final status |

### Error Logging

Errors are logged with:
- Tool name
- Error message
- Suggested fix
- Step number

These appear in real-time on the dashboard.

### Testing

#### Test 1: Standalone mode
```powershell
cd C:\Users\Jakeb\ai-consultant-toolkit-web\scripts\windows
.\setup-windows.ps1 -SkipDocker
```
Expected: Generates session ID, runs setup, displays dashboard URLs

#### Test 2: Dashboard-integrated mode
```powershell
cd C:\Users\Jakeb\ai-consultant-toolkit-web\scripts\windows
.\setup-windows.ps1 -SessionId "test-123" -SkipDocker
```
Expected: Uses "test-123" as session ID, sends updates to that session

#### Test 3: Skip Docker flag still works
```powershell
.\setup-windows.ps1 -SkipDocker
```
Expected: Skips Docker installation, completes other tools

### Backward Compatibility

The script maintains full backward compatibility:

- Works without any parameters (auto-generates session ID)
- `-SkipDocker` flag still works
- All existing functionality preserved
- Only addition is optional `-SessionId` parameter

### Future Enhancements

Potential improvements:

1. **QR Code**: Generate QR code in terminal linking to dashboard
2. **Clipboard**: Auto-copy dashboard URL to clipboard
3. **Browser Launch**: Option to auto-open dashboard in browser
4. **Webhook**: Send completion notification to user's email/phone

## Implementation Details

### Changes Made

1. **Parameter Addition**
   - Added optional `[string]$SessionId` parameter
   - Defaults to `$null` if not provided

2. **Session ID Logic**
   ```powershell
   if ([string]::IsNullOrWhiteSpace($SessionId)) {
       $script:sessionId = [guid]::NewGuid().ToString()
       Write-Host "Generated new session ID: $script:sessionId"
   } else {
       $script:sessionId = $SessionId
       Write-Host "Using provided session ID: $script:sessionId"
   }
   ```

3. **Dashboard URL Updates**
   - Changed from `/live/{sessionId}` to `/setup` (unified dashboard)
   - Updated display formatting with colored boxes
   - Shows URL at start and end of script

4. **API Endpoint**
   - Uses `$script:sessionId` variable throughout
   - Ensures consistency across all progress updates

### Security Considerations

- Session IDs are GUIDs (non-sequential, hard to guess)
- API only accepts POST requests with valid JSON
- No authentication required (progress data is non-sensitive)
- Session data expires after 24 hours (dashboard cleanup)

### Monitoring

To monitor active sessions:
1. Check Vercel logs for `/api/progress/*` endpoints
2. Review Redis/database for session records
3. Dashboard shows "Last Updated" timestamp

---

**Last Updated**: 2026-02-16
**Script Version**: 1.1.0 (Dashboard-integrated)
