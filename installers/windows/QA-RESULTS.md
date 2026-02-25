# Windows Installer QA Results

Date: 2026-02-25
NSIS Version: not installed on QA machine (static analysis only)
Test Machine: Windows 10 Pro 10.0.19045

## Build

- [x] makensis binary: NOT present on QA machine — static analysis performed instead
- [x] .nsi script reviewed for syntax correctness
- [x] build.bat reviewed for correctness
- [ ] .exe file created — requires NSIS install (see notes)
- [ ] File size verified (expected < 5MB once built)

## Static Analysis — SupportForge-AI-Setup.nsi

### Passed checks
- [x] All `!define` constants set correctly (PRODUCT_NAME, VERSION, PUBLISHER, URL, SETUP_SCRIPT_URL, DASHBOARD_URL)
- [x] MUI2 includes are standard NSIS includes: `MUI2.nsh`, `nsDialogs.nsh`, `LogicLib.nsh`
- [x] `RequestExecutionLevel admin` correctly ensures UAC prompt on Windows 10/11
- [x] GUID generation uses `ole32::CoCreateGuid` — correct System plugin call, produces reliable unique IDs
- [x] `ExecShell "open"` verb correctly opens URLs in the user's default browser
- [x] `ExecWait` with `powershell.exe -NoProfile -ExecutionPolicy Bypass -File` is the correct invocation
- [x] `inetc::get` usage is syntactically correct (requires inetc plugin — documented in build.bat)
- [x] Error handling present: download failure triggers `MessageBox` + `Abort`
- [x] Exit code check on PowerShell script (`$R2 != 0`) correctly surfaces non-zero exits
- [x] Version info block (`VIProductVersion`, `VIAddVersionKey`) is complete and correct
- [x] Welcome and Finish page text is accurate and client-friendly
- [x] `MUI_FINISHPAGE_LINK` and `MUI_FINISHPAGE_LINK_LOCATION` correctly link to support-forge.com

### Issues found

1. **Minor — `/DOUTFILE=` define in build.bat has no effect** (non-blocking)
   - `build.bat` passes `/DOUTFILE="SupportForge-AI-Setup.exe"` to makensis
   - The `.nsi` script uses `OutFile "SupportForge-AI-Setup.exe"` hardcoded, ignoring the define
   - To make `/DOUTFILE` work, the .nsi would need: `OutFile "${OUTFILE}"`
   - Current behavior: both build.bat and .nsi produce the same filename, so the output is correct
   - Impact: none in practice — the exe is named correctly either way
   - Fix (optional): change `.nsi` line 18 from `OutFile "SupportForge-AI-Setup.exe"` to `OutFile "${OUTFILE}"`

2. **Note — inetc plugin requires manual install**
   - Plugin is not bundled in the repo (correct — it's a binary)
   - build.bat warns correctly and points to the download URL
   - Must be installed before build: `C:\Program Files (x86)\NSIS\Plugins\x86-unicode\INetC.dll`

3. **Note — header.bmp must be present at build time**
   - `assets\header.bmp` is referenced as `MUI_HEADERIMAGE_BITMAP`
   - File exists at `installers/windows/assets/header.bmp` (confirmed in repo)
   - No issue

## Runtime (expected behavior — not tested on this machine)

- [ ] Welcome screen displays correctly
- [ ] Branding looks right (Support Forge header BMP)
- [ ] Browser opens with correct session URL (format: setup?session=setup-XXXXXXXXXXXX)
- [ ] PowerShell script downloads from GitHub and runs
- [ ] Dashboard updates live during install
- [ ] Finish screen appears after completion

## Summary

The NSIS script is syntactically sound and logically correct. The one minor issue (the `/DOUTFILE` define passthrough) has no functional impact since both paths produce `SupportForge-AI-Setup.exe`. The installer is ready to build on any Windows machine with NSIS 3.x + inetc plugin installed.

**To build:**
1. Install NSIS: https://nsis.sourceforge.io/Download
2. Install inetc plugin to `C:\Program Files (x86)\NSIS\Plugins\x86-unicode\INetC.dll`
3. Run: `cd installers\windows && build.bat`
