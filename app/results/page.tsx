'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';

interface Phase1Validation {
  phase: 'Phase 1: Tool Installation';
  valid: boolean;
  summary: string;
  stats: {
    ok: number;
    error: number;
    skipped: number;
    total: number;
  };
  issues: string[];
  recommendations: string[];
  os: string;
  duration: number;
}

interface Phase2Validation {
  phase: 'Phase 2: Configuration & MCP Setup';
  valid: boolean;
  summary: string;
  stats: {
    skills: number;
    configured: number;
    mcps_pending: number;
    total: number;
  };
  skills: string[];
  configuration: {
    ea_persona: boolean;
    claude_md: boolean;
  };
  mcps: string[];
  issues: string[];
  recommendations: string[];
  duration: number;
}

type ValidationResult = Phase1Validation | Phase2Validation;

export default function ResultsPage() {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [setupData, setSetupData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const validationResult = sessionStorage.getItem('validationResult');
    const setupDataStr = sessionStorage.getItem('setupData');

    if (!validationResult) {
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

  const isPhase1 = result.phase.includes('Phase 1');
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
              <p className="mt-1 text-sm text-gray-400">{result.phase}</p>
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
            currentStep={isPhase1 ? (result.valid ? 4 : 1) : (result.valid ? 8 : 5)}
            completedSteps={isPhase1 ? (result.valid ? [1, 2, 3] : []) : (result.valid ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4])}
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
              <p className="text-xl text-gray-300 mb-2">{result.summary}</p>
              <p className="text-gray-400">
                {result.valid
                  ? isPhase1
                    ? 'All required tools are installed. Ready for Phase 2!'
                    : 'EA persona configured. Complete MCP authentication to unlock full functionality.'
                  : 'Some items need attention before proceeding.'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {isPhase1 ? (
          <Phase1Stats stats={(result as Phase1Validation).stats} os={(result as Phase1Validation).os} duration={result.duration} />
        ) : (
          <Phase2Stats result={result as Phase2Validation} />
        )}

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
              Next Steps
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

        {/* Phase-specific content */}
        {isPhase1 && result.valid && (
          <Phase2Promotion />
        )}

        {!isPhase1 && result.valid && (
          <MCPSetupGuide mcps={(result as Phase2Validation).mcps} />
        )}
      </main>
    </div>
  );
}

function Phase1Stats({ stats, os, duration }: { stats: Phase1Validation['stats']; os: string; duration: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <StatCard label="Total Tools" value={stats.total} color="text-gray-400" />
      <StatCard label="Installed" value={stats.ok} color="text-green-400" />
      <StatCard label="Errors" value={stats.error} color="text-red-400" />
      <StatCard label="Skipped" value={stats.skipped} color="text-yellow-400" />
      <div className="bg-background-card border border-gray-800 rounded-lg p-6">
        <div className="text-sm text-gray-400 mb-2">Duration</div>
        <div className="text-2xl font-bold text-primary">{duration.toFixed(1)}s</div>
      </div>
    </div>
  );
}

function Phase2Stats({ result }: { result: Phase2Validation }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Skills Installed" value={result.stats.skills} color="text-green-400" />
        <StatCard label="Configurations" value={result.stats.configured} color="text-green-400" />
        <StatCard label="MCPs Pending" value={result.stats.mcps_pending} color="text-yellow-400" />
        <div className="bg-background-card border border-gray-800 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Duration</div>
          <div className="text-2xl font-bold text-primary">{result.duration.toFixed(2)}s</div>
        </div>
      </div>

      {/* Skills List */}
      <div className="bg-background-card rounded-lg border border-gray-800 p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Installed Skills</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {result.skills.map((skill) => (
            <div key={skill} className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700 rounded-lg">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white font-medium">{skill}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Status */}
      <div className="bg-background-card rounded-lg border border-gray-800 p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Configuration Status</h3>
        <div className="space-y-3">
          <ConfigItem label="EA Default Persona" configured={result.configuration.ea_persona} />
          <ConfigItem label="CLAUDE.md Created" configured={result.configuration.claude_md} />
        </div>
      </div>
    </>
  );
}

function ConfigItem({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
      <span className="text-gray-300">{label}</span>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${configured ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
        {configured ? '✓ Configured' : '○ Pending'}
      </span>
    </div>
  );
}

function Phase2Promotion() {
  return (
    <div className="mt-8 p-8 bg-gradient-to-br from-primary/20 to-purple-900/20 border-2 border-primary rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Ready for Phase 2!</h2>
          <p className="text-gray-300">Install skills, configure your AI Executive Assistant, and set up MCP servers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <FeatureCard
          title="5 Essential Skills"
          items={['Superpowers (debugging, planning)', 'Document creation (PDF, DOCX)', 'Browser automation', 'Episodic memory', 'Executive Assistant (EA/Evie)']}
        />
        <FeatureCard
          title="4 MCP Servers"
          items={['Gmail (with attachments)', 'Google Calendar', 'Google Drive', 'GitHub integration']}
        />
        <FeatureCard
          title="EA Configuration"
          items={['Morning briefings', 'Email triage automation', 'Proactive task management', 'Cross-session memory']}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DownloadButton
          href="https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/mac/setup-phase2.sh"
          platform="macOS"
          filename="setup-phase2.sh"
        />
        <DownloadButton
          href="https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-phase2.ps1"
          platform="Windows"
          filename="setup-phase2.ps1"
        />
      </div>
    </div>
  );
}

function MCPSetupGuide({ mcps }: { mcps: string[] }) {
  return (
    <div className="mt-8 p-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-2 border-blue-700 rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-4">MCP Server Authentication</h2>
      <p className="text-gray-300 mb-6">
        Complete these authentication steps to enable full EA functionality with Gmail, Calendar, Drive, and GitHub.
      </p>

      <div className="space-y-4 mb-6">
        <AuthStep
          number={1}
          title="Authenticate GitHub"
          command="gh auth login"
          description="Follow prompts to authenticate with GitHub via browser"
        />
        <AuthStep
          number={2}
          title="Authenticate Claude Code"
          command="claude auth"
          description="Complete Claude Code authentication"
        />
        <AuthStep
          number={3}
          title="Set Up Google MCP Servers"
          command="See setup instructions file"
          description="Run OAuth authentication for Gmail, Calendar, and Drive (requires custom MCP installation)"
        />
      </div>

      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-2">📄 Setup Instructions</h4>
        <p className="text-sm text-gray-300">
          Check the <code className="px-2 py-1 bg-gray-800 rounded text-blue-400">mcp-setup-instructions.txt</code> file
          generated by Phase 2 for detailed authentication steps.
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-background-card/50 backdrop-blur p-4 rounded-lg border border-gray-700">
      <div className="text-primary font-bold mb-2">{title}</div>
      <ul className="text-sm text-gray-300 space-y-1">
        {items.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function DownloadButton({ href, platform, filename }: { href: string; platform: string; filename: string }) {
  return (
    <a
      href={href}
      download
      className="flex items-center justify-between p-4 bg-background-card border border-primary rounded-lg hover:bg-background-card/80 transition-colors"
    >
      <div className="flex items-center gap-3">
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div>
          <div className="font-medium text-white">Download Phase 2 for {platform}</div>
          <div className="text-sm text-gray-400">{filename}</div>
        </div>
      </div>
      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </a>
  );
}

function AuthStep({ number, title, command, description }: { number: number; title: string; command: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-background-card/50 rounded-lg border border-gray-700">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <code className="block px-3 py-2 bg-gray-900 rounded text-blue-400 text-sm mb-2">{command}</code>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
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
