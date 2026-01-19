# Playwright Tests for otel-ui

End-to-end tests for the OpenTelemetry UI application.

## Test Suites

### 1. Configuration Tests (`config.spec.ts`)

Tests runtime configuration loading via ConfigMap:

- Verifies `config.js` is served correctly
- Checks `window.__ENV__` is populated
- Validates Cognito configuration values
- Verifies API base URL

### 2. Application Loading Tests (`app-loading.spec.ts`)

Tests basic application loading and rendering:

- Verifies HTML is served correctly
- Checks for blank page issues
- Validates JavaScript bundle loading
- Confirms React app mounting

### 3. Authentication Flow Tests (`auth-flow.spec.ts`)

Tests OAuth2/PKCE authentication with AWS Cognito:

- Verifies redirect to Cognito hosted UI
- Checks PKCE parameters in auth URL
- Tests full login flow (requires credentials)
- Validates single sign-in (no double login)

### 4. Full Authentication Debug Test (`full-auth-debug.spec.ts`)

Comprehensive authentication debugging test that captures every step:

- Takes screenshots at each step of the auth flow
- Captures all console logs, errors, and network requests
- Monitors for "Not Authorized" messages
- Detects automatic logout after login
- Generates detailed report in `test-results/auth-flow/`

**Use this test to debug authorization issues!**

## Running Tests

### Local Development

Test against local dev server:

```bash
npm run test
```

Or manually:

```bash
npx playwright test
```

### Production Environment

Test against deployed app at ui.lab.informationcart.com:

```bash
npx playwright test --config=playwright.config.prod.ts
```

### With Cognito Credentials

To run full authentication tests, set credentials:

```bash
export COGNITO_TEST_USERNAME="your-test-user@example.com"
export COGNITO_TEST_PASSWORD="your-password"
npx playwright test --config=playwright.config.prod.ts
```

### Debug Authentication Issues

Run the full debug test with screenshots at every step:

```bash
export COGNITO_TEST_USERNAME="your-test-user@example.com"
export COGNITO_TEST_PASSWORD="your-password"
npx playwright test full-auth-debug.spec.ts --config=playwright.config.prod.ts
```

This will create:

- **Screenshots**: `test-results/auth-flow/*.png` (one for each step)
- **Detailed log**: `test-results/auth-flow/full-report.log`

### Specific Test Suites

```bash
# Configuration tests only
npx playwright test config.spec.ts --config=playwright.config.prod.ts

# App loading tests only
npx playwright test app-loading.spec.ts --config=playwright.config.prod.ts

# Auth flow tests only (requires credentials)
npx playwright test auth-flow.spec.ts --config=playwright.config.prod.ts
```

## Debugging

### UI Mode

Run tests interactively with Playwright UI:

```bash
npx playwright test --ui --config=playwright.config.prod.ts
```

### Debug Mode

Run tests with debugger:

```bash
npx playwright test --debug --config=playwright.config.prod.ts
```

### View Test Results

After tests run, view HTML report:

```bash
npx playwright show-report
```

### Screenshots

Failed tests automatically capture screenshots to `tests/screenshots/`

## CI/CD Integration

Add to package.json scripts:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:prod": "playwright test --config=playwright.config.prod.ts"
  }
}
```

Add to GitHub Actions:

```yaml
- name: Run Playwright tests
  run: |
    npx playwright install --with-deps
    npm run test:e2e:prod
  env:
    COGNITO_TEST_USERNAME: ${{ secrets.COGNITO_TEST_USERNAME }}
    COGNITO_TEST_PASSWORD: ${{ secrets.COGNITO_TEST_PASSWORD }}
```

## Troubleshooting

### "config.js not found"

Check that:

1. ConfigMap is deployed: `kubectl get configmap otel-ui-config -n otel-ui`
2. Pods are using correct version: `kubectl get pods -n otel-ui`
3. Config is generated: `kubectl exec -n otel-ui deployment/otel-ui -- cat /usr/share/nginx/html/config.js`

### "Blank page" failures

Check:

1. React bundle loaded: Look for `index-*.js` in network tab
2. Console errors: Review test output for JavaScript errors
3. Config loaded before React: Verify config.js load order

### Authentication failures

Verify:

1. Cognito credentials are correct
2. Test user exists in Cognito User Pool
3. Callback URL is registered in Cognito
4. Network can reach Cognito (not blocked by firewall)

### Timeout errors

Increase timeouts in `playwright.config.prod.ts`:

```typescript
timeout: 120000, // 2 minutes
expect: {
  timeout: 20000, // 20 seconds
}
```
