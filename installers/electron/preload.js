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
