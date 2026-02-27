# Installer CI + Onboarding Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build GitHub Actions CI that auto-builds Mac + Windows installers on every release, and wire up the full client onboarding workflow from booking through follow-up.

**Architecture:** Two parallel tracks — Track A adds a `.github/workflows/release.yml` matrix job that builds both platforms and uploads to GitHub Releases; Track B updates skill files and installer URLs to point to `/releases/latest/download/` and adds post-install verification. Both tracks are independent and can be executed simultaneously by separate subagents.

**Tech Stack:** GitHub Actions, electron-builder (Windows .exe), pkgbuild/productbuild (Mac .pkg), Bash, PowerShell, Claude Code Skills (SKILL.md files)

---

## TRACK A: GitHub Actions CI for Mac + Windows Builds

### Task A1: Create GitHub Actions workflow file

**Files:**
- Create: `.github/workflows/release.yml`

**Step 1: Create the directory**

```bash
mkdir -p /c/Users/Jakeb/ai-consultant-toolkit-web/.github/workflows
```

**Step 2: Write the workflow file**

Create `.github/workflows/release.yml` with this exact content:

```yaml
name: Build and Release Installers

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build-windows:
    runs-on: windows-latest
    defaults:
      run:
        working-directory: installers/electron
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build Windows installer
        run: npm run build:win

      - name: Upload Windows artifact
        uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: installers/electron/dist/SupportForge-AI-Setup.exe

  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build macOS installer
        working-directory: installers/mac
        run: bash build.sh

      - name: Upload macOS artifact
        uses: actions/upload-artifact@v4
        with:
          name: mac-installer
          path: installers/mac/SupportForge-AI-Setup.pkg

  release:
    needs: [build-windows, build-mac]
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')
    permissions:
      contents: write
    steps:
      - name: Download Windows artifact
        uses: actions/download-artifact@v4
        with:
          name: windows-installer

      - name: Download macOS artifact
        uses: actions/download-artifact@v4
        with:
          name: mac-installer

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            SupportForge-AI-Setup.exe
            SupportForge-AI-Setup.pkg
          generate_release_notes: false
          body: |
            ## Support Forge AI Setup

            **Windows:** Download `SupportForge-AI-Setup.exe` and run it. Click Yes on the UAC prompt.

            **Mac:** Download `SupportForge-AI-Setup.pkg` and double-click to install.

            Both installers set up Claude Code and all required tools automatically.
```

**Step 3: Verify the file exists and is valid YAML**

```bash
cat /c/Users/Jakeb/ai-consultant-toolkit-web/.github/workflows/release.yml | head -20
```

Expected: First 20 lines of the workflow file.

**Step 4: Commit**

```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add .github/workflows/release.yml
git commit -m "ci: add GitHub Actions workflow to build Mac and Windows installers on release"
```

---

### Task A2: Fix electron-builder script for CI compatibility

**Files:**
- Modify: `installers/electron/package.json`

The `build:win` script must work headlessly in CI (no display). Verify it uses `--headless` flag or correct electron-builder target.

**Step 1: Check current build scripts**

```bash
cat /c/Users/Jakeb/ai-consultant-toolkit-web/installers/electron/package.json | grep -A 10 '"scripts"'
```

**Step 2: Ensure build:win script uses correct target**

In `installers/electron/package.json`, the `build:win` script should be:

```json
"build:win": "electron-builder --win nsis --x64"
```

And `build:mac` should be:

```json
"build:mac": "electron-builder --mac pkg --x64"
```

If they already match, skip to Step 4.

**Step 3: Update if needed**

Edit `installers/electron/package.json` to set the correct script values.

**Step 4: Commit if changed**

```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add installers/electron/package.json
git commit -m "fix: ensure electron-builder scripts work headlessly in CI"
```

---

### Task A3: Verify mac build.sh produces correct output path

**Files:**
- Read: `installers/mac/build.sh`
- Read: `installers/mac/resources/distribution.xml` (if exists)

**Step 1: Confirm output path matches workflow**

The workflow expects the `.pkg` at `installers/mac/SupportForge-AI-Setup.pkg`. Confirm `build.sh` outputs there:

```bash
grep -n "FINAL_PKG\|SupportForge" /c/Users/Jakeb/ai-consultant-toolkit-web/installers/mac/build.sh
```

Expected output should include `FINAL_PKG="SupportForge-AI-Setup.pkg"`.

**Step 2: Confirm mac installer scripts directory exists**

```bash
ls /c/Users/Jakeb/ai-consultant-toolkit-web/installers/mac/scripts/
```

Expected: `postinstall` file exists (the script that runs after .pkg installs).

**Step 3: Read postinstall to verify it downloads and runs setup-mac.sh**

```bash
cat /c/Users/Jakeb/ai-consultant-toolkit-web/installers/mac/scripts/postinstall
```

Expected: Script downloads from `raw.githubusercontent.com/.../scripts/mac/setup-mac.sh` and runs it.

**Step 4: Commit a no-op note if all checks pass**

```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git commit --allow-empty -m "chore: verified mac build.sh output path matches CI workflow"
```

---

### Task A4: Tag v1.1.0 to trigger first CI build

**Step 1: Confirm all A-track commits are on main**

```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web && git log --oneline -5
```

**Step 2: Update version in electron package.json**

In `installers/electron/package.json`, set:
```json
"version": "1.1.0"
```

**Step 3: Commit the version bump**

```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add installers/electron/package.json
git commit -m "chore: bump version to 1.1.0"
```

**Step 4: Push to main**

```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web && git push origin main
```

**Step 5: Create and push tag**

```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git tag v1.1.0
git push origin v1.1.0
```

**Step 6: Monitor the Actions run**

```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web && gh run list --limit 5
```

Wait ~10 minutes, then:

```bash
gh run view --log-failed
```

Expected: All jobs pass. Release v1.1.0 created with both `.exe` and `.pkg` assets.

---

## TRACK B: Onboarding Workflow Automation

### Task B1: Update installer URLs to use /releases/latest/download/

**Files:**
- Modify: `C:\Users\Jakeb\.claude\skills\se-prep\SKILL.md`

Currently the Windows checklist has a hardcoded v1.0.0 URL. Switch to the "latest" permalink so it always points to the current release.

**Step 1: Read the current se-prep skill**

```bash
cat /c/Users/Jakeb/.claude/skills/se-prep/SKILL.md
```

**Step 2: Replace the hardcoded URL**

Old:
```
https://github.com/PerryB-GIT/ai-consultant-toolkit/releases/download/v1.0.0/SupportForge-AI-Setup.exe
```

New:
```
https://github.com/PerryB-GIT/ai-consultant-toolkit/releases/latest/download/SupportForge-AI-Setup.exe
```

Edit `C:\Users\Jakeb\.claude\skills\se-prep\SKILL.md` to make this replacement.

**Step 3: Add Mac installer to Mac checklist**

Find the `[MAC CHECKLIST]` section. After the Homebrew step, add:

```
□ Download and run the installer before our session (takes 5-10 minutes, installs everything automatically):
  https://github.com/PerryB-GIT/ai-consultant-toolkit/releases/latest/download/SupportForge-AI-Setup.pkg
  Double-click the .pkg file and follow the prompts. Enter your Mac password when asked.
```

**Step 4: Verify the full checklist looks correct**

```bash
grep -A 20 "WINDOWS CHECKLIST\|MAC CHECKLIST" /c/Users/Jakeb/.claude/skills/se-prep/SKILL.md
```

**Step 5: No git commit needed** — skill files are not in the `ai-consultant-toolkit-web` repo. Done.

---

### Task B2: Add post-install verification step to se-prep

**Files:**
- Modify: `C:\Users\Jakeb\.claude\skills\se-prep\SKILL.md`

After the installer runs, Perry needs to be able to confirm tools installed correctly at the start of each session. Add a verification step to the Session Brief output.

**Step 1: Find Output 2 (SE Session Brief) in se-prep**

```bash
grep -n "Output 2\|SESSION BRIEF\|RECOMMENDED SESSION FLOW" /c/Users/Jakeb/.claude/skills/se-prep/SKILL.md
```

**Step 2: Add verification step to Recommended Session Flow**

In the `RECOMMENDED SESSION FLOW` template section, update step 1 to always be:

```
1. Verify install — ask each participant to open a terminal and run: claude --version
   Expected output: claude version X.X.X
   If "command not found": troubleshoot with /se-install skill
```

Edit the SKILL.md to add this.

**Step 3: Verify the change**

```bash
grep -A 8 "RECOMMENDED SESSION FLOW" /c/Users/Jakeb/.claude/skills/se-prep/SKILL.md
```

---

### Task B3: Add post-install verification to the installer itself

**Files:**
- Modify: `scripts/windows/setup-windows.ps1`
- Modify: `scripts/mac/setup-mac.sh`

At the end of each setup script, print a clear verification summary so the log window shows what was installed.

**Step 1: Read the current Windows script tail**

```bash
tail -30 /c/Users/Jakeb/ai-consultant-toolkit-web/scripts/windows/setup-windows.ps1
```

**Step 2: Add verification block to Windows script**

At the very end of `setup-windows.ps1`, before any exit, add:

```powershell
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$checks = @(
    @{ Name = "Git"; Cmd = "git --version" },
    @{ Name = "Node.js"; Cmd = "node --version" },
    @{ Name = "GitHub CLI"; Cmd = "gh --version" },
    @{ Name = "Claude Code"; Cmd = "claude --version" }
)

foreach ($check in $checks) {
    try {
        $result = Invoke-Expression $check.Cmd 2>&1 | Select-Object -First 1
        Write-Host "  [OK] $($check.Name): $result" -ForegroundColor Green
    } catch {
        Write-Host "  [MISSING] $($check.Name) - may need a new terminal" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Installation complete. Open a NEW terminal and type: claude" -ForegroundColor Green
```

**Step 3: Read the current Mac script tail**

```bash
tail -30 /c/Users/Jakeb/ai-consultant-toolkit-web/scripts/mac/setup-mac.sh
```

**Step 4: Add verification block to Mac script**

At the very end of `setup-mac.sh`, before any exit, add:

```bash
echo ""
echo "========================================"
echo " VERIFICATION"
echo "========================================"

for tool in "git --version" "node --version" "gh --version" "claude --version"; do
    name=$(echo $tool | awk '{print $1}')
    result=$($tool 2>/dev/null | head -1)
    if [ -n "$result" ]; then
        echo "  [OK] $name: $result"
    else
        echo "  [MISSING] $name - may need a new terminal"
    fi
done

echo ""
echo "Installation complete. Open a NEW terminal and type: claude"
```

**Step 5: Commit both script changes**

```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add scripts/windows/setup-windows.ps1 scripts/mac/setup-mac.sh
git commit -m "feat: add post-install verification summary to setup scripts"
```

---

### Task B4: Update se-followup skill with installer version awareness

**Files:**
- Read: `C:\Users\Jakeb\.claude\skills\se-followup\SKILL.md`
- Modify if needed

**Step 1: Read the current se-followup skill**

```bash
cat /c/Users/Jakeb/.claude/skills/se-followup/SKILL.md
```

**Step 2: Check if it mentions install status**

```bash
grep -i "install\|version\|tool" /c/Users/Jakeb/.claude/skills/se-followup/SKILL.md
```

**Step 3: If no install verification in follow-up, add action item template**

In the follow-up email template's ACTION ITEMS section, add:

```
□ Confirm all tools verified: git, node, gh, claude (run: claude --version)
```

This ensures every follow-up nudges clients who had install issues to complete verification.

**Step 4: Save changes if made.**

---

### Task B5: Commit memory file with plan summary

**Files:**
- Modify: `C:\Users\Jakeb\.claude\projects\C--Users-Jakeb\memory\MEMORY.md`

**Step 1: Add installer + onboarding plan section to MEMORY.md**

Add under a new heading `## Installer + Onboarding System`:

```markdown
## Installer + Onboarding System

### Current State (as of 2026-02-27)
- Windows .exe: v1.0.0 live at GitHub Releases (PerryB-GIT/ai-consultant-toolkit)
- Mac .pkg: source complete in installers/mac/, needs CI to build
- Plan doc: ai-consultant-toolkit-web/docs/plans/2026-02-27-installer-ci-onboarding.md

### GitHub Actions CI (Track A)
- Workflow: .github/workflows/release.yml
- Trigger: push tag v*.* to main
- Builds: Windows .exe (windows-latest) + Mac .pkg (macos-latest)
- Releases both automatically

### URLs (always use /latest/ not version-pinned)
- Windows: https://github.com/PerryB-GIT/ai-consultant-toolkit/releases/latest/download/SupportForge-AI-Setup.exe
- Mac: https://github.com/PerryB-GIT/ai-consultant-toolkit/releases/latest/download/SupportForge-AI-Setup.pkg

### Onboarding Workflow (Track B)
- se-prep skill: sends installer link to clients 24hrs before session
- se-followup skill: recap + action items post-session
- Setup scripts: post-install verification summary at end
- Session flow: book → pre-email with installer → install → session (verify claude --version) → follow-up
```

---

## Execution Order

Track A and Track B are fully independent. Dispatch simultaneously:

| Agent | Tasks | Estimated commits |
|-------|-------|-------------------|
| Agent 1 (Track A) | A1 → A2 → A3 → A4 | 4-5 commits + tag |
| Agent 2 (Track B) | B1 → B2 → B3 → B4 → B5 | 3-4 commits + skill edits |

After both complete:
- Verify GitHub Actions run passed (Agent 1)
- Verify `gh release view v1.1.0` shows both `.exe` and `.pkg`
- Test pre-session email via `/se-prep` with a mock participant
