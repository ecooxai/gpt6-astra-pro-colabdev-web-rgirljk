import json,sys,shutil,pathlib
n,score=int(sys.argv[1]),int(sys.argv[2]);title,notes=sys.argv[3:5]
p=pathlib.Path('public/progress.json');data=json.loads(p.read_text());record={'iteration':n,'score':score,'title':title,'notes':notes,'image':f'preview/rev-{n:02d}-front.png'}
data['revisions']=[x for x in data['revisions'] if x['iteration']!=n]+[record];data.update(iteration=n,score=score,note=notes);p.write_text(json.dumps(data,indent=2));shutil.copyfile(p,'/build/gpt6_astra_pro_colabdev_web_rgirljk/progress.json');shutil.copytree('public/preview','/build/gpt6_astra_pro_colabdev_web_rgirljk/preview',dirs_exist_ok=True)
