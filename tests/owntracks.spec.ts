import { test, expect } from '@playwright/test';

/**
 * OwnTracks Feature Tests
 * Tests for distance calculation job management functionality
 */

test.describe('OwnTracks Page', () => {
  // Setup authentication mock before each test
  // This is needed because /owntracks is a protected route
  // The app uses oidc-client-ts which stores user data in localStorage
  // with key pattern: oidc.user:<issuer>:<clientId>
  test.beforeEach(async ({ page }) => {
    // Mock Cognito userinfo endpoint
    await page.route('**/oauth2/userInfo', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sub: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User',
          email_verified: true,
        }),
      });
    });

    // Mock distance API endpoints that don't have specific mocks
    await page.route('**/api/distance/jobs', route => {
      const url = route.request().url();
      // Only match the list endpoint (not individual job status)
      if (!url.match(/\/jobs\/[^/]+$/)) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jobs: [],
            total_count: 0,
            limit: 50,
            offset: 0,
            next_offset: null,
            trace_id: 'test-trace-id',
          }),
        });
      } else {
        route.continue();
      }
    });

    // Set localStorage to simulate authenticated OIDC state
    // oidc-client-ts uses key pattern: oidc.user:<issuer>:<clientId>
    // We use a wildcard-friendly approach by setting the expected structure
    await page.addInitScript(() => {
      // Mock OIDC user data structure matching oidc-client-ts User class
      const mockOidcUser = {
        id_token: 'mock-id-token',
        access_token: 'mock-access-token-for-testing',
        token_type: 'Bearer',
        scope: 'openid profile email',
        profile: {
          sub: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User',
          email_verified: true,
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        state: null,
      };

      // The issuer and clientId come from env vars, but for testing we use known values
      // These should match VITE_COGNITO_ISSUER and VITE_COGNITO_CLIENT_ID from .env
      const issuer = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_test';
      const clientId = 'test-client-id';
      const storageKey = `oidc.user:${issuer}:${clientId}`;

      localStorage.setItem(storageKey, JSON.stringify(mockOidcUser));

      // Also set a fallback key pattern that oidc-client-ts might look for
      // This helps when the actual issuer/clientId differ from test values
      const keys = Object.keys(localStorage);
      const hasOidcKey = keys.some(k => k.startsWith('oidc.user:'));
      if (!hasOidcKey) {
        // Set with empty issuer/clientId as fallback
        localStorage.setItem('oidc.user::', JSON.stringify(mockOidcUser));
      }
    });
  });

  test('should load owntracks page with correct structure', async ({ page }) => {
    // Navigate to owntracks page
    await page.goto('/owntracks');
    await page.waitForLoadState('domcontentloaded');

    // Check page title/header
    const header = page.locator('h2');
    await expect(header).toContainText('OwnTracks Operations');

    // Check that all three tabs are present
    const calculateTab = page.locator('button[role="tab"]', { hasText: 'Calculate Distance' });
    const jobsTab = page.locator('button[role="tab"]', { hasText: 'Job History' });
    const analyticsTab = page.locator('button[role="tab"]', { hasText: 'Analytics' });

    await expect(calculateTab).toBeVisible();
    await expect(jobsTab).toBeVisible();
    await expect(analyticsTab).toBeVisible();
  });

  test('should display stats in header', async ({ page }) => {
    await page.goto('/owntracks');
    await page.waitForLoadState('domcontentloaded');

    // Check for stats boxes
    const statsBoxes = page.locator('.stat-box');
    expect(await statsBoxes.count()).toBeGreaterThan(0);

    // Check for home location display
    const homeLocation = page.locator('.stat-value', { hasText: 'N' });
    await expect(homeLocation).toBeVisible();
  });

  test('should show calculate distance form', async ({ page }) => {
    await page.goto('/owntracks');
    await page.waitForLoadState('domcontentloaded');

    // Calculate tab should be active by default
    const dateInput = page.locator('input[type="date"]');
    const deviceInput = page.locator('input[placeholder*="iphone"]');
    const calculateButton = page.locator('button', { hasText: 'Calculate Distance' });

    await expect(dateInput).toBeVisible();
    await expect(deviceInput).toBeVisible();
    await expect(calculateButton).toBeVisible();
    await expect(calculateButton).toBeEnabled();
  });

  test('should show API status indicators', async ({ page }) => {
    await page.goto('/owntracks');
    await page.waitForLoadState('domcontentloaded');

    // Check for API status card
    const statusCard = page.locator('.api-status-card');
    await expect(statusCard).toBeVisible();

    // Check for status indicators
    const statusIndicators = page.locator('.api-status-item');
    expect(await statusIndicators.count()).toBeGreaterThan(0);
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/owntracks');
    await page.waitForLoadState('domcontentloaded');

    // Click on Job History tab
    const jobsTab = page.locator('button[role="tab"]', { hasText: 'Job History' });
    await jobsTab.click();
    await expect(jobsTab).toHaveClass(/active/);

    // Check that jobs section is visible
    const jobsSection = page.locator('.jobs-section');
    await expect(jobsSection).toBeVisible();

    // Click on Analytics tab
    const analyticsTab = page.locator('button[role="tab"]', { hasText: 'Analytics' });
    await analyticsTab.click();
    await expect(analyticsTab).toHaveClass(/active/);

    // Check that analytics section is visible
    const analyticsSection = page.locator('.analytics-section');
    await expect(analyticsSection).toBeVisible();
  });

  test('should show roadmap in analytics tab', async ({ page }) => {
    await page.goto('/owntracks');
    await page.waitForLoadState('domcontentloaded');

    // Click on Analytics tab
    const analyticsTab = page.locator('button[role="tab"]', { hasText: 'Analytics' });
    await analyticsTab.click();

    // Check for feature grid
    const featureCards = page.locator('.feature-card');
    expect(await featureCards.count()).toBeGreaterThan(0);

    // Check for roadmap
    const roadmapCard = page.locator('.roadmap-card');
    await expect(roadmapCard).toBeVisible();

    // Check for completed phases
    const completedPhases = page.locator('.roadmap-item.done');
    expect(await completedPhases.count()).toBeGreaterThan(0);
  });

  test('should handle job list loading with mocked API', async ({ page }) => {
    // Mock individual job status calls first (more specific pattern)
    await page.route('**/api/distance/jobs/*', route => {
      const url = route.request().url();
      // Only match individual job endpoints (not list endpoint with query params)
      if (!url.includes('?') && url.match(/\/jobs\/[^/]+$/)) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            job_id: 'test-job-123',
            status: 'completed',
            date: '2026-01-27',
            device_id: 'test-device',
            queued_at: '2026-01-27T10:00:00Z',
            completed_at: '2026-01-27T10:00:15Z',
            result: {
              csv_download_url: '/api/distance/download/distance_20260127.csv',
              total_distance_km: 42.5,
              total_locations: 1440,
              max_distance_km: 15.2,
              min_distance_km: 0.1,
              processing_time_ms: 1250,
              date: '2026-01-27',
              device_id: 'test-device',
            },
            trace_id: 'test-trace-id',
          }),
        });
      } else {
        route.continue();
      }
    });

    // Mock the API response for listing jobs (after individual job route)
    await page.route('**/api/distance/jobs', route => {
      const url = route.request().url();
      // Only match the list endpoint (with or without query params)
      if (!url.match(/\/jobs\/[^/]+$/)) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jobs: [
              {
                job_id: 'test-job-123',
                status: 'completed',
                date: '2026-01-27',
                device_id: 'test-device',
                queued_at: '2026-01-27T10:00:00Z',
                completed_at: '2026-01-27T10:00:15Z',
              },
            ],
            total_count: 1,
            limit: 50,
            offset: 0,
            next_offset: null,
            trace_id: 'test-trace-id',
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/owntracks');
    await page.waitForLoadState('networkidle');

    // Switch to Jobs tab
    const jobsTab = page.locator('button[role="tab"]', { hasText: 'Job History' });
    await jobsTab.click();

    // Wait for jobs to load by checking for the job card (deterministic wait)
    const jobCard = page.locator('.job-card');
    await expect(jobCard).toBeVisible({ timeout: 5000 });

    // Check for job details
    await expect(page.locator('text=test-job-123')).toBeVisible();
    await expect(page.locator('text=COMPLETED')).toBeVisible();
  });

  test('should handle calculate distance with mocked API', async ({ page }) => {
    // Mock the calculate API response
    await page.route('**/api/distance/calculate', route => {
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          job_id: 'new-job-456',
          status: 'queued',
          queued_at: new Date().toISOString(),
          status_url: '/api/distance/jobs/new-job-456',
          trace_id: 'test-trace-id',
        }),
      });
    });

    // Mock the job list to return empty initially
    await page.route('**/api/distance/jobs', route => {
      const url = route.request().url();
      // Only match the list endpoint (not individual job status)
      if (!url.match(/\/jobs\/[^/]+$/)) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jobs: [],
            total_count: 0,
            limit: 50,
            offset: 0,
            next_offset: null,
            trace_id: 'test-trace-id',
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/owntracks');
    await page.waitForLoadState('networkidle');

    // Fill in the form
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2026-01-27');

    const deviceInput = page.locator('input[placeholder*="iphone"]');
    await deviceInput.fill('test-device');

    // Click calculate button
    const calculateButton = page.locator('button', { hasText: 'Calculate Distance' });
    await calculateButton.click();

    // Wait for the Jobs tab to become selected (deterministic wait instead of timeout)
    const jobsTab = page.locator('button[role="tab"][aria-selected="true"]', {
      hasText: 'Job History',
    });
    await expect(jobsTab).toBeVisible({ timeout: 5000 });
  });

  test('should show status filter in jobs tab', async ({ page }) => {
    await page.goto('/owntracks');
    await page.waitForLoadState('domcontentloaded');

    // Switch to Jobs tab
    const jobsTab = page.locator('button[role="tab"]', { hasText: 'Job History' });
    await jobsTab.click();

    // Check for filter dropdown
    const filterSelect = page.locator('select');
    await expect(filterSelect).toBeVisible();

    // Check filter options
    const options = await filterSelect.locator('option').allTextContents();
    expect(options).toContain('All Statuses');
    expect(options).toContain('Completed');
    expect(options).toContain('Processing');
    expect(options).toContain('Queued');
    expect(options).toContain('Failed');
  });

  test('should be responsive and mobile-friendly', async ({ page }) => {
    await page.goto('/owntracks');
    await page.waitForLoadState('domcontentloaded');

    // Check that tabs are visible
    const tabs = page.locator('.tabs');
    await expect(tabs).toBeVisible();

    // Check that content is visible
    const content = page.locator('.tab-content');
    await expect(content).toBeVisible();

    // Check that stats row is visible (responsive element)
    const statsRow = page.locator('.stats-row');
    await expect(statsRow).toBeVisible();

    // Check form elements are accessible
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();

    // Take screenshot for visual verification (desktop viewport by default)
    await page.screenshot({ path: 'tests/screenshots/owntracks-desktop.png', fullPage: true });
  });

  test('should render correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/owntracks');
    await page.waitForLoadState('domcontentloaded');

    // Check that tabs are visible on mobile
    const tabs = page.locator('.tabs');
    await expect(tabs).toBeVisible();

    // Check that content is visible
    const content = page.locator('.tab-content');
    await expect(content).toBeVisible();

    // Take screenshot for mobile visual verification
    await page.screenshot({ path: 'tests/screenshots/owntracks-mobile.png', fullPage: true });
  });

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Mock API to prevent real calls
    await page.route('**/api/distance/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ jobs: [], total_count: 0 }),
      });
    });

    await page.goto('/owntracks');
    await page.waitForLoadState('networkidle');

    // Filter out expected/known errors (e.g., network errors when mocking)
    const criticalErrors = consoleErrors.filter(
      err => !err.includes('Failed to load') && !err.includes('Network')
    );

    // Log errors only when unexpected/critical errors are present (helps with debugging)
    if (criticalErrors.length > 0) {
      console.error('Unexpected console errors:', criticalErrors);
    }

    // Assert that there are no unexpected/critical console errors
    expect(criticalErrors).toHaveLength(0);
  });
});
