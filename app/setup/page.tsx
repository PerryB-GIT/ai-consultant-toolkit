'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface ToolStatus {
  status: 'pending' | 'installing' | 'success' | 'error' | 'skipped';
  version?: string;
  error?: string;
}

interface ProgressError {
  tool: string;
  error: string;
  suggestedFix: string;
}

interface ProgressData {
  sessionId: string;
  currentStep: number;
  completedSteps: number[];
  currentAction: string;
  toolStatus: Record<string, ToolStatus>;
  errors: ProgressError[];
  timestamp: string;
  phase: 'phase1' | 'phase2';
  complete: boolean;
}

const TOOL_LABELS: Record<string, string> = {
  chocolatey: 'Chocolatey',
  homebrew: 'Homebrew',
  git: 'Git',
  github_cli: 'GitHub CLI',
  nodejs: 'Node.js',
  python: 'Python',
  wsl2: 'WSL2',
  claude: 'Claude Code',
  docker: 'Docker Desktop',
  skills: 'Claude Skills',
};

// What actually gets installed — client-friendly descriptions
const WHAT_GETS_INSTALLED = [
  { icon: '📦', label: 'Package Manager', detail: 'Chocolatey (Windows) or Homebrew (Mac)' },
  { icon: '🔧', label: 'Git & GitHub CLI', detail: 'Version control and repo access' },
  { icon: '⚡', label: 'Node.js', detail: 'Required to run Claude Code' },
  { icon: '🤖', label: 'Claude Code', detail: 'Your AI assistant' },
  { icon: '🧠', label: 'Claude Skills', detail: '38 pre-built skills for your workflows' },
];

function SetupPageInner() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [phase, setPhase] = useState<'landing' | 'running' | 'complete'>('landing');
  const [selectedOs, setSelectedOs] = useState<'windows' | 'mac' | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [copied, setCopied] = useState(false);

  // Session ID — ?session=<id> param lets an SE watch a client's session remotely
  useEffect(() => {
    const paramSid = searchParams.get('session');
    if (paramSid) {
      setSessionId(paramSid);
      setPhase('running');
      setIsPolling(true);
      return;
    }

    let sid = localStorage.getItem('setup-session-id');
    if (!sid) {
      sid = `setup-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('setup-session-id', sid);
    }
    setSessionId(sid);

    const savedPhase = localStorage.getItem('setup-phase');
    if (savedPhase === 'running') { setPhase('running'); setIsPolling(true); }
    if (savedPhase === 'complete') setPhase('complete');

    const savedOs = localStorage.getItem('setup-os') as 'windows' | 'mac' | null;
    if (savedOs) setSelectedOs(savedOs);
  }, [searchParams]);

  // Elapsed timer
  useEffect(() => {
    if (phase !== 'running') return;
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Poll progress
  const fetchProgress = useCallback(async () => {
    if (!sessionId || !isPolling) return;
    try {
      const res = await fetch(`/api/progress/${sessionId}`);
      if (!res.ok) return;
      const data: ProgressData = await res.json();
      setProgress(data);
      if (data.complete) {
        setPhase('complete');
        setIsPolling(false);
        localStorage.setItem('setup-phase', 'complete');
        localStorage.removeItem('setup-started');
      }
    } catch { /* silent */ }
  }, [sessionId, isPolling]);

  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(fetchProgress, 2000);
    return () => clearInterval(interval);
  }, [isPolling, fetchProgress]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const getInstallCommand = (os: 'windows' | 'mac') => {
    const sid = sessionId || 'loading';
    if (os === 'windows') {
      return [
        `# Run this in PowerShell as Administrator`,
        `Set-ExecutionPolicy Bypass -Scope Process -Force`,
        `Invoke-WebRequest -Uri "https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-windows.ps1" -OutFile "$env:TEMP\\setup.ps1"`,
        `& "$env:TEMP\\setup.ps1" -SessionId "${sid}"`,
      ].join('\n');
    }
    return [
      `# Run this in Terminal`,
      `curl -fsSL https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/mac/setup-mac.sh -o /tmp/setup.sh`,
      `bash /tmp/setup.sh --session-id "${sid}"`,
    ].join('\n');
  };

  const handleCopyCommand = (os: 'windows' | 'mac') => {
    navigator.clipboard.writeText(getInstallCommand(os));
    setSelectedOs(os);
    setCopied(true);
    setPhase('running');
    setIsPolling(true);
    localStorage.setItem('setup-phase', 'running');
    localStorage.setItem('setup-os', os);
    setTimeout(() => setCopied(false), 2000);
  };

  // Progress stats
  const toolEntries = progress ? Object.entries(progress.toolStatus) : [];
  const successCount = toolEntries.filter(([, s]) => s.status === 'success').length;
  const errorCount = toolEntries.filter(([, s]) => s.status === 'error').length;
  const totalTools = toolEntries.length;
  const pct = totalTools > 0 ? Math.round((successCount / totalTools) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#050508] text-white">

      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0f0f14]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-white">Support Forge</div>
              <div className="text-xs text-gray-400">AI Setup</div>
            </div>
          </div>
          {phase === 'running' && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{formatTime(elapsedTime)}</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-700 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-xs font-medium">LIVE</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ── LANDING ── */}
        {phase === 'landing' && (
          <div className="space-y-10">

            {/* Hero */}
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold text-white">Get Claude Code running in minutes</h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                One command installs everything — then your AI assistant is ready to use.
              </p>
            </div>

            {/* What gets installed */}
            <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">What gets installed</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {WHAT_GETS_INSTALLED.map(item => (
                  <div key={item.label} className="text-center space-y-1">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* OS choice + copy command */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Choose your operating system</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Windows */}
                <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-900/40 border border-blue-700/50 rounded-lg flex items-center justify-center text-xl">🪟</div>
                    <div>
                      <div className="font-semibold text-white">Windows 10 / 11</div>
                      <div className="text-xs text-gray-400">PowerShell as Administrator</div>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto whitespace-pre">
                    {getInstallCommand('windows')}
                  </div>
                  <button
                    onClick={() => handleCopyCommand('windows')}
                    disabled={!sessionId}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                  >
                    {copied && selectedOs === 'windows' ? '✓ Copied!' : 'Copy Windows Command'}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Open PowerShell as Administrator → paste → press Enter
                  </p>
                </div>

                {/* Mac */}
                <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-xl">🍎</div>
                    <div>
                      <div className="font-semibold text-white">macOS</div>
                      <div className="text-xs text-gray-400">Terminal (any shell)</div>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto whitespace-pre">
                    {getInstallCommand('mac')}
                  </div>
                  <button
                    onClick={() => handleCopyCommand('mac')}
                    disabled={!sessionId}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                  >
                    {copied && selectedOs === 'mac' ? '✓ Copied!' : 'Copy Mac Command'}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Open Terminal → paste → press Enter
                  </p>
                </div>

              </div>
            </div>

            {/* After running */}
            <div className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-3">After you run the command</h3>
              <ol className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400 font-bold mt-0.5">1.</span>
                  <span>The script runs in your terminal — this page updates live as each tool installs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400 font-bold mt-0.5">2.</span>
                  <span>When it finishes, run <code className="px-1.5 py-0.5 bg-gray-800 rounded font-mono text-indigo-300">gh auth login</code> to connect GitHub</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400 font-bold mt-0.5">3.</span>
                  <span>Open a new terminal and type <code className="px-1.5 py-0.5 bg-gray-800 rounded font-mono text-indigo-300">claude</code> — enter your API key when prompted</span>
                </li>
              </ol>
            </div>

            {/* Already running */}
            <div className="text-center">
              <button
                onClick={() => { setPhase('running'); setIsPolling(true); localStorage.setItem('setup-phase', 'running'); }}
                className="text-sm text-gray-500 hover:text-gray-300 underline underline-offset-2"
              >
                Already running the script? Watch live progress →
              </button>
            </div>

          </div>
        )}

        {/* ── RUNNING ── */}
        {phase === 'running' && (
          <div className="space-y-6">

            {/* Current action */}
            <div className="bg-[#0f0f14] border border-indigo-700/50 rounded-xl p-6">
              {progress ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">Installing...</div>
                    <div className="text-sm text-gray-400">{successCount}/{totalTools} complete</div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-white font-medium">{progress.currentAction}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span>Waiting for script to start... Make sure you ran the command in your terminal.</span>
                </div>
              )}
            </div>

            {/* Tool grid */}
            {toolEntries.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Installation Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {toolEntries.map(([key, status]) => (
                    <div
                      key={key}
                      className={`
                        p-4 rounded-lg border transition-all duration-300
                        ${status.status === 'success' ? 'bg-green-900/10 border-green-800' :
                          status.status === 'error' ? 'bg-red-900/10 border-red-800' :
                          status.status === 'installing' ? 'bg-indigo-900/20 border-indigo-700 animate-pulse' :
                          status.status === 'skipped' ? 'bg-gray-900/30 border-gray-800' :
                          'bg-[#0f0f14] border-gray-800'}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{TOOL_LABELS[key] || key}</span>
                        <span className="text-base">
                          {status.status === 'success' ? '✓' :
                           status.status === 'error' ? '✗' :
                           status.status === 'installing' ? '⚙' :
                           status.status === 'skipped' ? '—' : '○'}
                        </span>
                      </div>
                      {status.version && (
                        <div className="text-xs text-gray-400">{status.version}</div>
                      )}
                      {status.status === 'error' && status.error && (
                        <div className="text-xs text-red-400 mt-1 truncate">{status.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {progress && progress.errors.length > 0 && (
              <div className="bg-red-900/10 border border-red-800 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-red-400">Issues Found</h3>
                {progress.errors.map((err, i) => (
                  <div key={i} className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                    <div className="font-medium text-red-300 text-sm mb-1">{TOOL_LABELS[err.tool] || err.tool} failed</div>
                    <div className="text-xs text-red-400 mb-2">{err.error}</div>
                    <div className="text-xs text-gray-300 bg-gray-900/50 rounded p-2">
                      <span className="text-green-400 font-medium">Fix: </span>{err.suggestedFix}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Not seeing updates */}
            {!progress && (
              <div className="text-center py-4 space-y-3">
                <p className="text-sm text-gray-500">Not seeing any updates after 30 seconds?</p>
                <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
                  <span>Make sure the command is running in your terminal</span>
                  <button
                    onClick={() => setPhase('landing')}
                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    Go back and copy the command again
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── COMPLETE ── */}
        {phase === 'complete' && (
          <div className="max-w-2xl mx-auto space-y-8">

            <div className="text-center space-y-3">
              <div className="text-5xl">✅</div>
              <h1 className="text-3xl font-bold text-white">Setup Complete</h1>
              <p className="text-gray-400">Everything is installed and ready to use.</p>
            </div>

            {/* Stats */}
            {progress && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{successCount}</div>
                  <div className="text-xs text-gray-400 mt-1">Tools Installed</div>
                </div>
                <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{errorCount}</div>
                  <div className="text-xs text-gray-400 mt-1">Errors</div>
                </div>
                <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</div>
                  <div className="text-xs text-gray-400 mt-1">Total Time</div>
                </div>
              </div>
            )}

            {/* Next steps */}
            <div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-white">Next steps</h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-medium text-white text-sm">Authenticate with GitHub</div>
                    <div className="text-xs text-gray-400 mt-1">Open a terminal and run:</div>
                    <code className="text-xs bg-gray-900 text-indigo-300 px-2 py-1 rounded mt-1 inline-block font-mono">gh auth login</code>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-medium text-white text-sm">Open Claude Code</div>
                    <div className="text-xs text-gray-400 mt-1">Open a new terminal and run:</div>
                    <code className="text-xs bg-gray-900 text-indigo-300 px-2 py-1 rounded mt-1 inline-block font-mono">claude</code>
                    <div className="text-xs text-gray-400 mt-1">Enter your Anthropic API key when prompted.</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-medium text-white text-sm">Try your first skill</div>
                    <div className="text-xs text-gray-400 mt-1">Inside Claude Code, type:</div>
                    <code className="text-xs bg-gray-900 text-indigo-300 px-2 py-1 rounded mt-1 inline-block font-mono">/writing-emails</code>
                  </div>
                </li>
              </ol>
            </div>

            {/* Errors on complete */}
            {errorCount > 0 && progress && (
              <div className="bg-yellow-900/10 border border-yellow-700/50 rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-yellow-400 text-sm">{errorCount} item{errorCount > 1 ? 's' : ''} need attention</h3>
                {progress.errors.map((err, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-yellow-300 font-medium">{TOOL_LABELS[err.tool] || err.tool}: </span>
                    <span className="text-gray-400">{err.suggestedFix}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Need help */}
            <div className="text-center text-sm text-gray-500">
              Need help? Contact{' '}
              <a href="mailto:perry@support-forge.com" className="text-indigo-400 hover:text-indigo-300">
                perry@support-forge.com
              </a>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-2"
              >
                Set up another machine
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense>
      <SetupPageInner />
    </Suspense>
  );
}
