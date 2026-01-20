# Project Status Summary - otel-ui

**Date**: January 20, 2026  
**Version**: 1.0.23 (Production)  
**Status**: ✅ Deployed and Operational

---

## Quick Overview

| Aspect                | Status         | Notes                                  |
| --------------------- | -------------- | -------------------------------------- |
| Production Deployment | ✅ Active      | https://ui.lab.informationcart.com     |
| API Backend           | ✅ Active      | https://otel.lab.informationcart.com   |
| Authentication        | ⚠️ Known Issue | OAuth state mismatch (investigating)   |
| CI/CD Pipeline        | ✅ Operational | GitHub Actions + Docker Hub            |
| Documentation         | ✅ Complete    | README, cleanup guide, troubleshooting |
| Code Quality          | ✅ Passing     | ESLint, Prettier, TypeScript checks    |

---

## What's Working

### ✅ Infrastructure

- React + Vite + TypeScript frontend
- Docker multi-stage build (Node → nginx)
- Kubernetes deployment via GitOps (ArgoCD)
- GitHub Actions CI/CD (lint + docker workflows)
- Renovate automated dependency updates

### ✅ Features

- OAuth2/PKCE authentication with AWS Cognito
- Type-safe API client using @stuartshay/otel-types
- Dashboard with user information
- API health checks
- Trace ID display from API responses
- Responsive mobile-friendly design

### ✅ Development Tools

- Pre-commit hooks (ESLint, Prettier, Markdown linting)
- Playwright end-to-end tests
- Local development environment
- VS Code workspace configuration
- Automated setup script

---

## Known Issues

### ⚠️ Authentication Double-Login

**Symptom**: Users need to login twice on first visit (first login fails, second succeeds)

**Root Cause**: OAuth state mismatch - `oidc-client-ts` library storage configuration

**Attempted Fixes**:

1. ✅ Created singleton WebStorageStateStore instance
2. ✅ Added both `userStore` and `stateStore` properties to UserManager config
3. ⚠️ Issue persists despite fixes - requires further investigation

**Workaround**: Login a second time after first failure

**Documentation**: See [docs/AUTH_DEBUG_FINDINGS.md](AUTH_DEBUG_FINDINGS.md)

**Next Steps**:

- Review oidc-client-ts documentation for proper configuration
- Check for browser caching issues
- Consider alternative OAuth libraries if issue persists

---

## Repository Cleanup Completed

### 🗑️ Removed Files

- `debug-ui.mjs` - Temporary NodeJS debug script
- `run-auth-test.sh` - Shell wrapper for production auth test
- `run-debug-test.sh` - Debug test runner
- `test-local-auth.sh` - Local auth test runner

### 📝 Updated Files

- `.gitignore` - Added debug/test script patterns
- `README.md` - Enhanced with deployment status, troubleshooting, infrastructure
- `docs/project-cleanup.md` - New comprehensive cleanup guide

### 📦 What Remains

**Essential Files**:

- Source code (`src/`)
- Tests (`tests/`)
- Configuration (TypeScript, ESLint, Vite, Docker)
- Documentation (`docs/`, `README.md`, `AGENTS.md`)
- CI/CD (`.github/workflows/`)

**Temporary Files** (gitignored):

- `.env.local` - Local development overrides
- `node_modules/` - Dependencies
- `dist/` - Build output
- `playwright-report/` - Test results
- `test-results/` - Test artifacts

---

## File Organization

```text
otel-ui/
├── src/                          # React/TypeScript source code
│   ├── components/               # UI components
│   ├── contexts/                 # React contexts (Auth)
│   ├── services/                 # API client, auth service
│   └── types/                    # TypeScript types
├── public/                       # Static assets
├── tests/                        # Playwright end-to-end tests
├── docs/                         # Documentation
│   ├── project-plan.md           # Implementation roadmap
│   ├── project-cleanup.md        # File organization guide
│   ├── project-status-summary.md # This file
│   ├── AUTH_DEBUG_FINDINGS.md    # OAuth troubleshooting
│   └── AUTH_FIX_2026-01-20.md    # Auth fix documentation
├── .github/
│   ├── workflows/                # CI/CD pipelines
│   └── copilot-instructions.md   # Development rules
├── Dockerfile                    # Multi-stage build
├── nginx.conf                    # nginx SPA configuration
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript config
├── .env                          # Production env vars (committed)
├── .env.local                    # Local env vars (gitignored)
└── setup.sh                      # Automated setup script
```

---

## Environment Configuration

### Production (`.env`)

```bash
VITE_API_BASE_URL=https://otel.lab.informationcart.com
VITE_COGNITO_REDIRECT_URI=https://ui.lab.informationcart.com/callback
```

**Purpose**: Docker builds, production deployments

### Development (`.env.local`)

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/callback
```

**Purpose**: Local development, not committed to git

---

## Development Workflow

### Local Development

```bash
# Initial setup
./setup.sh

# Start dev server
npm run dev

# Run tests
npx playwright test

# Lint and format
npm run lint:all
npm run format
```

### Git Workflow

- `main` - Production branch (releases only)
- `develop` - Active development (default working branch)
- `feature/*` - Feature branches (branch from develop)

```bash
# Start new work
git checkout develop && git pull
git checkout -b feature/my-feature

# Make changes, commit, push
git add .
git commit -m "feat: Add new feature"
git push origin feature/my-feature

# Create PR to develop branch
```

### Docker Build

```bash
# Build locally
docker build -t otel-ui:local .

# Run container
docker run -p 8080:80 otel-ui:local

# Test
curl http://localhost:8080
```

### Deployment

Changes pushed to `main` branch trigger:

1. GitHub Actions build
2. Docker image push to `stuartshay/otel-ui`
3. ArgoCD sync to k8s-pi5-cluster
4. Update version in k8s-gitops deployment manifest

---

## Key Commands Reference

| Command               | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `npm run dev`         | Start Vite dev server (port 5173)           |
| `npm run build`       | Build for production                        |
| `npm run preview`     | Preview production build                    |
| `npm run lint:all`    | Run all linters (ESLint + Markdown + Shell) |
| `npm run format`      | Format code with Prettier                   |
| `npm run type-check`  | TypeScript type validation                  |
| `npx playwright test` | Run end-to-end tests                        |
| `./setup.sh`          | Automated environment setup                 |

---

## Troubleshooting

### Cannot Connect to API

```bash
# Check otel-demo is running
cd ../otel-demo && python run.py

# Verify .env.local configuration
cat .env.local | grep VITE_API_BASE_URL
# Should be: http://localhost:8080
```

### Authentication Issues

```bash
# Clear browser storage
localStorage.clear()  # In browser console

# Hard refresh
# Ctrl+Shift+R (Linux/Windows)
# Cmd+Shift+R (Mac)

# Check redirect URI
cat .env.local | grep VITE_COGNITO_REDIRECT_URI
# Should match: http://localhost:5173/callback
```

### Build Errors

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

---

## Next Steps / TODO

### Immediate

1. ⚠️ **Resolve authentication double-login issue**
   - Research oidc-client-ts configuration best practices
   - Test with different browsers/incognito mode
   - Consider alternative OAuth libraries if needed

### Short-term

1. **Documentation**
   - Create `docs/operations.md` for production ops
   - Add architecture diagram to README
   - Document OAuth flow with diagrams

2. **Testing**
   - Expand Playwright test coverage
   - Add unit tests for services
   - CI/CD integration for Playwright tests

3. **Features**
   - User settings page
   - Trace visualization
   - Real-time metrics dashboard

### Long-term

1. **Observability**
   - Add OpenTelemetry browser tracing
   - Integrate Sentry for error tracking
   - Real User Monitoring (RUM)

2. **Performance**
   - Code splitting for routes
   - Lazy loading components
   - API response caching

---

## Related Resources

### Repositories

- **otel-ui**: https://github.com/stuartshay/otel-ui (this repo)
- **otel-demo**: https://github.com/stuartshay/otel-demo (Flask API)
- **k8s-gitops**: https://github.com/stuartshay/k8s-gitops (K8s manifests)
- **otel-types**: https://github.com/stuartshay/otel-types (TypeScript types)

### Deployments

- **Production Frontend**: https://ui.lab.informationcart.com
- **Production API**: https://otel.lab.informationcart.com
- **Docker Hub**: https://hub.docker.com/r/stuartshay/otel-ui

### Documentation

- [README.md](../README.md) - Project overview
- [AGENTS.md](../AGENTS.md) - Agent operating guide
- [docs/project-plan.md](project-plan.md) - Implementation roadmap
- [docs/project-cleanup.md](project-cleanup.md) - File organization
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Development rules

---

## Commit History (Recent)

- `72a8bd5` - docs: Project cleanup and documentation improvements (Jan 20, 2026)
- `3b43f6c` - fix: Add stateStore to UserManager config (Jan 20, 2026)
- `483da1a` - fix: Create singleton WebStorageStateStore (Jan 20, 2026)
- `a021560` - chore: Update deployment to version 1.0.23 (Jan 20, 2026)

---

**Last Updated**: January 20, 2026  
**Maintained By**: Stuart Shay  
**License**: MIT
