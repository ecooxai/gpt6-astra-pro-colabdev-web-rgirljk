import * as T from 'three';
import {makeFace} from './face.js';
import {makeHair} from './hair.js';
export function makeHead(root,M){const h=new T.Group();h.name='Anatomical portrait head';h.position.set(.15,6.91,.065);h.rotation.set(.025,-.045,-.13);root.add(h);makeFace(h,M);makeHair(h,M);return h;}
