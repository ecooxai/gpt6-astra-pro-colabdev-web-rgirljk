import {launchBrowser} from './browser.mjs';
import {previewURL} from './paths.mjs';
import fs from 'node:fs';
const iter=process.argv[2]||'01',views=(process.argv[3]||'front,three,back,face').split(',');
const browser=await launchBrowser(),errors=[];
try {
 const page=await browser.newPage({viewport:{width:900,height:1100},deviceScaleFactor:1});
 let rejectError;const failure=new Promise((_,reject)=>{rejectError=reject});
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);rejectError(e)});
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(previewURL+'/?capture=1'+(process.argv.includes('--prebuilt')?'&prebuilt=1':''),{waitUntil:'domcontentloaded',timeout:120000});
 await Promise.race([page.waitForFunction(()=>window.__APP__?.ready,null,{timeout:120000}),failure]);
 for(const view of views){
  await page.evaluate(v=>window.__APP__.setView(v),view);
  await page.waitForTimeout(1800);
  await page.screenshot({path:`public/preview/rev-${iter}-${view}.png`,timeout:120000,animations:'disabled'});
  console.log('Captured '+view);
 }
 const report={iteration:iter,stats:await page.evaluate(()=>window.__APP__.getStats()),errors};
 fs.writeFileSync(`public/preview/rev-${iter}-test.json`,JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 if(errors.length)process.exitCode=1;
} finally {await browser.close()}
