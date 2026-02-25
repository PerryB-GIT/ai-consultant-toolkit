# Native Installers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build proper native installers for Windows (.exe via NSIS) and macOS (.pkg) that wrap the existing setup scripts and deliver a double-click install experience with no terminal required.

**Architecture:** Three parallel workstreams — Agent 1 builds the Windows NSIS installer, Agent 2 builds the macOS .pkg installer, Agent 3 does QA on both. Each installer downloads and runs the existing hosted setup script (setup-windows.ps1 / setup-mac.sh) passing a generated session ID so the live dashboard still works. No new install logic — the installers are thin wrappers.

**Tech Stack:**
- Windows: NSIS (Nullsoft Scriptable Install System) — free, widely used, produces .exe
- macOS: pkgbuild + productbuild (Apple CLI tools, built into Xcode Command Line Tools) — produces .pkg
- Both: GitHub Actions for build automation (optional stretch goal)
- Scripts hosted at: `https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/`

---

## REPO CONTEXT (read this before touching anything)

- **Repo root:** `C:\Users\Jakeb\ai-consultant-toolkit-web\` (Windows) or the cloned path on your machine
- **Mac setup script:** `scripts/mac/setup-mac.sh` — accepts `--session-id <id>` and `--skills-repo <url>`
- **Windows setup script:** `scripts/windows/setup-windows.ps1` — accepts `-SessionId <id>` and `-SkillsRepoUrl <url>`
- **Live dashboard:** `https://ai-consultant-toolkit.vercel.app/setup?session=<id>`
- **API endpoint:** `https://ai-consultant-toolkit.vercel.app/api/progress/<sessionId>`
- **Installer output dir:** `installers/` (create at repo root — do NOT commit built binaries, only source files)

---

# AGENT 1 — Windows NSIS Installer

**Your job:** Create the NSIS installer source file and a build script. The installer must:
1. Show a branded welcome screen ("Support Forge — AI Setup")
2. Generate a session ID (GUID)
3. Open the live dashboard URL in the default browser
4. Download and run `setup-windows.ps1` with the session ID embedded
5. Show a finish screen with next steps

**Prerequisites on build machine:** Install NSIS from https://nsis.sourceforge.io/Download (adds `makensis` to PATH)

---

### Task 1: Create installer directory structure

**Files:**
- Create: `installers/windows/SupportForge-AI-Setup.nsi`
- Create: `installers/windows/build.bat`
- Create: `installers/windows/assets/header.bmp` — note: placeholder, 150x57px BMP required by NSIS MUI

**Step 1: Create the directory**
```bash
mkdir -p installers/windows/assets
```

**Step 2: Create a placeholder header BMP (Windows PowerShell)**
```powershell
# This creates a minimal valid BMP file (white 150x57)
# Run this once on a Windows machine, or use any 150x57 BMP image
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(150, 57)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(26, 26, 46))  # dark navy background
$font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.DrawString("Support Forge", $font, $brush, 10, 20)
$g.Dispose()
$bmp.Save("installers\windows\assets\header.bmp")
$bmp.Dispose()
Write-Host "header.bmp created"
```

**Step 3: Commit**
```bash
git add installers/windows/assets/
git commit -m "feat: scaffold windows installer directory"
```

---

### Task 2: Write the NSIS installer script

**Files:**
- Create: `installers/windows/SupportForge-AI-Setup.nsi`

**Step 1: Write the full NSIS script**

Create `installers/windows/SupportForge-AI-Setup.nsi` with this exact content:

```nsi
; Support Forge AI Setup - Windows Installer
; Built with NSIS (https://nsis.sourceforge.io)
; Wraps setup-windows.ps1 with a GUI and live dashboard integration

!define PRODUCT_NAME "Support Forge AI Setup"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "Support Forge LLC"
!define PRODUCT_URL "https://support-forge.com"
!define SETUP_SCRIPT_URL "https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-windows.ps1"
!define DASHBOARD_URL "https://ai-consultant-toolkit.vercel.app/setup"

; Modern UI
!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

Name "${PRODUCT_NAME}"
OutFile "SupportForge-AI-Setup.exe"
InstallDir "$TEMP\SupportForgeSetup"
RequestExecutionLevel admin
ShowInstDetails show

; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "assets\header.bmp"
!define MUI_HEADERIMAGE_RIGHT
!define MUI_WELCOMEPAGE_TITLE "Welcome to Support Forge AI Setup"
!define MUI_WELCOMEPAGE_TEXT "This installer will set up Claude Code and all required tools on your computer.$\r$\n$\r$\nWhat will be installed:$\r$\n  - Chocolatey (package manager)$\r$\n  - Git & GitHub CLI$\r$\n  - Node.js$\r$\n  - Claude Code (AI assistant)$\r$\n  - 38 pre-built AI skills$\r$\n$\r$\nA browser window will open so you can watch the installation progress live."
!define MUI_FINISHPAGE_TITLE "Installation Started!"
!define MUI_FINISHPAGE_TEXT "The installation script is running in the background.$\r$\n$\r$\nNext steps:$\r$\n  1. Watch the live dashboard in your browser$\r$\n  2. When complete, open a new terminal and type: claude$\r$\n  3. Enter your Anthropic API key when prompted$\r$\n$\r$\nIf you have any issues, contact: support@support-forge.com"
!define MUI_FINISHPAGE_LINK "Visit Support Forge"
!define MUI_FINISHPAGE_LINK_LOCATION "${PRODUCT_URL}"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Language
!insertmacro MUI_LANGUAGE "English"

; Version info embedded in .exe
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "${PRODUCT_NAME}"
VIAddVersionKey "CompanyName" "${PRODUCT_PUBLISHER}"
VIAddVersionKey "LegalCopyright" "© 2026 ${PRODUCT_PUBLISHER}"
VIAddVersionKey "FileDescription" "${PRODUCT_NAME} Installer"
VIAddVersionKey "FileVersion" "${PRODUCT_VERSION}"

Section "Install" SecInstall

    ; Generate session ID from timestamp + random
    ; Format: setup-<timestamp>-<random6>
    System::Call 'kernel32::GetTickCount()i.r0'
    StrCpy $1 $0 6  ; last 6 chars of tick count as "random"
    System::Call 'kernel32::GetSystemTime(i) v'
    ; Use GUID for reliable uniqueness
    System::Call 'ole32::CoCreateGuid(g .r2)'
    ; Strip braces and dashes, take first 12 chars
    StrCpy $3 $2 12 1
    StrCpy $R0 "setup-$3"  ; e.g., setup-550E8400E29B

    ; Store session ID
    Var /GLOBAL SESSION_ID
    StrCpy $SESSION_ID $R0

    ; Open dashboard in browser with session ID
    ExecShell "open" "${DASHBOARD_URL}?session=$SESSION_ID"

    ; Download the PowerShell setup script
    SetOutPath "$TEMP\SupportForgeSetup"
    DetailPrint "Downloading setup script..."
    inetc::get /CAPTION "Downloading..." /BANNER "Getting setup script from Support Forge..." \
        "${SETUP_SCRIPT_URL}" "$TEMP\SupportForgeSetup\setup-windows.ps1" /END
    Pop $R1
    ${If} $R1 != "OK"
        MessageBox MB_OK|MB_ICONEXCLAMATION "Failed to download setup script. Please check your internet connection.$\r$\nError: $R1"
        Abort
    ${EndIf}

    ; Run the script as admin with session ID
    DetailPrint "Starting installation (Session: $SESSION_ID)..."
    DetailPrint "Watch progress at: ${DASHBOARD_URL}?session=$SESSION_ID"
    ExecWait 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$TEMP\SupportForgeSetup\setup-windows.ps1" -SessionId "$SESSION_ID"' $R2

    ${If} $R2 != 0
        DetailPrint "Setup script exited with code: $R2 (some tools may need manual steps)"
    ${Else}
        DetailPrint "Setup completed successfully!"
    ${EndIf}

SectionEnd
```

**Step 2: Verify the file was created**
```bash
cat installers/windows/SupportForge-AI-Setup.nsi | head -5
# Expected: ; Support Forge AI Setup - Windows Installer
```

**Step 3: Commit**
```bash
git add installers/windows/SupportForge-AI-Setup.nsi
git commit -m "feat: add NSIS installer script for Windows"
```

---

### Task 3: Write the Windows build script

**Files:**
- Create: `installers/windows/build.bat`

**Step 1: Write build.bat**

Create `installers/windows/build.bat` with this exact content:

```bat
@echo off
REM Build script for Support Forge Windows Installer
REM Requires: NSIS installed (makensis in PATH)
REM Run from: installers\windows\

echo ============================================
echo  Support Forge AI Setup - Windows Builder
echo ============================================
echo.

REM Check for makensis
where makensis >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: makensis not found in PATH.
    echo Install NSIS from: https://nsis.sourceforge.io/Download
    echo Then re-run this script.
    pause
    exit /b 1
)

REM Check for required plugin: inetc (internet download plugin)
REM inetc must be installed to NSIS Plugins folder
if not exist "%ProgramFiles(x86)%\NSIS\Plugins\x86-unicode\INetC.dll" (
    echo WARNING: INetC plugin not found.
    echo Download from: https://nsis.sourceforge.io/Inetc_plug-in
    echo Extract INetC.dll to: %ProgramFiles%\NSIS\Plugins\x86-unicode\
    echo.
    echo Press any key to continue anyway (build may fail)...
    pause >nul
)

REM Generate version tag from date
for /f "tokens=1-3 delims=/" %%a in ("%DATE%") do (
    set BUILDDATE=%%c%%a%%b
)

echo Building SupportForge-AI-Setup.exe ...
echo.

makensis /V3 /DOUTFILE="SupportForge-AI-Setup.exe" SupportForge-AI-Setup.nsi

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo  BUILD SUCCESSFUL
    echo  Output: installers\windows\SupportForge-AI-Setup.exe
    echo ============================================
    echo.
    echo File size:
    for %%F in (SupportForge-AI-Setup.exe) do echo   %%~zF bytes
) else (
    echo.
    echo BUILD FAILED - check errors above
    exit /b 1
)
pause
```

**Step 2: Commit**
```bash
git add installers/windows/build.bat
git commit -m "feat: add Windows installer build script"
```

---

### Task 4: Add inetc plugin note and README

**Files:**
- Create: `installers/windows/README.md`

**Step 1: Write README**

```markdown
# Windows Installer Build

## Prerequisites

1. Install NSIS: https://nsis.sourceforge.io/Download
2. Install inetc plugin (for downloading scripts):
   - Download from: https://nsis.sourceforge.io/Inetc_plug-in
   - Extract `INetC.dll` to `C:\Program Files (x86)\NSIS\Plugins\x86-unicode\`

## Build

```bat
cd installers\windows
build.bat
```

Output: `installers\windows\SupportForge-AI-Setup.exe`

## What the installer does

1. Shows a branded welcome screen
2. Generates a unique session ID
3. Opens the live dashboard in the browser (`https://ai-consultant-toolkit.vercel.app/setup?session=<id>`)
4. Downloads `setup-windows.ps1` from GitHub
5. Runs it as Administrator with the session ID
6. Shows a finish screen with next steps

## Delivery

- Upload `SupportForge-AI-Setup.exe` to GitHub Releases or a file host
- Send the direct download link to the client
- They double-click, click Next → Install, done

## Do NOT commit

- `SupportForge-AI-Setup.exe` (built binary — add to .gitignore)
```

**Step 2: Update .gitignore to exclude built binaries**

Add to the root `.gitignore` (or create if missing):
```
# Installer binaries (built artifacts)
installers/**/*.exe
installers/**/*.pkg
installers/**/*.dmg
installers/mac/flat/
installers/mac/root/
```

**Step 3: Commit**
```bash
git add installers/windows/README.md
git add .gitignore
git commit -m "docs: add Windows installer README and gitignore for binaries"
```

---

# AGENT 2 — macOS .pkg Installer

**Your job:** Create the macOS .pkg installer using Apple's `pkgbuild` and `productbuild` CLI tools. The installer must:
1. Show a branded welcome screen
2. Install a small helper script to `/usr/local/bin/support-forge-setup`
3. Run a postinstall script that: generates a session ID, opens the dashboard in Safari/Chrome, and runs `setup-mac.sh`

**Prerequisites on build machine:** macOS with Xcode Command Line Tools (`xcode-select --install`). No third-party tools needed — `pkgbuild` and `productbuild` are built in.

---

### Task 5: Create macOS installer directory structure

**Files:**
- Create: `installers/mac/`
- Create: `installers/mac/scripts/postinstall`
- Create: `installers/mac/root/usr/local/bin/support-forge-setup`
- Create: `installers/mac/resources/welcome.html`
- Create: `installers/mac/resources/distribution.xml`
- Create: `installers/mac/build.sh`

**Step 1: Create directories**
```bash
mkdir -p installers/mac/scripts
mkdir -p installers/mac/root/usr/local/bin
mkdir -p installers/mac/resources
mkdir -p installers/mac/flat
```

**Step 2: Commit**
```bash
git add installers/mac/
git commit -m "feat: scaffold macOS installer directory"
```

---

### Task 6: Write the postinstall script

This is the heart of the macOS installer — runs after the package is installed.

**Files:**
- Create: `installers/mac/scripts/postinstall`

**Step 1: Write postinstall**

Create `installers/mac/scripts/postinstall` with this exact content:

```bash
#!/bin/bash
# postinstall — runs as root after package install
# Opens dashboard and kicks off setup-mac.sh

set -e

# Generate session ID
SESSION_ID="setup-$(date +%s)-$(LC_ALL=C tr -dc 'a-z0-9' </dev/urandom 2>/dev/null | head -c 6 || echo 'mac001')"

DASHBOARD_URL="https://ai-consultant-toolkit.vercel.app/setup?session=${SESSION_ID}"
SCRIPT_URL="https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/mac/setup-mac.sh"

# Open dashboard in default browser
# Try to open as the actual logged-in user (not root)
LOGGED_IN_USER=$(stat -f "%Su" /dev/console 2>/dev/null || echo "")
if [[ -n "$LOGGED_IN_USER" && "$LOGGED_IN_USER" != "root" ]]; then
    sudo -u "$LOGGED_IN_USER" open "$DASHBOARD_URL" 2>/dev/null || open "$DASHBOARD_URL" 2>/dev/null || true
else
    open "$DASHBOARD_URL" 2>/dev/null || true
fi

# Download and run setup script
TMP_SCRIPT="/tmp/support-forge-setup-$SESSION_ID.sh"
curl -fsSL "$SCRIPT_URL" -o "$TMP_SCRIPT"
chmod +x "$TMP_SCRIPT"

# Run as the logged-in user (not root) so Homebrew installs correctly
if [[ -n "$LOGGED_IN_USER" && "$LOGGED_IN_USER" != "root" ]]; then
    sudo -u "$LOGGED_IN_USER" bash "$TMP_SCRIPT" --session-id "$SESSION_ID"
else
    bash "$TMP_SCRIPT" --session-id "$SESSION_ID"
fi

# Cleanup
rm -f "$TMP_SCRIPT"

exit 0
```

**Step 2: Make it executable**
```bash
chmod +x installers/mac/scripts/postinstall
```

**Step 3: Verify**
```bash
head -5 installers/mac/scripts/postinstall
# Expected: #!/bin/bash
ls -la installers/mac/scripts/postinstall
# Expected: -rwxr-xr-x ...
```

**Step 4: Commit**
```bash
git add installers/mac/scripts/postinstall
git commit -m "feat: add macOS postinstall script"
```

---

### Task 7: Write the distribution XML and welcome HTML

**Files:**
- Create: `installers/mac/resources/welcome.html`
- Create: `installers/mac/resources/distribution.xml`

**Step 1: Write welcome.html**

Create `installers/mac/resources/welcome.html`:

```html
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, sans-serif; padding: 20px; color: #1a1a2e; }
  h1 { color: #4f46e5; font-size: 22px; }
  ul { line-height: 2; }
  .note { background: #f0f0ff; border-left: 4px solid #4f46e5; padding: 10px 14px; border-radius: 4px; margin-top: 16px; }
</style>
</head>
<body>
<h1>Welcome to Support Forge AI Setup</h1>
<p>This installer will set up Claude Code and all required tools on your Mac.</p>
<p><strong>What will be installed:</strong></p>
<ul>
  <li>Homebrew (package manager)</li>
  <li>Git &amp; GitHub CLI</li>
  <li>Node.js (via nvm)</li>
  <li>Claude Code (AI assistant)</li>
  <li>38 pre-built AI skills</li>
</ul>
<div class="note">
  <strong>Note:</strong> A browser window will open after you click Install so you can watch the installation progress live.
</div>
</body>
</html>
```

**Step 2: Write distribution.xml**

Create `installers/mac/resources/distribution.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<installer-gui-script minSpecVersion="2">
    <title>Support Forge AI Setup</title>
    <organization>com.supportforge</organization>
    <domains enable_localSystem="true"/>
    <options customize="never" require-scripts="true" hostArchitectures="x86_64,arm64"/>
    <welcome file="welcome.html" mime-type="text/html"/>
    <pkg-ref id="com.supportforge.aisetup"/>
    <choices-outline>
        <line choice="default">
            <line choice="com.supportforge.aisetup"/>
        </line>
    </choices-outline>
    <choice id="default"/>
    <choice id="com.supportforge.aisetup" visible="false">
        <pkg-ref id="com.supportforge.aisetup"/>
    </choice>
    <pkg-ref id="com.supportforge.aisetup" version="1.0.0" onConclusion="none">SupportForge-AI-Setup-component.pkg</pkg-ref>
</installer-gui-script>
```

**Step 3: Commit**
```bash
git add installers/mac/resources/
git commit -m "feat: add macOS installer welcome screen and distribution XML"
```

---

### Task 8: Write the macOS build script

**Files:**
- Create: `installers/mac/build.sh`

**Step 1: Write build.sh**

Create `installers/mac/build.sh`:

```bash
#!/bin/bash
# Build script for Support Forge macOS .pkg installer
# Requires: macOS + Xcode Command Line Tools (xcode-select --install)
# Run from: installers/mac/

set -e

COMPONENT_PKG="flat/SupportForge-AI-Setup-component.pkg"
FINAL_PKG="SupportForge-AI-Setup.pkg"
IDENTIFIER="com.supportforge.aisetup"
VERSION="1.0.0"
INSTALL_LOCATION="/"

echo "============================================"
echo " Support Forge AI Setup - macOS Builder"
echo "============================================"
echo ""

# Check for required tools
for tool in pkgbuild productbuild; do
    if ! command -v $tool &>/dev/null; then
        echo "ERROR: $tool not found. Install Xcode Command Line Tools:"
        echo "  xcode-select --install"
        exit 1
    fi
done

# Clean old build artifacts
rm -f "$COMPONENT_PKG" "$FINAL_PKG"
mkdir -p flat

# Step 1: Build component package (includes postinstall script + payload)
echo "Building component package..."
pkgbuild \
    --root root \
    --scripts scripts \
    --identifier "$IDENTIFIER" \
    --version "$VERSION" \
    --install-location "$INSTALL_LOCATION" \
    "$COMPONENT_PKG"

echo "Component package built: $COMPONENT_PKG"

# Step 2: Build final product archive (includes welcome screen + distribution XML)
echo "Building final installer package..."
productbuild \
    --distribution resources/distribution.xml \
    --resources resources \
    --package-path flat \
    "$FINAL_PKG"

echo ""
echo "============================================"
echo " BUILD SUCCESSFUL"
echo " Output: installers/mac/$FINAL_PKG"
echo "============================================"
echo ""
echo "File size:"
du -sh "$FINAL_PKG"
echo ""
echo "To test: open $FINAL_PKG"
```

**Step 2: Make it executable**
```bash
chmod +x installers/mac/build.sh
```

**Step 3: Add a placeholder file in root/ so pkgbuild doesn't fail on empty payload**

`pkgbuild` requires at least one file in `--root`. Create a placeholder:
```bash
mkdir -p installers/mac/root/usr/local/share/support-forge
echo "Support Forge AI Setup 1.0.0" > installers/mac/root/usr/local/share/support-forge/VERSION
```

**Step 4: Commit**
```bash
git add installers/mac/build.sh installers/mac/root/
git commit -m "feat: add macOS installer build script"
```

---

### Task 9: Add macOS installer README

**Files:**
- Create: `installers/mac/README.md`

**Step 1: Write README**

```markdown
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

- Upload `SupportForge-AI-Setup.pkg` to GitHub Releases or a file host
- Send the direct download link to client
- They double-click, click Continue → Install → enter password → done

## Do NOT commit

Built binaries are gitignored: `*.pkg`, `*.dmg`, `flat/`
```

**Step 2: Commit**
```bash
git add installers/mac/README.md
git commit -m "docs: add macOS installer README"
```

---

# AGENT 3 — QA & Integration

**Your job:** Test both installers end-to-end and update the web UI to offer installer downloads as the primary CTA alongside the terminal command.

---

### Task 10: QA the Windows installer (simulation)

**Goal:** Verify the NSIS script is syntactically valid and would produce the correct behavior.

**Step 1: Install NSIS on a Windows machine**
```
Download: https://nsis.sourceforge.io/Download
Install: nsis-3.x-setup.exe
Verify: makensis /VERSION
Expected: v3.x
```

**Step 2: Install the inetc plugin**
```
Download: https://nsis.sourceforge.io/Inetc_plug-in
Copy INetC.dll to: C:\Program Files (x86)\NSIS\Plugins\x86-unicode\
```

**Step 3: Run the build**
```bat
cd installers\windows
build.bat
Expected output:
  BUILD SUCCESSFUL
  Output: installers\windows\SupportForge-AI-Setup.exe
```

**Step 4: Smoke test the .exe**
```
- Right-click → Run as Administrator
- Welcome screen appears with Support Forge branding
- Click Install
- Browser opens to https://ai-consultant-toolkit.vercel.app/setup?session=setup-...
- Terminal/PowerShell window appears running setup-windows.ps1
- Dashboard updates live
- Finish screen appears
```

**Step 5: Document results**

Create `installers/windows/QA-RESULTS.md`:
```markdown
# Windows Installer QA Results

Date: YYYY-MM-DD
NSIS Version: x.x
Test Machine: Windows 10/11

## Build
- [ ] makensis compiles without errors
- [ ] .exe file created successfully
- [ ] File size reasonable (< 5MB)

## Runtime
- [ ] Welcome screen displays correctly
- [ ] Branding looks right
- [ ] Browser opens with correct session URL
- [ ] PowerShell script downloads and runs
- [ ] Dashboard updates live during install
- [ ] Finish screen appears after completion

## Issues found
(list any)
```

**Step 6: Commit**
```bash
git add installers/windows/QA-RESULTS.md
git commit -m "qa: add Windows installer QA results template"
```

---

### Task 11: QA the macOS installer (simulation)

**Goal:** Build the .pkg on a Mac and verify the install flow.

**Step 1: Ensure Xcode Command Line Tools are installed**
```bash
xcode-select --print-path
# Expected: /Library/Developer/CommandLineTools (or Xcode path)
# If missing: xcode-select --install
```

**Step 2: Build**
```bash
cd installers/mac
bash build.sh
# Expected:
#  BUILD SUCCESSFUL
#  Output: installers/mac/SupportForge-AI-Setup.pkg
```

**Step 3: Inspect the package contents**
```bash
pkgutil --expand SupportForge-AI-Setup.pkg /tmp/pkg-inspect
ls /tmp/pkg-inspect/
# Expected: Distribution, Resources/, SupportForge-AI-Setup-component.pkg

pkgutil --expand /tmp/pkg-inspect/SupportForge-AI-Setup-component.pkg /tmp/component-inspect
ls /tmp/component-inspect/
# Expected: Scripts/, Payload

# Verify postinstall is in there
ls /tmp/component-inspect/Scripts/
# Expected: postinstall
```

**Step 4: Test-run the postinstall in dry-run mode**
```bash
# Preview what postinstall would do (without actually installing)
bash -n installers/mac/scripts/postinstall
# Expected: no errors (syntax check passes)

# Check the session ID generation logic
bash -c '
SESSION_ID="setup-$(date +%s)-$(LC_ALL=C tr -dc "a-z0-9" </dev/urandom 2>/dev/null | head -c 6)"
echo "Generated: $SESSION_ID"
[[ "$SESSION_ID" =~ ^setup-[0-9]+-[a-z0-9]{6}$ ]] && echo "Format: PASS" || echo "Format: FAIL"
'
```

**Step 5: Full install test (on a test Mac)**
```
- Double-click SupportForge-AI-Setup.pkg
- Installer wizard opens
- Welcome screen shows Support Forge branding
- Click Continue → Install → enter password
- Browser opens to https://ai-consultant-toolkit.vercel.app/setup?session=setup-...
- Terminal shows setup-mac.sh running
- Dashboard updates live
- Installer shows "The installation was successful"
```

**Step 6: Document results**

Create `installers/mac/QA-RESULTS.md`:
```markdown
# macOS Installer QA Results

Date: YYYY-MM-DD
macOS Version: x.x
Architecture: Apple Silicon / Intel
Test Machine: (describe)

## Build
- [ ] build.sh completes without errors
- [ ] .pkg file created successfully
- [ ] pkgutil --expand shows correct structure

## Runtime
- [ ] Welcome screen displays correctly
- [ ] Branding looks right
- [ ] Installer requires password (runs as admin)
- [ ] Browser opens with correct session URL
- [ ] setup-mac.sh runs as logged-in user (not root)
- [ ] Dashboard updates live during install
- [ ] Installer shows "Installation was successful"

## Issues found
(list any)
```

**Step 7: Commit**
```bash
git add installers/mac/QA-RESULTS.md
git commit -m "qa: add macOS installer QA results template"
```

---

### Task 12: Update the web UI to offer installer downloads

**Goal:** Add a "Download Installer" option to the landing page alongside the existing terminal command. Clients who prefer a GUI experience can download the .exe or .pkg directly.

**Files:**
- Modify: `app/setup/page.tsx`

**Step 1: Read the current page**
```bash
cat app/setup/page.tsx
```

**Step 2: Find the OS card section**

Locate the section rendering the Windows and Mac cards with the copy buttons. It looks like:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Windows card */}
  {/* Mac card */}
</div>
```

**Step 3: Add download buttons below the copy buttons**

In each OS card, after the existing `<button>Copy ... Command</button>` and its helper text, add a download button:

For Windows card, add:
```tsx
<div className="mt-3 text-center">
  <span className="text-zinc-500 text-xs">— or —</span>
</div>
<a
  href="https://github.com/PerryB-GIT/ai-consultant-toolkit/releases/latest/download/SupportForge-AI-Setup.exe"
  className="mt-2 flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-zinc-700 text-zinc-300 hover:border-indigo-500 hover:text-white transition-colors text-sm"
  target="_blank"
  rel="noopener noreferrer"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
  Download .exe installer
</a>
```

For Mac card, add:
```tsx
<div className="mt-3 text-center">
  <span className="text-zinc-500 text-xs">— or —</span>
</div>
<a
  href="https://github.com/PerryB-GIT/ai-consultant-toolkit/releases/latest/download/SupportForge-AI-Setup.pkg"
  className="mt-2 flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-zinc-700 text-zinc-300 hover:border-indigo-500 hover:text-white transition-colors text-sm"
  target="_blank"
  rel="noopener noreferrer"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
  Download .pkg installer
</a>
```

**Step 4: Verify the page builds**
```bash
cd /path/to/ai-consultant-toolkit-web
npm run build
# Expected: compiled successfully
```

**Step 5: Screenshot the updated card to verify layout**
```bash
npx playwright screenshot --browser=firefox --full-page http://localhost:3000/setup /tmp/updated-ui.png
```

**Step 6: Commit**
```bash
git add app/setup/page.tsx
git commit -m "feat: add installer download buttons to setup page"
```

---

### Task 13: Push all branches and final verification

**Step 1: Ensure all commits are on main**
```bash
git log --oneline -15
# Should see all the installer commits
```

**Step 2: Push**
```bash
git push origin main
```

**Step 3: Verify Vercel redeploys the updated UI**
```bash
# Wait ~60 seconds then:
curl -s https://ai-consultant-toolkit.vercel.app/setup | grep -i "Download .exe"
# Expected: line containing the download link
```

**Step 4: Create GitHub Release placeholders**

On GitHub, create a release `v1.0.0` with:
- Tag: `v1.0.0`
- Title: "Support Forge AI Setup v1.0.0"
- Body: "Initial release — Windows .exe and macOS .pkg installers"
- Upload both built binaries as release assets

```bash
# Using gh CLI (run from repo root after building on the appropriate OS):
gh release create v1.0.0 \
  --title "Support Forge AI Setup v1.0.0" \
  --notes "Initial release — Windows .exe and macOS .pkg installers" \
  installers/windows/SupportForge-AI-Setup.exe \
  installers/mac/SupportForge-AI-Setup.pkg
```

**Step 5: Final smoke test of download links**
```bash
# Verify the .exe download link resolves
curl -sI "https://github.com/PerryB-GIT/ai-consultant-toolkit/releases/latest/download/SupportForge-AI-Setup.exe" | grep -i "location\|HTTP"
# Expected: HTTP/2 302 redirect to release asset URL

curl -sI "https://github.com/PerryB-GIT/ai-consultant-toolkit/releases/latest/download/SupportForge-AI-Setup.pkg" | grep -i "location\|HTTP"
# Expected: HTTP/2 302 redirect to release asset URL
```

**Step 6: Commit final status**
```bash
git commit --allow-empty -m "chore: v1.0.0 installers released to GitHub Releases"
```

---

## Summary: Who Does What

| Agent | Tasks | Platform Needed |
|-------|-------|-----------------|
| Agent 1 | Tasks 1-4 (Windows NSIS) | Windows with NSIS installed |
| Agent 2 | Tasks 5-9 (macOS .pkg) | macOS with Xcode CLI tools |
| Agent 3 | Tasks 10-13 (QA + UI update) | Both platforms + web server |

## Files Created

```
installers/
  windows/
    SupportForge-AI-Setup.nsi    ← NSIS script (source)
    build.bat                     ← build command
    assets/header.bmp             ← installer header image
    README.md
    QA-RESULTS.md
  mac/
    scripts/postinstall           ← runs after install, kicks off setup-mac.sh
    root/usr/local/share/support-forge/VERSION  ← payload placeholder
    resources/welcome.html        ← installer welcome screen
    resources/distribution.xml   ← installer structure definition
    build.sh                      ← build command
    README.md
    QA-RESULTS.md
app/
  setup/
    page.tsx                      ← updated with download buttons
```

## Delivery to clients

Once built and uploaded to GitHub Releases:
- **Windows client:** Download `SupportForge-AI-Setup.exe` → double-click → Run as Admin → done
- **Mac client:** Download `SupportForge-AI-Setup.pkg` → double-click → Continue → Install → enter password → done
- Both open the live dashboard automatically with a session ID baked in
- Perry can monitor remotely via `?session=<id>` as always
