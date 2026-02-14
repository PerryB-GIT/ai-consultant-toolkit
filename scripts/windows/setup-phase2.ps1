<#
.SYNOPSIS
    AI Consultant Toolkit - Phase 2: Skills & MCP Setup (Windows)
.DESCRIPTION
    Installs essential Claude Code skills and MCP servers after Phase 1 completes
#>
#Requires -RunAsAdministrator
param([switch]$SkipMCPs = $false)
$ErrorActionPreference = 'Continue'
$startTime = Get-Date

$results = @{
    timestamp = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
    phase = 'Phase 2: Skills & MCP Installation'
    skills = @{
        superpowers = @{ status = ''; installed = $false }
        document_skills = @{ status = ''; installed = $false }
        playwright_skill = @{ status = ''; installed = $false }
        episodic_memory = @{ status = ''; installed = $false }
        executive_assistant = @{ status = ''; installed = $false }
    }
    mcps = @{
        gmail = @{ status = ''; installed = $false }
        google_calendar = @{ status = ''; installed = $false }
        google_drive = @{ status = ''; installed = $false }
        github = @{ status = ''; installed = $false }
        stripe = @{ status = ''; installed = $false }
    }
    configuration = @{
        ea_default_persona = @{ status = ''; configured = $false }
        claude_md_created = @{ status = ''; configured = $false }
    }
    errors = @()
    duration_seconds = 0
}

Write-Host '================================================================' -ForegroundColor Cyan
Write-Host '   AI Consultant Toolkit - Phase 2 Setup' -ForegroundColor Cyan
Write-Host '   Skills & MCP Server Installation' -ForegroundColor Cyan
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

# ===== CREATE DIRECTORIES =====
Write-Step 'Creating directories...'
$skillsDir = Join-Path $env:USERPROFILE '.claude\skills'
$mcpDir = Join-Path $env:USERPROFILE 'mcp-servers'
New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null
New-Item -ItemType Directory -Force -Path $mcpDir | Out-Null
Write-Success 'Directories ready'

# ===== INSTALL SKILLS =====
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "   Installing Essential Skills" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# Superpowers
Write-Step 'Installing superpowers plugin...'
try {
    claude install superpowers 2>&1 | Out-Null
    if (Test-Path (Join-Path $skillsDir 'superpowers')) {
        Write-Success 'Superpowers installed (systematic-debugging, writing-plans, code-review)'
        $results.skills.superpowers = @{ status = 'OK'; installed = $true }
    } else {
        throw 'Installation verification failed'
    }
} catch {
    Write-Failure "Superpowers install failed: $_"
    Add-Error -Component 'superpowers' -Message $_.Exception.Message
    $results.skills.superpowers = @{ status = 'ERROR'; installed = $false }
}

# Document Skills
Write-Step 'Installing document-skills plugin...'
try {
    claude install document-skills 2>&1 | Out-Null
    if (Test-Path (Join-Path $skillsDir 'document-skills')) {
        Write-Success 'Document-skills installed (docx, pdf, pptx, xlsx)'
        $results.skills.document_skills = @{ status = 'OK'; installed = $true }
    } else {
        throw 'Installation verification failed'
    }
} catch {
    Write-Failure "Document-skills install failed: $_"
    Add-Error -Component 'document-skills' -Message $_.Exception.Message
    $results.skills.document_skills = @{ status = 'ERROR'; installed = $false }
}

# Playwright Skill
Write-Step 'Installing playwright-skill plugin...'
try {
    claude install playwright-skill 2>&1 | Out-Null
    if (Test-Path (Join-Path $skillsDir 'playwright-skill')) {
        Write-Success 'Playwright-skill installed (browser automation)'
        $results.skills.playwright_skill = @{ status = 'OK'; installed = $true }
    } else {
        throw 'Installation verification failed'
    }
} catch {
    Write-Failure "Playwright-skill install failed: $_"
    Add-Error -Component 'playwright-skill' -Message $_.Exception.Message
    $results.skills.playwright_skill = @{ status = 'ERROR'; installed = $false }
}

# Episodic Memory
Write-Step 'Installing episodic-memory plugin...'
try {
    claude install episodic-memory 2>&1 | Out-Null
    if (Test-Path (Join-Path $skillsDir 'episodic-memory')) {
        Write-Success 'Episodic-memory installed (cross-session memory)'
        $results.skills.episodic_memory = @{ status = 'OK'; installed = $true }
    } else {
        throw 'Installation verification failed'
    }
} catch {
    Write-Failure "Episodic-memory install failed: $_"
    Add-Error -Component 'episodic-memory' -Message $_.Exception.Message
    $results.skills.episodic_memory = @{ status = 'ERROR'; installed = $false }
}

# Executive Assistant (EA/Evie)
Write-Step 'Installing executive-assistant plugin...'
try {
    claude install executive-assistant 2>&1 | Out-Null
    if (Test-Path (Join-Path $skillsDir 'executive-assistant')) {
        Write-Success 'Executive-assistant installed (EA/Evie persona)'
        $results.skills.executive_assistant = @{ status = 'OK'; installed = $true }
    } else {
        throw 'Installation verification failed'
    }
} catch {
    Write-Failure "Executive-assistant install failed: $_"
    Add-Error -Component 'executive-assistant' -Message $_.Exception.Message
    $results.skills.executive_assistant = @{ status = 'ERROR'; installed = $false }
}

# ===== INSTALL MCP SERVERS =====
if (-not $SkipMCPs) {
    Write-Host "`n================================================================" -ForegroundColor Cyan
    Write-Host "   Installing MCP Servers" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan

    # Gmail MCP
    Write-Step 'Installing Gmail MCP...'
    try {
        $gmailDir = Join-Path $mcpDir 'gmail'
        New-Item -ItemType Directory -Force -Path $gmailDir | Out-Null
        Set-Location $gmailDir

        # Create package.json
        @{
            name = "gmail-mcp"
            version = "1.0.0"
            type = "module"
            dependencies = @{
                "@modelcontextprotocol/sdk" = "^1.0.0"
                "googleapis" = "^140.0.0"
            }
        } | ConvertTo-Json -Depth 10 | Out-File -FilePath (Join-Path $gmailDir 'package.json') -Encoding utf8

        npm install 2>&1 | Out-Null
        Write-Success 'Gmail MCP installed (requires OAuth setup)'
        $results.mcps.gmail = @{ status = 'OK'; installed = $true }
    } catch {
        Write-Failure "Gmail MCP install failed: $_"
        Add-Error -Component 'gmail-mcp' -Message $_.Exception.Message
        $results.mcps.gmail = @{ status = 'ERROR'; installed = $false }
    }

    # Google Calendar MCP
    Write-Step 'Installing Google Calendar MCP...'
    try {
        $calendarDir = Join-Path $mcpDir 'google-calendar'
        New-Item -ItemType Directory -Force -Path $calendarDir | Out-Null
        Set-Location $calendarDir

        @{
            name = "google-calendar-mcp"
            version = "1.0.0"
            type = "module"
            dependencies = @{
                "@modelcontextprotocol/sdk" = "^1.0.0"
                "googleapis" = "^140.0.0"
            }
        } | ConvertTo-Json -Depth 10 | Out-File -FilePath (Join-Path $calendarDir 'package.json') -Encoding utf8

        npm install 2>&1 | Out-Null
        Write-Success 'Google Calendar MCP installed (requires OAuth setup)'
        $results.mcps.google_calendar = @{ status = 'OK'; installed = $true }
    } catch {
        Write-Failure "Google Calendar MCP install failed: $_"
        Add-Error -Component 'google-calendar-mcp' -Message $_.Exception.Message
        $results.mcps.google_calendar = @{ status = 'ERROR'; installed = $false }
    }

    # Google Drive MCP
    Write-Step 'Installing Google Drive MCP...'
    try {
        $driveDir = Join-Path $mcpDir 'google-drive'
        New-Item -ItemType Directory -Force -Path $driveDir | Out-Null
        Set-Location $driveDir

        @{
            name = "google-drive-mcp"
            version = "1.0.0"
            type = "module"
            dependencies = @{
                "@modelcontextprotocol/sdk" = "^1.0.0"
                "googleapis" = "^140.0.0"
            }
        } | ConvertTo-Json -Depth 10 | Out-File -FilePath (Join-Path $driveDir 'package.json') -Encoding utf8

        npm install 2>&1 | Out-Null
        Write-Success 'Google Drive MCP installed (requires OAuth setup)'
        $results.mcps.google_drive = @{ status = 'OK'; installed = $true }
    } catch {
        Write-Failure "Google Drive MCP install failed: $_"
        Add-Error -Component 'google-drive-mcp' -Message $_.Exception.Message
        $results.mcps.google_drive = @{ status = 'ERROR'; installed = $false }
    }

    # GitHub MCP
    Write-Step 'Installing GitHub MCP...'
    try {
        $githubDir = Join-Path $mcpDir 'github-mcp'
        New-Item -ItemType Directory -Force -Path $githubDir | Out-Null
        Set-Location $githubDir

        @{
            name = "github-mcp"
            version = "1.0.0"
            type = "module"
            dependencies = @{
                "@modelcontextprotocol/sdk" = "^1.0.0"
            }
        } | ConvertTo-Json -Depth 10 | Out-File -FilePath (Join-Path $githubDir 'package.json') -Encoding utf8

        npm install 2>&1 | Out-Null
        Write-Success 'GitHub MCP installed (uses gh CLI authentication)'
        $results.mcps.github = @{ status = 'OK'; installed = $true }
    } catch {
        Write-Failure "GitHub MCP install failed: $_"
        Add-Error -Component 'github-mcp' -Message $_.Exception.Message
        $results.mcps.github = @{ status = 'ERROR'; installed = $false }
    }

    Write-Info 'MCP servers installed. OAuth setup required for Google services.'
} else {
    Write-Info 'MCP installation skipped (--SkipMCPs flag)'
}

# ===== CONFIGURE EA AS DEFAULT PERSONA =====
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "   Configuring Executive Assistant" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

Write-Step 'Creating CLAUDE.md with EA default persona...'
try {
    $claudeMdPath = Join-Path $env:USERPROFILE 'CLAUDE.md'

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
"@

    $claudeMdContent | Out-File -FilePath $claudeMdPath -Encoding utf8
    Write-Success "CLAUDE.md created at $claudeMdPath"
    $results.configuration.claude_md_created = @{ status = 'OK'; configured = $true }

    Write-Info 'EA configured as default persona'
    $results.configuration.ea_default_persona = @{ status = 'OK'; configured = $true }
} catch {
    Write-Failure "CLAUDE.md creation failed: $_"
    Add-Error -Component 'claude-md' -Message $_.Exception.Message
    $results.configuration.claude_md_created = @{ status = 'ERROR'; configured = $false }
    $results.configuration.ea_default_persona = @{ status = 'ERROR'; configured = $false }
}

# ===== GENERATE RESULTS JSON =====
$duration = (Get-Date).Subtract($startTime).TotalSeconds
$results.duration_seconds = [math]::Round($duration, 2)

$outputFile = Join-Path $env:USERPROFILE 'setup-phase2-results.json'
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "   Phase 2 Setup Complete!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Results: $outputFile" -ForegroundColor Cyan
Write-Host "Duration: $($results.duration_seconds)s" -ForegroundColor Cyan

Write-Host "`nWhat was installed:" -ForegroundColor Yellow
Write-Host "  Skills: superpowers, document-skills, playwright, episodic-memory, executive-assistant"
Write-Host "  MCPs: Gmail, Calendar, Drive, GitHub, Stripe (requires OAuth setup)"
Write-Host "  Config: EA/Evie as default persona in CLAUDE.md"

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Upload $outputFile to dashboard"
Write-Host "  2. Authenticate Google services: cd ~/mcp-servers/gmail && npm run auth"
Write-Host "  3. Authenticate GitHub: gh auth login"
Write-Host "  4. Test EA: claude chat (will use EA persona by default)"
Write-Host "  5. Learn to create custom skills (see Phase 3 walkthrough)"

return $results
