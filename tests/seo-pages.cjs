const {chromium}=require('playwright');const assert=require('node:assert/strict');const pages=require('../service-pages.json');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 assert.equal(pages.filter(c=>!c.category).length,13);assert.equal(pages.filter(c=>c.category).length,11);
 for(const config of pages){
  await p.goto('http://127.0.0.1:8000'+config.path);
  assert.equal(await p.title(),config.title);assert.equal(await p.locator('link[rel="canonical"]').getAttribute('href'),'https://www.dopiousdesign.com'+config.path);
  assert.equal(await p.locator('#selected-work article').count(),config.projects.length);
  assert.equal(await p.locator('nav .logo').getAttribute('href'),'/');
  assert.equal(await p.locator('.seo-service-directory .seo-service-head').count(),13);
  const first=config.projects[0]||{id:'test',name:'Filter test'};
  await p.evaluate(({first,service,category})=>{_P=[{_id:first.id,name:first.name,service,subHead:category||'General',desc:'Example'},{_id:'other',name:'Other',service:service==='Space Design+'?'Graphic Design+':'Space Design+',subHead:'General',desc:'Other'}];if(category)_P.push({_id:'wrong-sub',name:'Wrong subcategory',service,subHead:'Other',desc:'Other'});rSvc()},{first,service:config.service,category:config.category});await p.waitForTimeout(30);
  assert.equal(await p.locator('#sG .cat-slide-card:visible').count(),1,'correct service/category: '+config.path);
  if(config.projects.length){
   await p.locator('#selected-work [data-project-id]').first().click();await p.waitForTimeout(30);
   assert.equal(await p.locator('#pdi .dn').textContent(),first.name,'curated project opens live detail');await p.evaluate(()=>cPD());
  }
  await p.getByRole('button',{name:'English',exact:true}).click();await p.waitForTimeout(20);assert(await p.getByRole('heading',{name:config.headingEn,exact:true}).isVisible());
  await p.getByRole('button',{name:'ภาษาไทย',exact:true}).click();
  for(const width of [320,768,1440]){await p.setViewportSize({width,height:900});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow '+config.path+' '+width)}
 }
 assert.deepEqual(errors,[]);console.log('PASS: all 24 routes, unique titles/canonicals, 13 service navigation groups, live service/subcategory filtering, project details, languages and responsive layouts');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
