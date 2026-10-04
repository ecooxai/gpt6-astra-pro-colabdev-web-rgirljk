/** Original procedural eyebrow fibres with transparent edges. */
import * as T from 'three';
export function makeBrowMaterial(){
 const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');
 let seed=98413;const R=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 x.save();x.beginPath();x.ellipse(256,72,251,31,0,0,Math.PI*2);x.clip();
 const g=x.createLinearGradient(0,27,0,116);g.addColorStop(0,'rgba(42,28,21,0)');g.addColorStop(.35,'rgba(42,28,21,.22)');g.addColorStop(.65,'rgba(42,28,21,.40)');g.addColorStop(1,'rgba(42,28,21,0)');x.fillStyle=g;x.fillRect(0,0,512,128);x.restore();
 for(let j=0;j<760;j++){
  const u=.015+R()*.97,env=Math.pow(Math.sin(Math.PI*u),.50),px=u*512,py=71+(R()-.5)*44*env,len=(12+R()*23)*env;
  x.strokeStyle=`rgba(${31+Math.floor(R()*15)},${23+Math.floor(R()*9)},${19+Math.floor(R()*8)},${.20+R()*.42})`;
  x.lineWidth=.6+R()*.95;x.lineCap='round';x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+5+u*11,py-len*.65,px+8+u*17,py-len);x.stroke();
 }
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;map.name='Original hand-authored eyebrow fibre distribution';
 const m=new T.MeshStandardMaterial({color:0xffffff,map,transparent:true,alphaTest:.018,roughness:.92,depthWrite:false,side:T.DoubleSide});m.name='Natural eyebrow fibre density';return m;
}
