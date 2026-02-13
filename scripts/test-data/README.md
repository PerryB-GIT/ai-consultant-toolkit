# Mock Test Data

Test data files for validating the AI Consultant Toolkit validation API and dashboard without running the full setup scripts.

---

## 📁 Files

### 1. `mock-success.json` - Perfect Setup ✅

**Scenario:** All tools installed successfully, no errors

**Use Case:** Test the "happy path" where everything works perfectly

**Expected Validation Result:**
- `valid: true`
- `summary: "8/8 tools installed successfully"`
- `stats.ok: 8, stats.error: 0, stats.skipped: 0`
- Recommendation: "All requirements met. Proceed to CLI authentication."

**Test:**
```bash
# Via cURL
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-success.json

# Via Dashboard
# 1. Visit: https://ai-consultant-toolkit.vercel.app/results
# 2. Upload: mock-success.json
# 3. Verify: Green checkmark, "All requirements met"
```

---

### 2. `mock-partial.json` - Some Tools Missing ⚠️

**Scenario:** Core tools installed, but Claude CLI and Docker were skipped

**Use Case:** Test when optional tools are not installed

**Expected Validation Result:**
- `valid: true` (optional tools can be skipped)
- `summary: "6/8 tools installed successfully"`
- `stats.ok: 6, stats.error: 0, stats.skipped: 2`
- Recommendation: "All requirements met. Proceed to CLI authentication. 2 optional tool(s) were skipped."

**Test:**
```bash
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-partial.json
```

---

### 3. `mock-failure.json` - Critical Errors ❌

**Scenario:** Multiple critical errors and version mismatches

**Issues:**
- Node.js version 16.14.0 (below minimum 18.0.0)
- WSL2 installation failed
- Claude CLI installation failed (EACCES error)
- Docker installation failed (requires WSL2)

**Use Case:** Test error handling and troubleshooting recommendations

**Expected Validation Result:**
- `valid: false`
- `summary: "5/8 tools installed successfully"`
- `stats.ok: 5, stats.error: 3, stats.skipped: 0`
- Issues:
  - "Node.js version 16.14.0 is below minimum required 18.0.0"
  - "WSL2 installation failed: Feature is not enabled"
  - "Claude CLI installation failed: npm ERR! code EACCES"
  - "Docker Desktop requires WSL2 to be installed first"
- Recommendations:
  - "3 tool(s) failed to install: wsl2, claude, docker"
  - "Try running the setup script again with administrator privileges"
  - "Claude CLI installation failed. Try: npm install -g @anthropic-ai/claude-code"
  - "WSL2 installation may require a system restart. Please restart and run the script again"

**Test:**
```bash
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-failure.json
```

---

## 🧪 How to Use for Testing

### Quick Dashboard Test (No Script Execution)

1. **Navigate to project:**
   ```bash
   cd C:/Users/Jakeb/workspace/ai-consultant-toolkit
   ```

2. **Copy mock file to home directory:**
   ```bash
   cp scripts/test-data/mock-success.json ~/setup-results.json
   ```

3. **Test via Dashboard:**
   - Visit: https://ai-consultant-toolkit.vercel.app/results
   - Upload `mock-success.json`
   - Verify validation results display correctly

4. **Test different scenarios:**
   ```bash
   # Test partial setup
   cp scripts/test-data/mock-partial.json ~/setup-results.json

   # Test failure case
   cp scripts/test-data/mock-failure.json ~/setup-results.json
   ```

---

### API Testing (Command Line)

```bash
# Test success scenario
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-success.json | jq .

# Test partial scenario
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-partial.json | jq .

# Test failure scenario
curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-failure.json | jq .
```

---

### Local Development Testing

```bash
# Start Next.js dev server
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-success.json
```

---

## 📊 Validation Logic Reference

The validation API (`app/api/validate-output/route.ts`) checks:

### 1. **Schema Validation**
- Zod schema ensures all required fields are present
- `os`, `timestamp`, `results`, `errors`, `duration_seconds` are required
- Each tool result must have: `status`, `version`, `installed`

### 2. **Version Requirements**
- **Node.js:** min 18.0.0
- **Python:** min 3.10.0
- **Claude CLI:** min 2.0.0

### 3. **Status Counts**
- Counts tools by status: `OK`, `ERROR`, `SKIPPED`
- Calculates success rate

### 4. **Error Detection**
- Collects all errors from `errors` array
- Identifies failed tools (status: `ERROR`)
- Checks for version mismatches

### 5. **Troubleshooting Hints**
- Node.js errors → "Try installing manually from nodejs.org"
- Python errors → "Ensure python.org installer completed successfully"
- Claude CLI errors → "Try: npm install -g @anthropic-ai/claude-code"
- PATH errors → "Restart your terminal or computer after installation"
- Homebrew errors (Mac) → "Ensure /opt/homebrew/bin is in PATH"
- WSL2 errors (Windows) → "May require a system restart"

---

## 🎯 Testing Checklist

Use these mock files to verify:

### Dashboard UI:
- [ ] File upload accepts JSON
- [ ] Validation results display correctly
- [ ] Success scenario shows green checkmark
- [ ] Failure scenario shows red X
- [ ] Tool status table populates
- [ ] Recommendations display
- [ ] Responsive design works (mobile/desktop)

### Validation API:
- [ ] Accepts valid JSON
- [ ] Rejects invalid JSON (400 error)
- [ ] Correctly identifies version issues
- [ ] Provides helpful troubleshooting hints
- [ ] Returns appropriate HTTP status codes
- [ ] Handles edge cases (null versions, missing fields)

### Error Handling:
- [ ] Gracefully handles malformed JSON
- [ ] Provides clear error messages
- [ ] Doesn't crash on unexpected input
- [ ] Logs errors properly

---

## 🔧 Creating Custom Test Data

To create your own test files:

```json
{
  "os": "Your OS Version",
  "architecture": "x64 or arm64",
  "timestamp": "ISO-8601 timestamp",
  "results": {
    "tool_name": {
      "status": "OK | ERROR | SKIPPED | skipped",
      "version": "1.2.3 or null",
      "installed": true or false
    }
  },
  "errors": ["Error message 1", "Error message 2"],
  "duration_seconds": 123.45
}
```

**Required Tools:**
- `chocolatey` (Windows) or `homebrew` (Mac)
- `git`
- `github_cli`
- `nodejs`
- `python`
- `wsl2` (Windows only)
- `claude`
- `docker`

---

## 📝 Notes

- **Purpose:** These files allow you to test the validation pipeline without running the 30-60 minute setup scripts
- **Realism:** Based on actual script output from Windows and macOS tests
- **Coverage:** Covers success, partial success, and failure scenarios
- **Validation:** All files are valid JSON and match the Zod schema

---

## 🚀 Quick Commands

```bash
# Test all scenarios at once
for file in scripts/test-data/mock-*.json; do
  echo "Testing: $file"
  curl -X POST https://ai-consultant-toolkit.vercel.app/api/validate-output \
    -H "Content-Type: application/json" \
    -d @$file | jq '.valid, .summary'
  echo ""
done

# Expected output:
# Testing: mock-success.json
# true
# "8/8 tools installed successfully"
#
# Testing: mock-partial.json
# true
# "6/8 tools installed successfully"
#
# Testing: mock-failure.json
# false
# "5/8 tools installed successfully"
```

---

**Happy Testing!** 🎉
