# Contributing to otel-ui

Thank you for contributing to otel-ui! This document outlines our development workflow and contribution guidelines.

## 🚨 Critical Rule: Branch Protection

**NEVER commit directly to the `main` branch.**

All changes must go through pull requests from either:

- `develop` branch (for regular development)
- `feature/*` branches (for isolated features)

Direct commits to `main` are **strictly forbidden** and will be rejected.

## Branch Strategy

### Branch Types

| Branch      | Purpose             | Direct Commits | PRs To                  |
| ----------- | ------------------- | -------------- | ----------------------- |
| `main`      | Production releases | ❌ FORBIDDEN   | N/A (receives PRs only) |
| `develop`   | Active development  | ✅ Allowed     | `main`                  |
| `feature/*` | Isolated features   | ✅ Allowed     | `main`                  |

### Workflow Options

#### Option 1: Regular Development (develop → main)

Use this for most changes:

```bash
# Start on develop
git checkout develop
git pull origin develop

# Make your changes
# ... edit files ...

# Run checks
npm run lint:all
npm run type-check
npm run build

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin develop

# Create PR on GitHub: develop → main
```

#### Option 2: Feature Branch (feature/\* → main)

Use this for larger isolated features:

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/awesome-feature

# Make your changes
# ... edit files ...

# Run checks
npm run lint:all
npm run type-check
npm run build

# Commit and push
git add .
git commit -m "feat: implement awesome feature"
git push origin feature/awesome-feature

# Create PR on GitHub: feature/awesome-feature → main
```

## Development Requirements

### Before You Commit

1. ✅ Run linters: `npm run lint:all`
2. ✅ Type check: `npm run type-check`
3. ✅ Build succeeds: `npm run build`
4. ✅ Test locally: `npm run dev`
5. ✅ Pre-commit hooks pass (automatic)

### Code Standards

- **TypeScript**: Use strict mode, no `any` types
- **Components**: Functional components with hooks
- **Types**: Import from `@stuartshay/otel-types` for API types
- **Styling**: CSS Modules or styled-components
- **Auth**: Never use `localStorage` for tokens (XSS risk)
- **Security**: Never commit secrets, API keys, or credentials

## Pull Request Process

1. **Create PR** from `develop` or `feature/*` to `main`
2. **Fill PR template** with description of changes
3. **Wait for checks** (lint, build, tests)
4. **Request review** from maintainers
5. **Address feedback** if requested
6. **Merge** after approval

### PR Naming Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new login page`
- `fix: resolve token refresh issue`
- `docs: update README with new environment variables`
- `chore: bump dependencies`
- `refactor: simplify authentication flow`

## CI/CD Pipeline

When you merge to `main`:

1. GitHub Actions runs lint, type check, and build
2. Docker image is built and pushed to Docker Hub
3. Version is auto-bumped based on commit messages
4. Image tag follows semantic versioning (e.g., `1.0.82`)

## Local Development Setup

```bash
# Clone repository
git clone https://github.com/stuartshay/otel-ui.git
cd otel-ui

# Switch to develop
git checkout develop

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local
# Edit .env.local with your local settings

# Start development server
npm run dev

# Open http://localhost:5173
```

## Testing

```bash
# Run Playwright tests
npm run test

# Run with UI
npm run test:ui

# Debug tests
npm run test:debug
```

## Environment Variables

Create `.env.local` for local development:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_COGNITO_DOMAIN=your-domain.auth.region.amazoncognito.com
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/callback
VITE_COGNITO_ISSUER=https://cognito-idp.region.amazonaws.com/your-pool-id
```

## Troubleshooting

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Authentication Issues

```bash
# Clear browser storage
localStorage.clear()

# Hard refresh
Ctrl+Shift+R  # or Cmd+Shift+R on Mac
```

### Git Issues

```bash
# If you accidentally committed to main (before pushing)
git checkout develop
git cherry-pick <commit-sha>
git checkout main
git reset --hard origin/main
```

## Getting Help

- 📖 [README](README.md) - Project overview and quick start
- 📚 [Documentation](docs/) - Detailed guides
- 🐛 [Issues](https://github.com/stuartshay/otel-ui/issues) - Report bugs or request features
- 💬 [Discussions](https://github.com/stuartshay/otel-ui/discussions) - Ask questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
