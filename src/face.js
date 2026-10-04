/** Original anatomical surface; all coordinates are authored, never sampled from a photograph.
 * Constrained triangulation is an algorithm only: https://github.com/r3mi/poly2tri.js
 */
import * as T from 'three';
import poly2tri from 'poly2tri';
import {eyeContour,makeEyeGeometry} from './eyes.js';
import {FACE_PARAMETERS as F} from './face-parameters.js';
const NY=F.noseLift,MY=F.mouthLift,MZ=.014,JC=F.jawShorten;
import {surface,ball,box,tube,sample,mix,V} from './geometry.js';
export const headRows=[[-.448,.008,.03,.035],[-.434,.085,.174,.110],[-.408,.151,.234,.151],[-.350,.233,.281,.194],[-.267,.290,.300,.250],[-.14,.349,.316,.283],[.035,.384,.326,.304],[.18,.374,.326,.31],[.34,.356,.318,.30],[.46,.296,.274,.255],[.54,.173,.17,.164],[.58,.003,.004,.004]].map((r,i)=>[r[0]+(i<5?[1,1,1,.77,.30][i]*JC:0),...r.slice(1)]);
const G=(x,y,cx,cy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2+((y-cy)/sy)**2));
const clamp=T.MathUtils.clamp;
export function faceZ(x,y){
 const [rx,rz]=sample(headRows,y);let z=rz*Math.pow(Math.max(0,1-(x/rx)**2),.40);
 z+=.011*G(x,y,0,.25,.28,.20)+.012*G(x,y,0,.13,.08,.085);
 z+=.005*(G(x,y,-.155,.134,.098,.035)+G(x,y,.155,.134,.098,.035));
 z+=.023*G(x,y-NY,0,.015,.052,.082)+.010*G(x,y-NY,0,-.037,.064,.060);
 z+=.048*G(x,y-NY,0,-.093,.061,.044)+.003*G(x,y-NY,0,-.127,.022,.022);
 z+=.026*(G(x,y-NY,-.053,-.113,.031,.028)+G(x,y-NY,.053,-.113,.031,.028));
 z+=.022*(G(x,y,-.218,-.087,.094,.087)+G(x,y,.218,-.087,.094,.087));
 z-=.004*(G(x,y,-.156,.083,.113,.064)+G(x,y,.156,.083,.113,.064));
 z+=.010*(G(x,y,-.155,.024,.093,.029)+G(x,y,.155,.024,.093,.029));
 z+=.017*G(x,y-MY,0,-.23,.145,.083)+.014*G(x,y-JC,0,-.350,.155,.066);
 z-=.0018*G(x,y-(NY*.3+MY*.7),0,-.171,.014,.027);
 z+=.0014*(G(x,y-(NY*.3+MY*.7),-.019,-.173,.012,.029)+G(x,y-(NY*.3+MY*.7),.019,-.173,.012,.029));
 z+=.007*(G(x,y,-.216,-.026,.107,.067)+G(x,y,.216,-.026,.107,.067));
 z+=.007*(G(x,y-MY*.5,-.193,-.146,.070,.079)+G(x,y-MY*.5,.193,-.146,.070,.079));
 const foldTop=-.12+NY,foldBottom=-.21+MY;const foldX=.067+clamp((foldTop-y)/(foldTop-foldBottom),0,1)*.082;
 z-=.0035*Math.exp(-(((Math.abs(x)-foldX)/.019)**2))*G(0,y,0,(foldTop+foldBottom)*.5,1,.066);
 return z;
}
function skinColor(x,y){const c=new T.Color(0xe5b6a2);
 c.lerp(new T.Color(0xc97674),.20*(G(x,y,-.25,-.102,.098,.074)+G(x,y,.25,-.102,.098,.074)));
 c.lerp(new T.Color(0xb0796e),.025*(G(x,y,-.152,.091,.115,.041)+G(x,y,.152,.091,.115,.041)));
 c.lerp(new T.Color(0xda8f80),.12*G(x,y,0,-.105,.085,.05));
 c.lerp(new T.Color(0xb28a78),.05*(G(x,y,-.16,-.21,.033,.066)+G(x,y,.16,-.21,.033,.066)));
 const n=Math.sin(x*173+y*51)*Math.sin(y*181-x*87)+.5*Math.sin(x*481+y*253);
 c.multiplyScalar(1+n*.004);return c.toArray();}
function skull(a,y){const [rx,rz,back]=sample(headRows,y),x=rx*Math.sin(a);return[x,y,Math.cos(a)>=0?faceZ(x,y):back*Math.cos(a)];}
const eyePoint=eyeContour;
const MW=.140;
function mouthPoint(a,outer=false){const t=Math.cos(a),q=Math.sin(a),w=1-t*t;
 const top=MY-.208-.002*t*t+F.smileArch*(1-t*t),bottom=MY-.265+.055*t*t;
 const cupid=outer?.0045*Math.exp(-(((Math.abs(t)-.20)/.15)**2))*Math.sqrt(w):0;
 return[t*(MW+(outer?.0155:0)),q>=0?top+(outer?.026:0)*Math.sqrt(w)+cupid:bottom-(outer?.024:0)*Math.sqrt(w)];}
function nostrilPoint(s,a,outer=false){
 const t=Math.cos(a),q=Math.sin(a);
 return[s*.049+(outer?.024:.012)*t,NY+(outer?-.127:-.132)+(outer?.013:.0036)*q-s*t*.0023];
}
function inPoly(x,y,p){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function buildSkin(h,M){
 const minY=headRows[0][0]+.001,maxY=.579,contour=[];
 for(let i=0;i<=128;i++)contour.push({x:-Math.PI,y:mix(minY,maxY,i/128)});
 contour.push({x:Math.PI,y:maxY});
 for(let i=127;i>=0;i--)contour.push({x:Math.PI,y:mix(minY,maxY,i/128)});
 const holes=[...[-1,1].map(s=>Array.from({length:96},(_,i)=>eyePoint(s,i/96*Math.PI*2,true))),Array.from({length:128},(_,i)=>mouthPoint(i/128*Math.PI*2,true)),...[-1,1].map(s=>Array.from({length:32},(_,i)=>nostrilPoint(s,i/32*Math.PI*2)))];
 const toAngular=([x,y])=>({x:Math.asin(clamp(x/sample(headRows,y)[0],-.999,.999)),y}),angularHoles=holes.map(p=>p.map(toAngular)),holeTests=angularHoles.map(p=>p.map(q=>[q.x,q.y]));
 const ctx=new poly2tri.SweepContext(contour);ctx.addHoles(angularHoles);
 const used=new Set([...contour,...angularHoles.flat()].map(p=>p.x.toFixed(8)+':'+p.y.toFixed(8)));
 function add(a,y){
  const key=a.toFixed(8)+':'+y.toFixed(8);if(used.has(key))return;
  const q=skull(a,y),x=q[0];
  if(Math.cos(a)>0&&(holes.some(p=>inPoly(x,y,p))||holeTests.some(p=>inPoly(a,y,p))||holes.some(p=>p.some(v=>Math.hypot(v[0]-x,v[1]-y)<.00038))))return;
  used.add(key);ctx.addPoint({x:a,y});
 }
 const facial=(x,y)=>Math.abs(x)<.302&&y>-.338&&y<.223;
 const nasal=(x,y)=>Math.abs(x)<.118&&y>-.183&&y<.058;
 for(let j=1;j<129;j++){
  const y=mix(minY,maxY,j/129);
  for(let i=1;i<161;i++){const a=-Math.PI+(i+(j%2)*.31)/161*Math.PI*2,x=skull(a,y)[0];if(Math.cos(a)>0&&facial(x,y))continue;add(a,y);}
 }
 // Evenly spaced authored sampling prevents long triangular fans around openings.
 for(let j=0;j<=93;j++){const y=-.335+j*.006;for(let i=0;i<=100;i++){const x=-.30+(i+(j%2)*.32)*.006;if(nasal(x,y))continue;const p=toAngular([x,y]);add(p.x,p.y);}}
 for(let j=0;j<=74;j++){const y=-.180+j*.0032;for(let i=0;i<=72;i++){const x=-.115+(i+(j%2)*.32)*.0032,p=toAngular([x,y]);add(p.x,p.y);}}
 ctx.triangulate();const points=[],normal=[],colors=[],uv=[],idx=[],map=new Map();
 function vertex(p){
  const key=p.x.toFixed(10)+':'+p.y.toFixed(10);if(map.has(key))return map.get(key);
  const n=points.length/3;map.set(key,n);const a=p.x,y=p.y,q=skull(a,y),e=.00005;let nn;
  if(Math.cos(a)>0){const x=q[0];nn=new T.Vector3(-(faceZ(x+e,y)-faceZ(x-e,y))/(2*e),-(faceZ(x,y+e)-faceZ(x,y-e))/(2*e),1).normalize();}
  else{const da=V(skull(a+.0001,y)).sub(V(skull(a-.0001,y))),dy=V(skull(a,y+e)).sub(V(skull(a,y-e)));nn=da.cross(dy).normalize();}
  points.push(...q);normal.push(...nn.toArray());colors.push(...skinColor(q[0],q[1]));uv.push((a+Math.PI)/(2*Math.PI),(y+.53)/1.11);return n;
 }
 for(const tri of ctx.getTriangles()){
  let p=tri.getPoints();if((p[1].x-p[0].x)*(p[2].y-p[0].y)-(p[1].y-p[0].y)*(p[2].x-p[0].x)<0)p=[p[0],p[2],p[1]];idx.push(...p.map(vertex));
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setAttribute('normal',new T.Float32BufferAttribute(normal,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);
 const mesh=new T.Mesh(g,M.face);mesh.name='Continuous anatomical head with refined facial tessellation';mesh.castShadow=mesh.receiveShadow=true;h.add(mesh);
}
function frontRing(...args){
 const m=surface(...args),g=m.geometry,a=g.index.array;
 for(let i=0;i<a.length;i+=3){const t=a[i+1];a[i+1]=a[i+2];a[i+2]=t;}
 const n=g.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,-n.getX(i),-n.getY(i),-n.getZ(i));
 if(/Orbital tissue|Continuous lips|Nasal tissue/.test(args[0])){
  const nu=args[1],nv=args[2],pos=g.attributes.position;
  // Facial skin detail must share cranial coordinates across surface patches.
  if(/Orbital tissue|Nasal tissue/.test(args[0])){
   const uv=g.attributes.uv;
   for(let k=0;k<pos.count;k++){
    const x=pos.getX(k),y=pos.getY(k),rx=sample(headRows,y)[0];
    uv.setXY(k,(Math.asin(clamp(x/rx,-.999,.999))+Math.PI)/(2*Math.PI),(y+.53)/1.11);
   }
   uv.needsUpdate=true;
  }
  for(let j=nv-2;j<=nv;j++)for(let i=0;i<=nu;i++){
   const k=j*(nu+1)+i,x=pos.getX(k),y=pos.getY(k),e=.00005;
   const normal=new T.Vector3(-(faceZ(x+e,y)-faceZ(x-e,y))/(2*e),-(faceZ(x,y+e)-faceZ(x,y-e))/(2*e),1).normalize();
   const old=new T.Vector3(n.getX(k),n.getY(k),n.getZ(k));old.lerp(normal,(j-(nv-3))/3).normalize();n.setXYZ(k,old.x,old.y,old.z);
  }
 }
 return m;
}

function makeMouth(h,M){
 const lipMat=new T.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.58,clearcoat:.025,clearcoatRoughness:.6,specularIntensity:.15});lipMat.name='Integrated rose vermilion with soft skin boundary';
 // Oral cavity is a real recessed volume behind the open skin topology.
 ball('Recessed oral cavity',[0,-.245+MY,.213+MZ],[.153,.070,.052],M.mouth,h,48);
 frontRing('Continuous lips and surrounding tissue',128,20,(u,v)=>{const a=u*Math.PI*2,inner=mouthPoint(a),outer=mouthPoint(a,true),x=mix(inner[0],outer[0],v),y=mix(inner[1],outer[1],v),w=Math.sin(a),z0=faceZ(...inner)+.002;
  const z=faceZ(x,y)-.002*(1-v)**2+Math.sin(v*Math.PI)**2*(w>=0?.0045:.007)+.00016*Math.sin(u*740)*Math.sin(v*Math.PI)**2;
  let c=new T.Color(w>=0?0xa76569:0xba727a);c.lerp(new T.Color().fromArray(skinColor(x,y)),Math.pow(v,2.5));c.multiplyScalar(1+.018*Math.sin(u*620)*Math.sin(v*Math.PI));return[x,y,z,...c.toArray()];},lipMat,h);
 const toothRows=[[-.121,.015],[-.103,.021],[-.080,.025],[-.050,.030],[-.018,.034],[.018,.034],[.050,.030],[.080,.025],[.103,.021],[.121,.015]];
 for(let i=0;i<toothRows.length;i++){
  const x=toothRows[i][0]*.970,width=toothRows[i][1]*.970,t=x/MW,top=MY-.203+.003*t*t+F.smileArch*(1-t*t);
  const bottom=MY-.249+.019*t*t+((i===2||i===7)?-.0025:0)+.0007*Math.sin(i*2.9);
  const tooth=box('Individual anatomically arranged upper tooth '+(i+1),[x,(top+bottom)/2,.294+MZ-.046*t*t],[width*1.025,top-bottom,.015],M.teeth,h,.004);
  tooth.rotation.y=-t*.43;tooth.rotation.z=t*.04;
 }
 for(let i=0;i<6;i++){const x=(i-2.5)*.019,t=x/MW;
  box('Subtle lower incisor '+(i+1),[x,MY-.273+.012*t*t,.280+MZ-.025*t*t],[.018,.006,.008],M.teeth,h,.003);
 }
 // A low tongue surface catches a muted bounce, rather than a flat red sticker.
 ball('Tongue inside smile',[0,MY-.282,.245+MZ],[.091,.009,.015],M.lipTop,h,32);
 for(let s of [-1,1]){
  const pts=[];for(let i=0;i<10;i++){const t=i/9,x=s*(.140+.017*t),y=MY-.210+.012*t;pts.push([x,y,faceZ(x,y)+.0005]);}
  tube('Fine smile commissure crease',pts,.0008,M.inner,h,14,4);
 }
}
function makeEarsAndNose(h,M){
 const mark=new T.MeshStandardMaterial({color:0x8e685b,roughness:.92});mark.name="Subtle skin marks";const nostril=new T.MeshStandardMaterial({color:0x493128,roughness:1,side:T.DoubleSide});nostril.name="Soft nostril shadow";
 for(const s of [-1,1]){
  const e=new T.Group();e.position.set(s*.374,-.067+F.earLift,-.014);e.rotation.y=s*.28;e.rotation.z=s*.08;h.add(e);
  ball('Ear pinna',[0,0,0],[.061,.133,.049],M.skin,e,40);
  ball('Ear concha shadow',[s*.012,-.002,.041],[.030,.068,.016],M.inner,e,32);
  tube('Soft helical rim',[[s*.001,-.095,.038],[s*.040,-.052,.047],[s*.045,.040,.042],[s*.021,.103,.032],[-s*.016,.073,.033]],.010,M.skin,e,40,8);
  tube('Antihelix fold',[[s*.005,-.056,.048],[s*.017,-.006,.053],[s*.001,.04,.051],[s*.015,.067,.045]],.006,M.lid,e,25,6);
  ball('Tragus',[-s*.02,-.025,.049],[.017,.025,.014],M.skin,e);ball('Earlobe',[s*.001,-.102,.010],[.033,.033,.035],M.skin,e);
  frontRing('Recessed nasal opening wall',64,10,(u,v)=>{
   const a=u*Math.PI*2,p=nostrilPoint(s,a),x=p[0],y=p[1]+.006*v,z=faceZ(...p)-.035*v;
   return[x,y,z];
  },nostril,h);
  ball('Nostril internal shadow',[s*.049,NY-.128,faceZ(s*.049,NY-.132)-.026],[.016,.010,.013],nostril,h,28);

 }
 // A small natural cheek mark observed visually; never a photographic texture.
 for(const [x,y,r] of [[-.243,-.085,.0025],[.178,-.063,.0024],[-.026,.043,.0022]])ball('Subtle facial mark',[x,y,faceZ(x,y)+.0005],[r,r*.86,.0006],mark,h,12);
}
export function makeFace(h,M){buildSkin(h,M);makeEyeGeometry(h,M,{faceZ,skinColor,frontRing});makeMouth(h,M);makeEarsAndNose(h,M);}
