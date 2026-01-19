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

### Commands

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start development server (port 5173) |
| `npm run build`    | Build for production                 |
| `npm run preview`  | Preview production build             |
| `npm run lint`     | Run ESLint                           |
| `npx tsc --noEmit` | TypeScript type check                |

## License

MIT
