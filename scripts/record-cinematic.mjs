import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: 'artifacts/qa/video', size: { width: 1440, height: 900 } } });
const page = await context.newPage();
await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
await page.locator('#mov-preloader').waitFor({ state: 'hidden' });
await page.waitForTimeout(1800);
// Native browser scroll, sampled smoothly; this only records the demonstration.
await page.evaluate(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const end = document.documentElement.scrollHeight - innerHeight;
  const start = performance.now();
  await new Promise(resolve => {
    const step = time => {
      const progress = Math.min((time - start) / 24000, 1);
      scrollTo(0, progress * end);
      if (progress < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
});
await page.waitForTimeout(900);
const video = page.video();
await context.close();
await video.saveAs('artifacts/qa/mov-cinematic-preview.webm');
await video.delete();
await browser.close();
console.log('Saved artifacts/qa/mov-cinematic-preview.webm');
