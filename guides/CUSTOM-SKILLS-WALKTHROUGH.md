# Custom Skills Creation Walkthrough

**Build AI Skills for Your Specific Business Needs**

---

## 🎯 What You'll Learn

By the end of this walkthrough, you'll be able to:
- ✅ Create custom Claude Code skills from scratch
- ✅ Build skills that integrate with your business tools
- ✅ Automate your most common workflows
- ✅ Share skills with team members
- ✅ Debug and improve existing skills

**Time Required:** 30-45 minutes

---

## 📚 Real-World Examples

Before we build, let's see what others have created:

### Example 1: Steve's Salesforce Integration Skill

**Problem:** Steve needed to connect Claude Code directly to Salesforce to avoid Zapier limitations and costs.

**Solution:** Custom skill that:
- Queries Salesforce objects (Accounts, Contacts, Opportunities)
- Creates and updates records
- Generates reports from Salesforce data
- Syncs with other business tools

**Result:** Eliminated $700-800/year in HostGator costs, direct API access, better security.

### Example 2: Nicole's Website Management Skill

**Problem:** Nicole needed to streamline managing client websites and content updates.

**Solution:** Custom skill that:
- Deploys website changes via AWS Amplify
- Updates content across multiple sites
- Runs automated QA checks
- Manages DNS and SSL certificates

**Result:** Reduced site management time by 80%, faster client deliveries.

### Example 3: Jessica's Real Estate ROI Skill

**Problem:** Jessica (luxury real estate agent) needed custom ROI analysis for high-net-worth clients.

**Solution:** Custom skill that:
- Analyzes property comparables (CMA)
- Calculates investment returns and tax benefits
- Generates professional PDF reports
- Tracks market trends for specific areas

**Result:** Professional presentations that close deals faster.

---

## 🏗️ Skill Anatomy

Every Claude Code skill has this structure:

```
~/.claude/skills/your-skill-name/
├── SKILL.md           # Main skill definition (required)
├── README.md          # Documentation (optional)
├── examples/          # Usage examples (optional)
├── prompts/           # Template prompts (optional)
└── data/             # Reference data (optional)
```

### The SKILL.md File

This is the heart of your skill. It contains:
1. **Metadata** (name, version, author)
2. **Description** (what the skill does)
3. **Instructions** (how Claude should behave)
4. **Examples** (usage patterns)
5. **Integration points** (MCP servers, tools)

---

## 🚀 Walkthrough: Build Your First Skill

Let's build a real skill together: **Client Onboarding Assistant**

This skill will help you onboard new clients by:
- Gathering requirements via questionnaire
- Creating project folders (Drive)
- Setting up initial meetings (Calendar)
- Sending welcome email (Gmail)
- Creating project tracker (Sheets)

### Step 1: Create Skill Directory

```bash
# Create skill folder
mkdir -p ~/.claude/skills/client-onboarding

# Navigate to it
cd ~/.claude/skills/client-onboarding
```

### Step 2: Create SKILL.md

Create `~/.claude/skills/client-onboarding/SKILL.md`:

```markdown
# Client Onboarding Assistant

**Version:** 1.0.0
**Author:** Your Name
**Created:** 2026-02-14

## Description

Streamlines new client onboarding by gathering requirements, setting up project infrastructure, and initiating communication workflows.

## When to Use This Skill

Invoke this skill when:
- User says "onboard new client" or "new client setup"
- User mentions starting a new project with a client
- User asks to set up client infrastructure

## Instructions

When this skill is invoked:

1. **Gather Client Information**
   - Ask for client name, email, company
   - Ask for project type (website, app, consulting, etc.)
   - Ask for project timeline and budget
   - Ask for key stakeholders and decision makers

2. **Create Project Infrastructure**
   - Create Google Drive folder: "Clients/[Client Name]/[Project Name]"
   - Create subfolders: Contracts, Deliverables, Communications, Assets
   - Share folder with client email (view access)

3. **Set Up Communication**
   - Draft welcome email using Gmail MCP
   - Include project overview, timeline, next steps
   - Attach relevant templates or documents
   - Schedule kickoff meeting using Calendar MCP

4. **Initialize Project Tracker**
   - Create Google Sheet: "[Client Name] - Project Tracker"
   - Add sheets: Timeline, Budget, Tasks, Communications Log
   - Populate initial milestones based on project type
   - Share sheet with client (comment access)

5. **Create Reminder Tasks**
   - Add tasks for follow-ups (48hr check-in, week 1 review)
   - Set calendar reminders for key milestones
   - Create recurring task for weekly status updates

6. **Confirm and Summarize**
   - Show user what was created
   - Provide links to Drive folder, Sheet, Calendar event
   - Confirm email draft looks good before sending
   - Ask if anything else is needed

## Required MCP Servers

- `gmail` - For sending welcome emails
- `google-calendar` - For scheduling meetings
- `google-drive` - For creating project folders
- `google-sheets` - For project tracker
- `google-tasks` - For follow-up reminders

## Example Usage

**User:** "Onboard new client Jessica Schaefer"

**EA:** "I'll help you onboard Jessica. Let me gather some details:

1. What's the company name? [Russ Lyon Sotheby's]
2. What type of project? [Real Estate Marketing Website]
3. Timeline? [6 weeks, launch by April 1]
4. Budget? [$8,000]
5. Key stakeholders? [Jessica (decision maker), IT team for CRM integration]

Perfect! I'm setting up:
✅ Drive folder: Clients/Jessica Schaefer/Real Estate Marketing Website
✅ Subfolders: Contracts, Deliverables, Communications, Assets
✅ Project tracker spreadsheet with timeline and budget
✅ Kickoff meeting: Next Tuesday 2pm
✅ Welcome email draft (ready to review)
✅ Follow-up tasks created

Here are the links... [provides Drive, Sheet, Calendar links]

Would you like me to send the welcome email now?"

## Project Type Templates

### Website Project Template
- Timeline: Discovery (1wk), Design (2wk), Development (3wk), Testing (1wk)
- Deliverables: Sitemap, Wireframes, Design Mockups, Developed Site, Training
- Milestones: Design approval, Content delivery, UAT, Launch

### Mobile App Template
- Timeline: Planning (2wk), Design (3wk), Development (8wk), Testing (2wk)
- Deliverables: User flows, UI designs, iOS app, Android app, Backend API
- Milestones: Design approval, Alpha release, Beta release, App store launch

### Consulting Project Template
- Timeline: Discovery (1wk), Analysis (2wk), Recommendations (1wk), Implementation support (4wk)
- Deliverables: Current state analysis, Gap analysis, Roadmap, Implementation guide
- Milestones: Discovery complete, Analysis presented, Roadmap approved

## Email Templates

### Welcome Email Template

Subject: Welcome to [Your Company] - Let's build something amazing!

Hi [Client Name],

I'm thrilled to welcome you to [Your Company]! I'm looking forward to working with you on [Project Name].

**Project Overview:**
- Type: [Project Type]
- Timeline: [Duration]
- Launch Target: [Date]

**Next Steps:**
1. Kickoff Meeting: [Date/Time] - I've sent a calendar invite
2. Project Tracker: [Sheet Link] - Shared for your review
3. Project Folder: [Drive Link] - All deliverables will be stored here

**This Week:**
- Complete discovery questionnaire (link attached)
- Gather any existing assets, brand guidelines, content
- Confirm stakeholder list and communication preferences

I've created a project tracker where you can see our timeline, budget, and deliverables. Feel free to comment or ask questions directly in the sheet.

Looking forward to our kickoff meeting on [Date]!

Best regards,
[Your Name]

---

## Tips for Success

- Always confirm details before creating infrastructure
- Provide links to everything created
- Don't send emails without user approval
- Customize templates based on project type
- Update tracker as project progresses

## Troubleshooting

**Issue:** Drive folder creation fails
**Fix:** Check OAuth token: `cd ~/mcp-servers/google-drive && npm run auth`

**Issue:** Email won't send
**Fix:** Check Gmail MCP: `cd ~/mcp-servers/gmail && npm run auth`

**Issue:** Can't create Sheet
**Fix:** Verify Sheets MCP is configured in `~/.claude/settings.json`

---

**Last Updated:** 2026-02-14
```

### Step 3: Test Your Skill

```bash
# Start Claude Code
claude chat

# Invoke your skill
/client-onboarding
```

Then follow the prompts!

### Step 4: Refine Based on Usage

After using the skill a few times, you'll notice patterns:
- Questions you always ask
- Steps you always skip
- Customizations you always make

**Edit SKILL.md to incorporate these learnings.**

---

## 🎨 Advanced Skill Patterns

### Pattern 1: Multi-Step Workflows

Break complex tasks into discrete steps:

```markdown
## Workflow Steps

### Step 1: Discovery
1. Ask questions A, B, C
2. Validate inputs
3. Proceed to Step 2

### Step 2: Creation
1. Create resource X
2. Verify creation
3. Proceed to Step 3

### Step 3: Notification
1. Draft communication
2. Get user approval
3. Send
```

### Pattern 2: Conditional Logic

Handle different scenarios:

```markdown
## Conditional Behavior

**If project type is "Website":**
- Use website template
- Ask about hosting preference
- Create staging environment

**If project type is "Mobile App":**
- Use app template
- Ask about iOS/Android/Both
- Create app store developer accounts

**If project type is "Consulting":**
- Use consulting template
- Ask about assessment scope
- Create analysis framework
```

### Pattern 3: Integration with Multiple MCPs

Chain multiple tools together:

```markdown
## MCP Integration Flow

1. **Search Gmail** for existing client communications
   - Tool: `gmail_search_emails`
   - Query: `from:client@example.com`

2. **Create Drive Folder** based on findings
   - Tool: `google_drive_create_folder`
   - Parent: "Clients"

3. **Schedule Meeting** with available times
   - Tool: `google_calendar_list_events` (find availability)
   - Tool: `google_calendar_create_event` (schedule)

4. **Send Confirmation** with all links
   - Tool: `gmail_send_with_attachments`
   - Attachments: Contract template from Drive
```

### Pattern 4: Data-Driven Skills

Use reference data to inform decisions:

```markdown
## Reference Data

Store in `~/.claude/skills/your-skill/data/`

**pricing-tiers.json:**
```json
{
  "website": {
    "basic": { "price": 3000, "timeline": "2 weeks", "pages": 5 },
    "standard": { "price": 8000, "timeline": "6 weeks", "pages": 15 },
    "premium": { "price": 20000, "timeline": "12 weeks", "pages": 30 }
  }
}
```

**Reference in SKILL.md:**
```markdown
When user asks for quote:
1. Read ~/skills/your-skill/data/pricing-tiers.json
2. Present options based on project scope
3. Calculate custom pricing if needed
```

---

## 📦 Real Skill Examples to Clone

### 1. Salesforce Integration Skill

**File:** `~/.claude/skills/salesforce-connector/SKILL.md`

```markdown
# Salesforce Connector

## Description
Direct integration with Salesforce API for querying, creating, and updating records.

## Required Setup
1. Salesforce Developer Account
2. Create Connected App
3. Get Client ID and Secret
4. Store credentials in ~/.credentials/salesforce.json

## MCP Server
Custom MCP at ~/mcp-servers/salesforce-mcp/

## Capabilities
- Query: Accounts, Contacts, Opportunities, Leads, Cases
- Create: New records with validation
- Update: Bulk updates with error handling
- Report: Generate custom reports
- Sync: Two-way sync with Google Sheets

## Example Usage
"Get all opportunities closing this quarter"
"Create new contact for John Smith at Acme Corp"
"Update all leads from last week to 'Contacted' status"
"Generate revenue report by account for Q1"
```

**MCP Server:** Build with Salesforce REST API + OAuth

### 2. Website Deployment Skill

**File:** `~/.claude/skills/deploy-website/SKILL.md`

```markdown
# Website Deployment Assistant

## Description
Automates deployment to AWS Amplify, S3/CloudFront, or Vercel.

## Capabilities
- Deploy to Amplify (auto-detect amplify.yml)
- Deploy to S3 + CloudFront (static sites)
- Deploy to Vercel (Next.js apps)
- Run pre-deployment QA (broken links, lighthouse)
- Update DNS if needed
- Invalidate CDN caches

## Deployment Checklist
1. Run tests (npm test)
2. Build production (npm run build)
3. QA checks (lighthouse, links)
4. Deploy to staging
5. QA staging
6. Deploy to production
7. Invalidate caches
8. Verify production
9. Notify stakeholders

## Example Usage
"Deploy homebasevet.com to staging"
"Push sweetmeadow-bakery.com to production"
"Run QA on platorum.com before deploying"
```

### 3. Financial Analysis Skill

**File:** `~/.claude/skills/financial-analyzer/SKILL.md`

```markdown
# Financial Analysis Assistant

## Description
Analyzes business finances, generates reports, forecasts revenue.

## Data Sources
- Stripe API (revenue, customers)
- AWS Cost Explorer (cloud costs)
- Google Sheets (manual expenses)
- Bank statements (via CSV upload)

## Reports Generated
- P&L Statement (monthly, quarterly, annual)
- Cash flow analysis
- Revenue vs expenses trends
- Client profitability analysis
- Forecast models (3, 6, 12 months)
- Tax preparation summaries

## Example Usage
"What's my P&L for Q1?"
"Show revenue trends by client"
"Forecast next quarter revenue"
"Generate tax summary for 2025"
"Which clients are most profitable?"
```

---

## 🔧 Skill Development Best Practices

### 1. Start Simple

```markdown
# Version 1.0: Minimum Viable Skill
- One core capability
- Manual steps okay
- Get feedback

# Version 1.1: Add Automation
- Reduce manual steps
- Add error handling
- Improve prompts

# Version 2.0: Full Integration
- Multiple MCPs
- Advanced workflows
- Data persistence
```

### 2. Write Clear Instructions

**Bad:**
```markdown
Handle client onboarding
```

**Good:**
```markdown
1. Ask for client name, email, project type
2. Validate email format
3. Create Drive folder at Clients/[Name]/[Project]
4. If Drive creation fails, retry once, then alert user
5. Draft welcome email but DO NOT send without approval
6. Show user preview of email and folder link
7. Wait for confirmation before sending
```

### 3. Handle Errors Gracefully

```markdown
## Error Handling

**If OAuth token expired:**
1. Notify user: "Gmail token expired"
2. Provide fix: "Run: cd ~/mcp-servers/gmail && npm run auth"
3. Pause workflow until user confirms
4. Resume where left off

**If resource already exists:**
1. Check if existing resource should be used
2. Ask user: "Folder already exists. Use existing or create new?"
3. Handle both paths

**If API rate limit hit:**
1. Wait 60 seconds
2. Retry
3. If fails again, defer to user
```

### 4. Provide Examples

Include 3-5 realistic examples in SKILL.md:

```markdown
## Example Conversations

### Example 1: Full Onboarding
User: "Onboard Jessica Schaefer for website project"
EA: [Shows full workflow]

### Example 2: Partial Setup
User: "Create client folder for Acme Corp but don't email yet"
EA: [Creates folder only, skips email]

### Example 3: Error Recovery
User: "Onboard new client"
EA: "Gmail MCP not authenticated. Please run..."
User: [Runs auth]
EA: "Great! Now, client name?"
```

### 5. Version Your Skills

```markdown
# Changelog

## Version 1.2.0 (2026-02-14)
- Added Slack notification integration
- Improved error handling for Drive failures
- Added template for consulting projects

## Version 1.1.0 (2026-02-01)
- Added automatic budget tracking
- Integrated with Stripe for payment links
- Fixed Calendar timezone issues

## Version 1.0.0 (2026-01-15)
- Initial release
- Basic onboarding workflow
- Gmail, Drive, Calendar integration
```

---

## 🧪 Testing Your Skill

### Manual Testing Checklist

- [ ] Skill invokes correctly (`/your-skill-name`)
- [ ] All required MCPs are available
- [ ] Questions are clear and in logical order
- [ ] Error messages are helpful
- [ ] Success messages include next steps
- [ ] Links to created resources work
- [ ] Email drafts look professional
- [ ] Calendar events have correct timezone
- [ ] Drive permissions are set correctly

### Test Cases to Run

1. **Happy Path:** Everything works perfectly
2. **Missing MCP:** One MCP not configured
3. **OAuth Expired:** Token needs refresh
4. **Duplicate Resource:** Folder already exists
5. **Invalid Input:** User provides bad email format
6. **Partial Completion:** User wants to skip steps
7. **Resume Later:** User stops mid-workflow

---

## 📤 Sharing Your Skill

### With Team Members

```bash
# Package your skill
cd ~/.claude/skills
tar -czf client-onboarding.tar.gz client-onboarding/

# Share via email or Drive
# Recipient extracts to their ~/.claude/skills/
```

### With The Community

```bash
# Create GitHub repo
cd ~/.claude/skills/client-onboarding
git init
git add .
git commit -m "Initial skill release"
git remote add origin https://github.com/yourname/claude-skill-client-onboarding
git push -u origin main

# Add README with installation instructions
```

### Installation for Others

```bash
# Clone from GitHub
cd ~/.claude/skills
git clone https://github.com/yourname/claude-skill-client-onboarding

# Or install via Claude
claude install https://github.com/yourname/claude-skill-client-onboarding
```

---

## 🎓 Next Steps

### Build These Skills for Practice

1. **Invoice Generator** - Create and send invoices via Gmail with Stripe payment links
2. **Meeting Scheduler** - Find mutual availability and schedule across multiple calendars
3. **Content Publisher** - Draft blog post, generate images, publish to WordPress
4. **Expense Tracker** - Scan receipts (OCR), categorize, add to Google Sheet
5. **Lead Qualifier** - Score leads based on criteria, add to CRM, assign follow-up

### Advanced Topics

- **Skill Composition:** Calling one skill from another
- **Persistent State:** Storing workflow state between sessions
- **Background Jobs:** Long-running tasks via cron
- **Webhooks:** Triggering skills from external events
- **Voice Integration:** Voice commands via Evie

### Get Inspiration

Study your existing skills:

```bash
ls ~/.claude/skills/
cat ~/.claude/skills/*/SKILL.md
```

Look for patterns you can adapt for your needs.

---

## 📚 Resources

- **Skill Examples:** `~/.claude/skills/` (browse installed skills)
- **MCP Documentation:** https://modelcontextprotocol.io
- **Claude Code Docs:** https://docs.anthropic.com/claude-code
- **Perry's Skills:** 82+ production skills in `~/.claude/skills/`
- **Real Examples:** Fathom transcripts with Nicole and Steve

---

## 🆘 Getting Help

### Common Questions

**Q: Can skills call other skills?**
A: Yes! Reference `/other-skill` in your SKILL.md instructions.

**Q: Can I use Python libraries in skills?**
A: Yes, via custom MCP server written in Python.

**Q: How do I debug a skill?**
A: Add `console.log` style messages in SKILL.md: "Debug: Current step is X"

**Q: Can skills access files outside ~/.claude/?**
A: Yes, via Read/Write tools or MCP servers with file access.

**Q: How do I secure API keys in skills?**
A: Store in `~/.credentials/` with 600 permissions, reference by path.

### Need Support?

- Check existing skills for patterns
- Ask EA: "How do I create a skill that does X?"
- Join Claude Code community (link in docs)

---

**Last Updated:** February 14, 2026
**Version:** 1.0
**Part of:** AI Consultant Toolkit - Phase 2

**Previous:** [EA Configuration Guide](./EA-CONFIGURATION-GUIDE.md)
**Next:** Phase 3 - Advanced Workflows (Coming Soon)
