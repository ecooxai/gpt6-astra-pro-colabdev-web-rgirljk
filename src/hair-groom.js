/** Original deterministic 3D ribbon groom. No image or external hair asset is sampled. */
import * as T from 'three';
import {surface,sample,V} from './geometry.js';
const TAU=Math.PI*2;
const rng=initial=>{let seed=initial;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};
let fibreMaps;const materialCache=new WeakMap();
function makeFibreMaps(){
 if(fibreMaps)return fibreMaps;
 const R=rng(240193),w=512,h=1024,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.clearRect(0,0,w,h);x.lineCap='round';
 for(let j=0;j<112;j++){
  const center=(j+R()*.86)/112*w,phase=R()*TAU,end=.82+R()*.18,thick=1.45+R()*2.65,warm=R(),rr=Math.round(24+warm*26),gg=Math.round(22+warm*21),bb=Math.round(21+warm*19);
  for(let k=0;k<40;k++){
   const t=k/40*end,tn=(k+1)/40*end,a=center+2.5*Math.sin(t*5+phase)+1.4*Math.sin(t*13+phase),b=center+2.5*Math.sin(tn*5+phase)+1.4*Math.sin(tn*13+phase),taper=Math.pow(Math.max(0,1-t/end),.32);
   x.strokeStyle=`rgba(${rr},${gg},${bb},${.76+warm*.23})`;x.lineWidth=Math.max(.18,thick*taper);x.beginPath();x.moveTo(a,t*h);x.lineTo(b,tn*h);x.stroke();
  }
 }
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=T.RepeatWrapping;map.wrapT=T.ClampToEdgeWrapping;map.anisotropy=8;map.name='Original painted hair fibre opacity and colour';
 const pixels=x.getImageData(0,0,w,h).data,nc=document.createElement('canvas');nc.width=w;nc.height=h;const nx=nc.getContext('2d'),out=nx.createImageData(w,h),height=(u,v)=>pixels[((Math.max(0,Math.min(h-1,v))*w+(u+w)%w)*4)+3]/255;
 for(let v=0;v<h;v++)for(let u=0;u<w;u++){const a=(height(u-1,v)-height(u+1,v))*.95,b=(height(u,v+1)-height(u,v-1))*.35,z=1,q=Math.hypot(a,b,z),i=(v*w+u)*4;out.data[i]=(a/q*.5+.5)*255;out.data[i+1]=(b/q*.5+.5)*255;out.data[i+2]=(z/q*.5+.5)*255;out.data[i+3]=255;}
 nx.putImageData(out,0,0);const normal=new T.CanvasTexture(nc);normal.colorSpace=T.NoColorSpace;normal.wrapS=T.RepeatWrapping;normal.wrapT=T.ClampToEdgeWrapping;normal.anisotropy=8;normal.name='Original cylindrical hair fibre normals';fibreMaps={map,normal};return fibreMaps;
}
function groomMaterials(base){
 if(materialCache.has(base))return materialCache.get(base);const {map}=makeFibreMaps(),cards=base.clone(),core=base.clone();
 cards.name='Original fine hair ribbons';cards.map=map;cards.normalMap=null;cards.color.set(0x9da3b0);cards.roughness=.66;cards.clearcoat=0;cards.clearcoatRoughness=.52;cards.specularIntensity=.26;cards.anisotropy=.67;cards.anisotropyRotation=Math.PI/2;cards.alphaTest=.36;cards.alphaToCoverage=false;cards.side=T.DoubleSide;cards.transparent=false;
 core.name='Soft dark hair underlayer';core.roughness=.74;core.clearcoat=0;core.specularIntensity=.18;core.anisotropy=.45;core.color.set(0x777a84);const m={cards,core};materialCache.set(base,m);return m;
}
const radius=v=>sample([[0,.054],[.15,.113],[.34,.124],[.55,.109],[.74,.077],[.88,.044],[1,.002]],v)[0];
function frame(curve,v,angle){
 const p=curve.getPoint(v),t=curve.getTangent(v).normalize(),b=new T.Vector3(1,0,0).addScaledVector(t,-t.x).normalize(),f=t.clone().cross(b).normalize(),n=f.multiplyScalar(Math.cos(angle)).addScaledVector(b,Math.sin(angle)),a=t.clone().cross(n).normalize();return{p,t,n,a};
}
function makeCurve(s,R,length=1.065){const dx=(R()-.5)*.115,dz=(R()-.5)*.100;return new T.CatmullRomCurve3([[s*.357,-.263,-.090],[s*(.466+dx*.3),-.445,.060+dz],[s*(.495+dx),-.690,.270+dz],[s*(.467-dx*.6),-length+.145,.452+dz],[s*(.399+dx*1.7),-length,.412+dz*1.7]].map(V));}
function fineStrand(name,pts,r,mat,parent){
 const curve=new T.CatmullRomCurve3(pts.map(V)),segments=24,g=new T.TubeGeometry(curve,segments,r,3,false),p=g.attributes.position;
 for(let j=0;j<=segments;j++){const t=j/segments,c=curve.getPointAt(t),f=Math.pow(1-t,.25);for(let k=0;k<4;k++){const i=j*4+k;p.setXYZ(i,c.x+(p.getX(i)-c.x)*f,c.y+(p.getY(i)-c.y)*f,c.z+(p.getZ(i)-c.z)*f);}}
 g.computeVertexNormals();const m=new T.Mesh(g,mat);m.name=name;m.castShadow=true;parent.add(m);
}
export function makePonytailGroom(parent,M,s){
 const R=rng(s<0?681225:492058),{cards,core}=groomMaterials(M.hair),main=makeCurve(s,()=>.5,1.05+(s>0?.045:0));
 surface('Ponytail soft volume',40,64,(u,v)=>{const f=frame(main,v,-u*TAU),r=radius(v)*.79;return f.p.addScaledVector(f.n,r).toArray();},core,parent);
 const elastic=new T.Mesh(new T.TorusGeometry(.061,.0055,6,40),M.webbing);elastic.name='Partly covered ponytail elastic';elastic.position.set(s*.357,-.285,-.081);elastic.rotation.x=Math.PI/2;parent.add(elastic);
 for(let j=0;j<76;j++){
  const angle=j*2.399963229728653,phase=R()*TAU,len=.90+R()*.245+(s>0?.040:0),curve=makeCurve(s,R,len),width=.037+R()*.039,layer=.88+R()*.24,uvShift=R();
  const card=surface('Individually waved hair ribbon '+s+':'+j,6,48,(u,v)=>{const wave=.031*Math.sin(v*11+phase)*Math.sin(Math.PI*v),f=frame(curve,v,angle+.12*Math.sin(v*7+phase)),env=(.50+.65*Math.sin(Math.PI*v))*Math.pow(1-v,.22);f.p.addScaledVector(f.n,radius(v)*layer+wave+.003*(1-(2*u-1)**2)*env);f.p.addScaledVector(f.a,(u-.5)*width*env+.021*Math.sin(v*13+phase)*v);return f.p.toArray();},cards,parent);
  const uv=card.geometry.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,uv.getX(k)+uvShift,1-uv.getY(k));
 }
 for(let j=0;j<108;j++){
  const angle=R()*TAU,len=.88+R()*.31+(s>0?.035:0),curve=makeCurve(s,R,len),phase=R()*TAU,pts=[];
  for(let k=0;k<=12;k++){const v=k/12,f=frame(curve,v,angle+.17*Math.sin(v*8+phase)),r=radius(v)*(1.01+R()*.13)+.009*Math.sin(v*Math.PI);f.p.addScaledVector(f.n,r).addScaledVector(f.a,.018*Math.sin(v*11+phase)*v);pts.push(f.p.toArray());}
  fineStrand('Loose tapered ponytail fibre',pts,.00031+R()*.00024,j%9===0?M.hairLight:M.hairLine,parent);
 }
}
