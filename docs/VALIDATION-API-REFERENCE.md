# Validation API Reference

Complete documentation of the validation API endpoint at `/api/validate-output`.

**Endpoint:** `POST /api/validate-output`

**File:** `app/api/validate-output/route.ts`

---

## Overview

The validation API receives setup results JSON from the installation scripts and performs comprehensive validation, version checking, and troubleshooting recommendation generation.

---

## Request

### Method: POST

### Headers:
```
Content-Type: application/json
```

### Body (JSON):
```json
{
  "os": "string",
  "architecture": "string (optional)",
  "timestamp": "ISO-8601 string",
  "results": {
    "tool_name": {
      "status": "OK | ERROR | SKIPPED | skipped",
      "version": "string | null",
      "installed": boolean
    }
  },
  "errors": ["string"],
  "duration_seconds": number
}
```

### Example Request:
```bash
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d '{
    "os": "Windows 11 Pro 10.0.22631",
    "timestamp": "2026-02-13T18:30:45Z",
    "results": {
      "nodejs": { "status": "OK", "version": "20.11.0", "installed": false }
    },
    "errors": [],
    "duration_seconds": 145.32
  }'
```

---

## Response

### Success (200 OK):
```json
{
  "valid": boolean,
  "summary": "string",
  "stats": {
    "ok": number,
    "error": number,
    "skipped": number,
    "total": number
  },
  "issues": ["string"],
  "recommendations": ["string"],
  "os": "string",
  "duration": number
}
```

### Error (400 Bad Request):
```json
{
  "valid": false,
  "error": "Invalid JSON format",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["os"],
      "message": "Required"
    }
  ]
}
```

### Error (500 Internal Server Error):
```json
{
  "valid": false,
  "error": "Failed to process validation request",
  "details": "Error message"
}
```

---

## Validation Logic

### 1. Schema Validation (Zod)

```typescript
const ToolResultSchema = z.object({
  status: z.enum(['OK', 'ERROR', 'SKIPPED', 'skipped']),
  version: z.string().nullable(),
  installed: z.boolean(),
});

const SetupResultSchema = z.object({
  os: z.string(),
  architecture: z.string().optional(),
  timestamp: z.string(),
  results: z.record(z.string(), ToolResultSchema),
  errors: z.array(z.string()),
  duration_seconds: z.number(),
});
```

**Validates:**
- All required fields are present
- Field types are correct
- Status values are valid enums
- Version can be string or null
- Errors is an array of strings

**Fails if:**
- Missing required fields (os, timestamp, results, errors, duration_seconds)
- Incorrect data types
- Invalid status values (must be OK, ERROR, SKIPPED, or skipped)

---

### 2. Version Requirements Check

```typescript
const VERSION_REQUIREMENTS = {
  nodejs: { min: '18.0.0', name: 'Node.js' },
  python: { min: '3.10.0', name: 'Python' },
  claude: { min: '2.0.0', name: 'Claude Code CLI' },
};
```

**Validates:**
- Node.js >= 18.0.0
- Python >= 3.10.0
- Claude CLI >= 2.0.0

**Version Comparison:**
- Uses semantic versioning (major.minor.patch)
- Removes 'v' prefix if present
- Compares each segment numerically

**Example:**
```typescript
compareVersions('20.11.0', '18.0.0') → true
compareVersions('16.14.0', '18.0.0') → false
compareVersions('v2.1.0', '2.0.0') → true
```

---

### 3. Tool Status Counting

```typescript
const toolStats = {
  ok: 0,      // status === 'OK'
  error: 0,   // status === 'ERROR'
  skipped: 0, // status === 'SKIPPED' or 'skipped'
  total: Object.keys(results).length,
};
```

**Counts:**
- Total tools checked
- Successfully installed (OK)
- Failed installations (ERROR)
- Skipped installations (SKIPPED)

---

### 4. Error Detection

**Collects errors from two sources:**

1. **Errors Array:**
   - Errors passed from the setup script
   - Example: "WSL2 installation failed: Feature is not enabled"

2. **Version Issues:**
   - Detected by version comparison
   - Example: "Node.js version 16.14.0 is below minimum required 18.0.0"

**Combines all issues:**
```typescript
const issues = [
  ...errors,           // From setup script
  ...versionIssues,    // From version check
];
```

---

### 5. Troubleshooting Hint Generation

The API provides intelligent troubleshooting recommendations based on:

#### Failed Tools:
```typescript
if (failedTools.length > 0) {
  hints.push(`${failedTools.length} tool(s) failed to install: ${names}`);
  hints.push('Try running the setup script again with administrator privileges');
}
```

#### Node.js Issues:
```typescript
if (results.nodejs?.status === 'ERROR') {
  hints.push('Node.js installation failed. Try installing manually from nodejs.org');
}
```

#### Python Issues:
```typescript
if (results.python?.status === 'ERROR') {
  hints.push('Python installation failed. Ensure python.org installer completed successfully');
}
```

#### Claude CLI Issues:
```typescript
if (results.claude?.status === 'ERROR') {
  hints.push('Claude CLI installation failed. Try: npm install -g @anthropic-ai/claude-code');
}
```

#### PATH Issues:
```typescript
if (errors.some(e => e.toLowerCase().includes('path'))) {
  hints.push('PATH configuration issue detected. Restart your terminal or computer after installation');
}
```

#### Homebrew Issues (macOS):
```typescript
if (results.homebrew?.status === 'ERROR') {
  hints.push('Homebrew installation failed. On Apple Silicon Macs, ensure /opt/homebrew/bin is in PATH');
}
```

#### WSL2 Issues (Windows):
```typescript
if (results.wsl2?.status === 'ERROR') {
  hints.push('WSL2 installation may require a system restart. Please restart and run the script again');
}
```

---

### 6. Valid/Invalid Determination

```typescript
const hasErrors = toolStats.error > 0 || errors.length > 0;
const hasVersionIssues = versionIssues.length > 0;
const isValid = !hasErrors && !hasVersionIssues;
```

**Valid if:**
- No tools failed (error count = 0)
- No errors in errors array
- All versions meet minimum requirements
- Skipped tools are allowed (don't affect validity)

**Invalid if:**
- Any tool has status: "ERROR"
- Any version is below minimum
- Any errors in errors array

---

## Response Examples

### Example 1: Perfect Setup (All OK)

**Request:**
```json
{
  "os": "Windows 11 Pro",
  "timestamp": "2026-02-13T18:30:45Z",
  "results": {
    "chocolatey": { "status": "OK", "version": "2.3.0", "installed": false },
    "git": { "status": "OK", "version": "2.43.0", "installed": false },
    "nodejs": { "status": "OK", "version": "20.11.0", "installed": false },
    "python": { "status": "OK", "version": "3.11.8", "installed": false },
    "claude": { "status": "OK", "version": "2.1.0", "installed": true }
  },
  "errors": [],
  "duration_seconds": 145.32
}
```

**Response:**
```json
{
  "valid": true,
  "summary": "5/5 tools installed successfully",
  "stats": {
    "ok": 5,
    "error": 0,
    "skipped": 0,
    "total": 5
  },
  "issues": [],
  "recommendations": [
    "All requirements met. Proceed to CLI authentication."
  ],
  "os": "Windows 11 Pro",
  "duration": 145.32
}
```

---

### Example 2: Version Mismatch

**Request:**
```json
{
  "os": "Windows 10 Pro",
  "timestamp": "2026-02-13T20:00:00Z",
  "results": {
    "nodejs": { "status": "OK", "version": "16.14.0", "installed": false }
  },
  "errors": [],
  "duration_seconds": 12.5
}
```

**Response:**
```json
{
  "valid": false,
  "summary": "1/1 tools installed successfully",
  "stats": {
    "ok": 1,
    "error": 0,
    "skipped": 0,
    "total": 1
  },
  "issues": [
    "Node.js version 16.14.0 is below minimum required 18.0.0"
  ],
  "recommendations": [
    "Node.js version is outdated. Update to v18+ via: choco upgrade nodejs-lts -y"
  ],
  "os": "Windows 10 Pro",
  "duration": 12.5
}
```

---

### Example 3: Multiple Errors

**Request:**
```json
{
  "os": "Windows 10 Pro",
  "timestamp": "2026-02-13T21:00:00Z",
  "results": {
    "nodejs": { "status": "OK", "version": "16.14.0", "installed": false },
    "wsl2": { "status": "ERROR", "version": null, "installed": false },
    "claude": { "status": "ERROR", "version": null, "installed": false }
  },
  "errors": [
    "WSL2 installation failed: Feature is not enabled",
    "Claude CLI installation failed: npm ERR! code EACCES"
  ],
  "duration_seconds": 234.67
}
```

**Response:**
```json
{
  "valid": false,
  "summary": "1/3 tools installed successfully",
  "stats": {
    "ok": 1,
    "error": 2,
    "skipped": 0,
    "total": 3
  },
  "issues": [
    "WSL2 installation failed: Feature is not enabled",
    "Claude CLI installation failed: npm ERR! code EACCES",
    "Node.js version 16.14.0 is below minimum required 18.0.0"
  ],
  "recommendations": [
    "2 tool(s) failed to install: wsl2, claude",
    "Try running the setup script again with administrator privileges",
    "Claude CLI installation failed. Try: npm install -g @anthropic-ai/claude-code",
    "WSL2 installation may require a system restart. Please restart and run the script again"
  ],
  "os": "Windows 10 Pro",
  "duration": 234.67
}
```

---

### Example 4: With Skipped Tools

**Request:**
```json
{
  "os": "macOS 14.3.0",
  "timestamp": "2026-02-13T22:00:00Z",
  "results": {
    "homebrew": { "status": "OK", "version": "4.2.5", "installed": false },
    "git": { "status": "OK", "version": "2.43.0", "installed": false },
    "nodejs": { "status": "OK", "version": "20.11.0", "installed": false },
    "docker": { "status": "SKIPPED", "version": null, "installed": false }
  },
  "errors": [],
  "duration_seconds": 56.2
}
```

**Response:**
```json
{
  "valid": true,
  "summary": "3/4 tools installed successfully",
  "stats": {
    "ok": 3,
    "error": 0,
    "skipped": 1,
    "total": 4
  },
  "issues": [],
  "recommendations": [
    "All requirements met. Proceed to CLI authentication.",
    "1 optional tool(s) were skipped."
  ],
  "os": "macOS 14.3.0",
  "duration": 56.2
}
```

---

## Error Scenarios

### Scenario 1: Invalid JSON Schema

**Request:**
```json
{
  "os": "Windows 11",
  "results": {
    "nodejs": { "status": "MAYBE", "installed": false }
  }
}
```

**Response (400):**
```json
{
  "valid": false,
  "error": "Invalid JSON format",
  "details": [
    {
      "code": "invalid_enum_value",
      "options": ["OK", "ERROR", "SKIPPED", "skipped"],
      "path": ["results", "nodejs", "status"],
      "message": "Invalid enum value. Expected 'OK' | 'ERROR' | 'SKIPPED' | 'skipped', received 'MAYBE'"
    },
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["timestamp"],
      "message": "Required"
    }
  ]
}
```

---

### Scenario 2: Missing Required Fields

**Request:**
```json
{
  "results": {}
}
```

**Response (400):**
```json
{
  "valid": false,
  "error": "Invalid JSON format",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["os"],
      "message": "Required"
    },
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["timestamp"],
      "message": "Required"
    },
    {
      "code": "invalid_type",
      "expected": "array",
      "received": "undefined",
      "path": ["errors"],
      "message": "Required"
    },
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "undefined",
      "path": ["duration_seconds"],
      "message": "Required"
    }
  ]
}
```

---

### Scenario 3: Server Error

**Request:** Valid JSON but server error during processing

**Response (500):**
```json
{
  "valid": false,
  "error": "Failed to process validation request",
  "details": "Unexpected token in JSON at position 1234"
}
```

---

## Testing the API

### Via cURL:

```bash
# Success scenario
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-success.json

# Failure scenario
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-failure.json
```

### Via JavaScript (fetch):

```javascript
const response = await fetch('https://ai-consultant-toolkit.vercel.app/api/validate-output', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    os: 'Windows 11 Pro',
    timestamp: new Date().toISOString(),
    results: { /* ... */ },
    errors: [],
    duration_seconds: 123.45
  })
});

const data = await response.json();
console.log(data);
```

### Via Python (requests):

```python
import requests

data = {
    "os": "macOS 14.3.0",
    "timestamp": "2026-02-13T18:00:00Z",
    "results": { /* ... */ },
    "errors": [],
    "duration_seconds": 89.5
}

response = requests.post(
    'https://ai-consultant-toolkit.vercel.app/api/validate-output',
    json=data
)

print(response.json())
```

---

## Performance

- **Average Response Time:** ~50-100ms
- **Timeout:** 10 seconds (Vercel default)
- **Rate Limiting:** None currently implemented
- **Max Payload Size:** 4MB (Vercel limit)

---

## Security

- **HTTPS:** Enforced on Vercel
- **CORS:** Open (allows all origins)
- **Authentication:** None required
- **Validation:** Zod schema prevents injection attacks
- **Sanitization:** No user input executed

---

## Edge Cases Handled

1. **Version with 'v' prefix:** Removed before comparison
2. **Null version:** Allowed for skipped tools
3. **Case-insensitive status:** 'SKIPPED' and 'skipped' both accepted
4. **Missing optional fields:** Architecture is optional
5. **Empty errors array:** Valid
6. **Zero duration:** Valid (if script ran instantly)
7. **Large payload:** Handled up to Vercel's 4MB limit

---

## Known Limitations

1. **No authentication:** Anyone can POST to this endpoint
2. **No rate limiting:** Could be spammed
3. **No persistent storage:** Results are not saved
4. **Single-request validation:** No session tracking
5. **No batch validation:** One setup result per request

---

## Future Enhancements

- [ ] Add authentication (API key)
- [ ] Implement rate limiting
- [ ] Save validation history
- [ ] Add batch validation support
- [ ] Generate PDF reports
- [ ] Email notifications
- [ ] Webhook support for CI/CD
- [ ] More granular version requirements (by OS)

---

## Related Files

- **API Route:** `app/api/validate-output/route.ts`
- **File Upload Component:** `components/FileUpload.tsx`
- **Results Page:** `app/results/page.tsx`
- **Test Data:** `scripts/test-data/`
- **Testing Guide:** `TESTING-GUIDE.md`

---

**API Version:** 1.0

**Last Updated:** February 13, 2026

**Stability:** Stable (Production-ready)
