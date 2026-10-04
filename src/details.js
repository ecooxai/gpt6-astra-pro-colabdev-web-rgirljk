import * as T from 'three';
import {makeHand} from './hands.js';
import {surface,ball,box,tube,sweep,loft,sample} from './geometry.js';
export function makeLimbs(root,M){
for(let s of [-1,1]){const sh=[s*.55+.1,6.065,-.015],el=[s*.79+.07,4.89,-.086],cuff=[s*.738+.054,4.72,-.09];sweep('Soft sleeve',[sh,[s*.71+.095,5.94,-.016],[s*.817+.087,5.71,-.017],[s*.851+.08,5.34,-.014],el,cuff],[[0,.015],[.12,.197],[.27,.207],[.64,.173],[.84,.155],[1,.153]],M.shirt,root,90,48,1.04);
sweep('Rolled cuff cotton',[[cuff[0],4.65,-.095],[cuff[0]+s*.012,4.73,-.10],[cuff[0]+s*.027,4.85,-.096]],[[0,.166],[.3,.177],[.7,.174],[1,.161]],M.shirt,root,32,48);
sweep('Cuff edge piping',[[cuff[0]+s*.015,4.805,-.096],[cuff[0]+s*.018,4.824,-.096]],[[0,.177],[1,.178]],M.seam,root,6,48);
const wrist=[s*.37+.01,4.18,-.472];makeHand(root,M,wrist,s,[[cuff[0],4.69,-.102],[s*.66+.025,4.43,-.225],wrist]);
}
const legRows=[[[.35,-.38,.19,.104,.11],[.63,-.34,.184,.112,.122],[1.12,-.22,.20,.145,.149],[1.55,-.10,.22,.173,.17],[1.84,-.03,.24,.166,.163],[2.10,.015,.22,.175,.185],[2.40,-.044,.153,.200,.208],[2.91,-.155,.06,.227,.238],[3.36,-.24,.01,.244,.255],[3.69,-.255,-.01,.252,.263]],[[.35,.16,.31,.104,.11],[.65,.193,.25,.113,.121],[1.11,.26,.13,.151,.153],[1.55,.31,.01,.175,.17],[1.84,.33,-.05,.167,.163],[2.075,.335,-.10,.174,.184],[2.42,.315,-.075,.20,.21],[2.94,.29,-.064,.228,.239],[3.38,.27,-.054,.243,.257],[3.69,.265,-.045,.251,.263]]];
for(let n=0;n<2;n++){let rows=legRows[n];loft('Continuous leg '+n,rows,M.skin,root,64,140,(p,a)=>{p[2]+=.013*Math.max(0,Math.cos(a))*Math.exp(-(((p[1]-2.1)/.14)**2));return p;});let sockrows=rows.filter(r=>r[0]<=1.84).map(r=>[r[0],r[1],r[2],r[3]+.008,r[4]+.008]);let sy=n===0?1.91:1.83; sockrows=sockrows.filter(r=>r[0]<sy);let sr=sample(rows,sy);sockrows.push([sy,sr[0],sr[1],sr[2]+.008,sr[3]+.008]);loft('Ribbed knee sock '+n,sockrows,M.sock,root,128,100,(p,a)=>{let rib=.0018*Math.cos(a*66);p[0]+=Math.sin(a)*rib;p[2]+=Math.cos(a)*rib;let fold=.003*Math.sin(p[1]*110)*Math.exp(-(((p[1]-.48)/.16)**2));p[0]+=Math.sin(a)*fold;p[2]+=Math.cos(a)*fold;return p;});let top=sockrows.at(-1);loft('Sock knitted cuff '+n,[[top[0]-.07,...top.slice(1,3),top[3]+.004,top[4]+.004],top],M.sock,root,96,12);makeShoe(root,M,n===0?[-.38,0,.19]:[.16,0,.31],n===0?-.12:.07);}
}
function makeShoe(root,M,pos,rot){const g=new T.Group();g.position.set(...pos);g.rotation.y=rot;root.add(g);const upperRows=[[.125,0,.135,.212,.381],[.19,0,.132,.211,.376],[.25,0,.126,.197,.357],[.30,0,.1,.179,.31],[.355,0,.045,.132,.229],[.397,0,-.028,.112,.145],[.43,0,-.056,.104,.12]];loft('Layered leather loafer sole',[[.040,0,.135,.195,.363],[.063,0,.135,.224,.397],[.112,0,.135,.224,.399],[.135,0,.135,.211,.382]],M.sole,g,96,24);loft('Sculpted leather loafer upper',upperRows,M.leather,g,96,64);
function shoeHeight(x,z){let lo=.125,hi=.43;for(let k=0;k<22;k++){let y=(lo+hi)/2,r=sample(upperRows,y);if((x/r[2])**2+((z-r[1])/r[3])**2<=1)lo=y;else hi=y;}return lo;}let moc=[[-.11,.32,-.03],[-.16,.3,.23],[-.14,.27,.41],[0,.257,.47],[.14,.27,.41],[.16,.3,.23],[.11,.32,-.03]];moc=moc.map(p=>[p[0],shoeHeight(p[0],p[2])+.006,p[2]]);tube('Raised moccasin seam',moc,.009,M.leather,g,64,8);tube('Moccasin stitching',moc.map(p=>[p[0],p[1]+.006,p[2]]),.0024,M.stitch,g,64,5);
surface('Penny loafer strap',40,8,(u,v)=>{let x=(u-.5)*.37;let z=.115+(v-.5)*.11;return[x,shoeHeight(x,z)+.009,z];},M.leather,g);box('Penny slot',[0,shoeHeight(0,.115)+.013,.115],[.065,.004,.025],M.sole,g,.008);
for(let i=0;i<70;i++){let a=i/70*Math.PI*2;ball('Welt stitch',[Math.sin(a)*.217,.125,.135+Math.cos(a)*.39],[.003,.002,.008],M.stitch,g,8);}}
export function makeBackpack(root,M){
box('Backpack main body',[.075,5.40,-.51],[1.00,1.28,.46],M.bag,root,.18);box('Backpack pocket',[.075,5.22,-.785],[.79,.75,.17],M.bag,root,.11);
tube('Backpack piping',[[-.37,4.87,-.75],[-.43,5.45,-.74],[-.36,5.99,-.66],[.11,6.06,-.64],[.49,5.95,-.66],[.57,5.43,-.73],[.52,4.88,-.75],[-.37,4.87,-.75]],.011,M.bagEdge,root,100,6);
tube('Backpack handle',[[-.12,6.00,-.54],[-.1,6.22,-.54],[.22,6.23,-.54],[.26,6.02,-.54]],.028,M.webbing,root,32,8);
for(let s of [-1,1]){const x=s*.59+.1;sweep('Padded shoulder strap',[[x,5.575,.306],[x+s*.044,5.82,.267],[x,6.04,.16],[x-s*.02,6.06,-.29],[s*.39+.08,5.76,-.70]],[[0,.027],[.4,.032],[.65,.033],[1,.025]],M.bag,root,64,20,3.1);
sweep('Lower bag strap',[[x,5.59,.302],[x-s*.008,5.22,.285],[s*.66+.06,4.91,.075],[s*.47+.07,4.9,-.44]],[[0,.014],[1,.013]],M.webbing,root,44,16,2.8);
box('Adjustment buckle',[x,5.59,.327],[.135,.17,.049],M.metal,root,.018);box('Buckle slot',[x,5.59,.356],[.09,.042,.006],M.webbing,root,.005);box('Buckle crossbar',[x,5.59,.363],[.116,.022,.018],M.metal,root,.005);}
tube('Pocket zipper',[[-.27,5.55,-.868],[.075,5.59,-.873],[.415,5.55,-.868]],.009,M.metal,root,30,6);
for(let i=0;i<35;i++)box('Zipper tooth',[-.27+i*.0196,5.554+.031*Math.sin(i/34*Math.PI),-.878],[.008,.017,.009],M.gold,root,.002);
box('Zipper pull',[.347,5.51,-.89],[.043,.088,.013],M.metal,root,.009);}
