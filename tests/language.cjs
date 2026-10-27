// Run with Node and Playwright installed; start the static server on port 8000 first.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try {
 const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await page.goto('http://127.0.0.1:8000/');
 assert.equal(await page.locator('html').getAttribute('lang'),'th','new visitors see Thai');
 const thai=page.getByRole('button',{name:'ภาษาไทย',exact:true});
 assert.equal(await thai.count(),1,'Thai language control exists');
 assert(await page.locator('nav .nl button[onclick="oC()"] + .language-switcher').count(),'language controls follow Contact');
 const identity=await page.locator('nav .logo').evaluate(e=>[e.textContent,getComputedStyle(e).fontFamily,getComputedStyle(e).fontWeight]);
 await page.evaluate(projects=>{_P=projects;rSvc()},require('./project-copy.json'));
 const titleStyle=await page.locator('.cat-slide-name').first().evaluate(e=>[getComputedStyle(e).fontFamily,getComputedStyle(e).fontWeight]);
 await thai.click(); await page.waitForTimeout(100);
 assert.deepEqual(await page.locator('nav .logo').evaluate(e=>[e.textContent,getComputedStyle(e).fontFamily,getComputedStyle(e).fontWeight]),identity,'logo is identical in both languages');
 assert.deepEqual(await page.locator('.cat-slide-name').first().evaluate(e=>[getComputedStyle(e).fontFamily,getComputedStyle(e).fontWeight]),titleStyle,'project name typography stays unchanged');
 for(let i=0;i<require('./project-copy.json').length;i++){
   await page.evaluate(index=>oPD(index),i);await page.waitForTimeout(20);
   assert(!/[a-z]/i.test(await page.locator('#pdi .dc').textContent()),'Thai detail category '+i);
   assert(!/[a-z]/i.test(await page.locator('#pdi .ds').textContent()),'Thai detail description '+i);
   assert(!/[a-z]/i.test(await page.locator('#pdi .dsc p').textContent()),'Thai detail story '+i);
   for(const text of await page.locator('#pdi .detail-img-caption').allTextContents())assert(!/[a-z]/i.test(text),'Thai gallery caption '+i);
   assert(await page.locator('#pd .language-switcher').count(),'language controls available on detail page');
 }
 const originalDetail=require('./project-copy.json').at(-1).desc;
 await page.getByRole('button',{name:'English',exact:true}).evaluate(e=>e.click());await page.waitForTimeout(20);
 assert.equal(await page.locator('#pdi .ds').textContent(),originalDetail,'detail English restoration');
 await thai.evaluate(e=>e.click());await page.waitForTimeout(20);
 await page.evaluate(()=>cPD());
 await page.evaluate(()=>oH());await page.waitForTimeout(150);
 for(const service of await page.evaluate(()=>CATS.map(c=>c.svc))){
   await page.evaluate(service=>patchOpenSvc(service),service);await page.waitForTimeout(20);
   assert(!/[a-z]/i.test(await page.locator('#svcExpanded').textContent()),'Thai expanded service '+service);
 }
 await page.evaluate(()=>{cH();oW()});await page.waitForTimeout(30);
 assert(!/[a-z]/i.test((await page.locator('#wP .who-hero p').allTextContents()).join(' ')),'Thai about page');
 await page.evaluate(()=>cW());await page.waitForTimeout(30);
 const cards=page.locator('.cat-slide-card[id]');
 for(let i=0;i<await cards.count();i++){
   const card=cards.nth(i);const count=await card.evaluate(e=>JSON.parse(e.dataset.slides).length);
   for(let j=0;j<count;j++){
     assert(!/[a-z]/i.test(await card.locator('.card-head').textContent()),'Thai category');
     assert(!/[a-z]/i.test(await card.locator('.card-sub-one').textContent()),'Thai subcategory: '+await card.locator('.card-sub-one').textContent());
     assert(!/[a-z]/i.test(await card.locator('.svc-desc').textContent()),'Thai description: '+(await card.locator('.svc-desc').textContent()).slice(0,100));
     await card.evaluate(e=>setCardSlide(e,1));await page.waitForTimeout(30);
   }
 }

 await page.evaluate(()=>{clearInterval(_ht);sHS(SLS.length-1,true)});await page.waitForTimeout(50);
 assert.equal(await page.locator('#hD button').count(),14,'all service slides and one-stop closing slide');
 assert.match(await page.locator('#hTi').textContent(),/บริการออกแบบ/);
 assert.equal(await page.locator('#hTi').evaluate(e=>getComputedStyle(e).fontWeight),'300');
 assert.equal(await page.locator('.card-head').first().evaluate(e=>getComputedStyle(e).letterSpacing),'normal');
 await page.getByRole('button',{name:'English',exact:true}).click();await page.waitForTimeout(50);
 assert.match(await page.locator('#hTi').textContent(),/One-stop/);
 assert.match(await cards.first().locator('.svc-desc').textContent(),/[a-z]/i,'original English description restored');
 await thai.click();await page.waitForTimeout(50);
 assert.equal(await page.locator('html').getAttribute('lang'),'th');
 assert.equal(await page.locator('nav .nl button').first().innerText(),'ผลงาน');
 await page.reload(); await page.waitForTimeout(100);
 assert.equal(await page.locator('html').getAttribute('lang'),'th','language survives reload');
 await page.evaluate(()=>{const p=document.createElement('p');p.id='late-copy';p.textContent='Choose how to reach us';document.body.append(p)});
 await page.waitForTimeout(100);
 assert.equal(await page.locator('#late-copy').innerText(),'เลือกช่องทางติดต่อเรา');
 await page.getByRole('button',{name:'English',exact:true}).click();await page.waitForTimeout(100);
 assert.equal(await page.locator('#late-copy').innerText(),'Choose how to reach us');
 assert.equal(await page.locator('nav .nl button').first().textContent(),'Works');
 await page.reload();await page.waitForTimeout(50);
 assert.equal(await page.locator('html').getAttribute('lang'),'en','English preference survives reload');
 for(const width of [320,768,1024,1440]) {await page.setViewportSize({width,height:900}); const box=await thai.boundingBox();assert(box&&box.x>=0&&box.x+box.width<=width,'control fits '+width)}
 assert.deepEqual(errors,[]);console.log('PASS: 20 project cards and full detail pages, gallery captions, all 13 services and about page, unchanged logo and project titles, service hero slides, persistence, English restoration, responsive controls, no JS errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
