import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for validation
const ToolResultSchema = z.object({
  status: z.enum(['OK', 'ERROR', 'SKIPPED', 'skipped']),
  version: z.string().nullable(),
  installed: z.boolean(),
});

const SetupResultSchema = z.object({
  os: z.string(),
  architecture: z.string().optional(),
  timestamp: z.string(),
  results: z.record(z.string(), ToolResultSchema),
  errors: z.array(z.string()),
  duration_seconds: z.number(),
});

type SetupResult = z.infer<typeof SetupResultSchema>;

// Version requirements
const VERSION_REQUIREMENTS = {
  nodejs: { min: '18.0.0', name: 'Node.js' },
  python: { min: '3.10.0', name: 'Python' },
  claude: { min: '2.0.0', name: 'Claude Code CLI' },
};

function compareVersions(version: string, minVersion: string): boolean {
  const v1 = version.split('.').map(Number);
  const v2 = minVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;
    if (num1 > num2) return true;
    if (num1 < num2) return false;
  }
  return true;
}

function validateToolVersions(results: Record<string, any>): string[] {
  const issues: string[] = [];

  for (const [tool, requirements] of Object.entries(VERSION_REQUIREMENTS)) {
    const result = results[tool];
    if (!result) continue;

    if (result.status === 'OK' && result.version) {
      const version = result.version.replace(/^v/, ''); // Remove 'v' prefix if present
      if (!compareVersions(version, requirements.min)) {
        issues.push(
          `${requirements.name} version ${version} is below minimum required ${requirements.min}`
        );
      }
    }
  }

  return issues;
}

function generateTroubleshootingHints(
  results: Record<string, any>,
  errors: string[]
): string[] {
  const hints: string[] = [];

  // Check for common issues
  const failedTools = Object.entries(results).filter(
    ([_, result]) => result.status === 'ERROR'
  );

  if (failedTools.length > 0) {
    hints.push(
      `${failedTools.length} tool(s) failed to install: ${failedTools.map(([name]) => name).join(', ')}`
    );
    hints.push('Try running the setup script again with administrator privileges');
  }

  // Node.js specific issues
  if (results.nodejs?.status === 'ERROR') {
    hints.push('Node.js installation failed. Try installing manually from nodejs.org');
  }

  // Python specific issues
  if (results.python?.status === 'ERROR') {
    hints.push('Python installation failed. Ensure python.org installer completed successfully');
  }

  // Claude CLI specific issues
  if (results.claude?.status === 'ERROR') {
    hints.push('Claude CLI installation failed. Try: npm install -g @anthropic-ai/claude-code');
  }

  // PATH issues
  if (errors.some(e => e.toLowerCase().includes('path'))) {
    hints.push('PATH configuration issue detected. Restart your terminal or computer after installation');
  }

  // Homebrew issues (Mac)
  if (results.homebrew?.status === 'ERROR') {
    hints.push('Homebrew installation failed. On Apple Silicon Macs, ensure /opt/homebrew/bin is in PATH');
  }

  // WSL issues (Windows)
  if (results.wsl2?.status === 'ERROR') {
    hints.push('WSL2 installation may require a system restart. Please restart and run the script again');
  }

  return hints;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate schema
    const parseResult = SetupResultSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid JSON format',
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data: SetupResult = parseResult.data;
    const { results, errors } = data;

    // Count tools by status
    const toolStats = {
      ok: 0,
      error: 0,
      skipped: 0,
      total: Object.keys(results).length,
    };

    for (const result of Object.values(results)) {
      if (result.status === 'OK') toolStats.ok++;
      else if (result.status === 'ERROR') toolStats.error++;
      else if (result.status === 'SKIPPED' || result.status === 'skipped') toolStats.skipped++;
    }

    // Check for version issues
    const versionIssues = validateToolVersions(results);

    // Generate troubleshooting hints
    const troubleshooting = generateTroubleshootingHints(results, errors);

    // Determine if setup is valid
    const hasErrors = toolStats.error > 0 || errors.length > 0;
    const hasVersionIssues = versionIssues.length > 0;
    const isValid = !hasErrors && !hasVersionIssues;

    // Build response
    const issues = [
      ...errors,
      ...versionIssues,
    ];

    const recommendations: string[] = [];

    if (isValid) {
      recommendations.push('All requirements met. Proceed to CLI authentication.');
      if (toolStats.skipped > 0) {
        recommendations.push(`${toolStats.skipped} optional tool(s) were skipped.`);
      }
    } else {
      recommendations.push(...troubleshooting);
    }

    return NextResponse.json({
      valid: isValid,
      summary: `${toolStats.ok}/${toolStats.total} tools installed successfully`,
      stats: toolStats,
      issues,
      recommendations,
      os: data.os,
      duration: data.duration_seconds,
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Failed to process validation request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
