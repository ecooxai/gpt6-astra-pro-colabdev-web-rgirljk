import * as T from 'three';
import {makeFace} from './face.js';
import {makeHair} from './hair.js';
export function makeHead(root,M){
 const h=new T.Group();h.name='Hand-sculpted head';h.position.set(.275,6.91,.105);h.rotation.set(.005,.060,-.115);root.add(h);makeFace(h,M);makeHair(h,M);return h;
}
