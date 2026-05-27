/* ══════════════════════════════════════════
   app.js — core: Firebase, grid, detail
   โหลด defer ไม่ block HTML render
══════════════════════════════════════════ */

/* Firebase config */
const FB={apiKey:"AIzaSyC3JxU94Zb4G1DmDAA7TeiLAkJ4uxrVh5g",authDomain:"dopious-c7230.firebaseapp.com",projectId:"dopious-c7230",storageBucket:"dopious-c7230.firebasestorage.app",messagingSenderId:"424557490629",appId:"1:424557490629:web:ae5181dc91bbac2b8f1bac"};
const COL='dopious_cms';
const COL_CL='dopious_clients';
const COL_TM='dopious_team';
var db=null;

/* Called when Firebase SDK finishes loading */
window._fbBoot=function(){
  try{
    if(!firebase.apps.length)firebase.initializeApp(FB);
    db=firebase.firestore();
    db.enablePersistence({synchronizeTabs:true}).catch(()=>{});
    loadData();
  }catch(e){console.warn('FB:',e);loadData();}
};

/* Service Heads + Sub head options */
const SERVICE_OPTIONS={
  'Brand Strategy / Corporate Identity / Design+':['Creative','Brand Strategy','Corporate Identity','Brand Story','Logo','Visual Identity','Brand Guideline','Campaign Identity','Art Direction'],
  'Industrial Design+':['Creative','Product','Product Concept','CMF','Form','User Experience','Prototype','Product Visualization','Packaging Structure','Material','Manufacturing'],
  'Space Design+':['Creative','Interior','Retail Space','Exhibition','Pop-up Space','Event Space','Visual Merchandising','Customer Journey','Spatial Storytelling','Brand Environment','Mall Decoration'],
  'Key Visual / Creative Ads / Design+':['Creative','Key Visual','Campaign Visual','Ads','Art Direction','Advertising Direction','Promotion Visual','Social Media','Launch Campaign','Seasonal Campaign','Storyboard','Visual Storytelling'],
  'Graphic Design+':['Creative','Graphic','Layout','Poster','Social Media','Print','Typography','Illustration','Signage','Presentation','Visual System','Packaging Graphic','Label','Box Artwork'],
  'Website / UX-UI Design+':['Creative','Website','UX-UI','Landing Page','Web Experience','Interface','Digital Branding','Mobile Experience','User Journey','Conversion'],
  'Sculpture Design+':['Creative','Sculpture','Art Installation','Public Art','Character Sculpture','Decorative Object','Landmark','3D Art Form','Spatial Art','Fabrication Concept'],
  'Fashion Design+':['Creative','Fashion','Costume','Uniform','Styling Direction','Fashion Concept','Textile Direction','Character Styling','Campaign Styling','Showpiece'],
  '2D-3D Motion Graphic Design+':['Creative','Motion Graphic','2D Animation','3D Animation','Logo Motion','Social Motion','Event Motion','LED Screen','Product Animation','Visual Effects','Storyboard','Animatic'],
  'Photo / Video / Ads Design+':['Creative','Photo Direction','Video Production','Ads Video','Product Shooting','Campaign Shooting','Lifestyle Content','Short Video','Brand Film','Storyboard','Shot List','Video Treatment'],
  'Build & Installation+':['Creative','Build & Installation','Production Service','Fabrication','On-site Installation','Material Execution','Supplier Coordination','Display Production','Quality Control','Production Follow-up'],
  'Prototype / 3D Print Service+':['Creative','Prototype','3D Printing','Mockup','Product Testing','Model Making','Form Study','Validation','Sample Development','Rapid Prototype'],
  'Marketing / Brand Communication+':['Creative','Marketing Strategy','Brand Communication','Campaign Planning','Content Strategy','Promotion Planning','Launch Strategy','Social Media Direction','Brand Activation','Campaign Narrative'],
  'Production Follow-up+':['Creative','Production Follow-up','Supplier Briefing','Production Control','Coordination','Fabrication Check','On-site Supervision','Material Approval','Final Delivery']
};
const CATS=Object.keys(SERVICE_OPTIONS).map((svc,i)=>({
  cat:svc.toUpperCase(),svc,
  bg:[
    'linear-gradient(90deg,rgba(35,8,0,.88),rgba(80,18,40,.35)),radial-gradient(circle at 62% 50%,#9024a0 0 18%,transparent 19%),linear-gradient(100deg,#2a0c08 0 28%,#a11ca7 29% 58%,#6c6c6c 59% 100%)',
    'linear-gradient(90deg,rgba(3,8,18,.9),rgba(0,0,0,.2)),linear-gradient(100deg,#0b0d13 0 30%,#1b2028 31% 62%,#bec4c8 63% 100%)',
    'linear-gradient(90deg,rgba(0,18,10,.85),rgba(0,0,0,.2)),radial-gradient(ellipse at 62% 52%,rgba(255,255,255,.38),transparent 25%),linear-gradient(100deg,#06120c 0 25%,#223328 26% 70%,#0a0a0a 71% 100%)',
    'linear-gradient(90deg,rgba(40,5,5,.82),rgba(0,0,0,.12)),linear-gradient(100deg,#24100c 0 18%,#5d0d0a 19% 22%,#111 23% 72%,#7a1d12 73% 100%)',
    'linear-gradient(90deg,rgba(30,0,0,.84),rgba(255,42,20,.28)),radial-gradient(circle at 70% 48%,rgba(255,42,20,.62),transparent 18%),linear-gradient(100deg,#140606 0 40%,#2b1010 41% 72%,#ff2a14 73% 100%)',
    'linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.15)),linear-gradient(100deg,#0b1020 0 38%,#242424 39% 100%)',
    'linear-gradient(90deg,rgba(0,0,0,.78),rgba(255,255,255,.12)),radial-gradient(circle at 62% 52%,rgba(255,255,255,.62),transparent 20%),linear-gradient(100deg,#070707 0 45%,#3b3b3b 46% 100%)',
    'linear-gradient(90deg,rgba(180,0,0,.72),rgba(0,0,0,.1)),linear-gradient(100deg,#ff2115 0 36%,#111 37% 100%)',
    'linear-gradient(90deg,rgba(0,68,92,.72),rgba(6,148,165,.25)),radial-gradient(circle at 55% 44%,#f4d36b 0 14%,transparent 15%),linear-gradient(100deg,#0b9aaa 0 44%,#077e8e 45% 100%)',
    'linear-gradient(90deg,rgba(120,12,3,.75),rgba(8,40,52,.25)),radial-gradient(circle at 42% 48%,#ff4a28 0 10%,transparent 11%),linear-gradient(100deg,#102e3c 0 36%,#9b1d10 37% 100%)',
    'linear-gradient(90deg,rgba(10,10,10,.88),rgba(60,30,10,.4)),linear-gradient(100deg,#0a0a08 0 38%,#2a1e0e 39% 100%)',
    'linear-gradient(90deg,rgba(25,14,35,.88),rgba(255,42,20,.12)),linear-gradient(100deg,#100b16 0 42%,#30203c 43% 100%)',
    'linear-gradient(90deg,rgba(22,10,5,.88),rgba(255,42,20,.18)),linear-gradient(100deg,#090909 0 38%,#38120c 39% 100%)',
    'linear-gradient(90deg,rgba(16,16,16,.88),rgba(255,120,20,.18)),linear-gradient(100deg,#090909 0 38%,#2a1e0e 39% 100%)'
  ][i%14]
}));
const SERVICE_ALIAS={
  'Brand Strategy Corporate Identity Design+':'Brand Strategy / Corporate Identity / Design+',
  'BRAND STRATEGY / CORPORATE IDENTITY / DESIGN+':'Brand Strategy / Corporate Identity / Design+',
  'Keyvisual Creative Ads Design+':'Key Visual / Creative Ads / Design+',
  'KEYVISUAL / CREATIVE ADS / DESIGN+':'Key Visual / Creative Ads / Design+',
  'Website UX-UI Design+':'Website / UX-UI Design+',
  'Photo / Video / Ads Production':'Photo / Video / Ads Design+',
  'Packaging Design+':'Graphic Design+'
};
const LEGACY_PACKAGING_SUB=['Packaging Graphic'];
const S2C={};CATS.forEach((c,i)=>S2C[c.svc]=i);
function normHead(v){
  const raw=String(v||'').trim();
  if(!raw)return CATS[0].svc;
  if(SERVICE_OPTIONS[raw])return raw;
  if(SERVICE_ALIAS[raw])return SERVICE_ALIAS[raw];
  const hit=Object.keys(SERVICE_OPTIONS).find(k=>k.toLowerCase()===raw.toLowerCase());
  return hit||raw;
}
function splitSubString(v){return String(v||'').split(/\s*(?:\/|,|\||\n)\s*/).map(s=>s.trim()).filter(Boolean);}
function normSubHeads(p,head){
  let arr=[];
  if(Array.isArray(p.subHeads))arr=p.subHeads;
  else if(Array.isArray(p.subheads))arr=p.subheads;
  else if(Array.isArray(p.subHead))arr=p.subHead;
  else if(p.subHeadsString)arr=splitSubString(p.subHeadsString);
  else if(p.subHead)arr=splitSubString(p.subHead);
  else if(p.sub)arr=splitSubString(p.sub);
  else if(p.subtitle)arr=splitSubString(p.subtitle);
  else if((p.service||p.svc)==='Packaging Design+')arr=LEGACY_PACKAGING_SUB;
  arr=arr.map(s=>String(s||'').trim()).filter(Boolean);
  const seen={};arr=arr.filter(s=>seen[s]?false:(seen[s]=true)).slice(0,3);
  if(!arr.length)arr=['Creative'];
  return arr;
}
function groupKeyFor(head,subs){return head+'|'+subs.join(' / ');}
function escAttr(s){return esc(s).replace(/'/g,'&#39;');}

/* Hero slides */
const SLS=[
  {ey:'One-stop Service',ti:'Creative work<br><em>from start to finish.</em>',st:'Strategy, design, visuals, and production in one workflow.',de:'Choose the services you need, or connect everything into one complete project.',tg:['Strategy','Design','Visual','Production'],bg:false},
  {ey:'Dream',ti:'Turn ideas<br><em>into direction.</em>',st:'Start with a rough idea. We shape it into a clear design plan.',de:'For brands, products, spaces, campaigns, and visual experiences.',tg:['Brief','Concept','Mood','Plan'],bg:false},
  {ey:'Passion',ti:'Build what<br><em>you believe in.</em>',st:'We translate your passion into a brand people can understand.',de:'Identity, key visual, space, product story, and content work together.',tg:['Identity','Key Visual','Space','Media'],bg:false},
  {ey:'Flexible Budget',ti:'Start small<br><em>or go full scale.</em>',st:'Budget-based customization available.',de:'Begin with consultation, then scale to design, prototype, production, and launch.',tg:['Consult','Design','Prototype','Launch'],bg:true},
  {ey:'From Dream to Reality',ti:'Concept<br><em>to production.</em>',st:'We help move ideas into real outputs.',de:'3D visualization, content, supplier coordination, and production follow-up.',tg:['3D Visual','Content','Supplier','Follow-up'],bg:false},
];

/* Scroll lock */
var _sy=0;
var _iOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function lk(){if(_iOS){_sy=window.pageYOffset||0;document.documentElement.style.cssText+='overflow:hidden;height:100%';document.body.style.cssText+='overflow:hidden;height:100%';}else document.body.style.overflow='hidden';}
function uk(){if(_iOS){document.documentElement.style.overflow='';document.documentElement.style.height='';document.body.style.overflow='';document.body.style.height='';window.scrollTo(0,_sy);}else document.body.style.overflow='';}
function op(id){var el=document.getElementById(id);if(el){el.classList.add('on');lk();el.scrollTop=0;}}
function cl2(id){var el=document.getElementById(id);if(el){el.classList.remove('on');uk();}}

/* Nav */
function tM(){document.getElementById('mpn').classList.toggle('on');}
function gS(){scrollTo({top:document.getElementById('svc').offsetTop-64,behavior:'smooth'});}
function oW(){rTm();op('wP');}
function cW(){cl2('wP');}
function oH(){op('hP');}
function cH(){cl2('hP');}
function oC(){op('cP');}
function cC(){cl2('cP');}
function oSt(){op('sP');}
function cSt(){cl2('sP');}
function oAL(){op('aLo');setTimeout(()=>document.getElementById('aPw')?.focus(),80);}
function cAL(){cl2('aLo');document.getElementById('aPw').value='';document.getElementById('aErr').style.display='none';}
function cAP(){cl2('aP');}

/* Hero */
var _hi=0,_ht;
function sHS(i,ins){
  _hi=i;const s=SLS[i];const hc=document.getElementById('hc');
  const go=()=>{
    document.getElementById('hero').className='hero'+(s.bg?' hbg':'');
    document.getElementById('hEy').textContent=s.ey;
    document.getElementById('hTi').innerHTML=s.ti;
    document.getElementById('hIn').innerHTML='<strong>'+s.st+'</strong><span>'+s.de+'</span><div class="tg">'+s.tg.map(t=>'<em>'+t+'</em>').join('')+'</div>';
    document.querySelectorAll('#hD span').forEach((d,j)=>d.classList.toggle('on',j===i));
    hc&&hc.classList.remove('fd');
  };
  if(ins){go();return;}hc&&hc.classList.add('fd');setTimeout(go,100);
}
function initHero(){
  const d=document.getElementById('hD');
  SLS.forEach((_,i)=>{const s=document.createElement('span');s.onclick=()=>{clearInterval(_ht);sHS(i,true);_ht=setInterval(()=>sHS((_hi+1)%SLS.length),5200);};d.appendChild(s);});
  sHS(0,true);
  _ht=setInterval(()=>sHS((_hi+1)%SLS.length),5200);
}

/* Google Drive thumbnail */
function dTh(u,sz){const m=String(u||'').match(/[?&]id=([A-Za-z0-9_-]+)/)||String(u||'').match(/\/d\/([A-Za-z0-9_-]+)/);return m?'https://drive.google.com/thumbnail?id='+m[1]+'&sz=s'+(sz||600):u;}
function isDr(u){return /drive\.google\.com/i.test(String(u||''));}
function iU(u,sz){return u?(isDr(u)?dTh(u,sz||600):u):'';}

/* Lazy IntersectionObserver */
const IO=('IntersectionObserver' in window)&&new IntersectionObserver(en=>{en.forEach(e=>{if(!e.isIntersecting)return;const img=e.target,s=img.dataset.src;if(!s)return;delete img.dataset.src;ldI(img,s);IO.unobserve(img);});},{rootMargin:'260px 0px'});
function ldI(img,src){
  if(!src)return;
  const sm=iU(src,500);const bg2=iU(src,1100);
  const t=new Image();
  t.onload=()=>{img.src=sm;const lq=img.closest('.sl,.di')?.querySelector('.lq');if(lq)setTimeout(()=>lq.style.opacity='0',50);if(sm!==bg2){const f=new Image();f.onload=()=>{img.src=bg2;};f.src=bg2;}};
  t.onerror=()=>{img.src=src;};t.src=sm;
}

/* ESC */
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

/* Data cache */
var _P=[],_CL=[],_TM=[];

/* Get cover URL (compat old+new field names) */
function getCov(p){return p.covUrl||p.coverThumb||p.cover||p.coverImage||'';}
function getCovFull(p){return p.covUrl||p.cover||p.coverImage||p.coverThumb||'';}

/* Load from Firebase */
async function loadData(){
  if(!db)return;
  try{
    const [ps,cs,ts]=await Promise.all([
      db.collection(COL).orderBy('ts','desc').get(),
      db.collection(COL_CL).orderBy('ts','asc').get().catch(()=>({docs:[]})),
      db.collection(COL_TM).orderBy('ts','asc').get().catch(()=>({docs:[]})),
    ]);
    _P=ps.docs.map(d=>({_id:d.id,...d.data()}));
    _CL=cs.docs.map(d=>({_id:d.id,...d.data()}));
    _TM=ts.docs.map(d=>({_id:d.id,...d.data()}));
    rSvc();rCl();
  }catch(e){
    console.warn('loadData:',e);
    document.getElementById('sCt').textContent='Error loading';
  }
}

/* Service grid */
var _ac={},_tm2={};
function rSvc(){
  const g=document.getElementById('sG');if(!g)return;
  Object.keys(_tm2).forEach(k=>clearInterval(_tm2[k]));_tm2={};_ac={};
  const groups={},order=[];
  _P.forEach((p,ai)=>{
    const head=normHead(p.service||p.svc||p.serviceHead||p.head);
    if(S2C[head]===undefined)return;
    const subs=normSubHeads(p,head);
    const key=groupKeyFor(head,subs);
    if(!groups[key]){groups[key]={head,subs,items:[],catIndex:S2C[head]};order.push(key);}
    groups[key].items.push({p,ai});
  });
  order.sort((a,b)=>(groups[a].catIndex-groups[b].catIndex)||a.localeCompare(b));
  const html=order.map((key,gi)=>{
    const group=groups[key];
    const gid='g'+gi;
    const sls=group.items.map(({p,ai})=>{const cu=getCov(p);return{ai,ti:p.name||p.nm||'Untitled',img:cu,lq:p.lqip||(cu&&isDr(cu)?dTh(cu,20):'')};});
    const cnt=sls.length;
    const ctr=cnt>1?'<div class="sct2"><button class="snv" onclick="nC(event,\''+gid+'\',-1)">‹</button><span class="scn">1/'+cnt+'</span><button class="snv" onclick="nC(event,\''+gid+'\',1)">›</button></div>':'';
    const layers=sls.map((s,li)=>'<div class="sl'+(li===0?' on':'')+'" data-li="'+li+'">'+(s.lq?'<div class="lq" style="background-image:url(\''+escAttr(s.lq)+'\')"></div>':'')+(s.img?'<img '+(li===0?'src':'data-src')+'="'+escAttr(iU(s.img,li===0?600:400))+'" alt="'+escAttr(s.ti)+'" loading="'+(li===0?'eager':'lazy')+'" decoding="async">':'')+'</div>').join('');
    const data=escAttr(JSON.stringify(sls.map(s=>({ai:s.ai,ti:s.ti}))));
    return'<article class="sc" id="sc'+gid+'" data-group-key="'+escAttr(key)+'" data-sl=\''+data+'\'>'+layers+'<div class="sov"></div><div class="sp"><div class="snm">'+esc(sls[0].ti)+'</div>'+ctr+'</div><div class="slb"><span class="svc-head">'+esc(group.head)+'</span><span class="svc-subhead">'+esc(group.subs.join(' / '))+'</span></div><button class="stp" aria-label="View" onclick="oCd(\''+gid+'\')"></button></article>';
  }).join('');
  g.innerHTML=html||CATS.slice(0,8).map(c=>'<article class="sc sk"><div class="sl on" style="background:'+c.bg+'"></div><div class="sov"></div><div class="slb"><span class="svc-head" style="opacity:.35">'+esc(c.svc)+'</span><span class="svc-subhead">Creative</span></div></article>').join('');
  g.querySelectorAll('img[data-src]').forEach(img=>IO&&IO.observe(img));
  g.querySelectorAll('.sc[id]').forEach(card=>{const id=card.id.replace('sc','');_ac[id]=0;const sl=JSON.parse(card.getAttribute('data-sl')||'[]');if(sl.length>1)_tm2[id]=setInterval(()=>stC(id,1),4200);});
  const el=document.getElementById('sCt');if(el){const pCount=_P.length,cCount=order.length;el.textContent=pCount?(cCount+' Card'+(cCount>1?'s':'')+' / '+pCount+' Project'+(pCount>1?'s':'')+' — Live'):'Upload projects from Admin';}
}
function stC(id,dir){
  const card=document.getElementById('sc'+id);if(!card)return;
  const sl=JSON.parse(card.getAttribute('data-sl')||'[]');if(!sl.length)return;
  const nx=((_ac[id]||0)+dir+sl.length)%sl.length;_ac[id]=nx;
  card.querySelectorAll('.sl').forEach((l,i)=>l.classList.toggle('on',i===nx));
  const nl=card.querySelector('.sl[data-li="'+nx+'"]');if(nl){const img=nl.querySelector('img[data-src]');if(img)ldI(img,img.dataset.src);}
  const ne=card.querySelector('.snm');if(ne)ne.textContent=sl[nx].ti||'';
  const nc=card.querySelector('.scn');if(nc)nc.textContent=(nx+1)+'/'+sl.length;
}
function nC(e,id,d){e.stopPropagation();clearInterval(_tm2[id]);stC(id,d);const card=document.getElementById('sc'+id);if(card){const sl=JSON.parse(card.getAttribute('data-sl')||'[]');if(sl.length>1)_tm2[id]=setInterval(()=>stC(id,1),4200);}}
function oCd(id){const card=document.getElementById('sc'+id);if(!card)return;const sl=JSON.parse(card.getAttribute('data-sl')||'[]');const s=sl[_ac[id]||0]||sl[0];if(s&&s.ai!==undefined)oPD(s.ai);}

/* Project detail */
function oPD(ai){
  const p=_P[ai];if(!p)return;
  const gls=p.gallery||p.galleryImages||[];const vE=mVE(p.vurl||p.videoUrl||'');const covFull=getCovFull(p);
  let gal='';
  if(covFull){const lqS=isDr(covFull)?dTh(covFull,20):'';gal+='<div class="di"><div class="lq" style="background-image:url(\''+lqS+'\')"></div><img src="'+iU(covFull,1100)+'" alt="'+esc(p.name||p.nm||'')+'" loading="eager"></div>';}
  gls.forEach((url,i)=>{gal+='<div class="di"><div class="lq" style="background-image:url(\''+( isDr(url)?dTh(url,20):'')+'\')"></div><img '+(i<1?'src':'data-src')+'="'+iU(url,1100)+'" alt="" loading="'+(i<1?'eager':'lazy')+'"></div>';});
  if(vE)gal+='<div class="dv">'+vE+'</div>';
  if(!gal){const bg=CATS.find(c=>c.svc===(p.service||p.svc));gal='<div class="di" style="background:'+(bg?bg.bg:'#111')+'"></div>';}
  const svc=normHead(p.service||p.svc||p.serviceHead||p.head);const sub=normSubHeads(p,svc).join(' / ');
  document.getElementById('pdi').innerHTML='<div class="dh"><div class="dc">'+esc(svc)+(sub?' / '+esc(sub):'')+'</div><div class="dn">'+esc(p.name||p.nm||'')+'</div><div class="dm"><div class="db"><small>Client</small><b>'+esc(p.client||p.cl||'-')+'</b></div><div class="db"><small>Credit</small><b>'+esc(p.credit||p.cr||'Dopious+')+'</b></div><div class="db"><small>Year</small><b>'+esc(p.year||p.yr||'2026')+'</b></div></div></div>'+(p.desc||p.ds?'<div class="ds">'+esc(p.desc||p.ds)+'</div>':'')+'<div>'+gal+'</div><div class="dsc"><h3>Scope of Work</h3><p>'+esc(svc)+' — Concept, art direction, design, production.</p></div>';
  document.querySelectorAll('#pdi img[data-src]').forEach(img=>IO&&IO.observe(img));
  document.querySelectorAll('#pdi .di').forEach(di=>{const img=di.querySelector('img');const lq=di.querySelector('.lq');if(img&&lq){const done=()=>lq.style.opacity='0';if(img.complete)done();else img.onload=done;}});
  op('pd');
}
function cPD(){cl2('pd');}
function mVE(u){if(!u)return'';const yt=u.match(/(?:youtube\.com\/(?:watch\?[^\s#]*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);if(yt)return'<iframe src="https://www.youtube.com/embed/'+yt[1]+'?rel=0&playsinline=1" allow="autoplay;fullscreen" allowfullscreen loading="lazy"></iframe>';const vi=u.match(/vimeo\.com\/(\d+)/i);if(vi)return'<iframe src="https://player.vimeo.com/video/'+vi[1]+'" allow="autoplay;fullscreen" loading="lazy"></iframe>';return'<video src="'+u+'" controls playsinline></video>';}

/* Clients */
function rCl(){const g=document.getElementById('cG');if(!g)return;g.innerHTML=_CL.map(c=>'<div class="cl">'+(c.url||c.logoUrl?'<img src="'+(c.url||c.logoUrl)+'" alt="'+esc(c.name||c.nm||'')+'" loading="lazy">':c.name||c.nm||'')+'</div>').join('');}

/* Team */
function rTm(){const g=document.getElementById('tG');if(!g)return;g.innerHTML=_TM.length?_TM.map(m=>'<div class="tm"><div class="tm-ph">'+(m.photo||m.ph?'<img src="'+(m.photo||m.ph)+'" alt="'+esc(m.name||m.nm||'')+'" loading="lazy">':'<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a1a,#080808)"></div>')+'</div><b>'+esc(m.name||m.nm||'')+'</b><span>'+esc(m.position||m.pos||'')+'</span></div>').join(''):'<p style="color:rgba(255,255,255,.26);font-size:13px;letter-spacing:.08em">Team profiles coming soon.</p>';}

/* Admin login */
function chkA(){
  if(document.getElementById('aPw').value==='dopious2026'){
    cAL();op('aP');rAP();rACl();rATm();
  }else{
    document.getElementById('aErr').style.display='block';
  }
}

/* Marquee pause when off-screen */
const mqEl=document.getElementById('mqEl');
if(mqEl&&'IntersectionObserver' in window){
  new IntersectionObserver(en=>{document.documentElement.style.setProperty('--mqp',en[0].isIntersecting?'running':'paused');}).observe(mqEl);
}

/* Keyboard */
document.addEventListener('keydown',e=>{if(e.key==='Escape'){['pd','wP','hP','cP','sP','aLo','aP','mpn'].forEach(id=>{const el=document.getElementById(id);if(el&&el.classList.contains('on')){el.classList.remove('on');uk();}});}});

/* iOS video */
document.addEventListener('touchstart',()=>{document.querySelectorAll('video').forEach(v=>{v.setAttribute('playsinline','');v.muted=true;try{v.play().catch(()=>{});}catch(e){}});},{once:true,passive:true});

/* Boot */
initSubHeadAdmin();
initHero();
rSvc(); /* skeleton grid immediately */
document.getElementById('ld').classList.add('out');


/* ══════════════════════════════════════
   admin.js — โหลดเฉพาะเมื่อ admin login
   ลูกค้าทั่วไปไม่โหลดไฟล์นี้เลย!
══════════════════════════════════════ */

function sT(n,b){
  document.querySelectorAll('.apn').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.at').forEach(x=>x.classList.remove('on'));
  document.getElementById('t'+n)?.classList.add('on');
  b?.classList.add('on');
}
function pvC(v){
  if(!v)return;const b=document.getElementById('pPv');if(!b)return;
  const src=typeof iU==='function'?iU(v,400):(isDr(v)?dTh(v,400):v);
  b.innerHTML='<img src="'+src+'" onerror="this.parentElement.innerHTML=\'<span style=color:#ff2a14;font-size:11px>ไม่สามารถโหลดได้ — ตรวจสอบว่า Google Drive ตั้งเป็น Anyone with the link</span>\'">';
}
function clrF(){
  ['pN','pCl','pCU','pGU','pVU','pDs'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.querySelectorAll('#pSubBox input').forEach(i=>i.checked=false);
  const b=document.getElementById('pPv');if(b)b.innerHTML='<span>วาง Google Drive URL ด้านบนเพื่อดู preview</span>';
}
function stM(id,msg,tp){
  const el=document.getElementById(id);if(!el)return;
  el.textContent=msg;el.className='ast '+(tp||'ok');
  setTimeout(()=>el.className='ast',5000);
}


function initSubHeadAdmin(){
  const sv=document.getElementById('pSv');
  if(!sv)return;
  sv.innerHTML=Object.keys(SERVICE_OPTIONS).map(h=>'<option value="'+escAttr(h)+'">'+esc(h)+'</option>').join('');
  sv.onchange=function(){rSubHeadOptions();};
  rSubHeadOptions();
}
function rSubHeadOptions(){
  const box=document.getElementById('pSubBox');
  const sv=document.getElementById('pSv');
  if(!box||!sv)return;
  const head=normHead(sv.value);
  const opts=SERVICE_OPTIONS[head]||[];
  box.innerHTML=opts.map(s=>'<label class="sub-check"><input type="checkbox" value="'+escAttr(s)+'" onchange="limitSubHeads(this)"><span>'+esc(s)+'</span></label>').join('');
}
function getAdminSubHeads(){return Array.from(document.querySelectorAll('#pSubBox input:checked')).map(i=>i.value).slice(0,3);}
function limitSubHeads(input){
  const checked=Array.from(document.querySelectorAll('#pSubBox input:checked'));
  if(checked.length>3){input.checked=false;stM('apM','เลือก Sub head ได้สูงสุด 3 อัน','err');return;}
}

/* ── Project helpers ── */
function rAP(){
  const l=document.getElementById('pLs');if(!l)return;
  l.innerHTML=_P.length?_P.map((p,i)=>{
    const cu=typeof getCov==='function'?getCov(p):(p.covUrl||p.coverThumb||'');
    const th=typeof iU==='function'?iU(cu,100):cu;
    return'<div class="pr"><div class="pth"><img src="'+th+'" loading="lazy" onerror="this.style.opacity=0"></div><div class="pin"><b>'+esc(p.name||p.nm||'')+'</b><span>'+esc(normHead(p.service||p.svc||p.serviceHead||p.head))+' · '+esc(normSubHeads(p,normHead(p.service||p.svc||p.serviceHead||p.head)).join(' / '))+' · '+(p.year||p.yr||'')+'</span></div><button class="apb" onclick="oPD('+i+');cAP()">View</button><button class="apb d" onclick="delP(\''+p._id+'\')">Del</button></div>';
  }).join(''):'<p style="color:rgba(255,255,255,.26);font-size:13px;padding:12px 0">ยังไม่มีโปรเจกต์</p>';
}
async function savP(){
  if(!db){stM('apM','Firebase ยังไม่พร้อม','err');return;}
  const nm=document.getElementById('pN')?.value.trim();if(!nm){stM('apM','ใส่ชื่อโปรเจกต์ก่อน','err');return;}
  const cu=document.getElementById('pCU')?.value.trim();if(!cu){stM('apM','ใส่ Cover Image URL ก่อน','err');return;}
  if(getAdminSubHeads().length<1){stM('apM','เลือก Sub head อย่างน้อย 1 อัน','err');return;}
  const gRaw=document.getElementById('pGU')?.value||'';
  const gallery=gRaw.split('\n').map(s=>s.trim()).filter(s=>/^https?:\/\//i.test(s)).slice(0,8);
  const isDrFn=typeof isDr==='function'?isDr:(u=>/drive\.google\.com/i.test(String(u||'')));
  const dThFn=typeof dTh==='function'?dTh:((u,sz)=>{const m=String(u||'').match(/\/d\/([A-Za-z0-9_-]+)/);return m?'https://drive.google.com/thumbnail?id='+m[1]+'&sz=s'+(sz||600):u;});
  const proj={
    nm,name:nm,
    cl:document.getElementById('pCl')?.value.trim()||'Dopious+ Client',
    client:document.getElementById('pCl')?.value.trim()||'Dopious+ Client',
    credit:'Dopious+',cr:'Dopious+',
    svc:normHead(document.getElementById('pSv')?.value||''),
    service:normHead(document.getElementById('pSv')?.value||''),
    serviceHead:normHead(document.getElementById('pSv')?.value||''),
    subHeads:getAdminSubHeads(),
    sub:getAdminSubHeads().join(' / '),
    subHeadsString:getAdminSubHeads().join(' / '),
    yr:document.getElementById('pY')?.value||'2026',
    year:document.getElementById('pY')?.value||'2026',
    ds:document.getElementById('pDs')?.value.trim()||'',
    desc:document.getElementById('pDs')?.value.trim()||'',
    covUrl:cu,cover:cu,coverImage:cu,
    coverThumb:isDrFn(cu)?dThFn(cu,400):cu,
    lqip:isDrFn(cu)?dThFn(cu,20):'',
    gallery,galleryImages:gallery,
    vurl:document.getElementById('pVU')?.value.trim()||'',
    videoUrl:document.getElementById('pVU')?.value.trim()||'',
    ts:firebase.firestore.FieldValue.serverTimestamp()
  };
  try{
    stM('apM','กำลัง publish...','ok');
    await db.collection(COL).add(proj);
    await loadData();rAP();clrF();
    stM('apM','✓ Published: '+nm+' — ทุก device เห็นทันที','ok');
  }catch(e){stM('apM','Error: '+e.message,'err');}
}
async function delP(id){
  if(!db||!confirm('ลบโปรเจกต์นี้?'))return;
  try{await db.collection(COL).doc(id).delete();await loadData();rAP();stM('apM','ลบแล้ว','ok');}
  catch(e){stM('apM','Error: '+e.message,'err');}
}

/* ── Client helpers ── */
function rACl(){
  const l=document.getElementById('clLs');if(!l)return;
  l.innerHTML=_CL.length?_CL.map(c=>'<div class="pr"><div class="pth">'+(c.url||c.logoUrl?'<img src="'+(c.url||c.logoUrl)+'" loading="lazy" onerror="this.style.opacity=0">':'<div style="background:#222;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:9px;color:rgba(255,255,255,.3)">'+esc(c.name||c.nm||'')+'</div>')+'</div><div class="pin"><b>'+esc(c.name||c.nm||'')+'</b></div><button class="apb d" onclick="delCl(\''+c._id+'\')">Del</button></div>').join(''):'<p style="color:rgba(255,255,255,.26);font-size:13px;padding:12px 0">ยังไม่มี client</p>';
}
async function savCl(){
  if(!db){stM('clM','Firebase ยังไม่พร้อม','err');return;}
  const nm=document.getElementById('clN')?.value.trim();
  const url=document.getElementById('clU')?.value.trim();
  if(!nm&&!url){stM('clM','ใส่ชื่อหรือ URL','err');return;}
  try{
    await db.collection(COL_CL).add({nm,name:nm,url,logoUrl:url,ts:firebase.firestore.FieldValue.serverTimestamp()});
    document.getElementById('clN').value='';document.getElementById('clU').value='';
    await loadData();rACl();stM('clM','✓ Added','ok');
  }catch(e){stM('clM','Error: '+e.message,'err');}
}
async function delCl(id){
  if(!db)return;
  try{await db.collection(COL_CL).doc(id).delete();const cs=await db.collection(COL_CL).orderBy('ts','asc').get();_CL=cs.docs.map(d=>({_id:d.id,...d.data()}));rCl();rACl();}
  catch(e){}
}

/* ── Team helpers ── */
function rATm(){
  const l=document.getElementById('tLs');if(!l)return;
  l.innerHTML=_TM.length?_TM.map(m=>'<div class="pr"><div class="pth">'+(m.photo||m.ph?'<img src="'+(m.photo||m.ph)+'" loading="lazy" onerror="this.style.opacity=0">':'<div style="background:#222;width:100%;height:100%"></div>')+'</div><div class="pin"><b>'+esc(m.name||m.nm||'')+'</b><span>'+esc(m.position||m.pos||'')+'</span></div><button class="apb d" onclick="delTm(\''+m._id+'\')">Del</button></div>').join(''):'<p style="color:rgba(255,255,255,.26);font-size:13px;padding:12px 0">ยังไม่มีสมาชิก</p>';
}
async function savTm(){
  if(!db){stM('tM','Firebase ยังไม่พร้อม','err');return;}
  const nm=document.getElementById('tN')?.value.trim();if(!nm){stM('tM','ใส่ชื่อ','err');return;}
  try{
    await db.collection(COL_TM).add({nm,name:nm,pos:document.getElementById('tPs')?.value.trim()||'',position:document.getElementById('tPs')?.value.trim()||'',ph:document.getElementById('tPh')?.value.trim()||'',photo:document.getElementById('tPh')?.value.trim()||'',ts:firebase.firestore.FieldValue.serverTimestamp()});
    ['tN','tPs','tPh'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    const ts=await db.collection(COL_TM).orderBy('ts','asc').get();
    _TM=ts.docs.map(d=>({_id:d.id,...d.data()}));rTm();rATm();stM('tM','✓ Added','ok');
  }catch(e){stM('tM','Error: '+e.message,'err');}
}
async function delTm(id){
  if(!db)return;
  try{await db.collection(COL_TM).doc(id).delete();const ts=await db.collection(COL_TM).orderBy('ts','asc').get();_TM=ts.docs.map(d=>({_id:d.id,...d.data()}));rTm();rATm();}
  catch(e){}
}

/* Open admin panel after this script loaded */

