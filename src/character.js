import {makeGarments} from './garments.js';
import * as T from 'three';
import {surface,ball,box,tube,sweep,loft,patch,sample,mix,V,bake} from './geometry.js';
import {materials} from './materials.js';
import {makeHead} from './head.js';
import {makeLimbs,makeBackpack} from './details.js';
export function buildCharacter(){const root=new T.Group(),M=materials();root.name='Original procedural campus portrait';
loft('Anatomical neck',[[5.94,.11,0,.22,.19],[6.17,.13,.01,.196,.174],[6.39,.21,.066,.172,.16],[6.59,.263,.075,.24,.18]],M.skin,root,56,60);
makeGarments(root,M);
makeLimbs(root,M);makeBackpack(root,M);makeHead(root,M);
let result=bake(root);result.userData={provenance:'All geometry, hair fibres and texture patterns authored from scratch in JavaScript. Reference image is never sampled by the model.',revision:1};return result;}
