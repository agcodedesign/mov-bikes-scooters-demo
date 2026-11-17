import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await page.locator('#mov-preloader').waitFor({ state: 'hidden' });
  assert.equal(await page.locator('.hero-slide').count(), 3);
  await page.waitForTimeout(5400);
  assert.equal(await page.locator('[data-slide="1"]').getAttribute('aria-current'), 'true');
  await page.getByRole('button', { name: 'Mostrar imagem 3', exact: true }).click();
  assert.equal(await page.locator('[data-slide="2"]').getAttribute('aria-current'), 'true');
  await page.getByRole('button', { name: 'Mostrar imagem 2', exact: true }).click();
  assert.equal(await page.locator('[data-slide="1"]').getAttribute('aria-current'), 'true');
  await page.getByRole('button', { name: 'Mostrar imagem 3', exact: true }).click();
  await page.getByRole('button', { name: 'Pausar imagens', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Reproduzir imagens', exact: true }).count(), 1);
  await page.getByRole('link', { name: 'MOV Bikes & Scooters, início', exact: true }).click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(5300);
  assert.equal(await page.locator('[data-slide="2"]').getAttribute('aria-current'), 'true');
  const frame = await page.locator('.hero').boundingBox();
  assert.equal(frame.width, 1920);
  assert.equal(frame.height, 690);
  await page.getByRole('button', { name: 'Mostrar imagem 1', exact: true }).click();
  await page.waitForTimeout(800);
  await page.locator('.hero').screenshot({ path: 'artifacts/qa/hero-1920.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.getByRole('button', { name: 'Reproduzir imagens', exact: true }).count(), 1);
  console.log('Hero: 3 images, autoplay, indicators, pause, full-width 1920x690 frame, reduced motion and mobile overflow passed.');
} finally { await browser.close(); }
