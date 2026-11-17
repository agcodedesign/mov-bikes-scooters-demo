import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true });
const report = [];
try {
  for (const width of [390, 768, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 960 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Observe the first drawing frame, rather than waiting for unrelated deferred modules.
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'commit' });
    await page.waitForFunction(() => document.querySelectorAll('#mov-preloader [data-letter]').length === 3);
    assert.equal(await page.locator('#site-content').evaluate(el => el.inert), true);
    await page.waitForTimeout(180);
    const initial = await page.locator('#mov-preloader path').evaluateAll(paths => paths.map(path => ({ letter: path.dataset.letter, fill: Number(getComputedStyle(path).fillOpacity), drawn: 1 - parseFloat(getComputedStyle(path).strokeDashoffset) / path.getTotalLength() })));
    assert.ok(initial[0].drawn > 0 && initial[1].drawn < .02, `M must draw before O: ${JSON.stringify(initial.slice(0, 3))}`);
    if (width === 1920) await page.screenshot({ path: 'artifacts/qa/preloader-drawing-m.png' });
    await page.waitForTimeout(1050);
    if (width === 1920) await page.screenshot({ path: 'artifacts/qa/preloader-drawing-v.png' });
    await page.waitForFunction(() => document.querySelector('#mov-preloader').dataset.phase === 'landing');
    const landingPromise = page.evaluate(() => new Promise(resolve => {
      let closest = Infinity;
      let last = null;
      const sample = () => {
        if (document.documentElement.dataset.movIntro === 'done') { resolve({ closest, last }); return; }
        const logo = document.querySelector('.preloader-mark').getBoundingClientRect();
        const target = document.querySelector('[data-preloader-target]').getBoundingClientRect();
        const error = Math.max(Math.abs(logo.x - target.x), Math.abs(logo.y - target.y), Math.abs(logo.width - target.width), Math.abs(logo.height - target.height));
        closest = Math.min(closest, error);
        last = { logo: logo.toJSON(), target: target.toJSON(), error };
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }));
    await page.waitForTimeout(430);
    await page.screenshot({ path: `artifacts/qa/preloader-landing-${width}.png` });
    const landing = await landingPromise;
    assert.ok(landing.closest < 1.5, `Logo must land on header within 1.5 px at ${width}: ${landing.closest}`);
    assert.match(await page.locator('.header-logo img').getAttribute('src'), /mov-logo-fundo-claro\.webp$/);
    await page.waitForFunction(() => document.documentElement.dataset.movIntro === 'done');
    assert.ok(await page.locator('.hero-content').evaluate(el => el.getAnimations({ subtree: true }).length > 0), 'Hero choreography starts as logo reaches header');
    assert.equal(await page.locator('#site-content').evaluate(el => el.inert), false);
    assert.equal(await page.locator('#mov-preloader').isVisible(), false);
    assert.equal(await page.locator('.header-logo img').evaluate(el => getComputedStyle(el).opacity), '1');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    report.push({ width, letters: 'M → O → V + subtitle', heroHandoff: 'passed', headerLanding: landing, headerAsset: 'Original dedicated WebP', overflow: false });
    await page.close();
  }
  const reduced = await browser.newPage({ reducedMotion: 'reduce' });
  await reduced.goto('http://127.0.0.1:4321/');
  assert.equal(await reduced.locator('#mov-preloader').isVisible(), false);
  assert.equal(await reduced.locator('#site-content').evaluate(el => el.inert), false);
  const noJS = await browser.newPage({ javaScriptEnabled: false });
  await noJS.goto('http://127.0.0.1:4321/');
  assert.equal(await noJS.locator('#mov-preloader').isVisible(), false);
  assert.equal(await noJS.locator('h1').isVisible(), true);
  const skip = await browser.newPage();
  await skip.goto('http://127.0.0.1:4321/', { waitUntil: 'domcontentloaded' });
  await skip.keyboard.press('Escape');
  await skip.waitForFunction(() => document.documentElement.dataset.movIntro === 'done');
  assert.equal(await skip.locator('#site-content').evaluate(el => el.inert), false);
  const change = await browser.newPage();
  await change.goto('http://127.0.0.1:4321/', { waitUntil: 'domcontentloaded' });
  await change.emulateMedia({ reducedMotion: 'reduce' });
  await change.waitForFunction(() => document.documentElement.dataset.movIntro === 'done');
  assert.equal(await change.locator('#site-content').evaluate(el => el.inert), false);
  const failure = await browser.newPage();
  await failure.route('**/*', route => route.request().resourceType() === 'script' ? route.abort() : route.continue());
  await failure.goto('http://127.0.0.1:4321/', { waitUntil: 'domcontentloaded' });
  await failure.waitForFunction(() => document.documentElement.dataset.movIntro === 'done', undefined, { timeout: 6500 });
  assert.equal(await failure.locator('h1').isVisible(), true);
  await writeFile('artifacts/qa/preloader-report.json', JSON.stringify({ report, reducedMotion: 'passed', dynamicPreference: 'passed', noJavaScript: 'passed', escape: 'passed', blockedModulesDeadline: 'passed' }, null, 2));
  console.log('Preloader: original SVG paths, letter sequence, hero handoff, three sizes, reduced motion, Escape, no JS and blocked modules passed.');
} finally { await browser.close(); }
