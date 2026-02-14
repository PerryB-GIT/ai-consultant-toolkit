# Executive Assistant (EA) Configuration Guide

**Your AI Executive Assistant - Always On, Always Helpful**

---

## 🎯 What is the Executive Assistant?

The Executive Assistant (EA), also known as "Evie," is a proactive AI persona that runs on top of Claude Code. Think of it as having a warm, British executive assistant who:

- **Remembers everything** across conversations (episodic memory)
- **Proactively helps** without being asked (morning briefings, reminders)
- **Manages your business** (email, calendar, tasks, finances)
- **Stays technical** when needed (full coding capabilities)
- **Communicates warmly** but professionally

### EA vs Regular Claude

| Aspect | Regular Claude | EA (Evie) |
|--------|---------------|-----------|
| **Technical Skills** | ✅ Full capabilities | ✅ Full capabilities |
| **Coding Quality** | ✅ Production-ready | ✅ Production-ready |
| **MCP Access** | ✅ All tools | ✅ All tools |
| **Persona** | Neutral, technical | Warm, proactive, caring |
| **Communication** | Concise, formal | British, friendly, organized |
| **Proactivity** | Responds to requests | Anticipates needs, offers help |

**Important:** EA is NOT a limited version of Claude. It's the SAME AI with an enhanced personality layer.

---

## 📋 What Phase 2 Already Set Up

If you ran the Phase 2 setup script, the following is already configured:

✅ **Skills Installed:**
- `superpowers` - Debugging, planning, code review
- `document-skills` - DOCX, PDF, PPTX, XLSX creation
- `playwright-skill` - Browser automation
- `episodic-memory` - Cross-session memory
- `executive-assistant` - EA persona and workflows

✅ **MCP Servers Installed:**
- Gmail (requires OAuth)
- Google Calendar (requires OAuth)
- Google Drive (requires OAuth)
- GitHub (uses gh CLI)

✅ **CLAUDE.md Created:**
- Located at `~/CLAUDE.md` (Windows: `C:\Users\YourName\CLAUDE.md`)
- EA set as default persona
- Communication guidelines defined

---

## 🔧 Next Steps: Activating Your EA

### Step 1: Authenticate Google Services

The EA needs access to your email, calendar, and drive to be truly helpful.

**Gmail Setup:**
```bash
cd ~/mcp-servers/gmail
npm run auth
```
- Opens browser for Google OAuth
- Grant access to Gmail API
- Token saved to `~/.gmail-mcp/`

**Google Calendar Setup:**
```bash
cd ~/mcp-servers/google-calendar
npm run auth
```
- Same OAuth flow
- Grant Calendar access
- Token saved to `~/.google-calendar-mcp/`

**Google Drive Setup:**
```bash
cd ~/mcp-servers/google-drive
npm run auth
```
- Same OAuth flow
- Grant Drive access
- Token saved to `~/.google-drive-mcp/`

### Step 2: Authenticate GitHub

```bash
gh auth login
```
- Choose: GitHub.com
- Protocol: HTTPS
- Authenticate: Login with web browser
- Follow prompts to complete

### Step 3: Restart Claude Code

After authentication, restart Claude Code to load the authenticated MCPs:

```bash
# If running in terminal
exit

# Then start fresh
claude chat
```

### Step 4: Test Your EA

Start a conversation and see EA in action:

```
You: Good morning
EA: Good morning! I'm Evie, your executive assistant. Let me check what's on your
    agenda today...

    📧 Email Summary:
    - 3 unread messages (2 require response)
    - Latest: Client inquiry about website project

    📅 Calendar:
    - 10:00 AM - Team standup
    - 2:00 PM - Client discovery call

    ✅ Tasks:
    - Review Q1 financials (due today)
    - Update project proposal (in progress)

    What would you like to tackle first?
```

---

## 🎨 Customizing Your EA

### Personality Adjustments

Edit `~/CLAUDE.md` to customize EA's personality:

```markdown
## Default Persona
- Always operate as Executive Assistant (EA/Evie)
- Use warm, [British/American/Australian] [female/male/neutral] voice
- [Proactive/Reserved], [caring/formal], [organized/flexible]
- Address me as [Your Preferred Name]
```

### Communication Preferences

```markdown
## Communication Style
- Morning briefings at [time preference]
- [Daily/Weekly] email summaries
- [Proactive/On-request] reminders
- [Formal/Casual] tone for emails
- [Celebrate/Acknowledge quietly] wins
```

### Workflow Preferences

```markdown
## EA Workflows
- Email triage: [Auto-draft responses/Flag only/Full automation]
- Calendar management: [Auto-schedule/Suggest only/Manual]
- Task tracking: [Google Tasks/Notion/Asana/Manual]
- Financial tracking: [Weekly summaries/Monthly only/On-request]
```

---

## 🚀 EA Capabilities Walkthrough

### 1. Email Management

**What EA Can Do:**
- ✅ Check unread emails and summarize
- ✅ Draft responses to common requests
- ✅ Send emails with attachments
- ✅ Flag urgent messages
- ✅ Archive/label messages
- ✅ Search email history

**Example Commands:**
```
"Check my email"
"Draft a response to [sender name]"
"Send an invoice to [client] with attachment"
"Search emails from [person] about [topic]"
"Flag all unread emails from this week"
```

**Try It:**
```
You: Check my email and summarize anything urgent

EA: Checking your Gmail... You have 7 unread messages:

    🔴 URGENT:
    - Hannah Zeng (Eyam Health) - Payment confirmation needed (2 hours ago)

    🟡 Needs Response:
    - Jessica Schaefer - Meeting reschedule request (yesterday)
    - Steve Badelt - AWS setup question (3 days ago)

    ✅ FYI Only:
    - GitHub notifications (4 messages)

    Would you like me to draft responses to the urgent items?
```

### 2. Calendar Management

**What EA Can Do:**
- ✅ Show today's/this week's schedule
- ✅ Create meetings with invites
- ✅ Reschedule appointments
- ✅ Find available time slots
- ✅ Send calendar reminders
- ✅ Create recurring events

**Example Commands:**
```
"What's on my calendar today?"
"Schedule a meeting with [person] for [time]"
"Find me 30 minutes this week for deep work"
"Reschedule my 2pm to tomorrow"
"Block out focus time every morning 9-11am"
```

**Try It:**
```
You: What's on my calendar this week?

EA: Here's your week ahead:

    📅 Monday (Today):
    - 10:00 AM - Team standup (30 min)
    - 2:00 PM - Client discovery: Jessica Schaefer (1 hour)

    📅 Tuesday:
    - 9:00 AM - AWS optimization review (1 hour)
    - 3:00 PM - Nicole onboarding call (45 min)

    📅 Wednesday:
    - All clear - great day for deep work!

    You have 12 hours of free time this week. Would you like me to block
    some focus time?
```

### 3. Task Management

**What EA Can Do:**
- ✅ List active tasks
- ✅ Create new tasks
- ✅ Mark tasks complete
- ✅ Set due dates and priorities
- ✅ Track project progress
- ✅ Send task reminders

**Example Commands:**
```
"What tasks do I have today?"
"Add task: [description] due [date]"
"Mark [task] as complete"
"Show all overdue tasks"
"What's the status of [project]?"
```

**Try It:**
```
You: What tasks are on my plate?

EA: Here are your active tasks:

    🔴 DUE TODAY:
    - Review Q1 financials (Priority: High)

    🟡 THIS WEEK:
    - Update project proposal for Jessica (In Progress)
    - Set up AWS budget alerts (Not Started)

    🟢 UPCOMING:
    - Prepare JPMorgan pitch deck (Due: Next Monday)

    Would you like me to prioritize these using RICE scoring?
```

### 4. Financial Tracking

**What EA Can Do:**
- ✅ Track cloud costs (AWS, GCP, Azure)
- ✅ Monitor Stripe revenue
- ✅ Generate invoices
- ✅ Track expenses
- ✅ Budget alerts
- ✅ Financial summaries

**Example Commands:**
```
"What are my cloud costs this month?"
"Create an invoice for [client] for [amount]"
"Track this expense: [description] $[amount]"
"Show revenue vs expenses this quarter"
"Alert me if AWS costs exceed $100"
```

**Try It:**
```
You: What are my cloud costs looking like?

EA: Cloud Cost Summary (February 2026):

    ☁️ AWS (3 profiles):
    - Default: $42.18
    - Support Forge: $28.50
    - Sweetmeadow: $8.32
    Total: $79.00 (under $100 budget ✅)

    ☁️ Google Cloud:
    - Gen Lang Client: $12.45
    - Cloud Run: $6.20
    Total: $18.65

    ☁️ Azure:
    - Perry Sandbox: $0.00 (free tier)

    GRAND TOTAL: $97.65 / $150 monthly budget (65%)

    You're on track this month. No alerts.
```

### 5. Content Creation

**What EA Can Do:**
- ✅ Create professional documents (DOCX, PDF)
- ✅ Generate presentations (PPTX)
- ✅ Build spreadsheets (XLSX)
- ✅ Draft proposals and contracts
- ✅ Design graphics (via Canva MCP)
- ✅ Create videos (via HeyGen MCP when enabled)

**Example Commands:**
```
"Create a proposal for [client] project"
"Generate invoice PDF for [client]"
"Build a pitch deck for [topic]"
"Create a financial model spreadsheet"
"Draft a contract for [service]"
```

**Try It:**
```
You: Create a proposal for a website redesign project

EA: I'll create a professional proposal. Let me gather some details:

    - Client name?
    - Project scope (pages, features)?
    - Timeline?
    - Budget range?

    Once I have these, I'll generate a DOCX proposal with:
    ✅ Executive summary
    ✅ Scope of work breakdown
    ✅ Timeline with milestones
    ✅ Pricing structure
    ✅ Terms and conditions
    ✅ Next steps

    Should take about 2 minutes. Sound good?
```

### 6. Browser Automation

**What EA Can Do:**
- ✅ Test websites (QA)
- ✅ Fill forms automatically
- ✅ Take screenshots
- ✅ Monitor site changes
- ✅ Scrape data (ethically)
- ✅ Automate repetitive tasks

**Example Commands:**
```
"Test [website] for broken links"
"Take screenshots of all client sites"
"Fill out this form: [URL]"
"Monitor [website] for price changes"
"Check if [site] is mobile-responsive"
```

**Try It:**
```
You: Test homebasevet.com for issues

EA: Running automated QA on homebasevet.com...

    ✅ Site loads successfully (1.2s)
    ✅ SSL certificate valid
    ✅ All navigation links working
    ✅ Mobile responsive (tested 3 viewports)
    ✅ Forms functional
    ⚠️  WARNING: Footer copyright year is 2024 (should be 2026)
    ⚠️  INFO: Lighthouse score: 87/100 (could optimize images)

    Would you like me to fix the copyright year?
```

---

## 💡 EA Best Practices

### When to Use EA vs Regular Claude

**Use EA for:**
- ✅ Daily business operations
- ✅ Email and calendar management
- ✅ Client communication
- ✅ Project management
- ✅ Financial tracking
- ✅ Morning briefings

**Switch to Regular Claude for:**
- ⚙️ Deep technical debugging (automatic switch)
- ⚙️ Complex algorithm design
- ⚙️ Security audits
- ⚙️ When you prefer neutral tone

**How to Switch:**
```
"Exit EA mode" or "Be regular Claude for this"
"Resume EA mode" or "Switch back to Evie"
```

EA will automatically switch to technical mode for deep coding work, then return to warm mode afterward.

### Morning Routine with EA

**Start your day:**
```
You: Good morning

EA: [Provides automatic briefing with email, calendar, tasks, priorities]

You: Let's start with the urgent email from Hannah

EA: [Drafts response, sends after your approval]

You: Block 2 hours for the proposal work

EA: [Finds available time, creates calendar block]

You: Remind me to follow up with Jessica tomorrow

EA: [Creates reminder task with notification]
```

### End of Day with EA

**Wrap up:**
```
You: What did we accomplish today?

EA: [Summarizes completed tasks, emails sent, meetings attended]

You: What's on deck for tomorrow?

EA: [Previews tomorrow's calendar, pending tasks, deadlines]

You: Good night

EA: [Warm sign-off, confirms tomorrow's priorities set]
```

---

## 🔐 Privacy & Security

### What EA Has Access To

After OAuth setup:
- ✅ Your Gmail (read, send, draft)
- ✅ Your Google Calendar (read, create, edit)
- ✅ Your Google Drive (read, write, share)
- ✅ Your GitHub repos (via gh CLI permissions)

**EA can only access what YOU authorize during OAuth.**

### What EA Does NOT Access

- ❌ Your passwords or credentials
- ❌ Your banking or financial accounts (unless you connect them)
- ❌ Private files outside authorized directories
- ❌ Other people's data (unless shared with you)

### Revoking Access

**To revoke Gmail/Calendar/Drive:**
1. Go to https://myaccount.google.com/permissions
2. Find "Gmail MCP" / "Calendar MCP" / "Drive MCP"
3. Click "Remove Access"

**To revoke GitHub:**
```bash
gh auth logout
```

### Data Storage

- OAuth tokens: Stored locally in `~/.gmail-mcp/`, `~/.google-calendar-mcp/`, etc.
- Conversation memory: Stored locally in `~/.claude/episodic-memory/`
- No data sent to third parties (except API calls to Google/GitHub)

---

## 🆘 Troubleshooting

### "EA isn't responding proactively"

**Check CLAUDE.md:**
```bash
# Windows
cat ~/CLAUDE.md

# macOS
cat ~/CLAUDE.md
```

Should contain: `Always operate as Executive Assistant (EA/Evie)`

**Fix:** Re-run Phase 2 setup script or manually edit CLAUDE.md

### "Gmail MCP not working"

**Check authentication:**
```bash
cd ~/mcp-servers/gmail
ls -la ~/.gmail-mcp/
```

Should show `tokens.json` file.

**Fix:** Re-run OAuth:
```bash
cd ~/mcp-servers/gmail
npm run auth
```

### "EA can't access calendar"

**Verify MCP is enabled:**
```bash
cat ~/.claude/settings.json | grep google-calendar
```

**Fix:** Add to `~/.claude/settings.json`:
```json
"google-calendar": {
  "command": "node",
  "args": ["C:/Users/YourName/mcp-servers/google-calendar/index.js"]
}
```

### "EA lost memory of previous conversations"

**Check episodic memory:**
```bash
ls ~/.claude/episodic-memory/
```

Should show database files.

**Fix:** Memory persists automatically. If lost, likely Claude Code was reinstalled. Memory will rebuild over new conversations.

### "EA is too chatty / too formal"

**Customize in CLAUDE.md:**

Too chatty → Change to:
```markdown
- Communication style: Concise, professional
- Proactivity: On-request only
```

Too formal → Change to:
```markdown
- Communication style: Casual, friendly
- Use contractions and informal language
```

---

## 🎓 Next: Learn to Create Custom Skills

Now that your EA is set up, you can create custom skills for your specific business needs.

**Examples from real users:**
- Steve Badelt: Custom Salesforce integration skill
- Nicole Leiter: Website management and client portal skill
- Jessica Schaefer: Real estate CMA and ROI analysis skill

**Continue to:** [Custom Skills Creation Walkthrough](./CUSTOM-SKILLS-WALKTHROUGH.md)

---

## 📚 Additional Resources

- [EA Capabilities Reference](../Desktop/EA_AND_CLAUDE_CAPABILITIES_REFERENCE.md)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [Fathom Meeting Summaries](../Desktop/JPMorgan_Pitch/fathom_meeting_summaries.md) - Real examples

---

**Last Updated:** February 14, 2026
**Version:** 1.0
**Part of:** AI Consultant Toolkit - Phase 2
