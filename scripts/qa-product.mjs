import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.QA_URL||'http://127.0.0.1:4321';
const directory='artifacts/qa';await mkdir(directory,{recursive:true});
const browser=await chromium.launch({args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
const report={url:base+'/produtos/v8-pro-s/',viewports:[],interactions:[],errors:[]};
const centerChapter=async(page,id)=>{
  await page.locator(`[data-scene-step="${id}"] .story-card`).evaluate(element=>scrollTo(0,element.getBoundingClientRect().top+scrollY+element.offsetHeight*.5-innerHeight*(innerWidth<768?.70:.50)));
  await page.waitForTimeout(650);
};
try {
  for(const width of [320,390,768,1024,1440,1920]){
    const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});
    const page=await context.newPage();page.setDefaultTimeout(15000);
    page.on('pageerror',error=>report.errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)report.errors.push(`${response.status()} ${response.url()}`);});
    await page.goto(report.url,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('[data-product-viewer]')?.dataset.sceneState==='ready');
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('.product-experience').evaluate(element=>scrollTo(0,element.offsetTop));
    await page.waitForTimeout(400);
    const size=await page.locator('[data-product-viewer]').boundingBox();
    assert.equal(Math.round(size.width),width);assert.equal(Math.round(size.height),960);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:`${directory}/product-studio-${width}.png`});
    await centerChapter(page,'battery');
    assert.equal(await page.locator('[data-product-viewer]').getAttribute('data-active-part'),'battery');
    await page.screenshot({path:`${directory}/product-close-${width}.png`});
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    report.viewports.push({width,fullViewport:true,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    if(width===1440){
      await page.locator('.part-action[data-part="battery"]').click();
      assert.equal(await page.locator('[data-product-viewer]').getAttribute('data-mode'),'free');
      assert.equal(await page.locator('.viewer-caption').isVisible(),true);
      await page.locator('[data-zoom="in"]').click();await page.locator('[data-zoom="out"]').click();
      await page.locator('[data-overview]').click();
      assert.equal(await page.locator('[data-product-viewer]').getAttribute('data-active-part'),'overview');
      await page.locator('[data-scene-link="light"]').click();await page.waitForTimeout(400);
      assert.equal(await page.locator('[data-product-viewer]').getAttribute('data-mode'),'tour');
      assert.equal(await page.locator('[data-product-viewer]').getAttribute('data-active-part'),'light');
      await page.screenshot({path:`${directory}/product-light-1440.png`});
      report.interactions.push('Part close-up, floating information, overview, zoom, keyboard-native chapter navigation');
    }
    await context.close();
  }
  // Model failure must preserve real photos and usable narrative.
  const fallback=await browser.newPage({reducedMotion:'reduce'});fallback.setDefaultTimeout(15000);
  await fallback.route('**/models/v8-pro-s.glb',route=>route.abort());
  await fallback.goto(report.url,{waitUntil:'networkidle'});
  await fallback.waitForFunction(()=>document.querySelector('[data-product-viewer]')?.dataset.sceneState==='fallback');
  assert.equal(await fallback.locator('.product-poster').isVisible(),true);
  await fallback.locator('.part-action').first().click();assert.ok(await fallback.locator('#fotos').isVisible());
  report.interactions.push('GLB failure: original photography and narrative remain available');
  await fallback.close();
  const noJs=await browser.newPage({javaScriptEnabled:false});await noJs.goto(report.url);
  assert.equal(await noJs.locator('h1').isVisible(),true);assert.equal(await noJs.locator('.product-poster').isVisible(),true);
  await noJs.close();report.interactions.push('No JavaScript: product copy and photographs remain visible');
  assert.deepEqual(report.errors,[]);
  assert.ok(report.viewports.every(view=>view.violations.length===0),'Accessibility violations: inspect report');
} finally {await writeFile(`${directory}/product-report.json`,JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify(report,null,2));
