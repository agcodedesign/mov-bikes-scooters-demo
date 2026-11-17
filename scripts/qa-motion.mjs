import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [320, 768, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 960 }, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'domcontentloaded' });
    await page.locator('#mov-preloader').waitFor({ state: 'hidden' });
    await page.waitForFunction(() => document.querySelector('.hero-content').getAnimations({ subtree: true }).length > 0);
    assert.equal(await page.locator('.hero h1 > span').count(), 3);
    await page.waitForTimeout(1200);
    const primary = page.locator('.hero-actions .button').first();
    await primary.hover();
    await page.mouse.down();
    await page.waitForTimeout(130);
    assert.ok(Number.parseFloat(await primary.evaluate(el => getComputedStyle(el).scale)) < .98);
    // Move away before release: no accidental navigation, and interrupted presses must settle.
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await page.waitForTimeout(450);
    assert.equal(await primary.evaluate(el => getComputedStyle(el).scale), 'none');
    if (width < 1100) {
      const toggle = page.locator('.menu-toggle');
      await toggle.click();
      assert.ok(await page.locator('.mobile-menu').evaluate(el => el.getAnimations({ subtree: true }).length > 0));
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.mobile-menu').evaluate(el => el.getAnimations({ subtree: true }).length), 0);
      await toggle.click();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(60);
      assert.equal(await page.locator('.mobile-menu').evaluate(el => el.getAnimations({ subtree: true }).length), 0);
      await page.keyboard.press('Escape');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.querySelector('.benefits').scrollIntoView();
    });
    await page.waitForFunction(() => document.querySelector('.benefit-card').getAnimations().length > 0);
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('.benefit-card').first().evaluate(el => getComputedStyle(el).opacity), '1');
    await page.evaluate(() => document.querySelector('.newsletter').scrollIntoView());
    await page.waitForTimeout(1100);
    await page.locator('.newsletter img').evaluate(img => img.decode());
    if (width === 1920) {
      assert.match(await page.locator('.newsletter img').evaluate(img => img.currentSrc), /ultrawide/);
      await page.locator('.newsletter').screenshot({ path: 'artifacts/qa/newsletter-ultrawide.png' });
      const button = page.locator('.signup button');
      await button.hover();
      await page.waitForTimeout(200);
      assert.notEqual(await button.evaluate(el => getComputedStyle(el).transform), 'none');
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const model = page.locator('.featured a[aria-label="Conhecer modelo V8 Pro S"]');
    // Follow the scroll scene to its completed composition before clicking its revealed action.
    await page.locator('.showcase').evaluate(el => {
      const spacer = el.parentElement;
      scrollTo(0, spacer.offsetTop + parseFloat(spacer.style.paddingBottom) * .9);
    });
    await page.waitForTimeout(1200);
    await model.focus();
    assert.equal(await model.getAttribute('href'), '/produtos/v8-pro-s/');
    assert.equal(await model.evaluate(el => el === document.activeElement), true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length), 0);
    assert.deepEqual(errors, []);
    results.push({ width, entrance: 'passed', springPressInterruption: 'passed', menu: width < 1100 ? 'passed' : 'desktop', scrollReveal: 'passed', reducedMotion: 'passed', overflow: false });
    await page.close();
  }
  const noJS = await browser.newPage({ javaScriptEnabled: false });
  await noJS.goto('http://127.0.0.1:4321/');
  assert.equal(await noJS.locator('h1').evaluate(el => getComputedStyle(el).opacity), '1');
  await writeFile('artifacts/qa/motion-report.json', JSON.stringify({ results, noJSVisible: true }, null, 2));
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
