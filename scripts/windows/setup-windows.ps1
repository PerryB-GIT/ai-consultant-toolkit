<#
.SYNOPSIS
    AI Consultant Toolkit - Windows Setup Script

.PARAMETER SessionId
    Optional session ID for dashboard integration. If not provided, generates a new one.

.PARAMETER SkipDocker
    Skip Docker Desktop installation.

.PARAMETER SkillsRepoUrl
    HTTPS URL of the client's private skills repo. Defaults to the Support Forge template.
    Example: https://github.com/PerryB-GIT/eyam-toolkit.git

.EXAMPLE
    .\setup-windows.ps1
    Run with auto-generated session ID

.EXAMPLE
    .\setup-windows.ps1 -SessionId "abc123-def456"
    Run with specific session ID from dashboard

.EXAMPLE
    .\setup-windows.ps1 -SkillsRepoUrl "https://github.com/PerryB-GIT/eyam-toolkit.git"
    Run with a client-specific skills repo
#>
#Requires -RunAsAdministrator
param(
    [string]$SessionId = $null,
    [switch]$SkipDocker = $false,
    [string]$SkillsRepoUrl = 'https://github.com/PerryB-GIT/client-toolkit-template.git'
)
$ErrorActionPreference = 'Continue'
$startTime = Get-Date

# ===== LIVE DASHBOARD SESSION =====
# Use provided session ID or generate new one
if ([string]::IsNullOrWhiteSpace($SessionId)) {
    $script:sessionId = [guid]::NewGuid().ToString()
    Write-Host "Generated new session ID: $script:sessionId" -ForegroundColor Gray
} else {
    $script:sessionId = $SessionId
    Write-Host "Using provided session ID: $script:sessionId" -ForegroundColor Gray
}

# API endpoint
$apiUrl = "https://ai-consultant-toolkit.vercel.app/api/progress/$script:sessionId"

$results = @{
    os = ''
    timestamp = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
    results = @{
        chocolatey = @{ status = ''; version = $null; installed = $false }
        git = @{ status = ''; version = $null; installed = $false }
        github_cli = @{ status = ''; version = $null; installed = $false }
        nodejs = @{ status = ''; version = $null; installed = $false }
        python = @{ status = ''; version = $null; installed = $false }
        wsl2 = @{ status = ''; version = $null; installed = $false; restart_required = $false }
        claude = @{ status = ''; version = $null; installed = $false }
        docker = @{ status = ''; version = $null; installed = $false }
    }
    errors = @()
    duration_seconds = 0
    restart_required = $false
}

# Progress tracking
$currentStep = 0
$completedSteps = @()
$toolStatus = @{}

$osInfo = Get-CimInstance Win32_OperatingSystem
$results.os = "$($osInfo.Caption) $($osInfo.Version)"

Write-Host ''
Write-Host '================================================================' -ForegroundColor Cyan
Write-Host '   AI Consultant Toolkit - Windows Setup' -ForegroundColor Cyan
Write-Host '================================================================' -ForegroundColor Cyan
Write-Host ''
Write-Host '==================================================' -ForegroundColor Cyan
Write-Host '  Watch Live Progress:' -ForegroundColor Green
Write-Host '  https://ai-consultant-toolkit.vercel.app/setup' -ForegroundColor Yellow
Write-Host '==================================================' -ForegroundColor Cyan
Write-Host ''
# ===== HELPER FUNCTIONS =====
function Write-Step { param([string]$Message); Write-Host "`n> $Message" -ForegroundColor Yellow }
function Write-Success { param([string]$Message); Write-Host "  [OK] $Message" -ForegroundColor Green }
function Write-Info { param([string]$Message); Write-Host "  [INFO] $Message" -ForegroundColor Cyan }
function Write-Failure { param([string]$Message); Write-Host "  [FAIL] $Message" -ForegroundColor Red }
function Add-Error { param([string]$Tool, [string]$Message, [string]$Fix = ''); $results.errors += @{ tool = $Tool; error = $Message; suggestedFix = $Fix } }
function Get-InstalledVersion { param([string]$Command, [string]$VersionArg = '--version'); try { $v = & $Command $VersionArg 2>&1 | Select-Object -First 1; if ($v -match '(\d+\.\d+\.\d+)') { return $matches[1] }; return $v.ToString().Trim() } catch { return $null } }
function Refresh-EnvironmentPath { $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User') }
function Wait-ForCommand {
    # Retry PATH refresh up to 6 times (6s) waiting for a newly-installed command to appear
    param([string]$Command, [int]$MaxAttempts = 6)
    for ($i = 0; $i -lt $MaxAttempts; $i++) {
        Refresh-EnvironmentPath
        if (Get-Command $Command -ErrorAction SilentlyContinue) { return $true }
        Start-Sleep -Seconds 1
    }
    return $false
}

# ===== LIVE DASHBOARD FUNCTIONS =====
function Send-Progress {
    param(
        [int]$CurrentStep,
        [array]$CompletedSteps,
        [string]$CurrentAction,
        [hashtable]$ToolStatus,
        [array]$Errors,
        [bool]$Complete = $false
    )

    $body = @{
        sessionId = $script:sessionId
        currentStep = $CurrentStep
        completedSteps = $CompletedSteps
        currentAction = $CurrentAction
        toolStatus = $ToolStatus
        errors = $Errors
        timestamp = (Get-Date -Format 'o')
        phase = 'phase1'
        complete = $Complete
    } | ConvertTo-Json -Depth 10

    try {
        Invoke-RestMethod -Uri $script:apiUrl `
            -Method POST `
            -Body $body `
            -ContentType 'application/json' `
            -TimeoutSec 5 `
            -ErrorAction SilentlyContinue | Out-Null
    } catch {
        # Silently fail - don't break setup if dashboard unreachable
    }
}


# ===== CHOCOLATEY =====
$currentStep = 1
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Checking Chocolatey..." -ToolStatus $toolStatus -Errors $results.errors
Write-Step 'Checking Chocolatey...'
if (Get-Command choco -ErrorAction SilentlyContinue) {
    $version = Get-InstalledVersion -Command 'choco' -VersionArg '-v'
    Write-Success "Chocolatey already installed ($version)"
    $results.results.chocolatey = @{ status = 'OK'; version = $version; installed = $false }
    $toolStatus['chocolatey'] = @{ status = 'success'; version = $version }
    $completedSteps += 1
} else {
    Write-Info 'Installing Chocolatey...'
    $toolStatus['chocolatey'] = @{ status = 'installing'; version = $null }
    Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Installing Chocolatey..." -ToolStatus $toolStatus -Errors $results.errors
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Refresh-EnvironmentPath
        $version = Get-InstalledVersion -Command 'choco' -VersionArg '-v'
        if ($version) {
            Write-Success "Chocolatey installed ($version)"
            $results.results.chocolatey = @{ status = 'OK'; version = $version; installed = $true }
            $toolStatus['chocolatey'] = @{ status = 'success'; version = $version }
            $completedSteps += 1
        } else {
            throw 'Chocolatey installation verification failed'
        }
    } catch {
        Write-Failure "Chocolatey install failed: $_"
        Add-Error -Tool 'chocolatey' -Message $_.Exception.Message -Fix "Run PowerShell as Administrator and ensure internet connection is stable"
        $results.results.chocolatey = @{ status = 'ERROR'; version = $null; installed = $false }
        $toolStatus['chocolatey'] = @{ status = 'error'; version = $null; error = $_.Exception.Message }
    }
}
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Chocolatey complete" -ToolStatus $toolStatus -Errors $results.errors

# ===== GIT =====
$currentStep = 2
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Checking Git..." -ToolStatus $toolStatus -Errors $results.errors
Write-Step 'Checking Git...'
if (Get-Command git -ErrorAction SilentlyContinue) {
    $version = Get-InstalledVersion -Command 'git'
    Write-Success "Git already installed ($version)"
    $results.results.git = @{ status = 'OK'; version = $version; installed = $false }
    $toolStatus['git'] = @{ status = 'success'; version = $version }
    $completedSteps += 2
} else {
    Write-Info 'Installing Git...'
    $toolStatus['git'] = @{ status = 'installing'; version = $null }
    Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Installing Git..." -ToolStatus $toolStatus -Errors $results.errors
    try {
        choco install git -y --no-progress
        if (-not (Wait-ForCommand 'git')) { throw 'git not found in PATH after install' }
        $version = Get-InstalledVersion -Command 'git'
        if ($version) {
            Write-Success "Git installed ($version)"
            $results.results.git = @{ status = 'OK'; version = $version; installed = $true }
            $toolStatus['git'] = @{ status = 'success'; version = $version }
            $completedSteps += 2
        } else {
            throw 'Git installation verification failed'
        }
    } catch {
        Write-Failure "Git install failed: $_"
        Add-Error -Tool 'git' -Message $_.Exception.Message -Fix "Try manual install from git-scm.com or ensure Chocolatey is working"
        $results.results.git = @{ status = 'ERROR'; version = $null; installed = $false }
        $toolStatus['git'] = @{ status = 'error'; version = $null; error = $_.Exception.Message }
    }
}
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Git complete" -ToolStatus $toolStatus -Errors $results.errors

# ===== GITHUB CLI =====
$currentStep = 3
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Checking GitHub CLI..." -ToolStatus $toolStatus -Errors $results.errors
Write-Step 'Checking GitHub CLI...'
if (Get-Command gh -ErrorAction SilentlyContinue) {
    $version = Get-InstalledVersion -Command 'gh'
    Write-Success "GitHub CLI already installed ($version)"
    $results.results.github_cli = @{ status = 'OK'; version = $version; installed = $false }
    $toolStatus['github_cli'] = @{ status = 'success'; version = $version }
    $completedSteps += 3
} else {
    Write-Info 'Installing GitHub CLI...'
    $toolStatus['github_cli'] = @{ status = 'installing'; version = $null }
    Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Installing GitHub CLI..." -ToolStatus $toolStatus -Errors $results.errors
    try {
        choco install gh -y --no-progress
        if (-not (Wait-ForCommand 'gh')) { throw 'gh not found in PATH after install' }
        $version = Get-InstalledVersion -Command 'gh'
        if ($version) {
            Write-Success "GitHub CLI installed ($version)"
            $results.results.github_cli = @{ status = 'OK'; version = $version; installed = $true }
            $toolStatus['github_cli'] = @{ status = 'success'; version = $version }
            $completedSteps += 3
        } else {
            throw 'GitHub CLI installation verification failed'
        }
    } catch {
        Write-Failure "GitHub CLI install failed: $_"
        Add-Error -Tool 'github_cli' -Message $_.Exception.Message -Fix "Try manual install from cli.github.com"
        $results.results.github_cli = @{ status = 'ERROR'; version = $null; installed = $false }
        $toolStatus['github_cli'] = @{ status = 'error'; version = $null; error = $_.Exception.Message }
    }
}
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "GitHub CLI complete" -ToolStatus $toolStatus -Errors $results.errors

# ===== NODE.JS =====
$currentStep = 4
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Checking Node.js..." -ToolStatus $toolStatus -Errors $results.errors
Write-Step 'Checking Node.js...'
if (Get-Command node -ErrorAction SilentlyContinue) {
    $version = Get-InstalledVersion -Command 'node'
    Write-Success "Node.js already installed ($version)"
    $results.results.nodejs = @{ status = 'OK'; version = $version; installed = $false }
    $toolStatus['nodejs'] = @{ status = 'success'; version = $version }
    $completedSteps += 4
} else {
    Write-Info 'Installing Node.js v20 LTS...'
    $toolStatus['nodejs'] = @{ status = 'installing'; version = $null }
    Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Installing Node.js v20..." -ToolStatus $toolStatus -Errors $results.errors
    try {
        choco install nodejs-lts --version=20.18.0 -y --no-progress
        if (-not (Wait-ForCommand 'node')) { throw 'node not found in PATH after install' }
        $version = Get-InstalledVersion -Command 'node'
        if ($version) {
            Write-Success "Node.js installed ($version)"
            $results.results.nodejs = @{ status = 'OK'; version = $version; installed = $true }
            $toolStatus['nodejs'] = @{ status = 'success'; version = $version }
            $completedSteps += 4
        } else {
            throw 'Node.js installation verification failed'
        }
    } catch {
        Write-Failure "Node.js install failed: $_"
        Add-Error -Tool 'nodejs' -Message $_.Exception.Message -Fix "Try manual install from nodejs.org (download LTS installer)"
        $results.results.nodejs = @{ status = 'ERROR'; version = $null; installed = $false }
        $toolStatus['nodejs'] = @{ status = 'error'; version = $null; error = $_.Exception.Message }
    }
}
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Node.js complete" -ToolStatus $toolStatus -Errors $results.errors

# ===== PYTHON =====
$currentStep = 5
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Checking Python..." -ToolStatus $toolStatus -Errors $results.errors
Write-Step 'Checking Python...'
if (Get-Command python -ErrorAction SilentlyContinue) {
    $version = Get-InstalledVersion -Command 'python'
    Write-Success "Python already installed ($version)"
    $results.results.python = @{ status = 'OK'; version = $version; installed = $false }
    $toolStatus['python'] = @{ status = 'success'; version = $version }
    $completedSteps += 5
} else {
    Write-Info 'Installing Python 3.11...'
    $toolStatus['python'] = @{ status = 'installing'; version = $null }
    Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Installing Python 3.11..." -ToolStatus $toolStatus -Errors $results.errors
    try {
        choco install python311 -y --no-progress
        if (-not (Wait-ForCommand 'python')) { throw 'python not found in PATH after install' }
        $version = Get-InstalledVersion -Command 'python'
        if ($version) {
            Write-Success "Python installed ($version)"
            $results.results.python = @{ status = 'OK'; version = $version; installed = $true }
            $toolStatus['python'] = @{ status = 'success'; version = $version }
            $completedSteps += 5
        } else {
            throw 'Python installation verification failed'
        }
    } catch {
        Write-Failure "Python install failed: $_"
        Add-Error -Tool 'python' -Message $_.Exception.Message -Fix "Try manual install from python.org (download 3.11.x installer, check 'Add to PATH')"
        $results.results.python = @{ status = 'ERROR'; version = $null; installed = $false }
        $toolStatus['python'] = @{ status = 'error'; version = $null; error = $_.Exception.Message }
    }
}
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Python complete" -ToolStatus $toolStatus -Errors $results.errors

# ===== WSL2 =====
$currentStep = 6
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Checking WSL2..." -ToolStatus $toolStatus -Errors $results.errors
Write-Step 'Checking WSL2...'
$wslStatus = wsl --status 2>&1
if ($wslStatus -like '*Default Version: 2*' -or $wslStatus -like '*WSL version: 2*') {
    $version = (wsl --version 2>&1 | Select-String 'WSL version:' | ForEach-Object { $_.ToString().Split(':')[1].Trim() })
    if (-not $version) { $version = '2.0.0' }
    Write-Success "WSL2 already installed ($version)"
    $results.results.wsl2 = @{ status = 'OK'; version = $version; installed = $false; restart_required = $false }
    $toolStatus['wsl2'] = @{ status = 'success'; version = $version }
    $completedSteps += 6
} else {
    Write-Info 'Installing WSL2...'
    $toolStatus['wsl2'] = @{ status = 'installing'; version = $null }
    Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Installing WSL2..." -ToolStatus $toolStatus -Errors $results.errors
    try {
        wsl --install --no-launch
        $results.restart_required = $true
        $results.results.wsl2 = @{ status = 'OK'; version = '2.0.0'; installed = $true; restart_required = $true }
        $toolStatus['wsl2'] = @{ status = 'success'; version = '2.0.0'; restart_required = $true }
        $completedSteps += 6
        Write-Success 'WSL2 installed (restart required)'
        Write-Host '  [WARN] You must restart Windows to complete WSL2 installation' -ForegroundColor Yellow
    } catch {
        Write-Failure "WSL2 install failed: $_"
        Add-Error -Tool 'wsl2' -Message $_.Exception.Message -Fix "Restart required. Run script again after reboot. If fails repeatedly, enable virtualization in BIOS."
        $results.results.wsl2 = @{ status = 'ERROR'; version = $null; installed = $false; restart_required = $false }
        $toolStatus['wsl2'] = @{ status = 'error'; version = $null; error = $_.Exception.Message }
    }
}
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "WSL2 complete" -ToolStatus $toolStatus -Errors $results.errors

# ===== CLAUDE CODE =====
$currentStep = 7
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Checking Claude Code..." -ToolStatus $toolStatus -Errors $results.errors
Write-Step 'Checking Claude Code CLI...'
if (Get-Command claude -ErrorAction SilentlyContinue) {
    $version = Get-InstalledVersion -Command 'claude'
    Write-Success "Claude Code already installed ($version)"
    $results.results.claude = @{ status = 'OK'; version = $version; installed = $false }
    $toolStatus['claude'] = @{ status = 'success'; version = $version }
    $completedSteps += 7
} else {
    Write-Info 'Installing Claude Code via npm...'
    $toolStatus['claude'] = @{ status = 'installing'; version = $null }
    Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Installing Claude Code CLI..." -ToolStatus $toolStatus -Errors $results.errors
    try {
        if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
            throw 'npm not found. Ensure Node.js is installed.'
        }
        Write-Info 'Running: npm install -g @anthropic-ai/claude-code'
        $npmOutput = npm install -g @anthropic-ai/claude-code 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed with exit code $LASTEXITCODE"
        }
        Refresh-EnvironmentPath
        Start-Sleep -Seconds 2
        $version = Get-InstalledVersion -Command 'claude'
        if ($version) {
            Write-Success "Claude Code installed ($version)"
            $results.results.claude = @{ status = 'OK'; version = $version; installed = $true }
            $toolStatus['claude'] = @{ status = 'success'; version = $version }
            $completedSteps += 7
        } else {
            throw 'Claude Code installation verification failed'
        }
    } catch {
        Write-Failure "Claude Code install failed: $_"
        Add-Error -Tool 'claude' -Message $_.Exception.Message -Fix "Ensure Node.js is installed. Try: npm install -g @anthropic-ai/claude-code manually"
        $results.results.claude = @{ status = 'ERROR'; version = $null; installed = $false }
        $toolStatus['claude'] = @{ status = 'error'; version = $null; error = $_.Exception.Message }
    }
}
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Claude Code complete" -ToolStatus $toolStatus -Errors $results.errors

# ===== DOCKER DESKTOP =====
$currentStep = 8
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Checking Docker Desktop..." -ToolStatus $toolStatus -Errors $results.errors
Write-Step 'Checking Docker Desktop...'
if ($SkipDocker) {
    Write-Info 'Docker installation skipped (--SkipDocker flag)'
    $results.results.docker = @{ status = 'SKIPPED'; version = $null; installed = $false }
    $toolStatus['docker'] = @{ status = 'skipped'; version = $null }
    $completedSteps += 8
} elseif (Get-Command docker -ErrorAction SilentlyContinue) {
    $version = Get-InstalledVersion -Command 'docker'
    Write-Success "Docker already installed ($version)"
    $results.results.docker = @{ status = 'OK'; version = $version; installed = $false }
    $toolStatus['docker'] = @{ status = 'success'; version = $version }
    $completedSteps += 8
} else {
    if ($results.results.wsl2.restart_required) {
        Write-Info 'Docker installation skipped (WSL2 restart required first)'
        $results.results.docker = @{ status = 'SKIPPED'; version = $null; installed = $false }
        $toolStatus['docker'] = @{ status = 'skipped'; version = $null; message = 'WSL2 restart required first' }
        $completedSteps += 8
    } else {
        Write-Info 'Installing Docker Desktop...'
        $toolStatus['docker'] = @{ status = 'installing'; version = $null }
        Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Installing Docker Desktop..." -ToolStatus $toolStatus -Errors $results.errors
        try {
            choco install docker-desktop -y --no-progress
            Refresh-EnvironmentPath
            $version = Get-InstalledVersion -Command 'docker'
            if ($version) {
                Write-Success "Docker Desktop installed ($version)"
                $results.results.docker = @{ status = 'OK'; version = $version; installed = $true }
                $toolStatus['docker'] = @{ status = 'success'; version = $version }
                $completedSteps += 8
                Write-Info 'Docker Desktop requires manual start from Start Menu'
            } else {
                throw 'Docker Desktop installation verification failed'
            }
        } catch {
            Write-Failure "Docker Desktop install failed: $_"
            Add-Error -Tool 'docker' -Message $_.Exception.Message -Fix "Ensure WSL2 is installed and working. Manual download: docker.com/products/docker-desktop"
            $results.results.docker = @{ status = 'ERROR'; version = $null; installed = $false }
            $toolStatus['docker'] = @{ status = 'error'; version = $null; error = $_.Exception.Message }
        }
    }
}
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Docker complete" -ToolStatus $toolStatus -Errors $results.errors

# ===== SKILLS INSTALL =====
$currentStep = 9
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Installing Claude Code skills..." -ToolStatus $toolStatus -Errors $results.errors
Write-Step 'Installing Claude Code skills...'

$skillsDir = Join-Path $env:USERPROFILE '.claude\skills'
$cloneDir  = Join-Path $env:TEMP 'support-forge-toolkit'

$toolStatus['skills'] = @{ status = 'installing'; version = $null }
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Cloning skills repo..." -ToolStatus $toolStatus -Errors $results.errors

try {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw 'git not found. Ensure Git was installed in a previous step.'
    }

    # Clean up any prior clone attempt
    if (Test-Path $cloneDir) { Remove-Item -Recurse -Force $cloneDir }

    # ── Auth strategy ──────────────────────────────────────────────────────
    # gh CLI handles HTTPS auth for private repos transparently.
    # If gh is available and authenticated, use it. Otherwise fall back to
    # plain git (works for public repos or when a credential manager is set up).
    Write-Info "Cloning skills repo: $SkillsRepoUrl"
    $cloneSuccess = $false

    # Parse org/repo from URL for gh CLI
    if ($SkillsRepoUrl -match 'github\.com[:/](.+/.+?)(?:\.git)?$') {
        $repoSlug = $matches[1]
    } else {
        $repoSlug = $null
    }

    if ($repoSlug -and (Get-Command gh -ErrorAction SilentlyContinue)) {
        $ghStatus = gh auth status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Info "Using gh CLI for authenticated clone..."
            # Set SSH key path explicitly so it works under Administrator context
            $env:GIT_SSH_COMMAND = "ssh -i `"$env:USERPROFILE\.ssh\id_rsa`" -o IdentitiesOnly=yes -o StrictHostKeyChecking=no"
            gh repo clone $repoSlug $cloneDir -- --depth 1 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) { $cloneSuccess = $true }
        }
    }

    if (-not $cloneSuccess) {
        Write-Info "Attempting git clone (requires repo to be public or credential manager configured)..."
        git clone --depth 1 $SkillsRepoUrl $cloneDir 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { $cloneSuccess = $true }
    }

    if (-not $cloneSuccess) {
        throw "Could not clone skills repo. Run 'gh auth login' then re-run this script, or contact perry@support-forge.com."
    }

    $sourceSkills = Join-Path $cloneDir 'skills'
    if (-not (Test-Path $sourceSkills)) { throw "skills/ directory not found in cloned repo." }

    New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null

    $skillCount = 0
    $skillList = Get-ChildItem -Directory $sourceSkills
    $skillTotal = $skillList.Count

    foreach ($skillFolder in $skillList) {
        $dest = Join-Path $skillsDir $skillFolder.Name
        $skillCount++
        Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps `
            -CurrentAction "Installing skill $skillCount/$skillTotal`: $($skillFolder.Name)" `
            -ToolStatus $toolStatus -Errors $results.errors
        if (-not (Test-Path $dest)) {
            Copy-Item -Recurse -Path $skillFolder.FullName -Destination $dest
        }
    }

    # Clean up temp clone
    Remove-Item -Recurse -Force $cloneDir -ErrorAction SilentlyContinue

    Write-Success "$skillCount skills installed to $skillsDir"
    $results.results['skills'] = @{ status = 'OK'; version = "$skillCount skills"; installed = $true }
    $toolStatus['skills'] = @{ status = 'success'; version = "$skillCount skills" }
    $completedSteps += 9
} catch {
    Write-Failure "Skills install failed: $_"
    Add-Error -Tool 'skills' -Message $_.Exception.Message -Fix "Run 'gh auth login' in a new terminal, then re-run this script. If the repo is private ensure you have access."
    $results.results['skills'] = @{ status = 'ERROR'; version = $null; installed = $false }
    $toolStatus['skills'] = @{ status = 'error'; version = $null; error = $_.Exception.Message }
}
Send-Progress -CurrentStep $currentStep -CompletedSteps $completedSteps -CurrentAction "Skills install complete" -ToolStatus $toolStatus -Errors $results.errors

# ===== GENERATE RESULTS JSON =====
$duration = (Get-Date).Subtract($startTime).TotalSeconds
$results.duration_seconds = [math]::Round($duration, 2)

$outputFile = Join-Path $env:USERPROFILE 'setup-results.json'
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding utf8

# Final progress update - mark as complete (step 11 = Complete in dashboard)
Send-Progress -CurrentStep 11 -CompletedSteps $completedSteps -CurrentAction "Setup complete!" -ToolStatus $toolStatus -Errors $results.errors -Complete $true

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Results: $outputFile" -ForegroundColor Cyan
Write-Host "Duration: $($results.duration_seconds)s" -ForegroundColor Cyan
Write-Host ''
Write-Host '==================================================' -ForegroundColor Cyan
Write-Host '  Final Results:' -ForegroundColor Green
Write-Host '  https://ai-consultant-toolkit.vercel.app/setup' -ForegroundColor Yellow
Write-Host '==================================================' -ForegroundColor Cyan

if ($results.restart_required) {
    Write-Host "`n[!] RESTART REQUIRED to complete WSL2 installation" -ForegroundColor Yellow
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Open a new PowerShell (regular, not Admin) and run: gh auth login"
Write-Host "  2. Open a new terminal and run: claude"
Write-Host "     Enter your Anthropic API key when prompted"
Write-Host "  3. Inside Claude Code, type: /writing-emails"
if ($results.results.docker.status -eq 'OK' -and $results.results.docker.installed) {
    Write-Host "  4. Start Docker Desktop from Start Menu"
}

return $results
