# macOS Setup Script - Technical Summary

## Overview

Automated development environment setup for AI Consultant Toolkit clients on macOS (Intel and Apple Silicon).

**File:** `setup-mac.sh`  
**Output:** `~/setup-results.json`  
**Execution Time:** 30s (existing tools) to 15min (full install)

## Architecture Support

| Architecture | Homebrew Path | Status |
|--------------|---------------|--------|
| Apple Silicon (arm64) | `/opt/homebrew` | ✅ Fully supported |
| Intel (x86_64) | `/usr/local` | ✅ Fully supported |

## Installed Tools

| Tool | Source | Version | Purpose |
|------|--------|---------|---------|
| Homebrew | brew.sh | Latest stable | Package manager |
| Git | Homebrew | Latest | Version control |
| GitHub CLI | Homebrew | Latest | GitHub automation |
| Node.js | Homebrew | LTS (22.x) | JavaScript runtime |
| Python | Homebrew | 3.12.x | Python interpreter |
| Claude Code | npm | Latest | AI assistant CLI |
| Docker Desktop | Homebrew Cask | Latest | Container platform (optional) |

## Script Features

### Smart Detection

- ✅ Checks existing installations before installing
- ✅ Validates version compatibility (Node.js LTS, Python 3.12)
- ✅ Detects architecture (arm64 vs x86_64)
- ✅ Auto-configures PATH for architecture

### Error Handling

- ✅ Continues on non-critical errors
- ✅ Tracks errors in JSON output
- ✅ Provides troubleshooting hints
- ✅ Exit code 0 even with partial failures (for automation)

### JSON Output

Structured results for dashboard validation:

```json
{
  "os": "macOS 14.2 (Apple Silicon)",
  "architecture": "arm64",
  "timestamp": "2026-02-13T20:30:45Z",
  "results": {
    "toolname": {
      "status": "OK|ERR|skipped",
      "version": "1.2.3" | null,
      "installed": true | false
    }
  },
  "errors": ["error message 1", "error message 2"],
  "duration_seconds": 420
}
```

### User Experience

- ✅ Color-coded output (info, success, warning, error)
- ✅ Progress messages during installation
- ✅ Clear next steps after completion
- ✅ Minimal user interaction (Docker prompt only)

## Technical Details

### PATH Configuration

The script automatically updates `~/.zprofile`:

**Apple Silicon:**
```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Intel:**
```bash
eval "$(/usr/local/bin/brew shellenv)"
```

### Version Detection

```bash
get_version() {
    case $1 in
        brew) brew --version | head -1 | awk '{print $2}' ;;
        git) git --version | awk '{print $3}' ;;
        node) node --version | sed 's/v//' ;;
        python) python3 --version | awk '{print $2}' ;;
        # ... etc
    esac
}
```

### Installation Logic

```bash
# Pattern for each tool:
if command -v TOOL &> /dev/null; then
    # Already installed - report version
    add_result "tool" "OK" "$VERSION" "false"
else
    # Install tool
    if brew install TOOL; then
        add_result "tool" "OK" "$VERSION" "true"
    else
        add_result "tool" "ERR" "null" "false"
    fi
fi
```

## Security Considerations

- ✅ No `sudo` required (except Homebrew's own prompts)
- ✅ All sources are official (brew.sh, nodejs.org, python.org, anthropic.com)
- ✅ No credentials stored by script
- ✅ User controls Docker installation (opt-in)

## Known Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| Homebrew takes 5-10 min | Slow first-time setup | User expectation management |
| Rosetta 2 may be needed | Apple Silicon only | Script could auto-install |
| Python 3.12 may not be default | Requires `python3.12` command | Add to PATH in .zprofile |
| Docker requires GUI launch | Not automated | Manual step in docs |
| npm global permissions | EACCES errors | Fix ownership or use npx |

## Testing Checklist

- [x] Apple Silicon (M1/M2/M3/M4) - Full install
- [x] Apple Silicon - Partial install (some tools exist)
- [x] Intel Mac - Full install
- [x] Intel Mac - Partial install
- [ ] macOS 12 (Monterey)
- [ ] macOS 13 (Ventura)
- [x] macOS 14 (Sonoma)
- [ ] macOS 15 (Sequoia)
- [x] No internet connection (graceful failure)
- [x] JSON output validation
- [x] PATH configuration (new shell session)

## File Structure

```
scripts/mac/
├── setup-mac.sh          # Main installation script
├── README.md             # Full documentation
├── QUICK-START.md        # TL;DR guide
├── KNOWN-ISSUES.md       # Troubleshooting reference
├── SUMMARY.md            # This file
└── example-output.json   # Sample JSON output
```

## Integration Points

### Dashboard Upload

Client uploads `~/setup-results.json` to validate environment setup.

Dashboard should check:
- ✅ All critical tools have `status: "OK"`
- ✅ Versions meet minimums (Node >= 18, Python >= 3.12)
- ✅ `errors` array is empty or contains only warnings
- ✅ `duration_seconds` is reasonable (< 1800)

### Onboarding Workflow

1. Client receives setup script link via email
2. Client runs script on their Mac
3. Client uploads `setup-results.json` to dashboard
4. Dashboard validates and marks setup complete
5. Client proceeds to project initialization

### API Integration (Future)

```bash
# Script could POST results directly to API
curl -X POST https://api.ai-toolkit.com/setup \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @~/setup-results.json
```

## Metrics to Track

- **Setup success rate**: % of clients with zero errors
- **Average duration**: Median time to complete
- **Most common errors**: For prioritizing improvements
- **Tool detection rate**: % with existing tools vs fresh install
- **Architecture split**: Apple Silicon vs Intel adoption

## Future Enhancements

- [ ] Auto-install Rosetta 2 on Apple Silicon
- [ ] Support for Bash shell (currently zsh-focused)
- [ ] Windows WSL2 compatibility mode
- [ ] Telemetry opt-in (send results to API)
- [ ] Pre-flight check mode (`--check-only`)
- [ ] Uninstall script
- [ ] Retry logic for network failures
- [ ] Parallel installations (Homebrew limitation)

## Maintenance

### Updating Tool Versions

To update required versions, modify these sections:

```bash
# Node.js LTS check
if [[ $MAJOR_VERSION -ge 18 ]] && [[ $((MAJOR_VERSION % 2)) -eq 0 ]]; then

# Python version check
if [[ "$MAJOR_MINOR" == "3.12" ]]; then
```

### Adding New Tools

1. Add detection logic in tool-specific section
2. Add result tracking: `add_result "newtool" "OK" "$VERSION" "true"`
3. Add to JSON iteration: `for tool in homebrew git ... newtool; do`
4. Update README.md installation table
5. Add troubleshooting section to KNOWN-ISSUES.md

### Testing After Changes

```bash
# On Apple Silicon Mac
bash setup-mac.sh

# Verify JSON output
cat ~/setup-results.json | jq .

# Verify PATH
source ~/.zprofile
brew --version
```

## Support

**For script bugs:** Open issue in ai-consultant-toolkit repo  
**For tool-specific issues:** See KNOWN-ISSUES.md  
**For client questions:** Point to README.md

---

**Last Updated:** 2026-02-13  
**Version:** 1.0.0  
**Author:** AI Consultant Toolkit Team
