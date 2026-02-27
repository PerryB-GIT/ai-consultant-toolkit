#!/bin/bash
# Usage: bash setup-mac.sh [--skills-repo <url>] [--session-id <id>]
#   --skills-repo   HTTPS URL of the client's private skills repo
#                   Defaults to the Support Forge template repo
#   --session-id    Session ID from the live dashboard (auto-generated if not provided)
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

START_TIME=$(date +%s)
RESULTS_FILE="$HOME/setup-results.json"
ERRORS=()

SKILLS_REPO_URL="https://github.com/PerryB-GIT/client-toolkit-template.git"
SESSION_ID=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skills-repo) SKILLS_REPO_URL="$2"; shift 2 ;;
        --session-id)  SESSION_ID="$2";       shift 2 ;;
        *) shift ;;
    esac
done

# Generate session ID if not provided
if [[ -z "$SESSION_ID" ]]; then
    SESSION_ID="setup-$(date +%s)-$(LC_ALL=C tr -dc 'a-z0-9' </dev/urandom 2>/dev/null | head -c 6 || echo "mac001")"
fi

API_URL="https://ai-consultant-toolkit.vercel.app/api/progress/$SESSION_ID"

OS_VERSION=$(sw_vers -productVersion)
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]]; then
    ARCH_NAME="Apple Silicon"
    HOMEBREW_PREFIX="/opt/homebrew"
else
    ARCH_NAME="Intel"
    HOMEBREW_PREFIX="/usr/local"
fi

echo -e "${BLUE}AI Consultant Toolkit - macOS Setup${NC}"
echo -e "${GREEN}System:${NC} macOS $OS_VERSION ($ARCH_NAME)"
echo ""
echo "=================================================="
echo "  Watch Live Progress:"
echo "  https://ai-consultant-toolkit.vercel.app/setup"
echo "  Session: $SESSION_ID"
echo "=================================================="
echo ""

declare -A TOOL_RESULTS
declare -A TOOL_STATUS_MAP
CURRENT_STEP=0
COMPLETED_STEPS=()

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error()   { echo -e "${RED}[ERR]${NC} $1"; ERRORS+=("$1"); }

add_result() {
    local tool=$1 status=$2 version=$3 installed=$4
    if [[ "$version" == "null" ]]; then
        TOOL_RESULTS[$tool]="{\"status\": \"$status\", \"version\": null, \"installed\": $installed}"
    else
        TOOL_RESULTS[$tool]="{\"status\": \"$status\", \"version\": \"$version\", \"installed\": $installed}"
    fi
}

get_version() {
    case $1 in
        brew)   brew --version 2>/dev/null | head -1 | awk '{print $2}' || echo "null" ;;
        git)    git --version 2>/dev/null | awk '{print $3}' || echo "null" ;;
        gh)     gh --version 2>/dev/null | head -1 | awk '{print $3}' || echo "null" ;;
        node)   node --version 2>/dev/null | sed 's/v//' || echo "null" ;;
        python) python3 --version 2>/dev/null | awk '{print $2}' || echo "null" ;;
        claude) claude --version 2>/dev/null || echo "null" ;;
        docker) docker --version 2>/dev/null | awk '{print $3}' | sed 's/,//' || echo "null" ;;
    esac
}

# Build tool_status JSON from TOOL_STATUS_MAP
build_tool_status_json() {
    local json="{"
    local first=true
    for key in homebrew git github_cli nodejs python claude docker skills; do
        [[ -z "${TOOL_STATUS_MAP[$key]}" ]] && continue
        $first || json+=","
        json+="\"$key\": ${TOOL_STATUS_MAP[$key]}"
        first=false
    done
    json+="}"
    echo "$json"
}

# Build completed_steps JSON array
build_steps_json() {
    local json="["
    local first=true
    for step in "${COMPLETED_STEPS[@]}"; do
        $first || json+=","
        json+="$step"
        first=false
    done
    json+="]"
    echo "$json"
}

# Build errors JSON (API requires: tool, error, suggestedFix)
ERRORS_STRUCTURED=()

add_error_structured() {
    local tool="$1" error_msg="$2" fix="$3"
    local escaped_error escaped_fix
    escaped_error=$(echo "$error_msg" | sed 's/"/\\"/g' | tr '\n' ' ')
    escaped_fix=$(echo "$fix" | sed 's/"/\\"/g')
    ERRORS_STRUCTURED+=("{\"tool\": \"$tool\", \"error\": \"$escaped_error\", \"suggestedFix\": \"$escaped_fix\"}")
}

build_errors_json() {
    local json="["
    local first=true
    for err in "${ERRORS_STRUCTURED[@]}"; do
        $first || json+=","
        json+="$err"
        first=false
    done
    json+="]"
    echo "$json"
}

send_progress() {
    local step="$1" action="$2" complete="${3:-false}"
    local tool_status_json steps_json errors_json
    tool_status_json=$(build_tool_status_json)
    steps_json=$(build_steps_json)
    errors_json=$(build_errors_json)

    local payload="{\"sessionId\": \"$SESSION_ID\", \"currentStep\": $step, \"completedSteps\": $steps_json, \"currentAction\": \"$action\", \"toolStatus\": $tool_status_json, \"errors\": $errors_json, \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\", \"phase\": \"phase1\", \"complete\": $complete}"

    curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        --max-time 5 \
        --retry 0 \
        -o /dev/null 2>/dev/null || true
}

# ── Homebrew ──────────────────────────────────────────────────────────────
CURRENT_STEP=1
TOOL_STATUS_MAP["homebrew"]="{\"status\": \"installing\", \"version\": null}"
send_progress "$CURRENT_STEP" "Checking Homebrew..."
log_info "Checking Homebrew..."

if command -v brew &> /dev/null; then
    V=$(get_version brew)
    log_success "Homebrew installed ($V)"
    add_result "homebrew" "OK" "$V" "false"
    TOOL_STATUS_MAP["homebrew"]="{\"status\": \"success\", \"version\": \"$V\"}"
else
    log_info "Installing Homebrew..."
    send_progress "$CURRENT_STEP" "Installing Homebrew..."
    export NONINTERACTIVE=1
    if /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"; then
        [[ "$ARCH" == "arm64" ]] && eval "$(/opt/homebrew/bin/brew shellenv)"
        V=$(get_version brew)
        log_success "Homebrew installed ($V)"
        add_result "homebrew" "OK" "$V" "true"
        TOOL_STATUS_MAP["homebrew"]="{\"status\": \"success\", \"version\": \"$V\"}"
    else
        log_error "Homebrew install failed"
        add_result "homebrew" "ERR" "null" "false"
        add_error_structured "homebrew" "Homebrew install failed" "Visit brew.sh and run the installer manually"
        TOOL_STATUS_MAP["homebrew"]="{\"status\": \"error\", \"version\": null, \"error\": \"Install failed\"}"
    fi
fi
export PATH="$HOMEBREW_PREFIX/bin:$PATH"
COMPLETED_STEPS+=("$CURRENT_STEP")
send_progress "$CURRENT_STEP" "Homebrew complete"

# ── Git ───────────────────────────────────────────────────────────────────
CURRENT_STEP=2
TOOL_STATUS_MAP["git"]="{\"status\": \"installing\", \"version\": null}"
send_progress "$CURRENT_STEP" "Checking Git..."
log_info "Checking Git..."

if command -v git &> /dev/null; then
    V=$(get_version git)
    log_success "Git installed ($V)"
    add_result "git" "OK" "$V" "false"
    TOOL_STATUS_MAP["git"]="{\"status\": \"success\", \"version\": \"$V\"}"
else
    send_progress "$CURRENT_STEP" "Installing Git..."
    if brew install git && V=$(get_version git); then
        log_success "Git installed ($V)"
        add_result "git" "OK" "$V" "true"
        TOOL_STATUS_MAP["git"]="{\"status\": \"success\", \"version\": \"$V\"}"
    else
        log_error "Git install failed"
        add_result "git" "ERR" "null" "false"
        add_error_structured "git" "Git install failed" "Try: brew install git"
        TOOL_STATUS_MAP["git"]="{\"status\": \"error\", \"version\": null, \"error\": \"Install failed\"}"
    fi
fi
COMPLETED_STEPS+=("$CURRENT_STEP")
send_progress "$CURRENT_STEP" "Git complete"

# ── GitHub CLI ────────────────────────────────────────────────────────────
CURRENT_STEP=3
TOOL_STATUS_MAP["github_cli"]="{\"status\": \"installing\", \"version\": null}"
send_progress "$CURRENT_STEP" "Checking GitHub CLI..."
log_info "Checking GitHub CLI..."

if command -v gh &> /dev/null; then
    V=$(get_version gh)
    log_success "GitHub CLI installed ($V)"
    add_result "github_cli" "OK" "$V" "false"
    TOOL_STATUS_MAP["github_cli"]="{\"status\": \"success\", \"version\": \"$V\"}"
else
    send_progress "$CURRENT_STEP" "Installing GitHub CLI..."
    if brew install gh && V=$(get_version gh); then
        log_success "GitHub CLI installed ($V)"
        add_result "github_cli" "OK" "$V" "true"
        TOOL_STATUS_MAP["github_cli"]="{\"status\": \"success\", \"version\": \"$V\"}"
    else
        log_error "GitHub CLI install failed"
        add_result "github_cli" "ERR" "null" "false"
        add_error_structured "github_cli" "GitHub CLI install failed" "Try: brew install gh"
        TOOL_STATUS_MAP["github_cli"]="{\"status\": \"error\", \"version\": null, \"error\": \"Install failed\"}"
    fi
fi
COMPLETED_STEPS+=("$CURRENT_STEP")
send_progress "$CURRENT_STEP" "GitHub CLI complete"

# ── Node.js ───────────────────────────────────────────────────────────────
CURRENT_STEP=4
TOOL_STATUS_MAP["nodejs"]="{\"status\": \"installing\", \"version\": null}"
send_progress "$CURRENT_STEP" "Checking Node.js..."
log_info "Checking Node.js..."

if command -v node &> /dev/null; then
    V=$(get_version node)
    log_success "Node.js installed ($V)"
    add_result "nodejs" "OK" "$V" "false"
    TOOL_STATUS_MAP["nodejs"]="{\"status\": \"success\", \"version\": \"$V\"}"
else
    send_progress "$CURRENT_STEP" "Installing Node.js..."
    if brew install node && V=$(get_version node); then
        log_success "Node.js installed ($V)"
        add_result "nodejs" "OK" "$V" "true"
        TOOL_STATUS_MAP["nodejs"]="{\"status\": \"success\", \"version\": \"$V\"}"
    else
        log_error "Node.js install failed"
        add_result "nodejs" "ERR" "null" "false"
        add_error_structured "nodejs" "Node.js install failed" "Try: brew install node OR download from nodejs.org"
        TOOL_STATUS_MAP["nodejs"]="{\"status\": \"error\", \"version\": null, \"error\": \"Install failed\"}"
    fi
fi
COMPLETED_STEPS+=("$CURRENT_STEP")
send_progress "$CURRENT_STEP" "Node.js complete"

# ── Python ────────────────────────────────────────────────────────────────
CURRENT_STEP=5
TOOL_STATUS_MAP["python"]="{\"status\": \"installing\", \"version\": null}"
send_progress "$CURRENT_STEP" "Checking Python..."
log_info "Checking Python..."

if command -v python3 &> /dev/null; then
    V=$(get_version python)
    log_success "Python installed ($V)"
    add_result "python" "OK" "$V" "false"
    TOOL_STATUS_MAP["python"]="{\"status\": \"success\", \"version\": \"$V\"}"
else
    send_progress "$CURRENT_STEP" "Installing Python..."
    if brew install python@3.12 && V=$(python3.12 --version 2>/dev/null | awk '{print $2}'); then
        log_success "Python installed ($V)"
        add_result "python" "OK" "$V" "true"
        TOOL_STATUS_MAP["python"]="{\"status\": \"success\", \"version\": \"$V\"}"
    else
        log_error "Python install failed"
        add_result "python" "ERR" "null" "false"
        add_error_structured "python" "Python install failed" "Try: brew install python@3.12"
        TOOL_STATUS_MAP["python"]="{\"status\": \"error\", \"version\": null, \"error\": \"Install failed\"}"
    fi
fi
COMPLETED_STEPS+=("$CURRENT_STEP")
send_progress "$CURRENT_STEP" "Python complete"

# ── Claude Code ───────────────────────────────────────────────────────────
CURRENT_STEP=7
TOOL_STATUS_MAP["claude"]="{\"status\": \"installing\", \"version\": null}"
send_progress "$CURRENT_STEP" "Checking Claude Code..."
log_info "Checking Claude Code..."

if command -v claude &> /dev/null; then
    V=$(get_version claude)
    log_success "Claude Code installed ($V)"
    add_result "claude" "OK" "$V" "false"
    TOOL_STATUS_MAP["claude"]="{\"status\": \"success\", \"version\": \"$V\"}"
else
    send_progress "$CURRENT_STEP" "Installing Claude Code..."
    if npm install -g @anthropic-ai/claude-code && V=$(get_version claude); then
        log_success "Claude Code installed ($V)"
        add_result "claude" "OK" "$V" "true"
        TOOL_STATUS_MAP["claude"]="{\"status\": \"success\", \"version\": \"$V\"}"
    else
        log_error "Claude Code install failed"
        add_result "claude" "ERR" "null" "false"
        add_error_structured "claude" "Claude Code install failed" "Ensure Node.js is installed. Try: npm install -g @anthropic-ai/claude-code"
        TOOL_STATUS_MAP["claude"]="{\"status\": \"error\", \"version\": null, \"error\": \"Install failed\"}"
    fi
fi
COMPLETED_STEPS+=("$CURRENT_STEP")
send_progress "$CURRENT_STEP" "Claude Code complete"

# ── Docker (check only, not installed) ───────────────────────────────────
CURRENT_STEP=8
if command -v docker &> /dev/null; then
    V=$(get_version docker)
    log_success "Docker already installed ($V)"
    add_result "docker" "OK" "$V" "false"
    TOOL_STATUS_MAP["docker"]="{\"status\": \"success\", \"version\": \"$V\"}"
else
    add_result "docker" "skipped" "null" "false"
    TOOL_STATUS_MAP["docker"]="{\"status\": \"skipped\", \"version\": null}"
fi
COMPLETED_STEPS+=("$CURRENT_STEP")
send_progress "$CURRENT_STEP" "Docker complete"

# ── Skills Install ────────────────────────────────────────────────────────
# Skills step runs outside set -e scope so a clone failure doesn't abort the whole script.
CURRENT_STEP=9
TOOL_STATUS_MAP["skills"]="{\"status\": \"installing\", \"version\": null}"
send_progress "$CURRENT_STEP" "Installing Claude Code skills..."
log_info "Installing Claude Code skills..."

SKILLS_DIR="$HOME/.claude/skills"
CLONE_DIR="$(mktemp -d)/support-forge-toolkit"
SKILLS_INSTALLED=0
SKILLS_OK=false

if ! command -v git &>/dev/null; then
    log_error "git not found — skills install skipped"
    add_result "skills" "ERR" "null" "false"
    add_error_structured "skills" "git not found" "Ensure Git was installed in a previous step"
    TOOL_STATUS_MAP["skills"]="{\"status\": \"error\", \"version\": null, \"error\": \"git not found\"}"
else
    CLONE_SUCCESS=false
    REPO_SLUG=""
    if [[ "$SKILLS_REPO_URL" =~ github\.com[:/](.+/.+?)(\.git)?$ ]]; then
        REPO_SLUG="${BASH_REMATCH[1]}"
    fi

    if [ -n "$REPO_SLUG" ] && command -v gh &>/dev/null && gh auth status &>/dev/null 2>&1; then
        log_info "Using gh CLI for authenticated clone..."
        if gh repo clone "$REPO_SLUG" "$CLONE_DIR" -- --depth 1 2>/dev/null; then
            CLONE_SUCCESS=true
        fi
    fi

    if [ "$CLONE_SUCCESS" = false ]; then
        log_info "Attempting git clone..."
        if git clone --depth 1 "$SKILLS_REPO_URL" "$CLONE_DIR" 2>/dev/null; then
            CLONE_SUCCESS=true
        fi
    fi

    if [ "$CLONE_SUCCESS" = true ]; then
        SOURCE_SKILLS="$CLONE_DIR/skills"
        if [ -d "$SOURCE_SKILLS" ]; then
            mkdir -p "$SKILLS_DIR"
            SKILL_TOTAL=$(find "$SOURCE_SKILLS" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
            SKILL_COUNT=0
            for skill_dir in "$SOURCE_SKILLS"/*/; do
                skill_name="$(basename "$skill_dir")"
                SKILL_COUNT=$((SKILL_COUNT + 1))
                TOOL_STATUS_MAP["skills"]="{\"status\": \"installing\", \"version\": \"Installing $SKILL_COUNT/$SKILL_TOTAL\"}"
                send_progress "$CURRENT_STEP" "Installing skill $SKILL_COUNT/$SKILL_TOTAL: $skill_name"
                if [ ! -d "$SKILLS_DIR/$skill_name" ]; then
                    cp -r "$skill_dir" "$SKILLS_DIR/$skill_name"
                    SKILLS_INSTALLED=$((SKILLS_INSTALLED + 1))
                fi
            done
            rm -rf "$CLONE_DIR"
            log_success "$SKILLS_INSTALLED skills installed to $SKILLS_DIR"
            add_result "skills" "OK" "${SKILLS_INSTALLED} skills" "true"
            TOOL_STATUS_MAP["skills"]="{\"status\": \"success\", \"version\": \"$SKILLS_INSTALLED skills\"}"
            SKILLS_OK=true
        else
            log_error "skills/ directory not found in cloned repo"
            add_result "skills" "ERR" "null" "false"
            add_error_structured "skills" "skills/ directory not found in cloned repo" "Contact perry@support-forge.com"
            TOOL_STATUS_MAP["skills"]="{\"status\": \"error\", \"version\": null, \"error\": \"skills/ not found\"}"
        fi
    else
        log_error "Could not clone skills repo. Run 'gh auth login' then re-run this script."
        add_result "skills" "ERR" "null" "false"
        add_error_structured "skills" "Could not clone skills repo" "Run: gh auth login — then re-run: bash setup-mac.sh --skills-repo $SKILLS_REPO_URL"
        TOOL_STATUS_MAP["skills"]="{\"status\": \"error\", \"version\": null, \"error\": \"Clone failed\"}"
    fi
fi
COMPLETED_STEPS+=("$CURRENT_STEP")
send_progress "$CURRENT_STEP" "Skills install complete"

# ── Final complete signal ─────────────────────────────────────────────────
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

send_progress "11" "Setup complete!" "true"

# ── Write local results JSON ──────────────────────────────────────────────
RESULTS_JSON="{"
for tool in homebrew git github_cli nodejs python claude docker skills; do
    [[ -n "${TOOL_RESULTS[$tool]}" ]] && RESULTS_JSON+="\"$tool\": ${TOOL_RESULTS[$tool]},"
done
RESULTS_JSON="${RESULTS_JSON%,}}"

ERRORS_JSON="["
for error in "${ERRORS[@]}"; do
    ERRORS_JSON+="\"$(echo "$error" | sed 's/"/\\"/g')\","
done
ERRORS_JSON="${ERRORS_JSON%,}]"

cat > "$RESULTS_FILE" << JSONFILE
{
  "os": "macOS $OS_VERSION ($ARCH_NAME)",
  "architecture": "$ARCH",
  "timestamp": "$TIMESTAMP",
  "results": $RESULTS_JSON,
  "errors": $ERRORS_JSON,
  "duration_seconds": $DURATION
}
JSONFILE

echo ""
echo -e "${GREEN}Setup complete!${NC} Duration: ${DURATION}s"
echo ""
echo "Next steps:"
echo "  1. Run: source ~/.zprofile  (reload PATH)"
echo "  2. Run: gh auth login        (authenticate with GitHub)"
echo "  3. Open a new terminal and run: claude"
echo "     Enter your Anthropic API key when prompted"
echo "  4. Inside Claude Code, type: /writing-emails"

if [ "$SKILLS_OK" = false ]; then
    echo ""
    echo -e "${YELLOW}[!] Skills were not installed.${NC}"
    echo "    After completing steps 1-2, re-run:"
    echo "    bash setup-mac.sh --skills-repo $SKILLS_REPO_URL"
fi

echo ""
echo "========================================"
echo " VERIFICATION"
echo "========================================"

for cmd in "git --version" "node --version" "gh --version" "claude --version"; do
    name=$(echo "$cmd" | awk '{print $1}')
    result=$(eval "$cmd" 2>/dev/null | head -1)
    if [ -n "$result" ]; then
        echo "  [OK] $name: $result"
    else
        echo "  [MISSING] $name - may need a new terminal"
    fi
done

echo ""
echo "Installation complete. Open a NEW terminal and type: claude"
