import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const TEST_USERNAME = process.env.COGNITO_TEST_USERNAME || '';
const TEST_PASSWORD = process.env.COGNITO_TEST_PASSWORD || '';

test.describe('Logout Flow', () => {
  test('should logout successfully and redirect to login page', async ({ page }) => {
    // Ensure credentials are available
    if (!TEST_USERNAME || !TEST_PASSWORD) {
      throw new Error('Test credentials not provided');
    }

    const screenshotsDir = path.join('test-results', 'logout-flow');
    fs.mkdirSync(screenshotsDir, { recursive: true });

    console.log('\n========================================');
    console.log('LOGOUT FLOW TEST');
    console.log('========================================\n');

    // Step 1: Navigate to home and login
    console.log('STEP 1: Navigate to home page');
    await page.goto('https://ui.lab.informationcart.com/');
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png') });

    // Step 2: Click sign-in
    console.log('STEP 2: Click sign-in button');
    await page.click('button:has-text("Sign In with Cognito")');
    await page.waitForURL(/cognito.*\/login/);
    await page.screenshot({ path: path.join(screenshotsDir, '02-cognito-login.png') });

    // Step 3: Enter credentials and login
    console.log('STEP 3: Enter credentials and login');
    await page.fill('input[name="username"]:visible', TEST_USERNAME);
    await page.fill('input[name="password"]:visible', TEST_PASSWORD);
    await page.screenshot({ path: path.join(screenshotsDir, '03-credentials-filled.png') });

    // Step 4: Submit and wait for dashboard
    console.log('STEP 4: Submit login form');
    await page.click('input[name="signInSubmitButton"]');
    await page.waitForURL('https://ui.lab.informationcart.com/dashboard', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotsDir, '04-dashboard.png') });

    console.log('✅ Login successful, on dashboard');

    // Step 5: Check user is authenticated
    console.log('STEP 5: Verify authenticated state');
    const userEmail = await page.textContent('text=testuser@homelab.local');
    expect(userEmail).toBeTruthy();
    console.log(`✅ User email displayed: ${userEmail}`);

    // Step 6: Check localStorage has token
    const localStorageKeys = await page.evaluate(() => Object.keys(localStorage));
    const hasOidcToken = localStorageKeys.some(key => key.includes('oidc.user'));
    expect(hasOidcToken).toBeTruthy();
    console.log('✅ OIDC token found in localStorage');

    // Step 7: Click logout button
    console.log('STEP 6: Click logout button');
    await page.screenshot({ path: path.join(screenshotsDir, '05-before-logout.png') });

    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Step 8: Wait for Cognito logout redirect
    console.log('STEP 7: Wait for Cognito logout');
    try {
      await page.waitForURL(/cognito.*\/logout/, { timeout: 5000 });
      await page.screenshot({ path: path.join(screenshotsDir, '06-cognito-logout.png') });
      console.log('✅ Redirected to Cognito logout endpoint');
    } catch {
      console.log('⚠️ Did not redirect to Cognito logout, checking direct redirect...');
    }

    // Step 9: Wait for redirect back to login page
    console.log('STEP 8: Wait for redirect to login page');
    await page.waitForURL('https://ui.lab.informationcart.com/login', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotsDir, '07-after-logout.png') });

    console.log('✅ Redirected to login page');

    // Step 10: Verify localStorage is cleared
    console.log('STEP 9: Verify session cleared');
    const localStorageAfterLogout = await page.evaluate(() => Object.keys(localStorage));
    const hasOidcTokenAfterLogout = localStorageAfterLogout.some(key => key.includes('oidc.user'));
    expect(hasOidcTokenAfterLogout).toBeFalsy();
    console.log('✅ OIDC token removed from localStorage');

    // Step 11: Verify cannot access dashboard without re-login
    console.log('STEP 10: Verify cannot access dashboard');
    await page.goto('https://ui.lab.informationcart.com/dashboard');
    await page.waitForURL('https://ui.lab.informationcart.com/login', { timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, '08-protected-route-redirect.png') });
    console.log('✅ Protected route redirects to login');

    console.log('\n========================================');
    console.log('LOGOUT TEST SUMMARY');
    console.log('========================================');
    console.log('✅ User logged in successfully');
    console.log('✅ Logout button clicked');
    console.log('✅ Redirected to login page');
    console.log('✅ Session cleared from localStorage');
    console.log('✅ Protected routes require re-authentication');
    console.log('========================================\n');
  });
});
