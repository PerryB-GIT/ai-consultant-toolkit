# Example PowerShell script for updating progress via API
# Usage: .\example-progress-update.ps1

# Configuration
$baseUrl = "https://ai-consultant-toolkit-web.vercel.app" # Replace with your domain
$sessionId = "setup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "Progress Tracking Example" -ForegroundColor Cyan
Write-Host "Session ID: $sessionId" -ForegroundColor Yellow
Write-Host ""

# Function to update progress
function Update-Progress {
    param(
        [string]$SessionId,
        [int]$CurrentStep,
        [int[]]$CompletedSteps,
        [string]$CurrentAction,
        [hashtable]$ToolStatus,
        [array]$Errors,
        [string]$Phase,
        [bool]$Complete
    )

    $progress = @{
        sessionId = $SessionId
        currentStep = $CurrentStep
        completedSteps = $CompletedSteps
        currentAction = $CurrentAction
        toolStatus = $ToolStatus
        errors = $Errors
        timestamp = (Get-Date -Format o)
        phase = $Phase
        complete = $Complete
    } | ConvertTo-Json -Depth 10

    try {
        $response = Invoke-RestMethod `
            -Uri "$baseUrl/api/progress/$SessionId" `
            -Method POST `
            -Body $progress `
            -ContentType "application/json"

        Write-Host "✓ Progress updated" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "✗ Failed to update progress: $_" -ForegroundColor Red
        return $null
    }
}

# Function to log an error
function Add-ErrorLog {
    param(
        [string]$SessionId,
        [string]$Tool,
        [string]$Error,
        [string]$SuggestedFix,
        [int]$Step
    )

    $errorEntry = @{
        tool = $Tool
        error = $Error
        suggestedFix = $SuggestedFix
        timestamp = (Get-Date -Format o)
        step = $Step
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod `
            -Uri "$baseUrl/api/progress/$SessionId/log" `
            -Method POST `
            -Body $errorEntry `
            -ContentType "application/json"

        Write-Host "✓ Error logged" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "✗ Failed to log error: $_" -ForegroundColor Red
        return $null
    }
}

# Function to get current progress
function Get-Progress {
    param([string]$SessionId)

    try {
        $response = Invoke-RestMethod `
            -Uri "$baseUrl/api/progress/$SessionId" `
            -Method GET

        return $response
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "Session not found" -ForegroundColor Yellow
        }
        else {
            Write-Host "Failed to get progress: $_" -ForegroundColor Red
        }
        return $null
    }
}

# Function to get error log
function Get-ErrorLog {
    param([string]$SessionId)

    try {
        $response = Invoke-RestMethod `
            -Uri "$baseUrl/api/progress/$SessionId/log" `
            -Method GET

        return $response
    }
    catch {
        Write-Host "Failed to get error log: $_" -ForegroundColor Red
        return $null
    }
}

# Example workflow
Write-Host "Step 1: Starting Phase 1 setup" -ForegroundColor Cyan
Update-Progress `
    -SessionId $sessionId `
    -CurrentStep 1 `
    -CompletedSteps @() `
    -CurrentAction "Starting Phase 1 setup" `
    -ToolStatus @{
        gmail = @{ status = "pending" }
        calendar = @{ status = "pending" }
        drive = @{ status = "pending" }
    } `
    -Errors @() `
    -Phase "phase1" `
    -Complete $false

Start-Sleep -Seconds 2

Write-Host "Step 2: Installing Gmail MCP" -ForegroundColor Cyan
Update-Progress `
    -SessionId $sessionId `
    -CurrentStep 2 `
    -CompletedSteps @(1) `
    -CurrentAction "Installing Gmail MCP server" `
    -ToolStatus @{
        gmail = @{ status = "installing" }
        calendar = @{ status = "pending" }
        drive = @{ status = "pending" }
    } `
    -Errors @() `
    -Phase "phase1" `
    -Complete $false

Start-Sleep -Seconds 2

Write-Host "Step 3: Gmail installed successfully" -ForegroundColor Cyan
Update-Progress `
    -SessionId $sessionId `
    -CurrentStep 3 `
    -CompletedSteps @(1, 2) `
    -CurrentAction "Installing Calendar MCP server" `
    -ToolStatus @{
        gmail = @{ status = "success"; version = "1.0.0" }
        calendar = @{ status = "installing" }
        drive = @{ status = "pending" }
    } `
    -Errors @() `
    -Phase "phase1" `
    -Complete $false

Start-Sleep -Seconds 2

Write-Host "Step 4: Simulating error in Calendar install" -ForegroundColor Cyan
Update-Progress `
    -SessionId $sessionId `
    -CurrentStep 4 `
    -CompletedSteps @(1, 2) `
    -CurrentAction "Troubleshooting Calendar MCP installation" `
    -ToolStatus @{
        gmail = @{ status = "success"; version = "1.0.0" }
        calendar = @{ status = "error"; error = "npm install failed" }
        drive = @{ status = "pending" }
    } `
    -Errors @(
        @{
            tool = "calendar"
            error = "npm install failed"
            suggestedFix = "Run: cd ~/mcp-servers/google-calendar && npm cache clean --force && npm install"
        }
    ) `
    -Phase "phase1" `
    -Complete $false

# Log the error separately
Add-ErrorLog `
    -SessionId $sessionId `
    -Tool "calendar" `
    -Error "npm install failed" `
    -SuggestedFix "Run: cd ~/mcp-servers/google-calendar && npm cache clean --force && npm install" `
    -Step 4

Start-Sleep -Seconds 2

Write-Host "`nRetrieving current progress..." -ForegroundColor Cyan
$currentProgress = Get-Progress -SessionId $sessionId
if ($currentProgress) {
    Write-Host ($currentProgress | ConvertTo-Json -Depth 10) -ForegroundColor White
}

Write-Host "`nRetrieving error log..." -ForegroundColor Cyan
$errorLog = Get-ErrorLog -SessionId $sessionId
if ($errorLog) {
    Write-Host ($errorLog | ConvertTo-Json -Depth 10) -ForegroundColor White
}

Write-Host "`n✅ Example complete!" -ForegroundColor Green
Write-Host "Session ID: $sessionId" -ForegroundColor Yellow
Write-Host "Data will expire in 1 hour" -ForegroundColor Gray
