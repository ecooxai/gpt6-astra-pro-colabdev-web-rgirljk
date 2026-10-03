import {launchBrowser} from './browser.mjs';import {previewURL} from './paths.mjs';import fs from 'node:fs';
const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:900,height:1100},acceptDownloads:true});
page.on('pageerror',e=>console.error(e.message));
await page.goto(previewURL+'/?capture=1&procedural=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__APP__?.ready,null,{timeout:120000});
const waiting=page.waitForEvent('download',{timeout:120000});await page.evaluate(()=>window.__APP__.exportGLB(true));const download=await waiting;
const file='public/exports/gpt6_astra_pro_colabdev_web_rgirljk.glb';await download.saveAs(file);const b=fs.readFileSync(file);if(b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw new Error('Invalid GLB header');
console.log(JSON.stringify({file,bytes:b.length,stats:await page.evaluate(()=>window.__APP__.getStats())},null,2));await browser.close();
