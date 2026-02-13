# macOS Setup Scripts - File Index

## Quick Navigation

| File | Purpose | Audience |
|------|---------|----------|
| [QUICK-START.md](./QUICK-START.md) | One-page setup guide | **Clients (start here)** |
| [README.md](./README.md) | Complete documentation | Clients needing help |
| [KNOWN-ISSUES.md](./KNOWN-ISSUES.md) | Troubleshooting guide | Clients with problems |
| [SUMMARY.md](./SUMMARY.md) | Technical overview | **Developers** |
| [setup-mac.sh](./setup-mac.sh) | Main installation script | **Run this** |
| [example-output.json](./example-output.json) | Sample JSON output | Reference |
| [test-output.sh](./test-output.sh) | Demo script (no installs) | Preview |

## For Clients

### Getting Started

1. Read [QUICK-START.md](./QUICK-START.md) (2 min read)
2. Run `setup-mac.sh` (5-15 min depending on what's installed)
3. Upload `~/setup-results.json` to dashboard
4. Follow "Next Steps" from script output

### Having Problems?

1. Check [KNOWN-ISSUES.md](./KNOWN-ISSUES.md) for your specific error
2. Read [README.md](./README.md) troubleshooting section
3. Run `test-output.sh` to see what the output should look like
4. Contact support with your error message and OS version

## For Developers

### Understanding the System

1. Read [SUMMARY.md](./SUMMARY.md) for technical details
2. Review [setup-mac.sh](./setup-mac.sh) source code
3. Check [example-output.json](./example-output.json) for JSON schema
4. Test locally with `bash setup-mac.sh`

### Making Changes

```bash
# Edit script
vim setup-mac.sh

# Test locally (dry run)
bash -x setup-mac.sh

# Verify JSON output
cat ~/setup-results.json | jq .

# Run visual demo
bash test-output.sh

# Update docs if needed
vim README.md KNOWN-ISSUES.md
```

### Deployment

```bash
# Commit changes
git add scripts/mac/
git commit -m "Update macOS setup script"

# Push to GitHub
git push origin main

# Update client-facing URL in QUICK-START.md
```

## File Purposes

### setup-mac.sh

**Main installation script**

- Detects existing tools
- Installs missing tools via Homebrew
- Generates `~/setup-results.json`
- Updates PATH in `~/.zprofile`
- Provides post-install instructions

**Key Features:**
- Architecture detection (arm64 vs x86_64)
- Smart tool detection (version checks)
- Error handling and reporting
- Color-coded output
- JSON results for automation

### QUICK-START.md

**One-page quick reference**

For clients who just want to get started fast.

- One-line install command
- Manual install steps
- Post-install checklist
- Quick troubleshooting

### README.md

**Complete user documentation**

Comprehensive guide covering:
- What gets installed
- System requirements
- Step-by-step usage
- Detailed troubleshooting
- Architecture-specific notes
- Security information
- Uninstall instructions

### KNOWN-ISSUES.md

**Troubleshooting reference**

15+ common issues with solutions:
- Rosetta 2 requirements
- PATH problems
- Permission errors
- Version conflicts
- Tool-specific failures

### SUMMARY.md

**Technical documentation**

For developers and maintainers:
- Architecture support details
- Script internals
- JSON output schema
- Testing checklist
- Future enhancements
- Integration points

### example-output.json

**Sample JSON output**

Reference for dashboard developers showing:
- Output structure
- Field types
- Success case example

### test-output.sh

**Visual demo script**

Shows what the setup process looks like without actually installing anything. Useful for:
- Screenshots/demos
- Training videos
- Understanding flow

### INDEX.md

**This file**

Navigation hub for all documentation.

## Workflow Diagrams

### Client Onboarding

```
Client receives email
    ↓
Opens QUICK-START.md
    ↓
Runs setup-mac.sh
    ↓
Uploads setup-results.json
    ↓
Dashboard validates
    ↓
Setup complete ✓
```

### Troubleshooting Flow

```
Script fails
    ↓
Check terminal output
    ↓
Search KNOWN-ISSUES.md
    ↓
Apply fix
    ↓
Re-run setup-mac.sh
    ↓
Success ✓
```

### Developer Update Flow

```
Issue reported
    ↓
Reproduce locally
    ↓
Fix setup-mac.sh
    ↓
Update docs (README/KNOWN-ISSUES)
    ↓
Test on both architectures
    ↓
Deploy to GitHub
    ↓
Notify clients of update
```

## JSON Output Schema

See [example-output.json](./example-output.json) for complete example.

```typescript
interface SetupResults {
  os: string;                    // "macOS 14.2 (Apple Silicon)"
  architecture: string;          // "arm64" | "x86_64"
  timestamp: string;             // ISO 8601 format
  results: {
    [toolName: string]: {
      status: "OK" | "ERR" | "skipped";
      version: string | null;
      installed: boolean;       // true if installed by script
    }
  };
  errors: string[];              // Error messages
  duration_seconds: number;
}
```

## Testing Matrix

| OS Version | Architecture | Status |
|------------|--------------|--------|
| macOS 12 (Monterey) | Intel | ⚠️ Untested |
| macOS 12 (Monterey) | Apple Silicon | ⚠️ Untested |
| macOS 13 (Ventura) | Intel | ⚠️ Untested |
| macOS 13 (Ventura) | Apple Silicon | ⚠️ Untested |
| macOS 14 (Sonoma) | Intel | ✅ Tested |
| macOS 14 (Sonoma) | Apple Silicon | ✅ Tested |
| macOS 15 (Sequoia) | Intel | ⚠️ Untested |
| macOS 15 (Sequoia) | Apple Silicon | ⚠️ Untested |

## Support Channels

| Issue Type | Resource |
|------------|----------|
| Script errors | [KNOWN-ISSUES.md](./KNOWN-ISSUES.md) |
| Homebrew problems | https://github.com/Homebrew/brew/issues |
| Node.js issues | https://github.com/nodejs/node/issues |
| Python issues | https://github.com/python/cpython/issues |
| Claude Code help | https://docs.anthropic.com/claude/docs/claude-code |
| General questions | [README.md](./README.md) |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-13 | Initial release |

## License

MIT License - See repository root for details.

---

**Need help?** Start with [QUICK-START.md](./QUICK-START.md) if you're a client, or [SUMMARY.md](./SUMMARY.md) if you're a developer.
