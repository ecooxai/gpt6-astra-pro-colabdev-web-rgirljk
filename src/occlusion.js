/** Contact-occlusion baking from the authored 3D meshes, never from the reference image.
 * BVH is a computational acceleration structure; all sampled surfaces are our own geometry.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {MeshBVH,SAH} from 'three-mesh-bvh';
const state=new WeakMap();
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
function vertexAtlas(geometry,visibility,size=768){
 const uv=geometry.attributes.uv;if(!uv)return null;
 const img=new Float32Array(size*size);img.fill(1);const covered=new Uint8Array(size*size),index=geometry.index,count=index?index.count:uv.count;
 for(let k=0;k<count;k+=3){
  const ids=[0,1,2].map(j=>index?index.getX(k+j):k+j),u=ids.map(i=>uv.getX(i)),v=ids.map(i=>uv.getY(i));
  if(Math.max(...u)-Math.min(...u)>.6)continue;
  const x=u.map(q=>q*(size-1)),y=v.map(q=>(1-q)*(size-1)),a=(x[1]-x[0])*(y[2]-y[0])-(y[1]-y[0])*(x[2]-x[0]);if(Math.abs(a)<1e-9)continue;
  const loX=Math.max(0,Math.floor(Math.min(...x))),hiX=Math.min(size-1,Math.ceil(Math.max(...x))),loY=Math.max(0,Math.floor(Math.min(...y))),hiY=Math.min(size-1,Math.ceil(Math.max(...y)));
  for(let yy=loY;yy<=hiY;yy++)for(let xx=loX;xx<=hiX;xx++){
   const px=xx+.5,py=yy+.5,b=((px-x[0])*(y[2]-y[0])-(py-y[0])*(x[2]-x[0]))/a,c=((x[1]-x[0])*(py-y[0])-(y[1]-y[0])*(px-x[0]))/a,d=1-b-c;
   if(b<-.0001||c<-.0001||d<-.0001)continue;const i=yy*size+xx,z=visibility[ids[0]]*d+visibility[ids[1]]*b+visibility[ids[2]]*c;img[i]=Math.min(img[i],z);covered[i]=1;
  }
 }
 // Extend chart edges into adjacent empty pixels to prevent bright sampling seams.
 for(let pass=0;pass<3;pass++){
  const old=covered.slice(),values=img.slice();
  for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++){const i=y*size+x;if(old[i])continue;let n=0,total=0;for(const j of [i-1,i+1,i-size,i+size])if(old[j]){total+=values[j];n++;}if(n){img[i]=total/n;covered[i]=1;}}
 }
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d'),data=ctx.createImageData(size,size);
 for(let i=0;i<img.length;i++){const q=Math.round(T.MathUtils.clamp(img[i],0,1)*255);data.data[i*4]=data.data[i*4+1]=data.data[i*4+2]=q;data.data[i*4+3]=255;}
 ctx.putImageData(data,0,0);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.NoColorSpace;tex.anisotropy=8;tex.name='Original geometry-baked contact visibility';tex.channel=0;return tex;
}
function eligible(name){return /^Face|ear skin|pinna cartilage|warm skin|sclera|enamel|cotton|shirt/i.test(name);}
export async function bakeContactOcclusion(model,options={}){
 if(!model?.isObject3D)throw new TypeError('A Three.js model is required');
 const samples=Math.round(T.MathUtils.clamp(options.samples??24,4,96)),radius=T.MathUtils.clamp(options.radius??.18,.02,.45),strength=T.MathUtils.clamp(options.strength??.55,0,1),region=options.region??'head',started=performance.now();
 if(state.has(model))throw new Error('Occlusion has already been baked on this model. Reload the original model for another independent trial.');
 model.updateMatrixWorld(true);const sources=[],targets=[];
 model.traverse(o=>{
  if(!o.isMesh||!o.geometry.attributes.position||Array.isArray(o.material))return;
  const mat=o.material,name=mat.name||'';
  if(eligible(name))targets.push(o);
  const fineHair=/hair/i.test(name)&&!/^Dark swept hair|Soft dark hair underlayer$/i.test(name);
  if(mat.alphaTest>0||mat.transparent||mat.isMeshBasicMaterial||fineHair||/lash|brow|filament|glint/i.test(name))return;
  let g=o.geometry.clone();for(const a of Object.keys(g.attributes))if(a!=='position')g.deleteAttribute(a);g.applyMatrix4(o.matrixWorld);if(g.index)g=g.toNonIndexed();sources.push(g);
 });
 if(!sources.length)throw new Error('No opaque authored surfaces available for ray queries');
 const geometry=mergeGeometries(sources,false);sources.forEach(g=>g.dispose());const tree=new MeshBVH(geometry,{strategy:SAH,maxLeafTris:8,verbose:false});
 const p=new T.Vector3(),n=new T.Vector3(),tx=new T.Vector3(),ty=new T.Vector3(),axis=new T.Vector3(),ray=new T.Ray(),normalMatrix=new T.Matrix3();
 let tested=0,rays=0,occluded=0;const results=[];
 for(const mesh of targets){
  const g=mesh.geometry,pos=g.attributes.position,norm=g.attributes.normal,values=new Float32Array(pos.count);values.fill(1);normalMatrix.getNormalMatrix(mesh.matrixWorld);let count=0,total=0,min=1;
  for(let i=0;i<pos.count;i++){
   p.fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld);if(region==='head'&&p.y<6.08)continue;
   n.fromBufferAttribute(norm,i).applyMatrix3(normalMatrix).normalize();if(!Number.isFinite(n.x)||n.lengthSq()<.5)continue;
   axis.set(0,Math.abs(n.y)<.92?1:0,Math.abs(n.y)<.92?0:1);tx.crossVectors(axis,n).normalize();ty.crossVectors(n,tx).normalize();
   ray.origin.copy(p).addScaledVector(n,.0016);const phase=((Math.sin(p.x*127.1+p.y*311.7+p.z*71.9)*43758.5453)%1)*Math.PI*2;let blocked=0;
   for(let k=0;k<samples;k++){
    const q=(k+.5)/samples,r=Math.sqrt(q),a=k*2.399963229728653+phase,z=Math.sqrt(1-q);
    ray.direction.copy(n).multiplyScalar(z).addScaledVector(tx,Math.cos(a)*r).addScaledVector(ty,Math.sin(a)*r).normalize();
    const hit=tree.raycastFirst(ray,T.DoubleSide,.0007,radius);rays++;if(hit){blocked+=Math.pow(Math.max(0,1-hit.distance/radius),.8);occluded++;}
   }
   const visible=1-blocked/samples;values[i]=visible;total+=visible;min=Math.min(min,visible);count++;tested++;
   if(tested%1500===0){options.onProgress?.({vertices:tested,rays,material:mesh.material.name});await pause();}
  }
  if(!count)continue;
  const material=mesh.material.clone(),baseName=material.name;mesh.material=material;
  if(baseName.startsWith('Face')){
   material.aoMap=vertexAtlas(g,values,options.atlasSize??768);material.aoMapIntensity=strength;
  }else{
   const base=g.attributes.color,colors=new Float32Array(pos.count*3),amount=strength*(/ear|pinna/i.test(baseName)?.38:.26);
   for(let i=0;i<pos.count;i++){const factor=1-amount*(1-values[i]);for(let j=0;j<3;j++)colors[i*3+j]=(base?base.getComponent(i,j):1)*factor;}
   g.setAttribute('color',new T.BufferAttribute(colors,3));material.vertexColors=true;
  }
  material.needsUpdate=true;results.push({material:baseName,vertices:count,averageVisibility:total/count,minVisibility:min,mode:baseName.startsWith('Face')?'UV ambient-occlusion atlas':'subtle vertex contact shading'});
 }
 const report={samples,radius,strength,region,vertices:tested,rays,occludedRays:occluded,sourceTriangles:geometry.attributes.position.count/3,durationMilliseconds:performance.now()-started,materials:results};geometry.dispose();state.set(model,report);model.userData.contactOcclusion={samples,radius,strength,region,vertices:tested,rays};return report;
}
