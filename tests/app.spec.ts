import { test, expect } from '@playwright/test';

test.describe('otel-ui Basic Functionality', () => {
  test('should load the login page', async ({ page }) => {
    console.log('Navigating to home page...');

    // Listen to console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.error(`[Browser Error] ${text}`);
      } else if (type === 'warning') {
        console.warn(`[Browser Warning] ${text}`);
      } else {
        console.log(`[Browser ${type}] ${text}`);
      }
    });

    // Listen to page errors
    page.on('pageerror', error => {
      console.error('[Page Error]', error.message);
      console.error(error.stack);
    });

    await page.goto('/');

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Take a screenshot
    await page.screenshot({ path: 'tests/screenshots/home.png', fullPage: true });
    console.log('Screenshot saved to tests/screenshots/home.png');

    // Check if we're redirected to login
    const url = page.url();
    console.log('Current URL:', url);

    // Check page title
    const title = await page.title();
    console.log('Page title:', title);

    // Check if root element has content
    const rootContent = await page.locator('#root').innerHTML();
    console.log('Root element has content:', rootContent.length > 0);
    console.log('Root content length:', rootContent.length);

    if (rootContent.length > 0) {
      console.log('First 300 chars of root content:');
      console.log(rootContent.substring(0, 300));
    }

    // Check for login button or heading
    const hasLoginButton = await page.locator('button:has-text("Sign In")').count();
    const hasWelcomeText = await page.locator('text=Welcome').count();

    console.log('Has "Sign In" button:', hasLoginButton > 0);
    console.log('Has "Welcome" text:', hasWelcomeText > 0);

    // Get all visible text on the page
    const bodyText = await page.locator('body').innerText();
    console.log('\n=== Page Content ===');
    console.log(bodyText);

    // Basic assertion - page should have loaded something
    expect(rootContent.length).toBeGreaterThan(0);
  });
});
