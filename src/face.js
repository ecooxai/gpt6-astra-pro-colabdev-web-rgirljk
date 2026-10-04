/** Original anatomical surface; all coordinates are authored, never sampled from a photograph.
 * Constrained triangulation is an algorithm only: https://github.com/r3mi/poly2tri.js
 */
import * as T from 'three';
import poly2tri from 'poly2tri';
import {surface,ball,box,tube,sample,mix,V} from './geometry.js';
export const headRows=[[-.47,.008,.03,.035],[-.450,.059,.163,.105],[-.422,.122,.217,.137],[-.358,.204,.267,.185],[-.270,.281,.293,.247],[-.14,.343,.316,.283],[.035,.384,.326,.304],[.18,.374,.326,.31],[.34,.356,.318,.30],[.46,.296,.274,.255],[.54,.173,.17,.164],[.58,.003,.004,.004]];
const G=(x,y,cx,cy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2+((y-cy)/sy)**2));
const clamp=T.MathUtils.clamp;
export function faceZ(x,y){
 const [rx,rz]=sample(headRows,y);let z=rz*Math.pow(Math.max(0,1-(x/rx)**2),.40);
 z+=.011*G(x,y,0,.25,.28,.20)+.012*G(x,y,0,.13,.08,.085);
 z+=.023*G(x,y,0,.015,.052,.112)+.010*G(x,y,0,-.037,.064,.075);
 z+=.047*G(x,y,0,-.093,.057,.044)+.003*G(x,y,0,-.127,.022,.022);
 z+=.016*(G(x,y,-.053,-.111,.026,.022)+G(x,y,.053,-.111,.026,.022));
 z+=.022*(G(x,y,-.218,-.087,.094,.087)+G(x,y,.218,-.087,.094,.087));
 z-=.018*(G(x,y,-.156,.083,.113,.064)+G(x,y,.156,.083,.113,.064));
 z+=.010*(G(x,y,-.155,.024,.093,.029)+G(x,y,.155,.024,.093,.029));
 z+=.017*G(x,y,0,-.23,.145,.083)+.016*G(x,y,0,-.367,.145,.066);
 z-=.007*G(x,y,0,-.171,.012,.029);
 z+=.004*(G(x,y,-.019,-.173,.01,.033)+G(x,y,.019,-.173,.01,.033));
 const foldX=.078+clamp((-y-.12)/.15,0,1)*.104;
 z-=.0025*Math.exp(-(((Math.abs(x)-foldX)/.011)**2))*G(0,y,0,-.189,1,.072);
 return z;
}
function skinColor(x,y){const c=new T.Color(0xe4b49d);
 c.lerp(new T.Color(0xc97674),.16*(G(x,y,-.25,-.102,.098,.074)+G(x,y,.25,-.102,.098,.074)));
 c.lerp(new T.Color(0xa86b64),.17*(G(x,y,-.152,.091,.115,.041)+G(x,y,.152,.091,.115,.041)));
 c.lerp(new T.Color(0xda8f80),.12*G(x,y,0,-.105,.085,.05));
 c.lerp(new T.Color(0xb28a78),.05*(G(x,y,-.16,-.21,.033,.066)+G(x,y,.16,-.21,.033,.066)));
 const n=Math.sin(x*173+y*51)*Math.sin(y*181-x*87)+.5*Math.sin(x*481+y*253);
 c.multiplyScalar(1+n*.004);return c.toArray();}
function skull(a,y){const [rx,rz,back]=sample(headRows,y),x=rx*Math.sin(a);return[x,y,Math.cos(a)>=0?faceZ(x,y):back*Math.cos(a)];}
const EY=.084,EX=.153,ER=.098,EZ=.219,EW=.078;
function eyePoint(s,a,outer=false){const t=Math.cos(a),q=Math.sin(a),w=outer?.108:EW;
 return[s*EX+w*t,EY+s*t*.008+(q>0?(outer?.059:.026):(outer?.045:.018))*q];}
const MW=.139;
function mouthPoint(a,outer=false){const t=Math.cos(a),q=Math.sin(a),w=1-t*t;
 const top=-.218+.022*t*t,bottom=-.270+.074*t*t;
 return[t*(MW+(outer?.018:0)),q>=0?top+(outer?.020:0)*Math.sqrt(w):bottom-(outer?.030:0)*Math.sqrt(w)];}
function inPoly(x,y,p){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function buildSkin(h,M){
 const minY=-.469,maxY=.579,contour=[];
 for(let i=0;i<=128;i++)contour.push({x:-Math.PI,y:mix(minY,maxY,i/128)});
 contour.push({x:Math.PI,y:maxY});
 for(let i=127;i>=0;i--)contour.push({x:Math.PI,y:mix(minY,maxY,i/128)});
 const holes=[...[-1,1].map(s=>Array.from({length:96},(_,i)=>eyePoint(s,i/96*Math.PI*2,true))),Array.from({length:128},(_,i)=>mouthPoint(i/128*Math.PI*2,true))];
 const toAngular=([x,y])=>({x:Math.asin(clamp(x/sample(headRows,y)[0],-.999,.999)),y});
 const ctx=new poly2tri.SweepContext(contour);ctx.addHoles(holes.map(p=>p.map(toAngular)));
 for(let j=1;j<129;j++){const y=mix(minY,maxY,j/129);for(let i=1;i<161;i++){
  const a=-Math.PI+(i+(j%2)*.31)/161*Math.PI*2,[x]=skull(a,y);
  if(Math.cos(a)>0&&holes.some(p=>inPoly(x,y,p)))continue;
  // Keep Steiner vertices away from the precise eyelid/mouth boundaries.
  if(Math.cos(a)>0&&holes.some(p=>p.some(q=>Math.hypot(q[0]-x,q[1]-y)<.002)))continue;
  ctx.addPoint({x:a,y});
 }}
 ctx.triangulate();const points=[],normal=[],colors=[],uv=[],idx=[],map=new Map();
 function vertex(p){if(map.has(p))return map.get(p);const n=points.length/3;map.set(p,n);const a=p.x,y=p.y;
  const q=skull(a,y),da=V(skull(a+.0001,y)).sub(V(skull(a-.0001,y))),dy=V(skull(a,y+.00003)).sub(V(skull(a,y-.00003))),nn=da.cross(dy).normalize();
  points.push(...q);normal.push(...nn.toArray());colors.push(...skinColor(q[0],q[1]));uv.push((a+Math.PI)/(2*Math.PI),(y+.53)/1.11);return n;}
 for(const tri of ctx.getTriangles()){let p=tri.getPoints(),cross=(p[1].x-p[0].x)*(p[2].y-p[0].y)-(p[1].y-p[0].y)*(p[2].x-p[0].x);if(cross<0)p=[p[0],p[2],p[1]];idx.push(...p.map(vertex));}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normal,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);
 const m=new T.Mesh(geo,M.face);m.name='Continuous anatomical head with open orbital and oral topology';m.castShadow=m.receiveShadow=true;h.add(m);
}
function eyeSphereZ(s,x,y){return EZ+Math.sqrt(Math.max(.00002,ER*ER-(x-s*EX)**2-(y-EY)**2));}
function frontRing(...args){const m=surface(...args),g=m.geometry,a=g.index.array;for(let i=0;i<a.length;i+=3){const t=a[i+1];a[i+1]=a[i+2];a[i+2]=t;}const n=g.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,-n.getX(i),-n.getY(i),-n.getZ(i));return m;}
function makeEyes(h,M){
 const irisMat=new T.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.31,clearcoat:.8,clearcoatRoughness:.065,specularIntensity:.5});irisMat.name='Procedural radial brown iris fibres';
 const scleraMat=new T.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.25,clearcoat:.55,clearcoatRoughness:.07,specularIntensity:.5});scleraMat.name='Warm sclera and moist ocular surface';
 for(const s of [-1,1]){
  frontRing('Orbital tissue and anatomical eyelid transition',96,18,(u,v)=>{const a=u*Math.PI*2,inner=eyePoint(s,a),outer=eyePoint(s,a,true),x=mix(inner[0],outer[0],v),y=mix(inner[1],outer[1],v),zi=eyeSphereZ(s,...inner)+.0018,zo=faceZ(...outer),blend=v*v*(3-2*v);let z=faceZ(x,y)+(zi-faceZ(...inner))*Math.pow(1-v,2)+Math.sin(v*Math.PI)*.0005;const c=skinColor(x,y);return[x,y,z,...c];},M.face,h);
  surface('Inset curved sclera',80,24,(u,v)=>{const t=u*2-1,x=s*EX+EW*t,w=Math.sqrt(Math.max(0,1-t*t)),y=EY+s*t*.008+mix(-.018*w,.026*w,v),edge=Math.pow(Math.abs(t),6),c=new T.Color(0xeae2d9).lerp(new T.Color(0xc68e84),edge*.40);c.multiplyScalar(.68+.27*Math.sin(Math.PI*v));return[x,y,eyeSphereZ(s,x,y),...c.toArray()];},scleraMat,h);
  const ix=s*EX-.003,iy=EY+.004,ir=.039;
  frontRing('Iris limbus and intricate radial fibres',128,26,(u,v)=>{const a=u*Math.PI*2,r=ir*v,x=ix+Math.cos(a)*r;let y=iy+Math.sin(a)*r;const tx=(x-s*EX)/EW,w=Math.sqrt(Math.max(0,1-tx*tx));y=clamp(y,EY+s*tx*.008-.018*w+.0007,EY+s*tx*.008+.026*w-.0007);
   const c=new T.Color(0x251c18),striations=.12*Math.sin(a*127+v*4)+.09*Math.sin(a*251-v*17)+.05*Math.sin(a*53+v*36);
   c.lerp(new T.Color(0x58402e),(.18+striations*.7)*Math.sin(v*Math.PI));c.lerp(new T.Color(0x141719),Math.pow(v,15)*.85);return[x,y,eyeSphereZ(s,x,y)+.0007,...c.toArray()];},irisMat,h);
  frontRing('Pupil depth',64,8,(u,v)=>{const a=u*Math.PI*2,x=ix+Math.cos(a)*.017*v,y=iy+Math.sin(a)*.017*v;return[x,y,eyeSphereZ(s,x,y)+.001];},M.pupil,h);
  ball('Moist corneal catchlight',[ix-.010,iy+.012,eyeSphereZ(s,ix-.010,iy+.012)+.0017],[.0038,.0030,.0010],M.glint,h,16);
  for(const upper of [true,false]){
   const pts=[];for(let i=0;i<=48;i++){const a=(upper?0:Math.PI)+i/48*Math.PI,[x,y]=eyePoint(s,a);pts.push([x,y,eyeSphereZ(s,x,y)+.002]);}
   tube(upper?'Fine upper eyelash root line':'Subtle lower tear film',pts,upper?.0014:.00085,upper?M.lash:M.lid,h,56,5);
  }
  for(let j=0;j<24;j++){
   const t=-.84+j/23*1.69,x=s*EX+t*EW,y=EY+s*t*.008+.026*Math.sqrt(1-t*t),z=eyeSphereZ(s,x,y)+.002,r=.00042+.00013*(j%3),l=.004+ .005*(.5+.5*s*t);
   tube('Individual tapered upper eyelash',[[x,y,z],[x+s*.0015,y+l*.55,z+.003],[x+s*.003,y+l,z+.004]],r,M.lash,h,5,3);
  }
  ball('Lacrimal caruncle',[s*(EX-EW+.007),EY-.006,eyeSphereZ(s,s*(EX-EW+.007),EY-.006)+.001],[.005,.003,.002],M.lipTop,h,16);
  surface('Soft brow follicle density',56,10,(u,v)=>{const t=u*2-1,x=s*EX+t*.098,y=.171+.019*(1-t*t)-s*t*.006+(v-.5)*.018*(1-.6*Math.abs(t)),c=new T.Color().fromArray(skinColor(x,y));c.lerp(new T.Color(0x654e46),.78*Math.pow(1-Math.abs(v*2-1),1.2)*(1-t*t));return[x,y,faceZ(x,y)+.0008,...c.toArray()];},M.face,h);
  // Eyebrows are numerous short hairs, not a solid painted block.
  for(let j=0;j<76;j++){const t=j/75*2-1,x=s*EX+t*.098,base=.171+.019*(1-t*t)-s*t*.006,scatter=.004*Math.sin(j*2.31),y=base+scatter,z=faceZ(x,y)+.001;
   const l=.008+.008*(1-Math.abs(t));tube('Individual eyebrow hair',[[x,y,z],[x+s*.004,y+l*.6,faceZ(x+s*.004,y+l*.6)+.0015],[x+s*.008,y+l,faceZ(x+s*.008,y+l)+.001]],.00065*(1-.5*Math.abs(t)),M.lash,h,5,3);
  }
 }
}
function makeMouth(h,M){
 const lipMat=new T.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.48,clearcoat:.14,clearcoatRoughness:.32,specularIntensity:.45});lipMat.name='Integrated rose vermilion with soft skin boundary';
 // Oral cavity is a real recessed volume behind the open skin topology.
 ball('Recessed oral cavity',[0,-.245,.213],[.153,.070,.052],M.mouth,h,48);
 frontRing('Continuous lips and surrounding tissue',128,20,(u,v)=>{const a=u*Math.PI*2,inner=mouthPoint(a),outer=mouthPoint(a,true),x=mix(inner[0],outer[0],v),y=mix(inner[1],outer[1],v),w=Math.sin(a),z0=faceZ(...inner)+.004;
  const z=mix(z0,faceZ(...outer),v)+Math.sin(v*Math.PI)*(.010+(w<0?.004:0));
  let c=new T.Color(w>=0?0x99595d:0xb56a74);c.lerp(new T.Color().fromArray(skinColor(x,y)),Math.pow(v,2.5));c.multiplyScalar(1+.018*Math.sin(u*620)*Math.sin(v*Math.PI));return[x,y,z,...c.toArray()];},lipMat,h);
 const positions=[-.123,-.098,-.071,-.039,-.007,.027,.060,.090,.116].map(x=>x*.92);
 for(let i=0;i<positions.length;i++){
  const x=positions[i],t=x/MW,w=1-t*t,top=-.215+.023*t*t,bottom=-.253+.040*t*t,width=(i===0||i===8)?.020:(i<2||i>6)?.026:.034;
  const tooth=box('Individual upper tooth '+(i+1),[x,(top+bottom)/2,.309-.049*t*t],[width*.93,top-bottom,.015],M.teeth,h,.005);
  tooth.rotation.y=-t*.42;tooth.rotation.z=t*.045;
 }
 // A low tongue surface catches a muted bounce, rather than a flat red sticker.
 ball('Tongue inside smile',[0,-.277,.245],[.091,.013,.015],M.lipTop,h,32);
 for(let s of [-1,1]){
  const pts=[];for(let i=0;i<10;i++){const t=i/9,x=s*(.139+.014*t),y=-.197+.02*t;pts.push([x,y,faceZ(x,y)+.0005]);}
  tube('Fine smile commissure crease',pts,.0008,M.inner,h,14,4);
 }
}
function makeEarsAndNose(h,M){
 const mark=new T.MeshStandardMaterial({color:0x8e685b,roughness:.92});mark.name="Subtle skin marks";const nostril=new T.MeshStandardMaterial({color:0x694438,roughness:.90});nostril.name="Soft nostril shadow";
 for(const s of [-1,1]){
  const e=new T.Group();e.position.set(s*.374,-.067,-.014);e.rotation.y=s*.28;e.rotation.z=s*.08;h.add(e);
  ball('Ear pinna',[0,0,0],[.066,.139,.052],M.skin,e,40);
  ball('Ear concha shadow',[s*.012,-.002,.041],[.030,.068,.016],M.inner,e,32);
  tube('Soft helical rim',[[s*.001,-.095,.038],[s*.040,-.052,.047],[s*.045,.040,.042],[s*.021,.103,.032],[-s*.016,.073,.033]],.010,M.skin,e,40,8);
  tube('Antihelix fold',[[s*.005,-.056,.048],[s*.017,-.006,.053],[s*.001,.04,.051],[s*.015,.067,.045]],.006,M.lid,e,25,6);
  ball('Tragus',[-s*.02,-.025,.049],[.017,.025,.014],M.skin,e);ball('Earlobe',[s*.001,-.102,.010],[.033,.033,.035],M.skin,e);
  const nost=ball('Recessed nostril aperture',[s*.049,-.129,faceZ(s*.049,-.129)+.0005],[.011,.003,.0025],nostril,h,28);nost.rotation.z=-s*.17;
  tube('Subtle alar fold',[[s*.068,-.127,faceZ(s*.068,-.127)+.0003],[s*.078,-.116,faceZ(s*.078,-.116)+.0003],[s*.073,-.101,faceZ(s*.073,-.101)+.0003]],.0006,M.inner,h,18,4);
 }
 // A small natural cheek mark observed visually; never a photographic texture.
 for(const [x,y,r] of [[-.243,-.085,.0025],[.178,-.063,.0024],[-.026,.043,.0022]])ball('Subtle facial mark',[x,y,faceZ(x,y)+.0005],[r,r*.86,.0006],mark,h,12);
}
export function makeFace(h,M){buildSkin(h,M);makeEyes(h,M);makeMouth(h,M);makeEarsAndNose(h,M);}
