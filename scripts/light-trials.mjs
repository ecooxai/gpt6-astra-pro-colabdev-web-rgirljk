import {launchBrowser} from './browser.mjs';
import {previewURL} from './paths.mjs';
import fs from 'node:fs';
const trials=[
 {n:26,name:'Directional daylight',key:3.2,fill:.35,hemi:.4,env:.25,rim:2,exposure:1,keyPos:[-4,10,5]},
 {n:27,name:'Balanced daylight',key:2.1,fill:.65,hemi:.65,env:.35,rim:2.5,exposure:1.03,keyPos:[-3.8,10,7]},
 {n:28,name:'Soft portrait',key:1.2,fill:1,hemi:.8,env:.6,rim:1.4,exposure:1.05,keyPos:[-5,9,9]}
];
const browser=await launchBrowser();
try{
 const page=await browser.newPage({viewport:{width:900,height:1100},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(previewURL+'/?capture=1',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>window.__APP__?.ready,null,{timeout:120000});
 for(const p of trials){
  await page.evaluate(p=>{const a=window.__APP__,lights=a.scene.children.filter(o=>o.isDirectionalLight),hemi=a.scene.children.find(o=>o.isHemisphereLight);
   lights[0].intensity=p.key;lights[0].position.set(...p.keyPos);lights[1].intensity=p.fill;lights[2].intensity=p.rim;hemi.intensity=p.hemi;a.scene.environmentIntensity=p.env;a.renderer.toneMappingExposure=p.exposure;
   a.model.traverse(o=>{if(o.isMesh&&o.material.name==='Dark swept hair'){o.material.roughness=.45;o.material.specularIntensity=.43;o.material.color.set(0x8b919f);}});
  },p);
  for(const view of ['face','front']){
   await page.evaluate(v=>{const a=window.__APP__;a.setView(v);a.renderer.render(a.scene,a.camera);},view);
   await page.waitForTimeout(1800);
   await page.screenshot({path:`public/preview/rev-${p.n}-${view}.png`,timeout:120000});
  }
  fs.writeFileSync(`public/preview/rev-${p.n}-test.json`,JSON.stringify({iteration:p.n,trial:p,errors,stats:await page.evaluate(()=>window.__APP__.getStats())},null,2));
  console.log('Captured lighting edit '+p.n+' — '+p.name);
 }
}finally{await browser.close();}
