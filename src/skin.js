/** Deterministic original skin microstructure. No photographic input. */
import * as T from 'three';
export function makeSkinMicrostructure(){
 let seed=318791;const R=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const size=512,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#808080';ctx.fillRect(0,0,size,size);
 for(let i=0;i<5200;i++){
  const x=R()*size,y=R()*size,r=.35+R()*1.1,gradient=ctx.createRadialGradient(x,y,0,x,y,r);
  gradient.addColorStop(0,'rgba(35,35,35,.42)');gradient.addColorStop(.48,'rgba(80,80,80,.14)');gradient.addColorStop(1,'rgba(128,128,128,0)');ctx.fillStyle=gradient;ctx.fillRect(x-r,y-r,r*2,r*2);
 }
 const h=ctx.getImageData(0,0,size,size).data,ncanvas=document.createElement('canvas');ncanvas.width=ncanvas.height=size;
 const nc=ncanvas.getContext('2d'),n=nc.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const k=(y*size+x)*4,at=(xx,yy)=>h[(((yy+size)%size)*size+(xx+size)%size)*4]/255;
  let nx=(at(x-1,y)-at(x+1,y))*.82,ny=(at(x,y-1)-at(x,y+1))*.82,nz=1,mag=Math.hypot(nx,ny,nz);
  n.data[k]=(nx/mag*.5+.5)*255;n.data[k+1]=(ny/mag*.5+.5)*255;n.data[k+2]=(nz/mag*.5+.5)*255;n.data[k+3]=255;
 }
 nc.putImageData(n,0,0);const normal=new T.CanvasTexture(ncanvas);normal.colorSpace=T.NoColorSpace;normal.wrapS=normal.wrapT=T.RepeatWrapping;normal.repeat.set(8,4);normal.anisotropy=8;normal.name='Original procedural skin pore normals';return normal;
}
