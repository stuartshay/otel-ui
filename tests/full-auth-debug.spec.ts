import { test, expect } from '@playwright/test';

/**
 * Full Authentication Flow Debug Test
 * Captures screenshots and logs at every step to debug authorization issues
 *
 * Set COGNITO_TEST_USERNAME and COGNITO_TEST_PASSWORD to run full flow
 */

const TEST_USERNAME = process.env.COGNITO_TEST_USERNAME || '';
const TEST_PASSWORD = process.env.COGNITO_TEST_PASSWORD || '';

test.describe('Full Auth Flow with Screenshots', () => {
  test('should complete full authentication flow and stay authenticated', async ({ page }) => {
    // Enable verbose logging
    const logs: string[] = [];
    const errors: string[] = [];
    const networkRequests: string[] = [];
    const networkResponses: { url: string; status: number; statusText: string }[] = [];

    // Capture all console messages
    page.on('console', msg => {
      const logEntry = `[CONSOLE ${msg.type()}] ${msg.text()}`;
      logs.push(logEntry);
      console.log(logEntry);
    });

    // Capture all errors
    page.on('pageerror', error => {
      const errorEntry = `[PAGE ERROR] ${error.message}\n${error.stack}`;
      errors.push(errorEntry);
      console.error(errorEntry);
    });

    // Capture failed requests
    page.on('requestfailed', request => {
      const failedEntry = `[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`;
      errors.push(failedEntry);
      console.error(failedEntry);
    });

    // Capture all network requests
    page.on('request', request => {
      if (!request.url().includes('data:') && !request.url().includes('chrome-extension')) {
        networkRequests.push(`${request.method()} ${request.url()}`);
      }
    });

    // Capture all network responses
    page.on('response', response => {
      if (!response.url().includes('data:') && !response.url().includes('chrome-extension')) {
        networkResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
      }
    });

    console.log('\n========================================');
    console.log('STEP 1: Navigate to home page');
    console.log('========================================\n');

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.screenshot({
      path: 'test-results/auth-flow/01-homepage.png',
      fullPage: true,
    });
    console.log('URL after navigation:', page.url());
    console.log('Screenshot saved: 01-homepage.png\n');

    await page.waitForTimeout(1000);

    console.log('\n========================================');
    console.log('STEP 2: Check if redirected to login');
    console.log('========================================\n');

    await page.screenshot({
      path: 'test-results/auth-flow/02-after-redirect.png',
      fullPage: true,
    });
    console.log('Current URL:', page.url());
    console.log('Screenshot saved: 02-after-redirect.png\n');

    // Check localStorage before login
    const storageBeforeLogin = await page.evaluate(() => {
      const storage: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          storage[key] = localStorage.getItem(key) || '';
        }
      }
      return storage;
    });
    console.log('LocalStorage before login:', Object.keys(storageBeforeLogin));

    if (!TEST_USERNAME || !TEST_PASSWORD) {
      console.log('\n⚠️  COGNITO_TEST_USERNAME and COGNITO_TEST_PASSWORD not set');
      console.log('Skipping authentication steps\n');
      test.skip();
      return;
    }

    console.log('\n========================================');
    console.log('STEP 3: Click sign-in button');
    console.log('========================================\n');

    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: 'test-results/auth-flow/03-login-page.png',
      fullPage: true,
    });
    console.log('Screenshot saved: 03-login-page.png\n');

    await signInButton.click();
    console.log('Clicked sign-in button');

    console.log('\n========================================');
    console.log('STEP 4: Wait for Cognito redirect');
    console.log('========================================\n');

    await page.waitForURL(/cognito.*\/login/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/auth-flow/04-cognito-auth-page.png',
      fullPage: true,
    });

    const cognitoUrl = page.url();
    console.log('Cognito URL:', cognitoUrl);
    console.log('Screenshot saved: 04-cognito-auth-page.png');

    // Parse OAuth parameters
    const url = new URL(cognitoUrl);
    console.log('\nOAuth Parameters:');
    console.log('  client_id:', url.searchParams.get('client_id'));
    console.log('  redirect_uri:', url.searchParams.get('redirect_uri'));
    console.log('  response_type:', url.searchParams.get('response_type'));
    console.log('  scope:', url.searchParams.get('scope'));
    console.log('  code_challenge_method:', url.searchParams.get('code_challenge_method'));
    console.log('  state:', url.searchParams.get('state'));
    console.log('');

    console.log('\n========================================');
    console.log('STEP 5: Enter credentials');
    console.log('========================================\n');

    // Wait for the login form to be visible and use visible input
    await page.waitForSelector('input[name="username"]:visible', { timeout: 10000 });
    await page.fill('input[name="username"]:visible', TEST_USERNAME);
    console.log('Filled username');
    await page.screenshot({
      path: 'test-results/auth-flow/05-username-filled.png',
      fullPage: true,
    });

    await page.fill('input[name="password"]:visible', TEST_PASSWORD);
    console.log('Filled password');
    await page.screenshot({
      path: 'test-results/auth-flow/06-password-filled.png',
      fullPage: true,
    });
    console.log('Screenshot saved: 05-username-filled.png, 06-password-filled.png\n');

    console.log('\n========================================');
    console.log('STEP 6: Submit login form');
    console.log('========================================\n');

    await page.click('input[type="submit"]:visible');
    console.log('Clicked submit button');

    console.log('\n========================================');
    console.log('STEP 7: Wait for callback redirect');
    console.log('========================================\n');

    // Wait for callback URL
    await page.waitForURL(/\/callback/, { timeout: 15000 });
    await page.screenshot({
      path: 'test-results/auth-flow/07-callback-page.png',
      fullPage: true,
    });
    console.log('Callback URL:', page.url());
    console.log('Screenshot saved: 07-callback-page.png\n');

    // Capture callback page content
    const callbackContent = await page.textContent('body');
    console.log('Callback page content preview:', callbackContent?.substring(0, 200));

    await page.waitForTimeout(2000);

    console.log('\n========================================');
    console.log('STEP 8: Check post-callback state');
    console.log('========================================\n');

    await page.screenshot({
      path: 'test-results/auth-flow/08-after-callback.png',
      fullPage: true,
    });
    console.log('URL after callback processing:', page.url());
    console.log('Screenshot saved: 08-after-callback.png\n');

    // Check localStorage after callback
    const storageAfterCallback = await page.evaluate(() => {
      const storage: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          storage[key] = key.includes('oidc') ? `[REDACTED - ${value.length} chars]` : value;
        }
      }
      return storage;
    });
    console.log('LocalStorage after callback:', storageAfterCallback);

    // Wait for any redirects
    await page.waitForTimeout(3000);

    console.log('\n========================================');
    console.log('STEP 9: Check final destination');
    console.log('========================================\n');

    await page.screenshot({
      path: 'test-results/auth-flow/09-final-page.png',
      fullPage: true,
    });

    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);
    console.log('Screenshot saved: 09-final-page.png');

    const finalContent = await page.textContent('body');
    console.log('Final page content preview:', finalContent?.substring(0, 300));

    // Check for "Not Authorized" text
    const hasNotAuthorized =
      finalContent?.includes('Not Authorized') ||
      finalContent?.includes('not authorized') ||
      finalContent?.includes('Unauthorized');

    if (hasNotAuthorized) {
      console.log('\n❌ FOUND "Not Authorized" text on page!');
      await page.screenshot({
        path: 'test-results/auth-flow/ERROR-not-authorized.png',
        fullPage: true,
      });
    }

    // Check if we're on dashboard
    const isDashboard = finalUrl.includes('/dashboard');
    console.log('On dashboard page:', isDashboard);

    // Check auth context state
    const authState = await page.evaluate(() => {
      return {
        hasEnv: !!(window as Window & { __ENV__?: unknown }).__ENV__,
        localStorage: Object.keys(localStorage).filter(k => k.includes('oidc')),
      };
    });
    console.log('Auth state:', authState);

    console.log('\n========================================');
    console.log('STEP 10: Wait and observe for logout');
    console.log('========================================\n');

    // Wait and take screenshots to see if logout happens
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `test-results/auth-flow/10-observe-${i + 1}.png`,
        fullPage: true,
      });

      const currentUrl = page.url();
      console.log(`After ${i + 1}s: ${currentUrl}`);

      // Check if redirected back to login
      if (currentUrl.includes('/login') && !currentUrl.includes('cognito')) {
        console.log(`\n❌ LOGGED OUT after ${i + 1} seconds!`);
        await page.screenshot({
          path: 'test-results/auth-flow/ERROR-logged-out.png',
          fullPage: true,
        });
        break;
      }
    }

    console.log('\n========================================');
    console.log('STEP 11: Test logout button');
    console.log('========================================\n');

    // Click logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
    console.log('Logout button found');

    await page.screenshot({
      path: 'test-results/auth-flow/11-before-logout.png',
      fullPage: true,
    });

    await logoutButton.click();
    console.log('Clicked logout button');

    // Wait for redirect (either to Cognito logout or directly to login)
    try {
      await page.waitForURL(/cognito.*\/logout/, { timeout: 3000 });
      console.log('✅ Redirected to Cognito logout endpoint');
      await page.screenshot({
        path: 'test-results/auth-flow/11-cognito-logout.png',
        fullPage: true,
      });
    } catch {
      console.log('⚠️ No Cognito logout redirect, checking direct redirect...');
    }

    // Should redirect back to login
    await page.waitForURL('https://ui.lab.informationcart.com/login', { timeout: 10000 });
    console.log('✅ Redirected to login page after logout');

    await page.screenshot({
      path: 'test-results/auth-flow/11-after-logout.png',
      fullPage: true,
    });

    // Verify localStorage is cleared
    const hasUserAfterLogout = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.some(k => k.includes('oidc.user'));
    });

    if (!hasUserAfterLogout) {
      console.log('✅ Session cleared from localStorage');
    } else {
      console.log('⚠️ Session still in localStorage after logout');
    }

    console.log('\n========================================');
    console.log('SUMMARY');
    console.log('========================================\n');
    console.log('Total console logs:', logs.length);
    console.log('Total errors:', errors.length);
    console.log('Total network requests:', networkRequests.length);
    console.log('Total network responses:', networkResponses.length);

    if (errors.length > 0) {
      console.log('\n🔴 ERRORS FOUND:');
      errors.forEach(err => console.log(err));
    }

    // Check final state
    const finalState = await page.evaluate(() => {
      return {
        url: window.location.href,
        hasUser: !!localStorage.getItem(
          'oidc.user:https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ZL7M5Qa7K:5j475mtdcm4qevh7q115qf1sfj'
        ),
        localStorageKeys: Object.keys(localStorage),
      };
    });

    console.log('\nFinal State:');
    console.log('  URL:', finalState.url);
    console.log('  Has OIDC user:', finalState.hasUser);
    console.log('  LocalStorage keys:', finalState.localStorageKeys);

    // Save all logs to file
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');

    const reportDir = 'test-results/auth-flow';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportDir, 'full-report.log'),
      `Authentication Flow Debug Report
Generated: ${new Date().toISOString()}

=== CONSOLE LOGS ===
${logs.join('\n')}

=== ERRORS ===
${errors.join('\n')}

=== NETWORK REQUESTS ===
${networkRequests.join('\n')}

=== NETWORK RESPONSES ===
${networkResponses.map(r => `${r.status} ${r.statusText} - ${r.url}`).join('\n')}

=== FINAL STATE ===
URL: ${finalState.url}
Has User: ${finalState.hasUser}
LocalStorage Keys: ${finalState.localStorageKeys.join(', ')}
`
    );

    console.log('\n📄 Full report saved to: test-results/auth-flow/full-report.log\n');

    // Assertions
    expect(finalUrl).toContain('/dashboard');
    expect(finalState.hasUser).toBe(true);
    expect(hasNotAuthorized).toBe(false);
  });
});
