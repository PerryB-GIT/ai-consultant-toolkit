@echo off
REM Build script for Support Forge Windows Installer
REM Requires: NSIS installed (makensis in PATH)
REM Run from: installers\windows\

echo ============================================
echo  Support Forge AI Setup - Windows Builder
echo ============================================
echo.

REM Check for makensis
where makensis >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: makensis not found in PATH.
    echo Install NSIS from: https://nsis.sourceforge.io/Download
    echo Then re-run this script.
    pause
    exit /b 1
)

REM Check for required plugin: inetc (internet download plugin)
REM inetc must be installed to NSIS Plugins folder
if not exist "%ProgramFiles(x86)%\NSIS\Plugins\x86-unicode\INetC.dll" (
    echo WARNING: INetC plugin not found.
    echo Download from: https://nsis.sourceforge.io/Inetc_plug-in
    echo Extract INetC.dll to: %ProgramFiles%\NSIS\Plugins\x86-unicode\
    echo.
    echo Press any key to continue anyway (build may fail)...
    pause >nul
)

REM Generate version tag from date
for /f "tokens=1-3 delims=/" %%a in ("%DATE%") do (
    set BUILDDATE=%%c%%a%%b
)

echo Building SupportForge-AI-Setup.exe ...
echo.

makensis /V3 /DOUTFILE="SupportForge-AI-Setup.exe" SupportForge-AI-Setup.nsi

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo  BUILD SUCCESSFUL
    echo  Output: installers\windows\SupportForge-AI-Setup.exe
    echo ============================================
    echo.
    echo File size:
    for %%F in (SupportForge-AI-Setup.exe) do echo   %%~zF bytes
) else (
    echo.
    echo BUILD FAILED - check errors above
    exit /b 1
)
pause
