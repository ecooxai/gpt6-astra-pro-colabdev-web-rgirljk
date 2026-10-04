/** Original continuous pinna surfaces, with a concave concha and authored folds. */
import * as T from 'three';
import {surface,tube,ball} from './geometry.js';
const G=(x,y,a,b,sx,sy)=>Math.exp(-(((x-a)/sx)**2+((y-b)/sy)**2));
function earSurface(s,a,r,back=false){
 const nx=Math.sin(a)*r,ny=Math.cos(a)*r;
 const x=.016+.061*nx*(1+.10*ny)+.009*ny,y=.001+.137*ny;
 const bowl=G(x,y,.004,-.015,.028,.055),rim=Math.exp(-(((r-.84)/.095)**2));
 const z=back?-.020+.055*r*r:.012+.023*r*r+.011*rim-.019*bowl;
 return[s*x,y,z];
}
function outward(mesh,s,back){
 if((s<0)!==back){const g=mesh.geometry,idx=g.index;for(let i=0;i<idx.count;i+=3){const t=idx.getX(i+1);idx.setX(i+1,idx.getX(i+2));idx.setX(i+2,t);}g.computeVertexNormals();}
}
export function makeAnatomicalEar(parent,M,s,F){
 const g=new T.Group();g.name=s<0?'Left continuous ear':'Right continuous ear';
 g.position.set(s*(s<0?.405:.379),-.067+F.earLift,-.014);g.rotation.y=s*(s<0?.42:.31);g.rotation.z=s*.055;g.scale.set(s<0?1.12:1.01,F.earScale,1);parent.add(g);
 const mat=M.skin.clone();mat.name='Original translucent-toned ear skin';mat.color.set(0xffffff);mat.vertexColors=true;mat.roughness=.56;mat.specularIntensity=.28;
 for(const back of [false,true]){
  const mesh=surface(back?'Continuous rear pinna':'Continuous concave front pinna',88,44,(u,v)=>{
   const p=earSurface(s,u*Math.PI*2,v,back),x=p[0]*s,y=p[1],c=new T.Color(back?0xdba392:0xe5b29d);
   const cup=G(x,y,.004,-.017,.029,.055),rim=Math.exp(-(((v-.81)/.15)**2));c.lerp(new T.Color(0xc27469),cup*(back?.08:.38)+rim*.07);return[...p,...c.toArray()];
  },mat,g);outward(mesh,s,back);
 }
 const fold=M.skin.clone();fold.name='Soft pinna cartilage';fold.color.set(0xe0ac98);fold.roughness=.62;fold.specularIntensity=.23;
 tube('Subtle antihelix ridge',[[s*.019,-.082,.029],[s*.039,-.045,.031],[s*.035,.005,.033],[s*.031,.047,.040],[s*.032,.084,.043]],.0048,fold,g,42,8);
 tube('Superior antihelix fork',[[s*.035,.005,.033],[s*.009,.048,.031],[s*.003,.078,.031]],.0039,fold,g,24,8);
 ball('Soft tragus at concha edge',[-s*.006,-.029,.027],[.010,.018,.009],fold,g,28);
 ball('Antitragus', [s*.016,-.080,.027],[.012,.010,.008],fold,g,28);
 return g;
}
