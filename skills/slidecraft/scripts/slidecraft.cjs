#!/usr/bin/env node
const fs=require('node:fs/promises');
const path=require('node:path');
const {create}=require('./create.cjs');
const {inspect,apply,headingPlan}=require('./edit.cjs');
async function loadAssets(spec,base) {
  const assets={};
  for(const s of spec.slides.filter(s=>s.asset)){
    const root=await fs.realpath(base),p=await fs.realpath(path.resolve(root,s.asset));
    if (!p.startsWith(root+path.sep)) throw Error('Keep referenced images inside the outline directory.');
    const type={'.png':'png','.jpg':'jpeg','.jpeg':'jpeg'}[path.extname(p).toLowerCase()];
    if(!type) throw Error('Choose a JPEG or PNG image.');
    assets[s.asset]='data:image/'+type+';base64,'+(await fs.readFile(p)).toString('base64');
  }
  return assets;
}
async function run([cmd,input,...rest]) {
  if(!['create','inspect','headings','apply'].includes(cmd)||!input) throw Error('Usage: create deck.json out.pptx [--draft] | inspect in.pptx | headings in.pptx | apply in.pptx plan.json out.pptx');
  const bytes=await fs.readFile(input);
  if(cmd==='inspect'||cmd==='headings'){
    const inv=await inspect(bytes);
    console.log(JSON.stringify(cmd==='inspect'?inv:headingPlan(inv),null,2)); return;
  }
  let output,result;
  if(cmd==='create'){
    const spec=JSON.parse(bytes); output=rest[0];
    result=await create(spec,rest[1]==='--draft',await loadAssets(spec,path.dirname(path.resolve(input))));
  }else{output=rest[1];result=await apply(bytes,JSON.parse(await fs.readFile(rest[0],'utf8')));}
  if(!output) throw Error('Choose a new output path.');
  await fs.writeFile(output,result,{flag:'wx'});
}
if(require.main===module) run(process.argv.slice(2)).catch(err=>{console.error(err.message);process.exitCode=1;});
module.exports={loadAssets};
