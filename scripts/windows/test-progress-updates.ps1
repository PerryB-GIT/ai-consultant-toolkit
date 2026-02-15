# Test Live Dashboard Progress Updates
# This simulates what the setup script sends to the dashboard

$sessionId = [guid]::NewGuid().ToString()
$dashboardUrl = "https://ai-consultant-toolkit.vercel.app/live/$sessionId"
$apiUrl = "https://ai-consultant-toolkit.vercel.app/api/progress/$sessionId"

Write-Host "Test Session ID: $sessionId" -ForegroundColor Cyan
Write-Host "Dashboard URL: $dashboardUrl" -ForegroundColor Green
Write-Host ""
Write-Host "This test will simulate the progress updates sent during Phase 1 setup." -ForegroundColor Yellow
Write-Host "Open the dashboard URL in your browser to watch real-time updates." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to start the test"

function Send-TestProgress {
    param(
        [int]$Step,
        [array]$Completed,
        [string]$Action,
        [hashtable]$Status,
        [array]$Errors = @(),
        [bool]$Complete = $false
    )

    $body = @{
        sessionId = $sessionId
        currentStep = $Step
        completedSteps = $Completed
        currentAction = $Action
        toolStatus = $Status
        errors = $Errors
        timestamp = (Get-Date -Format 'o')
        phase = 'phase1'
        complete = $Complete
    } | ConvertTo-Json -Depth 10

    Write-Host "[$Step] $Action" -ForegroundColor Cyan

    try {
        Invoke-RestMethod -Uri $apiUrl `
            -Method POST `
            -Body $body `
            -ContentType 'application/json' `
            -TimeoutSec 5 `
            -ErrorAction Stop | Out-Null
        Write-Host "  ✓ Progress sent" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to send (API may be unavailable)" -ForegroundColor Red
    }

    Start-Sleep -Seconds 2
}

# Simulate installation flow
$completed = @()
$status = @{}

# Step 1: Chocolatey
Send-TestProgress -Step 1 -Completed $completed -Action "Checking Chocolatey..." -Status $status

$status['chocolatey'] = @{ status = 'installing' }
Send-TestProgress -Step 1 -Completed $completed -Action "Installing Chocolatey..." -Status $status

$status['chocolatey'] = @{ status = 'success'; version = '2.2.2' }
$completed += 'chocolatey'
Send-TestProgress -Step 1 -Completed $completed -Action "Chocolatey complete" -Status $status

# Step 2: Git
Send-TestProgress -Step 2 -Completed $completed -Action "Checking Git..." -Status $status

$status['git'] = @{ status = 'success'; version = '2.43.0' }
$completed += 'git'
Send-TestProgress -Step 2 -Completed $completed -Action "Git complete (already installed)" -Status $status

# Step 3: GitHub CLI
Send-TestProgress -Step 3 -Completed $completed -Action "Checking GitHub CLI..." -Status $status

$status['github_cli'] = @{ status = 'installing' }
Send-TestProgress -Step 3 -Completed $completed -Action "Installing GitHub CLI..." -Status $status

$status['github_cli'] = @{ status = 'success'; version = '2.42.0' }
$completed += 'github_cli'
Send-TestProgress -Step 3 -Completed $completed -Action "GitHub CLI complete" -Status $status

# Step 4: Node.js (simulate error)
Send-TestProgress -Step 4 -Completed $completed -Action "Checking Node.js..." -Status $status

$status['nodejs'] = @{ status = 'installing' }
Send-TestProgress -Step 4 -Completed $completed -Action "Installing Node.js v20..." -Status $status

Start-Sleep -Seconds 3

$status['nodejs'] = @{ status = 'error'; error = 'Network timeout during download' }
$errors = @(@{ tool = 'nodejs'; message = 'Network timeout during download' })
Send-TestProgress -Step 4 -Completed $completed -Action "Node.js failed" -Status $status -Errors $errors

# Send error log
$errorLog = @{
    tool = 'nodejs'
    error = 'Network timeout during download'
    suggestedFix = 'Try manual install from nodejs.org (download LTS installer)'
    step = 4
    timestamp = (Get-Date -Format 'o')
} | ConvertTo-Json

Write-Host "  Sending error log..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$apiUrl/log" `
        -Method POST `
        -Body $errorLog `
        -ContentType 'application/json' `
        -TimeoutSec 5 `
        -ErrorAction Stop | Out-Null
    Write-Host "  ✓ Error log sent" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to send error log" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Step 5: Python
Send-TestProgress -Step 5 -Completed $completed -Action "Checking Python..." -Status $status -Errors $errors

$status['python'] = @{ status = 'success'; version = '3.11.8' }
$completed += 'python'
Send-TestProgress -Step 5 -Completed $completed -Action "Python complete (already installed)" -Status $status -Errors $errors

# Step 6: WSL2
Send-TestProgress -Step 6 -Completed $completed -Action "Checking WSL2..." -Status $status -Errors $errors

$status['wsl2'] = @{ status = 'success'; version = '2.0.0' }
$completed += 'wsl2'
Send-TestProgress -Step 6 -Completed $completed -Action "WSL2 complete (already installed)" -Status $status -Errors $errors

# Step 7: Claude Code
Send-TestProgress -Step 7 -Completed $completed -Action "Checking Claude Code..." -Status $status -Errors $errors

$status['claude'] = @{ status = 'installing' }
Send-TestProgress -Step 7 -Completed $completed -Action "Installing Claude Code CLI..." -Status $status -Errors $errors

$status['claude'] = @{ status = 'success'; version = '1.2.3' }
$completed += 'claude'
Send-TestProgress -Step 7 -Completed $completed -Action "Claude Code complete" -Status $status -Errors $errors

# Step 8: Docker
Send-TestProgress -Step 8 -Completed $completed -Action "Checking Docker Desktop..." -Status $status -Errors $errors

$status['docker'] = @{ status = 'skipped'; message = 'User skipped installation' }
$completed += 'docker'
Send-TestProgress -Step 8 -Completed $completed -Action "Docker skipped" -Status $status -Errors $errors

# Final completion
Send-TestProgress -Step 9 -Completed $completed -Action "Setup complete!" -Status $status -Errors $errors -Complete $true

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Green
Write-Host "Dashboard: $dashboardUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  ✓ Chocolatey (installed)" -ForegroundColor Green
Write-Host "  ✓ Git (already installed)" -ForegroundColor Green
Write-Host "  ✓ GitHub CLI (installed)" -ForegroundColor Green
Write-Host "  ✗ Node.js (failed - network error)" -ForegroundColor Red
Write-Host "  ✓ Python (already installed)" -ForegroundColor Green
Write-Host "  ✓ WSL2 (already installed)" -ForegroundColor Green
Write-Host "  ✓ Claude Code (installed)" -ForegroundColor Green
Write-Host "  ⊘ Docker (skipped)" -ForegroundColor Yellow
