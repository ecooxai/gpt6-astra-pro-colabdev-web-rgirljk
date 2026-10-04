/** Original anatomical eye assembly. Geometry and colour are authored, not sampled. */
import * as T from 'three';
import {surface,ball,tube,mix} from './geometry.js';
import {makeBrowMaterial} from './brows.js';
const EY=.084,EX=.148,EW=.0665,RX=.085,RY=.0725,RZ=.070;
export function eyeContour(s,a,outer=false){
 const t=Math.cos(a),upper=Math.sin(a)>=0,w=Math.max(0,1-t*t),width=outer?.098:EW;
 const arch=upper?(outer?.052:.030)*Math.pow(w,outer?.70:.86)*(1-.10*s*t):-(outer?.036:.014)*Math.pow(w,outer?.70:.82)*(1+.10*s*t);
 return[s*EX+width*t,EY+s*t*.008+arch];
}
function ocularZ(s,x,y,faceZ){
 const cx=s*EX,cz=faceZ(cx,EY)+.012-RZ;
 return cz+RZ*Math.sqrt(Math.max(.000001,1-((x-cx)/RX)**2-((y-EY)/RY)**2));
}
export function makeEyeGeometry(h,M,{faceZ,skinColor,frontRing}){
 if(typeof faceZ!=='function'||typeof skinColor!=='function'||typeof frontRing!=='function')throw new Error('Eye assembly requires the authored facial surface functions.');
 const sclera=new T.MeshPhysicalMaterial({color:0xe5ddd4,roughness:.28,clearcoat:.86,clearcoatRoughness:.055,specularIntensity:.46,ior:1.38});sclera.name='Moist warm sclera';
 const iris=new T.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.34,clearcoat:.88,clearcoatRoughness:.055,specularIntensity:.52});iris.name='Original radial brown iris fibres';
 const margin=new T.MeshPhysicalMaterial({color:0xb98a79,roughness:.46,specularIntensity:.24});margin.name='Subtle moist eyelid margin';
 const browMat=makeBrowMaterial();
 for(const s of [-1,1]){
  const cz=faceZ(s*EX,EY)+.012-RZ;
  ball('Complete inset eyeball',[s*EX,EY,cz],[RX,RY,RZ],sclera,h,64);
  frontRing('Orbital tissue and naturally curved eyelids',96,24,(u,v)=>{
   const a=u*Math.PI*2,inner=eyeContour(s,a),outer=eyeContour(s,a,true),x=mix(inner[0],outer[0],v),y=mix(inner[1],outer[1],v),zi=ocularZ(s,...inner,faceZ)+.0018;
   let z=faceZ(x,y)+(zi-faceZ(...inner))*(1-v)**2+.0011*Math.sin(Math.PI*v);
   const upper=Math.max(0,Math.sin(a)),crease=Math.exp(-(((v-.36)/.14)**2))*upper;z-=.0014*crease;
   const c=new T.Color().fromArray(skinColor(x,y));c.lerp(new T.Color(0xab776b),.11*crease+.12*Math.exp(-v*28));return[x,y,z,...c.toArray()];
  },M.face,h);
  const ix=s*EX-.002,iy=EY+.003,ir=.0308;
  frontRing('Curved iris without artificial boundary clamping',128,24,(u,v)=>{
   const a=u*Math.PI*2,r=ir*v,x=ix+Math.cos(a)*r,y=iy+Math.sin(a)*r;
   const fibre=.13*Math.sin(a*127+v*8)+.09*Math.sin(a*239-v*15)+.065*Math.sin(a*57+v*32),c=new T.Color(0x251b14);
   c.lerp(new T.Color(0x63452c),Math.max(0,.29+fibre)*Math.sin(Math.PI*v));c.lerp(new T.Color(0x15181b),Math.pow(v,14)*.85);return[x,y,ocularZ(s,x,y,faceZ)+.0011,...c.toArray()];
  },iris,h);
  frontRing('Recessed circular pupil',64,10,(u,v)=>{const a=u*Math.PI*2,x=ix+Math.cos(a)*.0108*v,y=iy+Math.sin(a)*.0108*v;return[x,y,ocularZ(s,x,y,faceZ)+.0015];},M.pupil,h);
  const gx=ix-.0085,gy=iy+.0105;
  ball('Small window reflection in cornea',[gx,gy,ocularZ(s,gx,gy,faceZ)+.0020],[.0029,.0020,.0007],M.glint,h,16);
  ball('Secondary corneal glint',[ix+.006,iy-.007,ocularZ(s,ix+.006,iy-.007,faceZ)+.0018],[.0009,.0008,.0004],M.glint,h,12);
  for(const upper of [true,false]){
   const pts=[];for(let i=0;i<=48;i++){const a=(upper?0:Math.PI)+i/48*Math.PI,[x,y]=eyeContour(s,a);pts.push([x,y,ocularZ(s,x,y,faceZ)+.0020]);}
   tube(upper?'Fine upper lash roots':'Lower tear-film boundary',pts,upper?.00065:.00026,upper?M.lash:margin,h,56,5);
  }
  for(let j=0;j<26;j++){
   const t=-.90+j/25*1.80,[x,y]=eyeContour(s,Math.acos(t)),z=ocularZ(s,x,y,faceZ)+.0020,l=.0025+.0037*(.5+.5*s*t),r=.00023+.00007*(j%3);
   tube('Tapered individual upper eyelash',[[x,y,z],[x+s*.0012,y+l*.60,z+.0019],[x+s*.0029,y+l,z+.0026]],r,M.lash,h,5,3);
  }
  const cx=s*(EX-EW+.004),cy=EY-.004;
  ball('Lacrimal caruncle',[cx,cy,ocularZ(s,cx,cy,faceZ)+.0012],[.0038,.0021,.0015],M.lipTop,h,18);
  const brow=surface('Natural eyebrow fibre density',72,10,(u,v)=>{const t=u*2-1,x=s*EX+t*.094,y=.174+.019*(1-t*t)-s*t*.006+(v-.5)*.029*(1-.45*Math.abs(t));return[x,y,faceZ(x,y)+.0031];},browMat,h);
  if(s<0){const uv=brow.geometry.attributes.uv;for(let k=0;k<uv.count;k++)uv.setX(k,1-uv.getX(k));}
  for(let j=0;j<64;j++){
   const t=j/63*2-1,x=s*EX+t*.094,y=.171+.019*(1-t*t)-s*t*.006+.003*Math.sin(j*2.31),l=.005+.006*(1-Math.abs(t));
   tube('Individual eyebrow hair',[[x,y,faceZ(x,y)+.001],[x+s*.003,y+l*.6,faceZ(x+s*.003,y+l*.6)+.0015],[x+s*.006,y+l,faceZ(x+s*.006,y+l)+.001]],.00035*(1-.5*Math.abs(t)),M.lash,h,5,3);
  }
 }
}
