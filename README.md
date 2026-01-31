# otel-ui

[![Build](https://github.com/stuartshay/otel-ui/actions/workflows/docker.yml/badge.svg)](https://github.com/stuartshay/otel-ui/actions/workflows/docker.yml)
[![Lint](https://github.com/stuartshay/otel-ui/actions/workflows/lint.yml/badge.svg)](https://github.com/stuartshay/otel-ui/actions/workflows/lint.yml)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-stuartshay%2Fotel--ui-blue?logo=docker)](https://hub.docker.com/repository/docker/stuartshay/otel-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React frontend for the [otel-demo](https://github.com/stuartshay/otel-demo) API with OAuth2 authentication.

## Overview

A modern React + TypeScript frontend that consumes the otel-demo Flask API, featuring:

- **OAuth2/PKCE Authentication** - AWS Cognito integration
- **Type-safe API Client** - Uses [@stuartshay/otel-types](https://www.npmjs.com/package/@stuartshay/otel-types)
- **Distributed Tracing** - Displays trace IDs from API responses
- **Responsive Design** - Mobile-friendly UI
- **Docker Deployment** - nginx container for K8s

**Deployment Status**: Version 1.0.75 deployed to [ui.lab.informationcart.com](https://ui.lab.informationcart.com) 🚀

**Authentication**: ✅ Fully functional OAuth2/PKCE flow with login, callback, and logout

## Quick Start

```bash
# Run setup script
./setup.sh

# Start development server
npm run dev

# Open http://localhost:5173
```

## Development

### Git Workflow

- **main** - Production branch (protected, deploys to production)
- **develop** - Development branch (active development happens here)
- **feature/** - Feature branches (branch from develop, PR to develop)

```bash
# Start new work
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# When ready, create PR to develop
# After review and merge, develop will be merged to main for release
```

### Prerequisites

- Node.js 24.x (recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm 11.x

### Environment Configuration

**Production** (`.env`):

- API: `https://otel.lab.informationcart.com`
- Auth: `https://ui.lab.informationcart.com/callback`
- Used for Docker builds

**Development** (`.env.local`):

- API: `http://localhost:8080`
- Auth: `http://localhost:5173/callback`
- Copy from `.env.example` and customize

### Commands

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start development server (port 5173) |
| `npm run build`       | Build for production                 |
| `npm run preview`     | Preview production build             |
| `npm run lint:all`    | Run all linters (ESLint + Markdown)  |
| `npm run format`      | Format code with Prettier            |
| `npm run type-check`  | TypeScript type check                |
| `npx playwright test` | Run end-to-end tests                 |

## Infrastructure

| Resource       | Value                                |
| -------------- | ------------------------------------ |
| Production URL | https://ui.lab.informationcart.com   |
| API Backend    | https://otel.lab.informationcart.com |
| K8s Cluster    | k8s-pi5-cluster                      |
| Namespace      | otel-ui                              |
| Docker Hub     | stuartshay/otel-ui                   |

## Troubleshooting

### Local Development

**Cannot connect to API**:

- Ensure otel-demo is running: `cd ../otel-demo && python run.py`
- Check `.env.local` has `VITE_API_BASE_URL=http://localhost:8080`
- Verify CORS is enabled in otel-demo `.env`

**Authentication issues**:

- Clear localStorage: `localStorage.clear()` in browser console
- Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
- Check Cognito redirect URI matches `.env.local`

**Build errors**:

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

## Documentation

- [Project Plan](docs/project-plan.md) - Implementation roadmap
- [Cleanup Guide](docs/project-cleanup.md) - File organization
- [Auth Debug Findings](docs/AUTH_DEBUG_FINDINGS.md) - OAuth troubleshooting
- [Copilot Instructions](.github/copilot-instructions.md) - Development rules

## Related Repositories

- [otel-demo](https://github.com/stuartshay/otel-demo) - Flask API backend
- [k8s-gitops](https://github.com/stuartshay/k8s-gitops) - Kubernetes manifests
- [@stuartshay/otel-types](https://github.com/stuartshay/otel-types) - TypeScript types

## License

MIT
