import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true, ...(process.env.QA_BROWSER ? { executablePath: process.env.QA_BROWSER } : {}) });
const results = [];
async function scenario(name, run) { try { await run(); results.push({ name, pass: true }); } catch(error) { results.push({ name, pass: false, error: error.message }); } }
try {
  await scenario('Email stays off URL with JavaScript disabled', async () => {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.goto('http://127.0.0.1:4321/');
    await page.getByLabel('Seu e-mail', { exact: true }).fill('private@example.com');
    const disabled = await page.getByRole('button', { name: 'Inscrever-se', exact: true }).isDisabled();
    if (!disabled) { await page.getByRole('button', { name: 'Inscrever-se', exact: true }).click(); await page.waitForLoadState(); }
    assert.ok(!page.url().includes('email='), page.url());
    await page.close();
  });
  await scenario('Nested dialogs restore the original external trigger', async () => {
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:4321/');
    const opener = page.getByRole('button', { name: 'Ver todos os modelos', exact: true });
    await opener.click();
    await page.getByRole('button', { name: 'Conhecer a V8 Pro S', exact: true }).click();
    await page.getByRole('button', { name: 'Tenho interesse na V8 Pro S', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    assert.ok(await opener.evaluate(e => document.activeElement === e));
    await page.close();
  });
  await scenario('Hidden mobile trigger returns focus to visible menu toggle', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://127.0.0.1:4321/');
    const toggle = page.getByRole('button', { name: 'Abrir menu', exact: true });
    await toggle.click();
    await page.locator('#mobile-menu').getByRole('button', { name: 'Falar com a MOV', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    assert.ok(await toggle.evaluate(e => document.activeElement === e));
    await page.close();
  });
  await scenario('Quote remains inside its card at 320px and 200% text', async () => {
    const page = await browser.newPage({ viewport: { width: 320, height: 844 } });
    await page.goto('http://127.0.0.1:4321/');
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    const fit = await page.locator('.brand-quote p').evaluate(e => { const p=e.getBoundingClientRect(), c=e.parentElement.getBoundingClientRect(); return p.top>=c.top && p.bottom<=c.bottom+1; });
    assert.ok(fit, 'Quote text clipped at 200%');
    await page.close();
  });
} finally { await browser.close(); }
await mkdir('artifacts/qa', { recursive:true });
await writeFile('artifacts/qa/regressions.json', JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
if (results.some(r=>!r.pass)) process.exitCode=1;
