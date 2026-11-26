// Generate the offline page and portable Node runner from the same sources.
const fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..'),skill=path.join(root,'skills/slidecraft');
const esbuild=require(require.resolve('esbuild',{paths:[skill]}));
const {loadAssets}=require(path.join(skill,'scripts/slidecraft.cjs'));
async function build() {
  async function loadCase(name){
    const dir=path.join(root,'examples',name);
    const demo=JSON.parse(await fs.readFile(path.join(dir,'deck.json'),'utf8'));
    const before=(await fs.readFile(path.join(dir,'02-before.pptx'))).toString('base64');
    const plan=JSON.parse(await fs.readFile(path.join(dir,'plan.json'),'utf8'));
    return {demo,before,plan};
  }
  const cases={en:await loadCase('main-image'),'zh-CN':await loadCase('main-image-zh')};
  const assets=await loadAssets(cases.en.demo,path.join(root,'examples/main-image'));
  const dest=path.resolve(process.argv[2]||path.join(root,'dist'));
  await fs.mkdir(dest,{recursive:true});
  const bundle=await esbuild.build({entryPoints:[path.join(root,'web/app.cjs')],bundle:true,platform:'browser',target:'es2020',
    minify:true,legalComments:'inline',write:false,plugins:[{name:'example',setup(b){
      b.onResolve({filter:/^demo-data$/},()=>({path:'example',namespace:'local'}));
      b.onLoad({filter:/.*/,namespace:'local'},()=>({contents:'module.exports='+JSON.stringify({cases,assets})}));
    }}]});
  // A JavaScript replacement callback preserves literal dollar signs in the bundle.
  const template=await fs.readFile(path.join(root,'web/index.template.html'),'utf8');
  await fs.writeFile(path.join(dest,'slidecraft.html'),template.replace('/*BUNDLE*/',()=>bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')));
  await esbuild.build({entryPoints:[path.join(skill,'scripts/slidecraft.cjs')],bundle:true,platform:'node',target:'node18',minify:true,legalComments:'inline',outfile:path.join(dest,'run.cjs')});
}
build().catch(e=>{console.error(e);process.exitCode=1;});
