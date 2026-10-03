import * as T from 'three';
import {surface,ball,tube,sample,mix,V} from './geometry.js';
import {faceZ} from './face.js';
let seed=45181;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const hr=[[-.42,.267,.249],[-.27,.353,.304],[0,.407,.357],[.20,.391,.356],[.37,.340,.308],[.49,.252,.240],[.56,.142,.130],[.595,.001,.001]];
function cap(a,v){const end=-.37+.60*Math.pow(Math.max(0,Math.cos(a)),.46)+.13*Math.exp(-1*((a-.62)/.35)**2),y=mix(.595,end,v),[rx,rz]=sample(hr,y),aa=a+.14*Math.sin(v*Math.PI),b=Math.cos(aa),x=rx*Math.sin(aa),z=rz*Math.sign(b)*Math.pow(Math.abs(b),.73);return new T.Vector3(x,y,z);}
function bez(a,b,c,d,t){return a.clone().multiplyScalar((1-t)**3).addScaledVector(b,3*t*(1-t)**2).addScaledVector(c,3*t*t*(1-t)).addScaledVector(d,t**3);}
function bang(u,v){u=T.MathUtils.clamp(u,0,1);let x=-.334+.558*u,y=.116+.176*u**3.3+.008*Math.sin(u*7),end=new T.Vector3(x,y,faceZ(x,y)+.032);const a=new T.Vector3(.14+.04*u,.526-.006*u,.224-.025*u),b=new T.Vector3(mix(a.x,x,.33)+.05,.393+.01*u,.337),c=new T.Vector3(mix(a.x,x,.77)+.022,.18+.089*u*u,.36-.06*Math.abs(x));let p=bez(a,b,c,end,v);let [rx,rz]=sample(hr,p.y),cz=rz*Math.pow(Math.max(0,1-(p.x/rx)**2),.365);p.z=mix(p.z,cz+.004,Math.pow(1-v,5));p.z=Math.max(p.z,cz+.004);p.z+=.0007*Math.sin(u*480+Math.sin(v*9));return p;}

export function makeHair(h,M){
 seed=45181;
 M.hair=new T.MeshPhysicalMaterial({color:0x121216,roughness:.49,anisotropy:.65,anisotropyRotation:Math.PI/2,clearcoat:.08,clearcoatRoughness:.50,side:T.DoubleSide});M.hair.name='Dark layered hair surfaces';
 M.hairLine=new T.MeshLambertMaterial({color:0x19171a});M.hairLine.name='Individual dark hair fibres';M.hairLight=new T.MeshLambertMaterial({color:0x312825});M.hairLight.name='Subtle brown hair fibres';
 surface('Continuous swept crown',160,80,(u,v)=>cap(u*Math.PI*2,v).toArray(),M.hair,h);
 for(let j=0;j<680;j++){let a=j/680*Math.PI*2+(rand()-.5)*.004,start=.012+rand()*.045,end=.95+rand()*.04,pts=[];for(let k=0;k<=30;k++){let v=mix(start,end,k/30),p=cap(a,v);p.addScaledVector(new T.Vector3(p.x,0,p.z).normalize(),.0009+.0005*Math.sin(v*17+j));pts.push(p.toArray());}tube('Swept crown fibre',pts,.00045+rand()*.00025,j%13===0?M.hairLight:M.hairLine,h,32,3);}
 surface('Continuous side swept fringe',112,64,(u,v)=>bang(u,v).toArray(),M.hair,h);
 for(let j=0;j<420;j++){const u=(j+.2+rand()*.6)/420,pts=[],end=.93+rand()*.07;for(let k=0;k<=32;k++){let v=mix(.025,end,k/32),p=bang(u+.0012*Math.sin(v*15+j),v);p.z+=.0012+.0005*Math.sin(v*13+j);pts.push(p.toArray());}tube('Fine fringe fibre',pts,.00045+rand()*.00022,j%17===0?M.hairLight:M.hairLine,h,34,3);}

 function lock(name,pts,w,d,n=6){const curve=new T.CatmullRomCurve3(pts.map(V)),frames=curve.computeFrenetFrames(44,false);function point(a,v){let p=curve.getPoint(v),k=Math.round(v*44),r=(.55+.45*Math.sin(v*Math.PI))*Math.pow(1-v,.65);p.addScaledVector(frames.normals[k],Math.cos(a)*w*r);p.addScaledVector(frames.binormals[k],Math.sin(a)*d*r);return p;}
 surface(name,10,44,(u,v)=>point(u*Math.PI*2,v).toArray(),M.hair,h);
 for(let j=0;j<n;j++){const a=j/n*Math.PI*2,points=[];for(let k=0;k<=28;k++){const v=k/28*.99;points.push(point(a,v).toArray());}tube('Tapered ponytail fibre',points,.00065,j%7?M.hairLine:M.hairLight,h,30,3);}}
 for(const s of [-1,1]){
 ball('Gathered low hair root',[s*.355,-.30,-.147],[.084,.092,.077],M.hair,h,32);
 const base=new T.CatmullRomCurve3([[s*.36,-.30,-.15],[s*.46,-.60,-.08],[s*.48,-.90,.01],[s*.39,-1.21,.15]].map(V));
 surface('Ponytail inner support',32,48,(u,v)=>{let p=base.getPoint(v),a=u*Math.PI*2,r=.112*Math.pow(Math.sin(Math.PI*(.15+.85*v)),.7)*Math.pow(1-v,.25);p.x+=r*Math.cos(a);p.z+=r*.85*Math.sin(a);return p.toArray();},M.hair,h);
 for(let j=0;j<38;j++){const a=j/38*Math.PI*2,rad=.065+rand()*.071,phase=rand()*Math.PI*2,offset=Math.cos(a)*rad,zoff=Math.sin(a)*rad*.85,end=-1.10-rand()*.25;lock('Wavy ponytail lock',[[s*.35+offset*.30,-.29+rand()*.025,-.145+zoff*.5],[s*.48+offset+.012*Math.sin(phase),-.57,-.105+zoff],[s*.46+offset+.024*Math.cos(phase),-.82,-.01+zoff],[s*.46+offset*.8,-1.01,.073+zoff],[s*.38+offset*.65,end,.17+zoff]],.019+rand()*.020,.009+rand()*.012,6);}
 for(let j=0;j<38;j++){let a=rand()*Math.PI*2,off=Math.cos(a)*.15,zoff=Math.sin(a)*.12;const pts=[[s*.36+off*.3,-.31,-.13+zoff*.4],[s*.49+off,-.62,-.09+zoff],[s*.47+off*1.15,-.92,.04+zoff],[s*.38+off*.7,-1.17-rand()*.17,.19+zoff]];tube('Loose ponytail flyaway fibre',pts,.00055,j%9?M.hairLine:M.hairLight,h,32,3);}
 lock('Loose temple lock',[[s*.30,.28,.24],[s*.36,.06,.24],[s*.335,-.22,.23],[s*.31,-.44,.22],[s*.38,-.65,.21]],.013,.005,6);
 }
}
