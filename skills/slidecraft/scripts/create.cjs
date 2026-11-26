const pptxgen = require('pptxgenjs');
const {finalizeCreated} = require('./edit.cjs');

const ink = '173E38', paper = 'F7F4E9', teal = '14675E', orange = 'D95631', muted = '50645E';
const kinds = ['cover','metrics','chart','table','actions','comparison'];
function requiredString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw Error('需要非空文本：' + label);
}
function validate(spec) {
  if (!Array.isArray(spec?.slides) || !spec.slides.length) throw Error('slides 至少需要一页');
  for (const [i,s] of spec.slides.entries()) {
    if (!s || !kinds.includes(s.kind)) throw Error('第 ' + (i+1) + ' 页类型无效');
    requiredString(s.title, 'title');
    if (s.kind === 'metrics' || s.kind === 'actions') {
      if (!Array.isArray(s.items) || !s.items.length || s.items.length > 3) throw Error('items 需要 1 至 3 项');
      for (const p of s.items) { requiredString(p.label, 'label'); requiredString(p[s.kind === 'metrics' ? 'value' : 'detail'], 'value / detail'); }
    }
    if (s.kind === 'comparison' && (!s.asset || !Array.isArray(s.captions) || s.captions.length !== 2)) throw Error('对照页需要 asset 与两条 captions');
    if (s.kind === 'chart' && (!Array.isArray(s.values) || !s.values.length || s.values.length > 8 ||
        !Array.isArray(s.labels) || s.labels.length !== s.values.length || !s.values.every(Number.isFinite) ||
        !s.labels.every(v => typeof v === 'string'))) throw Error('图表需要 1 至 8 组配对标签与数值');
    if (s.kind === 'table' && (!Array.isArray(s.rows) || s.rows.length < 2 || s.rows.length > 6 ||
        !Array.isArray(s.rows[0]) || !s.rows[0].length || s.rows[0].length > 4 ||
        !s.rows.every(r => Array.isArray(r) && r.length === s.rows[0].length && r.every(v => typeof v === 'string')))) throw Error('表格需要 2–6 行、1–4 列且各行等长');
  }
}
async function create(spec, draft = false, assets = {}) {
  validate(spec);
  const ppt = new pptxgen();
  ppt.layout = 'LAYOUT_WIDE'; ppt.author = spec.series || 'Slidecraft'; ppt.title = spec.slides[0].title;
  const font = spec.font || 'Microsoft YaHei';
  ppt.theme = {headFontFace:font, bodyFontFace:font, lang:'zh-CN'};
  for (const [index,s] of spec.slides.entries()) {
    const page = ppt.addSlide();
    const cover = s.kind === 'cover'; const dark = !draft && (cover || s.kind === 'actions');
    const fg = dark ? paper : ink; const sub = dark ? 'C6D8CD' : muted;
    page.background = {color: draft ? 'FFFFFF' : dark ? ink : paper};
    function type(name, str, box, size, color=fg, opts={}) {
      if (str === undefined || str === '') return;
      page.addText(String(str),{x:box[0],y:box[1],w:box[2],h:box[3],fontFace:font,fontSize:size,color,
        margin:0,breakLine:false,valign:'mid',align:'left',paraSpaceAfter:0,paraSpaceBefore:0,
        lang:'zh-CN',objectName:name,...opts});
    }
    function rule(name,x,y,w,color) {
      page.addShape(ppt.ShapeType.line,{x,y,w,h:0,line:{color,width:1},objectName:name});
    }
    type('series',spec.series,[.72,.4,6,.33],12,draft?'555555':sub,{bold:true});
    type('section',s.section,[7,.4,5.6,.33],12,draft?'555555':sub,{align:'right'});
    rule('header-rule',.72,.92,11.88,draft?'BBBBBB':dark?'6E8B7B':'A9B9A9');
    type('source',spec.sourceMark,[.72,6.96,9,.27],10,draft?'666666':sub);
    type('page',String(index+1).padStart(2,'0')+' / '+String(spec.slides.length).padStart(2,'0'),[10.35,6.94,2.25,.29],11,draft?'666666':sub,{fontFace:'Arial',align:'right'});
    if (cover) {
      const photo=Boolean(s.asset);
      if(photo){
        if(!assets[s.asset]) throw Error('缺少封面图片');
        const side=draft?3.3:5.38;
        page.addImage({data:assets[s.asset],x:draft?8.55:7.23,y:draft?2.15:1.2,w:side,h:side,objectName:'hero-photo',altText:s.title});
      }
      const plainCover = !photo && !s.display;
      const titleBox = plainCover ? [.72,2.05,11.88,1.78] : draft ? [1,1.5,7.35,.85] : [.7,1.58,6.45,1.1];
      const subtitleBox = plainCover ? [.76,4.17,11.68,1.18] : draft ? [1,2.65,7.3,.7] : [.76,2.88,6.38,.72];
      type('title',s.title,titleBox,draft?36:54,draft?'333333':paper,{bold:true});
      type('subtitle',s.subtitle,subtitleBox,draft?22:27,draft?'333333':sub);
      type('display',s.display,draft?[1,4.12,6,.82]:photo?[.72,4.33,5.9,1.22]:[7.35,2.02,5.2,1.65],draft?34:photo?67:87,draft?'333333':'F1AF85',{fontFace:'Arial',bold:true});
      type('caption',s.caption,draft?[1,5.13,7,.47]:photo?[.79,5.79,6.25,.47]:[7.48,3.82,5,.47],draft?18:17,draft?'333333':sub);
    } else {
      type('title',s.title,[.72,draft?1.23:1.16,11.9,.85],draft?27:36,draft?'333333':fg,{bold:true});
      type('subtitle',s.subtitle,[.74,2.05,11.8,.54],draft?18:19,draft?'444444':sub);
      if (s.kind === 'comparison') {
        const data = assets[s.asset];
        if (!data) throw Error('需要提供对照图资源：' + s.asset);
        const w = draft ? 6.1 : 7.22, h = w / 2, x = (13.333333-w)/2, y = draft ? 2.85 : 2.67;
        page.addImage({data,x,y,w,h,objectName:'comparison-image',altText:s.captions.join(' / ')});
        s.captions.forEach((v,i)=>type('caption-'+i,v,[x+i*w/2,y+h+.08,w/2,.36],draft?13:15,fg,{align:'center',bold:true}));
      }
      if (s.kind === 'metrics') {
        s.items.forEach((it,i)=>{
          const x=.78+i*(11.95/s.items.length);
          type('value-'+i,it.value,draft?[.99,2.9+i*.91,2,.58]:[x,3.12,11.6/s.items.length,1.37],draft?27:68,draft?'333333':i===0?teal:ink,{bold:true,fontFace:'Arial'});
          type('label-'+i,it.label,draft?[3.05,2.9+i*.91,7,.58]:[x,4.7,11.6/s.items.length,.6],draft?20:19,draft?'333333':sub);
        });
      }
      if (s.kind === 'chart' || s.kind === 'table') {
        const geom=draft?{x:.9,y:2.9,w:7.05,h:2.88}:{x:.75,y:2.94,w:7.4,h:3.06};
        if (!s.aside && !s.asideLabel) geom.w=11.83;
        if(s.kind === 'chart') {
          page.addChart(ppt.ChartType.bar,[{name:s.seriesName||'数值',labels:s.labels,values:s.values}],{
            ...geom,objectName:'chart',barDir:'col',catAxisLabelFontFace:font,catAxisLabelFontSize:15,
            valAxisLabelFontFace:'Arial',valAxisLabelFontSize:13,catAxisLabelColor:muted,valAxisLabelColor:muted,
            chartColors:[teal],showLegend:false,showTitle:false,showValue:true,dataLabelPosition:'outEnd',
            valAxisLabelFormatCode:s.numberFormat||'0.##',dataLabelFormatCode:s.numberFormat||'0.##',dataLabelFormatColor:ink,dataLabelFormatFontSize:14,
            showCatName:false,showBorder:false,
            valGridLine:{color:'C8CEC2',size:.6},catAxisLineShow:false,valAxisLineShow:false,
            showMarker:false,
            ...(Math.min(...s.values)>=0 ? {valAxisMinVal:0,valAxisMaxVal:(Math.max(...s.values) || 1)*1.25} : {})
          });
        } else {
          const tab=s.rows.map((r,ri)=>r.map((t,ci)=>({text:t,options:{
            bold:ri===0,align:ci===0?'left':'right',color:ri===0?paper:ink,fill:{color:ri===0?teal:ri%2?'F5F4EB':'E9EDE3'}
          }})));
          page.addTable(tab,{x:geom.x,y:geom.y+.16,w:geom.w,h:Math.min(3.0,s.rows.length*.77),rowH:Math.min(.77,3/s.rows.length),
            colW:Array(s.rows[0].length).fill(geom.w/s.rows[0].length),fontFace:font,fontSize:16,margin:.1,
            border:{type:'solid',pt:.5,color:'BCC8BB'},valign:'middle',autoPage:false,objectName:'table'});
        }
        type('aside',s.aside,[8.65,3.12,3.95,1.1],draft?31:64,draft?'444444':orange,{fontFace:'Arial',bold:true});
        type('aside-label',s.asideLabel,[8.68,4.4,3.82,.61],draft?17:19,draft?'444444':ink,{bold:true});
      }
      if(s.kind === 'actions') s.items.forEach((it,i)=>{
        const y=2.86+i*1.07;
        type('owner-'+i,it.label,[.78,y,2.72,.7],draft?19:23,draft?'444444':'F1AF85',{bold:true});
        type('action-'+i,it.detail,[3.45,y,9.05,.74],draft?18:21,draft?'444444':paper);
      });
      type('note',s.note,[.75,6.22,11.85,.42],14,draft?'666666':sub);
    }
    if(s.notes) page.addNotes(s.notes);
  }
  return finalizeCreated(new Uint8Array(await ppt.write({outputType:'arraybuffer',compression:true})));
}
module.exports = {create, validate};
