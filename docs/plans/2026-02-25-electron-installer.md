# Electron Cross-Platform Installer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a branded Electron wizard installer (Welcome → Progress → Finish) that produces `SupportForge-AI-Setup.exe` (Windows) and `SupportForge-AI-Setup.dmg` (macOS) from one codebase.

**Architecture:** A self-contained Electron app in `installers/electron/` with its own `package.json`. The main process downloads the platform setup script and spawns it as a child process, streaming output to the renderer. Three screens (welcome/progress/finish) are managed by show/hide in a single `index.html` — no framework, no bundler.

**Tech Stack:** Electron 28, electron-builder 24, Node.js `https` + `fs` (script download), `child_process.spawn` (script execution), plain HTML/CSS/JS renderer.

---

### Task 1: Scaffold the electron directory and package.json

**Files:**
- Create: `installers/electron/package.json`
- Create: `installers/electron/.gitignore`

**Step 1: Create package.json**

```json
{
  "name": "support-forge-ai-setup",
  "version": "1.0.0",
  "description": "Support Forge AI Setup - cross-platform installer",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:all": "electron-builder --win --mac"
  },
  "build": {
    "appId": "com.supportforge.aisetup",
    "productName": "Support Forge AI Setup",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "preload.js",
      "renderer/**/*",
      "assets/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": false,
      "installerIcon": "assets/icon.ico",
      "uninstallerIcon": "assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "dmg": {
      "title": "Support Forge AI Setup"
    }
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.0.0"
  }
}
```

**Step 2: Create .gitignore**

```
node_modules/
dist/
```

**Step 3: Install dependencies**

```bash
cd installers/electron
npm install
```

Expected: `node_modules/` populated, no errors.

**Step 4: Verify electron runs**

```bash
cd installers/electron
npx electron --version
```

Expected: prints `v28.x.x`

**Step 5: Commit**

```bash
git add installers/electron/package.json installers/electron/.gitignore installers/electron/package-lock.json
git commit -m "feat: scaffold electron installer package"
```

---

### Task 2: Create placeholder icons

**Files:**
- Create: `installers/electron/assets/icon.png` (512×512 placeholder)
- Create: `installers/electron/assets/icon.ico` (copied from windows installer)
- Create: `installers/electron/assets/icon.icns` (placeholder — real one needed on Mac to build .dmg)

**Step 1: Create assets directory and copy existing Windows icon**

The Windows NSIS installer has `installers/windows/assets/header.bmp`. We'll create minimal placeholder icons so the build doesn't fail.

```bash
mkdir -p installers/electron/assets
# Copy the existing header bmp as reference
cp installers/windows/assets/header.bmp installers/electron/assets/header.bmp
```

**Step 2: Create a minimal 1×1 pixel PNG placeholder (will be replaced with real branding)**

Run this Node.js script from the repo root:

```bash
node -e "
const fs = require('fs');
// Minimal valid 1x1 white PNG (base64)
const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync('installers/electron/assets/icon.png', png1x1);
console.log('icon.png created');
"
```

**Step 3: Create placeholder .ico (copy PNG, electron-builder accepts PNG for dev builds on Windows)**

```bash
cp installers/electron/assets/icon.png installers/electron/assets/icon.ico
cp installers/electron/assets/icon.png installers/electron/assets/icon.icns
```

Note: For production, replace with proper `.ico` (multi-size) and `.icns` files. PNG works for dev/test builds.

**Step 4: Commit**

```bash
git add installers/electron/assets/
git commit -m "feat: add placeholder icons for electron installer"
```

---

### Task 3: Write the main process (main.js)

**Files:**
- Create: `installers/electron/main.js`

**Step 1: Write main.js**

```javascript
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const https = require('https');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

const SCRIPT_URLS = {
  win32: 'https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-windows.ps1',
  darwin: 'https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/mac/setup-mac.sh',
};

const DASHBOARD_URL = 'https://ai-consultant-toolkit.vercel.app/setup';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    resizable: false,
    center: true,
    title: 'Support Forge AI Setup',
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.icns'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC: open URL in default browser
ipcMain.on('open-url', (event, url) => {
  shell.openExternal(url);
});

// IPC: download script and run it
ipcMain.on('run-install', (event, sessionId) => {
  const platform = process.platform;
  const scriptUrl = SCRIPT_URLS[platform];

  if (!scriptUrl) {
    event.sender.send('install-error', `Unsupported platform: ${platform}`);
    return;
  }

  const ext = platform === 'win32' ? '.ps1' : '.sh';
  const scriptPath = path.join(os.tmpdir(), `sf-setup${ext}`);

  event.sender.send('install-log', `Downloading setup script...`);
  event.sender.send('install-log', `Session ID: ${sessionId}`);

  // Download script
  const file = fs.createWriteStream(scriptPath);
  https.get(scriptUrl, (response) => {
    if (response.statusCode !== 200) {
      event.sender.send('install-error', `Download failed: HTTP ${response.statusCode}`);
      return;
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      event.sender.send('install-log', 'Script downloaded. Starting installation...');
      runScript(event, scriptPath, sessionId, platform);
    });
  }).on('error', (err) => {
    fs.unlink(scriptPath, () => {});
    event.sender.send('install-error', `Download error: ${err.message}`);
  });
});

function runScript(event, scriptPath, sessionId, platform) {
  let child;

  if (platform === 'win32') {
    child = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath,
      '-SessionId', sessionId,
    ], { shell: false });
  } else {
    // macOS: chmod then run with bash in a new Terminal window via AppleScript
    fs.chmodSync(scriptPath, '755');
    // Run in background via bash, stream output back to renderer
    child = spawn('bash', [scriptPath, '--session-id', sessionId], {
      shell: false,
    });
  }

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => event.sender.send('install-log', line));
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => event.sender.send('install-log', `[stderr] ${line}`));
  });

  child.on('close', (code) => {
    event.sender.send('install-done', code);
  });

  child.on('error', (err) => {
    event.sender.send('install-error', `Failed to start script: ${err.message}`);
  });
}
```

**Step 2: Verify syntax**

```bash
cd installers/electron
node -e "require('./main.js')" 2>&1 | head -5
```

Expected: Either nothing (require errors out cleanly without Electron context) or a module-level error — NOT a syntax error. Syntax errors look like `SyntaxError: Unexpected token`.

**Step 3: Commit**

```bash
git add installers/electron/main.js
git commit -m "feat: add electron main process with script download and spawn"
```

---

### Task 4: Write the preload bridge (preload.js)

**Files:**
- Create: `installers/electron/preload.js`

**Step 1: Write preload.js**

```javascript
const { contextBridge, ipcRenderer } = require('electron');
const { randomUUID } = require('crypto');

contextBridge.exposeInMainWorld('api', {
  generateSessionId: () => {
    return 'setup-' + randomUUID().replace(/-/g, '').slice(0, 12);
  },
  openUrl: (url) => ipcRenderer.send('open-url', url),
  startInstall: (sessionId) => ipcRenderer.send('run-install', sessionId),
  onLog: (callback) => ipcRenderer.on('install-log', (event, line) => callback(line)),
  onDone: (callback) => ipcRenderer.on('install-done', (event, code) => callback(code)),
  onError: (callback) => ipcRenderer.on('install-error', (event, msg) => callback(msg)),
});
```

**Step 2: Verify syntax**

```bash
node -e "console.log('syntax ok')" && node --input-type=module <<< "import './installers/electron/preload.js'" 2>&1 || node -c installers/electron/preload.js
```

Simpler check:
```bash
node -c installers/electron/preload.js
```

Expected: `installers/electron/preload.js syntax ok`

**Step 3: Commit**

```bash
git add installers/electron/preload.js
git commit -m "feat: add electron preload context bridge"
```

---

### Task 5: Write the renderer (HTML + CSS + JS)

**Files:**
- Create: `installers/electron/renderer/index.html`
- Create: `installers/electron/renderer/styles.css`
- Create: `installers/electron/renderer/renderer.js`

**Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'">
  <title>Support Forge AI Setup</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- SCREEN: WELCOME -->
  <div id="screen-welcome" class="screen active">
    <div class="header">
      <div class="logo">⚡ Support Forge</div>
      <h1>AI Setup</h1>
      <p class="subtitle">Set up Claude Code and all required tools on your computer.</p>
    </div>
    <div class="tool-list">
      <div class="tool-item">✓ Homebrew / Chocolatey (package manager)</div>
      <div class="tool-item">✓ Git &amp; GitHub CLI</div>
      <div class="tool-item">✓ Node.js</div>
      <div class="tool-item">✓ Claude Code (AI assistant)</div>
      <div class="tool-item">✓ 38 pre-built AI skills</div>
    </div>
    <p class="note">A browser window will open so you can watch the installation progress live.</p>
    <div class="actions">
      <button id="btn-start" class="btn-primary">Start Installation</button>
    </div>
  </div>

  <!-- SCREEN: PROGRESS -->
  <div id="screen-progress" class="screen">
    <div class="header">
      <div class="logo">⚡ Support Forge</div>
      <h1>Installing...</h1>
      <p class="subtitle" id="session-display"></p>
    </div>
    <div id="log-box" class="log-box"></div>
    <div class="actions">
      <div class="spinner" id="spinner"></div>
      <p class="note" id="progress-note">This will take 5–10 minutes. Watch the live dashboard in your browser.</p>
    </div>
  </div>

  <!-- SCREEN: FINISH -->
  <div id="screen-finish" class="screen">
    <div class="header">
      <div class="logo">⚡ Support Forge</div>
      <h1 id="finish-title">Installation Complete!</h1>
      <p class="subtitle" id="finish-subtitle">Claude Code is ready to use.</p>
    </div>
    <div class="tool-list" id="finish-steps">
      <div class="tool-item">1. Open a new terminal</div>
      <div class="tool-item">2. Type: <code>claude</code></div>
      <div class="tool-item">3. Enter your Anthropic API key when prompted</div>
    </div>
    <div class="actions">
      <button id="btn-dashboard" class="btn-secondary">Open Dashboard</button>
      <button id="btn-close" class="btn-primary">Close</button>
    </div>
  </div>

  <script src="renderer.js"></script>
</body>
</html>
```

**Step 2: Write styles.css**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #0f172a;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 14px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-app-region: no-drag;
}

.screen {
  display: none;
  flex-direction: column;
  height: 100vh;
  padding: 28px 36px 24px;
}

.screen.active {
  display: flex;
}

.header {
  margin-bottom: 20px;
}

.logo {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6366f1;
  margin-bottom: 8px;
}

h1 {
  font-size: 26px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

.tool-list {
  background: #1e293b;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 16px;
  flex: 0 0 auto;
}

.tool-item {
  padding: 5px 0;
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.4;
}

.tool-item code {
  background: #334155;
  padding: 1px 6px;
  border-radius: 3px;
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
  font-size: 12px;
  color: #a5f3fc;
}

.note {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 16px;
  line-height: 1.5;
}

.actions {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-primary {
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover {
  background: #4f46e5;
}

.btn-secondary {
  background: transparent;
  color: #94a3b8;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.btn-secondary:hover {
  border-color: #6366f1;
  color: #f1f5f9;
}

.log-box {
  flex: 1;
  background: #020617;
  border-radius: 8px;
  padding: 12px 14px;
  overflow-y: auto;
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
  font-size: 11px;
  line-height: 1.6;
  color: #94a3b8;
  margin-bottom: 14px;
  min-height: 0;
}

.log-line {
  display: block;
  word-break: break-word;
}

.log-line.error {
  color: #f87171;
}

.log-line.success {
  color: #4ade80;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #334155;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

#finish-title.success { color: #4ade80; }
#finish-title.error   { color: #f87171; }
```

**Step 3: Write renderer.js**

```javascript
const DASHBOARD_URL = 'https://ai-consultant-toolkit.vercel.app/setup';

let sessionId = '';
let dashboardOpened = false;

function show(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function appendLog(line, type = '') {
  const box = document.getElementById('log-box');
  const el = document.createElement('span');
  el.className = 'log-line' + (type ? ' ' + type : '');
  el.textContent = line;
  box.appendChild(el);
  box.appendChild(document.createElement('br'));
  box.scrollTop = box.scrollHeight;
}

document.getElementById('btn-start').addEventListener('click', () => {
  sessionId = window.api.generateSessionId();

  // Open dashboard
  window.api.openUrl(`${DASHBOARD_URL}?session=${sessionId}`);
  dashboardOpened = true;

  // Show progress screen
  document.getElementById('session-display').textContent = `Session: ${sessionId}`;
  show('screen-progress');

  // Start install
  window.api.startInstall(sessionId);
});

window.api.onLog((line) => {
  const type = line.toLowerCase().includes('error') || line.startsWith('[stderr]') ? 'error'
             : line.toLowerCase().includes('success') || line.includes('✓') ? 'success'
             : '';
  appendLog(line, type);
});

window.api.onError((msg) => {
  appendLog(`ERROR: ${msg}`, 'error');
  document.getElementById('spinner').style.display = 'none';
  document.getElementById('progress-note').textContent = 'Something went wrong. See error above.';
  setTimeout(() => showFinish(1), 2000);
});

window.api.onDone((code) => {
  document.getElementById('spinner').style.display = 'none';
  showFinish(code);
});

function showFinish(exitCode) {
  const title = document.getElementById('finish-title');
  const subtitle = document.getElementById('finish-subtitle');

  if (exitCode === 0) {
    title.textContent = 'Installation Complete!';
    title.className = 'success';
    subtitle.textContent = 'Claude Code is ready to use.';
  } else {
    title.textContent = 'Installation Finished';
    title.className = 'error';
    subtitle.textContent = `Script exited with code ${exitCode}. Some tools may need manual steps.`;
  }

  show('screen-finish');
}

document.getElementById('btn-dashboard').addEventListener('click', () => {
  window.api.openUrl(`${DASHBOARD_URL}?session=${sessionId}`);
});

document.getElementById('btn-close').addEventListener('click', () => {
  window.close();
});
```

**Step 4: Commit**

```bash
git add installers/electron/renderer/
git commit -m "feat: add electron renderer (welcome/progress/finish screens)"
```

---

### Task 6: Smoke test — run the app locally

**Step 1: Launch in dev mode**

```bash
cd installers/electron
npm start
```

Expected: A 600×500 window appears with the Support Forge welcome screen. Dark navy background, indigo button, tool list visible.

**Step 2: Click "Start Installation"**

Expected:
- Browser opens to `https://ai-consultant-toolkit.vercel.app/setup?session=setup-xxxxxxxxxxxx`
- Wizard transitions to Progress screen
- Log box starts filling with script output lines
- Spinner visible

**Step 3: Wait for completion**

Expected: Wizard transitions to Finish screen. Either green "Installation Complete!" or gray "Installation Finished" with exit code.

**Step 4: Fix any visual or functional issues before proceeding to build.**

---

### Task 7: Build the Windows installer

**Step 1: Run the Windows build**

```bash
cd installers/electron
npm run build:win
```

Expected output:
```
  • electron-builder  version=24.x.x
  • loaded configuration
  • packaging       platform=win32
  • building        target=nsis
  • built           path=dist/Support Forge AI Setup Setup 1.0.0.exe
```

**Step 2: Locate the output**

```bash
ls installers/electron/dist/
```

Expected: `Support Forge AI Setup Setup 1.0.0.exe` (or similar name)

**Step 3: Test the installer**

Double-click `installers/electron/dist/Support Forge AI Setup Setup 1.0.0.exe`.

Expected:
- Windows UAC prompt appears (requires admin)
- NSIS-style install wizard opens
- On Next: runs the Electron app (welcome screen)
- Same flow as smoke test above

**Step 4: Rename output for clean delivery**

Add to `electron-builder.yml` (or package.json build section):
```json
"artifactName": "SupportForge-AI-Setup.exe"
```

Re-run build, confirm `dist/SupportForge-AI-Setup.exe` exists.

**Step 5: Commit**

```bash
git add installers/electron/package.json
git commit -m "feat: configure electron-builder artifact name for Windows"
```

---

### Task 8: Add README for the electron installer

**Files:**
- Create: `installers/electron/README.md`

**Step 1: Write README.md**

```markdown
# Electron Cross-Platform Installer

Builds a branded wizard installer for Windows (.exe) and macOS (.dmg).

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
cd installers/electron
npm install
```

## Run in dev mode

```bash
npm start
```

## Build

```bash
# Windows (.exe) — buildable on Windows or macOS
npm run build:win

# macOS (.dmg) — requires macOS
npm run build:mac

# Both
npm run build:all
```

Output files in `dist/`.

## What it does

1. Welcome screen — shows tool list, "Start Installation" button
2. Generates a unique session ID
3. Opens live dashboard: `https://ai-consultant-toolkit.vercel.app/setup?session=<id>`
4. Downloads platform setup script from GitHub
5. Runs the script, streams output to the log window
6. Shows Finish screen with next steps

## Icons

Replace `assets/icon.png` (512×512), `assets/icon.ico`, and `assets/icon.icns` with real branded icons before production build.

Use [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder) to generate `.ico` and `.icns` from a PNG:
```bash
npx electron-icon-builder --input=assets/icon.png --output=assets/
```

## Do NOT commit

- `node_modules/`
- `dist/`

Both are in `.gitignore`.
```

**Step 2: Commit**

```bash
git add installers/electron/README.md
git commit -m "docs: add electron installer README"
```

---

### Task 9: Update root .gitignore

**Files:**
- Modify: `.gitignore` (repo root)

**Step 1: Add electron build artifacts**

Append to the root `.gitignore`:

```
# Electron installer build output
installers/electron/node_modules/
installers/electron/dist/
```

**Step 2: Verify not already tracked**

```bash
git status installers/electron/dist 2>/dev/null || echo "not tracked"
```

**Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore electron dist and node_modules"
```

---

## Summary

| Task | Output |
|------|--------|
| 1 | `installers/electron/package.json` — dependencies scaffolded |
| 2 | `installers/electron/assets/` — placeholder icons |
| 3 | `installers/electron/main.js` — download + spawn logic |
| 4 | `installers/electron/preload.js` — context bridge |
| 5 | `installers/electron/renderer/` — wizard UI (3 screens) |
| 6 | Smoke tested locally |
| 7 | `dist/SupportForge-AI-Setup.exe` built and tested |
| 8 | `installers/electron/README.md` |
| 9 | `.gitignore` updated |

**macOS `.dmg`:** Run `npm run build:mac` from a Mac. All source files are complete — no Mac-specific code changes needed.
