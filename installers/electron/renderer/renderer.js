const DASHBOARD_URL = 'https://ai-consultant-toolkit.vercel.app/setup';

let sessionId = '';
let dashboardOpened = false;

function show(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function appendLog(line, type) {
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
  window.api.openUrl(DASHBOARD_URL + '?session=' + sessionId);
  dashboardOpened = true;
  document.getElementById('session-display').textContent = 'Session: ' + sessionId;
  show('screen-progress');
  window.api.startInstall(sessionId);
});

window.api.onLog((line) => {
  const type = line.toLowerCase().includes('error') || line.startsWith('[stderr]') ? 'error'
             : line.toLowerCase().includes('success') || line.includes('\u2713') ? 'success'
             : '';
  appendLog(line, type);
});

window.api.onError((msg) => {
  appendLog('ERROR: ' + msg, 'error');
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
    subtitle.textContent = 'Script exited with code ' + exitCode + '. Some tools may need manual steps.';
  }
  show('screen-finish');
}

document.getElementById('btn-dashboard').addEventListener('click', () => {
  window.api.openUrl(DASHBOARD_URL + '?session=' + sessionId);
});

document.getElementById('btn-close').addEventListener('click', () => {
  window.close();
});
