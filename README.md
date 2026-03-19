# AI Setup Support Forge

Unified AI development environment setup platform with live progress tracking and intelligent validation. Streamlines setup from zero to production-ready in one seamless flow.

**Live Dashboard:** https://ai-consultant-toolkit.vercel.app

---

## 🎯 Project Overview

**AI Setup Support Forge** is a unified platform that automates the complete AI development environment setup process with live progress tracking. It provides a single-page experience that guides users from download to production-ready in one seamless flow.

### Key Features:

- **Unified Dashboard** - Single page tracks entire 11-step journey
- **Live Progress Tracking** - Real-time updates during installation
- **Persistent Sessions** - Resume setup across browser sessions
- **Intelligent Error Handling** - Auto-suggested fixes for common issues
- **Phase Management** - Seamless transition from Phase 1 to Phase 2

Perfect for:

- **New client onboarding** - Get clients up and running fast
- **Environment replication** - Clone your exact setup to new machines
- **Team standardization** - Ensure everyone has the same tools
- **Disaster recovery** - Quickly rebuild after system failures

### What It Installs:

**Core Tools:**
- Claude CLI and MCP servers
- Node.js (v20+) and Python (v3.10+)
- Git and GitHub CLI
- AWS and Google Cloud tools

**Platform-Specific:**
- **Windows:** Chocolatey, WSL2, Docker Desktop
- **macOS:** Homebrew, Docker Desktop

**Optional:**
- Gmail, Calendar, Drive integrations
- Voice assistant (Evie)
- Security credential scanners
- Development environment configuration

---

## 🚀 Quick Start

### For Users (Unified Setup):

1. **Visit the dashboard**: https://ai-consultant-toolkit.vercel.app
2. **Choose your OS**: Click Windows or macOS
3. **Run the downloaded script**: Script auto-downloads and guides you
4. **Watch live progress**: Dashboard updates in real-time
5. **Complete Phase 2**: Seamlessly transitions to configuration

The unified dashboard handles everything on one page - no manual file uploads needed!

### Legacy Method (Manual Upload):

**Windows:**
```powershell
# Download and run setup script
Set-ExecutionPolicy Bypass -Scope Process -Force
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-windows.ps1" -OutFile "setup.ps1"
.\setup.ps1
```

**macOS:**
```bash
# Download and run setup script
curl -o setup.sh https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/mac/setup-mac.sh
chmod +x setup.sh
./setup.sh
```

### For Developers (Local Testing):

```bash
# Clone the repository
git clone https://github.com/PerryB-GIT/ai-consultant-toolkit.git
cd ai-consultant-toolkit

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000

# Test with mock data
cp scripts/test-data/mock-success.json ~/setup-results.json
# Upload via dashboard at /results
```

---

## 📁 Project Structure

```
ai-consultant-toolkit/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── validate-output/      # Validation API endpoint
│   │       └── route.ts          # POST /api/validate-output
│   ├── results/                  # Results page
│   │   └── page.tsx              # File upload and validation UI
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage (ProgressBar demo)
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ProgressBar.tsx           # Main progress tracker
│   ├── FileUpload.tsx            # JSON file upload component
│   └── README.md                 # Component documentation
│
├── scripts/                      # Setup automation
│   ├── mac/
│   │   └── setup-mac.sh          # macOS installation script
│   ├── windows/
│   │   └── setup-windows.ps1     # Windows installation script
│   └── test-data/                # Mock test data
│       ├── mock-success.json     # All tools installed
│       ├── mock-partial.json     # Some tools missing
│       ├── mock-failure.json     # Critical errors
│       └── README.md             # Test data guide
│
├── docs/                         # Documentation
│   ├── PROJECT_PLAN.md           # Original design
│   ├── PROGRESSBAR_VISUAL_GUIDE.md
│   └── COMPONENT_SUMMARY.md
│
├── TESTING-GUIDE.md              # Complete testing guide
├── DEPLOYMENT.md                 # Vercel deployment guide
├── LAPTOP-TEST-SETUP-GUIDE.md    # Laptop testing instructions
├── README.md                     # This file
└── package.json                  # Dependencies and scripts
```

---

## 🏗️ Architecture

### Flow Diagram (Text-Based):

```
┌──────────────────────────────────────────────────────────────┐
│                    User Downloads Script                      │
│     (setup-windows.ps1 or setup-mac.sh from GitHub)          │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          v
┌──────────────────────────────────────────────────────────────┐
│                   Script Executes Locally                     │
│   • Detects OS and architecture                              │
│   • Installs package manager (Chocolatey/Homebrew)           │
│   • Checks for existing tools                                │
│   • Installs missing tools (Git, Node, Python, Claude CLI)   │
│   • Logs all results and errors                              │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          v
┌──────────────────────────────────────────────────────────────┐
│               Generates setup-results.json                    │
│   {                                                           │
│     "os": "Windows 11 Pro",                                   │
│     "results": { ... },                                       │
│     "errors": [ ... ],                                        │
│     "duration_seconds": 145.32                                │
│   }                                                           │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          v
┌──────────────────────────────────────────────────────────────┐
│              User Uploads to Dashboard                        │
│     (https://ai-consultant-toolkit.vercel.app/results)       │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          v
┌──────────────────────────────────────────────────────────────┐
│           Validation API (POST /api/validate-output)          │
│   • Validates JSON schema (Zod)                              │
│   • Checks tool versions against requirements                │
│   • Counts successes/errors/skipped                          │
│   • Generates troubleshooting hints                          │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          v
┌──────────────────────────────────────────────────────────────┐
│                 Display Validation Results                    │
│   ✅ Valid: true                                              │
│   📊 Summary: "8/8 tools installed successfully"             │
│   💡 Recommendations: "Proceed to CLI authentication"        │
│   📋 Tool Status Table                                        │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow:

1. **Setup Script** → Installs tools → Generates JSON
2. **User** → Uploads JSON → Dashboard
3. **Dashboard** → Sends JSON → Validation API
4. **Validation API** → Validates → Returns results
5. **Dashboard** → Displays → Results and recommendations

---

## 🧪 Testing

### Quick 5-Minute Test (No Script Execution):

```bash
# Use mock data to test dashboard and API
cd ai-consultant-toolkit
cp scripts/test-data/mock-success.json ~/setup-results.json

# Visit: https://ai-consultant-toolkit.vercel.app/results
# Upload: mock-success.json
# Verify: Validation passes
```

### Full Test (Run Actual Scripts):

See [TESTING-GUIDE.md](./TESTING-GUIDE.md) for complete testing instructions:
- Windows script testing
- macOS script testing
- Expected outputs at each step
- Troubleshooting common issues
- Success criteria checklist

### Laptop Testing:

See [LAPTOP-TEST-SETUP-GUIDE.md](./LAPTOP-TEST-SETUP-GUIDE.md) for instructions on:
- Testing on a clean Windows laptop
- Mirroring your current Claude Code setup
- Remote testing via SSH
- Backup and restore procedures

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [TESTING-GUIDE.md](./TESTING-GUIDE.md) | Complete testing guide with mock data |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Vercel deployment and rollback procedures |
| [LAPTOP-TEST-SETUP-GUIDE.md](./LAPTOP-TEST-SETUP-GUIDE.md) | Laptop testing instructions |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Current progress and roadmap |
| [COMPONENT_SHOWCASE.md](./COMPONENT_SHOWCASE.md) | UI component documentation |
| [scripts/test-data/README.md](./scripts/test-data/README.md) | Mock data usage guide |
| [components/README.md](./components/README.md) | Component API reference |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **UI Components:** Radix UI
- **Validation:** Zod
- **Deployment:** Vercel
- **Version Control:** Git/GitHub

---

## 🔄 Development Workflow

### Local Development:

```bash
# Install dependencies
npm install

# Run dev server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Testing Locally:

```bash
# Test validation API
curl -X POST http://localhost:3000/api/validate-output \
  -H "Content-Type: application/json" \
  -d @scripts/test-data/mock-success.json

# Test with all scenarios
for file in scripts/test-data/mock-*.json; do
  echo "Testing: $file"
  curl -X POST http://localhost:3000/api/validate-output \
    -H "Content-Type: application/json" \
    -d @$file | jq .
done
```

### Deployment:

```bash
# Auto-deploy (recommended)
git add .
git commit -m "feat: Your feature"
git push origin main
# Vercel auto-deploys on push to main

# Manual deploy
vercel --prod
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

---

## ✅ Features

### ✅ Completed:

- [x] Next.js project setup
- [x] ProgressBar component with 11-step tracking
- [x] macOS setup script (setup-mac.sh)
- [x] Windows setup script (setup-windows.ps1)
- [x] Validation API endpoint (POST /api/validate-output)
- [x] File upload UI (FileUpload.tsx)
- [x] Results page with validation display
- [x] Vercel deployment
- [x] Mock test data (3 scenarios)
- [x] Complete testing documentation
- [x] Deployment documentation

### 🔲 Upcoming:

- [ ] Interactive CLI wizard
- [ ] Real-time progress tracking during setup
- [ ] Email notification on completion
- [ ] Dashboard analytics (installations by OS, common errors)
- [ ] Automated testing suite
- [ ] Video tutorial
- [ ] Client testimonials

---

## 📊 Setup Steps (11 Total)

The onboarding process is divided into 11 steps:

1. **Prerequisites** - Check Node.js, npm, git
2. **OS Detection** - Detect macOS vs Windows
3. **Installing Tools** - Install CLI tools (gh, aws, gcloud)
4. **CLI Authentication** - Authenticate with services
5. **Security Setup** - Install credential scanners
6. **MCP Configuration** - Set up MCP servers
7. **Google Services** - OAuth for Gmail, Calendar, Drive
8. **Voice Assistant** - Install Evie voice system
9. **Testing Setup** - Run smoke tests
10. **Documentation** - Generate setup report
11. **Complete** - Finish and redirect to dashboard

---

## 🎨 Branding

**Colors (Support Forge Theme):**
- Primary: `#6366f1` (Purple)
- Primary Dark: `#8B5CF6` (Lighter purple)
- Background: `#050508` (Very dark)
- Background Card: `#0f0f14` (Dark gray)

---

## 🧑‍💻 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern browsers

---

## 🤝 Contributing

This is a personal project for Perry Bailes (@PerryB-GIT). Not currently accepting external contributions.

### Internal Development:

```bash
# Create feature branch
git checkout -b feature/name

# Make changes and test
npm run dev

# Commit with conventional commits
git commit -m "feat: Description"
git commit -m "fix: Bug description"
git commit -m "docs: Documentation update"

# Push and create PR
git push origin feature/name
gh pr create
```

---

## 📝 License

ISC

---

## 👤 Author

**Perry Bailes** (@PerryB-GIT)

Built with Claude Sonnet 4.5

- GitHub: https://github.com/PerryB-GIT
- Website: https://support-forge.com
- Email: perry@support-forge.com

---

## 🔗 Links

- **Live Dashboard:** https://ai-consultant-toolkit.vercel.app
- **GitHub Repository:** https://github.com/PerryB-GIT/ai-consultant-toolkit
- **Vercel Dashboard:** https://vercel.com/perryb-git/ai-consultant-toolkit
- **Mac Script:** [scripts/mac/setup-mac.sh](./scripts/mac/setup-mac.sh)
- **Windows Script:** [scripts/windows/setup-windows.ps1](./scripts/windows/setup-windows.ps1)

---

## 🎯 Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run lint         # Lint code

# Deployment
vercel --prod        # Deploy to production
vercel               # Deploy to preview
vercel ls            # List deployments

# Git
git status           # Check status
git add .            # Stage all changes
git commit -m "..."  # Commit with message
git push             # Push to GitHub
```

---

**Status:** 🟢 Active Development

**Current Phase:** Testing and Documentation

**Next Milestone:** Production-ready for client onboarding

---

For detailed testing instructions, see [TESTING-GUIDE.md](./TESTING-GUIDE.md)

For deployment procedures, see [DEPLOYMENT.md](./DEPLOYMENT.md)

For laptop testing, see [LAPTOP-TEST-SETUP-GUIDE.md](./LAPTOP-TEST-SETUP-GUIDE.md)
