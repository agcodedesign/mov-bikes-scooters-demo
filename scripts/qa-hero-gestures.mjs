import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true });
const report = [];
try {
  for (const [width, touch] of [[1920, false], [768, true], [430, true], [320, true]]) {
    const context = await browser.newContext({ viewport: { width, height: 932 }, hasTouch: touch, isMobile: touch });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
    await page.locator('#mov-preloader').waitFor({ state: 'hidden' });
    await page.waitForTimeout(1500);
    const box = await page.locator('.hero').boundingBox();
    const y = Math.min(box.y + box.height * .7, 820);
    const a = width * .8, b = width * .25;
    const swipe = async (from, to, vertical = false) => {
      if (!touch) {
        await page.mouse.move(from, y);
        await page.mouse.down();
        await page.mouse.move(to, y, { steps: 12 });
        await page.waitForTimeout(40);
        const liveShift = await page.locator('.hero-slide.is-active picture').evaluate(el => Number.parseFloat(getComputedStyle(el).translate));
        assert.ok(from > to ? liveShift < 0 : liveShift > 0, 'Photographic plane must follow mouse drag');
        await page.mouse.up();
      } else {
        const cdp = await context.newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from, y }] });
        for (let i = 1; i <= 12; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: vertical ? from : from + (to - from) * i / 12, y: vertical ? y - i * 9 : y }] });
        if (!vertical) {
          await page.waitForTimeout(40);
          const liveShift = await page.locator('.hero-slide.is-active picture').evaluate(el => Number.parseFloat(getComputedStyle(el).translate));
          assert.ok(from > to ? liveShift < 0 : liveShift > 0, 'Photographic plane must follow touch drag');
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await cdp.detach();
      }
    };
    await swipe(a, b);
    assert.equal(await page.locator('[data-slide="1"]').getAttribute('aria-current'), 'true', `${width}: next drag`);
    await page.waitForTimeout(1300);
    await swipe(b, a);
    assert.equal(await page.locator('[data-slide="0"]').getAttribute('aria-current'), 'true', `${width}: previous drag`);
    await page.waitForTimeout(1300);
    if (width <= 600) {
      assert.match(await page.locator('.hero-slide.is-active img').evaluate(el => el.currentSrc), /mobile-v1/);
      await page.screenshot({ path: `artifacts/qa/mobile-hero-${width}.png` });
    }
    if (touch) {
      await swipe(a, b, true);
      assert.equal(await page.locator('[data-slide="0"]').getAttribute('aria-current'), 'true', 'Vertical pan must not change slides');
    } else {
      // Pointer stays over the hero; autoplay must still advance.
      await page.mouse.move(a, y);
      await page.waitForTimeout(4200);
      assert.equal(await page.locator('[data-slide="1"]').getAttribute('aria-current'), 'true');
    }
    assert.deepEqual(errors, []);
    report.push({ width, touch, liveDrag: 'passed', next: 'passed', previous: 'passed', verticalPan: touch ? 'passed' : 'n/a', portraitSource: width <= 600 });
    await context.close();
  }
  await writeFile('artifacts/qa/hero-gestures-report.json', JSON.stringify(report, null, 2));
  console.log('Mouse drag, real touch swipe, vertical pan, portrait photos and autoplay over hero passed.');
} finally { await browser.close(); }
