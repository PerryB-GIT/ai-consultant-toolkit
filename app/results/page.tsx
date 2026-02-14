'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';

interface ToolResult {
  status: 'OK' | 'ERROR' | 'SKIPPED';
  version?: string;
  message?: string;
}

interface ValidationResult {
  valid: boolean;
  os: string;
  timestamp: string;
  tools: Record<string, ToolResult>;
  issues: string[];
  recommendations: string[];
  stats: {
    total: number;
    ok: number;
    errors: number;
    skipped: number;
  };
}

export default function ResultsPage() {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [setupData, setSetupData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Load validation results from sessionStorage
    const validationResult = sessionStorage.getItem('validationResult');
    const setupDataStr = sessionStorage.getItem('setupData');

    if (!validationResult) {
      // No results available, redirect back to home
      router.push('/');
      return;
    }

    try {
      setResult(JSON.parse(validationResult));
      if (setupDataStr) {
        setSetupData(JSON.parse(setupDataStr));
      }
    } catch (err) {
      console.error('Failed to parse results:', err);
      router.push('/');
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusColor = result.valid ? 'text-green-400' : 'text-red-400';
  const statusIcon = result.valid ? '✓' : '✗';
  const statusText = result.valid ? 'Setup Complete' : 'Issues Found';

  return (
    <div className="min-h-screen bg-background-primary text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-background-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Validation Results</h1>
              <p className="mt-1 text-sm text-gray-400">
                {result.os} • {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Upload Another
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="mb-8">
          <ProgressBar
            currentStep={result.valid ? 4 : 1}
            completedSteps={result.valid ? [1, 2, 3] : []}
            totalSteps={11}
          />
        </div>

        {/* Status Banner */}
        <div
          className={`
            mb-8 p-6 rounded-lg border-2
            ${result.valid
              ? 'bg-green-900/20 border-green-700'
              : 'bg-red-900/20 border-red-700'
            }
          `}
        >
          <div className="flex items-start gap-4">
            <div className={`text-4xl ${statusColor}`}>{statusIcon}</div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${statusColor} mb-2`}>
                {statusText}
              </h2>
              <p className="text-gray-300">
                {result.valid
                  ? 'All required tools are installed and configured correctly.'
                  : 'Some tools are missing or have issues that need attention.'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Tools"
            value={result.stats.total}
            color="text-gray-400"
          />
          <StatCard
            label="Installed"
            value={result.stats.ok}
            color="text-green-400"
          />
          <StatCard
            label="Errors"
            value={result.stats.errors}
            color="text-red-400"
          />
          <StatCard
            label="Skipped"
            value={result.stats.skipped}
            color="text-yellow-400"
          />
        </div>

        {/* Issues */}
        {result.issues.length > 0 && (
          <div className="mb-8 p-6 bg-red-900/20 border border-red-700 rounded-lg">
            <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Issues Found
            </h3>
            <ul className="space-y-2">
              {result.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-red-300">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <div className="mb-8 p-6 bg-blue-900/20 border border-blue-700 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Recommendations
            </h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-blue-300">
                  <span className="text-blue-400 mt-1">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tool Details */}
        <div className="bg-background-card rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-xl font-semibold text-white">Tool Details</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {Object.entries(result.tools).map(([tool, details]) => (
              <ToolRow key={tool} name={tool} details={details} />
            ))}
          </div>
        </div>

        {/* Phase 2 Section - Only show if Phase 1 is valid */}
        {result.valid && (
          <div className="mt-8 p-8 bg-gradient-to-br from-primary/20 to-purple-900/20 border-2 border-primary rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Ready for Phase 2!</h2>
                <p className="text-gray-300">Install skills, configure your AI Executive Assistant, and build custom workflows</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-background-card/50 backdrop-blur p-4 rounded-lg border border-gray-700">
                <div className="text-primary font-bold mb-2">5 Essential Skills</div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Superpowers (debugging, planning)</li>
                  <li>• Document creation (PDF, DOCX)</li>
                  <li>• Browser automation</li>
                  <li>• Episodic memory</li>
                  <li>• Executive Assistant (EA/Evie)</li>
                </ul>
              </div>

              <div className="bg-background-card/50 backdrop-blur p-4 rounded-lg border border-gray-700">
                <div className="text-primary font-bold mb-2">4 MCP Servers</div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Gmail (with attachments)</li>
                  <li>• Google Calendar</li>
                  <li>• Google Drive</li>
                  <li>• GitHub integration</li>
                </ul>
              </div>

              <div className="bg-background-card/50 backdrop-blur p-4 rounded-lg border border-gray-700">
                <div className="text-primary font-bold mb-2">EA Configuration</div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Morning briefings</li>
                  <li>• Email triage automation</li>
                  <li>• Proactive task management</li>
                  <li>• Cross-session memory</li>
                </ul>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <a
                href="https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/mac/setup-phase2.sh"
                download
                className="flex items-center justify-between p-4 bg-background-card border border-primary rounded-lg hover:bg-background-card/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <div>
                    <div className="font-medium text-white">Download Phase 2 for macOS</div>
                    <div className="text-sm text-gray-400">setup-phase2.sh</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>

              <a
                href="https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-phase2.ps1"
                download
                className="flex items-center justify-between p-4 bg-background-card border border-primary rounded-lg hover:bg-background-card/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-medium text-white">Download Phase 2 for Windows</div>
                    <div className="text-sm text-gray-400">setup-phase2.ps1</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>

            {/* Guides */}
            <div className="bg-background-card/50 backdrop-blur p-4 rounded-lg border border-gray-700">
              <h4 className="font-semibold text-white mb-3">📚 Comprehensive Guides Available</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a
                  href="https://github.com/PerryB-GIT/ai-consultant-toolkit/blob/main/guides/EA-CONFIGURATION-GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  EA Configuration Guide
                </a>
                <a
                  href="https://github.com/PerryB-GIT/ai-consultant-toolkit/blob/main/guides/CUSTOM-SKILLS-WALKTHROUGH.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Custom Skills Walkthrough
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="mt-8 p-6 bg-primary/10 border border-primary rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">
            {result.valid ? 'Phase 1 Complete - Authentication Steps' : 'Fix Issues & Re-validate'}
          </h3>
          <ol className="space-y-3">
            {result.valid ? (
              <>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <span className="text-gray-300">
                    Authenticate GitHub CLI: <code className="px-2 py-1 bg-gray-800 rounded text-primary">gh auth login</code>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <span className="text-gray-300">
                    Authenticate Claude Code: <code className="px-2 py-1 bg-gray-800 rounded text-primary">claude auth</code>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <span className="text-gray-300">
                    Download and run Phase 2 setup script (above) to install skills and MCP servers
                  </span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <span className="text-gray-300">
                    Fix the issues listed above
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <span className="text-gray-300">
                    Re-run the setup script to validate
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <span className="text-gray-300">
                    Upload the new <code className="px-2 py-1 bg-gray-800 rounded text-red-400">setup-results.json</code> file
                  </span>
                </li>
              </>
            )}
          </ol>
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

function ToolRow({ name, details }: { name: string; details: ToolResult }) {
  const statusColors = {
    OK: 'text-green-400 bg-green-900/20',
    ERROR: 'text-red-400 bg-red-900/20',
    SKIPPED: 'text-yellow-400 bg-yellow-900/20',
  };

  const statusIcons = {
    OK: '✓',
    ERROR: '✗',
    SKIPPED: '○',
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-900/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <span
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${statusColors[details.status]}
            `}
          >
            {statusIcons[details.status]} {details.status}
          </span>
          <div>
            <div className="font-medium text-white">{name}</div>
            {details.version && (
              <div className="text-sm text-gray-400">Version: {details.version}</div>
            )}
            {details.message && (
              <div className="text-sm text-gray-400 mt-1">{details.message}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
