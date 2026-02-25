# Design: Electron Cross-Platform Installer

**Date:** 2026-02-25
**Author:** Perry Bailes / Support Forge LLC
**Status:** Approved

---

## Overview

A single Electron application that produces branded installers for both Windows and macOS from one codebase. Replaces the macOS gap (currently only a raw shell script) and unifies the installer story across platforms.

---

## Goals

- Client double-clicks a file on either Windows or macOS and gets a wizard experience
- Wizard: Welcome → Progress → Finish (matches current Windows NSIS flow)
- Generates a unique session ID and opens the live dashboard in the browser
- Downloads and runs the platform-appropriate setup script
- No notarization required for initial release (can be added later)

---

## Architecture

```
installers/
  electron/
    package.json          ← standalone package, separate from Next.js app
    electron-builder.yml  ← build config (NSIS for Windows, DMG for macOS)
    main.js               ← Electron main process (Node.js)
    preload.js            ← context bridge (IPC between main and renderer)
    renderer/
      index.html          ← single HTML file, no framework
      styles.css          ← Support Forge branded styles
      renderer.js         ← wizard UI logic
    assets/
      icon.icns           ← macOS app icon
      icon.ico            ← Windows app icon
      icon.png            ← 512x512 source
      header.png          ← wizard header image
  windows/               ← existing NSIS installer (kept as-is)
```

The Electron app is **completely self-contained** — its own `package.json`, its own `node_modules`, built independently of the Next.js app.

---

## Components

### Main Process (`main.js`)
- Creates a fixed-size `BrowserWindow` (600×500, not resizable) — wizard feel
- Handles IPC calls from renderer: `run-install`, `open-url`
- Spawns the setup script as a child process with `sudo-prompt` (macOS) or native admin elevation (Windows)
- Streams stdout/stderr back to renderer via `ipcMain` events
- Detects platform: `process.platform === 'darwin'` vs `'win32'`

### Preload (`preload.js`)
- Exposes a safe `window.api` object to renderer via `contextBridge`:
  - `window.api.startInstall(sessionId)` → triggers script download + run
  - `window.api.openUrl(url)` → opens URL in default browser
  - `window.api.onProgress(callback)` → receives streamed output lines
  - `window.api.onDone(callback)` → receives exit code

### Renderer (`renderer/`)
- Pure HTML/CSS/JS — no React, no bundler needed
- Three screens managed by show/hide: `#screen-welcome`, `#screen-progress`, `#screen-finish`
- Welcome screen: branding, tool list, "Start Installation" button
- Progress screen: scrolling log output, spinner, session ID displayed
- Finish screen: success/failure message, "Open Dashboard" button, next steps

### Build Config (`electron-builder.yml`)
```yaml
appId: com.supportforge.aisetup
productName: Support Forge AI Setup
directories:
  output: dist
win:
  target: nsis
  icon: assets/icon.ico
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: false
mac:
  target: dmg
  icon: assets/icon.icns
dmg:
  title: Support Forge AI Setup
```

---

## Data Flow

```
User clicks "Start Installation"
  → renderer generates sessionId (crypto.randomUUID via preload)
  → renderer calls window.api.openUrl(dashboardUrl?session=sessionId)
  → renderer calls window.api.startInstall(sessionId)
    → main.js downloads setup script to temp dir
    → main.js spawns script with sessionId arg
    → stdout/stderr streamed → ipcMain → preload → renderer log div
  → on exit code 0: show Finish (success)
  → on exit code ≠ 0: show Finish (partial — some tools may need manual steps)
```

---

## Script URLs

| Platform | Script URL |
|----------|-----------|
| Windows  | `https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-windows.ps1` |
| macOS    | `https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/mac/setup-mac.sh` |

---

## Platform-Specific Execution

**Windows:**
```js
spawn('powershell.exe', [
  '-NoProfile', '-ExecutionPolicy', 'Bypass',
  '-File', scriptPath,
  '-SessionId', sessionId
])
```

**macOS:**
```js
// chmod +x first, then:
spawn('bash', [scriptPath, '--session-id', sessionId])
// Terminal window opened via AppleScript so user sees output natively
```

---

## Styling

- Background: `#0f172a` (dark navy — matches Support Forge brand)
- Accent: `#6366f1` (indigo — CTA buttons)
- Text: `#f1f5f9` (light)
- Font: system-ui / -apple-system
- Window: 600×500, centered, no resize, custom title bar hidden (frameless with drag region)

---

## Build Commands

```bash
cd installers/electron
npm install
npm run build:win    # → dist/SupportForge-AI-Setup.exe
npm run build:mac    # → dist/SupportForge-AI-Setup.dmg  (requires macOS)
npm run build:all    # both
```

---

## Out of Scope (v1)

- Code signing / notarization
- Auto-update (electron-updater)
- Offline mode (script bundled in installer)
- Linux build
- Custom skills repo input in wizard UI

---

## Files to Create

1. `installers/electron/package.json`
2. `installers/electron/electron-builder.yml`
3. `installers/electron/main.js`
4. `installers/electron/preload.js`
5. `installers/electron/renderer/index.html`
6. `installers/electron/renderer/styles.css`
7. `installers/electron/renderer/renderer.js`
8. `installers/electron/assets/` — placeholder icons
9. `installers/electron/README.md`
10. `.gitignore` update — ignore `installers/electron/dist/` and `node_modules`
