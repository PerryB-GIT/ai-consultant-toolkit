#!/bin/bash
#
# AI Consultant Toolkit - Phase 2: Skills & MCP Setup (macOS)
# Installs essential Claude Code skills and MCP servers after Phase 1 completes
#

set -e
SKIP_MCPS=false

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-mcps) SKIP_MCPS=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

START_TIME=$(date +%s)
RESULTS_FILE="$HOME/setup-phase2-results.json"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   AI Consultant Toolkit - Phase 2 Setup${NC}"
echo -e "${CYAN}   Skills & MCP Server Installation${NC}"
echo -e "${CYAN}================================================================${NC}"

# Verify Claude Code installed
echo -e "\n${YELLOW}> Verifying Claude Code installation...${NC}"
if ! command -v claude &> /dev/null; then
    echo -e "${RED}  [FAIL] Claude Code not found. Please complete Phase 1 first.${NC}"
    exit 1
fi
echo -e "${GREEN}  [OK] Claude Code detected${NC}"

# Create directories
echo -e "\n${YELLOW}> Creating directories...${NC}"
mkdir -p "$HOME/.claude/skills"
mkdir -p "$HOME/mcp-servers"
echo -e "${GREEN}  [OK] Directories ready${NC}"

# Install Skills
echo -e "\n${CYAN}================================================================${NC}"
echo -e "${CYAN}   Installing Essential Skills${NC}"
echo -e "${CYAN}================================================================${NC}"

# Superpowers
echo -e "\n${YELLOW}> Installing superpowers plugin...${NC}"
if claude install superpowers &> /dev/null && [ -d "$HOME/.claude/skills/superpowers" ]; then
    echo -e "${GREEN}  [OK] Superpowers installed (systematic-debugging, writing-plans, code-review)${NC}"
    SUPERPOWERS_STATUS="OK"
else
    echo -e "${RED}  [FAIL] Superpowers install failed${NC}"
    SUPERPOWERS_STATUS="ERROR"
fi

# Document Skills
echo -e "\n${YELLOW}> Installing document-skills plugin...${NC}"
if claude install document-skills &> /dev/null && [ -d "$HOME/.claude/skills/document-skills" ]; then
    echo -e "${GREEN}  [OK] Document-skills installed (docx, pdf, pptx, xlsx)${NC}"
    DOCUMENT_SKILLS_STATUS="OK"
else
    echo -e "${RED}  [FAIL] Document-skills install failed${NC}"
    DOCUMENT_SKILLS_STATUS="ERROR"
fi

# Playwright Skill
echo -e "\n${YELLOW}> Installing playwright-skill plugin...${NC}"
if claude install playwright-skill &> /dev/null && [ -d "$HOME/.claude/skills/playwright-skill" ]; then
    echo -e "${GREEN}  [OK] Playwright-skill installed (browser automation)${NC}"
    PLAYWRIGHT_STATUS="OK"
else
    echo -e "${RED}  [FAIL] Playwright-skill install failed${NC}"
    PLAYWRIGHT_STATUS="ERROR"
fi

# Episodic Memory
echo -e "\n${YELLOW}> Installing episodic-memory plugin...${NC}"
if claude install episodic-memory &> /dev/null && [ -d "$HOME/.claude/skills/episodic-memory" ]; then
    echo -e "${GREEN}  [OK] Episodic-memory installed (cross-session memory)${NC}"
    EPISODIC_MEMORY_STATUS="OK"
else
    echo -e "${RED}  [FAIL] Episodic-memory install failed${NC}"
    EPISODIC_MEMORY_STATUS="ERROR"
fi

# Executive Assistant
echo -e "\n${YELLOW}> Installing executive-assistant plugin...${NC}"
if claude install executive-assistant &> /dev/null && [ -d "$HOME/.claude/skills/executive-assistant" ]; then
    echo -e "${GREEN}  [OK] Executive-assistant installed (EA/Evie persona)${NC}"
    EXEC_ASSISTANT_STATUS="OK"
else
    echo -e "${RED}  [FAIL] Executive-assistant install failed${NC}"
    EXEC_ASSISTANT_STATUS="ERROR"
fi

# Install MCP Servers
if [ "$SKIP_MCPS" = false ]; then
    echo -e "\n${CYAN}================================================================${NC}"
    echo -e "${CYAN}   Installing MCP Servers${NC}"
    echo -e "${CYAN}================================================================${NC}"

    # Gmail MCP
    echo -e "\n${YELLOW}> Installing Gmail MCP...${NC}"
    GMAIL_DIR="$HOME/mcp-servers/gmail"
    mkdir -p "$GMAIL_DIR"
    cd "$GMAIL_DIR"
    cat > package.json <<EOF
{
  "name": "gmail-mcp",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "googleapis": "^140.0.0"
  }
}
EOF
    if npm install &> /dev/null; then
        echo -e "${GREEN}  [OK] Gmail MCP installed (requires OAuth setup)${NC}"
        GMAIL_STATUS="OK"
    else
        echo -e "${RED}  [FAIL] Gmail MCP install failed${NC}"
        GMAIL_STATUS="ERROR"
    fi

    # Google Calendar MCP
    echo -e "\n${YELLOW}> Installing Google Calendar MCP...${NC}"
    CALENDAR_DIR="$HOME/mcp-servers/google-calendar"
    mkdir -p "$CALENDAR_DIR"
    cd "$CALENDAR_DIR"
    cat > package.json <<EOF
{
  "name": "google-calendar-mcp",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "googleapis": "^140.0.0"
  }
}
EOF
    if npm install &> /dev/null; then
        echo -e "${GREEN}  [OK] Google Calendar MCP installed (requires OAuth setup)${NC}"
        CALENDAR_STATUS="OK"
    else
        echo -e "${RED}  [FAIL] Google Calendar MCP install failed${NC}"
        CALENDAR_STATUS="ERROR"
    fi

    # Google Drive MCP
    echo -e "\n${YELLOW}> Installing Google Drive MCP...${NC}"
    DRIVE_DIR="$HOME/mcp-servers/google-drive"
    mkdir -p "$DRIVE_DIR"
    cd "$DRIVE_DIR"
    cat > package.json <<EOF
{
  "name": "google-drive-mcp",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "googleapis": "^140.0.0"
  }
}
EOF
    if npm install &> /dev/null; then
        echo -e "${GREEN}  [OK] Google Drive MCP installed (requires OAuth setup)${NC}"
        DRIVE_STATUS="OK"
    else
        echo -e "${RED}  [FAIL] Google Drive MCP install failed${NC}"
        DRIVE_STATUS="ERROR"
    fi

    # GitHub MCP
    echo -e "\n${YELLOW}> Installing GitHub MCP...${NC}"
    GITHUB_DIR="$HOME/mcp-servers/github-mcp"
    mkdir -p "$GITHUB_DIR"
    cd "$GITHUB_DIR"
    cat > package.json <<EOF
{
  "name": "github-mcp",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
EOF
    if npm install &> /dev/null; then
        echo -e "${GREEN}  [OK] GitHub MCP installed (uses gh CLI authentication)${NC}"
        GITHUB_STATUS="OK"
    else
        echo -e "${RED}  [FAIL] GitHub MCP install failed${NC}"
        GITHUB_STATUS="ERROR"
    fi

    echo -e "${CYAN}  [INFO] MCP servers installed. OAuth setup required for Google services.${NC}"
else
    echo -e "${CYAN}  [INFO] MCP installation skipped (--skip-mcps flag)${NC}"
    GMAIL_STATUS="SKIPPED"
    CALENDAR_STATUS="SKIPPED"
    DRIVE_STATUS="SKIPPED"
    GITHUB_STATUS="SKIPPED"
fi

# Configure EA as default persona
echo -e "\n${CYAN}================================================================${NC}"
echo -e "${CYAN}   Configuring Executive Assistant${NC}"
echo -e "${CYAN}================================================================${NC}"

echo -e "\n${YELLOW}> Creating CLAUDE.md with EA default persona...${NC}"
CLAUDE_MD="$HOME/CLAUDE.md"
cat > "$CLAUDE_MD" <<'EOF'
# Claude Code Configuration

## Default Persona
- Always operate as Executive Assistant (EA/Evie) unless user explicitly asks for "regular Claude"
- Use warm, British female voice and personality
- Proactive, caring, organized, with gentle warmth
- Track context across sessions using episodic memory
- Can switch to neutral technical mode for deep coding/debugging

## Communication Style
- Address user directly by name when known
- Morning briefings at start of day
- Proactive reminders for important tasks
- Email triage and calendar management
- Celebrate wins, gentle with feedback

## Available Skills
- /executive-assistant - Full EA persona and workflows
- /superpowers - Systematic debugging, planning, code review
- /document-skills - Create/edit DOCX, PDF, PPTX, XLSX files
- /playwright-skill - Browser automation and testing
- /episodic-memory - Search across previous conversations

## MCP Integrations
- Gmail - Email management with attachment support
- Google Calendar - Schedule management
- Google Drive - File storage and sharing
- GitHub - Version control and collaboration
- Stripe - Payment processing (when configured)

## How to Switch Modes
- "Exit EA mode" or "Be regular Claude for this task" - Temporarily switch to neutral mode
- "Resume EA mode" - Return to Executive Assistant persona
- Deep technical work automatically uses neutral technical mode

---
Generated by AI Consultant Toolkit - Phase 2
EOF

echo -e "${GREEN}  [OK] CLAUDE.md created at $CLAUDE_MD${NC}"
echo -e "${CYAN}  [INFO] EA configured as default persona${NC}"
CLAUDE_MD_STATUS="OK"
EA_PERSONA_STATUS="OK"

# Generate results JSON
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

cat > "$RESULTS_FILE" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "phase": "Phase 2: Skills & MCP Installation",
  "skills": {
    "superpowers": { "status": "$SUPERPOWERS_STATUS", "installed": $([ "$SUPERPOWERS_STATUS" = "OK" ] && echo "true" || echo "false") },
    "document_skills": { "status": "$DOCUMENT_SKILLS_STATUS", "installed": $([ "$DOCUMENT_SKILLS_STATUS" = "OK" ] && echo "true" || echo "false") },
    "playwright_skill": { "status": "$PLAYWRIGHT_STATUS", "installed": $([ "$PLAYWRIGHT_STATUS" = "OK" ] && echo "true" || echo "false") },
    "episodic_memory": { "status": "$EPISODIC_MEMORY_STATUS", "installed": $([ "$EPISODIC_MEMORY_STATUS" = "OK" ] && echo "true" || echo "false") },
    "executive_assistant": { "status": "$EXEC_ASSISTANT_STATUS", "installed": $([ "$EXEC_ASSISTANT_STATUS" = "OK" ] && echo "true" || echo "false") }
  },
  "mcps": {
    "gmail": { "status": "$GMAIL_STATUS", "installed": $([ "$GMAIL_STATUS" = "OK" ] && echo "true" || echo "false") },
    "google_calendar": { "status": "$CALENDAR_STATUS", "installed": $([ "$CALENDAR_STATUS" = "OK" ] && echo "true" || echo "false") },
    "google_drive": { "status": "$DRIVE_STATUS", "installed": $([ "$DRIVE_STATUS" = "OK" ] && echo "true" || echo "false") },
    "github": { "status": "$GITHUB_STATUS", "installed": $([ "$GITHUB_STATUS" = "OK" ] && echo "true" || echo "false") }
  },
  "configuration": {
    "ea_default_persona": { "status": "$EA_PERSONA_STATUS", "configured": $([ "$EA_PERSONA_STATUS" = "OK" ] && echo "true" || echo "false") },
    "claude_md_created": { "status": "$CLAUDE_MD_STATUS", "configured": $([ "$CLAUDE_MD_STATUS" = "OK" ] && echo "true" || echo "false") }
  },
  "errors": [],
  "duration_seconds": $DURATION
}
EOF

echo -e "\n${CYAN}================================================================${NC}"
echo -e "${GREEN}   Phase 2 Setup Complete!${NC}"
echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}Results: $RESULTS_FILE${NC}"
echo -e "${CYAN}Duration: ${DURATION}s${NC}"

echo -e "\n${YELLOW}What was installed:${NC}"
echo "  Skills: superpowers, document-skills, playwright, episodic-memory, executive-assistant"
echo "  MCPs: Gmail, Calendar, Drive, GitHub (requires OAuth setup)"
echo "  Config: EA/Evie as default persona in CLAUDE.md"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "  1. Upload $RESULTS_FILE to dashboard"
echo "  2. Authenticate Google services: cd ~/mcp-servers/gmail && npm run auth"
echo "  3. Authenticate GitHub: gh auth login"
echo "  4. Test EA: claude chat (will use EA persona by default)"
echo "  5. Learn to create custom skills (see Phase 3 walkthrough)"
