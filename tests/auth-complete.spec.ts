import { test, expect } from '@playwright/test';

/**
 * Complete Authentication Flow Tests
 * Tests the entire OAuth2/PKCE flow including logout
 *
 * Prerequisites:
 * - Set COGNITO_TEST_USERNAME and COGNITO_TEST_PASSWORD environment variables
 * - Application must be running (npm run dev or deployed)
 * - Cognito must be properly configured
 *
 * Usage:
 *   # Local testing
 *   COGNITO_TEST_USERNAME=test@example.com COGNITO_TEST_PASSWORD=password npm run test:auth
 *
 *   # Production testing
 *   BASE_URL=https://ui.lab.informationcart.com npm run test:auth
 */

const TEST_USERNAME = process.env.COGNITO_TEST_USERNAME;
const TEST_PASSWORD = process.env.COGNITO_TEST_PASSWORD;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Complete Authentication Flow', () => {
  test.skip(
    !TEST_USERNAME || !TEST_PASSWORD,
    'Requires COGNITO_TEST_USERNAME and COGNITO_TEST_PASSWORD environment variables'
  );

  test.beforeEach(async ({ page }) => {
    // Clear all cookies and storage before each test
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test('1. Should show unauthenticated state on homepage', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for login button or link
    const loginElement = page.locator(
      'a[href="/login"], button:has-text("Sign in"), button:has-text("Login")'
    );
    await expect(loginElement.first()).toBeVisible({ timeout: 5000 });

    // Should NOT show user profile or logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")');
    await expect(logoutButton).not.toBeVisible();
  });

  test('2. Should redirect to Cognito with correct PKCE parameters', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Click sign-in button
    const signInButton = page
      .locator('button:has-text("Sign in"), button:has-text("Login")')
      .first();
    await signInButton.click();

    // Wait for Cognito redirect
    await page.waitForURL(/cognito.*oauth2\/authorize/, { timeout: 10000 });

    // Verify OAuth2/PKCE parameters in URL
    const url = page.url();
    expect(url).toContain('homelab-auth.auth.us-east-1.amazoncognito.com');
    expect(url).toContain('/oauth2/authorize');
    expect(url).toContain('response_type=code');
    expect(url).toContain('client_id=5j475mtdcm4qevh7q115qf1sfj');
    expect(url).toContain('scope=openid');
    expect(url).toContain('code_challenge='); // PKCE code challenge
    expect(url).toContain('code_challenge_method=S256'); // SHA-256

    // Verify redirect_uri is present and encoded
    expect(url).toMatch(/redirect_uri=[^&]+/);

    console.log('✓ OAuth2 redirect URL validated with PKCE parameters');
  });

  test('3. Should complete login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Initiate login
    const signInButton = page
      .locator('button:has-text("Sign in"), button:has-text("Login")')
      .first();
    await signInButton.click();

    // Wait for Cognito login page
    await page.waitForURL(/cognito.*oauth2\/authorize/, { timeout: 10000 });

    // Fill credentials
    await page.fill('input[name="username"]', TEST_USERNAME!);
    await page.fill('input[name="password"]', TEST_PASSWORD!);

    // Submit login form
    await page.click('input[type="submit"], button[name="signInSubmitButton"]');

    // Wait for callback redirect
    await page.waitForURL(/\/callback/, { timeout: 15000 });

    // Wait for token exchange and final redirect
    await page.waitForURL(url => !url.pathname.includes('/callback'), { timeout: 15000 });

    // Should be authenticated now
    const currentUrl = page.url();
    console.log('✓ Redirected after login to:', currentUrl);

    // Check for authenticated UI elements
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")');
    await expect(logoutButton).toBeVisible({ timeout: 10000 });

    console.log('✓ Login successful - authenticated state verified');
  });

  test('4. Should have valid tokens in storage after login', async ({ page }) => {
    // Complete login flow
    await page.goto(`${BASE_URL}/login`);
    const signInButton = page
      .locator('button:has-text("Sign in"), button:has-text("Login")')
      .first();
    await signInButton.click();
    await page.waitForURL(/cognito/, { timeout: 10000 });
    await page.fill('input[name="username"]', TEST_USERNAME!);
    await page.fill('input[name="password"]', TEST_PASSWORD!);
    await page.click('input[type="submit"]');
    await page.waitForURL(url => !url.pathname.includes('/callback'), { timeout: 15000 });

    // Check localStorage for user tokens
    const userJson = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const userKey = keys.find(k => k.includes('user') || k.includes('oidc'));
      return userKey ? localStorage.getItem(userKey) : null;
    });

    expect(userJson).toBeTruthy();

    const user = JSON.parse(userJson!);
    expect(user).toHaveProperty('access_token');
    expect(user).toHaveProperty('id_token');
    expect(user).toHaveProperty('expires_at');
    expect(user.access_token).toBeTruthy();

    console.log('✓ Tokens stored correctly in localStorage');
    console.log('  - access_token:', user.access_token.substring(0, 20) + '...');
    console.log('  - token_type:', user.token_type);
    console.log('  - expires_at:', new Date(user.expires_at * 1000).toISOString());
  });

  test('5. Should maintain session across page refreshes', async ({ page }) => {
    // Complete login
    await page.goto(`${BASE_URL}/login`);
    const signInButton = page
      .locator('button:has-text("Sign in"), button:has-text("Login")')
      .first();
    await signInButton.click();
    await page.waitForURL(/cognito/, { timeout: 10000 });
    await page.fill('input[name="username"]', TEST_USERNAME!);
    await page.fill('input[name="password"]', TEST_PASSWORD!);
    await page.click('input[type="submit"]');
    await page.waitForURL(url => !url.pathname.includes('/callback'), { timeout: 15000 });

    // Verify authenticated
    const logoutButton1 = page.locator('button:has-text("Logout"), button:has-text("Sign out")');
    await expect(logoutButton1).toBeVisible();

    // Refresh page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Should still be authenticated
    const logoutButton2 = page.locator('button:has-text("Logout"), button:has-text("Sign out")');
    await expect(logoutButton2).toBeVisible({ timeout: 10000 });

    console.log('✓ Session persisted across page refresh');
  });

  test('6. Should logout successfully and clear session', async ({ page }) => {
    // Complete login
    await page.goto(`${BASE_URL}/login`);
    const signInButton = page
      .locator('button:has-text("Sign in"), button:has-text("Login")')
      .first();
    await signInButton.click();
    await page.waitForURL(/cognito/, { timeout: 10000 });
    await page.fill('input[name="username"]', TEST_USERNAME!);
    await page.fill('input[name="password"]', TEST_PASSWORD!);
    await page.click('input[type="submit"]');
    await page.waitForURL(url => !url.pathname.includes('/callback'), { timeout: 15000 });

    // Verify authenticated
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")');
    await expect(logoutButton).toBeVisible();

    console.log('✓ Authenticated, initiating logout...');

    // Click logout
    await logoutButton.click();

    // Should redirect to Cognito logout endpoint
    // Wait for either Cognito logout page or redirect back home
    await page.waitForTimeout(2000); // Give time for redirect

    const currentUrl = page.url();
    console.log('  - After logout click, URL:', currentUrl);

    // Check if we hit Cognito logout or went straight home
    if (currentUrl.includes('cognito')) {
      console.log('  - Redirected to Cognito logout');
      // Wait for redirect back to app
      await page.waitForURL(url => !url.includes('cognito'), { timeout: 10000 });
    }

    console.log('  - Final URL:', page.url());

    // Verify we're logged out - check localStorage is cleared
    const userJson = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const userKey = keys.find(k => k.includes('user') || k.includes('oidc'));
      return userKey ? localStorage.getItem(userKey) : null;
    });

    expect(userJson).toBeNull();
    console.log('✓ Tokens cleared from localStorage');

    // Should show login button again
    await page.goto(BASE_URL);
    const loginElement = page.locator(
      'a[href="/login"], button:has-text("Sign in"), button:has-text("Login")'
    );
    await expect(loginElement.first()).toBeVisible({ timeout: 5000 });

    console.log('✓ Logout successful - unauthenticated state verified');
  });

  test('7. Full round-trip: Login → Logout → Login again', async ({ page }) => {
    // First login
    await page.goto(`${BASE_URL}/login`);
    let signInButton = page.locator('button:has-text("Sign in"), button:has-text("Login")').first();
    await signInButton.click();
    await page.waitForURL(/cognito/, { timeout: 10000 });
    await page.fill('input[name="username"]', TEST_USERNAME!);
    await page.fill('input[name="password"]', TEST_PASSWORD!);
    await page.click('input[type="submit"]');
    await page.waitForURL(url => !url.pathname.includes('/callback'), { timeout: 15000 });

    console.log('✓ First login successful');

    // Logout
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")');
    await logoutButton.click();
    await page.waitForTimeout(2000);
    if (page.url().includes('cognito')) {
      await page.waitForURL(url => !url.includes('cognito'), { timeout: 10000 });
    }

    console.log('✓ Logout successful');

    // Second login
    await page.goto(`${BASE_URL}/login`);
    signInButton = page.locator('button:has-text("Sign in"), button:has-text("Login")').first();
    await signInButton.click();
    await page.waitForURL(/cognito/, { timeout: 10000 });
    await page.fill('input[name="username"]', TEST_USERNAME!);
    await page.fill('input[name="password"]', TEST_PASSWORD!);
    await page.click('input[type="submit"]');
    await page.waitForURL(url => !url.pathname.includes('/callback'), { timeout: 15000 });

    // Verify authenticated again
    await expect(
      page.locator('button:has-text("Logout"), button:has-text("Sign out")')
    ).toBeVisible();

    console.log('✓ Second login successful');
    console.log('✓ Full round-trip test passed');
  });
});

test.describe('Authentication Error Handling', () => {
  test('Should handle invalid credentials gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    const signInButton = page
      .locator('button:has-text("Sign in"), button:has-text("Login")')
      .first();
    await signInButton.click();
    await page.waitForURL(/cognito/, { timeout: 10000 });

    // Try invalid credentials
    await page.fill('input[name="username"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('input[type="submit"]');

    // Should show error message on Cognito page
    const errorMessage = page.locator('text=/incorrect|invalid|error/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    console.log('✓ Invalid credentials handled correctly');
  });

  test('Should handle callback errors gracefully', async ({ page }) => {
    // Try to access callback without proper state
    await page.goto(`${BASE_URL}/callback`);

    // Should redirect to login or show error
    await page.waitForTimeout(2000);
    const url = page.url();

    // Should either be on login page or show an error
    const isOnLogin = url.includes('/login');
    const hasError = await page
      .locator('text=/error|invalid/i')
      .isVisible()
      .catch(() => false);

    expect(isOnLogin || hasError).toBeTruthy();

    console.log('✓ Invalid callback handled correctly');
  });
});
