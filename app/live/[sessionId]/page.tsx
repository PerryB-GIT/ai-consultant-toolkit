'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

type ConnectionStatus = 'connecting' | 'connected' | 'polling' | 'error' | 'not_found';

const TOOL_NAMES: Record<string, string> = {
  node: 'Node.js',
  git: 'Git',
  gh: 'GitHub CLI',
  claude: 'Claude Code',
  npm: 'npm',
  python: 'Python',
  pip: 'pip',
};

export default function LiveProgressPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notFoundRedirect, setNotFoundRedirect] = useState<number | null>(null);
  const [shareMessage, setShareMessage] = useState('');

  // Fetch progress data
  const fetchProgress = useCallback(async () => {
    if (!sessionId) return;

    try {
      setConnectionStatus('polling');
      const response = await fetch(`/api/progress/${sessionId}`);

      if (response.status === 404) {
        setConnectionStatus('not_found');
        // Start 10-second countdown to redirect
        if (notFoundRedirect === null) {
          setNotFoundRedirect(10);
        }
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data: ProgressData = await response.json();
      setProgress(data);
      setConnectionStatus('connected');

      // Redirect to results if complete
      if (data.complete) {
        // Store in sessionStorage for results page
        sessionStorage.setItem('validationResult', JSON.stringify({
          phase: data.phase === 'phase1' ? 'Phase 1: Tool Installation' : 'Phase 2: Configuration & MCP Setup',
          valid: data.errors.length === 0,
          summary: data.currentAction,
          completedSteps: data.completedSteps,
          currentStep: data.currentStep,
        }));

        router.push('/results');
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setConnectionStatus('error');
    }
  }, [sessionId, notFoundRedirect, router]);

  // Poll for progress updates every 2 seconds
  useEffect(() => {
    if (!sessionId) return;

    // Initial fetch
    fetchProgress();

    // Set up polling interval
    const interval = setInterval(fetchProgress, 2000);

    return () => clearInterval(interval);
  }, [sessionId, fetchProgress]);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Not found redirect countdown
  useEffect(() => {
    if (notFoundRedirect === null) return;

    if (notFoundRedirect === 0) {
      router.push('/');
      return;
    }

    const timeout = setTimeout(() => {
      setNotFoundRedirect(notFoundRedirect - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [notFoundRedirect, router]);

  // Copy share link to clipboard
  const handleShareClick = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareMessage('Link copied!');
      setTimeout(() => setShareMessage(''), 2000);
    }).catch(() => {
      setShareMessage('Failed to copy');
    });
  }, []);

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
        return (
          <span className="text-primary text-xl animate-spin inline-block">⚙️</span>
        );
      case 'pending':
      default:
        return <span className="text-gray-600 text-xl">○</span>;
    }
  };

  // Not found state
  if (connectionStatus === 'not_found') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-background-card border border-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">❓</div>
          <h1 className="text-2xl font-bold text-white mb-2">Session Not Found</h1>
          <p className="text-gray-400 mb-4">
            This setup session doesn&apos;t exist or has expired.
          </p>
          <p className="text-gray-500 text-sm">
            Redirecting to homepage in {notFoundRedirect} seconds...
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!progress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Connecting to setup session...</p>
        </div>
      </div>
    );
  }

  const toolEntries = Object.entries(progress.toolStatus);
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
              <h1 className="text-2xl font-bold text-white">Live Setup Progress</h1>
              {/* Live badge */}
              <div className="flex items-center gap-2 px-3 py-1 bg-red-900/20 border border-red-700 rounded-full">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-400 text-sm font-medium">LIVE</span>
              </div>
            </div>

            {/* Connection status & elapsed time */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {formatTime(elapsedTime)} elapsed
              </div>
              <div className={`text-sm px-3 py-1 rounded-full ${
                connectionStatus === 'connected' || connectionStatus === 'polling'
                  ? 'bg-green-900/20 text-green-400'
                  : connectionStatus === 'error'
                  ? 'bg-red-900/20 text-red-400'
                  : 'bg-gray-900/20 text-gray-400'
              }`}>
                {connectionStatus === 'connecting' && 'Connecting...'}
                {connectionStatus === 'connected' && 'Connected'}
                {connectionStatus === 'polling' && 'Polling...'}
                {connectionStatus === 'error' && 'Connection Error'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar
            currentStep={progress.currentStep}
            completedSteps={progress.completedSteps}
            totalSteps={progress.phase === 'phase1' ? 4 : 11}
          />
        </div>

        {/* Current Action Banner */}
        <div className="mb-8 p-6 bg-primary/10 border border-primary/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-pulse text-2xl">▶️</div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Current Action</div>
              <div className="text-xl font-semibold text-white">{progress.currentAction}</div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Tools" value={toolEntries.length} color="text-gray-400" />
          <StatCard label="Success" value={successCount} color="text-green-400" />
          <StatCard label="Installing" value={installingCount} color="text-primary" />
          <StatCard label="Errors" value={errorCount} color="text-red-400" />
        </div>

        {/* Tool Status Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Tool Installation Status</h2>
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
        {progress.errors.length > 0 && (
          <div className="mb-8 p-6 bg-red-900/20 border border-red-700 rounded-lg">
            <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Live Error Log
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

        {/* Share Link Section */}
        <div className="p-6 bg-background-card border border-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Share This Progress</h3>
              <p className="text-sm text-gray-400">
                Share this link to let others watch the live setup progress
              </p>
            </div>
            <button
              onClick={handleShareClick}
              className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {shareMessage || 'Copy Link'}
            </button>
          </div>
        </div>
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
