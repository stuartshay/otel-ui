# otel-ui Project Plan

## Overview

React frontend application for consuming the otel-demo API with OAuth2 authentication via AWS Cognito. Part of the multi-repository OpenTelemetry demo system.

## Phase 2: React Frontend (otel-ui)

### Current Status: Infrastructure Complete ✅

---

## Completed Tasks ✅

### 1. Repository Setup

- [x] Initialize Vite + React + TypeScript project
- [x] Create GitHub repository: `stuartshay/otel-ui`
- [x] Configure git with main branch
- [x] Initial commit pushed to GitHub (79acae2)

### 2. CI/CD Configuration

- [x] GitHub Actions workflows
  - [x] `lint.yml` - ESLint, TypeScript check, build validation, security audit
  - [x] `docker.yml` - Multi-stage Docker build and push
- [x] Renovate configuration for dependency updates
- [x] Pre-commit hooks configuration

### 3. Docker Configuration

- [x] Multi-stage Dockerfile (Node 20-alpine → nginx:alpine)
- [x] nginx configuration with SPA routing
- [x] Docker Hub repository created: `stuartshay/otel-ui`
- [x] GitHub secrets configured:
  - [x] `DOCKERHUB_USERNAME`
  - [x] `DOCKERHUB_TOKEN`

### 4. Dependencies

- [x] Core packages installed:
  - [x] `@stuartshay/otel-types@1.0.59` - Type-safe API client
  - [x] `axios@1.7.9` - HTTP client
  - [x] `oidc-client-ts@3.3.0` - OAuth2/PKCE authentication
  - [x] `react-router-dom@7.2.1` - Client-side routing

### 5. Environment Configuration

- [x] `.env` - Production configuration (ui.lab.informationcart.com)
- [x] `.env.local` - Development configuration (localhost:5173)
- [x] `.env.example` - Template for documentation
- [x] AWS Cognito configuration:
  - [x] User Pool: `us-east-1_ZL7M5Qa7K`
  - [x] PKCE Client: `5j475mtdcm4qevh7q115qf1sfj`
  - [x] Domain: `homelab-auth.auth.us-east-1.amazoncognito.com`

### 6. Documentation

- [x] `README.md` - Project overview and quick start
- [x] `AGENTS.md` - Agent operating guide
- [x] `.github/copilot-instructions.md` - Development rules and workflows
- [x] `setup.sh` - Automated development setup script
- [x] `docs/project-plan.md` - Comprehensive Phase 2 project plan

### 7. Development Tooling

- [x] Node.js 24 LTS via nvm
- [x] Pre-commit hooks with Husky + lint-staged
- [x] Code formatting with Prettier
- [x] ESLint configuration for React + TypeScript
- [x] Markdown linting with markdownlint-cli2
- [x] Shell script linting support (shellcheck)
- [x] VS Code workspace configuration
  - [x] `.vscode/settings.json` - Editor settings (format on save, ESLint auto-fix)
  - [x] `.vscode/extensions.json` - 15 recommended extensions

### 8. Dependency Management

- [x] Renovate configuration for automated updates
- [x] Resolved Renovate Dashboard issue #1:
  - [x] Updated Node.js 20 → 24 (Dockerfile, workflows)
  - [x] Updated GitHub Actions v4 → v6
  - [x] Updated hadolint v3.1.0 → v3.3.0
  - [x] Updated dockerhub-description v4 → v5
  - [x] Updated globals v16 → v17

### 9. Git Workflow

- [x] Created `develop` branch for active development
- [x] Updated documentation with branch strategy
- [x] Configured `main` as production-only branch

### 10. Authentication Service

- [x] Create `src/services/auth.ts`
  - [x] Configure `UserManager` with Cognito settings
  - [x] Implement PKCE flow (login, callback, logout)
  - [x] Token management (access, refresh, expiry)
  - [x] User session persistence
  - [x] Error handling and retry logic
  - [x] Fixed logout redirect_uri parameter (v1.0.32)

---

## In Progress Tasks 🔄

### 8. API Client Service

- [ ] Create `src/services/api.ts`
  - [ ] Axios instance with base URL configuration
  - [ ] Request interceptor for Authorization header
  - [ ] Response interceptor for 401/403 handling
  - [ ] Typed endpoints using `@stuartshay/otel-types`
  - [ ] Error handling and retry logic
  - [ ] Trace ID extraction from `x-trace-id` header

### 9. React Context Providers

- [ ] Create `src/contexts/AuthContext.tsx`
  - [ ] Auth state management (user, loading, authenticated)
  - [ ] Login/logout methods
  - [ ] Protected route wrapper
  - [ ] Token refresh logic
- [ ] Create `src/contexts/ApiContext.tsx` (optional)
  - [ ] API client instance
  - [ ] Global error handling

---

## Pending Tasks 📋

### 13. React Components

#### Core Components

- [ ] `src/App.tsx` - Main application with routing
- [ ] `src/main.tsx` - Update with context providers

#### Authentication Components

- [ ] `src/components/Login.tsx`
  - [ ] Login button with Cognito redirect
  - [ ] Loading state
  - [ ] Error display
- [ ] `src/components/Callback.tsx`
  - [ ] Handle OAuth callback with authorization code
  - [ ] Exchange code for tokens
  - [ ] Redirect to dashboard on success
  - [ ] Error handling

#### Application Components

- [ ] `src/components/Dashboard.tsx`
  - [ ] Protected route (requires auth)
  - [ ] Display user information
  - [ ] API health check display
  - [ ] Navigation to other pages
- [ ] `src/components/Header.tsx`
  - [ ] App branding
  - [ ] User profile display
  - [ ] Logout button
- [ ] `src/components/ProtectedRoute.tsx`
  - [ ] Route guard for authenticated pages
  - [ ] Redirect to login if not authenticated

#### Data Display Components

- [ ] `src/components/ServiceInfo.tsx`
  - [ ] Fetch and display service information from `/`
  - [ ] Show trace ID from API response
  - [ ] Display version information
- [ ] `src/components/ChainDemo.tsx`
  - [ ] Fetch and display nested span demo from `/chain`
  - [ ] Visualize trace hierarchy
- [ ] `src/components/LatencyDemo.tsx`
  - [ ] Fetch from `/slow` endpoint
  - [ ] Show latency metrics
  - [ ] Display trace ID for investigation

### 14. Styling

- [ ] Choose UI library (Material-UI, Chakra UI, or Tailwind CSS)
- [ ] Create theme configuration
- [ ] Implement responsive design
- [ ] Add loading states
- [ ] Add error states
- [ ] Dark mode support (optional)

### 15. Testing

- [ ] Local development testing
  - [ ] Start dev server: `npm run dev`
  - [ ] Test login flow with Cognito
  - [ ] Test OAuth callback handling
  - [ ] Test API calls with valid tokens
  - [ ] Test token refresh
  - [ ] Test logout
- [ ] Build validation
  - [ ] `npm run build` - Verify production build
  - [ ] `npm run preview` - Test production build locally
- [ ] Docker testing
  - [ ] Build image locally
  - [ ] Run container
  - [ ] Test endpoints

### 16. Kubernetes Deployment

- [ ] Create k8s-gitops manifests in `apps/base/otel-ui/`
  - [ ] `deployment.yaml` - nginx container with React build
  - [ ] `service.yaml` - ClusterIP service on port 80
  - [ ] `ingress.yaml` - https://ui.lab.informationcart.com
    - [ ] Configure oauth2-proxy annotations
    - [ ] TLS certificate configuration
  - [ ] `configmap.yaml` - Environment-specific configuration (optional)
- [ ] Create Kustomize overlay in `clusters/k8s-pi5-cluster/`
- [ ] Add to Argo CD `apps-app.yaml`
- [ ] Sync and verify deployment
  - [ ] Check pod status
  - [ ] Verify ingress
  - [ ] Test login flow
  - [ ] Test API calls

### 17. DNS Configuration

- [ ] Add DNS record for `ui.lab.informationcart.com`
  - [ ] Point to MetalLB IP: `192.168.1.100`
  - [ ] Verify DNS resolution

### 18. End-to-End Testing

- [ ] Test complete flow:
  - [ ] Navigate to https://ui.lab.informationcart.com
  - [ ] Click login → redirect to Cognito
  - [ ] Login with test user credentials
  - [ ] OAuth callback → dashboard
  - [ ] Make API calls to otel-demo backend
  - [ ] Verify traces in New Relic
  - [ ] Test logout
- [ ] Verify observability:
  - [ ] Check traces in New Relic
  - [ ] Verify trace context propagation
  - [ ] Check API response headers (x-trace-id)

### 19. Documentation Updates

- [ ] Update `README.md` with:
  - [ ] Architecture diagram
  - [ ] Screenshots
  - [ ] Deployment instructions
- [ ] Create `docs/operations.md`
  - [ ] Troubleshooting guide
  - [ ] Common issues
  - [ ] OAuth flow diagram
- [ ] Create `docs/authentication.md`
  - [ ] Cognito configuration details
  - [ ] PKCE flow explanation
  - [ ] Token lifecycle
- [ ] Update multi-repo `docs/multi-repo-implementation-plan.md`
  - [ ] Mark Phase 2 tasks as complete

---

## Future Enhancements 🚀

### Security

- [ ] Implement Content Security Policy (CSP)
- [ ] Add CSRF protection
- [ ] Security headers audit

### Performance

- [ ] Code splitting for routes
- [ ] Lazy loading components
- [ ] API response caching
- [ ] Image optimization

### Observability

- [ ] Add OpenTelemetry browser tracing
- [ ] User interaction tracking
- [ ] Error tracking (Sentry integration)
- [ ] Real User Monitoring (RUM)

### Features

- [ ] User settings page
- [ ] Admin dashboard
- [ ] API explorer/playground
- [ ] Trace visualization
- [ ] Real-time metrics dashboard

---

## Technical Stack

| Component    | Technology             | Version |
| ------------ | ---------------------- | ------- |
| Framework    | React                  | 19.x    |
| Build Tool   | Vite                   | 7.3.1   |
| Language     | TypeScript             | 5.7.x   |
| Router       | React Router           | 7.2.1   |
| HTTP Client  | Axios                  | 1.7.9   |
| Auth Library | oidc-client-ts         | 3.3.0   |
| Type Package | @stuartshay/otel-types | 1.0.59  |
| Container    | nginx                  | alpine  |
| Version      | Deployed               | 1.0.32  |

## Infrastructure

| Resource          | Value                                |
| ----------------- | ------------------------------------ |
| GitHub Repo       | stuartshay/otel-ui                   |
| Docker Hub        | stuartshay/otel-ui                   |
| API Backend       | https://otel.lab.informationcart.com |
| Frontend URL      | https://ui.lab.informationcart.com   |
| K8s Cluster       | k8s-pi5-cluster                      |
| K8s Namespace     | otel-ui                              |
| Cognito User Pool | us-east-1_ZL7M5Qa7K                  |
| Cognito Client    | 5j475mtdcm4qevh7q115qf1sfj (PKCE)    |

---

## Success Criteria

Phase 2 is complete when:

- ✅ Repository infrastructure is set up (COMPLETE)
- ✅ Development tooling configured (COMPLETE)
- ✅ Git workflow established (COMPLETE)
- ✅ CI/CD pipelines operational (COMPLETE)
- [ ] User can login via Cognito
- [ ] User can view dashboard after authentication
- [ ] API calls include valid access tokens
- [ ] Traces appear in New Relic with proper context
- [ ] Application is deployed to K8s cluster
- [ ] End-to-end flow works in production

---

## Next Phase Preview

**Phase 3: otel-middleware (Python Workers)**

- Celery worker service for background tasks
- Redis StatefulSet for task queue
- Full OpenTelemetry instrumentation
- K8s deployment (no public ingress)
- Tasks: data transformation, file processing, cleanup

---

## Timeline Estimate

| Task Group                | Estimated Time |
| ------------------------- | -------------- |
| Auth Service + API Client | 2-3 hours      |
| React Components          | 3-4 hours      |
| Testing + Debugging       | 1-2 hours      |
| K8s Deployment            | 1-2 hours      |
| Documentation             | 1 hour         |
| **Total**                 | **8-12 hours** |

---

## Related Documentation

- [otel-demo API Documentation](https://otel.lab.informationcart.com/apidocs)
- [Multi-Repo Implementation Plan](../../otel-demo/docs/multi-repo-implementation-plan.md)
- [AWS Cognito Configuration](../../homelab-infrastructure/docs/operations.md)
- [K8s GitOps Workflow](../../k8s-gitops/README.md)
