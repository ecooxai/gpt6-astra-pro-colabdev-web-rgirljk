import * as T from 'three';
import {surface,ball,box,tube,sample,mix} from './geometry.js';
// Anatomical landmarks are manually authored, never sampled from a photograph.
export const headRows=[[-.515,.006,.036],[-.487,.091,.155],[-.445,.181,.235],[-.36,.271,.276],[-.24,.333,.297],[-.075,.374,.314],[.09,.373,.320],[.27,.352,.315],[.415,.289,.267],[.52,.169,.162],[.566,.014,.016],[.57,.001,.001]];
const G=(x,y,cx,cy,sx,sy)=>Math.exp(-1*(((x-cx)/sx)**2+((y-cy)/sy)**2));
const clamp=T.MathUtils.clamp;
function baseFaceZ(x,y){
 const [rx,rz]=sample(headRows,y);let z=rz*Math.pow(Math.max(0,1-(x/Math.max(rx,.001))**2),.40);
 z+=.027*G(x,y,0,.025,.047,.133)+.065*G(x,y,0,-.094,.057,.049);
 z+=.018*(G(x,y,-.057,-.118,.030,.025)+G(x,y,.057,-.118,.030,.025));z-=.004*G(x,y,0,-.155,.055,.021);
 z+=.023*(G(x,y,-.23,-.058,.092,.080)+G(x,y,.23,-.058,.092,.080));
 z-=.019*(G(x,y,-.158,.079,.103,.056)+G(x,y,.158,.079,.103,.056));
 z+=.009*(G(x,y,-.158,.145,.105,.047)+G(x,y,.158,.145,.105,.047));
 z+=.023*G(x,y,0,-.239,.168,.085)+.026*G(x,y,0,-.395,.146,.066);z-=.003*G(x,y,0,-.19,.010,.027);
 for(const s of [-1,1]){const path=s*(.070+.074*clamp((-y-.12)/.135,0,1));z-=.0027*G(x,y,path,-.192,.011,.063);}return z;
}
export function faceZ(x,y){let z=baseFaceZ(x,y);for(const sign of [-1,1]){let t=(x-sign*.157)/.09;if(Math.abs(t)>=1)continue;let w=Math.max(0,1-t*t),arch=Math.pow(w,.55),ey=.074+(sign<0?.001:-.001),up=ey+.031*Math.pow(w,.72)*(1-.13*sign*t)+sign*t*.005,lo=ey-.019*Math.pow(w,.74)+sign*t*.005,dist=y>up?y-up:y<lo?lo-y:0,blend=Math.max(0,1-dist/(.032*arch+.001));z+=.020*arch*blend*blend*(3-2*blend);}return z;}
function skinColor(x,y,front=true){const c=new T.Color(0xd6a08a);if(front){c.lerp(new T.Color(0xc2766d),.18*(G(x,y,-.229,-.073,.105,.076)+G(x,y,.227,-.080,.103,.080)));c.lerp(new T.Color(0x997267),.16*(G(x,y,-.158,.057,.097,.065)+G(x,y,.158,.057,.097,.065)));c.lerp(new T.Color(0xb97d70),.08*G(x,y,0,-.109,.080,.046));c.lerp(new T.Color(0xc5907a),.09*G(x,y,0,-.269,.177,.101));}const micro=.006*Math.sin(x*203+y*177)*Math.sin(x*349-y*271);c.offsetHSL(0,0,micro);return c;}
const mouthW=.142;
function oralEdges(t){let w=Math.max(0,1-t*t);return {top:-.232+.026*t*t,bot:-.289+.083*t*t,w};}
function lipZ(t){return .322-.034*t*t;}
function removeInside(geom,predicate){const a=geom.attributes.position,ix=geom.index.array,out=[];for(let i=0;i<ix.length;i+=3){let x=0,y=0,z=0;for(let j=0;j<3;j++){x+=a.getX(ix[i+j])/3;y+=a.getY(ix[i+j])/3;z+=a.getZ(ix[i+j])/3;}if(!predicate(x,y,z))out.push(ix[i],ix[i+1],ix[i+2]);}geom.setIndex(out);geom.computeVertexNormals();}
let randomSeed=82915;function rng(){randomSeed=(1664525*randomSeed+1013904223)>>>0;return randomSeed/4294967296;}
function makeEyeTexture(){
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d'),s=512;ctx.fillStyle='#e4d8d0';ctx.fillRect(0,0,s,s);
 for(let i=0;i<24;i++){let a=rng()*Math.PI*2,r=210+rng()*45;ctx.strokeStyle='rgba(169,97,91,.085)';ctx.lineWidth=.35+rng()*.7;ctx.beginPath();ctx.moveTo(256+Math.cos(a)*r,256+Math.sin(a)*r);ctx.quadraticCurveTo(256+Math.cos(a+.13)*r*.8,256+Math.sin(a+.13)*r*.8,256+Math.cos(a+.18)*r*.57,256+Math.sin(a+.18)*r*.57);ctx.stroke();}
 let g=ctx.createRadialGradient(256,256,37,256,256,115);g.addColorStop(0,'#33231f');g.addColorStop(.25,'#61432d');g.addColorStop(.77,'#493728');g.addColorStop(.92,'#322925');g.addColorStop(1,'#201e1c');ctx.fillStyle=g;ctx.beginPath();ctx.arc(256,256,115,0,Math.PI*2);ctx.fill();
 for(let i=0;i<620;i++){let a=rng()*Math.PI*2,r1=39+rng()*24,r2=77+rng()*22;ctx.strokeStyle=`rgba(${65+rng()*62},${45+rng()*42},${24+rng()*28},${.12+rng()*.28})`;ctx.lineWidth=.35+rng()*.85;ctx.beginPath();ctx.moveTo(256+Math.cos(a)*r1,256+Math.sin(a)*r1);ctx.quadraticCurveTo(256+Math.cos(a+.013)*70,256+Math.sin(a+.013)*70,256+Math.cos(a)*r2,256+Math.sin(a)*r2);ctx.stroke();}
 g=ctx.createRadialGradient(256,256,35,256,256,44);g.addColorStop(0,'#0c0d0e');g.addColorStop(.8,'#111011');g.addColorStop(1,'#2b211c');ctx.fillStyle=g;ctx.beginPath();ctx.arc(256,256,44,0,Math.PI*2);ctx.fill();const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;return tex;
}
function makeEye(h,M,s,eyeMat){
 const ex=s*.157,ey=.074+(s<0?.001:-.001),ew=.090;
 function edges(t){const w=Math.max(0,1-t*t);return {up:ey+.031*Math.pow(w,.72)*(1-.13*s*t)+s*t*.005,lo:ey-.019*Math.pow(w,.74)+s*t*.005};}
 function eyeZ(x,y){let t=(x-ex)/ew,e=edges(t),v=clamp((y-e.lo)/Math.max(.001,e.up-e.lo),0,1);return baseFaceZ(x,y)+Math.pow(Math.max(0,1-t*t),.55)*(.019+.006*Math.sin(v*Math.PI));}
 const eye=surface('Curved eye with radial brown iris',64,24,(u,v)=>{let t=u*2-1,x=ex+t*ew,e=edges(t),y=mix(e.lo,e.up,v);return [x,y,eyeZ(x,y)];},eyeMat,h);
 const pos=eye.geometry.attributes.position,uv=eye.geometry.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,.5+(pos.getX(i)-ex+.003)/.185,.5+(pos.getY(i)-ey-.004)/.185);
 for(const upper of [true,false]){let pts=[];for(let i=0;i<=44;i++){let t=-.975+i/44*1.95,x=ex+t*ew,e=edges(t),y=upper?e.up:e.lo;pts.push([x,y,eyeZ(x,y)+.001]);}tube(upper?'Fine ciliary margin':'Soft tear rim',pts,upper?.00085:.00045,upper?M.lash:M.lid,h,48,4);}
 for(let j=0;j<13;j++){const t=s*(.13+j*.064),x=ex+t*ew,e=edges(t),y=e.up,z=eyeZ(x,y)+.002,length=.004+rng()*.004;tube('Fine tapered upper eyelash',[[x,y,z],[x+s*.0018,y+.002,z+.004],[x+s*.0035,y+length,z+.005]],.0006,M.lash,h,5,3);}
 surface('Soft eyebrow bed',64,6,(u,v)=>{let t=u*2-1,x=ex+t*.102,y=.174+.019*(1-t*t)-s*t*.011+(v-.5)*.014*Math.pow(Math.max(0,1-t*t),.55);return[x,y,faceZ(x,y)+.0015];},M.brow,h);
 for(let j=0;j<54;j++){let t=-.92+1.84*j/53,x=ex+t*.102,y=.174+.019*(1-t*t)-s*t*.011;const l=.006+rng()*.006;tube('Individual fine eyebrow',[[x,y-.003,faceZ(x,y)+.003],[x+s*.003,y+.002,faceZ(x,y+.002)+.003],[x+s*.006,y+l,faceZ(x,y+l)+.003]],.00055,M.lash,h,4,3);}
 ball('Small corneal light',[ex-.010,ey+.014,eyeZ(ex-.010,ey+.014)+.003],[.0023,.0023,.0008],M.glint,h,12);
 let xi=ex-s*(ew-.003),yi=ey-.001;ball('Subtle medial caruncle',[xi,yi,eyeZ(xi,yi)+.001],[.004,.0026,.002],M.lid,h,16);
}
function makeMouth(h,M){
 surface('Recessed oral cavity',72,24,(u,v)=>{let t=u*2-1,e=oralEdges(t),y=mix(e.bot-.004*e.w,e.top+.002*e.w,v);return[t*mouthW,y,lipZ(t)-.025-.009*Math.sin(Math.PI*v)*e.w];},M.mouth,h);
 for(const upper of [true,false])surface(upper?'Anatomical upper lip':'Anatomical lower lip',96,18,(u,v)=>{let t=u*2-1,e=oralEdges(t),a=Math.pow(e.w,.68),inner=upper?e.top:e.bot,cupid=.0045*Math.exp(-1*((Math.abs(t)-.25)/.17)**2)-.0015*Math.exp(-1*(t/.12)**2),dy=upper?(.012*a+cupid):-.017*a,y=inner+v*dy;let z=mix(lipZ(t)+.005,faceZ(t*mouthW,y)+.001,v)+.009*Math.sin(Math.PI*v)*a;let col=new T.Color(upper?0xb77370:0xc5867f);col.lerp(skinColor(t*mouthW,y),Math.pow(v,3)*.85);col.offsetHSL(0,0,.006*Math.sin(t*141)*Math.sin(v*17));return[t*mouthW,y,z,...col.toArray()];},M.lipSculpt,h);
 const teeth=[[-.110,.019,.025],[-.087,.025,.030],[-.059,.028,.032],[-.021,.037,.034],[.020,.037,.034],[.058,.028,.032],[.085,.025,.030],[.108,.019,.025]];
 for(let i=0;i<teeth.length;i++){const [x,w,ht]=teeth[i],t=x/mouthW,yTop=-.226+.022*t*t,z=.314-.047*t*t;const q=box('Upper dental crown '+i,[x,yTop-ht/2,z],[w+.002,ht,.023],M.teeth,h,.0045);q.rotation.y=x*2.4;q.rotation.z=-x*.33;}
 for(let i=0;i<8;i++){let x=(i-3.5)*.022,t=x/mouthW,y=-.289+.052*t*t;const q=box('Small lower dental crown '+i,[x,y-.011,.292-.035*t*t],[.020,.017,.019],M.teeth,h,.0035);q.rotation.y=x*2.4;}
 for(const s of [-1,1]){let pts=[];for(let j=0;j<=15;j++){let v=j/15,x=s*(mouthW+.010*v),y=-.206+.014*v;pts.push([x,y,faceZ(x,y)+.001]);}tube('Fine smile commissure',pts,.00075,M.lid,h,16,4);}
}
function makeEars(h,M){for(const s of [-1,1]){const e=new T.Group();e.position.set(s*.365,-.082,-.017);e.rotation.y=s*.36;e.rotation.z=-s*.09;h.add(e);ball('Organic ear pinna',[0,0,-.006],[.073,.134,.044],M.skin,e,48);surface('Ear bowl and sculpted cartilage',72,36,(u,v)=>{let a=u*Math.PI*2,x=.062*v*Math.sin(a),y=.114*v*Math.cos(a),z=.021+.016*Math.exp(-1*((v-.78)/.17)**2)-.012*Math.exp(-1*((v-.33)/.25)**2);const c=new T.Color(0xd3a08a).lerp(new T.Color(0xa76d60),.4*Math.exp(-1*((v-.42)/.32)**2));return[x,y,z,...c.toArray()];},M.face,e);tube('Ear helix fold',[[s*.004,-.087,.032],[s*.042,-.052,.034],[s*.053,.033,.031],[s*.022,.097,.026],[-s*.018,.086,.023]],.008,M.skin,e,40,7);tube('Ear antihelix',[[-s*.01,-.052,.027],[s*.018,-.014,.031],[s*.011,.056,.029],[-s*.014,.067,.028]],.007,M.skin,e,32,7);ball('Small tragus',[-s*.026,-.021,.034],[.016,.023,.011],M.skin,e,24);ball('Soft ear lobe',[-s*.004,-.094,.007],[.031,.031,.032],M.skin,e,24);}}
export function makeFace(h,M){
 M.lipSculpt=new T.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.45,clearcoat:.10,clearcoatRoughness:.32,side:T.DoubleSide});M.lipSculpt.name='Sculpted lips with blended skin borders';M.brow=new T.MeshStandardMaterial({color:0x4c3830,roughness:.94});M.brow.name='Soft brown eyebrow foundations';
 const head=surface('Continuous anatomical facial sculpture',320,280,(u,v)=>{let y=mix(-.515,.57,v),[rx,rz]=sample(headRows,y),a=(u<.7?-Math.PI/2+Math.PI*u/.7:Math.PI/2+Math.PI*(u-.7)/.3),x=rx*Math.sin(a),front=Math.cos(a)>=0,z=front?faceZ(x,y):rz*Math.cos(a);return[x,y,z,...skinColor(x,y,front).toArray()];},M.face,h);
 removeInside(head.geometry,(x,y,z)=>{if(z<.18)return false;let t=x/mouthW;if(Math.abs(t)<.99){let e=oralEdges(t);if(y>e.bot+.001&&y<e.top-.001)return true;}for(const s of [-1,1]){let t=(x-s*.157)/.090;if(Math.abs(t)<.98){let w=Math.max(0,1-t*t),ey=.074+(s<0?.001:-.001),up=ey+.031*Math.pow(w,.72)*(1-.13*s*t)+s*t*.005,lo=ey-.019*Math.pow(w,.74)+s*t*.005;if(y>lo-.001&&y<up+.001)return true;}}return false;});
 const eyeMat=new T.MeshPhysicalMaterial({color:0xffffff,map:makeEyeTexture(),roughness:.28,clearcoat:.7,clearcoatRoughness:.095});eyeMat.name='Original radial brown iris and curved sclera';
 for(const s of [-1,1]){makeEye(h,M,s,eyeMat);surface('Recessed nostril tonal gradient',40,12,(u,v)=>{let a=u*Math.PI*2,x=s*.043+Math.cos(a)*.0105*v,y=-.131+Math.sin(a)*.0049*v+s*Math.cos(a)*.0014*v,z=faceZ(x,y)+.0007;let col=new T.Color(0x60362d).lerp(skinColor(x,y),Math.pow(v,2.5));return[x,y,z,...col.toArray()];},M.face,h);}
 makeMouth(h,M);makeEars(h,M);ball('Subtle cheek beauty mark',[-.257,-.094,faceZ(-.257,-.094)+.0006],[.0018,.0018,.0004],M.lid,h,12);
}
