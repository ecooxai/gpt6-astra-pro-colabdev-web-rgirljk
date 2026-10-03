import * as T from 'three';
import {surface,ball,box,tube,sweep,loft,patch,sample,mix,V,bake} from './geometry.js';
import {materials} from './materials.js';
import {makeHead} from './head.js';
import {makeLimbs,makeBackpack} from './details.js';
export function buildCharacter(){const root=new T.Group(),M=materials();root.name='Original procedural campus portrait';
loft('Anatomical neck',[[5.94,.11,0,.22,.19],[6.17,.13,.01,.196,.174],[6.39,.14,.026,.172,.16],[6.59,.15,.035,.24,.18]],M.skin,root,56,60);
loft('Woven blouse body',[[4.55,0,0,.51,.26],[4.67,0,0,.565,.29],[4.86,.01,0,.51,.27],[5.14,.035,.005,.515,.285],[5.42,.07,.005,.574,.31],[5.69,.1,-.007,.636,.335],[5.91,.11,-.02,.703,.295],[6.08,.12,-.02,.70,.245],[6.17,.12,-.01,.345,.21]],M.shirt,root,128,140,(p,a,v)=>{let fold=(.01*Math.sin(a*18+v*10)+.006*Math.sin(a*31-v*26))*(.3+.7*Math.pow(1-v,2));fold+=.018*Math.sin(v*45+Math.sin(a*3)*3)*Math.pow(Math.abs(Math.sin(a)),5);p[0]+=Math.sin(a)*fold;p[2]+=Math.cos(a)*fold;if(v>.83)p[1]-=.27*Math.pow(Math.max(0,Math.cos(a)),12)*((v-.83)/.17);return p;});
patch('Button placket',[[0,.037,4.66,.298,.070],[.35,.051,5.10,.301,.068],[.7,.086,5.50,.334,.066],[1,.126,5.91,.286,.068]],M.shirt,root);
for(let y of [4.79,5.05,5.31,5.57]){const x=.045+(y-4.8)*.062,z=y<5.25?.318:.352;ball('Sewn pearl button',[x,y,z],[.024,.024,.009],M.button,root,20);for(let dx of [-.006,.006])ball('Button thread',[x+dx,y,z+.009],[.002,.007,.001],M.seam,root,10);}
function polygon(name,points,mat){const g=new T.BufferGeometry();const verts=[];for(let i=1;i<points.length-1;i++)verts.push(...points[0],...points[i],...points[i+1]);g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(Array(verts.length/3*2).fill(0),2));g.computeVertexNormals();const m=new T.Mesh(g,mat);m.material.side=T.DoubleSide;m.name=name;m.castShadow=true;root.add(m);return m;}
polygon('Left folded shirt collar',[[-.096,6.35,.13],[-.28,6.21,.24],[-.225,5.88,.345],[.01,6.04,.337]],M.shirt);
polygon('Right folded shirt collar',[[.306,6.34,.10],[.43,6.17,.225],[.353,5.86,.323],[.125,6.025,.346]],M.shirt);
tube('Left collar topstitch',[[-.277,6.20,.244],[-.223,5.89,.350],[.009,6.043,.344]],.004,M.seam,root,32,5);
tube('Right collar topstitch',[[.43,6.17,.228],[.35,5.87,.331],[.13,6.025,.352]],.004,M.seam,root,32,5);
patch('Left tie loop',[[0,-.09,6.13,.24,.074],[.4,-.02,5.96,.342,.085],[1,.09,5.76,.38,.095]],M.tie,root);
patch('Right tie loop',[[0,.34,6.15,.214,.075],[.4,.28,5.97,.32,.083],[1,.13,5.76,.38,.09]],M.tie,root);
loft('Four-in-hand tie knot',[[5.64,.105,.392,.060,.034],[5.76,.116,.378,.105,.055],[5.83,.113,.359,.098,.035]],M.tie,root,40,25);
patch('Long gold-striped tie blade',[[0,.09,4.13,.384,.001],[.10,.097,4.25,.405,.295],[.28,.08,4.64,.367,.285],[.62,.1,5.18,.388,.24],[.87,.094,5.52,.416,.165],[1,.106,5.69,.411,.091]],M.tie,root,24,90);
tube('Shirt embroidered stem',[[.443,5.51,.315],[.453,5.56,.315],[.447,5.63,.312]],.006,M.crest,root,14,5);tube('Shirt embroidered leaf',[[.452,5.55,.315],[.426,5.576,.324],[.454,5.59,.32],[.474,5.608,.316]],.005,M.crest,root,18,5);
loft('Pleated plaid skirt',[[3.12,0,-.005,.93,.505],[3.25,0,0,.903,.49],[3.74,0,0,.797,.44],[4.13,0,0,.667,.37],[4.48,0,0,.545,.29],[4.62,0,0,.517,.277]],M.plaid,root,240,110,(p,a,v)=>{let amt=.036*(.35+.65*(1-v)),phase=a*24,fold=amt*(Math.cos(phase)+.30*Math.cos(2*phase+.35));p[0]+=Math.sin(a)*fold;p[2]+=Math.cos(a)*fold*.77;p[1]+=.016*Math.cos(a*2)*(1-v);return p;});
loft('Waistband',[[4.55,0,0,.529,.286],[4.63,0,0,.523,.282]],M.waist,root,96,8);
loft('Turned skirt hem',[[3.117,0,-.005,.93,.507],[3.143,0,-.005,.928,.505]],M.plaid,root,240,8,(p,a)=>{p[0]+=Math.sin(a)*.036*(Math.cos(a*24)+.3*Math.cos(48*a+.35));p[2]+=Math.cos(a)*.028*(Math.cos(a*24)+.3*Math.cos(48*a+.35));return p;});
makeLimbs(root,M);makeBackpack(root,M);makeHead(root,M);
let result=bake(root);result.userData={provenance:'All geometry, hair fibres and texture patterns authored from scratch in JavaScript. Reference image is never sampled by the model.',revision:1};return result;}
