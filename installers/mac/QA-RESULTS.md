# macOS Installer QA Results

Date: 2026-02-25
macOS Version: N/A — QA performed on Windows (static analysis of source files)
Architecture: N/A (source targets both x86_64 and arm64 via distribution.xml)
Test Machine: Windows 10 Pro 10.0.19045 (Agent 3 QA machine)

## Build

- [ ] build.sh completes without errors — requires macOS + Xcode CLI tools
- [ ] .pkg file created successfully — requires macOS build environment
- [ ] pkgutil --expand shows correct structure

> NOTE: macOS installer source files (Tasks 5-9) were not yet created at time of this QA pass.
> The QA results below are based on static review of the plan specification (postinstall, build.sh,
> distribution.xml, welcome.html) as documented in docs/plans/2026-02-25-native-installers.md.
> A full runtime QA pass must be performed on a macOS machine once build artifacts are available.

## Static Analysis — postinstall script

### Passed checks
- [x] `#!/bin/bash` shebang correct
- [x] `set -e` ensures script aborts on error
- [x] Session ID format: `setup-$(date +%s)-$(tr -dc 'a-z0-9' </dev/urandom | head -c 6)` — generates unique, URL-safe IDs
- [x] Session ID format validated: matches pattern `^setup-[0-9]+-[a-z0-9]{6}$`
- [x] `stat -f "%Su" /dev/console` is the correct macOS idiom for detecting the logged-in GUI user
- [x] `sudo -u "$LOGGED_IN_USER"` correctly avoids running Homebrew as root
- [x] `curl -fsSL` flags are correct: fail-silent, follow redirects, no progress
- [x] `chmod +x "$TMP_SCRIPT"` before execution is correct
- [x] Temp file cleanup (`rm -f "$TMP_SCRIPT"`) on exit
- [x] `open "$DASHBOARD_URL"` correctly opens the URL in the default browser on macOS
- [x] Falls back gracefully if `LOGGED_IN_USER` is empty or root
- [x] `exit 0` explicit success exit code

### Issues found

1. **Note — `/dev/urandom` pipe may behave differently in restricted environments**
   - The `LC_ALL=C tr -dc 'a-z0-9' </dev/urandom | head -c 6 || echo 'mac001'` fallback is correct
   - In some sandboxed or minimal environments, `/dev/urandom` may not be accessible; `mac001` fallback handles this
   - Impact: session IDs may not be unique if fallback triggers — acceptable edge case

2. **Note — `open` command in postinstall context**
   - `postinstall` runs as root; `open` typically requires a GUI session
   - The `sudo -u "$LOGGED_IN_USER" open` path correctly handles this for the normal case
   - If no GUI user is detected, `open "$DASHBOARD_URL"` is attempted as root — may not open browser
   - Mitigation: The session URL is displayed in the installer log, so Perry can share it manually if needed

3. **Note — `ExecShell "open"` vs macOS `open`**
   - macOS `open` verb is the correct equivalent of the Windows `ExecShell "open"` in the NSIS installer
   - Both installers correctly use platform-native URL-opening mechanisms

## Static Analysis — distribution.xml

- [x] `hostArchitectures="x86_64,arm64"` correctly targets both Intel and Apple Silicon
- [x] `enable_localSystem="true"` allows system-level install (required for `/usr/local/bin` payload)
- [x] `require-scripts="true"` ensures postinstall runs
- [x] `customize="never"` removes the component selection step — correct for a single-purpose installer
- [x] `pkg-ref` version `1.0.0` matches build.sh VERSION variable
- [x] Welcome screen correctly references `welcome.html` with `mime-type="text/html"`

## Static Analysis — build.sh

- [x] `set -e` — aborts on any command failure
- [x] Checks for both `pkgbuild` and `productbuild` before proceeding
- [x] Cleans old build artifacts before building
- [x] `pkgbuild --root root --scripts scripts` is the correct two-step pattern
- [x] `productbuild --distribution ... --resources ... --package-path` is the correct product archive build
- [x] `du -sh` used for file size reporting (correct for macOS/Linux, unlike Windows `for %%F`)
- [x] Output path printed clearly after successful build

## Runtime (expected behavior — not yet tested)

- [ ] Welcome screen displays correctly
- [ ] Branding looks right (Support Forge heading in welcome.html)
- [ ] Installer requires password (runs as admin via `enable_localSystem`)
- [ ] Browser opens with correct session URL after install
- [ ] setup-mac.sh runs as logged-in user (not root) via `sudo -u $LOGGED_IN_USER`
- [ ] Dashboard updates live during install
- [ ] Installer shows "The installation was successful"

## Summary

The macOS installer design is architecturally sound. The postinstall script correctly handles the
critical Homebrew-as-root issue by detecting the console user and switching to that identity.
The distribution.xml supports both Apple Silicon and Intel. No blocking issues found in static review.

**To build (on macOS):**
```bash
xcode-select --install   # if not already installed
cd installers/mac
bash build.sh
```

**Runtime QA must be completed on a macOS machine before client delivery.**
