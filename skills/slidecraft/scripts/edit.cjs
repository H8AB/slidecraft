const JSZip = require('jszip');
const {DOMParser,XMLSerializer} = require('@xmldom/xmldom');
const ns = {
  p:'http://schemas.openxmlformats.org/presentationml/2006/main',
  a:'http://schemas.openxmlformats.org/drawingml/2006/main',
  r:'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
};
const EMU=914400;
const children = e=>Array.from(e?.childNodes||[]).filter(n=>n.nodeType===1);
const first=(e,p,n)=>children(e).find(o=>o.namespaceURI===ns[p] && o.localName===n);
const desc=(e,p,n)=>Array.from(e.getElementsByTagNameNS(ns[p],n));
const parse=s=>new DOMParser().parseFromString(s,'application/xml');
const serialize=d=>new XMLSerializer().serializeToString(d);
const make=(d,p,n)=>d.createElementNS(ns[p],p+':'+n);
function key(bytes) {
  let h=2166136261;
  for(const b of bytes) h=Math.imul(h^b,16777619);
  return bytes.length+'-'+(h>>>0).toString(16);
}
function partPath(path) {
  const parts=[];
  for(const item of path.split('/')) {
    if(!item || item==='.') continue;
    if(item==='..') { if(!parts.length) throw Error('无效的部件路径'); parts.pop(); }
    else parts.push(item);
  }
  return parts.join('/');
}
async function open(bytes) {
  const zip=await JSZip.loadAsync(bytes);
  async function xml(path) { const part=zip.file(path); if(!part) throw Error('缺少 PPTX 部件 '+path); return parse(await part.async('string')); }
  const pres=await xml('ppt/presentation.xml'), rels=await xml('ppt/_rels/presentation.xml.rels');
  const paths=new Map(children(rels.documentElement).filter(r=>r.getAttribute('TargetMode')!=='External').map(r=>{
    const t=r.getAttribute('Target'); return [r.getAttribute('Id'),partPath(t.startsWith('/')?t:'ppt/'+t)];
  }));
  const parts=desc(pres,'p','sldId').map(el=>paths.get(el.getAttributeNS(ns.r,'id')));
  const size=desc(pres,'p','sldSz')[0];
  if(!size || parts.some(p=>!p)) throw Error('仅支持常见的 Transitional PPTX');
  return {zip,xml,parts,width:+size.getAttribute('cx')/EMU,height:+size.getAttribute('cy')/EMU,
    signed:Object.keys(zip.files).some(p=>/^_xmlsignatures\//i.test(p))};
}
function objects(doc) {
  const tree=desc(doc,'p','spTree')[0];
  return children(tree).filter(e=>['sp','pic','graphicFrame','grpSp','cxnSp'].includes(e.localName)).map(e=>{
    const info=desc(e,'p','cNvPr')[0];
    const xf=first(first(e,'p','spPr'),'a','xfrm')||first(e,'p','xfrm');
    const pos=first(xf,'a','off'),sz=first(xf,'a','ext');
    const box=pos&&sz ? [pos.getAttribute('x'),pos.getAttribute('y'),sz.getAttribute('cx'),sz.getAttribute('cy')].map(v=>Math.round(+v/EMU*10000)/10000):null;
    const text=desc(e,'a','p').map(p=>desc(p,'a','t').map(n=>n.textContent).join('')).join('\n');
    return {e,xf,id:info?.getAttribute('id'),name:info?.getAttribute('name'),kind:e.localName,box,text,
      placeholder:desc(e,'p','ph')[0]?.getAttribute('type')||null};
  });
}
function complex(doc) {
  return desc(doc,'p','timing').length>0 || doc.getElementsByTagNameNS('*','oleObj').length>0 ||
    doc.getElementsByTagNameNS('*','relIds').length>0 || doc.getElementsByTagNameNS('*','AlternateContent').length>0;
}
async function inspect(bytes) {
  const f=await open(bytes),slides=[];
  for(const [i,path] of f.parts.entries()){
    const doc=await f.xml(path);
    slides.push({slide:i+1,locked:complex(doc),objects:objects(doc).map(({e,xf,...o})=>o)});
  }
  return {source:key(bytes),width:f.width,height:f.height,signed:f.signed,slides};
}
function colorCode(s) { if(!/^[0-9a-f]{6}$/i.test(s||'')) throw Error('颜色需要六位 HEX'); return s.toUpperCase(); }
function fill(doc,color) {
  const solid=make(doc,'a','solidFill'),rgb=make(doc,'a','srgbClr');
  rgb.setAttribute('val',colorCode(color)); solid.appendChild(rgb); return solid;
}
function bg(doc,color) {
  const cs=desc(doc,'p','cSld')[0],old=first(cs,'p','bg');
  const el=make(doc,'p','bg'),pr=make(doc,'p','bgPr'); pr.appendChild(fill(doc,color)); el.appendChild(pr);
  if(old) cs.replaceChild(el,old); else cs.insertBefore(el,cs.firstChild);
}
function style(doc,shape,s) {
  if(shape.kind!=='sp' || !first(shape.e,'p','txBody')) throw Error('只有普通文本形状可以更改字形');
  if(s.size!==undefined && (!Number.isFinite(s.size)||s.size<1||s.size>300)) throw Error('字号应为 1–300 pt');
  if(s.bold!==undefined && typeof s.bold!=='boolean') throw Error('bold 需要布尔值');
  for(const run of desc(shape.e,'a','r')) {
    let pr=first(run,'a','rPr');
    if(!pr){pr=make(doc,'a','rPr');run.insertBefore(pr,run.firstChild);}
    if(s.size!==undefined) pr.setAttribute('sz',String(Math.round(s.size*100)));
    if(s.bold!==undefined) pr.setAttribute('b',s.bold?'1':'0');
    if(s.color!==undefined) {
      for(const c of children(pr)) if(['noFill','solidFill','gradFill','blipFill','pattFill','grpFill'].includes(c.localName)) pr.removeChild(c);
      // DrawingML text fill follows the optional outline and precedes font/effect nodes.
      const line=first(pr,'a','ln'); pr.insertBefore(fill(doc,s.color),line?line.nextSibling:pr.firstChild);
    }
  }
}
function place(o,box,f) {
  if(!o.xf || !o.box || o.kind==='grpSp') throw Error('继承定位或组合对象无法移动');
  if(!Array.isArray(box)||box.length!==4||!box.every(Number.isFinite)) throw Error('box 需要四个坐标，单位英寸');
  const [x,y,w,h]=box;
  if(x<0||y<0||w<=0||h<0||x+w>f.width+.001||y+h>f.height+.001) throw Error('目标位置超出画布');
  const pos=first(o.xf,'a','off'),ext=first(o.xf,'a','ext');
  for(const [el,k,v] of [[pos,'x',x],[pos,'y',y],[ext,'cx',w],[ext,'cy',h]]) el.setAttribute(k,String(Math.round(v*EMU)));
}
async function apply(bytes,plan) {
  if(plan.source!==key(bytes)) throw Error('方案与源文件不匹配，请重新 inspect');
  const f=await open(bytes);
  if(f.signed) throw Error('签名演示文稿只支持诊断');
  if(!Array.isArray(plan.slides)||!plan.slides.length) throw Error('方案中没有可执行改动');
  const visited=new Set();
  for(const step of plan.slides){
    const path=f.parts[step.slide-1];
    if(!Number.isInteger(step.slide)||!path||visited.has(path)) throw Error('页码无效或重复');
    visited.add(path);
    const doc=await f.xml(path);
    if(complex(doc)) throw Error('第 '+step.slide+' 页含复杂对象，仅支持诊断');
    if(step.background) bg(doc,step.background);
    const items=objects(doc), objs=new Map(items.map(o=>[o.id,o]));
    if(objs.size!==items.length) throw Error('页内对象编号重复，无法安全应用计划');
    for(const op of step.objects||[]){
      const o=objs.get(String(op.id));
      if(!o) throw Error('找不到对象 '+op.id);
      if(op.box) place(o,op.box,f);
      if(['size','bold','color'].some(k=>op[k]!==undefined)) style(doc,o,op);
    }
    f.zip.file(path,serialize(doc));
  }
  return f.zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
}
// The browser's automatic action deliberately targets identifiable, short headings only.
function headingPlan(inv){
  const slides=[];
  for(const s of inv.slides){
    const o=s.objects.find(o=>o.kind==='sp' && (['title','ctrTitle'].includes(o.placeholder)||/^title$/i.test(o.name)) && o.text.trim());
    if(o && !s.locked && o.text.length<=48) slides.push({slide:s.slide,objects:[{id:o.id,bold:true}]});
  }
  return {source:inv.source,slides};
}
// PptxGenJS 4.0.1 may give generated tables an ID already assigned to a text box.
async function finalizeCreated(bytes) {
  const f=await open(bytes);
  let changed=false;
  for(const path of f.parts) {
    const doc=await f.xml(path), ids=desc(doc,'p','cNvPr');
    let next=Math.max(...ids.map(n=>Number(n.getAttribute('id'))))+1,dirty=false;
    const seen=new Set();
    for(const n of ids){
      const id=n.getAttribute('id');
      if(seen.has(id)){n.setAttribute('id',String(next++));dirty=true;}
      seen.add(id);
    }
    if(dirty){f.zip.file(path,serialize(doc));changed=true;}
  }
  return changed ? f.zip.generateAsync({type:'uint8array',compression:'DEFLATE'}) : bytes;
}
module.exports={inspect,apply,headingPlan,finalizeCreated};
