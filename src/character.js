import {makeGarments} from './garments.js';
import {FACE_PARAMETERS} from './face-parameters.js';
import * as T from 'three';
import {surface,ball,box,tube,sweep,loft,patch,sample,mix,V,bake} from './geometry.js';
import {materials} from './materials.js';
import {makeHead} from './head.js';
import {makeLimbs,makeBackpack} from './details.js';
export function buildCharacter(){const root=new T.Group(),M=materials();root.name='Original procedural campus portrait';
loft('Anatomical neck',[[5.67,.105,.005,.48,.255],[5.85,.116,.008,.337,.254],[6.03,.133,.015,.239,.208],[6.17,.151,.03,.190,.176],[6.36,.218,.102,.178,.161],[6.56,.254,.117,.226,.178]],M.skin,root,56,60);
makeGarments(root,M);
makeLimbs(root,M);makeBackpack(root,M);makeHead(root,M);
let result=bake(root);result.userData={provenance:'All geometry, hair fibres and texture patterns authored from scratch in JavaScript. Reference image is never sampled by the model.',revision:46,faceParameters:FACE_PARAMETERS};return result;}
