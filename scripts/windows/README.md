# Windows Setup Script

## Overview

The `setup-windows.ps1` script provides automated installation of development tools for AI consulting clients on Windows 10/11.

## Features

- **Smart Detection**: Only installs missing tools
- **Progress Feedback**: Clear console output with color coding
- **JSON Results**: Generates validation report at `%USERPROFILE%\setup-results.json`
- **Error Handling**: Continues on non-critical errors, logs all issues
- **PATH Management**: Automatically refreshes environment variables
- **Restart Detection**: Identifies when system restart is needed (WSL2)

## Tools Installed

1. **Chocolatey** - Package manager for Windows
2. **Git + GitBash** - Version control and Unix tools
3. **GitHub CLI** (gh) - GitHub operations from command line
4. **Node.js LTS** - JavaScript runtime
5. **Python 3.12** - Python programming language
6. **WSL2 + Ubuntu** - Windows Subsystem for Linux
7. **Claude Code CLI** - Anthropic's CLI tool (via npm)
8. **Docker Desktop** - Optional, prompts user

## Usage

### Basic Run (Administrator Required)

```powershell
# Run as Administrator
PowerShell -ExecutionPolicy Bypass -File .\setup-windows.ps1
```

### Skip Docker Prompt

```powershell
PowerShell -ExecutionPolicy Bypass -File .\setup-windows.ps1 -SkipDocker
```

### Check Results

```powershell
# View JSON output
Get-Content $env:USERPROFILE\setup-results.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## Output Format

### Console Output

```
================================================================
   AI Consultant Toolkit - Windows Setup
================================================================

OS: Windows 11 Pro 10.0.22631
Time: 2026-02-13 12:30:45

> Checking Chocolatey package manager...
  [OK] Chocolatey already installed (v2.2.2)

> Checking Git...
  [INFO] Installing Git for Windows (includes GitBash)...
  [OK] Git installed successfully (2.44.0)

...

================================================================
   Installation Summary
================================================================

  chocolatey    : OK       v2.2.2 (pre-existing)
  git           : OK       v2.44.0 (newly installed)
  github_cli    : OK       v2.86.0 (newly installed)
  nodejs        : OK       v22.1.0 (newly installed)
  python        : OK       v3.12.1 (newly installed)
  wsl2          : OK       v2.0.14 (newly installed)
  claude        : OK       v2.1.37 (newly installed)
  docker        : skipped  

Duration: 480 seconds

[OK] Results saved to: C:\Users\Perry\setup-results.json

================================================================
   Next Steps
================================================================

1. Authenticate GitHub CLI:
   gh auth login

2. Authenticate Claude Code:
   claude auth

3. Configure WSL2 Ubuntu (first launch):
   wsl

================================================================
```

### JSON Output

```json
{
  "os": "Windows 11 Pro 10.0.22631",
  "timestamp": "2026-02-13T15:30:00Z",
  "results": {
    "chocolatey": {
      "status": "OK",
      "version": "2.2.2",
      "installed": false
    },
    "git": {
      "status": "OK",
      "version": "2.44.0",
      "installed": true
    },
    "github_cli": {
      "status": "OK",
      "version": "2.86.0",
      "installed": true
    },
    "nodejs": {
      "status": "OK",
      "version": "22.1.0",
      "installed": true
    },
    "python": {
      "status": "OK",
      "version": "3.12.1",
      "installed": true
    },
    "wsl2": {
      "status": "OK",
      "version": "2.0.14",
      "installed": true,
      "restart_required": false
    },
    "claude": {
      "status": "OK",
      "version": "2.1.37",
      "installed": true
    },
    "docker": {
      "status": "skipped",
      "version": null,
      "installed": false
    }
  },
  "errors": [],
  "duration_seconds": 480,
  "restart_required": false
}
```

## Status Codes

- **OK**: Tool successfully installed or already present
- **ERROR**: Installation failed (see errors array)
- **WARN**: Non-critical issue, tool may need manual install
- **skipped**: User declined or -SkipDocker flag used

## Known Issues

### WSL2 Restart Required

If WSL2 is newly installed, Windows may require a restart. The script will:
- Set `restart_required: true` in JSON output
- Display warning message in console
- Allow you to restart and re-run script

### Chocolatey First-Time Install

First-time Chocolatey installation may require:
1. Administrator PowerShell
2. Execution Policy set to Bypass
3. Refresh PATH manually if tools not found after install

### Windows Defender Prompts

Chocolatey and tool installers may trigger Windows Defender SmartScreen. Click "More info" → "Run anyway" if prompted.

## Troubleshooting

### Tools Not Found After Install

```powershell
# Refresh environment in current session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Or restart PowerShell
```

### Claude Code Install Fails

Claude Code requires Node.js/npm. If Node.js installation succeeds but Claude fails:

```powershell
npm install -g @anthropic-ai/claude-code
claude --version
```

### WSL2 Issues

If WSL2 installation fails:

```powershell
# Check Windows version (need Windows 10 2004+ or Windows 11)
winver

# Manual WSL install
wsl --install

# Enable required features
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

## Post-Installation

### GitHub CLI Authentication

```powershell
gh auth login
# Choose:
# - GitHub.com
# - HTTPS
# - Login with web browser
```

### Claude Code Authentication

```powershell
claude auth
# Follow browser prompts to sign in
```

### WSL2 Ubuntu Setup

```powershell
wsl
# First launch prompts for:
# - Username
# - Password
```

### Docker Desktop

- Launch from Start Menu
- Sign in with Docker Hub account (optional)
- Configure resources in Settings

## Development

To modify the script, edit `setup-windows.ps1` and test with:

```powershell
# Dry run (check what would be installed)
PowerShell -ExecutionPolicy Bypass -File .\setup-windows.ps1 -WhatIf

# Test with verbose output
PowerShell -ExecutionPolicy Bypass -File .\setup-windows.ps1 -Verbose
```

## License

Copyright 2026 Support Forge (Perry Bailes)
