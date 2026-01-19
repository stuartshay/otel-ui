import { test, expect } from '@playwright/test';

/**
 * Authentication Flow Tests
 * Verify OAuth2/PKCE authentication with AWS Cognito
 *
 * Note: These tests require manual Cognito credentials
 * Set COGNITO_TEST_USERNAME and COGNITO_TEST_PASSWORD environment variables
 */

const TEST_USERNAME = process.env.COGNITO_TEST_USERNAME;
const TEST_PASSWORD = process.env.COGNITO_TEST_PASSWORD;

test.describe('Authentication Flow', () => {
  test.skip(
    !TEST_USERNAME || !TEST_PASSWORD,
    'Requires COGNITO_TEST_USERNAME and COGNITO_TEST_PASSWORD'
  );

  test('should redirect to Cognito login page when accessing protected route', async ({ page }) => {
    // Navigate to dashboard (protected route)
    await page.goto('/dashboard');

    // Should redirect to login page first
    await page.waitForURL(/\/login/, { timeout: 5000 });

    // Check for login button
    const loginButton = page.getByRole('button', { name: /sign in/i });
    await expect(loginButton).toBeVisible();
  });

  test('should show login page with sign-in button', async ({ page }) => {
    await page.goto('/login');

    // Check page title
    await expect(page.getByText(/OpenTelemetry UI/i)).toBeVisible();

    // Check sign-in button
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });

  test('should redirect to Cognito hosted UI on sign-in click', async ({ page }) => {
    await page.goto('/login');

    // Click sign-in button
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();

    // Wait for Cognito redirect
    await page.waitForURL(/cognito/, { timeout: 10000 });

    // Verify we're on Cognito hosted UI
    const url = page.url();
    expect(url).toContain('homelab-auth.auth.us-east-1.amazoncognito.com');
    expect(url).toContain('/oauth2/authorize');
    expect(url).toContain('response_type=code');
    expect(url).toContain('client_id=5j475mtdcm4qevh7q115qf1sfj');
    expect(url).toContain('redirect_uri=');
    expect(url).toContain('code_challenge='); // PKCE parameter
    expect(url).toContain('code_challenge_method=S256'); // PKCE method
  });

  test('should complete full OAuth flow with valid credentials', async ({ page }) => {
    if (!TEST_USERNAME || !TEST_PASSWORD) {
      test.skip();
      return;
    }

    // Start at login page
    await page.goto('/login');

    // Click sign-in
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();

    // Wait for Cognito login page
    await page.waitForURL(/cognito.*oauth2\/authorize/, { timeout: 10000 });

    // Fill in credentials
    await page.fill('input[name="username"]', TEST_USERNAME);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    // Submit form
    await page.click('input[type="submit"]');

    // Wait for callback redirect
    await page.waitForURL(/\/callback/, { timeout: 10000 });

    // Should process callback and redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Verify we're on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Check for authenticated content
    await expect(page.getByText(/Dashboard/i)).toBeVisible({ timeout: 10000 });
  });

  test('should not require second login after successful authentication', async ({ page }) => {
    if (!TEST_USERNAME || !TEST_PASSWORD) {
      test.skip();
      return;
    }

    // Complete login flow (reuse from previous test)
    await page.goto('/login');
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();
    await page.waitForURL(/cognito/, { timeout: 10000 });
    await page.fill('input[name="username"]', TEST_USERNAME);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('input[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Now navigate away and back to dashboard
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Should go directly to dashboard without login
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Dashboard/i)).toBeVisible();
  });
});
