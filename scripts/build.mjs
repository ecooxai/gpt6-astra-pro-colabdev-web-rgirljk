import {build} from 'esbuild';import fs from 'node:fs';import path from 'node:path';
const out='/build/gpt6_astra_pro_colabdev_web_rgirljk';fs.mkdirSync(out,{recursive:true});fs.cpSync('public',out,{recursive:true});
await build({entryPoints:['src/app.js'],bundle:true,format:'esm',minify:true,outfile:path.join(out,'app.js'),target:'es2022',sourcemap:true});
fs.copyFileSync('reference/rgirljk.png',path.join(out,'reference.png'));
fs.writeFileSync(path.join(out,'version.json'),JSON.stringify({builtAt:new Date().toISOString()}));console.log('Built '+out);
