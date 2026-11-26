const {create}=require('../skills/slidecraft/scripts/create.cjs');
const {inspect,apply,headingPlan}=require('../skills/slidecraft/scripts/edit.cjs');
const {cases,assets}=require('demo-data');
const chinese=require('./zh-CN.json');
const $=id=>document.getElementById(id);
let original,inv,filename,version=0;
let locale='en', lastMessage=null;
const starter=$('outline').defaultValue;
function t(key,args={}){
  let str=key;
  if(locale==='zh-CN'){
    const prefix=Object.keys(chinese).find(p=>p.endsWith(' ') && key.startsWith(p));
    str=chinese[key] ?? (prefix ? chinese[prefix]+key.slice(prefix.length) : key);
  }
  for(const [name,value] of Object.entries(args)) str=str.replaceAll('{'+name+'}',String(value));
  return str;
}
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
const labels=[];
while(walker.nextNode()){
  const node=walker.currentNode;
  if(Object.hasOwn(chinese,node.textContent) && !node.parentElement.closest('textarea,script,select')) labels.push([node,node.textContent]);
}
const attrs=[];
for(const el of document.querySelectorAll('[alt],[aria-label],[placeholder]')){
  for(const attr of ['alt','aria-label','placeholder']){
    const key=el.getAttribute(attr);if(key && Object.hasOwn(chinese,key))attrs.push([el,attr,key]);
  }
}
function display(key,args={}){
  lastMessage=key?[key,args]:null;
  $('status').textContent=t(key,args);
}
function showInventory(){
  $('summary').replaceChildren();
  if(!inv){$('overview').textContent=t('Choose a presentation to see its slide titles.');return;}
  $('overview').textContent=filename+' · '+t('{n} slides',{n:inv.slides.length});
  for(const s of inv.slides){
    const el=document.createElement('li');
    el.textContent=(s.objects.find(o=>o.name==='title'||['title','ctrTitle'].includes(o.placeholder))?.text||t('Slide {n}',{n:s.slide}))+(s.locked?t(' (review only)'):'');
    $('summary').append(el);
  }
}
function setLanguage(next){
  const oldStarter=t(starter);
  locale=next==='zh-CN'?'zh-CN':'en';
  document.documentElement.lang=locale;
  document.title='Slidecraft · '+t('Presentation workspace');
  for(const [node,key] of labels)node.textContent=t(key);
  for(const [el,attr,key] of attrs)el.setAttribute(attr,t(key));
  if($('outline').value===oldStarter)$('outline').value=t(starter);
  if(lastMessage)display(...lastMessage);
  showInventory();
  $('language').value=locale;
}
$('language').onchange=()=>{
  setLanguage($('language').value);
  try{localStorage.setItem('slidecraft-language',locale);}catch{}
};
let saved;
try{saved=localStorage.getItem('slidecraft-language');}catch{}
setLanguage(saved);

$('samplePhoto').src=assets['assets/main-image-pair.jpg'];

function tab(isNew){$('newPane').hidden=!isNew;$('editPane').hidden=isNew;$('newTab').setAttribute('aria-selected',isNew);$('editTab').setAttribute('aria-selected',!isNew);display('');}
$('newTab').onclick=()=>tab(true);$('editTab').onclick=()=>tab(false);
$('loadCase').onclick=()=>{$('outline').value=JSON.stringify(cases[locale].demo,null,2);display('The five-slide example is ready. You can edit its copy and data.');};
function fromText(input){
  const lines=input.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if(!lines.length) throw Error('Enter an outline first.');
  const slides=[{kind:'cover',title:lines.shift().replace(/^#\s*/,'' )}];
  for(const l of lines){
    if(l.startsWith('## ')){slides.push({kind:'actions',title:l.slice(3).trim(),items:[]});continue;}
    const s=slides[slides.length-1];
    if(s.kind==='cover') {s.subtitle=(s.subtitle?s.subtitle+' ':'')+l;continue;}
    const idx=l.search(/[｜|]/);
    if(idx<1) throw Error('Use “Label | Detail” for each body line.');
    s.items.push({label:l.slice(0,idx).trim(),detail:l.slice(idx+1).trim()});
  }
  return {slides,lang:locale==='zh-CN'?'zh-CN':'en-US'};
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
    selected[s.asset]=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Could not read '+file.name));r.readAsDataURL(file);});
  }
  const result=await create(spec,false,selected);
  download(result,mime,t('Presentation')+'.pptx');display('Created {n} slides. Open the file to review the layout.',{n:spec.slides.length});
});
async function loadOriginal(f, preset){
  const token=++version; original=null;inv=null;$('plan').value='';$('summary').replaceChildren();$('overview').textContent='';
  for(const id of ['inventory','apply','loadPlan']) $(id).disabled=true;
  try{
    if(!f)return;
    const data=new Uint8Array(await f.arrayBuffer()),info=await inspect(data);if(token!==version)return;
    original=data;inv=info;filename=f.name.replace(/\.pptx$/i,'');showInventory();
    $('plan').value=JSON.stringify(preset || headingPlan(inv),null,2);$('inventory').disabled=false;$('apply').disabled=inv.signed;$('loadPlan').disabled=inv.signed;
    display(inv.signed?'This deck is signed. Its inventory is available for review.':preset?'The example draft and redesign plan are ready. Apply the plan to download the result.':'Import a plan from your assistant or edit the JSON below.');
  }catch(e){if(token===version)display(e.message);}
}
$('file').onchange=()=>loadOriginal($('file').files[0]);
$('editCase').onclick=()=>{
  $('file').value='';
  const {before,plan:demoPlan}=cases[locale];
  const bytes=Uint8Array.from(atob(before),c=>c.charCodeAt(0));
  return loadOriginal(new File([bytes],t('Listing image test - draft')+'.pptx'),demoPlan);
};
$('inventory').onclick=()=>download(JSON.stringify(inv,null,2),'application/json','inventory.json');
$('loadPlan').onclick=()=>$('planFile').click();
$('planFile').onchange=async()=>{const f=$('planFile').files[0];if(f)$('plan').value=await f.text();};
handle('apply',async()=>{const result=await apply(original,JSON.parse($('plan').value));download(result,mime,filename+'-'+t('restyled')+'.pptx');display('Created the redesigned copy. Open it to review the changes.');});
