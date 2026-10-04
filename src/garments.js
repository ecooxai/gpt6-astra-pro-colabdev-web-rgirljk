import * as T from 'three';
import {surface,loft,patch,tube,ball,sample,mix,V} from './geometry.js';
const clamp=T.MathUtils.clamp;
const blouseRows=[[4.50,0,0,.529,.277],[4.64,0,0,.589,.306],[4.79,.006,.002,.581,.308],[4.98,.02,.006,.556,.294],[5.22,.047,.012,.564,.315],[5.47,.082,.016,.609,.335],[5.72,.108,-.002,.653,.345],[5.95,.12,-.018,.712,.288],[6.065,.126,-.018,.688,.254],[6.145,.13,-.005,.283,.205]];
function blouse(a,v){let y=mix(4.5,6.145,v),[x,z,rx,rz]=sample(blouseRows,y);let fold=(.013*Math.sin(a*15+v*8)+.006*Math.sin(a*28-v*11))*(.32+.68*(1-v));fold+=.014*Math.sin(v*32+Math.sin(a*2)*4)*Math.pow(Math.abs(Math.sin(a)),6);fold*=clamp(v/.11,0,1);
const side=Math.pow(Math.abs(Math.sin(a)),8);fold+=.018*side*Math.sin(v*54+Math.sin(a)*3)*Math.exp(-(((v-.28)/.23)**2));
if(v>.86)y-=.266*Math.pow(Math.max(0,Math.cos(a)),5)*((v-.86)/.14);
return[x+Math.sin(a)*(rx+fold),y,z+Math.cos(a)*(rz+fold)];}
function clothQuad(name,A,B,C,D,M,root,bulge=.012){const p=[A,B,C,D].map(V);const mesh=surface(name,28,28,(u,v)=>{const l=p[0].clone().lerp(p[3],v),r=p[1].clone().lerp(p[2],v),q=l.lerp(r,u);q.z+=bulge*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);return q.toArray();},M.shirt,root);mesh.material.side=T.DoubleSide;
const edge=[];for(let k=0;k<33;k++){const q=p[3].clone().lerp(p[2],k/32);q.z+=.002;edge.push(q.toArray());}tube(name+' turned edge',edge,.003,M.shirt,root,32,5);return mesh;}
export function makeGarments(root,M){
M.shirt.side=T.DoubleSide;
surface('Loose tucked cotton blouse',144,110,(u,v)=>blouse(u*Math.PI*2,v),M.shirt,root);
loft('Standing collar band',[[6.08,.15,-.006,.215,.181],[6.20,.175,.014,.213,.177]],M.shirt,root,80,16);
clothQuad('Left relaxed collar',[-.095,6.31,.152],[-.252,6.185,.239],[-.148,5.966,.360],[.075,6.071,.355],M,root,.017);
clothQuad('Right relaxed collar',[.333,6.34,.130],[.450,6.168,.242],[.365,5.921,.346],[.155,6.067,.350],M,root,.013);
patch('Button placket',[[0,.041,4.67,.319,.063],[.30,.054,5.08,.329,.062],[.69,.087,5.52,.355,.061],[1,.121,5.903,.306,.056]],M.shirt,root,16,60);
for(let y of [4.78,5.05,5.30,5.53]){const x=.044+(y-4.78)*.073,z=y<5.22?.337:.366;ball('Sewn pearl button',[x,y,z],[.019,.019,.007],M.button,root,20);tube('Button thread',[[x-.004,y-.003,z+.008],[x+.004,y+.003,z+.008]],.0014,M.seam,root,3,4);}
patch('Left necktie loop',[[0,-.161,6.157,.281,.093],[.34,-.091,5.943,.358,.096],[.72,.024,5.746,.411,.104],[1,.103,5.657,.424,.103]],M.tie,root,20,44);
patch('Right necktie loop',[[0,.367,6.177,.270,.090],[.37,.302,5.964,.349,.096],[.72,.189,5.761,.406,.103],[1,.122,5.654,.421,.098]],M.tie,root,20,44);
const knot=M.tie.clone();knot.name='Loosely knotted woven silk';knot.map=M.tie.map.clone();knot.map.repeat.set(.25,.19);knot.map.offset.set(.16,.19);knot.map.needsUpdate=true;
loft('Loose asymmetrical tie knot',[[5.53,.097,.428,.058,.035],[5.64,.108,.419,.115,.052],[5.712,.110,.396,.119,.037]],knot,root,48,28);
patch('Long loosely draped tie blade',[[0,.034,4.080,.389,.001],[.095,.049,4.210,.428,.307],[.28,.054,4.574,.415,.291],[.62,.094,5.125,.414,.239],[.87,.085,5.394,.435,.164],[1,.094,5.562,.444,.087]],M.tie,root,32,96);
tube('Sky blue shirt embroidery',[[.444,5.53,.347],[.449,5.586,.346],[.441,5.622,.343]],.0048,M.crest,root,18,5);tube('Embroidered leaf',[[.446,5.553,.347],[.425,5.577,.353],[.452,5.585,.348],[.467,5.608,.342]],.004,M.crest,root,18,4);
const rows=[[3.12,0,-.008,1.00,.533],[3.30,0,-.005,.974,.519],[3.75,0,0,.851,.461],[4.16,0,0,.714,.392],[4.46,0,0,.596,.313],[4.62,0,0,.554,.298]];
function pleat(a,y){
const [x,z,rx,rz]=sample(rows,y),v=(y-3.12)/1.50,q=((a/(Math.PI*2)*24+.12)%1+1)%1,d=.058*(.40+.60*(1-v));let f;
if(q<.10)f=-d;else if(q<.20)f=-d*(1-(q-.10)/.10);else if(q<.85)f=0;else if(q<.95)f=-d*((q-.85)/.10);else f=-d;
const flat=1/Math.cos((q-.51)*Math.PI*2/24);
return[x+(rx*flat+f)*Math.sin(a),y+.014*Math.cos(a*2)*(1-v),z+(rz*flat+f*.75)*Math.cos(a)];
}
surface('Tartan',384,104,(u,v)=>pleat(u*6.28318530718,mix(3.12,4.62,v)),M.plaid,root);
loft('Waistband',[[4.543,0,0,.564,.302],[4.624,0,0,.558,.301]],M.waist,root,112,10);
}
