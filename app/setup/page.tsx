'use client';

import { useEffect, useState, useCallback } from 'react';
import ProgressBar from '@/components/ProgressBar';

interface ToolStatus {
  status: 'pending' | 'installing' | 'success' | 'error';
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

const TOOL_NAMES: Record<string, string> = {
  chocolatey: 'Chocolatey',
  homebrew: 'Homebrew',
  node: 'Node.js',
  git: 'Git',
  gh: 'GitHub CLI',
  claude: 'Claude Code',
  npm: 'npm',
  python: 'Python',
  pip: 'pip',
  wsl: 'WSL2',
  docker: 'Docker Desktop',
  skills: 'Claude Skills',
};

const ALL_STEPS = [
  { id: 1, name: 'Prerequisites', description: 'Check Node.js, npm, git' },
  { id: 2, name: 'OS Detection', description: 'Detect macOS vs Windows' },
  { id: 3, name: 'Installing Tools', description: 'Install CLI tools (gh, aws, gcloud)' },
  { id: 4, name: 'CLI Authentication', description: 'Authenticate with services' },
  { id: 5, name: 'Security Setup', description: 'Install credential scanners' },
  { id: 6, name: 'MCP Configuration', description: 'Set up MCP servers' },
  { id: 7, name: 'Google Services', description: 'OAuth for Gmail, Calendar, Drive' },
  { id: 8, name: 'Voice Assistant', description: 'Install Evie voice system' },
  { id: 9, name: 'Install Skills', description: 'Clone and install Claude Code skills' },
  { id: 10, name: 'Documentation', description: 'Generate setup report' },
  { id: 11, name: 'Complete', description: 'Finish and redirect to dashboard' },
];

export default function UnifiedSetupPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [setupStarted, setSetupStarted] = useState(false);
  const [phase, setPhase] = useState<'download' | 'phase1' | 'phase2' | 'complete'>('download');
  const [os, setOs] = useState<'windows' | 'mac' | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Generate or retrieve session ID
  useEffect(() => {
    let sid = localStorage.getItem('setup-session-id');
    if (!sid) {
      sid = `setup-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('setup-session-id', sid);
    }
    setSessionId(sid);

    // Check if setup already started
    const started = localStorage.getItem('setup-started');
    if (started === 'true') {
      setSetupStarted(true);
      setIsPolling(true);
      const savedPhase = localStorage.getItem('setup-phase') as typeof phase;
      if (savedPhase) setPhase(savedPhase);
    }
  }, []);

  // Elapsed time counter
  useEffect(() => {
    if (!setupStarted) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [setupStarted]);

  // Poll for progress updates
  const fetchProgress = useCallback(async () => {
    if (!sessionId || !isPolling) return;

    try {
      const response = await fetch(`/api/progress/${sessionId}`);

      if (response.status === 404) {
        // Session not found yet - setup hasn't started sending progress
        return;
      }

      if (!response.ok) {
        console.error('Failed to fetch progress');
        return;
      }

      const data: ProgressData = await response.json();
      setProgress(data);

      // Update phase based on progress
      if (data.phase === 'phase1' && phase === 'download') {
        setPhase('phase1');
        localStorage.setItem('setup-phase', 'phase1');
      } else if (data.phase === 'phase2' && phase === 'phase1') {
        setPhase('phase2');
        localStorage.setItem('setup-phase', 'phase2');
      }

      // Check if complete
      if (data.complete) {
        setPhase('complete');
        setIsPolling(false);
        localStorage.setItem('setup-phase', 'complete');
        localStorage.removeItem('setup-started');
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }, [sessionId, isPolling, phase]);

  // Set up polling interval
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(fetchProgress, 2000);
    return () => clearInterval(interval);
  }, [isPolling, fetchProgress]);

  // Handle OS selection and download
  const handleDownload = (selectedOs: 'windows' | 'mac') => {
    setOs(selectedOs);
    setSetupStarted(true);
    setIsPolling(true);
    localStorage.setItem('setup-started', 'true');
    localStorage.setItem('setup-phase', 'download');

    // Trigger download
    const url = selectedOs === 'windows'
      ? 'https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-windows.ps1'
      : 'https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/mac/setup-mac.sh';

    window.location.href = url;
  };

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status icon
  const getStatusIcon = (status: ToolStatus['status']) => {
    switch (status) {
      case 'success':
        return <span className="text-green-400 text-xl">✓</span>;
      case 'error':
        return <span className="text-red-400 text-xl">✗</span>;
      case 'installing':
        return <span className="text-primary text-xl animate-spin inline-block">⚙️</span>;
      case 'pending':
      default:
        return <span className="text-gray-600 text-xl">○</span>;
    }
  };

  // Calculate stats
  const toolEntries = progress ? Object.entries(progress.toolStatus) : [];
  const successCount = toolEntries.filter(([_, status]) => status.status === 'success').length;
  const errorCount = toolEntries.filter(([_, status]) => status.status === 'error').length;
  const installingCount = toolEntries.filter(([_, status]) => status.status === 'installing').length;

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-background-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Setup Support Forge</h1>
                <p className="text-gray-400 text-sm">
                  {phase === 'download' && 'Download and run the setup script to begin'}
                  {phase === 'phase1' && 'Phase 1: Installing Development Tools'}
                  {phase === 'phase2' && 'Phase 2: Configuration & MCP Setup'}
                  {phase === 'complete' && 'Setup Complete - Production Ready!'}
                </p>
              </div>
            </div>

            {/* Status indicator */}
            {setupStarted && phase !== 'complete' && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  {formatTime(elapsedTime)} elapsed
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-700 rounded-full">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-green-400 text-sm font-medium">LIVE</span>
                </div>
              </div>
            )}

            {phase === 'complete' && (
              <div className="px-4 py-2 bg-green-900/20 border border-green-700 rounded-lg">
                <span className="text-green-400 font-medium">✓ Production Ready</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar
            currentStep={progress?.currentStep || (phase === 'download' ? 1 : 0)}
            completedSteps={progress?.completedSteps || []}
            totalSteps={11}
          />
        </div>

        {/* Session ID Card */}
        {sessionId && (
          <div className="mb-6 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Setup Session ID</div>
                <div className="font-mono text-sm text-white">{sessionId}</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-sm text-primary transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Download Phase */}
        {phase === 'download' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Choose Your Operating System</h2>
              <p className="text-gray-400">Download and run the setup script for your platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Windows Card */}
              <button
                onClick={() => handleDownload('windows')}
                className="p-8 bg-background-card border-2 border-gray-800 hover:border-primary rounded-lg transition-all group text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <svg className="w-12 h-12 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold text-white">Windows</h3>
                    <p className="text-sm text-gray-400">Windows 10/11</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>PowerShell script</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>Chocolatey package manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>WSL2 & Docker Desktop</span>
                  </div>
                </div>
              </button>

              {/* macOS Card */}
              <button
                onClick={() => handleDownload('mac')}
                className="p-8 bg-background-card border-2 border-gray-800 hover:border-primary rounded-lg transition-all group text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <svg className="w-12 h-12 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold text-white">macOS</h3>
                    <p className="text-sm text-gray-400">macOS 10.15+</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>Bash shell script</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>Homebrew package manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>Docker Desktop for Mac</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-12 p-6 bg-primary/10 border border-primary/30 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">After downloading:</h3>
              <ol className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">1.</span>
                  <div>
                    <span className="font-medium">Run the script</span>
                    <div className="text-sm text-gray-400 mt-1">
                      Windows: Right-click → Run with PowerShell (as Administrator)<br />
                      macOS: Terminal → chmod +x setup-mac.sh → ./setup-mac.sh
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">2.</span>
                  <div>
                    <span className="font-medium">Watch live progress</span>
                    <div className="text-sm text-gray-400 mt-1">
                      This page will automatically update as the script installs tools
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">3.</span>
                  <div>
                    <span className="font-medium">Complete configuration</span>
                    <div className="text-sm text-gray-400 mt-1">
                      After Phase 1 completes, Phase 2 will begin automatically
                    </div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Phase 1: Tool Installation */}
        {phase === 'phase1' && (
          <div className="space-y-8">
            {/* Current Action Banner */}
            {progress && (
              <div className="p-6 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-pulse text-2xl">▶️</div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Current Action</div>
                    <div className="text-xl font-semibold text-white">{progress.currentAction}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Tools" value={toolEntries.length} color="text-gray-400" />
              <StatCard label="Success" value={successCount} color="text-green-400" />
              <StatCard label="Installing" value={installingCount} color="text-primary" />
              <StatCard label="Errors" value={errorCount} color="text-red-400" />
            </div>

            {/* Tool Status Grid */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Installation Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {toolEntries.map(([toolKey, status]) => (
                  <div
                    key={toolKey}
                    className={`
                      p-4 rounded-lg border transition-all duration-200
                      ${status.status === 'success'
                        ? 'bg-green-900/10 border-green-700'
                        : status.status === 'error'
                        ? 'bg-red-900/10 border-red-700'
                        : status.status === 'installing'
                        ? 'bg-primary/10 border-primary/30 animate-pulse'
                        : 'bg-gray-900/50 border-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">
                        {TOOL_NAMES[toolKey] || toolKey}
                      </span>
                      {getStatusIcon(status.status)}
                    </div>
                    {status.version && (
                      <div className="text-sm text-gray-400">v{status.version}</div>
                    )}
                    {status.error && (
                      <div className="text-sm text-red-400 mt-2">{status.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Errors Section */}
            {progress && progress.errors.length > 0 && (
              <div className="p-6 bg-red-900/20 border border-red-700 rounded-lg">
                <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Installation Errors
                </h3>
                <div className="space-y-4">
                  {progress.errors.map((err, i) => (
                    <div key={i} className="bg-red-900/30 border border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-red-400 text-xl flex-shrink-0">⚠️</span>
                        <div className="flex-1">
                          <div className="font-semibold text-red-300 mb-1">{err.tool}</div>
                          <div className="text-sm text-red-400 mb-2">{err.error}</div>
                          <div className="text-sm text-gray-400 bg-gray-900/50 rounded p-2">
                            <span className="text-green-400 font-medium">Fix: </span>
                            {err.suggestedFix}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Configuration */}
        {phase === 'phase2' && (
          <div className="space-y-8">
            <div className="text-center p-8 bg-primary/10 border border-primary rounded-lg">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Phase 1 Complete!</h2>
              <p className="text-gray-400 mb-4">
                All development tools installed successfully. Starting Phase 2: Configuration & MCP Setup
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-700 rounded-lg">
                <span className="text-green-400">Phase 2 in progress...</span>
              </div>
            </div>

            {/* Configuration Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['EA Persona', 'CLAUDE.md', 'MCP Servers', 'Skills Installation'].map((step, i) => (
                <div key={i} className="p-6 bg-background-card border border-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold">
                      {i + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{step}</h3>
                  </div>
                  <div className="text-sm text-gray-400">
                    Configuring {step.toLowerCase()}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center p-12 bg-green-900/10 border-2 border-green-700 rounded-lg">
              <div className="text-6xl mb-6">✅</div>
              <h2 className="text-4xl font-bold text-white mb-4">Setup Complete!</h2>
              <p className="text-xl text-gray-300 mb-8">
                Your AI development environment is now production-ready
              </p>

              {/* Success Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-background-card border border-gray-800 rounded-lg">
                  <div className="text-3xl font-bold text-green-400 mb-1">{successCount}</div>
                  <div className="text-sm text-gray-400">Tools Installed</div>
                </div>
                <div className="p-4 bg-background-card border border-gray-800 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">11</div>
                  <div className="text-sm text-gray-400">Steps Completed</div>
                </div>
                <div className="p-4 bg-background-card border border-gray-800 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-1">{formatTime(elapsedTime)}</div>
                  <div className="text-sm text-gray-400">Total Time</div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="text-left bg-background-card border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Next Steps:</h3>
                <ol className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 font-bold">1.</span>
                    <span>Open a terminal and run <code className="px-2 py-1 bg-gray-900 rounded text-primary">claude</code> to start your AI assistant</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 font-bold">2.</span>
                    <span>Try <code className="px-2 py-1 bg-gray-900 rounded text-primary">/executive-assistant</code> to activate Evie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 font-bold">3.</span>
                    <span>Check out the documentation at <code className="px-2 py-1 bg-gray-900 rounded text-primary">~/.claude/README.md</code></span>
                  </li>
                </ol>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  localStorage.removeItem('setup-session-id');
                  localStorage.removeItem('setup-started');
                  localStorage.removeItem('setup-phase');
                  window.location.reload();
                }}
                className="mt-6 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Start New Setup
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-background-card border border-gray-800 rounded-lg p-6">
      <div className={`text-3xl font-bold ${color} mb-2`}>{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}
