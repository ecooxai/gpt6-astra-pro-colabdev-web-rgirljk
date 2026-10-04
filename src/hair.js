/** Original layered hair groom. No downloaded meshes, maps, cards or photograph sampling. */
import * as T from 'three';
import {surface,ball,tube,sample,mix,V} from './geometry.js';
import {headRows,faceZ} from './face.js';
import {makePonytailGroom} from './hair-groom.js';
let seed=72345;const R=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const clamp=T.MathUtils.clamp;
export function makeHair(h,M){
 seed=72345;
 M.hair.color.set(0x8b919f);M.hair.roughness=.45;M.hair.clearcoat=.015;M.hair.clearcoatRoughness=.52;M.hair.specularIntensity=.43;M.hair.anisotropy=.78;M.hair.anisotropyRotation=Math.PI/2;
 M.hairLine.color.set(0x211c1a);M.hairLine.roughness=.72;M.hairLine.specularIntensity=.20;
 M.hairLight.color.set(0x382d28);M.hairLight.roughness=.68;M.hairLight.specularIntensity=.24;
 const fibreMats=[M.hairLine,M.hairLine,M.hairLight,M.hair.clone()];fibreMats[3].name='Soft brown hair fibres';fibreMats[3].color.set(0x9b8d89);fibreMats[3].roughness=.57;
 function strand(name,points,r,mat,segments=26){const curve=new T.CatmullRomCurve3(points.map(V));const geo=new T.TubeGeometry(curve,segments,r,3,false);
  const p=geo.attributes.position;for(let j=0;j<=segments;j++){const v=j/segments,c=curve.getPointAt(v),taper=Math.pow(Math.sin(Math.PI*(.06+.94*v)),.38)*Math.pow(1-v,.20);for(let k=0;k<=3;k++){const i=j*4+k;p.setXYZ(i,c.x+(p.getX(i)-c.x)*taper,c.y+(p.getY(i)-c.y)*taper,c.z+(p.getZ(i)-c.z)*taper);}}
  geo.computeVertexNormals();const m=new T.Mesh(geo,mat);m.name=name;m.castShadow=true;h.add(m);return m;
 }
 function endY(a){let f=Math.cos(a);if(f<=0)return -.355-.035*Math.sin(a)**2;return .27-.49*Math.pow(Math.abs(Math.sin(a)),5)+.028*Math.sin(a);}
 function scalp(a,v){const y=mix(.608,endY(a),v);let [rx,rz,rb]=sample(headRows,Math.min(.579,y));if(y>.54){let q=Math.sqrt(Math.max(.000001,(.608-y)/.068));rx=.201*q;rz=.202*q;rb=.193*q;}else{rx+=.027;rz+=.033;rb+=.028;}
  const wave=.0015*Math.sin(a*13+v*11);rx+=wave;return[rx*Math.sin(a)+.035*Math.pow(1-v,3),y,Math.cos(a)>=0?rz*Math.pow(Math.max(0,Math.cos(a)),.80):rb*Math.cos(a)];}
 surface('Full fitted scalp and nape',128,96,(u,v)=>scalp(u*Math.PI*2,v),M.hair,h);
 for(let j=0;j<380;j++){const a=R()*Math.PI*2,v0=.015+R()*.08,v1=.98+R()*.02,phase=R()*6.28,pts=[];
  for(let k=0;k<=22;k++){const v=mix(v0,v1,k/22),aa=a+.12*Math.sin(v*Math.PI)*Math.sin(a-.45)+.003*Math.sin(v*35+phase);let p=scalp(aa,v);p[2]+=.0006*Math.cos(aa);p[0]+=.0006*Math.sin(aa);pts.push(p);}
  strand('Swept crown strand',pts,.0004+R()*.00020,fibreMats[j%11===0?2:0],22);
 }
 function lock(name,points,width,depth,fibres=18,project=false){const curve=new T.CatmullRomCurve3(points.map(V));
  function point(v,offset=0,front=1){const p=curve.getPoint(v),t=curve.getTangent(v),side=new T.Vector3(t.y,-t.x,0).normalize(),env=Math.pow(Math.sin(Math.PI*(.075+.925*v)),.48)*Math.pow(1-v,.20);p.addScaledVector(side,width*env*offset);
   if(project&&p.y>-.24&&Math.abs(p.x)<sample(headRows,p.y)[0]*.97)p.z=Math.max(p.z,faceZ(p.x,p.y)+(typeof project==='number'?project:.023));
   p.z+=depth*env*front;return p;}
  surface(name,16,48,(u,v)=>point(v,Math.sin(u*Math.PI*2),Math.cos(u*Math.PI*2)).toArray(),M.hair,h);
  for(let j=0;j<fibres;j++){const off=-.97+1.94*(j+R()*.6)/fibres,phase=R()*6.28,pts=[];for(let k=0;k<=27;k++){const v=.012+k/27*.982,p=point(v,off+Math.sin(v*24+phase)*.012,Math.sqrt(Math.max(0,1-off*off)));p.z+=.0007;pts.push(p.toArray());}strand(name+' fine strand',pts,.00038+R()*.00024,fibreMats[j%11===0?2:0],26);}
 }

 // A continuous swept bang sheet avoids the previous conspicuous pointed clumps.
 function hairFront(x,y){let [rx,rz]=sample(headRows,Math.min(.579,y));if(y>.54){const q=Math.sqrt(Math.max(.00001,(.608-y)/.068));rx=.201*q;rz=.202*q;}else{rx+=.026;rz+=.033;}return rz*Math.pow(Math.max(.003,1-(x/rx)**2),.40);}
 function fringe(u,v){const x0=.26*u,y0=.565-.100*u,xe=-.339+.525*u,ye=.086+.13*u+.0011*Math.sin(u*83)+.0005*Math.sin(u*227),t=v,iv=1-t;
  const x=iv**3*x0+3*iv*iv*t*(x0-.047)+3*iv*t*t*(xe+.098)+t**3*xe;
  const y=iv**3*y0+3*iv*iv*t*(y0-.135)+3*iv*t*t*(ye+.042)+t**3*ye;
  const z=hairFront(x,y)+.008+.00055*Math.sin(u*91+v*12)+.00023*Math.sin(u*177-v*7)+.0009*Math.sin(u*23+v*3);return[x,y,z];}
 surface('Coherent side-swept fringe',160,90,(u,v)=>fringe(u,v),M.hair,h);
 for(let j=0;j<360;j++){const u=(j+R()*.7)/360,pts=[],start=R()*.025,end=.995+R()*.025,phase=R()*6.28;for(let k=0;k<=31;k++){let v=mix(start,end,k/31),p=fringe(clamp(u+.0008*Math.sin(v*27+phase),0,1),v);p[2]+=.00065;pts.push(p);}strand('Continuous swept fringe filament',pts,.00028+R()*.00016,j%11===0?M.hairLight:M.hairLine,30);}
 lock('Fine asymmetric curved bang',[[.274,.423,.251],[.277,.306,.307],[.168,.212,.328],[.061,.145,.333]],.011,.0025,12,.010);
 for(let s of [-1,1]){
  lock('Temple hair',[ [s*.27,.40,.225],[s*.347,.22,.254],[s*.357,.012,.217],[s*.352,-.227,.142] ],.032,.012,18,true);
  lock('Loose face framing strand',[[s*.346,.032,.234],[s*.337,-.175,.262],[s*.317,-.399,.183],[s*.379,-.576,.132]],.010,.006,7,false);
  makePonytailGroom(h,M,s);
 }
 // Irregular baby hairs at the temples break the artificial cap edge.
 for(let s of [-1,1])for(let j=0;j<22;j++){const y=.18-j*.010,x=s*(.350+.013*Math.sin(j*.38));strand('Temple baby hair',[[x,y,.24],[x+s*.006,y-.032,.23],[x-s*.003,y-.064,.218]],.00028,M.hairLine,12);}
}
