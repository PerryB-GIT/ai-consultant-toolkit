# Quick test for live progress tracking
$sessionId = [guid]::NewGuid().ToString()
$dashboardUrl = "https://ai-consultant-toolkit.vercel.app/live/$sessionId"

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Live Progress Test" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Session ID: $sessionId" -ForegroundColor Yellow
Write-Host ""
Write-Host "Open this URL in your browser:" -ForegroundColor Green
Write-Host $dashboardUrl -ForegroundColor White
Write-Host ""

# Open browser
Start-Process $dashboardUrl

Write-Host "Sending test progress updates..." -ForegroundColor Yellow
Write-Host ""

# Test update 1
$body1 = @{
    sessionId = $sessionId
    currentStep = 1
    completedSteps = @()
    currentAction = "Installing Chocolatey..."
    toolStatus = @{
        chocolatey = @{ status = "installing" }
    }
    errors = @()
    timestamp = (Get-Date -Format 'o')
    phase = "phase1"
    complete = $false
} | ConvertTo-Json -Depth 10

Write-Host "[1] Installing Chocolatey..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "https://ai-consultant-toolkit.vercel.app/api/progress/$sessionId" `
        -Method POST -Body $body1 -ContentType "application/json" -TimeoutSec 10 | Out-Null
    Write-Host "  Success: Update sent" -ForegroundColor Green
} catch {
    Write-Host "  Failed: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 3

# Test update 2
$body2 = @{
    sessionId = $sessionId
    currentStep = 2
    completedSteps = @(1)
    currentAction = "Installing Node.js v20..."
    toolStatus = @{
        chocolatey = @{ status = "success"; version = "2.2.2" }
        nodejs = @{ status = "installing" }
    }
    errors = @()
    timestamp = (Get-Date -Format 'o')
    phase = "phase1"
    complete = $false
} | ConvertTo-Json -Depth 10

Write-Host "[2] Installing Node.js..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "https://ai-consultant-toolkit.vercel.app/api/progress/$sessionId" `
        -Method POST -Body $body2 -ContentType "application/json" -TimeoutSec 10 | Out-Null
    Write-Host "  Success: Update sent" -ForegroundColor Green
} catch {
    Write-Host "  Failed: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 3

# Test update 3 - Complete
$body3 = @{
    sessionId = $sessionId
    currentStep = 3
    completedSteps = @(1, 2)
    currentAction = "Setup complete!"
    toolStatus = @{
        chocolatey = @{ status = "success"; version = "2.2.2" }
        nodejs = @{ status = "success"; version = "20.10.0" }
    }
    errors = @()
    timestamp = (Get-Date -Format 'o')
    phase = "phase1"
    complete = $true
} | ConvertTo-Json -Depth 10

Write-Host "[3] Setup complete!" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "https://ai-consultant-toolkit.vercel.app/api/progress/$sessionId" `
        -Method POST -Body $body3 -ContentType "application/json" -TimeoutSec 10 | Out-Null
    Write-Host "  Success: Update sent" -ForegroundColor Green
} catch {
    Write-Host "  Failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Green
Write-Host "Dashboard should auto-redirect to results page..." -ForegroundColor Yellow
Write-Host ""
