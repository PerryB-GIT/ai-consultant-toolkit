# Electron Cross-Platform Installer

Builds a branded wizard installer for Windows (.exe) and macOS (.dmg).

## Prerequisites

- Node.js 18+
- npm

## Setup

cd installers/electron
npm install

## Run in dev mode

npm start

## Build

# Windows (.exe) — buildable on Windows or macOS
npm run build:win

# macOS (.dmg) — requires macOS
npm run build:mac

# Both
npm run build:all

Output files in dist/.

## What it does

1. Welcome screen — shows tool list, "Start Installation" button
2. Generates a unique session ID
3. Opens live dashboard: https://ai-consultant-toolkit.vercel.app/setup?session=<id>
4. Downloads platform setup script from GitHub
5. Runs the script, streams output to the log window
6. Shows Finish screen with next steps

## Icons

Replace assets/icon.png (512x512), assets/icon.ico, and assets/icon.icns with real branded icons before production build.

Use electron-icon-builder to generate .ico and .icns from a PNG:
npx electron-icon-builder --input=assets/icon.png --output=assets/

## Do NOT commit

- node_modules/
- dist/

Both are in .gitignore.
