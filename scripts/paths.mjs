import fs from 'node:fs';import path from 'node:path';
let defaultBuild=path.resolve('build');try{fs.accessSync('/build',fs.constants.W_OK);defaultBuild='/build/gpt6_astra_pro_colabdev_web_rgirljk';}catch{}
export const buildDir=path.resolve(process.env.BUILD_DIR||defaultBuild);
export const previewURL=process.env.PREVIEW_URL||'http://127.0.0.1:4317';
