from pathlib import Path
import os,zipfile,json,hashlib,subprocess
root=Path.cwd();name='gpt6_astra_pro_colabdev_web_rgirljk';build=Path(subprocess.check_output(['node','--input-type=module','-e',"import{buildDir}from'./scripts/paths.mjs';console.log(buildDir)"],text=True).strip());out=root/'public'/'exports'/(name+'_project.zip');temp=root/'.runtime'/'project-archive.zip'
excluded={'.git','node_modules','.runtime','build','__pycache__'}
with zipfile.ZipFile(temp,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 z.writestr(name+'/START_HERE.txt','FORM / 001 - Original 3D character study\n\nThe web folder is a standalone static website. Serve it over HTTP, rather than opening index.html as a local file.\nThe source folder contains the original code, models, review evidence and README.md. Read source/Agents.md before continuing development.\nThe visual target and requested iteration count remain unmet; see the actual review journal.\n')
 for file in sorted(root.rglob('*')):
  rel=file.relative_to(root)
  if not file.is_file() or any(part in excluded for part in rel.parts) or file.suffix=='.zip' or file.name=='checksums.json':continue
  z.write(file,name+'/source/'+rel.as_posix())
 for file in sorted(build.rglob('*')):
  rel=file.relative_to(build)
  if file.is_file() and file.suffix!='.zip' and file.name!='checksums.json':z.write(file,name+'/web/'+rel.as_posix())
os.replace(temp,out)
files=[]
for file in sorted((root/'public'/'exports').glob('*')):
 if file.suffix not in {'.glb','.zip'}:continue
 files.append(dict(file=file.name,bytes=file.stat().st_size,sha256=hashlib.sha256(file.read_bytes()).hexdigest()))
(root/'public'/'exports'/'checksums.json').write_text(json.dumps(files,indent=2))
print(json.dumps(files,indent=2))
