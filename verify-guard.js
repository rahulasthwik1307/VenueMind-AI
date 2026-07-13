/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright');


(async () => {
  console.log('Starting back-navigation guard verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Open landing page
    console.log('Navigating to landing page...');
    await page.goto('http://127.0.0.1:3000/');
    
    // 2. Click 'Enter Command Center'
    console.log('Entering Command Center...');
    const enterBtn = page.locator('a:has-text("Enter Command Center")').first();
    await enterBtn.click();
    await page.waitForURL('**/dashboard');
    console.log('Successfully reached /dashboard');

    // 3. Navigate through 4 different pages
    const routes = ['/incidents', '/map', '/transport', '/emergency'];
    for (const route of routes) {
      console.log(`Navigating to ${route}...`);
      await page.goto(`http://127.0.0.1:3000${route}`);
      await page.waitForURL(`**${route}`);
    }
    console.log('Completed navigating through 4 pages.');

    // 4. Press back button repeatedly (5+ times)
    console.log('Pressing browser back button repeatedly...');
    
    // back from /emergency to /transport
    await page.goBack();
    console.log(`Went back to: ${page.url()}`);
    
    // back from /transport to /map
    await page.goBack();
    console.log(`Went back to: ${page.url()}`);
    
    // back from /map to /incidents
    await page.goBack();
    console.log(`Went back to: ${page.url()}`);
    
    // back from /incidents to /dashboard
    await page.goBack();
    console.log(`Went back to: ${page.url()}`);
    
    // back from /dashboard (Real) -> should hit Guard and trigger dialog
    await page.goBack();
    console.log(`Went back to: ${page.url()}`);

    // Wait for the dialog to appear
    console.log('Checking if exit dialog appeared...');
    await page.waitForSelector('text=You\'re already at the first page', { timeout: 3000 });
    console.log('SUCCESS: Exit dialog appeared on back navigation!');

    // 5. Click "Cancel" (Stay)
    console.log('Clicking "Cancel" (Stay)...');
    await page.click('button:has-text("Cancel")');
    console.log(`URL after clicking Stay: ${page.url()}`);
    
    // 6. Navigate to 2 other pages
    const extraRoutes = ['/ai-command', '/settings'];
    for (const route of extraRoutes) {
      console.log(`Navigating to ${route}...`);
      await page.goto(`http://127.0.0.1:3000${route}`);
      await page.waitForURL(`**${route}`);
    }
    console.log('Completed navigating to 2 other pages.');

    // 7. Press back repeatedly to hit the guard again
    console.log('Pressing back again repeatedly...');
    await page.goBack(); // back to /ai-command
    console.log(`Went back to: ${page.url()}`);
    await page.goBack(); // back to /dashboard
    console.log(`Went back to: ${page.url()}`);
    await page.goBack(); // back to Guard -> triggers dialog
    console.log(`Went back to: ${page.url()}`);

    await page.waitForSelector('text=You\'re already at the first page', { timeout: 3000 });
    console.log('SUCCESS: Exit dialog appeared AGAIN after subsequent navigations! (Re-armed successfully)');

    // 8. Click "Go to Landing Page" (Exit)
    console.log('Clicking "Go to Landing Page"...');
    await page.click('button:has-text("Go to Landing Page")');
    await page.waitForURL('http://127.0.0.1:3000/');
    console.log('SUCCESS: Successfully exited to landing page!');

    // 9. Re-enter the Command Center to test re-entry arming
    console.log('Re-entering Command Center...');
    const reEnterBtn = page.locator('a:has-text("Enter Command Center")').first();
    await reEnterBtn.click();
    await page.waitForURL('**/dashboard');
    
    // Press back immediately to verify guard is armed on re-entry
    console.log('Pressing back on re-entered session...');
    await page.goBack();
    await page.waitForSelector('text=You\'re already at the first page', { timeout: 3000 });
    console.log('SUCCESS: Exit dialog appeared on re-entered session! (Re-armed on re-entry successfully)');

    console.log('ALL VERIFICATION STEPS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('VERIFICATION FAILED:', error);
  } finally {
    await browser.close();
  }
})();
