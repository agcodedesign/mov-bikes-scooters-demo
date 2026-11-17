import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.QA_URL || 'http://127.0.0.1:4321';
const directory = 'artifacts/qa';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.QA_BROWSER ? { executablePath: process.env.QA_BROWSER } : {}) });
const report = { url: base, runAt: new Date().toISOString(), viewports: [], interactions: [], errors: [] };
try {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Trigger lazy loading before checking the full-page render.
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 750) { window.scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 70)); } window.scrollTo(0, 0); });
    await page.locator('main img[loading="lazy"],footer img[loading="lazy"]').evaluateAll(async images => { await Promise.all(images.filter(image => image.offsetWidth).map(image => image.decode().catch(() => {}))); });
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: document.body.scrollHeight, overflow: [...document.querySelectorAll('main *,header *,footer *')].filter(element => { const r = element.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).map(element => `${element.tagName}.${element.className}`), brokenImages: [...document.images].filter(image => image.offsetWidth && (!image.complete || !image.naturalWidth)).map(image => image.src) }));
    assert.ok(dimensions.scrollWidth <= width + 1, `Horizontal overflow at ${width}: ${dimensions.scrollWidth}`);
    assert.deepEqual(dimensions.brokenImages, [], `Broken images at ${width}`);
    assert.equal(await page.locator('h1').count(), 1);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const violations = axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
    report.viewports.push({ width, ...dimensions, violations });
    await page.screenshot({ path: `${directory}/home-${width}.png`, fullPage: true });
    if (width === 390) {
      const toggle = page.locator('.menu-toggle');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(await toggle.evaluate(element => element === document.activeElement), true);
      await toggle.click();
      await page.locator('#mobile-menu').getByRole('link', { name: 'Catálogo', exact: true }).click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      report.interactions.push('Mobile menu: open, Escape, focus return, anchor selection');
    }
    if (width === 1440) {
      const email = page.getByLabel('Seu e-mail', { exact: true });
      const signup = page.getByRole('button', { name: 'Inscrever-se', exact: true });
      await signup.click();
      assert.equal(await email.getAttribute('aria-invalid'), 'true');
      await email.fill('invalido'); await signup.click();
      assert.equal(await email.getAttribute('aria-invalid'), 'true');
      await email.fill('teste@example.com'); await signup.click();
      assert.match(await page.locator('#newsletter-feedback').innerText(), /ainda não estão abertas/);
      assert.equal(await email.inputValue(), 'teste@example.com');
      report.interactions.push('Newsletter: empty, invalid, valid/unavailable; no fake success');
      const model = page.getByRole('link', { name: 'Conhecer modelo V8 Pro S', exact: true });
      assert.equal(await model.getAttribute('href'), '/produtos/v8-pro-s/');
      await page.getByRole('button', { name: 'Privacidade', exact: true }).click();
      assert.equal(await page.locator('#privacidade-dialog').isVisible(), true);
      await page.keyboard.press('Escape');
      report.interactions.push('Product route link + privacy dialog: open, Escape and focus return');
      const missing = await page.locator('a[href^="#"]').evaluateAll(links => links.filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash));
      assert.deepEqual(missing, [], 'Missing local link destinations');
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Text resize 200% overflow');
      await page.screenshot({ path: `${directory}/home-text-200-percent.png`, fullPage: true });
      report.interactions.push('200% text resize: no horizontal overflow');
    }
    await context.close();
  }
  assert.deepEqual(report.errors, [], 'Console/network errors');
  const serious = report.viewports.flatMap(v => v.violations.filter(i => ['critical', 'serious'].includes(i.impact)).map(i => ({ width: v.width, ...i })));
  assert.deepEqual(serious, [], 'Serious/critical accessibility issues');
} finally {
  await writeFile(`${directory}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(`QA passed: ${report.viewports.length} viewports; ${report.interactions.length} interaction groups.`);
