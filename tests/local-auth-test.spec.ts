import { test, expect } from '@playwright/test';

/**
 * Local Authentication Test
 * Tests authentication flow against localhost
 */

const TEST_USERNAME = process.env.COGNITO_TEST_USERNAME || '';
const TEST_PASSWORD = process.env.COGNITO_TEST_PASSWORD || '';

test.describe('Local Authentication Flow', () => {
  test('should successfully authenticate on first login attempt', async ({ page }) => {
    // Enable logging
    const logs: string[] = [];
    const errors: string[] = [];

    page.on('console', msg => {
      const log = `[${msg.type()}] ${msg.text()}`;
      logs.push(log);
      console.log(log);
    });

    page.on('pageerror', error => {
      const err = `[ERROR] ${error.message}`;
      errors.push(err);
      console.error(err);
    });

    console.log('\n=== Starting Authentication Test ===\n');

    // Navigate to login
    await page.goto('/login');
    console.log('✓ Loaded login page');

    if (!TEST_USERNAME || !TEST_PASSWORD) {
      console.log('⚠️  Missing credentials, skipping test');
      test.skip();
      return;
    }

    // Click sign-in button
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible({ timeout: 10000 });
    await signInButton.click();
    console.log('✓ Clicked sign-in button');

    // Wait for Cognito
    await page.waitForURL(/cognito/, { timeout: 15000 });
    console.log('✓ Redirected to Cognito');

    // Enter credentials
    await page.waitForSelector('input[name="username"]:visible');
    await page.fill('input[name="username"]:visible', TEST_USERNAME);
    await page.fill('input[name="password"]:visible', TEST_PASSWORD);
    console.log('✓ Entered credentials');

    // Submit
    await page.click('input[type="submit"]:visible');
    console.log('✓ Submitted login form');

    // Wait for callback
    await page.waitForURL(/\/callback/, { timeout: 15000 });
    console.log('✓ Received OAuth callback');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 20000 });
    console.log('✓ Redirected to dashboard');

    // Check if we're authenticated
    const currentUrl = page.url();
    console.log(`✓ Final URL: ${currentUrl}`);

    // Verify we're on dashboard
    expect(currentUrl).toContain('/dashboard');

    // Check for user info (should be visible)
    await expect(page.getByText(/testuser@homelab.local/i)).toBeVisible({ timeout: 10000 });
    console.log('✓ User email visible - authenticated!');

    // Wait a bit and verify we don't get logged out
    console.log('\n=== Checking for auto-logout ===\n');
    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    console.log(`Final URL after 3s: ${finalUrl}`);

    if (finalUrl.includes('/login') && !finalUrl.includes('cognito')) {
      console.error('❌ LOGGED OUT - OAuth state mismatch issue still exists!');
      throw new Error('User was logged out after successful authentication');
    }

    console.log('✅ User remained authenticated!');

    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Console logs: ${logs.length}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nErrors found:');
      errors.forEach(e => console.log(e));
    }

    // Final assertion
    expect(finalUrl).toContain('/dashboard');
    expect(errors.filter(e => e.includes('No matching state'))).toHaveLength(0);
  });
});
