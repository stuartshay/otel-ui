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

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Install Node.js 20.x: https://nodejs.org/"
    echo "Recommended: Use nvm (Node Version Manager)"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}Installing npm dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
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
    echo -e "${YELLOW}Setting up pre-commit hooks...${NC}"
    if command -v pre-commit &> /dev/null; then
        pre-commit install
        echo -e "${GREEN}✓ Pre-commit hooks installed${NC}"
    else
        echo -e "${YELLOW}⚠ pre-commit not found, skipping hooks setup${NC}"
        echo "  Install with: pip install pre-commit"
    fi
    echo ""
fi

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
echo "Commands:"
echo "  npm run dev        - Start development server"
echo "  npm run build      - Build for production"
echo "  npm run preview    - Preview production build"
echo "  npm run lint       - Run ESLint"
echo "  npx tsc --noEmit   - TypeScript type check"
echo ""
