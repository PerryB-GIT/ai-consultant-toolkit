# macOS Installer Build

## Prerequisites

Xcode Command Line Tools (ships with macOS):
```bash
xcode-select --install
```

No other dependencies needed. `pkgbuild` and `productbuild` are built into macOS.

## Build

```bash
cd installers/mac
bash build.sh
```

Output: `installers/mac/SupportForge-AI-Setup.pkg`

## What the installer does

1. macOS installer wizard opens (Welcome → Install → Done)
2. User clicks Install and enters their password
3. postinstall script runs:
   - Generates a unique session ID
   - Opens the live dashboard in the browser
   - Downloads `setup-mac.sh` from GitHub
   - Runs it as the logged-in user (not root) so Homebrew works correctly
4. Installer shows "Installation Successful"

## Important: Homebrew must NOT run as root

The postinstall script detects the logged-in user via `stat -f "%Su" /dev/console`
and uses `sudo -u $LOGGED_IN_USER` to run Homebrew-related commands. This is required
because Homebrew refuses to run as root.

## Delivery

- Upload `SupportForge-AI-Setup.pkg` to GitHub Releases
- Send the direct download link to client
- They double-click → Continue → Install → enter password → done
- Browser opens the live dashboard automatically

## Do NOT commit

Built binaries are gitignored: `*.pkg`, `*.dmg`, `flat/`
