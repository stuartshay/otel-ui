# Copilot Rules for otel-ui Repo

These rules ensure Copilot/assistants follow best practices for React + TypeScript
frontend development.

## Always Read First

- **README**: Read `README.md` for project overview and setup
- **docs**: Check `docs/` for operational documentation
- **env**: Load `.env.local` for API and auth configuration
- **types**: Review `@stuartshay/otel-types` package for API types

## Project Overview

React frontend for consuming the otel-demo API with OAuth2 authentication via AWS Cognito.

## Target Infrastructure

| Property | Value |
|----------|-------|
| API Backend | https://otel.lab.informationcart.com |
| Frontend URL | https://ui.lab.informationcart.com |
| Auth Provider | AWS Cognito (PKCE flow) |
| K8s Cluster | k8s-pi5-cluster |
| Namespace | otel-ui |

## Development Workflow

1. Run `npm install` to install dependencies
2. Configure `.env.local` with API and Cognito settings
3. Run `npm run dev` for development server
4. Run `npm run lint` before commit
5. Run `npm run build` to test production build
6. Push to trigger CI/CD pipeline

## Writing Code

### React Components

- Use functional components with hooks
- TypeScript strict mode enabled
- Props interfaces exported from component files
- Use `@stuartshay/otel-types` for API response types
- Implement error boundaries for production

### API Client

- Use axios or fetch with TypeScript types
- Base URL from environment variable
- Include Authorization header with access token
- Handle 401/403 responses (token refresh)
- Display trace IDs from `x-trace-id` response header

### Authentication

- Use `oidc-client-ts` for OAuth2/PKCE
- Store tokens in memory or sessionStorage (not localStorage)
- Implement token refresh before expiry
- Redirect to Cognito hosted UI for login
- Handle callback with authorization code

### Styling

- Use CSS Modules or styled-components
- Mobile-responsive design
- Dark mode support (optional)
- Consistent with Material-UI or Chakra UI

## Safety Rules (Do Not)

- Do not commit secrets or API keys
- Do not use `any` type - prefer `unknown` or specific types
- Do not skip `npm run lint` before commits
- Do not use `localStorage` for tokens (XSS risk)
- Do not hardcode API URLs (use environment variables)

## Quick Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create `.env.local` with:

```bash
VITE_API_BASE_URL=https://otel.lab.informationcart.com
VITE_COGNITO_DOMAIN=homelab-auth.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=5j475mtdcm4qevh7q115qf1sfj
VITE_COGNITO_REDIRECT_URI=https://ui.lab.informationcart.com/callback
VITE_COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ZL7M5Qa7K
```

## Docker

```bash
# Build
docker build -t otel-ui .

# Run locally
docker run -p 8080:80 otel-ui
```

## CI/CD Pipeline

- **lint.yml**: Runs ESLint, TypeScript check, build validation
- **docker.yml**: Builds nginx container, pushes to Docker Hub

## Related Repositories

- [otel-demo](https://github.com/stuartshay/otel-demo) - Flask API backend
- [k8s-gitops](https://github.com/stuartshay/k8s-gitops) - K8s deployment manifests
- [@stuartshay/otel-types](https://www.npmjs.com/package/@stuartshay/otel-types) - TypeScript types

## When Unsure

- Check existing components for patterns
- Reference otel-demo API documentation at `/apidocs`
- Validate with `npm run lint` and `npx tsc --noEmit`
- Test locally with `npm run dev` before pushing
