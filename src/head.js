import * as T from 'three';
import {makeFace} from './face.js';
import {makeHair} from './hair.js';
export function makeHead(root,M){
 const h=new T.Group();h.name='Hand-sculpted head';h.position.set(.245,6.845,.165);h.rotation.set(.025,.085,-.165);root.add(h);makeFace(h,M);makeHair(h,M);return h;
}
