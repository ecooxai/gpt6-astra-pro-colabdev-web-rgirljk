import * as T from 'three';
import {MarchingCubes} from 'three/addons/objects/MarchingCubes.js';
import {box} from './geometry.js';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function blend(a,b,k){let h=clamp(.5+.5*(b-a)/k,0,1);return b+(a-b)*h-k*h*(1-h);}
function cap(p,a,b,r0,r1){let ax=p[0]-a[0],ay=p[1]-a[1],az=p[2]-a[2],bx=b[0]-a[0],by=b[1]-a[1],bz=b[2]-a[2],t=clamp((ax*bx+ay*by+az*bz)/(bx*bx+by*by+bz*bz),0,1);return Math.hypot(ax-bx*t,ay-by*t,az-bz*t)-(r0+(r1-r0)*t);}
function ell(p,c,r){let x=p[0]-c[0],y=p[1]-c[1],z=p[2]-c[2],a=Math.hypot(x/r[0],y/r[1],z/r[2]),b=Math.hypot(x/r[0]**2,y/r[1]**2,z/r[2]**2);return b>1e-8?a*(a-1)/b:-.05;}
export function makeHand(root,M,wrist,s,forearm){const hand=new T.Group();hand.position.set(...wrist);hand.rotation.x=.42;hand.rotation.z=-s*.45;root.add(hand);hand.updateMatrixWorld(true);const inv=hand.matrixWorld.clone().invert(),arm=forearm.map(p=>new T.Vector3(...p).applyMatrix4(inv).toArray());const segments=[[arm[0],arm[1],.137,.119],[arm[1],[0,0,0],.119,.078],[[0,0,0],[0,-.082,0],.078,.067]],tips=[];
for(let j=0;j<4;j++){let x=(j-1.5)*.047,end=-.205-[.162,.202,.188,.15][j],a=[x,-.202,-.004],b=[x+s*.004,-.274,-.01],c=[x+s*.005,end,-.032];segments.push([a,b,.025,.023],[b,c,.023,.015]);tips.push(c);}
segments.push([[s*.065,-.105,.008],[s*.126,-.165,.012],.045,.032],[[s*.126,-.165,.012],[s*.14,-.227,-.008],.032,.027],[[s*.14,-.227,-.008],[s*.121,-.270,-.027],.027,.021]);
const low=[-.17,-.47,-.10],high=[.17,.12,.10];for(const [a,b,r0,r1] of segments){for(let k=0;k<3;k++){low[k]=Math.min(low[k],a[k]-r0-.045,b[k]-r1-.045);high[k]=Math.max(high[k],a[k]+r0+.045,b[k]+r1+.045);}}const center=low.map((v,k)=>(v+high[k])/2),half=low.map((v,k)=>(high[k]-v)/2);const n=88,mc=new MarchingCubes(n,M.skin,true,false,60000);mc.isolation=0;
for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){let p=[(x/n*2-1)*half[0]+center[0],(y/n*2-1)*half[1]+center[1],(z/n*2-1)*half[2]+center[2]],d=ell(p,[0,-.134,0],[.101,.139,.051]);d=blend(d,ell(p,[s*.057,-.117,.013],[.054,.084,.044]),.02);for(let i=0;i<segments.length;i++)d=blend(d,cap(p,...segments[i]),i<3?.030:.009);mc.field[x+y*n+z*n*n]=-d;}
mc.update();const g=new T.BufferGeometry(),count=mc.geometry.drawRange.count;for(const key of ['position','normal','uv']){const a=mc.geometry.getAttribute(key);if(a)g.setAttribute(key,new T.BufferAttribute(a.array.slice(0,count*a.itemSize),a.itemSize));}const mesh=new T.Mesh(g,M.skin);mesh.name='Unified original hand surface';mesh.scale.set(...half);mesh.position.set(...center);mesh.castShadow=true;hand.add(mesh);mc.geometry.dispose();
for(const p of tips){let nail=box('Natural fingernail',[p[0],p[1]+.013,p[2]-.014],[.022,.026,.0025],M.lid,hand,.005);nail.rotation.x=-.15;}
}
