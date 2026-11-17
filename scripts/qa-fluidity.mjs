import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true });
const report = [];
try {
  for (const width of [390, 768, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 960 } });
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
    await page.locator('#mov-preloader').waitFor({ state: 'hidden' });
    await page.evaluate(() => document.documentElement.style.scrollBehavior = 'auto');
    const range = await page.locator('.showcase').evaluate(el => ({ start: el.parentElement.offsetTop, span: parseFloat(el.parentElement.style.paddingBottom) }));
    await page.evaluate(y => scrollTo(0, y), range.start + range.span * .2);
    await page.waitForTimeout(900);
    await page.locator('.product-opening img').evaluate(img => img.decode());
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Performance.enable');
    const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(metric => [metric.name, metric.value]));
    const before = await metrics();
    await page.evaluate(async ({ start, span }) => {
      const time = performance.now();
      await new Promise(resolve => {
        const frame = now => {
          const t = Math.min(1, (now - time) / 1500);
          scrollTo(0, start + span * (.2 + .5 * t));
          if (t < 1) requestAnimationFrame(frame); else resolve();
        };
        requestAnimationFrame(frame);
      });
    }, range);
    await page.waitForTimeout(800);
    const after = await metrics();
    const geometry = await page.locator('.product-opening').evaluate(el => {
      const frame = new DOMMatrix(getComputedStyle(el).transform);
      const photo = new DOMMatrix(getComputedStyle(el.querySelector('img')).transform);
      return { x: frame.a * photo.a, y: frame.d * photo.d };
    });
    assert.ok(Math.abs(geometry.x - geometry.y) < .001, `Photo distorted at ${width}`);
    const layouts = after.LayoutCount - before.LayoutCount;
    // Allow isolated pin/resource housekeeping; reject layout work repeating across the ~90 frames.
    assert.ok(layouts <= 8, `Layout repeated across scrolling frames at ${width}: ${layouts}`);
    await page.screenshot({ path: `artifacts/qa/fluid-product-${width}.png` });
    // Reverse through the scene: the same frame must return without a size/position jump.
    await page.evaluate(y => scrollTo(0, y), range.start + range.span * .02);
    await page.waitForTimeout(1000);
    const returned = await page.locator('.product-opening').boundingBox();
    assert.ok(Math.abs(returned.width - width) < 2 && Math.abs(returned.height - 960) < 2);
    report.push({ width, layoutsDuringProductScroll: layouts, uniformPhotoScale: geometry, reverse: 'passed' });
    await page.close();
  }
  await writeFile('artifacts/qa/fluidity-report.json', JSON.stringify({ environment: 'Local headless Chromium; not a physical-device benchmark', results: report }, null, 2));
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
