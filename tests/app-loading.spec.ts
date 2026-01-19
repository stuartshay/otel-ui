import { test, expect } from '@playwright/test';

/**
 * Application Loading Tests
 * Verify the app loads correctly and static assets are served
 */

test.describe('Application Loading', () => {
  test('should load home page successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('should not show blank page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Take screenshot for debugging
    await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true });

    // Check that body has content (not blank)
    const bodyText = await page.textContent('body');
    expect(bodyText?.trim().length).toBeGreaterThan(0);

    // Check for root div with content
    const rootDiv = page.locator('#root');
    await expect(rootDiv).toBeVisible();

    const rootContent = await rootDiv.textContent();
    expect(rootContent?.trim().length).toBeGreaterThan(0);
  });

  test('should load all JavaScript bundles', async ({ page }) => {
    const scriptErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        scriptErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for script load errors
    console.log('Console errors:', scriptErrors);

    // Should not have critical errors
    const criticalErrors = scriptErrors.filter(
      err =>
        err.includes('Failed to load') || err.includes('404') || err.includes('Unexpected token')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have correct HTML structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check meta tags
    const title = await page.title();
    expect(title).toBeTruthy();

    // Check for root div
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // Check for React mounting
    const hasReactApp = await page.evaluate(() => {
      const rootElement = document.getElementById('root');
      return rootElement ? rootElement.children.length > 0 : false;
    });
    expect(hasReactApp).toBe(true);
  });

  test('should load config.js before React app', async ({ page }) => {
    const scriptLoadOrder: string[] = [];

    page.on('response', response => {
      if (response.url().includes('.js')) {
        const filename = response.url().split('/').pop() || '';
        scriptLoadOrder.push(filename);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log('Script load order:', scriptLoadOrder);

    // config.js should be loaded before main bundle
    const configIndex = scriptLoadOrder.findIndex(f => f === 'config.js');
    const mainBundleIndex = scriptLoadOrder.findIndex(f => f.startsWith('index-'));

    expect(configIndex).toBeGreaterThan(-1);
    if (mainBundleIndex > -1) {
      expect(configIndex).toBeLessThan(mainBundleIndex);
    }
  });

  test('should handle different routes', async ({ page }) => {
    // Test root redirect
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Should redirect to either /dashboard or /login
    const url = page.url();
    expect(url.endsWith('/dashboard') || url.endsWith('/login')).toBe(true);
  });

  test('should respond to health check probes', async ({ request }) => {
    // Test that the app responds (nginx is serving)
    const response = await request.get('/');
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('text/html');
  });
});
