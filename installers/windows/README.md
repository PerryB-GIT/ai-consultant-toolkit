# Windows Installer Build

## Prerequisites

1. Install NSIS: https://nsis.sourceforge.io/Download
2. Install inetc plugin (for downloading scripts):
   - Download from: https://nsis.sourceforge.io/Inetc_plug-in
   - Extract `INetC.dll` to `C:\Program Files (x86)\NSIS\Plugins\x86-unicode\`

## Build

```bat
cd installers\windows
build.bat
```

Output: `installers\windows\SupportForge-AI-Setup.exe`

## What the installer does

1. Shows a branded welcome screen
2. Generates a unique session ID
3. Opens the live dashboard in the browser (`https://ai-consultant-toolkit.vercel.app/setup?session=<id>`)
4. Downloads `setup-windows.ps1` from GitHub
5. Runs it as Administrator with the session ID
6. Shows a finish screen with next steps

## Delivery

- Upload `SupportForge-AI-Setup.exe` to GitHub Releases or a file host
- Send the direct download link to the client
- They double-click, click Next → Install, done

## Do NOT commit

- `SupportForge-AI-Setup.exe` (built binary — add to .gitignore)
