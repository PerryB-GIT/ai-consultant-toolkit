# Quick test script to verify session ID handling
# This script simulates the session ID logic without running the full setup

param(
    [string]$SessionId = $null
)

Write-Host ''
Write-Host '===== Session ID Test =====' -ForegroundColor Cyan
Write-Host ''

# Test the session ID logic
if ([string]::IsNullOrWhiteSpace($SessionId)) {
    $script:sessionId = [guid]::NewGuid().ToString()
    Write-Host "Generated new session ID: $script:sessionId" -ForegroundColor Green
} else {
    $script:sessionId = $SessionId
    Write-Host "Using provided session ID: $script:sessionId" -ForegroundColor Green
}

# Test the API URL construction
$apiUrl = "https://ai-consultant-toolkit.vercel.app/api/progress/$script:sessionId"
Write-Host ''
Write-Host 'API URL would be:' -ForegroundColor Yellow
Write-Host "  $apiUrl" -ForegroundColor Cyan

# Test dashboard URL display
Write-Host ''
Write-Host '==================================================' -ForegroundColor Cyan
Write-Host '  Watch Live Progress:' -ForegroundColor Green
Write-Host '  https://ai-consultant-toolkit.vercel.app/setup' -ForegroundColor Yellow
Write-Host '==================================================' -ForegroundColor Cyan

# Simulate a progress update
Write-Host ''
Write-Host 'Simulating progress update...' -ForegroundColor Yellow

$body = @{
    sessionId = $script:sessionId
    currentStep = 1
    completedSteps = @()
    currentAction = 'Test action'
    toolStatus = @{
        test_tool = @{ status = 'installing'; version = $null }
    }
    errors = @()
    timestamp = (Get-Date -Format 'o')
    phase = 'phase1'
    complete = $false
} | ConvertTo-Json -Depth 10

Write-Host 'Body payload:' -ForegroundColor Gray
Write-Host $body -ForegroundColor Gray

Write-Host ''
Write-Host 'Test completed successfully!' -ForegroundColor Green
Write-Host "  Session ID is properly set to: $script:sessionId" -ForegroundColor Cyan
Write-Host ''
Write-Host '===========================' -ForegroundColor Cyan
Write-Host ''
