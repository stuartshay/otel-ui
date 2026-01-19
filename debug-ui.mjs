import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console messages
  page.on('console', msg => {
    console.log(`[Browser ${msg.type()}]`, msg.text());
  });

  // Listen to page errors
  page.on('pageerror', error => {
    console.error('[Browser Error]', error.message);
    console.error(error.stack);
  });

  // Listen to network errors
  page.on('requestfailed', request => {
    console.error('[Network Failed]', request.url(), request.failure().errorText);
  });

  console.log('Navigating to http://localhost:5173/...');
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    console.log('Page loaded successfully');

    // Get page content
    const content = await page.content();
    console.log('\n=== Page HTML ===');
    console.log(content.substring(0, 500));

    // Check if root element exists
    const rootExists = await page.locator('#root').count();
    console.log('\n=== Root Element ===');
    console.log('Root element exists:', rootExists > 0);

    // Get root content
    const rootContent = await page.locator('#root').innerHTML();
    console.log('Root innerHTML length:', rootContent.length);
    if (rootContent.length > 0) {
      console.log('Root content preview:', rootContent.substring(0, 200));
    }

    // Take a screenshot
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    console.log('\nScreenshot saved to debug-screenshot.png');

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
  console.log('\nDone!');
})();
