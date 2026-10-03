import {buildDir} from './paths.mjs';
import {build} from 'esbuild';import fs from 'node:fs';import path from 'node:path';
const out=buildDir;fs.mkdirSync(out,{recursive:true});fs.cpSync('public',out,{recursive:true});
await build({entryPoints:['src/app.js'],bundle:true,format:'esm',define:{global:'globalThis'},minify:true,outfile:path.join(out,'app.js'),target:'es2022',sourcemap:true});
fs.copyFileSync('reference/rgirljk.png',path.join(out,'reference.png'));
fs.writeFileSync(path.join(out,'version.json'),JSON.stringify({builtAt:new Date().toISOString()}));console.log('Built '+out);

for(const doc of ['README.md','Agents.md','Provenance.md','deployment.json','THIRD_PARTY_NOTICES.txt'])if(fs.existsSync(doc))fs.copyFileSync(doc,path.join(out,doc));
