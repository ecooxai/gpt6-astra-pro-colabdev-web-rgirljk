import * as T from 'three';
import {surface,ball,tube,sample,mix,V} from './geometry.js';
import {headRows,faceZ as headShape} from './face.js';
export function makeHair(h,M){
// A complete scalp shell: no photographic projection, viewed naturally from every side.
surface('Fitted hair cap',112,80,(u,v)=>{let a=u*Math.PI*2,front=Math.cos(a),end=front>0?.245-.115*Math.abs(Math.sin(a)):-.37,y=mix(.576,end,v),[rx,rz]=sample(headRows,Math.min(y,.565)),edge=Math.min(1,(.579-y)*55);rx+=.031*edge;rz+=.036*edge;let x=rx*Math.sin(a),z=front>0?rz*Math.pow(Math.max(0,Math.cos(a)),.64):rz*Math.cos(a);return[x,y,z-.003];},M.hair,h);
// Side-swept fringe volumes, each with individually constructed surface fibres.
function lock(name,points,width,depth,fibres=14){const curve=new T.CatmullRomCurve3(points.map(V));surface(name,24,44,(u,v)=>{let p=curve.getPoint(v),tan=curve.getTangent(v),side=new T.Vector3(tan.y,-tan.x,0).normalize();let taper=Math.pow(Math.sin(Math.PI*(.035+.965*v)),.55),a=u*Math.PI*2;p.addScaledVector(side,width*taper*Math.sin(a));p.z+=depth*taper*Math.cos(a);return p.toArray();},M.hair,h);for(let j=0;j<fibres;j++){let off=(j/(fibres-1)-.5)*1.8,pts=[];for(let k=0;k<=36;k++){let v=.025+k/36*.95,p=curve.getPoint(v),tan=curve.getTangent(v),side=new T.Vector3(tan.y,-tan.x,0).normalize(),taper=Math.pow(Math.sin(Math.PI*(.035+.965*v)),.55);p.addScaledVector(side,width*taper*off);p.z+=depth*taper*Math.sqrt(Math.max(0,1-off*off))+.0008;p.x+=.0015*Math.sin(v*22+j*2.1);pts.push(p.toArray());}tube('Fringe silk fibre',pts,j%4===0?.00065:.00048,j%10===0?M.hairLight:M.hairLine,h,40,4);}}
lock('Broad swept fringe A',[[.17,.49,.21],[.08,.39,.328],[-.08,.25,.358],[-.29,.17,.284]],.108,.024,25);
lock('Broad swept fringe B',[[.22,.46,.19],[.12,.33,.35],[-.06,.24,.369],[-.29,.175,.29]],.105,.027,25);
lock('Lower swept fringe',[[.20,.43,.25],[.09,.28,.367],[-.06,.23,.382],[-.25,.18,.328]],.075,.022,21);
lock('Temple fringe',[[.25,.43,.18],[.31,.26,.26],[.32,.09,.26],[.35,-.11,.17]],.049,.025,12);
lock('Left temple lock',[[-.14,.48,.17],[-.32,.29,.23],[-.37,.06,.17],[-.36,-.19,.16]],.043,.026,13);
for(let s of [-1,1]){
// Low hair ties and gravity-shaped twin ponytails, supported by layered volumes.
ball('Low ponytail root',[s*.367,-.29,-.115],[.118,.126,.105],M.hair,h);
const tail=new T.CatmullRomCurve3([[s*.36,-.27,-.15],[s*.49,-.48,-.10],[s*.50,-.82,-.075],[s*.43,-1.13,.015]].map(V));
surface('Ponytail full mass',40,60,(u,v)=>{let p=tail.getPoint(v),r=.16*Math.pow(Math.sin(Math.PI*(.19+.81*v)),.55)*Math.pow(1-v,.15),a=u*Math.PI*2;p.x+=r*Math.cos(a);p.z+=r*.76*Math.sin(a);return p.toArray();},M.hair,h);
for(let j=0;j<9;j++){let a=j/9*Math.PI*2,off=Math.sin(a)*.13,zoff=Math.cos(a)*.105;lock('Layered ponytail lock',[[s*.365+off*.6,-.30,-.12+zoff],[s*.49+off,-.58,-.09+zoff],[s*.51+off*.9,-.87,-.04+zoff],[s*(.39+(j%3)*.03),-1.16-(j%4)*.03,.04+zoff]],.059,.025,11);}
for(let j=0;j<14;j++){let r=j/14,a=r*Math.PI*2;const pts=[[s*.37+Math.sin(a)*.1,-.31,-.1+Math.cos(a)*.08],[s*.53+Math.sin(a)*.16,-.62,-.05+Math.cos(a)*.12],[s*.54+Math.sin(a)*.15,-.95,.04+Math.cos(a)*.13],[s*.44+Math.sin(a)*.12,-1.23+.06*Math.sin(j),.04]];tube('Loose ponytail flyaway',pts,.0015,j%3?M.hairLine:M.hairLight,h,52,4);}
lock('Face framing wisp',[[s*.34,.04,.23],[s*.34,-.22,.23],[s*.33,-.44,.18],[s*.41,-.63,.21]],.018,.009,5);
}
// Fine crown strands follow the scalp instead of forming a flat painted hair texture.
for(let j=0;j<110;j++){let a=j/110*Math.PI*2,pts=[],front=Math.cos(a),end=front>0?.245-.115*Math.abs(Math.sin(a)):-.37;for(let k=0;k<=34;k++){let v=.045+k/34*.95,y=mix(.576,end,v),[rx,rz]=sample(headRows,Math.min(y,.565)),edge=Math.min(1,(.579-y)*55),aa=a+.06*Math.sin(v*Math.PI);rx+=.032*edge;rz+=.037*edge;pts.push([rx*Math.sin(aa),y,Math.cos(aa)>0?rz*Math.pow(Math.max(0,Math.cos(aa)),.64)-.003:rz*Math.cos(aa)-.003]);}tube('Conforming crown fibre',pts,.00065,j%14===0?M.hairLight:M.hairLine,h,36,4);}

}
