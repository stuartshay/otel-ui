import { test, expect } from '@playwright/test';

/**
 * Configuration Tests
 * Verify runtime configuration is loaded correctly
 */

test.describe('Runtime Configuration', () => {
  test('should load config.js from server', async ({ page }) => {
    // Navigate to the app
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Check if config.js is loaded
    const configResponse = await page.request.get('/config.js');
    expect(configResponse.status()).toBe(200);

    const configContent = await configResponse.text();
    console.log('Config.js content:', configContent);

    // Verify config.js contains window.__ENV__
    expect(configContent).toContain('window.__ENV__');
    expect(configContent).toContain('API_BASE_URL');
    expect(configContent).toContain('COGNITO_DOMAIN');
    expect(configContent).toContain('COGNITO_CLIENT_ID');
    expect(configContent).toContain('COGNITO_REDIRECT_URI');
    expect(configContent).toContain('COGNITO_ISSUER');
  });

  test('should expose runtime config to window object', async ({ page }) => {
    await page.goto('/');

    // Wait for config to be loaded
    await page.waitForLoadState('domcontentloaded');

    // Check if window.__ENV__ is defined
    const config = await page.evaluate(() => {
      return (window as Window & { __ENV__?: Record<string, string> }).__ENV__;
    });

    console.log('Window.__ENV__:', config);

    expect(config).toBeDefined();
    expect(config.API_BASE_URL).toBeTruthy();
    expect(config.COGNITO_DOMAIN).toBeTruthy();
    expect(config.COGNITO_CLIENT_ID).toBeTruthy();
    expect(config.COGNITO_REDIRECT_URI).toBeTruthy();
    expect(config.COGNITO_ISSUER).toBeTruthy();
  });

  test('should have correct Cognito configuration', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const config = await page.evaluate(() => {
      return (window as Window & { __ENV__?: Record<string, string> }).__ENV__;
    });

    // Verify production values
    expect(config.COGNITO_DOMAIN).toBe('homelab-auth.auth.us-east-1.amazoncognito.com');
    expect(config.COGNITO_CLIENT_ID).toBe('5j475mtdcm4qevh7q115qf1sfj');
    expect(config.COGNITO_REDIRECT_URI).toBe('https://ui.lab.informationcart.com/callback');
    expect(config.COGNITO_ISSUER).toBe(
      'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ZL7M5Qa7K'
    );
  });

  test('should have correct API base URL', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const config = await page.evaluate(() => {
      return (window as Window & { __ENV__?: Record<string, string> }).__ENV__;
    });

    expect(config?.API_BASE_URL).toBe('https://otel.lab.informationcart.com');
  });
});
