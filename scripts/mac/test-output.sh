#!/bin/bash

# Visual test script - Shows what setup-mac.sh output looks like
# This doesn't actually install anything

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AI Consultant Toolkit - macOS Setup                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}System Info:${NC}"
echo -e "  OS: macOS 14.2 (Apple Silicon)"
echo -e "  Architecture: arm64"
echo ""

echo -e "${BLUE}[INFO]${NC} Checking Homebrew installation..."
sleep 0.5
echo -e "${GREEN}[✓]${NC} Homebrew already installed (version 5.0.13)"

echo -e "${BLUE}[INFO]${NC} Checking Git installation..."
sleep 0.5
echo -e "${GREEN}[✓]${NC} Git already installed (version 2.52.0)"

echo -e "${BLUE}[INFO]${NC} Checking GitHub CLI installation..."
sleep 0.5
echo -e "${BLUE}[INFO]${NC} Installing GitHub CLI via Homebrew..."
sleep 1.5
echo -e "${GREEN}[✓]${NC} GitHub CLI installed successfully (version 2.86.0)"
echo -e "${BLUE}[INFO]${NC} Run 'gh auth login' to authenticate with GitHub"

echo -e "${BLUE}[INFO]${NC} Checking Node.js installation..."
sleep 0.5
echo -e "${BLUE}[INFO]${NC} Installing Node.js LTS via Homebrew..."
sleep 2
echo -e "${GREEN}[✓]${NC} Node.js installed successfully (version 22.1.0)"

echo -e "${BLUE}[INFO]${NC} Checking Python installation..."
sleep 0.5
echo -e "${GREEN}[✓]${NC} Python 3.12 already installed (version 3.12.12)"

echo -e "${BLUE}[INFO]${NC} Checking Claude Code CLI installation..."
sleep 0.5
echo -e "${BLUE}[INFO]${NC} Installing Claude Code CLI via npm..."
sleep 2.5
echo -e "${GREEN}[✓]${NC} Claude Code CLI installed successfully (version 2.1.37)"
echo -e "${BLUE}[INFO]${NC} Run 'claude auth' to authenticate with your API key"

echo -e "${BLUE}[INFO]${NC} Checking Docker installation..."
sleep 0.5
echo -e "${BLUE}[INFO]${NC} Skipping Docker installation"

echo -e "${BLUE}[INFO]${NC} Generating results file..."
sleep 0.5

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Setup Complete!                                        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Results saved to:${NC} ~/setup-results.json"
echo -e "${GREEN}Duration:${NC} 42s"
echo ""
echo -e "${GREEN}✓ All tools installed successfully!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Upload ${YELLOW}~/setup-results.json${NC} to the AI Consultant Toolkit dashboard"
echo -e "  2. Restart your terminal or run: ${YELLOW}source ~/.zprofile${NC}"
echo -e "  3. Authenticate GitHub CLI: ${YELLOW}gh auth login${NC}"
echo -e "  4. Authenticate Claude Code: ${YELLOW}claude auth${NC}"
echo ""
echo -e "${YELLOW}Apple Silicon Note:${NC}"
echo -e "  Homebrew is installed at: ${YELLOW}/opt/homebrew${NC}"
echo -e "  Your PATH has been updated in ~/.zprofile"
echo ""
echo -e "${GREEN}[✓]${NC} Setup script completed!"
