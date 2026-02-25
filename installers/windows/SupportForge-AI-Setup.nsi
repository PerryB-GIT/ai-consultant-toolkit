; Support Forge AI Setup - Windows Installer
; Built with NSIS (https://nsis.sourceforge.io)
; Wraps setup-windows.ps1 with a GUI and live dashboard integration

!define PRODUCT_NAME "Support Forge AI Setup"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "Support Forge LLC"
!define PRODUCT_URL "https://support-forge.com"
!define SETUP_SCRIPT_URL "https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-windows.ps1"
!define DASHBOARD_URL "https://ai-consultant-toolkit.vercel.app/setup"

; Modern UI
!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

Name "${PRODUCT_NAME}"
OutFile "SupportForge-AI-Setup.exe"
InstallDir "$TEMP\SupportForgeSetup"
RequestExecutionLevel admin
ShowInstDetails show

; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "assets\header.bmp"
!define MUI_HEADERIMAGE_RIGHT
!define MUI_WELCOMEPAGE_TITLE "Welcome to Support Forge AI Setup"
!define MUI_WELCOMEPAGE_TEXT "This installer will set up Claude Code and all required tools on your computer.$\r$\n$\r$\nWhat will be installed:$\r$\n  - Chocolatey (package manager)$\r$\n  - Git & GitHub CLI$\r$\n  - Node.js$\r$\n  - Claude Code (AI assistant)$\r$\n  - 38 pre-built AI skills$\r$\n$\r$\nA browser window will open so you can watch the installation progress live."
!define MUI_FINISHPAGE_TITLE "Installation Started!"
!define MUI_FINISHPAGE_TEXT "The installation script is running in the background.$\r$\n$\r$\nNext steps:$\r$\n  1. Watch the live dashboard in your browser$\r$\n  2. When complete, open a new terminal and type: claude$\r$\n  3. Enter your Anthropic API key when prompted$\r$\n$\r$\nIf you have any issues, contact: support@support-forge.com"
!define MUI_FINISHPAGE_LINK "Visit Support Forge"
!define MUI_FINISHPAGE_LINK_LOCATION "${PRODUCT_URL}"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Language
!insertmacro MUI_LANGUAGE "English"

; Version info embedded in .exe
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "${PRODUCT_NAME}"
VIAddVersionKey "CompanyName" "${PRODUCT_PUBLISHER}"
VIAddVersionKey "LegalCopyright" "© 2026 ${PRODUCT_PUBLISHER}"
VIAddVersionKey "FileDescription" "${PRODUCT_NAME} Installer"
VIAddVersionKey "FileVersion" "${PRODUCT_VERSION}"

Section "Install" SecInstall

    ; Generate session ID from timestamp + random
    ; Format: setup-<timestamp>-<random6>
    System::Call 'kernel32::GetTickCount()i.r0'
    StrCpy $1 $0 6  ; last 6 chars of tick count as "random"
    System::Call 'kernel32::GetSystemTime(i) v'
    ; Use GUID for reliable uniqueness
    System::Call 'ole32::CoCreateGuid(g .r2)'
    ; Strip braces and dashes, take first 12 chars
    StrCpy $3 $2 12 1
    StrCpy $R0 "setup-$3"  ; e.g., setup-550E8400E29B

    ; Store session ID
    Var /GLOBAL SESSION_ID
    StrCpy $SESSION_ID $R0

    ; Open dashboard in browser with session ID
    ExecShell "open" "${DASHBOARD_URL}?session=$SESSION_ID"

    ; Download the PowerShell setup script
    SetOutPath "$TEMP\SupportForgeSetup"
    DetailPrint "Downloading setup script..."
    inetc::get /CAPTION "Downloading..." /BANNER "Getting setup script from Support Forge..." \
        "${SETUP_SCRIPT_URL}" "$TEMP\SupportForgeSetup\setup-windows.ps1" /END
    Pop $R1
    ${If} $R1 != "OK"
        MessageBox MB_OK|MB_ICONEXCLAMATION "Failed to download setup script. Please check your internet connection.$\r$\nError: $R1"
        Abort
    ${EndIf}

    ; Run the script as admin with session ID
    DetailPrint "Starting installation (Session: $SESSION_ID)..."
    DetailPrint "Watch progress at: ${DASHBOARD_URL}?session=$SESSION_ID"
    ExecWait 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$TEMP\SupportForgeSetup\setup-windows.ps1" -SessionId "$SESSION_ID"' $R2

    ${If} $R2 != 0
        DetailPrint "Setup script exited with code: $R2 (some tools may need manual steps)"
    ${Else}
        DetailPrint "Setup completed successfully!"
    ${EndIf}

SectionEnd
