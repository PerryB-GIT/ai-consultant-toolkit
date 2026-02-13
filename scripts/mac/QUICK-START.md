# Quick Start - macOS Setup

## One-Line Install

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/ai-consultant-toolkit/main/scripts/mac/setup-mac.sh)
```

## Manual Steps

### 1. Download

```bash
curl -O https://raw.githubusercontent.com/YOUR_REPO/ai-consultant-toolkit/main/scripts/mac/setup-mac.sh
chmod +x setup-mac.sh
```

### 2. Run

```bash
bash setup-mac.sh
```

### 3. Post-Install

```bash
# Reload shell
source ~/.zprofile

# Auth GitHub
gh auth login

# Auth Claude
claude auth
```

### 4. Upload Results

```bash
# Results file location
open ~/setup-results.json
```

Upload this file to the AI Consultant Toolkit dashboard.

## What Gets Installed

| Tool | Purpose | Version |
|------|---------|---------|
| Homebrew | Package manager | Latest |
| Git | Version control | Latest |
| GitHub CLI | GitHub tool | Latest |
| Node.js | JavaScript runtime | LTS (22.x) |
| Python | Interpreter | 3.12 |
| Claude Code | AI assistant | Latest |
| Docker | Containers | Optional |

## Time Estimate

- **Already have tools**: 30 seconds
- **Fresh install**: 5-10 minutes
- **Includes Homebrew**: 10-15 minutes

## Troubleshooting Quick Fixes

```bash
# Command not found?
source ~/.zprofile

# Homebrew issues?
xcode-select --install

# Permission errors?
sudo chown -R $USER /usr/local/lib/node_modules

# PATH problems?
export PATH="/opt/homebrew/bin:$PATH"  # Apple Silicon
export PATH="/usr/local/bin:$PATH"      # Intel
```

## Verify Installation

```bash
brew --version
git --version
gh --version
node --version
python3 --version
claude --version
```

All commands should return version numbers.

## Need Help?

See [README.md](./README.md) for full documentation or [KNOWN-ISSUES.md](./KNOWN-ISSUES.md) for troubleshooting.
