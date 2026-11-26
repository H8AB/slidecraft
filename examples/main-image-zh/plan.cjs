// Turn the visual review of this specific input into object-level edits.
const fs=require('node:fs/promises');
const path=require('node:path');
const {inspect}=require('../../skills/slidecraft/scripts/edit.cjs');
async function main() {
  const data=await fs.readFile(path.join(__dirname,'02-before.pptx'));
  const deck=await inspect(data);
  const slides=deck.slides.map(page=>{
    const cover=page.slide===1, closing=page.slide===5, dark=cover;
    const background=dark?'302A27':closing?'EEE5D7':'FCF9F1';
    const ink=dark?'FFF6E7':'302A27',muted=dark?'DBD1C3':'5D574E',accent=dark?'F1BB8E':'A34626';
    const ops=[];
    function patch(name,props){
      const obj=page.objects.find(o=>o.name===name);
      if(!obj) throw Error('示例不匹配：'+name);
      ops.push({id:obj.id,...props});
    }
    for(const n of ['series','source','section','page'])patch(n,{color:muted});
    patch('title',{box:cover?[.7,1.52,6.5,1.2]:[.72,1.14,11.9,.82],size:cover?55:35,color:ink,bold:true});
    patch('subtitle',{box:cover?[.75,2.76,6.4,.66]:[.75,2.02,11.85,.53],size:cover?24:18,color:muted});
    if(cover){
      patch('hero-photo',{box:[7.27,1.18,5.37,5.37]});
      patch('display',{box:[.72,4.09,6.13,1.48],size:76,color:accent,bold:true});
      patch('caption',{box:[.77,5.72,6.35,.52],size:17,color:muted});
    }else if(page.slide===2){
      patch('comparison-image',{box:[3.02,2.63,7.30,3.65]});
      for(const i of [0,1])patch('caption-'+i,{box:[3.02+3.65*i,6.38,3.65,.34],size:15,color:ink});
    }else if(page.slide===3||page.slide===4){
      // Align the evidence on the right and its interpretation on the left.
      if(page.slide===3) patch('chart',{box:[4.88,2.85,7.63,3.08]});
      else patch('table',{box:[5.03,3.08,7.05,2.31]});
      patch('aside',{box:[.7,3.19,4.12,1.24],size:64,color:accent,bold:true});
      patch('aside-label',{box:[.76,4.58,4.05,.58],size:20,color:ink});
      patch('note',{size:14,color:muted});
    }else if(closing){
      for(let i=0;i<3;i++){
        patch('owner-'+i,{box:[.76,2.83+i*1.09,2.58,.69],size:23,bold:true,color:accent});
        patch('action-'+i,{box:[3.25,2.82+i*1.09,9.25,.76],size:20,color:ink});
      }
    }
    return {slide:page.slide,background,objects:ops};
  });
  await fs.writeFile(path.join(__dirname,'plan.json'),JSON.stringify({source:deck.source,slides},null,2)+'\n');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
