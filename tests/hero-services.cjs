const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await p.goto('http://127.0.0.1:8000/');
 const slides=await p.evaluate(()=>SLS);assert.equal(slides.length,14,'13 service slides plus one-stop closing slide');
 assert.deepEqual(slides[0].services,['Space Design+']);assert.deepEqual(slides[1].services,['Graphic Design+']);
 assert.deepEqual([...new Set(slides.flatMap(s=>s.services))].sort(),await p.evaluate(()=>CATS.map(c=>c.svc).sort()),'every service covered');
 for(const language of ['th','en']){
  await p.getByRole('button',{name:language==='th'?'ภาษาไทย':'English',exact:true}).click();
  for(let i=0;i<slides.length;i++){
   await p.evaluate(i=>{clearInterval(_ht);sHS(i,true)},i);await p.waitForTimeout(20);
   const copy=await p.locator('#hc').textContent();assert(copy.trim().length>20);
   if(language==='th')assert(!/[a-z]/i.test(await p.locator('#hTi,#hIn,#hEy').allTextContents().then(a=>a.join(' '))),'fully Thai service copy '+i);
   for(const width of [320,768,1440]){await p.setViewportSize({width,height:900});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no overflow '+language+' '+i+' '+width)}
  }
 }
 await p.locator('#hD button').nth(1).focus();await p.keyboard.press('Enter');await p.waitForTimeout(30);assert.match(await p.locator('#hTi').textContent(),/Graphic/,'keyboard slide navigation');await p.locator('#hD button').last().click();await p.waitForTimeout(30);
 assert.match(await p.locator('#hTi').textContent(),/One-stop/i);assert.deepEqual(errors,[]);console.log('PASS: interior first, graphics second, all 13 services, one-stop closing slide, Thai/English copy and responsive layout');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
