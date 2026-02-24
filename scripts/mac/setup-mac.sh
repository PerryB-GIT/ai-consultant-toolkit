#!/bin/bash
# Usage: bash setup-mac.sh [--skills-repo <url>]
#   --skills-repo   HTTPS URL of the client's private skills repo
#                   Defaults to the Support Forge template repo
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

# Parse optional --skills-repo argument
while [[ $# -gt 0 ]]; do
    case $1 in
        --skills-repo) SKILLS_REPO_URL="$2"; shift 2 ;;
        *) shift ;;
    esac
done

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

declare -A TOOL_RESULTS

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error() { echo -e "${RED}[ERR]${NC} $1"; ERRORS+=("$1"); }

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
        brew) brew --version 2>/dev/null | head -1 | awk '{print $2}' || echo "null" ;;
        git) git --version 2>/dev/null | awk '{print $3}' || echo "null" ;;
        gh) gh --version 2>/dev/null | head -1 | awk '{print $3}' || echo "null" ;;
        node) node --version 2>/dev/null | sed 's/v//' || echo "null" ;;
        python) python3 --version 2>/dev/null | awk '{print $2}' || echo "null" ;;
        claude) claude --version 2>/dev/null || echo "null" ;;
        docker) docker --version 2>/dev/null | awk '{print $3}' | sed 's/,//' || echo "null" ;;
    esac
}

# Homebrew
log_info "Checking Homebrew..."
if command -v brew &> /dev/null; then
    V=$(get_version brew)
    log_success "Homebrew installed ($V)"
    add_result "homebrew" "OK" "$V" "false"
else
    log_info "Installing Homebrew..."
    export NONINTERACTIVE=1
    if /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"; then
        [[ "$ARCH" == "arm64" ]] && eval "$(/opt/homebrew/bin/brew shellenv)"
        V=$(get_version brew)
        log_success "Homebrew installed ($V)"
        add_result "homebrew" "OK" "$V" "true"
    else
        log_error "Homebrew install failed"
        add_result "homebrew" "ERR" "null" "false"
    fi
fi
export PATH="$HOMEBREW_PREFIX/bin:$PATH"

# Git
log_info "Checking Git..."
if command -v git &> /dev/null; then
    V=$(get_version git)
    log_success "Git installed ($V)"
    add_result "git" "OK" "$V" "false"
else
    brew install git && V=$(get_version git) && log_success "Git installed ($V)" && add_result "git" "OK" "$V" "true" || { log_error "Git install failed"; add_result "git" "ERR" "null" "false"; }
fi

# GitHub CLI
log_info "Checking GitHub CLI..."
if command -v gh &> /dev/null; then
    V=$(get_version gh)
    log_success "GitHub CLI installed ($V)"
    add_result "github_cli" "OK" "$V" "false"
else
    brew install gh && V=$(get_version gh) && log_success "GitHub CLI installed ($V)" && add_result "github_cli" "OK" "$V" "true" || { log_error "GitHub CLI install failed"; add_result "github_cli" "ERR" "null" "false"; }
fi

# Node.js
log_info "Checking Node.js..."
if command -v node &> /dev/null; then
    V=$(get_version node)
    log_success "Node.js installed ($V)"
    add_result "nodejs" "OK" "$V" "false"
else
    brew install node && V=$(get_version node) && log_success "Node.js installed ($V)" && add_result "nodejs" "OK" "$V" "true" || { log_error "Node.js install failed"; add_result "nodejs" "ERR" "null" "false"; }
fi

# Python
log_info "Checking Python..."
if command -v python3 &> /dev/null; then
    V=$(get_version python)
    log_success "Python installed ($V)"
    add_result "python" "OK" "$V" "false"
else
    brew install python@3.12 && V=$(python3.12 --version | awk '{print $2}') && log_success "Python installed ($V)" && add_result "python" "OK" "$V" "true" || { log_error "Python install failed"; add_result "python" "ERR" "null" "false"; }
fi

# Claude Code
log_info "Checking Claude Code..."
if command -v claude &> /dev/null; then
    V=$(get_version claude)
    log_success "Claude Code installed ($V)"
    add_result "claude" "OK" "$V" "false"
else
    npm install -g @anthropic-ai/claude-code && V=$(get_version claude) && log_success "Claude Code installed ($V)" && add_result "claude" "OK" "$V" "true" || { log_error "Claude Code install failed"; add_result "claude" "ERR" "null" "false"; }
fi

# Docker
log_info "Checking Docker..."
if command -v docker &> /dev/null; then
    V=$(get_version docker)
    log_success "Docker installed ($V)"
    add_result "docker" "OK" "$V" "false"
else
    add_result "docker" "skipped" "null" "false"
fi

# ── Skills Install ──────────────────────────────────────────────────────────
# Skills step runs outside set -e scope so a clone failure doesn't abort the whole script.
log_info "Installing Claude Code skills..."
SKILLS_DIR="$HOME/.claude/skills"
CLONE_DIR="$(mktemp -d)/support-forge-toolkit"
SKILLS_INSTALLED=0
SKILLS_OK=false

if ! command -v git &>/dev/null; then
    log_error "git not found — skills install skipped"
    add_result "skills" "ERR" "null" "false"
else
    # ── Auth strategy ──────────────────────────────────────────────────────
    # Use gh CLI authenticated clone for private repos if gh is authed.
    # Fall back to plain git clone (works for public repos or with macOS Keychain).
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
            for skill_dir in "$SOURCE_SKILLS"/*/; do
                skill_name="$(basename "$skill_dir")"
                if [ ! -d "$SKILLS_DIR/$skill_name" ]; then
                    cp -r "$skill_dir" "$SKILLS_DIR/$skill_name"
                    SKILLS_INSTALLED=$((SKILLS_INSTALLED + 1))
                fi
            done
            rm -rf "$CLONE_DIR"
            log_success "$SKILLS_INSTALLED skills installed to $SKILLS_DIR"
            add_result "skills" "OK" "${SKILLS_INSTALLED} skills" "true"
            SKILLS_OK=true
        else
            log_error "skills/ directory not found in cloned repo"
            add_result "skills" "ERR" "null" "false"
        fi
    else
        log_error "Could not clone skills repo. Run 'gh auth login' then re-run this script."
        add_result "skills" "ERR" "null" "false"
    fi
fi

# Generate JSON
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

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
echo -e "${GREEN}Setup complete!${NC} Results: $RESULTS_FILE"
echo "Duration: ${DURATION}s"
echo ""
echo "Next steps:"
echo "  1. Run: source ~/.zprofile  (reload PATH)"
echo "  2. Run: gh auth login        (authenticate with GitHub)"
echo "  3. Run: claude               (open Claude Code and set your API key)"

if [ "$SKILLS_OK" = false ]; then
    echo ""
    echo -e "${YELLOW}[!] Skills were not installed.${NC}"
    echo "    After completing steps 1-2, re-run:"
    echo "    bash setup-mac.sh --skills-repo $SKILLS_REPO_URL"
fi
