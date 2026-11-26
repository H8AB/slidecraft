const {create}=require('../skills/slidecraft/scripts/create.cjs');
const {inspect,apply,headingPlan}=require('../skills/slidecraft/scripts/edit.cjs');
const {demo,assets,before,plan:demoPlan}=require('demo-data');
const $=id=>document.getElementById(id);
let original,inv,filename,version=0;
$('samplePhoto').src=assets['assets/main-image-pair.jpg'];
function display(m){$('status').textContent=m;}
function tab(isNew){$('newPane').hidden=!isNew;$('editPane').hidden=isNew;$('newTab').setAttribute('aria-selected',isNew);$('editTab').setAttribute('aria-selected',!isNew);display('');}
$('newTab').onclick=()=>tab(true);$('editTab').onclick=()=>tab(false);
$('loadCase').onclick=()=>{$('outline').value=JSON.stringify(demo,null,2);display('已载入 5 页电商案例，可直接修改文字或数字。');};
function fromText(input){
  const lines=input.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if(!lines.length) throw Error('先填写演示大纲。');
  const slides=[{kind:'cover',title:lines.shift().replace(/^#\s*/,'' )}];
  for(const l of lines){
    if(l.startsWith('## ')){slides.push({kind:'actions',title:l.slice(3).trim(),items:[]});continue;}
    const s=slides[slides.length-1];
    if(s.kind==='cover') {s.subtitle=(s.subtitle?s.subtitle+' ':'')+l;continue;}
    const idx=l.search(/[｜|]/);
    if(idx<1) throw Error('正文行请使用“项目｜说明”。');
    s.items.push({label:l.slice(0,idx).trim(),detail:l.slice(idx+1).trim()});
  }
  return {slides};
}
function download(data,type,name){
  const url=URL.createObjectURL(new Blob([data],{type}));
  const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
const mime='application/vnd.openxmlformats-officedocument.presentationml.presentation';
function handle(id,fn){$(id).onclick=async()=>{try{$(id).disabled=true;await fn();}catch(e){display(e.message);}finally{$(id).disabled=false;}};}
handle('make',async()=>{
  const v=$('outline').value.trim(),spec=v.startsWith('{')?JSON.parse(v):fromText(v);
  const selected={...assets},files=Array.from($('pictures').files);
  for(const s of spec.slides.filter(s=>s.asset)){
    const file=files.find(f=>f.name===s.asset.split('/').pop());if(!file)continue;
    selected[s.asset]=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('无法读取 '+file.name));r.readAsDataURL(file);});
  }
  const result=await create(spec,false,selected);
  download(result,mime,'新建演示稿.pptx');display('已生成 '+spec.slides.length+' 页。请打开文件检查排版。');
});
async function loadOriginal(f, preset){
  const token=++version; original=null;inv=null;$('plan').value='';$('summary').replaceChildren();$('overview').textContent='';
  for(const id of ['inventory','apply','loadPlan']) $(id).disabled=true;
  try{
    if(!f)return;
    const data=new Uint8Array(await f.arrayBuffer()),info=await inspect(data);if(token!==version)return;
    original=data;inv=info;filename=f.name.replace(/\.pptx$/i,'');$('overview').textContent=filename+' · '+inv.slides.length+' 页';
    for(const s of inv.slides){const li=document.createElement('li');li.textContent=(s.objects.find(o=>o.name==='title'||['title','ctrTitle'].includes(o.placeholder))?.text||'第 '+s.slide+' 页')+(s.locked?'（仅诊断）':'');$('summary').append(li);}
    $('plan').value=JSON.stringify(preset || headingPlan(inv),null,2);$('inventory').disabled=false;$('apply').disabled=inv.signed;$('loadPlan').disabled=inv.signed;
    display(inv.signed?'文件带有签名，可下载诊断清单。':preset?'已载入 5 页电商原稿和完整改版方案。点击「应用方案并下载副本」查看结果。':'可导入 AI 提供的方案，或直接编辑下方 JSON。');
  }catch(e){if(token===version)display(e.message);}
}
$('file').onchange=()=>loadOriginal($('file').files[0]);
$('editCase').onclick=()=>{
  $('file').value='';
  const bytes=Uint8Array.from(atob(before),c=>c.charCodeAt(0));
  return loadOriginal(new File([bytes],'收纳箱主图测试-原稿.pptx'),demoPlan);
};
$('inventory').onclick=()=>download(JSON.stringify(inv,null,2),'application/json','inventory.json');
$('loadPlan').onclick=()=>$('planFile').click();
$('planFile').onchange=async()=>{const f=$('planFile').files[0];if(f)$('plan').value=await f.text();};
handle('apply',async()=>{const result=await apply(original,JSON.parse($('plan').value));download(result,mime,filename+'-优化.pptx');display('已生成优化副本。请打开文件复核改动。');});
