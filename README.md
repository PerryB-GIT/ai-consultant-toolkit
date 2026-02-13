# AI Consultant Toolkit

Automated setup wizard for Perry's AI consultant configuration. Streamlines onboarding with an 11-step interactive flow.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 to see the ProgressBar demo
```

## Project Overview

This toolkit automates the setup process for Perry's AI consultant environment, including:
- Claude CLI and MCP servers
- AWS and Google Cloud tools
- Gmail, Calendar, and Drive integrations
- Voice assistant (Evie)
- Security credential scanners
- Development environment configuration

## Current Status

✅ **Phase 1 Complete**: Dashboard ProgressBar Component
- Reusable progress tracking component
- 11-step onboarding flow
- Support Forge purple branding
- Full documentation and examples

🔲 **Phase 2 Next**: Setup automation scripts (macOS + Windows)

## Components Built

### ProgressBar Component

Track multi-step onboarding progress with visual feedback.

```tsx
import ProgressBar from '@/components/ProgressBar';

<ProgressBar
  currentStep={3}
  completedSteps={[1, 2]}
/>
```

**Features**:
- Visual progress bar (0-100%)
- Step tracking (✓ completed, → current, ○ pending)
- Responsive design (mobile + desktop)
- Accessible (Radix UI)
- Smooth animations
- Customizable labels

**Documentation**:
- [Component API](./components/README.md)
- [Usage Examples](./components/USAGE.md)
- [Visual Reference](./docs/PROGRESSBAR_VISUAL_GUIDE.md)
- [Implementation Summary](./docs/COMPONENT_SUMMARY.md)

## Setup Steps (11 Total)

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

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: Radix UI
- **State Management**: React hooks
- **Build Tool**: Turbopack (Next.js)

## Project Structure

```
ai-consultant-toolkit/
├── app/                    # Next.js app directory
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/             # React components
│   ├── ProgressBar.tsx     # Main progress tracker
│   ├── ProgressBar.stories.tsx
│   ├── README.md
│   └── USAGE.md
├── docs/                   # Documentation
│   ├── PROJECT_PLAN.md
│   ├── PROGRESSBAR_VISUAL_GUIDE.md
│   └── COMPONENT_SUMMARY.md
├── scripts/                # Setup scripts (coming soon)
│   ├── setup-mac.sh        # macOS automation
│   └── setup-windows.ps1   # Windows automation
├── demo.html               # Standalone component demo
└── PROJECT_STATUS.md       # Current progress
```

## Development

### Install Dependencies
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
# Open http://localhost:3000
```

### Build for Production
```bash
npm run build
npm run start
```

### View Component Demo
```bash
# Option 1: Next.js dev server
npm run dev

# Option 2: Standalone HTML
# Open demo.html in browser
```

## Configuration

### Tailwind Colors (Support Forge Branded)

```typescript
// tailwind.config.ts
colors: {
  primary: {
    DEFAULT: "#6366f1",  // Purple
    dark: "#8B5CF6",     // Lighter purple
  },
  background: {
    DEFAULT: "#050508",  // Very dark
    card: "#0f0f14",     // Dark gray
  },
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern browsers

## Documentation

- **[Project Plan](./docs/PROJECT_PLAN.md)** - Original design and architecture
- **[Component API](./components/README.md)** - ProgressBar props and usage
- **[Usage Guide](./components/USAGE.md)** - Real-world integration examples
- **[Visual Reference](./docs/PROGRESSBAR_VISUAL_GUIDE.md)** - ASCII diagrams and states
- **[Implementation Summary](./docs/COMPONENT_SUMMARY.md)** - Technical details
- **[Project Status](./PROJECT_STATUS.md)** - Current progress and roadmap

## Roadmap

- [x] Project design and planning
- [x] Git repository setup
- [x] Next.js project initialization
- [x] ProgressBar component
- [ ] macOS setup script (setup-mac.sh)
- [ ] Windows setup script (setup-windows.ps1)
- [ ] Interactive CLI wizard
- [ ] Web dashboard
- [ ] Backend API routes
- [ ] Testing suite
- [ ] Deployment (Vercel)

## Contributing

This is a personal project for Perry Bailes (@PerryB-GIT). Not currently accepting contributions.

## License

ISC

## Author

Built by Claude Sonnet 4.5 for Perry Bailes
Repository: https://github.com/PerryB-GIT/ai-consultant-toolkit

---

**Status**: 🟢 Phase 1 Complete (ProgressBar Component)
**Next**: Build setup automation scripts
