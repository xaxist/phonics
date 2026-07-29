import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  let hasErrors = false;
  
  page.on('console', msg => {
    console.log(`[BROWSER] ${msg.type().toUpperCase()}: ${msg.text()}`);
    if (msg.type() === 'error') {
      hasErrors = true;
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
    hasErrors = true;
  });
  
  console.log("Navigating to http://localhost:5173/...");
  await page.goto('http://localhost:5173/');
  
  try {
    console.log("Waiting for app to render...");
    await page.waitForSelector('.journey-container', { timeout: 5000 });
    console.log("App rendered successfully!");
    
    console.log("Clicking a lesson node to test navigation...");
    await page.waitForSelector('.map-node', { timeout: 5000 });
    await page.click('.map-node');
    
    console.log("Waiting for LessonDetail to render...");
    await page.waitForSelector('.lesson-detail', { timeout: 5000 });
    console.log("LessonDetail loaded successfully!");
    
    if (hasErrors) {
      console.error("Test finished, but page had console errors.");
      process.exit(1);
    } else {
      console.log("All tests passed! No React or DOM errors.");
      process.exit(0);
    }
  } catch (err) {
    console.error("Test failed:", err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
