# Project Cleanup Guide

## Overview

This document tracks files in the otel-ui repository and identifies which are needed for production vs development/debugging.

**Last Updated**: January 20, 2026

---

## Core Application Files (Required)

### Source Code

- ✅ `src/` - All TypeScript/React source files
- ✅ `public/` - Static assets (vite.svg, silent-renew.html)
- ✅ `index.html` - Vite entry point
- ✅ `package.json` - Dependencies and scripts
- ✅ `package-lock.json` - Locked dependency versions

### Configuration Files

- ✅ `vite.config.ts` - Vite build configuration
- ✅ `tsconfig.json` - TypeScript compiler settings
- ✅ `tsconfig.app.json` - App-specific TypeScript config
- ✅ `tsconfig.node.json` - Node-specific TypeScript config
- ✅ `eslint.config.js` - ESLint linting rules
- ✅ `.prettierrc` - Code formatting rules
- ✅ `.prettierignore` - Prettier exclusions

### Docker/Deployment

- ✅ `Dockerfile` - Multi-stage build (Node → nginx)
- ✅ `nginx.conf` - nginx server configuration for SPA
- ✅ `.dockerignore` - Files excluded from Docker build
- ✅ `Makefile` - Build and development shortcuts

### Environment

- ✅ `.env` - Production environment variables (**committed**)
- ✅ `.env.example` - Template for documentation
- ⚠️ `.env.local` - Local development overrides (**gitignored**)

### Documentation

- ✅ `README.md` - Project overview
- ✅ `AGENTS.md` - Agent operating guide
- ✅ `.github/copilot-instructions.md` - Development workflow rules
- ✅ `docs/project-plan.md` - Implementation roadmap
- ✅ `docs/project-cleanup.md` - This file

### Git/CI/CD

- ✅ `.gitignore` - Files excluded from version control
- ✅ `.github/workflows/` - GitHub Actions (lint.yml, docker.yml)
- ✅ `renovate.json` - Automated dependency updates

### Development Tools

- ✅ `setup.sh` - Automated development environment setup
- ✅ `.husky/` - Git hooks (pre-commit)
- ✅ `.vscode/` - VS Code workspace settings
- ✅ `.markdownlint-cli2.jsonc` - Markdown linting rules

---

## Testing Files (Development Only)

### Playwright Tests

- ✅ `playwright.config.ts` - Playwright test configuration
- ✅ `tests/app.spec.ts` - Basic application tests
- ✅ `tests/local-auth-test.spec.ts` - Local authentication flow tests
- 🗑️ `playwright-report/` - Test results (gitignored)
- 🗑️ `test-results/` - Test artifacts (gitignored)

---

## Debug/Temporary Files (Can Be Removed)

### Debug Scripts (Gitignored)

These are temporary files created for debugging authentication issues. They are now in `.gitignore` and can be safely removed:

- 🗑️ `debug-ui.mjs` - NodeJS debug script for Playwright
- 🗑️ `run-auth-test.sh` - Shell wrapper for production auth test
- 🗑️ `run-debug-test.sh` - Debug test runner
- 🗑️ `test-local-auth.sh` - Local auth test runner
- 🗑️ `run-logout-test.sh` - Logout test (if exists)

**Removal Command**:

```bash
cd /home/ubuntu/git/otel-ui
rm -f debug-ui.mjs run-auth-test.sh run-debug-test.sh test-local-auth.sh run-logout-test.sh
```

### Debug Documentation

- ⚠️ `docs/AUTH_DEBUG_FINDINGS.md` - Keep for historical reference
- ⚠️ `docs/AUTH_FIX_2026-01-20.md` - Keep for historical reference

These document the OAuth state mismatch issue and should be kept as knowledge base for future debugging.

---

## Environment File Strategy

### `.env` (Production - Committed)

```bash
VITE_API_BASE_URL=https://otel.lab.informationcart.com
VITE_COGNITO_DOMAIN=homelab-auth.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=5j475mtdcm4qevh7q115qf1sfj
VITE_COGNITO_REDIRECT_URI=https://ui.lab.informationcart.com/callback
# ... (no secrets, just public configuration)
```

**Purpose**: Used for Docker builds and production deployments. Values are embedded into JavaScript bundle at build time. No secrets.

### `.env.local` (Development - Gitignored)

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/callback
# ... (local overrides)
```

**Purpose**: Local development overrides. Points to localhost backend. Not committed to git.

### `.env.example` (Template - Committed)

```bash
# Example configuration - copy to .env.local for development
VITE_API_BASE_URL=http://localhost:8080
# ...
```

**Purpose**: Documentation and template for new developers.

---

## File Size Analysis

```bash
# Current repository size breakdown
node_modules/          ~500MB (gitignored)
dist/                  ~1-2MB (gitignored, build output)
src/                   ~50KB (source code)
tests/                 ~10KB (Playwright tests)
docs/                  ~30KB (documentation)
playwright-report/     ~5MB (gitignored, test results)
test-results/          ~5MB (gitignored, test artifacts)
```

**Committed to Git**: ~500KB (excluding node_modules, dist, test artifacts)

---

## Recommended Actions

### Immediate Cleanup

```bash
# Remove temporary debug files
rm -f debug-ui.mjs run-auth-test.sh run-debug-test.sh test-local-auth.sh run-logout-test.sh

# Clean test artifacts
rm -rf playwright-report/ test-results/

# Verify .gitignore
git status  # Should not show debug files
```

### Optional: Archive Debug Files

If you want to keep debug scripts for reference:

```bash
# Create archive directory
mkdir -p archive/debug-scripts

# Move debug files to archive
mv debug-ui.mjs run-auth-test.sh run-debug-test.sh test-local-auth.sh archive/debug-scripts/

# Add to .gitignore
echo "archive/" >> .gitignore
```

### Documentation Updates

1. Update `README.md` with current project status
2. Mark completed tasks in `docs/project-plan.md`
3. Create operations guide: `docs/operations.md`

---

## Git Repository Health

### Current Status

```bash
git status
# On branch develop
# Your branch is up to date with 'origin/develop'.
```

### Untracked Files Check

```bash
git ls-files --others --exclude-standard
# Should only show intentionally untracked files (.env.local, etc.)
```

### Repository Size

```bash
du -sh .git
# Should be under 10MB
```

---

## Continuous Cleanup

### Pre-commit Hooks

Already configured via Husky:

- ESLint auto-fix for TypeScript files
- Prettier formatting
- Markdown linting

### Recommended Periodic Tasks

| Task                  | Frequency | Command                    |
| --------------------- | --------- | -------------------------- |
| Clean test artifacts  | Weekly    | `rm -rf test-results/`     |
| Update dependencies   | Monthly   | Renovate PRs (automated)   |
| Review debug docs     | Quarterly | Archive or remove obsolete |
| Check repository size | Quarterly | `du -sh .git`              |
| Audit unused files    | Quarterly | `git ls-files --others`    |

---

## Related Documentation

- [README.md](../README.md) - Project overview
- [docs/project-plan.md](project-plan.md) - Implementation roadmap
- [docs/AUTH_DEBUG_FINDINGS.md](AUTH_DEBUG_FINDINGS.md) - Authentication debugging history
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Development rules
