import { test } from '@playwright/test';

/**
 * Debug Test - Investigate sign-in issues
 */

test.describe('Sign-in Debug', () => {
  test('should inspect login page and sign-in flow', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    });

    // Listen for errors
    page.on('pageerror', error => {
      console.log('[PAGE ERROR]:', error.message);
    });

    // Listen for failed requests
    page.on('requestfailed', request => {
      console.log('[FAILED REQUEST]:', request.url(), request.failure()?.errorText);
    });

    // Navigate to root
    console.log('\n=== Navigating to / ===');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'tests/screenshots/debug-root.png', fullPage: true });

    // Wait a bit for redirects
    await page.waitForTimeout(2000);
    console.log('URL after wait:', page.url());

    // Check if we're on login page
    if (page.url().includes('/login')) {
      console.log('\n=== On Login Page ===');

      // Get page content
      const pageText = await page.textContent('body');
      console.log('Page content preview:', pageText?.substring(0, 200));

      // Check for buttons
      const buttons = await page.locator('button').all();
      console.log('Number of buttons found:', buttons.length);

      for (const button of buttons) {
        const text = await button.textContent();
        console.log('Button text:', text);
      }

      // Try to find and click sign-in button
      const signInButton = page.getByRole('button', { name: /sign in|login/i });
      const buttonExists = await signInButton.count();
      console.log('Sign-in button found:', buttonExists > 0);

      if (buttonExists > 0) {
        console.log('\n=== Clicking Sign-In Button ===');
        await signInButton.click();

        // Wait for navigation
        await page.waitForTimeout(3000);
        console.log('URL after clicking:', page.url());

        if (page.url().includes('cognito')) {
          console.log('✅ Successfully redirected to Cognito!');
          console.log('Full Cognito URL:', page.url());
        } else {
          console.log('❌ Did NOT redirect to Cognito');
          console.log('Current URL:', page.url());
          await page.screenshot({
            path: 'tests/screenshots/debug-after-click.png',
            fullPage: true,
          });
        }
      }
    } else if (page.url().includes('/dashboard')) {
      console.log('\n=== Already on Dashboard (user may be logged in) ===');
      await page.screenshot({ path: 'tests/screenshots/debug-dashboard.png', fullPage: true });
    } else {
      console.log('\n=== Unknown Page ===');
      console.log('Current URL:', page.url());
      await page.screenshot({ path: 'tests/screenshots/debug-unknown.png', fullPage: true });
    }

    // Check localStorage for existing auth
    const storage = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const data: Record<string, string> = {};
      keys.forEach(key => {
        data[key] = localStorage.getItem(key) || '';
      });
      return data;
    });

    console.log('\n=== LocalStorage Contents ===');
    Object.keys(storage).forEach(key => {
      if (key.includes('oidc')) {
        console.log(`${key}: [REDACTED - ${storage[key].length} chars]`);
      } else {
        console.log(`${key}:`, storage[key]);
      }
    });
  });
});
