# otel-ui Project Plan

## Overview

React frontend application for consuming the otel-demo API with OAuth2 authentication via AWS Cognito. Part of the multi-repository OpenTelemetry demo system.

## Phase 2: React Frontend (otel-ui)

### Current Status: ✅ PHASE 2 COMPLETE (Feb 1, 2026)

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

### 11. API Client Service (Completed Jan 30, 2026)

- [x] Create `src/services/api.ts`
  - [x] Axios instance with base URL configuration
  - [x] Request interceptor for Authorization header
  - [x] Response interceptor for 401/403 handling
  - [x] Typed endpoints using `@stuartshay/otel-types`
  - [x] Error handling and retry logic with exponential backoff
  - [x] Trace ID extraction from `x-trace-id` header
  - [x] Database endpoints (`/db/status`, `/db/locations`)
  - [x] Type definitions for all database responses

### 12. Test Coverage Expansion (Completed Jan 30, 2026)

- [x] Create `tests/api-service.spec.ts`
  - [x] Health endpoint tests
  - [x] Database endpoint tests
  - [x] Demo endpoint tests
  - [x] Trace ID consistency tests
  - [x] CORS header validation
  - [x] Error handling tests
  - [x] Retry logic tests
- [x] Create `tests/auth-service.spec.ts`
  - [x] Session management tests
  - [x] Logout flow tests
  - [x] UI state tests
  - [x] Error handling tests
  - [x] Protected route access tests
  - [x] Cognito integration tests

### 13. React Context Providers (Completed)

- [x] Create `src/contexts/AuthContext.tsx`
  - [x] Auth state management (user, loading, authenticated)
  - [x] Login/logout methods
  - [x] Protected route wrapper
  - [x] Token refresh logic

### 14. React Components (Completed Jan 2026)

#### Core Components

- [x] `src/App.tsx` - Main application with routing
- [x] `src/main.tsx` - Updated with context providers

#### Authentication Components

- [x] `src/components/Login.tsx`
  - [x] Login button with Cognito redirect
  - [x] Loading state
  - [x] Error display
- [x] `src/components/Callback.tsx`
  - [x] Handle OAuth callback with authorization code
  - [x] Exchange code for tokens
  - [x] Redirect to dashboard on success
  - [x] Error handling

#### Application Components

- [x] `src/components/Dashboard.tsx`
  - [x] Protected route (requires auth)
  - [x] Display user information
  - [x] API health check display
  - [x] Frontend version display (v1.0.77+)
  - [x] Navigation to other pages
- [x] `src/components/Layout.tsx` (Header functionality)
  - [x] App branding
  - [x] User profile display
  - [x] Logout button
  - [x] Navigation menu
- [x] `src/components/ProtectedRoute.tsx`
  - [x] Route guard for authenticated pages
  - [x] Redirect to login if not authenticated

#### Additional Components (Beyond Original Plan)

- [x] `src/components/OTelTesting.tsx` - API endpoint testing with trace IDs
- [x] `src/components/OwnTracks.tsx` - Location display from OwnTracks API
- [x] `src/components/Toast.tsx` - Notification system
- [x] `src/config/runtime.ts` - Runtime config from window.**ENV**

### 15. Styling (Completed)

- [x] Custom CSS styling (Dashboard.css, Layout.css, OTelTesting.css, OwnTracks.css)
- [x] Responsive design
- [x] Loading states
- [x] Error states
- [x] Consistent theme
- [ ] Dark mode support (optional - future enhancement)

### 16. Testing (Completed)

- [x] Local development testing
  - [x] Dev server: `npm run dev`
  - [x] Login flow with Cognito
  - [x] OAuth callback handling
  - [x] API calls with valid tokens
  - [x] Token refresh
  - [x] Logout functionality
- [x] Build validation
  - [x] `npm run build` - Production build verified
  - [x] Playwright tests (`tests/*.spec.ts`)
- [x] Docker testing
  - [x] Multi-arch build (amd64/arm64)
  - [x] Runtime config injection via entrypoint.sh
  - [x] Caching fix for config.js (v1.0.79)

### 17. Kubernetes Deployment (Completed Jan 2026)

- [x] k8s-gitops manifests in `apps/base/otel-ui/`
  - [x] `deployment.yaml` - nginx container with React build
  - [x] `service.yaml` - ClusterIP service on port 80
  - [x] `ingress.yaml` - https://ui.lab.informationcart.com
  - [x] `configmap.yaml` - Runtime configuration
  - [x] `serviceaccount.yaml` - Service account
  - [x] `namespace.yaml` - otel-ui namespace
  - [x] `kustomization.yaml` - Kustomize configuration
  - [x] `update-version.sh` - Version update automation
- [x] Kustomize overlay in `clusters/k8s-pi5-cluster/apps/`
- [x] Integrated with Argo CD `apps-app.yaml`
- [x] Deployment verified:
  - [x] Pods running (2 replicas)
  - [x] Ingress working
  - [x] TLS certificates valid

### 18. DNS Configuration (Completed)

- [x] DNS record for `ui.lab.informationcart.com`
  - [x] Points to MetalLB IP: `192.168.1.100`
  - [x] DNS resolution verified

### 19. End-to-End Testing (Completed)

- [x] Complete flow verified:
  - [x] Navigate to https://ui.lab.informationcart.com
  - [x] Click login → redirect to Cognito
  - [x] Login with test user credentials
  - [x] OAuth callback → dashboard
  - [x] Make API calls to otel-demo backend
  - [x] Frontend version displays correctly
  - [x] Logout functionality works
- [x] Observability verified:
  - [x] Traces appear in New Relic
  - [x] API response trace IDs visible

---

## Pending Tasks 📋

### 20. Data Display Components (Future Enhancement)

- [ ] `src/components/ServiceInfo.tsx`
  - [ ] Dedicated service information page
  - [ ] Version comparison between frontend/backend
- [ ] `src/components/ChainDemo.tsx`
  - [ ] Fetch and display nested span demo from `/chain`
  - [ ] Visualize trace hierarchy
- [ ] `src/components/LatencyDemo.tsx`
  - [ ] Fetch from `/slow` endpoint
  - [ ] Show latency metrics
  - [ ] Display trace ID for investigation

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
| Version      | Deployed               | 1.0.79  |

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
- ✅ Authentication service implemented (COMPLETE)
- ✅ User can login via Cognito (COMPLETE)
- ✅ User can view dashboard after authentication (COMPLETE)
- ✅ API calls include valid access tokens (COMPLETE)
- ✅ Traces appear in New Relic with proper context (COMPLETE)
- ✅ Application is deployed to K8s cluster (COMPLETE - v1.0.79)
- ✅ End-to-end flow works in production (COMPLETE)

**🎉 Phase 2 Complete! (Feb 1, 2026)**

---

## Future Releases 🚀

### Phase 2.1: Browser Tracing (v1.1.0)

**Target**: Q1 2026 | **Effort**: 2-3 hours

Add OpenTelemetry browser instrumentation for full-stack distributed tracing.

**Scope**:

- Install `@opentelemetry/sdk-trace-web` packages
- Configure browser tracer in `src/main.tsx`
- Add fetch/XHR auto-instrumentation
- Export traces to New Relic browser endpoint
- Implement trace context propagation to backend
- Add user interaction tracking (clicks, navigation)

**Benefits**:

- See complete traces: User click → React → API → Database
- Monitor client-side performance (Core Web Vitals)
- Correlate frontend errors with backend traces
- Real User Monitoring (RUM) capabilities

**Dependencies**: Requires completed React UI (Phase 2)

---

### Phase 2.2: Platform Improvements (v1.2.0)

**Target**: Q1 2026 | **Effort**: 6-8 hours

Kubernetes platform maturity improvements from [k8s-gitops TODO.md](../../k8s-gitops/docs/TODO.md).

#### Alerting (High Priority - 2-3 hours)

- Deploy Alertmanager
- Configure alert rules:
  - Node down / not ready
  - Pod crash loops
  - Certificate expiry warnings
  - High resource usage
- Integrate with notification channels (email, Slack)

#### OpenTelemetry Infrastructure (Medium Priority - 4-6 hours)

- Deploy OTel Collector DaemonSet
- Replace Fluent Bit with OTel for log collection
- Unified observability pipeline:
  - Metrics (existing)
  - Logs (new OTel)
  - Traces (existing from apps)
- Configure New Relic as single backend
- Create instrumented sample apps

#### Backup & Recovery (High Priority - 2-3 hours)

- Deploy Velero for cluster backups
- Configure backup schedules (daily)
- Test restore procedures
- Migrate Sealed Secrets backup to CronJob
- Document disaster recovery procedures

**Benefits**:

- Production-ready operations
- Proactive issue detection
- Disaster recovery capability
- Simplified observability pipeline

**Dependencies**: Independent of otel-ui development

---

### Phase 3: otel-middleware (Python Workers)

**Target**: Q2 2026 | **Effort**: TBD

- Celery worker service for background tasks
- Redis StatefulSet for task queue
- Full OpenTelemetry instrumentation
- K8s deployment (no public ingress)
- Tasks: data transformation, file processing, cleanup

---

## Timeline Estimate

### Phase 2 (✅ COMPLETE - React UI)

| Task Group              | Status | Time Spent  |
| ----------------------- | ------ | ----------- |
| ✅ Auth Service         | Done   | ~3 hours    |
| ✅ API Client + Context | Done   | ~2 hours    |
| ✅ React Components     | Done   | ~5 hours    |
| ✅ Custom CSS Styling   | Done   | ~2 hours    |
| ✅ K8s Deployment       | Done   | ~2 hours    |
| ✅ Testing + Debugging  | Done   | ~2 hours    |
| **Total**               | ✅     | **~16 hrs** |

### Future Releases

| Release | Focus                 | Effort    |
| ------- | --------------------- | --------- |
| v1.1.0  | Browser Tracing       | 2-3 hours |
| v1.2.0  | Platform Improvements | 6-8 hours |
| v2.0.0  | otel-middleware       | TBD       |

---

## Related Documentation

- [otel-demo API Documentation](https://otel.lab.informationcart.com/apidocs)
- [Authentication Guide](authentication.md)
- [Enhancement Workflow Skill](../.github/skills/enhancement-workflow/SKILL.md) - Standard workflow for features/fixes
- [otel-ui Deployment Skill](../.github/skills/otel-ui-deployment/SKILL.md) - Complete deployment workflow
- [k8s-gitops TODO](../../k8s-gitops/docs/TODO.md)
- [Multi-Repo Implementation Plan](../../otel-demo/docs/multi-repo-implementation-plan.md)
- [AWS Cognito Configuration](../../homelab-infrastructure/docs/operations.md)
- [K8s GitOps Workflow](../../k8s-gitops/README.md)
