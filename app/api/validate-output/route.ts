import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Phase 1 schema (tool installation)
const ToolResultSchema = z.object({
  status: z.enum(['OK', 'ERROR', 'SKIPPED', 'skipped']),
  version: z.string().nullable(),
  installed: z.boolean(),
});

const Phase1Schema = z.object({
  os: z.string(),
  architecture: z.string().optional(),
  timestamp: z.string(),
  results: z.record(z.string(), ToolResultSchema),
  errors: z.array(z.string()),
  duration_seconds: z.number(),
});

// Phase 2 schema (configuration & MCP setup)
const ConfigStatusSchema = z.object({
  status: z.string(),
  configured: z.boolean(),
});

const SkillsVerificationSchema = z.object({
  status: z.string(),
  verified: z.boolean(),
  skills: z.array(z.string()),
});

const Phase2Schema = z.object({
  timestamp: z.string(),
  phase: z.string(),
  configuration: z.object({
    ea_default_persona: ConfigStatusSchema,
    claude_md_created: ConfigStatusSchema,
  }),
  mcps: z.record(z.string(), ConfigStatusSchema),
  verification: z.object({
    skills_installed: SkillsVerificationSchema,
  }),
  errors: z.array(z.any()),
  duration_seconds: z.number(),
});

type Phase1Result = z.infer<typeof Phase1Schema>;
type Phase2Result = z.infer<typeof Phase2Schema>;

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

    // Try Phase 1 first
    const phase1Result = Phase1Schema.safeParse(body);
    if (phase1Result.success) {
      return validatePhase1(phase1Result.data);
    }

    // Try Phase 2
    const phase2Result = Phase2Schema.safeParse(body);
    if (phase2Result.success) {
      return validatePhase2(phase2Result.data);
    }

    // Neither schema matched
    return NextResponse.json(
      {
        valid: false,
        error: 'Invalid JSON format. Expected Phase 1 or Phase 2 setup results.',
        details: {
          phase1Errors: phase1Result.error.issues,
          phase2Errors: phase2Result.error.issues,
        },
      },
      { status: 400 }
    );
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

function validatePhase1(data: Phase1Result) {
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
  const issues = [...errors, ...versionIssues];

  const recommendations: string[] = [];

  if (isValid) {
    recommendations.push('All requirements met. Proceed to CLI authentication.');
    recommendations.push('Download and run Phase 2 to install skills and configure EA.');
    if (toolStats.skipped > 0) {
      recommendations.push(`${toolStats.skipped} optional tool(s) were skipped.`);
    }
  } else {
    recommendations.push(...troubleshooting);
  }

  return NextResponse.json({
    phase: 'Phase 1: Tool Installation',
    valid: isValid,
    summary: `${toolStats.ok}/${toolStats.total} tools installed successfully`,
    stats: toolStats,
    issues,
    recommendations,
    os: data.os,
    duration: data.duration_seconds,
  });
}

function validatePhase2(data: Phase2Result) {
  const { configuration, mcps, verification, errors } = data;

  // Count configured items
  const configStats = {
    configured: 0,
    pending: 0,
    total: 0,
  };

  // Check configuration items
  if (configuration.ea_default_persona.configured) configStats.configured++;
  configStats.total++;

  if (configuration.claude_md_created.configured) configStats.configured++;
  configStats.total++;

  // Check skills
  const skillsVerified = verification.skills_installed.verified;
  const skillCount = verification.skills_installed.skills.length;

  // Check MCP servers (count as pending since they require manual OAuth)
  const mcpCount = Object.keys(mcps).length;
  configStats.total += mcpCount;
  // MCPs start as pending

  // Determine if valid
  const hasErrors = errors.length > 0;
  const hasEAConfig = configuration.ea_default_persona.configured;
  const hasClaudeMd = configuration.claude_md_created.configured;
  const isValid = !hasErrors && hasEAConfig && hasClaudeMd && skillsVerified;

  // Build response
  const issues = errors.map((e: any) =>
    typeof e === 'string' ? e : e.message || JSON.stringify(e)
  );

  const recommendations: string[] = [];

  if (isValid) {
    recommendations.push(`Phase 2 complete! ${skillCount} skills installed successfully.`);
    recommendations.push('Next: Authenticate GitHub (gh auth login) and Claude Code (claude auth).');
    recommendations.push(`Then set up ${mcpCount} MCP servers for full EA functionality.`);
    recommendations.push('See the MCP setup instructions file for authentication steps.');
  } else {
    if (!hasEAConfig) recommendations.push('EA persona configuration is missing.');
    if (!hasClaudeMd) recommendations.push('CLAUDE.md file was not created.');
    if (!skillsVerified) recommendations.push('Skills verification failed. Check Claude Code installation.');
    if (errors.length > 0) recommendations.push('Fix the errors listed above and re-run Phase 2.');
  }

  return NextResponse.json({
    phase: 'Phase 2: Configuration & MCP Setup',
    valid: isValid,
    summary: `${skillCount} skills installed, ${configStats.configured}/${configStats.total - mcpCount} configurations complete`,
    stats: {
      skills: skillCount,
      configured: configStats.configured,
      mcps_pending: mcpCount,
      total: configStats.total,
    },
    skills: verification.skills_installed.skills,
    configuration: {
      ea_persona: configuration.ea_default_persona.configured,
      claude_md: configuration.claude_md_created.configured,
    },
    mcps: Object.keys(mcps),
    issues,
    recommendations,
    duration: data.duration_seconds,
  });
}
