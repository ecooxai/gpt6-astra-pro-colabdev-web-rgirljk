import {chromium} from 'playwright';import fs from 'node:fs';
const iter=process.argv[2]||'01',views=(process.argv[3]||'front,three,back,face').split(',');
const browser=await chromium.launch({headless:true,executablePath:'/home/dev/.local/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:900,height:1100},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:4317/?capture=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__APP__?.ready,{timeout:90000});
for(const v of views){await page.evaluate(v=>window.__APP__.setView(v),v);await page.waitForTimeout(1800);await page.screenshot({path:`public/preview/rev-${iter}-${v}.png`});}
console.log(JSON.stringify({iteration:iter,stats:await page.evaluate(()=>window.__APP__.getStats()),errors},null,2));await browser.close();
