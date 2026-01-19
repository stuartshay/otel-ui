#!/bin/bash
# =============================================================================
# otel-ui Development Environment Setup
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}otel-ui Setup${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

# Required Node.js version
REQUIRED_NODE_VERSION="24"

# Check git
echo -e "${YELLOW}Checking git...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed${NC}"
    echo "Install git: https://git-scm.com/downloads"
    exit 1
fi
GIT_VERSION=$(git --version)
echo -e "${GREEN}✓ ${GIT_VERSION}${NC}"
echo ""

# Check if nvm is installed
echo -e "${YELLOW}Checking nvm...${NC}"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    # shellcheck source=/dev/null
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    echo -e "${GREEN}✓ nvm found${NC}"
    
    # Check if Node.js 24 is installed by trying to use it
    echo -e "${YELLOW}Checking for Node.js ${REQUIRED_NODE_VERSION}...${NC}"
    if ! nvm use --delete-prefix ${REQUIRED_NODE_VERSION} &>/dev/null; then
        echo -e "${YELLOW}Installing Node.js ${REQUIRED_NODE_VERSION} LTS...${NC}"
        nvm install ${REQUIRED_NODE_VERSION}
        nvm use --delete-prefix ${REQUIRED_NODE_VERSION}
        echo -e "${GREEN}✓ Node.js ${REQUIRED_NODE_VERSION} installed and activated${NC}"
    else
        echo -e "${GREEN}✓ Node.js ${REQUIRED_NODE_VERSION} already installed${NC}"
        nvm use --delete-prefix ${REQUIRED_NODE_VERSION}
        echo -e "${GREEN}✓ Switched to Node.js ${REQUIRED_NODE_VERSION}${NC}"
    fi
else
    echo -e "${YELLOW}⚠ nvm not found${NC}"
    echo "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
    
    # Load nvm for current session
    export NVM_DIR="$HOME/.nvm"
    # shellcheck source=/dev/null
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        echo -e "${GREEN}✓ nvm installed${NC}"
        echo -e "${YELLOW}Installing Node.js ${REQUIRED_NODE_VERSION} LTS...${NC}"
        nvm install ${REQUIRED_NODE_VERSION}
        nvm use --delete-prefix ${REQUIRED_NODE_VERSION}
        echo -e "${GREEN}✓ Node.js ${REQUIRED_NODE_VERSION} installed and activated${NC}"
    else
        echo -e "${RED}Error: Failed to install nvm${NC}"
        echo "Please install nvm manually: https://github.com/nvm-sh/nvm"
        exit 1
    fi
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Verify Node.js version
NODE_MAJOR=$(node --version | cut -d. -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_VERSION" ]; then
    echo -e "${RED}Error: Node.js ${REQUIRED_NODE_VERSION}.x or higher is required${NC}"
    echo "Current version: ${NODE_VERSION}"
    echo "Please run: nvm install ${REQUIRED_NODE_VERSION} && nvm use ${REQUIRED_NODE_VERSION}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"
echo ""

# Check shellcheck
echo -e "${YELLOW}Checking shellcheck...${NC}"
if command -v shellcheck &> /dev/null; then
    SHELLCHECK_VERSION=$(shellcheck --version | grep version: | awk '{print $2}')
    echo -e "${GREEN}✓ shellcheck ${SHELLCHECK_VERSION}${NC}"
else
    echo -e "${YELLOW}⚠ shellcheck not found, attempting to install...${NC}"
    
    # Detect OS and install
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "Installing with Homebrew..."
            brew install shellcheck
        else
            echo -e "${RED}Error: Homebrew not found${NC}"
            echo "Install Homebrew from: https://brew.sh/"
            echo "Then run: brew install shellcheck"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            echo "Installing with apt-get..."
            sudo apt-get update && sudo apt-get install -y shellcheck
        elif command -v pacman &> /dev/null; then
            echo "Installing with pacman..."
            sudo pacman -S --noconfirm shellcheck
        elif command -v dnf &> /dev/null; then
            echo "Installing with dnf..."
            sudo dnf install -y shellcheck
        else
            echo -e "${YELLOW}⚠ Unable to auto-install shellcheck${NC}"
            echo "Download from: https://github.com/koalaman/shellcheck"
        fi
    else
        echo -e "${YELLOW}⚠ Unsupported OS for auto-install${NC}"
        echo "Download from: https://github.com/koalaman/shellcheck"
    fi
    
    # Verify installation
    if command -v shellcheck &> /dev/null; then
        SHELLCHECK_VERSION=$(shellcheck --version | grep version: | awk '{print $2}')
        echo -e "${GREEN}✓ shellcheck ${SHELLCHECK_VERSION} installed${NC}"
    else
        echo -e "${YELLOW}⚠ shellcheck installation failed or skipped${NC}"
    fi
fi
echo ""

# Install dependencies
echo -e "${YELLOW}Installing npm dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}Error: Failed to install npm dependencies${NC}"
    exit 1
fi
echo ""

# Initialize Husky
echo -e "${YELLOW}Setting up Husky git hooks...${NC}"
if npm run prepare &>/dev/null; then
    echo -e "${GREEN}✓ Husky initialized${NC}"
    
    # Verify pre-commit hook exists
    if [ -f .husky/pre-commit ]; then
        chmod +x .husky/pre-commit
        echo -e "${GREEN}✓ Pre-commit hook configured${NC}"
        echo -e "  Hooks enabled: ESLint + Prettier + markdownlint + shellcheck on staged files"
    else
        echo -e "${YELLOW}⚠ Pre-commit hook not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Husky initialization failed${NC}"
fi
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local from .env.example...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
    echo -e "${YELLOW}⚠ Please review and update .env.local with your configuration${NC}"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi
echo ""

# Git hooks (if using pre-commit)
if [ -f .pre-commit-config.yaml ]; then
    echo -e "${YELLOW}Setting up Python pre-commit hooks...${NC}"
    if command -v pre-commit &> /dev/null; then
        pre-commit install
        echo -e "${GREEN}✓ Python pre-commit hooks installed${NC}"
    else
        echo -e "${YELLOW}⚠ pre-commit not found, skipping Python hooks${NC}"
        echo "  Install with: pip install pre-commit"
    fi
    echo ""
fi

# Verify critical tools
echo -e "${YELLOW}Verifying installation...${NC}"
MISSING_TOOLS=()

if ! npm list husky &>/dev/null; then
    MISSING_TOOLS+=("husky")
fi

if ! npm list lint-staged &>/dev/null; then
    MISSING_TOOLS+=("lint-staged")
fi

if ! npm list prettier &>/dev/null; then
    MISSING_TOOLS+=("prettier")
fi

if ! npm list eslint &>/dev/null; then
    MISSING_TOOLS+=("eslint")
fi

if ! npm list typescript &>/dev/null; then
    MISSING_TOOLS+=("typescript")
fi

if ! npm list markdownlint-cli2 &>/dev/null; then
    MISSING_TOOLS+=("markdownlint-cli2")
fi

if [ ${#MISSING_TOOLS[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All required tools installed:${NC}"
    echo "  - Husky (git hooks)"
    echo "  - lint-staged (staged file linting)"
    echo "  - Prettier (code formatter)"
    echo "  - ESLint (code linter)"
    echo "  - TypeScript (type checker)"
    echo "  - markdownlint-cli2 (markdown linter)"
else
    echo -e "${RED}⚠ Missing tools: ${MISSING_TOOLS[*]}${NC}"
    echo "Run: npm install"
fi
echo ""

# Summary
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Review .env.local configuration"
echo "  2. Run dev server: npm run dev"
echo "  3. Build for production: npm run build"
echo ""
echo "Development Commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run preview      - Preview production build"
echo ""
echo "Code Quality Commands:"
echo "  npm run lint         - Run ESLint"
echo "  npm run lint:fix     - Fix ESLint issues automatically"
echo "  npm run lint:md      - Lint markdown files"
echo "  npm run lint:md:fix  - Fix markdown lint issues"
echo "  npm run lint:sh      - Lint shell scripts with shellcheck"
echo "  npm run lint:all     - Run all linters"
echo "  npm run format       - Format code with Prettier"
echo "  npm run format:check - Check code formatting"
echo "  npm run type-check   - TypeScript type checking"
echo ""
echo "Git Hooks:"
echo "  Pre-commit: Automatically runs ESLint + Prettier + markdownlint + shellcheck"
echo ""
echo "Environment:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  nvm: To switch versions use 'nvm use 24'"
if command -v shellcheck &> /dev/null; then
    echo "  shellcheck: $(shellcheck --version | grep version: | awk '{print $2}')"
fi
echo ""
