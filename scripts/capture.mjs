import {launchBrowser} from './browser.mjs';import {previewURL} from './paths.mjs';import fs from 'node:fs';
const iter=process.argv[2]||'01',views=(process.argv[3]||'front,three,back,face').split(',');
const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:900,height:1100},deviceScaleFactor:1});page.setDefaultTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto(previewURL+'/?capture=1'+(process.argv.includes('--prebuilt')?'&prebuilt=1':''),{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__APP__?.ready,null,{timeout:120000});
console.log('Geometry ready',await page.evaluate(()=>{let invalid=0;window.__APP__.model.traverse(o=>{if(o.isMesh)for(const n of o.geometry.attributes.position.array)if(!Number.isFinite(n))invalid++;});return {invalid,...window.__APP__.getStats()};}));
for(const v of views){await page.evaluate(v=>window.__APP__.setView(v),v);await page.waitForTimeout(1800);await page.screenshot({timeout:120000,path:`public/preview/rev-${iter}-${v}.png`});}
console.log(JSON.stringify({iteration:iter,stats:await page.evaluate(()=>window.__APP__.getStats()),errors},null,2));await browser.close();
