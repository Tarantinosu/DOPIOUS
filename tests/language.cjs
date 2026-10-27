// Run with Node and Playwright installed; start the static server on port 8000 first.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try {
 const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await page.goto('http://127.0.0.1:8000/');
 const thai=page.getByRole('button',{name:'ภาษาไทย',exact:true});
 assert.equal(await thai.count(),1,'Thai language control exists');
 assert(await page.locator('nav .nl button[onclick="oC()"] + .language-switcher').count(),'language controls follow Contact');
 await thai.click(); await page.waitForTimeout(100);
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
 for(const width of [320,768,1024,1440]) {await page.setViewportSize({width,height:900}); const box=await thai.boundingBox();assert(box&&box.x>=0&&box.x+box.width<=width,'control fits '+width)}
 assert.deepEqual(errors,[]);console.log('PASS: language switching, persistence, dynamic content, English restoration, responsive controls, no JS errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
