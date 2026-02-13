# AI Consultant Toolkit - Master Project Plan

**Project Start:** February 13, 2026
**Project Owner:** Perry Bailes (Support Forge)
**Project Goal:** Compress client onboarding from manual/painful → 60 minutes automated setup
**Success Metric:** 5x client capacity increase, 80% reduction in onboarding support time

---

## Executive Summary

The AI Consultant Toolkit is a web-based onboarding system that automates the complex setup process for AI consulting clients. It guides clients through installing Claude Code, configuring cloud services (AWS, GCP), setting up MCP servers, and building their first custom AI employee - all in under 60 minutes.

**Business Impact:**
- Phase 1: Internal tool for Support Forge client onboarding (immediate)
- Phase 2: Productized service - licensed to other AI consultants (6 months)
- Phase 3: Standalone SaaS product with self-serve option (12 months)

**Key Innovation:**
- Hybrid automation: Web dashboard + platform-specific scripts + Playwright browser automation
- Security-first: Encrypted credential management taught from day 1
- Personalization: Clients build custom AI employees, not generic assistants
- Education-integrated: Prompting training embedded in the setup flow

---

## Project Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Web Dashboard (setup.support-forge.com)           │    │
│  │  - Progress tracking                                │    │
│  │  - Command generation                               │    │
│  │  - JSON validation                                  │    │
│  │  - Playwright automation triggers                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               Next.js Backend (Vercel/GCP)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  API Routes:                                        │    │
│  │  - /api/validate-output                            │    │
│  │  - /api/generate-script                            │    │
│  │  - /api/generate-pdf                               │    │
│  │  - /api/save-progress                              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Client Local Machine                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Platform Scripts:                                  │    │
│  │  - setup-mac.sh (Homebrew, Node, Python, Docker)   │    │
│  │  - setup-windows.ps1 (Chocolatey, WSL, tools)      │    │
│  │  - Output: setup-results.json                      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Playwright Automation:                             │    │
│  │  - Google Cloud OAuth consent screen               │    │
│  │  - Credential download guidance                     │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Installed Components:                              │    │
│  │  - Claude Code CLI                                  │    │
│  │  - AWS/GCP/Azure CLIs                              │    │
│  │  - MCP servers (~/mcp-servers/)                    │    │
│  │  - Custom EA skill (~/.claude/skills/)             │    │
│  │  - Credentials (~/.credentials/)                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack Decisions

### Frontend Dashboard
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (Support Forge purple/black theme)
- **Components:** Radix UI + shadcn/ui
- **State:** React Context + localStorage (no DB for v1)
- **Deployment:** Vercel (subdomain: setup.support-forge.com)

**Rationale:** Fast development, excellent DX, serverless hosting, easy integration with existing Support Forge infrastructure.

### Backend
- **API:** Next.js API routes (serverless functions)
- **Validation:** Zod schemas for JSON parsing
- **PDF Generation:** ReportLab (Python) via serverless function
- **Session:** URL-based session tokens (no auth for v1)

**Rationale:** Serverless = zero infrastructure management, Python for PDF avoids font corruption issues on Windows.

### Platform Scripts
- **Mac:** Bash scripts using Homebrew package manager
- **Windows:** PowerShell scripts using Chocolatey/Winget
- **Output Format:** JSON (standardized validation)

**Rationale:** Native package managers = reliable installs, JSON = easy parsing.

### Browser Automation
- **Tool:** Playwright (installed client-side if needed)
- **Mode:** Visual guide overlay (not full automation)
- **Trigger:** Dashboard button opens new window with guidance

**Rationale:** Playwright = cross-browser support, visual guides = less brittle than full automation.

### Documentation
- **Location:** `docs/plans/` (accessible across worktrees)
- **Format:** Markdown (version controlled)
- **Memory:** Serena MCP for cross-session persistence

---

## Development Phases

### Phase 1: MVP - Dashboard + Scripts (Week 1-2)

**Goal:** Working prototype that can onboard 1 test client end-to-end

**Components:**
1. Web dashboard with static flow
2. Mac + Windows install scripts
3. JSON validation API
4. Basic progress tracking

**Deliverables:**
- `setup.support-forge.com` live (can be basic)
- `setup-mac.sh` and `setup-windows.ps1` working
- Validation API can parse script outputs
- Manual testing with 1 client (Perry or team member)

**Success Criteria:**
- Client can complete setup without Perry's help
- Time: Under 90 minutes (MVP target)

---

### Phase 2: Automation + PDF (Week 3-4)

**Goal:** Add Google Cloud automation, MCP setup, PDF generation

**Components:**
1. Playwright integration for GCP OAuth
2. MCP server bundle + setup scripts
3. PDF report generation (ReportLab)
4. EA agent customization form

**Deliverables:**
- GCP setup 50% automated (gcloud CLI + visual guide)
- MCP bundle downloadable + auto-setup script
- Personalized PDF report generated
- Custom EA skill creator working

**Success Criteria:**
- Google Cloud setup time: 20 minutes → 8 minutes
- MCP setup: 15 minutes → 5 minutes
- Client gets branded PDF summary
- Client has working custom EA agent

---

### Phase 3: Training + Polish (Week 5-6)

**Goal:** Add prompting training, skills education, UI polish

**Components:**
1. Interactive prompting tutorial (5 principles)
2. Skills marketplace integration
3. Practice exercises with validation
4. UI/UX refinement (animations, error states)

**Deliverables:**
- Prompting training module live
- Skills deep-dive section complete
- Interactive practice exercises
- Professional UI matching Support Forge brand

**Success Criteria:**
- Clients understand how to use skills effectively
- Setup time: Under 60 minutes consistently
- Client satisfaction: 8/10+ (survey)

---

### Phase 4: Production + Metrics (Week 7-8)

**Goal:** Production hardening, analytics, real client rollout

**Components:**
1. Error tracking (Sentry)
2. Analytics (Plausible or Fathom)
3. Session recovery (resume from any step)
4. Support integration (WhatsApp/email triggers)

**Deliverables:**
- Error monitoring live
- Usage analytics dashboard
- Session persistence working
- 5 real clients onboarded successfully

**Success Criteria:**
- Zero critical bugs in production
- Average completion time: 55 minutes
- 90% completion rate (clients finish setup)
- Support tickets: 80% reduction vs manual onboarding

---

## Parallel Development Streams

### Stream A: Frontend Dashboard (UI/UX Focus)
**Owner:** Frontend subagent
**Duration:** 2 weeks

**Tasks:**
1. Setup Next.js project with Tailwind
2. Create component library (ProgressBar, CommandBlock, FileUpload)
3. Build step-by-step flow UI (11 steps)
4. Add platform detection (Mac/Windows)
5. Implement localStorage state management
6. Create mobile-responsive views

**Deliverables:**
- Functional dashboard UI
- Component storybook (optional)
- Responsive design tested

---

### Stream B: Platform Scripts (DevOps Focus)
**Owner:** Backend/DevOps subagent
**Duration:** 1.5 weeks

**Tasks:**
1. Write `setup-mac.sh` (Homebrew, Node, Python, Docker, Claude Code)
2. Write `setup-windows.ps1` (Chocolatey, WSL, tools)
3. Add detection logic (skip if already installed)
4. Implement JSON output format
5. Test on clean Mac/Windows VMs
6. Handle edge cases (version conflicts, PATH issues)

**Deliverables:**
- Working Mac script (tested on Intel + M-series)
- Working Windows script (tested on Win 10/11)
- JSON schema documentation

---

### Stream C: Backend APIs (Validation Logic)
**Owner:** Backend subagent
**Duration:** 1 week

**Tasks:**
1. Setup Next.js API routes
2. Create Zod schemas for validation
3. Build `/api/validate-output` endpoint
4. Build `/api/generate-script` (dynamic script generation)
5. Build `/api/generate-pdf` (ReportLab integration)
6. Add error handling + logging

**Deliverables:**
- API endpoints functional
- Validation logic tested
- PDF generation working

---

### Stream D: Playwright Automation (Browser Focus)
**Owner:** Frontend/QA subagent
**Duration:** 1 week

**Tasks:**
1. Create Playwright scripts for GCP OAuth flow
2. Build visual overlay system (highlight + tooltips)
3. Add "Auto" vs "Manual" mode toggle
4. Test on Chrome, Firefox, Safari
5. Handle error states (popup blockers, timeouts)

**Deliverables:**
- GCP OAuth guide working
- Cross-browser tested
- Fallback to manual instructions if automation fails

---

### Stream E: Content & Education (Documentation Focus)
**Owner:** Technical writer subagent
**Duration:** 1 week

**Tasks:**
1. Write prompting training content (5 principles)
2. Create interactive exercises
3. Write skills deep-dive content
4. Design PDF report template
5. Create troubleshooting guide

**Deliverables:**
- Training modules written
- PDF template designed
- Troubleshooting docs complete

---

## Task Breakdown (Immediate Start)

### Sprint 1 (Week 1): Foundation

**Day 1-2: Project Setup**
- [ ] Create git repo: `ai-consultant-toolkit`
- [ ] Initialize Next.js project with Tailwind
- [ ] Setup Vercel deployment (staging)
- [ ] Create `docs/plans/` structure
- [ ] Document architecture in ADR format

**Day 3-4: Dashboard Shell**
- [ ] Build ProgressBar component
- [ ] Build CommandBlock component (copy button)
- [ ] Build FileUpload component (JSON validation)
- [ ] Create 11-step flow skeleton
- [ ] Add localStorage state management

**Day 5-7: Platform Scripts (Mac)**
- [ ] Write `setup-mac.sh` core logic
- [ ] Add Homebrew installation
- [ ] Add Node.js, Python, Git installation
- [ ] Add Claude Code CLI installation
- [ ] Test on clean Mac VM
- [ ] Generate JSON output

---

### Sprint 2 (Week 2): Scripts + Validation

**Day 1-3: Platform Scripts (Windows)**
- [ ] Write `setup-windows.ps1` core logic
- [ ] Add Chocolatey installation
- [ ] Add WSL2 + Ubuntu setup
- [ ] Add Node.js, Python, Git installation
- [ ] Test on clean Windows VM
- [ ] Generate JSON output

**Day 4-5: Validation APIs**
- [ ] Create Zod schemas for script outputs
- [ ] Build `/api/validate-output` endpoint
- [ ] Build `/api/generate-script` endpoint
- [ ] Add error messages for common failures
- [ ] Test with sample JSON outputs

**Day 6-7: Integration Testing**
- [ ] Connect dashboard to validation API
- [ ] Test full flow: Download script → Run → Upload JSON → Validate
- [ ] Fix bugs and edge cases
- [ ] Document known issues

---

### Sprint 3 (Week 3): Google Cloud + MCP

**Day 1-3: Google Cloud Automation**
- [ ] Write gcloud CLI automation script
- [ ] Test API enablement automation
- [ ] Build Playwright OAuth guide
- [ ] Test on multiple accounts
- [ ] Document manual fallback steps

**Day 4-7: MCP Bundle**
- [ ] Create MCP server bundle (Gmail, Calendar, Drive, Sheets, GitHub, AWS)
- [ ] Write `setup-all.sh` (Mac) and `setup-all.ps1` (Windows)
- [ ] Test authentication flows
- [ ] Generate settings.json template
- [ ] Test full MCP connection validation

---

### Sprint 4 (Week 4): EA Agent + PDF

**Day 1-3: EA Agent Creator**
- [ ] Build customization form UI
- [ ] Create skill.md template generator
- [ ] Test skill file generation
- [ ] Add preview mode before download
- [ ] Test with Claude Code

**Day 4-7: PDF Generation**
- [ ] Setup Python serverless function (ReportLab)
- [ ] Design PDF template (10 pages)
- [ ] Implement dynamic data population
- [ ] Test with sample client data
- [ ] Fix font issues (Arial for Windows compatibility)

---

### Sprint 5 (Week 5): Training Modules

**Day 1-3: Prompting Training**
- [ ] Write 5 principles content
- [ ] Build interactive UI for training
- [ ] Create practice exercises
- [ ] Add completion tracking
- [ ] Test user comprehension

**Day 4-7: Skills Education**
- [ ] Write skills ecosystem content
- [ ] Build marketplace integration UI
- [ ] Create "build your own skill" wizard
- [ ] Add example skills library
- [ ] Test skill installation flow

---

### Sprint 6 (Week 6): Polish + Testing

**Day 1-3: UI/UX Refinement**
- [ ] Add animations and transitions
- [ ] Improve error states and messages
- [ ] Add mobile responsiveness
- [ ] Brand consistency check (Support Forge colors)
- [ ] Accessibility audit (WCAG 2.1 AA)

**Day 4-7: QA + Bug Fixes**
- [ ] End-to-end testing on Mac + Windows
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance optimization
- [ ] Fix all critical bugs
- [ ] User acceptance testing with 1-2 beta clients

---

### Sprint 7 (Week 7): Production Prep

**Day 1-3: Monitoring + Analytics**
- [ ] Setup Sentry error tracking
- [ ] Add Plausible/Fathom analytics
- [ ] Create internal dashboard for metrics
- [ ] Setup alerts for critical errors
- [ ] Document monitoring procedures

**Day 4-7: Session Recovery**
- [ ] Implement session token system
- [ ] Add "Resume Setup" functionality
- [ ] Test state persistence across browser refresh
- [ ] Add progress save checkpoints
- [ ] Document recovery procedures

---

### Sprint 8 (Week 8): Launch

**Day 1-2: Production Deployment**
- [ ] Deploy to production (setup.support-forge.com)
- [ ] DNS configuration
- [ ] SSL certificate setup
- [ ] Smoke tests in production
- [ ] Rollback plan documented

**Day 3-5: Real Client Onboarding**
- [ ] Onboard client 1 (observe and document)
- [ ] Onboard client 2 (refine based on feedback)
- [ ] Onboard client 3 (measure time and completion)
- [ ] Onboard client 4-5 (validate scalability)
- [ ] Collect feedback surveys

**Day 6-7: Post-Launch Review**
- [ ] Analyze metrics (completion time, error rate)
- [ ] Document lessons learned
- [ ] Create improvement backlog
- [ ] Update documentation
- [ ] Plan Phase 2 features

---

## Risk Management

### High-Risk Items

**Risk 1: Google Cloud OAuth complexity**
**Impact:** High (blocks MCP setup)
**Mitigation:**
- Build robust manual fallback with screenshots
- Test on 5+ different Google accounts
- Have Perry available for live troubleshooting during beta

**Risk 2: Platform-specific script failures**
**Impact:** High (blocks entire setup)
**Mitigation:**
- Extensive testing on clean VMs (Mac Intel/M-series, Windows 10/11)
- Detection logic to skip already-installed tools
- Detailed error messages with troubleshooting links

**Risk 3: Client confusion during training**
**Impact:** Medium (reduces adoption)
**Mitigation:**
- Interactive exercises with validation
- Video walkthroughs as supplement
- Perry available during first 5 client sessions

**Risk 4: Session timeout/abandonment**
**Impact:** Medium (client frustration)
**Mitigation:**
- Save progress every step via localStorage
- "Resume Setup" URL with session token
- Email reminder if client doesn't complete in 24 hours

---

## Success Metrics

### Primary KPIs

| Metric | Baseline (Manual) | Target (Automated) | Measurement |
|--------|-------------------|-------------------|-------------|
| Setup Time | 3-4 hours | 60 minutes | Dashboard timer |
| Completion Rate | 60% | 90% | Analytics tracking |
| Support Tickets | 15 per client | 3 per client | Support system |
| Client Capacity | 2 clients/week | 10 clients/week | Calendar bookings |
| Client Satisfaction | 7/10 | 9/10 | Post-setup survey |

### Secondary Metrics

- Error rate per step (target: <5% per step)
- Average time per phase (track bottlenecks)
- Browser/OS distribution (optimize for common setups)
- Dropout points (identify friction)
- Return rate (clients who abandon and return)

---

## Phase 2+ Roadmap (Future)

### Phase 2: Productization (Month 3-6)
- Multi-tenant support (consultant accounts)
- White-label branding options
- Usage analytics per consultant
- Affiliate/referral system
- Pricing: $99/client or $499/month unlimited

### Phase 3: SaaS Product (Month 7-12)
- Self-serve signup (no consultant required)
- AI coach mode (chatbot guides setup)
- Marketplace for custom skills
- Community forum
- Enterprise tier with custom integrations

---

## Dependencies

### External Dependencies
- Vercel (hosting)
- GCP Cloud Run (PDF generation serverless function)
- Anthropic API (Claude Code validation)
- Package managers (Homebrew, Chocolatey)
- Browser automation (Playwright)

### Internal Dependencies
- Support Forge brand assets (logo, colors)
- Perry's availability for beta testing
- Test clients willing to try new onboarding
- GoTo Resolve licenses for support

---

## Team Structure

### Core Team
- **Perry (Product Owner):** Requirements, beta testing, client feedback
- **PM Agent (Orchestrator):** Project coordination, task delegation
- **Frontend Subagent:** Dashboard UI/UX
- **Backend Subagent:** APIs, scripts, validation logic
- **DevOps Subagent:** Platform scripts, deployment
- **QA Subagent:** Testing, browser automation
- **Technical Writer:** Content, documentation

### External Resources
- **Beta Clients:** 5 volunteers for testing
- **Design:** Leverage Support Forge existing brand
- **Support:** Perry + WhatsApp for escalations

---

## Documentation Plan

### Living Documents (docs/pdca/)
- `plan.md` - This master plan (updated weekly)
- `do.md` - Implementation log (daily updates)
- `check.md` - Sprint retrospectives (weekly)
- `act.md` - Improvements and pivots (as needed)

### Reference Docs (docs/patterns/)
- Architecture Decision Records (ADRs)
- API documentation (OpenAPI spec)
- Component library documentation
- Troubleshooting guides

### User-Facing Docs
- Setup instructions (generated per client)
- FAQ (based on common support questions)
- Video tutorials (screen recordings)
- PDF report template

---

## Memory Storage (Serena MCP)

### Key Memories to Save

```yaml
session/context:
  project: ai-consultant-toolkit
  phase: Sprint 1 - Foundation
  status: Planning complete, ready to build

plan/toolkit/hypothesis:
  goal: 60-minute automated client onboarding
  approach: Web dashboard + scripts + automation
  risks: GCP OAuth, script failures, client confusion

project/architecture:
  frontend: Next.js + Tailwind + Vercel
  backend: Next.js API routes + Python PDF
  automation: Playwright visual guides
  deployment: Vercel (dashboard) + GCP (PDF)

project/conventions:
  scripts: JSON output for validation
  docs: Markdown in docs/plans/
  testing: Clean VM testing for scripts
```

---

## Next Actions (Immediate)

1. ✅ Create this master plan document
2. ⏭️ Initialize git repo: `ai-consultant-toolkit`
3. ⏭️ Setup Next.js project with Tailwind
4. ⏭️ Create first component: ProgressBar
5. ⏭️ Write `setup-mac.sh` skeleton
6. ⏭️ Deploy empty dashboard to Vercel staging

**First Task for Subagents:**
- Frontend: Build ProgressBar component
- Backend: Write `setup-mac.sh` Homebrew + Node installation
- PM: Create Sprint 1 task board in docs/pdca/

---

**Document Location:** `C:\Users\Jakeb\docs\plans\2026-02-13-ai-consultant-toolkit-master-plan.md`
**Accessible from all worktrees:** Yes (relative path: `docs/plans/`)
**Next Review:** End of Sprint 1 (February 20, 2026)

---

*This plan is a living document. Update weekly based on progress, learnings, and pivots.*
