import * as T from 'three';
import {surface,ball,box,tube,sweep,sample,mix,V} from './geometry.js';
const gauss=(x,y,cx,cy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2+((y-cy)/sy)**2));
const headRows=[[-.51,.024,.075],[-.46,.145,.205],[-.37,.267,.265],[-.23,.345,.296],[-.055,.395,.318],[.12,.389,.325],[.30,.367,.319],[.46,.287,.25],[.55,.07,.08],[.565,.002,.002]];
function headShape(x,y){const [rx,rz]=sample(headRows,y);let z=rz*Math.pow(Math.max(0,1-(x/rx)**2),.32);z+=.035*gauss(x,y,0,.015,.062,.135)+.086*gauss(x,y,0,-.087,.068,.057);z+=.029*(gauss(x,y,-.064,-.105,.042,.03)+gauss(x,y,.064,-.105,.042,.03));z-=.024*(gauss(x,y,-.162,.069,.109,.055)+gauss(x,y,.162,.069,.109,.055));z+=.021*(gauss(x,y,-.236,-.079,.092,.09)+gauss(x,y,.236,-.079,.092,.09));z+=.022*gauss(x,y,0,-.21,.16,.095)-.037*gauss(x,y,0,-.25,.146,.047);return z;}
function faceColor(x,y,front){let c=new T.Color(0xe7b89e);if(front){const blush=.19*(gauss(x,y,-.235,-.10,.098,.065)+gauss(x,y,.235,-.10,.098,.065));c.lerp(new T.Color(0xce7e78),blush);c.lerp(new T.Color(0xa97260),.07*(gauss(x,y,-.162,.079,.1,.055)+gauss(x,y,.162,.079,.1,.055)));}return c.toArray();}
export function makeHead(root,M){const h=new T.Group();h.name='Head • anatomical sculpture';h.position.set(.15,6.91,.065);h.rotation.z=-.09;h.rotation.y=-.025;root.add(h);
surface('Connected facial surface',144,144,(u,v)=>{let y=mix(-.51,.565,v),[rx,rz]=sample(headRows,y),a=u*Math.PI*2,x=rx*Math.sin(a),front=Math.cos(a)>0;let z=front?headShape(x,y):rz*Math.cos(a);return[x,y,z,...faceColor(x,y,front)];},M.face,h);
for(const sign of [-1,1]){const e=new T.Group();e.position.set(sign*.39,-.07,-.005);e.rotation.y=sign*.28;h.add(e);ball('Ear pinna',[0,0,0],[.083,.151,.06],M.skin,e);ball('Ear inner bowl',[sign*.012,.006,.048],[.045,.088,.016],M.inner,e);tube('Ear helix',[[sign*.005,-.092,.049],[sign*.044,-.058,.056],[sign*.058,.033,.046],[sign*.032,.107,.038],[-sign*.016,.087,.038]],.015,M.skin,e,34,8);ball('Tragus',[-sign*.027,-.027,.053],[.019,.031,.019],M.skin,e);ball('Ear lobe',[0,-.108,.01],[.044,.044,.045],M.skin,e);
const ex=sign*.158,ey=.071,ew=.087;surface('Inset almond eye',48,16,(u,v)=>{let t=u*2-1,x=ex+t*ew,up=.038*Math.pow(Math.max(0,1-t*t),.78),lo=-.030*Math.pow(Math.max(0,1-t*t),.82),y=ey+mix(lo,up,v)+sign*t*.006,z=headShape(x,y)+.013+.020*(1-t*t)*Math.sin(v*Math.PI);return[x,y,z];},M.white,h);
const iz=headShape(ex,ey)+.047;ball('Iris limbal ring',[ex-.004,ey+.001,iz],[.031,.031,.006],M.irisEdge,h);ball('Brown iris',[ex-.004,ey+.001,iz+.004],[.027,.028,.005],M.iris,h);ball('Pupil',[ex-.004,ey+.001,iz+.008],[.014,.016,.003],M.pupil,h);ball('Eye catchlight',[ex-.014,ey+.016,iz+.012],[.005,.005,.002],M.glint,h,16);ball('Eye small catchlight',[ex+.011,ey-.012,iz+.011],[.002,.002,.001],M.glint,h,12);
let upper=[],lower=[],crease=[],lash=[];for(let i=0;i<=28;i++){let t=-1+2*i/28,x=ex+t*ew,yu=ey+.040*Math.pow(Math.max(0,1-t*t),.78)+sign*t*.006,yl=ey-.031*Math.pow(Math.max(0,1-t*t),.82)+sign*t*.006;upper.push([x,yu,headShape(x,yu)+.023]);lower.push([x,yl,headShape(x,yl)+.014]);crease.push([x,yu+.019,headShape(x,yu+.019)+.012]);lash.push([x,yu-.002,headShape(x,yu)+.031]);}
tube('Upper eyelid',upper,.011,M.lid,h,48,8);tube('Lower eyelid',lower,.008,M.skin,h,48,8);tube('Eyelid crease',crease,.0023,M.inner,h,48,5);tube('Upper lashline',lash,.0039,M.lash,h,48,6);
for(let i=0;i<8;i++){let t=sign*(.28+i*.085),x=ex+t*ew,y=ey+.039*Math.sqrt(1-t*t);tube('Individual upper lash',[[x,y,headShape(x,y)+.030],[x+sign*.003,y+.004,headShape(x,y)+.039],[x+sign*.004,y+.009,headShape(x,y)+.040]],.0015,M.lash,h,7,4);}
surface('Arched eyebrow',40,5,(u,v)=>{let t=u*2-1,x=ex+t*.106,y=.174+.028*(1-t*t)-sign*t*.006+(v-.5)*(.027*(1-.62*Math.abs(t))),z=headShape(x,y)+.009;return[x,y,z];},M.lash,h);

ball('Nostril shadow',[sign*.050,-.113,.377],[.019,.009,.009],M.inner,h,24);tube('Nostril wing crease',[[sign*.045,-.128,.367],[sign*.069,-.118,.371],[sign*.079,-.102,.360]],.0022,M.inner,h,16,5);
}
const my=-.242,mw=.153;
function mouthLine(t){return my+.030*Math.pow(Math.abs(t),1.6);}
function mz(t){return .325-.018*t*t;}
surface('Open smiling mouth',64,16,(u,v)=>{let t=u*2-1,w=Math.max(0,1-t*t),y=mouthLine(t)+mix(-.044*w,.019*w,v);return[t*mw,y,mz(t)];},M.mouth,h);
surface('Upper lip vermilion',64,10,(u,v)=>{let t=u*2-1,w=1-t*t,base=mouthLine(t)+.018*w,cupid=.006*Math.cos(t*12)*Math.exp(-t*t*10);return[t*mw,base+v*(.018*w+cupid),mz(t)+.004+.010*Math.sin(v*Math.PI)*w];},M.lipTop,h);
surface('Lower lip vermilion',64,10,(u,v)=>{let t=u*2-1,w=1-t*t;return[t*mw,mouthLine(t)-.044*w-v*.022*w,mz(t)+.004+.013*Math.sin(v*Math.PI)*w];},M.lip,h);
surface('Upper tooth row',64,12,(u,v)=>{let t=(u*2-1)*.84,w=1-t*t;return[t*mw,mouthLine(t)+mix(-.012*w,.016*w,v),mz(t)+.004];},M.teeth,h);
for(let j=1;j<8;j++){let t=(-.84+j*.21),w=1-t*t;tube('Fine tooth division',[[t*mw,mouthLine(t)-.010*w,mz(t)+.005],[t*mw,mouthLine(t)+.014*w,mz(t)+.005]],.00065,M.lid,h,3,4);}
for(let s of [-1,1])tube('Smile corner fold',[[s*.151,-.214,.309],[s*.160,-.208,.305],[s*.166,-.195,.302]],.0025,M.inner,h,16,5);
// A complete scalp shell: no photographic projection, viewed naturally from every side.
surface('Fitted hair cap',128,96,(u,v)=>{let a=u*Math.PI*2,front=Math.cos(a),end=front>0?.245-.115*Math.abs(Math.sin(a)):-.37,y=mix(.587,end,v),[rx,rz]=sample(headRows,Math.min(y,.565)),edge=Math.min(1,(.59-y)*30);rx+=.031*edge;rz+=.036*edge;let x=rx*Math.sin(a),z=front>0?rz*Math.pow(Math.max(0,Math.cos(a)),.64):rz*Math.cos(a);return[x,y,z-.003];},M.hair,h);
// Side-swept fringe volumes, each with individually constructed surface fibres.
function lock(name,points,width,depth,fibres=14){const curve=new T.CatmullRomCurve3(points.map(V));surface(name,32,56,(u,v)=>{let p=curve.getPoint(v),tan=curve.getTangent(v),side=new T.Vector3(tan.y,-tan.x,0).normalize();let taper=Math.pow(Math.sin(Math.PI*(.035+.965*v)),.55),a=u*Math.PI*2;p.addScaledVector(side,width*taper*Math.sin(a));p.z+=depth*taper*Math.cos(a);return p.toArray();},M.hair,h);for(let j=0;j<fibres;j++){let off=(j/(fibres-1)-.5)*1.8,pts=[];for(let k=0;k<=36;k++){let v=.025+k/36*.95,p=curve.getPoint(v),tan=curve.getTangent(v),side=new T.Vector3(tan.y,-tan.x,0).normalize(),taper=Math.pow(Math.sin(Math.PI*(.035+.965*v)),.55);p.addScaledVector(side,width*taper*off);p.z+=depth*taper*Math.sqrt(Math.max(0,1-off*off))+.0015;pts.push(p.toArray());}tube('Fringe silk fibre',pts,j%4===0?.0014:.0011,j%6===0?M.hairLight:M.hairLine,h,40,4);}}
lock('Broad swept fringe A',[[.17,.49,.21],[.08,.39,.328],[-.08,.25,.358],[-.29,.17,.284]],.108,.024,25);
lock('Broad swept fringe B',[[.22,.46,.19],[.12,.33,.35],[-.06,.24,.369],[-.29,.175,.29]],.105,.027,25);
lock('Lower swept fringe',[[.20,.43,.25],[.09,.28,.367],[-.06,.23,.382],[-.25,.18,.328]],.075,.022,21);
lock('Temple fringe',[[.25,.43,.18],[.31,.26,.26],[.32,.09,.26],[.35,-.11,.17]],.049,.025,12);
lock('Left temple lock',[[-.14,.48,.17],[-.32,.29,.23],[-.37,.06,.17],[-.36,-.19,.16]],.043,.026,13);
for(let s of [-1,1]){
// Low hair ties and gravity-shaped twin ponytails, supported by layered volumes.
ball('Low ponytail root',[s*.367,-.29,-.115],[.153,.17,.14],M.hair,h);
const tail=new T.CatmullRomCurve3([[s*.36,-.27,-.15],[s*.49,-.48,-.10],[s*.50,-.82,-.075],[s*.43,-1.13,.015]].map(V));
surface('Ponytail full mass',48,72,(u,v)=>{let p=tail.getPoint(v),r=.15*Math.pow(Math.sin(Math.PI*(.19+.8*v)),.5),a=u*Math.PI*2;p.x+=r*Math.cos(a);p.z+=r*.76*Math.sin(a);return p.toArray();},M.hair,h);
for(let j=0;j<12;j++){let a=j/12*Math.PI*2,off=Math.sin(a)*.13,zoff=Math.cos(a)*.105;lock('Layered ponytail lock',[[s*.365+off*.6,-.30,-.12+zoff],[s*.49+off,-.58,-.09+zoff],[s*.51+off*.9,-.87,-.04+zoff],[s*(.39+(j%3)*.03),-1.16-(j%4)*.03,.04+zoff]],.045,.025,9);}
for(let j=0;j<14;j++){let r=j/14,a=r*Math.PI*2;const pts=[[s*.37+Math.sin(a)*.1,-.31,-.1+Math.cos(a)*.08],[s*.53+Math.sin(a)*.16,-.62,-.05+Math.cos(a)*.12],[s*.54+Math.sin(a)*.15,-.95,.04+Math.cos(a)*.13],[s*.44+Math.sin(a)*.12,-1.23+.06*Math.sin(j),.04]];tube('Loose ponytail flyaway',pts,.0015,j%3?M.hairLine:M.hairLight,h,52,4);}
lock('Face framing wisp',[[s*.34,.04,.23],[s*.34,-.22,.23],[s*.33,-.44,.18],[s*.41,-.63,.21]],.018,.009,5);
}
// Fine crown strands follow the scalp instead of forming a flat painted hair texture.
for(let j=0;j<86;j++){const a=j/86*Math.PI*2,pts=[];let end=Math.cos(a)>0?1.24:2.47;for(let k=0;k<=28;k++){let ph=.12+k/28*end,aa=a+.13*Math.sin(ph);pts.push([.424*Math.sin(ph)*Math.sin(aa),.095+.491*Math.cos(ph),-.022+.364*Math.sin(ph)*Math.cos(aa)]);}tube('Crown filament',pts,.0011,j%9===0?M.hairLight:M.hairLine,h,40,4);}
return h;}
