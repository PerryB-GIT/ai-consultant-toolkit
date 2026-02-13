# Known Issues - macOS Setup Script

## Common Problems and Solutions

### 1. Rosetta 2 Required on Apple Silicon

**Symptom:**
```
Bad CPU type in executable
```

**Cause:** Some Node.js native modules require Rosetta 2 translation layer.

**Solution:**
```bash
softwareupdate --install-rosetta
```

---

### 2. Homebrew PATH Issues

**Symptom:**
```
brew: command not found
```

**Cause:** Shell hasn't loaded new PATH from `~/.zprofile`.

**Solution:**
```bash
# For current session (Apple Silicon)
eval "$(/opt/homebrew/bin/brew shellenv)"

# For current session (Intel)
eval "$(/usr/local/bin/brew shellenv)"

# Permanent fix
source ~/.zprofile

# Or restart terminal
```

---

### 3. Python 3.12 Not Default

**Symptom:**
```
$ python3 --version
Python 3.11.5
```

**Cause:** System Python takes precedence over Homebrew Python.

**Solution:**
```bash
# Use specific version
python3.12 --version

# Make 3.12 default
brew link --overwrite python@3.12

# Add to .zprofile
echo 'export PATH="/opt/homebrew/opt/python@3.12/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

---

### 4. npm Permission Errors

**Symptom:**
```
EACCES: permission denied, access '/usr/local/lib/node_modules'
```

**Cause:** Global npm directory owned by root.

**Solution:**
```bash
# Fix ownership
sudo chown -R $USER $(npm config get prefix)/{lib/node_modules,bin,share}

# Or use npx (no global install)
npx @anthropic-ai/claude-code
```

---

### 5. Xcode Command Line Tools Missing

**Symptom:**
```
xcrun: error: invalid active developer path
```

**Cause:** Git/Homebrew require Xcode CLT.

**Solution:**
```bash
xcode-select --install
```

Follow GUI prompts to install.

---

### 6. Claude Code Command Not Found

**Symptom:**
```
claude: command not found
```

**Cause:** npm global bin not in PATH.

**Solution:**
```bash
# Find npm global bin
npm config get prefix

# Add to PATH (replace with your prefix)
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile

# Or use npx
npx @anthropic-ai/claude-code --version
```

---

### 7. Docker Desktop Won't Start

**Symptom:**
```
Cannot connect to the Docker daemon
```

**Cause:** Docker Desktop app not launched.

**Solution:**
1. Open **Applications** folder
2. Launch **Docker.app**
3. Grant System Extension permissions in System Settings
4. Wait for whale icon in menu bar
5. Verify: `docker ps`

---

### 8. Homebrew Install Hangs

**Symptom:** Install freezes at "Downloading Command Line Tools"

**Cause:** macOS software update server slow or stalled.

**Solution:**
```bash
# Cancel with Ctrl+C

# Install Xcode CLT first
xcode-select --install

# Try Homebrew again
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

### 9. Multiple Python Versions Conflict

**Symptom:**
```
$ which python3
/usr/bin/python3

$ python3 --version
Python 3.9.6
```

**Cause:** System Python (`/usr/bin/python3`) is still default.

**Solution:**
```bash
# Check all Python installations
which -a python3

# Prioritize Homebrew Python in PATH
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile

# Verify
which python3  # Should show /opt/homebrew/bin/python3
python3 --version  # Should show 3.12.x
```

---

### 10. GitHub CLI Auth Fails

**Symptom:**
```
gh auth login
error getting credentials
```

**Cause:** Keychain access issues or network problems.

**Solution:**
```bash
# Try browser-based auth
gh auth login --web

# Or use token
gh auth login --with-token < token.txt

# Check status
gh auth status
```

---

### 11. JSON Output File Not Created

**Symptom:** `~/setup-results.json` doesn't exist after script completes.

**Cause:** Script failed before JSON generation.

**Solution:**
```bash
# Check for errors in terminal output
# Look for [ERR] messages

# Run script with verbose output
bash -x setup-mac.sh 2>&1 | tee setup.log

# Check log for failures
grep ERR setup.log
```

---

### 12. Brew Wants to Update Everything

**Symptom:**
```
brew install git
==> Auto-updated Homebrew!
Updated 247 taps (homebrew/core, homebrew/cask, ...).
```

**Cause:** Homebrew auto-updates on first command after 24 hours.

**Solution:** This is normal behavior. Wait for it to complete, or:

```bash
# Disable auto-update for one command
HOMEBREW_NO_AUTO_UPDATE=1 brew install git

# Disable permanently (not recommended)
echo 'export HOMEBREW_NO_AUTO_UPDATE=1' >> ~/.zprofile
```

---

### 13. Node.js Version Too Old

**Symptom:**
```
$ node --version
v16.14.0
```

**Cause:** Old Node.js installation from nvm or previous Homebrew version.

**Solution:**
```bash
# Check Node.js source
which node

# If from Homebrew
brew upgrade node

# If from nvm
nvm install 22
nvm use 22
nvm alias default 22

# Verify
node --version  # Should be 22.x
```

---

### 14. Setup Script Permission Denied

**Symptom:**
```
bash: ./setup-mac.sh: Permission denied
```

**Cause:** Script not executable.

**Solution:**
```bash
chmod +x setup-mac.sh
bash setup-mac.sh
```

---

### 15. Homebrew Cask Requires Password

**Symptom:** Docker install prompts for password repeatedly.

**Cause:** Cask installations may require admin access for `/Applications`.

**Solution:** Enter your macOS user password when prompted. This is normal for GUI app installations.

---

## Testing Your Setup

After resolving issues, verify all tools:

```bash
#!/bin/bash

echo "=== Verification Script ==="
echo ""

echo "Homebrew: $(brew --version | head -1)"
echo "Git: $(git --version)"
echo "GitHub CLI: $(gh --version | head -1)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Python3: $(python3 --version)"
echo "pip: $(python3 -m pip --version)"
echo "Claude: $(claude --version 2>/dev/null || echo 'Not installed')"
echo "Docker: $(docker --version 2>/dev/null || echo 'Not installed')"

echo ""
echo "=== PATH Check ==="
echo "Homebrew prefix: $(brew --prefix)"
echo "npm global: $(npm config get prefix)"
echo "Python location: $(which python3)"
echo "Node location: $(which node)"

echo ""
echo "=== All systems go! ==="
```

Save as `verify-setup.sh`, make executable, and run:

```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

---

## Getting Help

If you encounter an issue not listed here:

1. **Check script output** for specific error messages
2. **Run with debugging**: `bash -x setup-mac.sh`
3. **Check system logs**: `Console.app` → Search for "brew" or "npm"
4. **Search Homebrew issues**: https://github.com/Homebrew/brew/issues
5. **Ask for help**: Include OS version, architecture, and exact error message

**Useful diagnostics to include:**

```bash
sw_vers -productVersion  # macOS version
uname -m  # Architecture
brew config  # Homebrew diagnostics
```
