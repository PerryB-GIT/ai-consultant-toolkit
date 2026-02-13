# macOS Setup Script

Automated installation script for AI Consultant Toolkit development tools on macOS (Intel and Apple Silicon).

## What It Installs

1. **Homebrew** - Package manager for macOS
2. **Git** - Version control
3. **GitHub CLI** (gh) - GitHub command-line tool
4. **Node.js LTS** - JavaScript runtime
5. **Python 3.12** - Python interpreter
6. **Claude Code CLI** - Anthropic's AI coding assistant
7. **Docker Desktop** (optional, skipped by default)

## Requirements

- macOS 12.0 (Monterey) or later
- Administrator access (for Homebrew installation)
- Internet connection

## Usage

### Download and Run

```bash
# Download the script
curl -O https://raw.githubusercontent.com/YOUR_REPO/ai-consultant-toolkit/main/scripts/mac/setup-mac.sh

# Make executable
chmod +x setup-mac.sh

# Run
bash setup-mac.sh
```

### What Happens

1. **Detection Phase** - Checks which tools are already installed
2. **Installation Phase** - Installs only missing tools
3. **Results Generation** - Creates `~/setup-results.json`

### Expected Output

```
AI Consultant Toolkit - macOS Setup
System: macOS 14.2 (Apple Silicon)

[INFO] Checking Homebrew...
[OK] Homebrew installed (5.0.13)
[INFO] Checking Git...
[OK] Git installed (2.52.0)
...
Setup complete! Results: /Users/perry/setup-results.json
Duration: 42s
```

## Output File

The script generates `~/setup-results.json`:

```json
{
  "os": "macOS 14.2 (Apple Silicon)",
  "architecture": "arm64",
  "timestamp": "2026-02-13T20:30:00Z",
  "results": {
    "homebrew": {"status": "OK", "version": "5.0.13", "installed": false},
    "git": {"status": "OK", "version": "2.52.0", "installed": false},
    "github_cli": {"status": "OK", "version": "2.86.0", "installed": true},
    "nodejs": {"status": "OK", "version": "22.1.0", "installed": true},
    "python": {"status": "OK", "version": "3.12.12", "installed": true},
    "claude": {"status": "OK", "version": "2.1.37", "installed": true},
    "docker": {"status": "skipped", "version": null, "installed": false}
  },
  "errors": [],
  "duration_seconds": 420
}
```

Upload this file to the AI Consultant Toolkit dashboard to complete onboarding.

## Post-Installation Steps

### 1. Reload Shell Profile

```bash
source ~/.zprofile
```

This ensures Homebrew and other tools are in your PATH.

### 2. Authenticate GitHub CLI

```bash
gh auth login
```

Follow the prompts to authenticate with GitHub.

### 3. Authenticate Claude Code

```bash
claude auth
```

Enter your Anthropic API key when prompted.

### 4. Verify Installations

```bash
brew --version
git --version
gh --version
node --version
python3 --version
claude --version
```

## Architecture-Specific Notes

### Apple Silicon (M1/M2/M3/M4)

- Homebrew installs to `/opt/homebrew`
- PATH automatically updated in `~/.zprofile`
- All tools are ARM64-native

### Intel Macs

- Homebrew installs to `/usr/local`
- PATH automatically updated in `~/.zprofile`

## Troubleshooting

### Homebrew Installation Fails

**Problem:** Installation hangs or fails with permission errors.

**Solution:**
```bash
# Ensure Xcode Command Line Tools are installed
xcode-select --install

# Try manual Homebrew install
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### PATH Not Updated

**Problem:** `brew` command not found after installation.

**Solution:**
```bash
# Apple Silicon
eval "$(/opt/homebrew/bin/brew shellenv)"

# Intel
eval "$(/usr/local/bin/brew shellenv)"

# Make permanent
source ~/.zprofile
```

### Python Version Mismatch

**Problem:** `python3 --version` shows wrong version.

**Solution:**
```bash
# Use specific version
python3.12 --version

# Link 3.12 as default
brew link --overwrite python@3.12
```

### Claude Code Install Fails

**Problem:** `npm install -g` fails with EACCES error.

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $USER /usr/local/lib/node_modules

# Or use npx
npx @anthropic-ai/claude-code
```

### Docker Desktop Won't Start

**Problem:** Docker daemon not running after installation.

**Solution:**
1. Open **Applications** folder
2. Double-click **Docker** app
3. Grant necessary permissions (Accessibility, System Extension)
4. Wait for Docker icon in menu bar to show "Docker Desktop is running"

## Known Issues

### Rosetta 2 Required (Apple Silicon)

Some Node.js native modules may require Rosetta 2:

```bash
softwareupdate --install-rosetta
```

### Homebrew Cleanup Warnings

Homebrew may show warnings about outdated packages. These are safe to ignore during initial setup:

```bash
# Optional: Update everything after setup
brew update && brew upgrade
```

### Python pip Warnings

Python may warn about pip being outdated:

```bash
python3 -m pip install --upgrade pip
```

## Advanced Options

### Silent Installation (No Prompts)

The script automatically skips Docker if not running interactively. To force Docker installation:

```bash
yes | bash setup-mac.sh
```

### Custom JSON Output Location

```bash
export RESULTS_FILE="$HOME/Desktop/results.json"
bash setup-mac.sh
```

### Skip Specific Tools

Edit the script and comment out the relevant section, or:

```bash
# Install Homebrew + Git only
brew install git
```

## Security

- Script runs with user permissions (no `sudo` required except for Homebrew's initial install)
- All tools installed from official sources:
  - Homebrew: https://brew.sh
  - Node.js: Homebrew formula (nodejs.org)
  - Python: Homebrew formula (python.org)
  - Claude Code: npm registry (@anthropic-ai)
- No credentials are stored by this script

## Uninstalling

To remove tools installed by this script:

```bash
# Uninstall Homebrew and all packages
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)"

# Or remove individual tools
brew uninstall git gh node python@3.12

# Remove Claude Code
npm uninstall -g @anthropic-ai/claude-code

# Remove Docker Desktop
brew uninstall --cask docker
```

## Support

For issues specific to:
- **Homebrew**: https://github.com/Homebrew/brew/issues
- **Node.js**: https://github.com/nodejs/node/issues
- **Python**: https://github.com/python/cpython/issues
- **Claude Code**: https://docs.anthropic.com/claude/docs/claude-code
- **This script**: Open an issue in the AI Consultant Toolkit repository

## License

MIT License - See repository root for details.
