<#
.SYNOPSIS
    AI Consultant Toolkit - Phase 2: Configuration & MCP Setup (Windows)
.DESCRIPTION
    Configures EA persona and sets up MCP servers (assumes skills already installed via Claude Code)
.NOTES
    No admin rights required for Phase 2
#>
param([switch]$SkipMCPs = $false)
$ErrorActionPreference = 'Continue'
$startTime = Get-Date

$results = @{
    timestamp = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
    phase = 'Phase 2: Configuration & MCP Setup'
    configuration = @{
        ea_default_persona = @{ status = ''; configured = $false }
        claude_md_created = @{ status = ''; configured = $false }
    }
    mcps = @{
        gmail = @{ status = ''; configured = $false }
        google_calendar = @{ status = ''; configured = $false }
        google_drive = @{ status = ''; configured = $false }
        github = @{ status = ''; configured = $false }
    }
    verification = @{
        skills_installed = @{ status = ''; verified = $false; skills = @() }
    }
    errors = @()
    duration_seconds = 0
}

Write-Host '================================================================' -ForegroundColor Cyan
Write-Host '   AI Consultant Toolkit - Phase 2 Setup' -ForegroundColor Cyan
Write-Host '   Configuration & MCP Server Setup' -ForegroundColor Cyan
Write-Host '================================================================' -ForegroundColor Cyan

function Write-Step { param([string]$Message); Write-Host "`n> $Message" -ForegroundColor Yellow }
function Write-Success { param([string]$Message); Write-Host "  [OK] $Message" -ForegroundColor Green }
function Write-Info { param([string]$Message); Write-Host "  [INFO] $Message" -ForegroundColor Cyan }
function Write-Failure { param([string]$Message); Write-Host "  [FAIL] $Message" -ForegroundColor Red }
function Add-Error { param([string]$Component, [string]$Message); $results.errors += @{ component = $Component; message = $Message } }

# ===== VERIFY CLAUDE CODE INSTALLED =====
Write-Step 'Verifying Claude Code installation...'
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Failure 'Claude Code not found. Please complete Phase 1 first.'
    exit 1
}
Write-Success 'Claude Code detected'

# ===== VERIFY SKILLS INSTALLED =====
Write-Step 'Checking installed skills...'
$skillsDir = Join-Path $env:USERPROFILE '.claude\skills'
$settingsFile = Join-Path $env:USERPROFILE '.claude\settings.json'
$installedSkills = @()

if (Test-Path $settingsFile) {
    try {
        $settings = Get-Content $settingsFile | ConvertFrom-Json

        # Check for key skills in enabledPlugins
        $requiredSkills = @(
            'superpowers',
            'document-skills',
            'episodic-memory',
            'playwright',
            'executive-assistant'
        )

        foreach ($skill in $requiredSkills) {
            $found = $false
            foreach ($plugin in $settings.enabledPlugins.PSObject.Properties) {
                if ($plugin.Name -like "*$skill*" -and $plugin.Value -eq $true) {
                    $installedSkills += $skill
                    $found = $true
                    break
                }
            }
            if (-not $found) {
                # Check if skill folder exists
                $skillPath = Join-Path $skillsDir $skill
                if (Test-Path $skillPath) {
                    $installedSkills += $skill
                }
            }
        }

        Write-Success "Found $($installedSkills.Count) skills installed"
        $installedSkills | ForEach-Object { Write-Info "  - $_" }
        $results.verification.skills_installed = @{ status = 'OK'; verified = $true; skills = $installedSkills }
    } catch {
        Write-Failure "Failed to read settings.json: $_"
        Add-Error -Component 'skills-verification' -Message $_.Exception.Message
        $results.verification.skills_installed = @{ status = 'ERROR'; verified = $false; skills = @() }
    }
} else {
    Write-Info 'Settings file not found - skills may not be configured yet'
    $results.verification.skills_installed = @{ status = 'WARN'; verified = $false; skills = @() }
}

# ===== CREATE DIRECTORIES =====
Write-Step 'Creating MCP directories...'
$mcpDir = Join-Path $env:USERPROFILE 'mcp-servers'
New-Item -ItemType Directory -Force -Path $mcpDir | Out-Null
Write-Success 'MCP directory ready'

# ===== CONFIGURE EA AS DEFAULT PERSONA =====
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "   Configuring Executive Assistant" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

Write-Step 'Creating CLAUDE.md with EA default persona...'
try {
    $claudeMdPath = Join-Path $env:USERPROFILE 'CLAUDE.md'

    # Check if CLAUDE.md already exists
    $existingContent = ""
    if (Test-Path $claudeMdPath) {
        Write-Info 'CLAUDE.md already exists - creating backup'
        $backupPath = Join-Path $env:USERPROFILE "CLAUDE.md.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
        Copy-Item $claudeMdPath $backupPath
        $existingContent = Get-Content $claudeMdPath -Raw
    }

    $claudeMdContent = @"
# Claude Code Configuration

## Default Persona
- Always operate as Executive Assistant (EA/Evie) unless user explicitly asks for "regular Claude"
- Use warm, British female voice and personality
- Proactive, caring, organized, with gentle warmth
- Track context across sessions using episodic memory
- Can switch to neutral technical mode for deep coding/debugging

## Communication Style
- Address user directly by name when known
- Morning briefings at start of day
- Proactive reminders for important tasks
- Email triage and calendar management
- Celebrate wins, gentle with feedback

## Available Skills
- /executive-assistant - Full EA persona and workflows
- /superpowers - Systematic debugging, planning, code review
- /document-skills - Create/edit DOCX, PDF, PPTX, XLSX files
- /playwright-skill - Browser automation and testing
- /episodic-memory - Search across previous conversations

## MCP Integrations
- Gmail - Email management with attachment support
- Google Calendar - Schedule management
- Google Drive - File storage and sharing
- GitHub - Version control and collaboration
- Stripe - Payment processing (when configured)

## How to Switch Modes
- "Exit EA mode" or "Be regular Claude for this task" - Temporarily switch to neutral mode
- "Resume EA mode" - Return to Executive Assistant persona
- Deep technical work automatically uses neutral technical mode

---
Generated by AI Consultant Toolkit - Phase 2
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

"@

    # If there was existing custom content, append it
    if ($existingContent -and $existingContent -notmatch "AI Consultant Toolkit") {
        $claudeMdContent += "`n`n# Previous Custom Configuration`n`n$existingContent"
    }

    $claudeMdContent | Out-File -FilePath $claudeMdPath -Encoding utf8
    Write-Success "CLAUDE.md created at $claudeMdPath"
    if (Test-Path $backupPath) {
        Write-Info "Backup saved at $backupPath"
    }
    $results.configuration.claude_md_created = @{ status = 'OK'; configured = $true }

    Write-Info 'EA configured as default persona'
    $results.configuration.ea_default_persona = @{ status = 'OK'; configured = $true }
} catch {
    Write-Failure "CLAUDE.md creation failed: $_"
    Add-Error -Component 'claude-md' -Message $_.Exception.Message
    $results.configuration.claude_md_created = @{ status = 'ERROR'; configured = $false }
    $results.configuration.ea_default_persona = @{ status = 'ERROR'; configured = $false }
}

# ===== MCP SERVER SETUP INSTRUCTIONS =====
if (-not $SkipMCPs) {
    Write-Host "`n================================================================" -ForegroundColor Cyan
    Write-Host "   MCP Server Setup" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan

    Write-Info 'MCP servers require manual OAuth setup'
    Write-Info 'The following instructions will guide you through authentication'

    # Create setup instructions file
    $instructionsPath = Join-Path $env:USERPROFILE 'mcp-setup-instructions.txt'

    $instructions = @"
AI Consultant Toolkit - Phase 2 MCP Setup Instructions
========================================================
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

IMPORTANT: MCP servers are already available in Claude Code.
You just need to authenticate them to use with your accounts.

Prerequisites:
1. Claude Code must be authenticated: claude auth
2. GitHub CLI must be authenticated: gh auth login

---

STEP 1: Authenticate GitHub (if not already done)
===================================================
Run in PowerShell:
  gh auth login

Follow prompts:
  - Choose: GitHub.com
  - Protocol: HTTPS
  - Authenticate: Login with web browser
  - Complete browser authentication

Verify:
  gh auth status

Result: GitHub MCP will automatically work via gh CLI authentication

---

STEP 2: Google Services Authentication
========================================
Google services (Gmail, Calendar, Drive) require OAuth tokens.

NOTE: These are custom MCP servers that need to be installed separately.
They are not included in Claude Code by default.

To set up Google MCP servers:
1. Visit: https://github.com/PerryB-GIT/claude-code-config
2. Navigate to: mcp-servers/gmail/, google-calendar/, google-drive/
3. Clone the repositories to: $env:USERPROFILE\mcp-servers\
4. Run npm install in each directory
5. Run OAuth authentication for each service

Example for Gmail:
  cd $env:USERPROFILE\mcp-servers\gmail
  npm install
  npm run auth

This will:
  - Open browser for Google OAuth
  - Grant access to Gmail API
  - Save token to ~/.gmail-mcp/tokens.json

Repeat for Calendar and Drive:
  cd $env:USERPROFILE\mcp-servers\google-calendar
  npm install
  npm run auth

  cd $env:USERPROFILE\mcp-servers\google-drive
  npm install
  npm run auth

---

STEP 3: Configure MCP Servers in Claude Code
==============================================
Add to ~/.claude/settings.json under "mcpServers":

{
  "mcpServers": {
    "gmail": {
      "command": "node",
      "args": ["$env:USERPROFILE\mcp-servers\gmail\index.js"]
    },
    "google-calendar": {
      "command": "node",
      "args": ["$env:USERPROFILE\mcp-servers\google-calendar\index.js"]
    },
    "google-drive": {
      "command": "node",
      "args": ["$env:USERPROFILE\mcp-servers\google-drive\index.js"]
    }
  }
}

---

STEP 4: Restart Claude Code
============================
After configuring MCP servers, restart Claude Code:
  - Close all Claude Code sessions
  - Start fresh: claude chat

---

STEP 5: Test Your Setup
========================
Test EA with these commands:

  "Good morning"
  - Should provide briefing with email, calendar, tasks

  "Check my email"
  - Should list recent emails (requires Gmail MCP)

  "What's on my calendar today?"
  - Should show today's events (requires Calendar MCP)

  "List my Drive files"
  - Should show recent files (requires Drive MCP)

---

TROUBLESHOOTING
===============

Issue: "Gmail MCP not authenticated"
Fix: cd $env:USERPROFILE\mcp-servers\gmail && npm run auth

Issue: "Command 'node' not found"
Fix: Ensure Node.js is in PATH (restart PowerShell or run refreshenv)

Issue: "OAuth token expired"
Fix: Re-run npm run auth in the MCP directory

Issue: "MCP server not responding"
Fix: Check ~/.claude/settings.json for correct paths
      Restart Claude Code

---

NEXT STEPS
==========
1. Follow the authentication steps above
2. Test each MCP service individually
3. Once working, explore the comprehensive guides:
   - EA Configuration Guide
   - Custom Skills Walkthrough

Guide Links:
  https://github.com/PerryB-GIT/ai-consultant-toolkit/blob/main/guides/EA-CONFIGURATION-GUIDE.md
  https://github.com/PerryB-GIT/ai-consultant-toolkit/blob/main/guides/CUSTOM-SKILLS-WALKTHROUGH.md

---
"@

    $instructions | Out-File -FilePath $instructionsPath -Encoding utf8
    Write-Success "Setup instructions saved to: $instructionsPath"
    Write-Info 'Please review the instructions file for MCP authentication steps'

    # Mark MCPs as needing manual setup
    $results.mcps.gmail = @{ status = 'MANUAL_SETUP_REQUIRED'; configured = $false }
    $results.mcps.google_calendar = @{ status = 'MANUAL_SETUP_REQUIRED'; configured = $false }
    $results.mcps.google_drive = @{ status = 'MANUAL_SETUP_REQUIRED'; configured = $false }
    $results.mcps.github = @{ status = 'MANUAL_SETUP_REQUIRED'; configured = $false }

} else {
    Write-Info 'MCP setup skipped (--SkipMCPs flag)'
    $results.mcps.gmail = @{ status = 'SKIPPED'; configured = $false }
    $results.mcps.google_calendar = @{ status = 'SKIPPED'; configured = $false }
    $results.mcps.google_drive = @{ status = 'SKIPPED'; configured = $false }
    $results.mcps.github = @{ status = 'SKIPPED'; configured = $false }
}

# ===== GENERATE RESULTS JSON =====
$duration = (Get-Date).Subtract($startTime).TotalSeconds
$results.duration_seconds = [math]::Round($duration, 2)

$outputFile = Join-Path $env:USERPROFILE 'setup-phase2-results.json'
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "   Phase 2 Configuration Complete!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Results: $outputFile" -ForegroundColor Cyan
Write-Host "Duration: $($results.duration_seconds)s" -ForegroundColor Cyan

Write-Host ""
Write-Host "What was configured:" -ForegroundColor Yellow
Write-Host "  [OK] CLAUDE.md created with EA default persona"
Write-Host "  [OK] Verified existing skills installation"
Write-Host "  [OK] Created MCP setup instructions"

Write-Host ""
Write-Host "Skills found:" -ForegroundColor Yellow
if ($installedSkills.Count -gt 0) {
    $installedSkills | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
} else {
    Write-Host "  [WARN] No skills detected - may need manual installation" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review MCP setup instructions: $instructionsPath"
Write-Host "  2. Authenticate GitHub: gh auth login"
Write-Host "  3. Authenticate Claude: claude auth"
Write-Host "  4. Set up Google MCP servers (see instructions file)"
Write-Host "  5. Restart Claude Code: exit, then claude chat"
Write-Host "  6. Test EA: claude chat, then say Good morning"
Write-Host "  7. Upload $outputFile to dashboard (optional)"

return $results
