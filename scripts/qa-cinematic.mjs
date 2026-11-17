import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true });
const errors = [];
const evidence = [];
try {
  for (const width of [390, 768, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 960 }, reducedMotion: 'no-preference' });
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
    await page.locator('#mov-preloader').waitFor({ state: 'hidden' });
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    await page.waitForTimeout(1200);
    assert.ok(await page.locator('html').evaluate(el => el.classList.contains('cinema-active')));
    {
      const range = await page.locator('.showcase').evaluate(el => ({ start: el.parentElement.offsetTop, distance: parseFloat(el.parentElement.style.paddingBottom) }));
      assert.ok(range.distance > 1000);
      const frames = [];
      for (const progress of [.05, .55, .95]) {
        await page.evaluate(y => scrollTo(0, y), range.start + range.distance * progress);
        await page.waitForTimeout(1100);
        await page.locator('.product-opening img').evaluate(img => img.decode());
        if (progress > .9) await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.product-opening')).opacity) < .01);
        frames.push(await page.locator('.product-opening').evaluate(el => {
          const rect = el.getBoundingClientRect();
          return { width: rect.width, height: rect.height, x: rect.x, opacity: Number(getComputedStyle(el).opacity) };
        }));
        await page.screenshot({ path: `artifacts/qa/cinema-product-${width}-${progress}.png` });
      }
      assert.ok(frames[0].width >= width - 2, 'Opening photograph must fill the viewport width');
      assert.ok(frames[0].height >= 958, 'Opening photograph must fill the viewport height');
      assert.ok(frames[2].width < width - 10, 'Photograph must settle into the product card');
      assert.ok(frames[2].opacity < .01, 'Opening layer hands off to the semantic product card');
      evidence.push({ width, fullscreenToCard: frames });
    }
    for (const selector of ['.brand', '.editorial', '.experience', '.newsletter']) {
      await page.locator(selector).evaluate(el => el.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(1000);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow ${width} ${selector}`);
      if (width === 1920) await page.screenshot({ path: `artifacts/qa/cinema-${selector.slice(1)}.png` });
    }
    if (width >= 1100) {
      await page.setViewportSize({ width: 768, height: 960 });
      await page.waitForTimeout(1000);
      assert.equal(await page.locator('.pin-spacer').count(), 2);
      await page.setViewportSize({ width, height: 960 });
      await page.waitForTimeout(1000);
      assert.equal(await page.locator('.pin-spacer').count(), 2);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.pin-spacer').count(), 0);
    assert.equal(await page.locator('.cinema-product').count(), 0);
    assert.equal(await page.locator('.word-motion').first().evaluate(el => getComputedStyle(el).transform), 'none');
    await page.close();
  }
  assert.deepEqual(errors, []);
  await writeFile('artifacts/qa/cinematic-report.json', JSON.stringify({ evidence, errors, responsive: [390, 768, 1440, 1920], reducedMotionCleanup: 'passed' }, null, 2));
  console.log('Cinematic scroll: product stage travels, four responsive widths, downstream scenes and dynamic reduced-motion cleanup passed.');
} finally { await browser.close(); }
