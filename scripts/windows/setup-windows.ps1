<#
.SYNOPSIS
    AI Consultant Toolkit - Windows Setup Script
#>
#Requires -RunAsAdministrator
param([switch]$SkipDocker = $false)
$ErrorActionPreference = 'Continue'
$startTime = Get-Date
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
$osInfo = Get-CimInstance Win32_OperatingSystem
$results.os = "$($osInfo.Caption) $($osInfo.Version)"
Write-Host '================================================================' -ForegroundColor Cyan
Write-Host '   AI Consultant Toolkit - Windows Setup' -ForegroundColor Cyan
Write-Host '================================================================' -ForegroundColor Cyan
function Write-Step { param([string]$Message); Write-Host "`n> $Message" -ForegroundColor Yellow }
function Write-Success { param([string]$Message); Write-Host "  [OK] $Message" -ForegroundColor Green }
function Write-Info { param([string]$Message); Write-Host "  [INFO] $Message" -ForegroundColor Cyan }
function Write-Failure { param([string]$Message); Write-Host "  [FAIL] $Message" -ForegroundColor Red }
function Add-Error { param([string]$Tool, [string]$Message); $results.errors += @{ tool = $Tool; message = $Message } }
function Get-InstalledVersion { param([string]$Command, [string]$VersionArg = '--version'); try { $v = & $Command $VersionArg 2>&1 | Select-Object -First 1; if ($v -match '(\d+\.\d+\.\d+)') { return $matches[1] }; return $v.ToString().Trim() } catch { return $null } }
function Refresh-EnvironmentPath { $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User') }
Write-Host 'Script created with core functions. See README for full implementation.' -ForegroundColor Yellow
return $results
