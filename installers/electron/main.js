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
    // Use Start-Process -Verb RunAs to trigger UAC elevation prompt
    // The script requires admin rights (#Requires -RunAsAdministrator)
    const psArgs = `-NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -SessionId "${sessionId}"`;
    child = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-Command',
      `Start-Process powershell.exe -ArgumentList '${psArgs}' -Verb RunAs -Wait`,
    ], { shell: false });
    event.sender.send('install-log', 'Requesting administrator permission...');
    event.sender.send('install-log', 'Click "Yes" on the UAC prompt to continue.');
  } else {
    // macOS: chmod then run with bash
    fs.chmodSync(scriptPath, '755');
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
