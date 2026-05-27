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
var _OLDPUB=null,_OLDPROJECTS=[],_OLDCLIENTS=[],_OLDTEAM=[],_CO={},_WEB={};
const DEFAULT_WHO_INTRO='Tarn and Mo, with 20 years of combined experience, know that every idea can become real. Many struggle to go from vision to final product, but we guide you every step. Our team turns your vision into a complete reality, start to finish.';

/* Called when Firebase SDK finishes loading */
window._fbBoot=function(){
  try{
    if(!firebase.apps.length)firebase.initializeApp(FB);
    db=firebase.firestore();
    db.enablePersistence({synchronizeTabs:true}).catch(()=>{});
    loadData();
  }catch(e){console.warn('FB:',e);loadData();}
};

/* Categories */
const CATS=[
  {cat:'SPACE DESIGN+',bg:'linear-gradient(90deg,rgba(0,18,10,.85),rgba(0,0,0,.2)),radial-gradient(ellipse at 62% 52%,rgba(255,255,255,.38),transparent 25%),linear-gradient(100deg,#06120c 0 25%,#223328 26% 70%,#0a0a0a 71% 100%)',svc:'Space Design+',subs:['Retail','Commercial','Residential','Office','Exhibition','Event','Kiosk','Pop-up Store','VM / Display','Window Display','Art Installation']},
  {cat:'SCULPTURE DESIGN+',bg:'linear-gradient(90deg,rgba(0,0,0,.78),rgba(255,255,255,.12)),radial-gradient(circle at 62% 52%,rgba(255,255,255,.62),transparent 20%),linear-gradient(100deg,#070707 0 45%,#3b3b3b 46% 100%)',svc:'Sculpture Design+',subs:['Sculpture','Art Installation','Public Art','Character Sculpture','Decorative Object','Landmark','3D Art Form','Spatial Art','Fabrication Concept']},
  {cat:'VISUAL PRODUCTION+',bg:'linear-gradient(90deg,rgba(0,68,92,.72),rgba(6,148,165,.25)),radial-gradient(circle at 55% 44%,#f4d36b 0 14%,transparent 15%),linear-gradient(100deg,#0b9aaa 0 44%,#077e8e 45% 100%)',svc:'Visual Production+',subs:['Storyboard','Animatic','Motion Graphic','2D Animation','3D Animation','2D Visualization','3D Visualization','3D Composite','Visual Effects','LED Screen','Product Animation','VDO Production','Photo Production','Ads Production','Post Production','Shot Direction','Brand Film']},
  {cat:'GRAPHIC DESIGN+',bg:'linear-gradient(90deg,rgba(30,0,0,.84),rgba(255,42,20,.28)),radial-gradient(circle at 70% 48%,rgba(255,42,20,.62),transparent 18%),linear-gradient(100deg,#140606 0 40%,#2b1010 41% 72%,#ff2a14 73% 100%)',svc:'Graphic Design+',subs:['Graphic','Illustration','Layout','Poster','Social Media','Print','Typography','Signage','Presentation','Visual System','Packaging Graphic','Label','Box Artwork','Infographic','Icon','Character Graphic','Pattern','Menu','Brochure','Catalogue','Key Art']},
  {cat:'BRANDING DESIGN+',bg:'linear-gradient(90deg,rgba(35,8,0,.88),rgba(80,18,40,.35)),radial-gradient(circle at 62% 50%,#9024a0 0 18%,transparent 19%),linear-gradient(100deg,#2a0c08 0 28%,#a11ca7 29% 58%,#6c6c6c 59% 100%)',svc:'Branding Design+',subs:['Brand Strategy','Brand Story','Logo','Visual Identity','Brand Guideline','Campaign Identity','Art Direction','Naming','Mood & Tone','Brand Communication']},
  {cat:'KEY VISUAL DESIGN+',bg:'linear-gradient(90deg,rgba(40,5,5,.82),rgba(0,0,0,.12)),linear-gradient(100deg,#24100c 0 18%,#5d0d0a 19% 22%,#111 23% 72%,#7a1d12 73% 100%)',svc:'Key Visual Design+',subs:['Key Visual','Campaign Visual','Ads','Art Direction','Advertising Direction','Promotion Visual','Social Media','Launch Campaign','Seasonal Campaign','Storyboard','Visual Storytelling']},
  {cat:'BUILD & INSTALL+',bg:'linear-gradient(90deg,rgba(10,10,10,.88),rgba(60,30,10,.4)),linear-gradient(100deg,#0a0a08 0 38%,#2a1e0e 39% 100%)',svc:'Build & Install+',subs:['Booth Production','Display Production','Event Production','Fabrication','On-site Installation','Site Supervision','Material Execution','Supplier Coordination','Quality Control','Final Delivery']},
  {cat:'PRODUCTION SOURCING+',bg:'linear-gradient(90deg,rgba(10,10,10,.9),rgba(80,50,20,.28)),linear-gradient(100deg,#070707 0 46%,#24180d 47% 100%)',svc:'Production Sourcing+',subs:['Product Sourcing','Supplier Coordination','Factory Follow-up','Sample Development','Material Sourcing','Production Control','Quality Check','Final Delivery','Premium Gift','Merchandise','Corporate Gift']},
  {cat:'INDUSTRIAL DESIGN+',bg:'linear-gradient(90deg,rgba(3,8,18,.9),rgba(0,0,0,.2)),linear-gradient(100deg,#0b0d13 0 30%,#1b2028 31% 62%,#bec4c8 63% 100%)',svc:'Industrial Design+',subs:['Product','Product Concept','CMF','Form','User Experience','Prototype','Product Visualization','Packaging Structure','Material','Manufacturing','Premium Product','Merchandise','Corporate Gift']},
  {cat:'CORPORATE DESIGN+',bg:'linear-gradient(90deg,rgba(18,18,18,.88),rgba(255,42,20,.12)),linear-gradient(100deg,#090909 0 45%,#222 46% 100%)',svc:'Corporate Design+',subs:['Corporate Identity','Brand System','Company Profile','Presentation','Stationery','Corporate Graphic','Visual System','Office Collateral','Business Document']},
  {cat:'DIGITAL DESIGN+',bg:'linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.15)),linear-gradient(100deg,#0b1020 0 38%,#242424 39% 100%)',svc:'Digital Design+',subs:['Website','UX-UI','Landing Page','Web Experience','Interface','Digital Branding','Mobile Experience','User Journey','Conversion','Portfolio Website','Service Website']},
  {cat:'FASHION DESIGN+',bg:'linear-gradient(90deg,rgba(180,0,0,.72),rgba(0,0,0,.1)),linear-gradient(100deg,#ff2115 0 36%,#111 37% 100%)',svc:'Fashion Design+',subs:['Fashion','Costume','Uniform','Styling Direction','Fashion Concept','Textile Direction','Character Styling','Campaign Styling','Showpiece']},
  {cat:'CREATIVE CONSULTATION+',bg:'linear-gradient(90deg,rgba(35,8,0,.86),rgba(255,42,20,.20)),linear-gradient(100deg,#0b0505 0 42%,#30100d 43% 100%)',svc:'Creative Consultation+',subs:['Creative Brief','Concept Direction','Design Direction','Budget Planning','Scope Planning','Material Consulting','Production Consulting','Supplier Consulting','Campaign Consulting','Brand Consulting','Space Consulting','Product Consulting']}
];
const S2C={};CATS.forEach((c,i)=>S2C[c.svc]=i);
const CAT_ALIAS={
  'space design':'Space Design+','sculpture design':'Sculpture Design+','2d 3d motion graphic design':'Visual Production+','photo video ads design':'Visual Production+','motion design':'Visual Production+','visual production':'Visual Production+','graphic design':'Graphic Design+','packaging design':'Graphic Design+','brand strategy corporate identity design':'Branding Design+','branding design':'Branding Design+','keyvisual creative ads design':'Key Visual Design+','key visual creative ads design':'Key Visual Design+','build installation':'Build & Install+','build install':'Build & Install+','production follow up':'Production Sourcing+','production follow-up':'Production Sourcing+','production sourcing':'Production Sourcing+','industrial design':'Industrial Design+','prototype 3d print service':'Industrial Design+','corporate design':'Corporate Design+','website ux ui design':'Digital Design+','website ux-ui design':'Digital Design+','digital design':'Digital Design+','fashion design':'Fashion Design+','marketing':'Branding Design+','marketing brand communication':'Branding Design+','creative consultation':'Creative Consultation+'
};


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

/* Legacy Admin compatibility: old website stored Projects/Clients/Team inside
   dopious_cms/published or dopious_cms/dopiousAdminProjects as value arrays. */
function normKey(v){return String(v||'').toLowerCase().replace(/[–—]/g,'-').replace(/\+/g,'').replace(/[^a-z0-9ก-๙]+/gi,' ').replace(/\s+/g,' ').trim();}
function normSvc(v){v=String(v||'').trim();if(!v)return'';const direct=CATS.find(c=>c.svc===v);if(direct)return direct.svc;const k=normKey(v);const ali=CAT_ALIAS[k];if(ali)return ali;const hit=CATS.find(c=>normKey(c.svc)===k||normKey(c.cat)===k);return hit?hit.svc:v;}
function metaForSvc(svc){const ns=normSvc(svc);return CATS.find(c=>c.svc===ns)||CATS[0];}
function matchSub(raw,svc){const meta=metaForSvc(svc),r=normKey(raw);if(!r||r==='creative')return meta.subs[0]||'General';return meta.subs.find(x=>normKey(x)===r)||meta.subs.find(x=>normKey(x).includes(r)||r.includes(normKey(x)))||meta.subs[0]||'General';}
function firstSub(p,svc){let arr=[];if(p.subHead)arr=[p.subHead];else if(p.sub)arr=[p.sub];else if(p.subhead)arr=[p.subhead];else if(Array.isArray(p.subHeads))arr=p.subHeads;else if(Array.isArray(p.subheads))arr=p.subheads;else if(Array.isArray(p.subServices))arr=p.subServices;else if(p.subHeadline)arr=String(p.subHeadline).split(/\s+\/\s+|,|\n|\|\|\|/);for(const x of arr){const m=matchSub(x,svc);if(m)return m;}return matchSub('',svc);}
function arrUrl(a){return (Array.isArray(a)?a:[]).map(x=>typeof x==='string'?x:(x&&(x.data||x.url||x.src)||'')).filter(x=>/^https?:\/\//i.test(String(x)));}
function legacyKey(p,i){return String(p&&((p.id||p._id||'')+'|'+(p.name||p.nm||'')+'|'+(p.coverImage||p.cover||p.covUrl||''))||i).toLowerCase().replace(/\s+/g,' ').trim();}
function normProject(p,i,src){
  p=p||{};
  const cover=p.covUrl||p.coverImage||p.cover||p.coverThumb||'';
  const gallery=arrUrl(p.galleryImages&&p.galleryImages.length?p.galleryImages:(p.gallery&&p.gallery.length?p.gallery:(p.images||[])));
  const name=p.name||p.nm||p.title||'Untitled';
  const svc=normSvc(p.service||p.svc||p.cat||p.category||p.head||p.projectHeadline||'');
  const sub=firstSub(p,svc);
  const caps=Array.isArray(p.galleryCaptions)?p.galleryCaptions:(Array.isArray(p.captions)?p.captions:[]);
  return Object.assign({},p,{
    _id:p._id||p.id||(src+'_'+i),_legacy:src==='old',
    nm:name,name,cl:p.client||p.cl||'',client:p.client||p.cl||'',
    cr:p.credit||p.cr||'Dopious+',credit:p.credit||p.cr||'Dopious+',
    svc,service:svc,sub,subHead:sub,subHeads:[sub],subHeadline:sub,yr:p.year||p.yr||'2026',year:p.year||p.yr||'2026',
    ds:p.desc||p.ds||'',desc:p.desc||p.ds||'',story:p.story||p.detail||p.fullDescription||'',
    location:p.location||'',role:p.role||p.scope||'',layout:p.layout||'',
    covUrl:cover,cover,coverImage:cover,coverThumb:p.coverThumb||(cover&&isDr(cover)?dTh(cover,400):cover),
    lqip:p.lqip||(cover&&isDr(cover)?dTh(cover,20):''),
    gallery,galleryImages:gallery,galleryCaptions:caps,
    cardMedia:p.cardMedia||p.cardMediaType||p.previewMedia||'image',cardMediaType:p.cardMedia||p.cardMediaType||p.previewMedia||'image',
    vurl:p.vurl||p.videoUrl||'',videoUrl:p.videoUrl||p.vurl||'',driveFolderUrl:p.driveFolderUrl||p.folderUrl||p.referenceUrl||''
  });
}
function mergeProjects(newer,old){
  const seen=new Set(),out=[];
  (newer||[]).concat(old||[]).forEach((p,i)=>{const k=legacyKey(p,i);if(seen.has(k))return;seen.add(k);out.push(p);});
  return out;
}
function normContact(raw){
  raw=raw||{};
  return {
    name:raw.name||raw.company||'Dopious Partnership Limited',
    office:raw.office||raw.location||'Bangkok Office / Thailand',
    phone:raw.phone||'+66 93-691-6592',
    email:raw.email||'info.dopiousth@gmail.com',
    line:raw.line||raw.lineUrl||raw.lineURL||'https://line.me/R/ti/p/@dopious',
    whatsapp:raw.whatsapp||raw.whatsappUrl||raw.whatsappURL||'https://wa.me/66936916592',
    facebook:raw.facebook||'',behance:raw.behance||'',linkedin:raw.linkedin||''
  };
}
function applyCompanyContact(){
  const c=normContact(_CO);
  const tel='tel:'+String(c.phone).replace(/[^+0-9]/g,'');
  document.querySelectorAll('a[href^="https://line.me"]').forEach(a=>a.href=c.line);
  document.querySelectorAll('a[href^="https://wa.me"]').forEach(a=>a.href=c.whatsapp);
  document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.href='mailto:'+c.email);
  document.querySelectorAll('a[href^="tel:"]').forEach(a=>a.href=tel);
  document.querySelectorAll('.of').forEach(of=>{
    const t=of.textContent.toLowerCase();
    if(t.includes('office'))of.innerHTML='<b>Office</b><br>'+esc(c.office);
    if(t.includes('phone'))of.innerHTML='<b>Phone</b><br>'+esc(c.phone);
    if(t.includes('email'))of.innerHTML='<b>Email</b><br>'+esc(c.email);
  });
}
async function getDocValue(id){
  try{const s=await db.collection(COL).doc(id).get();return s.exists?s.data():null;}catch(e){return null;}
}
function docVal(d){return d&&d.value!==undefined?d.value:null;}

/* Load from Firebase */
async function loadData(){
  if(!db)return;
  try{
    const [ps,cs,ts,pubDoc,oldPDoc,oldCDoc,oldTDoc,oldCoDoc,oldWDoc]=await Promise.all([
      db.collection(COL).orderBy('ts','desc').get().catch(()=>({docs:[]})),
      db.collection(COL_CL).orderBy('ts','asc').get().catch(()=>({docs:[]})),
      db.collection(COL_TM).orderBy('ts','asc').get().catch(()=>({docs:[]})),
      getDocValue('published'),
      getDocValue('dopiousAdminProjects'),
      getDocValue('dopiousClients'),
      getDocValue('dopiousAdminTeam'),
      getDocValue('dopiousAdminCompany'),
      getDocValue('dopiousAdminWebsite')
    ]);
    const pub=pubDoc||{};_OLDPUB=pub;
    const oldProjects=Array.isArray(pub.projects)?pub.projects:(Array.isArray(docVal(oldPDoc))?docVal(oldPDoc):[]);
    const oldClients=Array.isArray(pub.clients)?pub.clients:(Array.isArray(docVal(oldCDoc))?docVal(oldCDoc):[]);
    const oldTeam=Array.isArray(pub.team)?pub.team:(Array.isArray(docVal(oldTDoc))?docVal(oldTDoc):[]);
    _CO=pub.company||docVal(oldCoDoc)||_CO||{};
    _WEB=pub.website||docVal(oldWDoc)||_WEB||{};
    const newProjects=ps.docs.filter(d=>d.id!=='published').map((d,i)=>normProject({_id:d.id,...d.data()},i,'new'));
    _OLDPROJECTS=oldProjects.map((p,i)=>normProject(p,i,'old'));
    _P=mergeProjects(newProjects,_OLDPROJECTS);
    const newClients=cs.docs.map(d=>({_id:d.id,...d.data()}));
    _OLDCLIENTS=(oldClients||[]).map((c,i)=>({_id:c._id||c.id||('old_client_'+i),_legacy:true,nm:c.name||c.nm||'',name:c.name||c.nm||'',url:c.url||c.logoUrl||c.logo||'',logoUrl:c.logoUrl||c.url||c.logo||''}));
    _CL=mergeClients(newClients,_OLDCLIENTS);
    const newTeam=ts.docs.map(d=>({_id:d.id,...d.data()}));
    _OLDTEAM=(oldTeam||[]).map((m,i)=>({_id:m._id||m.id||('old_team_'+i),_legacy:true,nm:m.name||m.nm||'',name:m.name||m.nm||'',pos:m.position||m.pos||'',position:m.position||m.pos||'',ph:m.photo||m.ph||'',photo:m.photo||m.ph||'',details:m.details||m.bio||m.desc||m.description||''}));
    _TM=mergePeople(newTeam,_OLDTEAM);
    rSvc();rCl();applyCompanyContact();applyWhoWeAreText();updAdminStatus();
  }catch(e){
    console.warn('loadData:',e);
    document.getElementById('sCt').textContent='Error loading';
  }
}
function mergeClients(a,b){const seen=new Set(),out=[];(a||[]).concat(b||[]).forEach((c,i)=>{const k=String((c.name||c.nm||'')+'|'+(c.url||c.logoUrl||'')).toLowerCase();if(seen.has(k))return;seen.add(k);out.push(c);});return out;}
function mergePeople(a,b){const seen=new Set(),out=[];(a||[]).concat(b||[]).forEach((m,i)=>{const k=String((m.name||m.nm||'')+'|'+(m.position||m.pos||'')).toLowerCase();if(seen.has(k))return;seen.add(k);out.push(m);});return out;}
function updAdminStatus(){const el=document.getElementById('apSt');if(el)el.textContent='Live '+_P.length+' works'+(_OLDPROJECTS.length?' / old admin '+_OLDPROJECTS.length:'');}


function isVideoUrl(u){return /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(u||''));}
function ytId(u){const m=String(u||'').match(/(?:youtube\.com\/(?:watch\?[^\s#]*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);return m?m[1]:'';}
function mediaThumb(u,fallback){const y=ytId(u);if(y)return 'https://img.youtube.com/vi/'+y+'/hqdefault.jpg';if(isDr(u))return dTh(u,600);return fallback||u||'';}
function cardMediaUrl(p){return (String(p.cardMedia||p.cardMediaType||'image')==='video'&&(p.videoUrl||p.vurl))?(p.videoUrl||p.vurl):getCov(p);}
function mediaLayer(s,active){const u=s.media||'';if(s.mediaType==='video'&&isVideoUrl(u)){return '<video class="card-video" src="'+esc(u)+'" muted loop playsinline preload="metadata" '+(active?'autoplay':'')+'></video>';}const img=s.mediaType==='video'?mediaThumb(u,s.img):s.img;return (s.lq?'<div class="lq" style="background-image:url(\''+s.lq+'\')"></div>':'')+(img?'<img '+(active?'src':'data-src')+'="'+iU(img,active?600:400)+'" alt="'+esc(s.ti)+'" loading="'+(active?'eager':'lazy')+'" decoding="async">':'');}
function grpKey(svc,sub){return normKey(svc)+'|'+normKey(sub||'General');}

/* Service grid */
var _ac={},_tm2={};
function rSvc(){
  const g=document.getElementById('sG');if(!g)return;
  Object.keys(_tm2).forEach(k=>clearInterval(_tm2[k]));_tm2={};
  const map={};
  _P.forEach((p,ai)=>{const svc=normSvc(p.service||p.svc||'');if(!S2C.hasOwnProperty(svc))return;const sub=p.subHead||p.sub||firstSub(p,svc)||'General';const k=grpKey(svc,sub);if(!map[k])map[k]={svc,sub,items:[],idx:S2C[svc]};map[k].items.push({p,ai});});
  const groups=Object.values(map).sort((a,b)=>a.idx-b.idx||String(a.sub).localeCompare(String(b.sub)));
  const html=groups.map((gr,ci)=>{
    const cat=CATS[gr.idx]||CATS[0];
    const sls=gr.items.map(({p,ai})=>{const cu=getCov(p);const mu=cardMediaUrl(p);const mt=(String(p.cardMedia||p.cardMediaType||'image')==='video'&&(p.videoUrl||p.vurl))?'video':'image';return{ai,ti:p.name||p.nm||'Untitled',img:cu,media:mu,mediaType:mt,lq:p.lqip||(cu&&isDr(cu)?dTh(cu,20):''),desc:p.desc||p.ds||''};});
    const cnt=sls.length;
    const ctr=cnt>1?'<div class="sct2"><button class="snv" onclick="nC(event,'+ci+',-1)">‹</button><span class="scn">1/'+cnt+'</span><button class="snv" onclick="nC(event,'+ci+',1)">›</button></div>':'';
    const layers=sls.map((s,li)=>'<div class="sl'+(li===0?' on':'')+'" data-li="'+li+'">'+mediaLayer(s,li===0)+'</div>').join('');
    return'<article class="sc" id="sc'+ci+'" data-ci="'+ci+'" data-sl=\''+JSON.stringify(sls.map(s=>({ai:s.ai,ti:s.ti})))+'\'>'+layers+'<div class="sov"></div><div class="sp"><div class="snm">'+esc(sls[0].ti)+'</div>'+ctr+'</div><div class="slb"><span class="head">'+esc(gr.svc)+'</span><em>'+esc(gr.sub)+'</em></div><button class="stp" aria-label="View" onclick="oCd('+ci+')"></button></article>';
  }).join('');
  g.innerHTML=html||CATS.slice(0,8).map(c=>'<article class="sc sk"><div class="sl on" style="background:'+c.bg+'"></div><div class="sov"></div><div class="slb"><span style="opacity:.35">'+c.cat.split('/')[0].trim()+'</span></div></article>').join('');
  g.querySelectorAll('img[data-src]').forEach(img=>IO&&IO.observe(img));
  g.querySelectorAll('.sc[id]').forEach(card=>{const ci=card.id.replace('sc','');_ac[ci]=0;const sl=JSON.parse(card.getAttribute('data-sl')||'[]');if(sl.length>1)_tm2[ci]=setInterval(()=>stC(ci,1),4200);});
  const el=document.getElementById('sCt');if(el){const t=_P.length;el.textContent=t?(t+' Project'+(t>1?'s':'')+' — Live'):'Upload projects from Admin';}
}
function stC(ci,dir){
  const card=document.getElementById('sc'+ci);if(!card)return;
  const sl=JSON.parse(card.getAttribute('data-sl')||'[]');if(!sl.length)return;
  const nx=((_ac[ci]||0)+dir+sl.length)%sl.length;_ac[ci]=nx;
  card.querySelectorAll('.sl').forEach((l,i)=>{l.classList.toggle('on',i===nx);const v=l.querySelector('video');if(v){try{i===nx?v.play().catch(()=>{}):v.pause()}catch(e){}}});
  const nl=card.querySelector('.sl[data-li="'+nx+'"]');if(nl){const img=nl.querySelector('img[data-src]');if(img)ldI(img,img.dataset.src);}
  const ne=card.querySelector('.snm');if(ne)ne.textContent=sl[nx].ti||'';
  const nc=card.querySelector('.scn');if(nc)nc.textContent=(nx+1)+'/'+sl.length;
}
function nC(e,ci,d){e.stopPropagation();clearInterval(_tm2[ci]);stC(ci,d);const card=document.getElementById('sc'+ci);if(card){const sl=JSON.parse(card.getAttribute('data-sl')||'[]');if(sl.length>1)_tm2[ci]=setInterval(()=>stC(ci,1),4200);}}
function oCd(ci){const card=document.getElementById('sc'+ci);if(!card)return;const sl=JSON.parse(card.getAttribute('data-sl')||'[]');const s=sl[_ac[ci]||0]||sl[0];if(s&&s.ai!==undefined)oPD(s.ai);}

/* Project detail */
function oPD(ai){
  const p=_P[ai];if(!p)return;
  const gls=p.gallery||p.galleryImages||[];const caps=p.galleryCaptions||[];const vE=mVE(p.vurl||p.videoUrl||'');const covFull=getCovFull(p);
  let gal='';
  if(covFull){const lqS=isDr(covFull)?dTh(covFull,20):'';gal+='<figure class="df"><div class="di"><div class="lq" style="background-image:url(\''+lqS+'\')"></div><img src="'+iU(covFull,1100)+'" alt="'+esc(p.name||p.nm||'')+'" loading="eager"></div></figure>';}
  gls.forEach((url,i)=>{const cap=caps[i]||'';gal+='<figure class="df"><div class="di"><div class="lq" style="background-image:url(\''+( isDr(url)?dTh(url,20):'')+'\')"></div><img '+(i<1?'src':'data-src')+'="'+iU(url,1100)+'" alt="" loading="'+(i<1?'eager':'lazy')+'"></div>'+(cap?'<figcaption>'+esc(cap)+'</figcaption>':'')+'</figure>';});
  if(vE)gal+='<div class="dv">'+vE+'</div>';
  if(!gal){const bg=CATS.find(c=>c.svc===(p.service||p.svc));gal='<div class="di" style="background:'+(bg?bg.bg:'#111')+'"></div>';}
  const svc=normSvc(p.service||p.svc||'');const sub=p.subHead||p.sub||firstSub(p,svc)||'';
  const story=p.story||p.detail||p.fullDescription||p.desc||p.ds||'';
  document.getElementById('pdi').innerHTML='<div class="dh"><div class="dc">'+esc(svc)+(sub?' / '+esc(sub):'')+'</div><div class="dn">'+esc(p.name||p.nm||'')+'</div><div class="dm"><div class="db"><small>Client</small><b>'+esc(p.client||p.cl||'-')+'</b></div><div class="db"><small>Credit</small><b>'+esc(p.credit||p.cr||'Dopious+')+'</b></div><div class="db"><small>Year</small><b>'+esc(p.year||p.yr||'2026')+'</b></div></div></div>'+(p.desc||p.ds?'<div class="ds">'+esc(p.desc||p.ds)+'</div>':'')+'<div>'+gal+'</div><div class="dsc"><h3>Project Detail</h3><p>'+esc(story||svc+' — Concept, art direction, design, production.')+'</p></div>';
  document.querySelectorAll('#pdi img[data-src]').forEach(img=>IO&&IO.observe(img));
  document.querySelectorAll('#pdi .di').forEach(di=>{const img=di.querySelector('img');const lq=di.querySelector('.lq');if(img&&lq){const done=()=>lq.style.opacity='0';if(img.complete)done();else img.onload=done;}});
  op('pd');
}
function cPD(){cl2('pd');}
function mVE(u){if(!u)return'';const yt=u.match(/(?:youtube\.com\/(?:watch\?[^\s#]*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);if(yt)return'<iframe src="https://www.youtube.com/embed/'+yt[1]+'?rel=0&playsinline=1" allow="autoplay;fullscreen" allowfullscreen loading="lazy"></iframe>';const vi=u.match(/vimeo\.com\/(\d+)/i);if(vi)return'<iframe src="https://player.vimeo.com/video/'+vi[1]+'" allow="autoplay;fullscreen" loading="lazy"></iframe>';return'<video src="'+u+'" controls playsinline></video>';}

/* Clients */
function rCl(){const g=document.getElementById('cG');if(!g)return;g.innerHTML=_CL.map(c=>'<div class="cl">'+(c.url||c.logoUrl?'<img src="'+(c.url||c.logoUrl)+'" alt="'+esc(c.name||c.nm||'')+'" loading="lazy">':c.name||c.nm||'')+'</div>').join('');}

/* Team */
function rTm(){const g=document.getElementById('tG');if(!g)return;g.innerHTML=_TM.length?_TM.map(m=>'<div class="tm"><div class="tm-ph">'+(m.photo||m.ph?'<img src="'+(m.photo||m.ph)+'" alt="'+esc(m.name||m.nm||'')+'" loading="lazy">':'<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a1a,#080808)"></div>')+'</div><b>'+esc(m.name||m.nm||'')+'</b><span>'+esc(m.position||m.pos||'')+'</span>'+((m.details||m.bio||m.desc)?'<p>'+esc(m.details||m.bio||m.desc)+'</p>':'')+'</div>').join(''):'<p style="color:rgba(255,255,255,.26);font-size:13px;letter-spacing:.08em">Team profiles coming soon.</p>';}


function applyWhoWeAreText(){
  const txt=(_WEB&&(_WEB.whoWeAreIntro||_WEB.whoIntro||_WEB.whoWeAreText||_WEB.aboutText||_WEB.career))||DEFAULT_WHO_INTRO;
  const el=document.querySelector('#wP .who-hero p');
  if(el)el.textContent=txt;
}
applyWhoWeAreText();

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
initHero();
rSvc(); /* skeleton grid immediately */
(function(){var l=document.getElementById('ld');if(l){l.classList.add('out');setTimeout(function(){try{l.remove()}catch(e){}},300);}})();


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
  const b=document.getElementById('pPv');if(b)b.innerHTML='<span>วาง Google Drive URL ด้านบนเพื่อดู preview</span>';
}
function stM(id,msg,tp){
  const el=document.getElementById(id);if(!el)return;
  el.textContent=msg;el.className='ast '+(tp||'ok');
  setTimeout(()=>el.className='ast',5000);
}

/* ── Project helpers ── */
function rAP(){
  const l=document.getElementById('pLs');if(!l)return;
  l.innerHTML=_P.length?_P.map((p,i)=>{
    const cu=typeof getCov==='function'?getCov(p):(p.covUrl||p.coverThumb||'');
    const th=typeof iU==='function'?iU(cu,100):cu;
    return'<div class="pr"><div class="pth"><img src="'+th+'" loading="lazy" onerror="this.style.opacity=0"></div><div class="pin"><b>'+esc(p.name||p.nm||'')+'</b><span>'+esc(p.service||p.svc||'')+' · '+(p.year||p.yr||'')+'</span></div><button class="apb" onclick="oPD('+i+');cAP()">View</button>'+(p._legacy?'<button class="apb" disabled title="Loaded from old Admin published data">Old</button>':'<button class="apb d" onclick="delP(\''+p._id+'\')">Del</button>')+'</div>';
  }).join(''):'<p style="color:rgba(255,255,255,.26);font-size:13px;padding:12px 0">ยังไม่มีโปรเจกต์</p>';
}
async function savP(){
  if(!db){stM('apM','Firebase ยังไม่พร้อม','err');return;}
  const nm=document.getElementById('pN')?.value.trim();if(!nm){stM('apM','ใส่ชื่อโปรเจกต์ก่อน','err');return;}
  const cu=document.getElementById('pCU')?.value.trim();if(!cu){stM('apM','ใส่ Cover Image URL ก่อน','err');return;}
  const gRaw=document.getElementById('pGU')?.value||'';
  const gallery=gRaw.split('\n').map(s=>s.trim()).filter(s=>/^https?:\/\//i.test(s)).slice(0,8);
  const isDrFn=typeof isDr==='function'?isDr:(u=>/drive\.google\.com/i.test(String(u||'')));
  const dThFn=typeof dTh==='function'?dTh:((u,sz)=>{const m=String(u||'').match(/\/d\/([A-Za-z0-9_-]+)/);return m?'https://drive.google.com/thumbnail?id='+m[1]+'&sz=s'+(sz||600):u;});
  const proj={
    nm,name:nm,
    cl:document.getElementById('pCl')?.value.trim()||'Dopious+ Client',
    client:document.getElementById('pCl')?.value.trim()||'Dopious+ Client',
    credit:'Dopious+',cr:'Dopious+',
    svc:document.getElementById('pSv')?.value||'',
    service:document.getElementById('pSv')?.value||'',
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
async function importOldData(){
  if(!db){stM('apM','Firebase ยังไม่พร้อม','err');return;}
  if(!_OLDPROJECTS.length&&!_OLDCLIENTS.length&&!_OLDTEAM.length){stM('apM','ยังไม่เจอข้อมูลจาก Admin เก่า','err');return;}
  if(!confirm('Import ข้อมูลจาก Admin เก่าเข้า collection ใหม่? ระบบจะกันข้อมูลซ้ำให้อัตโนมัติ'))return;
  try{
    const batch=db.batch();let n=0;
    _OLDPROJECTS.forEach((p,i)=>{
      const id='legacy_project_'+String(p.id||p._id||p.name||i).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,80)+'_'+i;
      const q=Object.assign({},p,{_legacy:false,legacySource:'oldAdmin',legacyId:p.id||p._id||id,ts:firebase.firestore.FieldValue.serverTimestamp()});
      delete q._id;batch.set(db.collection(COL).doc(id),q,{merge:true});n++;
    });
    _OLDCLIENTS.forEach((c,i)=>{const id='legacy_client_'+String(c.name||c.nm||i).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,80)+'_'+i;const q=Object.assign({},c,{legacySource:'oldAdmin',ts:firebase.firestore.FieldValue.serverTimestamp()});delete q._id;delete q._legacy;batch.set(db.collection(COL_CL).doc(id),q,{merge:true});n++;});
    _OLDTEAM.forEach((m,i)=>{const id='legacy_team_'+String(m.name||m.nm||i).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,80)+'_'+i;const q=Object.assign({},m,{legacySource:'oldAdmin',ts:firebase.firestore.FieldValue.serverTimestamp()});delete q._id;delete q._legacy;batch.set(db.collection(COL_TM).doc(id),q,{merge:true});n++;});
    await batch.commit();await loadData();rAP();rACl();rATm();stM('apM','✓ Imported '+n+' รายการจาก Admin เก่า','ok');
  }catch(e){stM('apM','Import error: '+e.message,'err');}
}

/* ── Client helpers ── */
function rACl(){
  const l=document.getElementById('clLs');if(!l)return;
  l.innerHTML=_CL.length?_CL.map(c=>'<div class="pr"><div class="pth">'+(c.url||c.logoUrl?'<img src="'+(c.url||c.logoUrl)+'" loading="lazy" onerror="this.style.opacity=0">':'<div style="background:#222;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:9px;color:rgba(255,255,255,.3)">'+esc(c.name||c.nm||'')+'</div>')+'</div><div class="pin"><b>'+esc(c.name||c.nm||'')+'</b></div>'+(c._legacy?'<button class="apb" disabled>Old</button>':'<button class="apb d" onclick="delCl(\''+c._id+'\')">Del</button>')+'</div>').join(''):'<p style="color:rgba(255,255,255,.26);font-size:13px;padding:12px 0">ยังไม่มี client</p>';
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
  l.innerHTML=_TM.length?_TM.map(m=>'<div class="pr"><div class="pth">'+(m.photo||m.ph?'<img src="'+(m.photo||m.ph)+'" loading="lazy" onerror="this.style.opacity=0">':'<div style="background:#222;width:100%;height:100%"></div>')+'</div><div class="pin"><b>'+esc(m.name||m.nm||'')+'</b><span>'+esc(m.position||m.pos||'')+'</span></div>'+(m._legacy?'<button class="apb" disabled>Old</button>':'<button class="apb d" onclick="delTm(\''+m._id+'\')">Del</button>')+'</div>').join(''):'<p style="color:rgba(255,255,255,.26);font-size:13px;padding:12px 0">ยังไม่มีสมาชิก</p>';
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


/* FAST PATCH: never leave first screen blocked */
setTimeout(function(){var l=document.getElementById('ld');if(l){l.classList.add('out');setTimeout(function(){try{l.remove()}catch(e){}},300);}},900);



/* ════════════════════════════════════════════════════════════════
   FULL LEGACY ADMIN BRIDGE — carries old Admin links/text/settings
   - Reads Firestore docs and same-domain localStorage keys from old Admin
   - Accepts old + new admin passwords
   - Keeps public page fast: only applies lightweight settings
════════════════════════════════════════════════════════════════ */
const LEGACY_PASSWORDS=['dopious123','dopious2026'];
const LEGACY_KEYS=['dopiousAdminProjects','dopiousClients','dopiousClientSection','dopiousClientSectionSettings','dopiousAdminTeam','dopiousAdminHome','dopiousAdminLogos','dopiousAdminCompany','dopiousAdminWebsite','dopiousTheme','dopiousSEO','dopiousAdminSubtopics','dopiousCustomServiceCategories','dopiousHiddenCategories','dopiousMediaLibrary','dopiousPublished'];
var _OLDSETTINGS={};
var _LEGACYDOCS={};
var _CLIENT_SECTION={};
var _SEO={};
var _THEME={};
var _WEBSITE={};
var _HOME=[];
var _CUSTOM_CATS=[];
var _SUBTOPICS=[];
var _MEDIA_LIBRARY=[];

function safeJSON(v,f){try{return JSON.parse(v)}catch(e){return f}}
function lsGet(k,f){try{const v=localStorage.getItem(k);return v==null?f:safeJSON(v,f)}catch(e){return f}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function isMediaString(v){v=String(v||'');return /^https?:\/\//i.test(v)||/^data:image\//i.test(v)}
function arrMedia(a){
  return (Array.isArray(a)?a:[]).map(x=>{
    if(typeof x==='string')return x;
    if(!x)return'';
    return x.data||x.url||x.src||x.image||x.cover||x.thumb||'';
  }).filter(isMediaString);
}
function arrMediaObjects(a,caps){
  caps=Array.isArray(caps)?caps:[];
  return (Array.isArray(a)?a:[]).map((x,i)=>{
    if(typeof x==='string')return {data:x,caption:caps[i]||'',name:'image'};
    if(!x)return null;
    return {data:x.data||x.url||x.src||x.image||x.cover||x.thumb||'',caption:x.caption||caps[i]||'',name:x.name||'image'};
  }).filter(o=>o&&isMediaString(o.data));
}
function getImgKeyData(p){
  if(!p||!p.imgKey)return null;
  try{return JSON.parse(localStorage.getItem(p.imgKey)||'null')}catch(e){return null}
}
function firstMedia(){for(let i=0;i<arguments.length;i++){if(isMediaString(arguments[i]))return arguments[i];}return'';}
function normSvc(v){
  v=String(v||'').trim();
  if(!v)return'';
  const low=v.toLowerCase().replace(/[^a-z0-9]/g,'');
  const hit=CATS.find(c=>c.svc.toLowerCase().replace(/[^a-z0-9]/g,'')===low||c.cat.toLowerCase().replace(/[^a-z0-9]/g,'')===low||c.svc.toLowerCase().includes(low)||low.includes(c.svc.toLowerCase().replace(/[^a-z0-9]/g,'')));
  return hit?hit.svc:v;
}
function legacyKey(p,i){
  const d=getImgKeyData(p)||{};
  return String((p&&((p.id||p._id||p.legacyId||'')+'|'+(p.name||p.nm||p.title||'')+'|'+(p.coverImage||p.cover||p.covUrl||p.coverThumb||p.cardThumb||d.cover||d.thumb||'')))||i).toLowerCase().replace(/\s+/g,' ').trim();
}
function normProject(p,i,src){
  p=p||{};
  const imgData=getImgKeyData(p)||{};
  const caps=Array.isArray(p.galleryCaptions)?p.galleryCaptions:[];
  const imgObjects = arrMediaObjects(p.galleryImages&&p.galleryImages.length?p.galleryImages:(p.gallery&&p.gallery.length?p.gallery:(p.images&&p.images.length?p.images:(imgData.images||[]))),caps);
  const gallery = imgObjects.map(o=>o.data);
  const cover=firstMedia(p.covUrl,p.coverImage,p.cover,p.coverThumb,p.cardThumb,imgData.cover,imgData.thumb,gallery[0]);
  const vids = Array.isArray(imgData.videos)?imgData.videos.map(v=>typeof v==='string'?v:(v&&v.url)||'').filter(Boolean):[];
  const video = p.videoUrl||p.vurl||p.video||vids[0]||'';
  const name=p.name||p.nm||p.title||'Untitled';
  const svc=normSvc(p.service||p.svc||p.cat||p.category||'');
  const out=Object.assign({},p,{
    _id:p._id||p.id||(src+'_'+i), _legacy:src==='old', legacySource:src==='old'?'oldAdmin':(p.legacySource||''),
    id:p.id||p._id||(src+'_'+i), nm:name, name:name,
    cl:p.client||p.cl||'', client:p.client||p.cl||'',
    credit:p.credit||p.cr||'', cr:p.credit||p.cr||'',
    svc:svc, service:svc, sub:p.sub||p.subService||'',
    headline:p.headline||p.projectHeadline||p.head||'', subHeadline:p.subHeadline||p.subhead||p.subHead||p.projectSubHeadline||'',
    yr:p.year||p.yr||'2026', year:p.year||p.yr||'2026',
    ds:p.desc||p.ds||p.description||'', desc:p.desc||p.ds||p.description||'',
    layout:p.layout||'stack', previewType:p.previewType||p.cardPreviewType||'image',
    covUrl:cover, cover:cover, coverImage:cover, coverThumb:p.coverThumb||(cover&&isDr(cover)?dTh(cover,400):cover), cardThumb:p.cardThumb||p.coverThumb||cover,
    lqip:p.lqip||(cover&&isDr(cover)?dTh(cover,20):''),
    gallery:gallery, galleryImages:gallery, galleryCaptions:imgObjects.map((o,j)=>o.caption||caps[j]||''), galleryObjects:imgObjects,
    galleryCount:gallery.length, vurl:video, videoUrl:video, driveFolderUrl:p.driveFolderUrl||p.driveFolder||'', imgKey:p.imgKey||''
  });
  return out;
}
function mergeProjects(newer,old){const seen=new Set(),out=[];(newer||[]).concat(old||[]).forEach((p,i)=>{const k=legacyKey(p,i);if(!k||seen.has(k))return;seen.add(k);out.push(p)});return out;}
function mergeClients(a,b){const seen=new Set(),out=[];(a||[]).concat(b||[]).forEach((c,i)=>{const k=String((c.name||c.nm||'')+'|'+(c.url||c.logoUrl||c.logo||'')).toLowerCase();if(seen.has(k))return;seen.add(k);out.push(c)});return out;}
function mergePeople(a,b){const seen=new Set(),out=[];(a||[]).concat(b||[]).forEach((m,i)=>{const k=String((m.name||m.nm||'')+'|'+(m.position||m.pos||'')+'|'+(m.photo||m.ph||'')).toLowerCase();if(seen.has(k))return;seen.add(k);out.push(m)});return out;}
function normContact(raw){
  raw=raw||{};return {
    name:raw.name||raw.company||'Dopious Partnership Limited', office:raw.office||raw.location||'Bangkok Office / Thailand', phone:raw.phone||'+66 93-691-6592', email:raw.email||'info.dopiousth@gmail.com',
    line:raw.line||raw.lineUrl||raw.lineURL||'https://line.me/R/ti/p/@dopious', whatsapp:raw.whatsapp||raw.whatsappUrl||raw.whatsappURL||'https://wa.me/66936916592', facebook:raw.facebook||'', behance:raw.behance||'', linkedin:raw.linkedin||''
  };
}
function docVal(d){return d&&d.value!==undefined?d.value:d;}
async function getDocValue(id){try{const s=await db.collection(COL).doc(id).get();return s.exists?s.data():null}catch(e){return null}}
async function loadLegacyDocs(){
  const out={};
  if(!db)return out;
  const docs=await Promise.all(LEGACY_KEYS.filter(k=>k!=='dopiousPublished').map(k=>getDocValue(k).then(v=>[k,docVal(v)])));
  docs.forEach(([k,v])=>{if(v!==null&&v!==undefined)out[k]=v});
  return out;
}
function mergeLegacySources(pub,docs){
  const local={};LEGACY_KEYS.forEach(k=>{const v=lsGet(k,undefined);if(v!==undefined)local[k]=v});
  const p=pub||{};
  const all=Object.assign({},docs||{},local||{});
  all.dopiousAdminProjects=p.projects||all.dopiousAdminProjects||[];
  all.dopiousClients=p.clients||all.dopiousClients||[];
  all.dopiousClientSection=p.clientSection||all.dopiousClientSection||all.dopiousClientSectionSettings||{};
  all.dopiousAdminTeam=p.team||all.dopiousAdminTeam||[];
  all.dopiousAdminHome=p.home||all.dopiousAdminHome||[];
  all.dopiousAdminLogos=p.logos||all.dopiousAdminLogos||[];
  all.dopiousAdminCompany=p.company||all.dopiousAdminCompany||{};
  all.dopiousAdminWebsite=p.website||all.dopiousAdminWebsite||{};
  all.dopiousTheme=p.theme||all.dopiousTheme||{};
  all.dopiousSEO=p.seo||all.dopiousSEO||{};
  return all;
}
function applyThemeFromLegacy(){
  const t=_THEME||{};
  const r=t.accent||t.accentColor||t.primary||t.primaryColor||t.themeAccentColor||t.r;
  const bg=t.bg||t.background||t.backgroundColor||t.themeBgColor;
  const text=t.text||t.textColor||t.themeTextColor;
  const root=document.documentElement;
  if(r)root.style.setProperty('--r',r);
  if(bg){root.style.setProperty('--bg',bg);document.body.style.background=bg;}
  if(text)document.body.style.color=text;
}
function setMeta(name,content,prop){if(!content)return;let sel=prop?'meta[property="'+name+'"]':'meta[name="'+name+'"]';let el=document.querySelector(sel);if(!el){el=document.createElement('meta');if(prop)el.setAttribute('property',name);else el.setAttribute('name',name);document.head.appendChild(el)}el.setAttribute('content',content)}
function applySEOFromLegacy(){
  const s=_SEO||{};
  if(s.title)document.title=s.title;
  setMeta('description',s.desc||s.description||'');setMeta('keywords',s.keywords||'');
  setMeta('og:title',s.title||'',true);setMeta('og:description',s.desc||s.description||'',true);setMeta('og:image',s.ogImage||'',true);
  setMeta('twitter:title',s.title||'');setMeta('twitter:description',s.desc||s.description||'');setMeta('twitter:image',s.ogImage||'');
  if(s.canonical){let l=document.querySelector('link[rel="canonical"]');if(!l){l=document.createElement('link');l.rel='canonical';document.head.appendChild(l)}l.href=s.canonical;}
}
function applyCompanyContact(){
  const c=normContact(_CO);
  const tel='tel:'+String(c.phone).replace(/[^+0-9]/g,'');
  document.querySelectorAll('a[href^="https://line.me"],button[onclick*="line.me"]').forEach(a=>{if(a.tagName==='A')a.href=c.line;else a.setAttribute('onclick',"window.open('"+c.line+"','_blank')")});
  document.querySelectorAll('a[href^="https://wa.me"],button[onclick*="wa.me"]').forEach(a=>{if(a.tagName==='A')a.href=c.whatsapp;else a.setAttribute('onclick',"window.open('"+c.whatsapp+"','_blank')")});
  document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.href='mailto:'+c.email);
  document.querySelectorAll('a[href^="tel:"]').forEach(a=>a.href=tel);
  document.querySelectorAll('.of').forEach(of=>{const t=of.textContent.toLowerCase();if(t.includes('office'))of.innerHTML='<b>Office</b><br>'+esc(c.office);if(t.includes('phone'))of.innerHTML='<b>Phone</b><br>'+esc(c.phone);if(t.includes('email'))of.innerHTML='<b>Email</b><br>'+esc(c.email)});
  document.querySelectorAll('.poi div').forEach((d,i)=>{if(i===0)d.innerHTML='<b>'+esc(c.name)+'</b>';if(i===1)d.innerHTML='<b>'+esc(c.phone)+'</b>';if(i===2)d.innerHTML='<b>'+esc(c.email)+'</b>'});
  document.querySelectorAll('.cont-a').forEach(a=>{const txt=a.textContent.toLowerCase();if(txt.includes('line'))a.href=c.line;if(txt.includes('whatsapp'))a.href=c.whatsapp;if(txt.includes('email')){a.href='mailto:'+c.email;const sp=a.querySelector('span+div span');if(sp)sp.textContent=c.email}if(txt.includes('phone')){a.href=tel;const sp=a.querySelector('span+div span');if(sp)sp.textContent=c.phone}});
}
function applyWebsiteText(){
  const w=_WEBSITE||{};
  if(w.cta)document.querySelectorAll('.btn.br,.nbs').forEach(el=>{if(/start|create|project/i.test(el.textContent))el.textContent=w.cta});
  if(w.howTitle){const h=document.querySelector('#hP .how-hero h2'); if(h)h.innerHTML=esc(w.howTitle).replace(/\n/g,'<br>')+'<span style="color:var(--r)">+</span>';}
  if(w.career){const wh=document.querySelector('#wP .who-hero p'); if(wh)wh.textContent=w.career;}
}
function applyClientSection(){
  const c=_CLIENT_SECTION||{};
  const title=document.querySelector('.cls-t'); const sub=document.querySelector('.cls-s'); const grid=document.querySelector('.cg'); const sec=document.querySelector('.cls');
  if(title&&c.title)title.innerHTML=c.title;
  if(sub&&c.sub)sub.innerHTML=c.sub;
  if(grid){if(c.cols)grid.style.gridTemplateColumns='repeat('+parseInt(c.cols||6,10)+',1fr)';if(c.gap)grid.style.gap=parseInt(c.gap,10)+'px';if(c.width)grid.style.maxWidth=parseInt(c.width,10)+'px';}
  if(sec&&c.bg)sec.style.background=c.bg;
  document.querySelectorAll('.cl').forEach(el=>{if(c.cardHeight)el.style.height=parseInt(c.cardHeight,10)+'px';if(c.cardBg)el.style.background=c.cardBg;if(c.borderColor)el.style.borderColor=c.borderColor;if(c.textColor)el.style.color=c.textColor});
}
function applyHomeSlides(){
  const slides=Array.isArray(_HOME)?_HOME:[];
  if(!slides.length)return;
  const mapped=slides.slice(0,5).map(s=>({ey:s.eyebrow||s.ey||'Dopious+',ti:(s.title||'Creative work').replace(/\n/g,'<br>'),st:s.desc||s.description||'',de:'',tg:['Dopious+','Creative','Design'],bg:false}));
  if(mapped.length){SLS.splice(0,SLS.length,...mapped);try{clearInterval(_ht);document.getElementById('hD').innerHTML='';initHero()}catch(e){}}
}
function applyAllLegacySettings(){applyThemeFromLegacy();applySEOFromLegacy();applyCompanyContact();applyWebsiteText();applyClientSection();applyHomeSlides();}

async function loadData(){
  if(!db)return;
  try{
    const [ps,cs,ts,pubDoc,legacyDocs]=await Promise.all([
      db.collection(COL).orderBy('ts','desc').get().catch(()=>({docs:[]})),
      db.collection(COL_CL).orderBy('ts','asc').get().catch(()=>({docs:[]})),
      db.collection(COL_TM).orderBy('ts','asc').get().catch(()=>({docs:[]})),
      getDocValue('published'),loadLegacyDocs()
    ]);
    const pub=pubDoc||{};_OLDPUB=pub;_LEGACYDOCS=legacyDocs||{};_OLDSETTINGS=mergeLegacySources(pub,legacyDocs);
    _CLIENT_SECTION=_OLDSETTINGS.dopiousClientSection||_OLDSETTINGS.dopiousClientSectionSettings||{};
    _CO=_OLDSETTINGS.dopiousAdminCompany||{};_SEO=_OLDSETTINGS.dopiousSEO||{};_THEME=_OLDSETTINGS.dopiousTheme||{};_WEBSITE=_OLDSETTINGS.dopiousAdminWebsite||{};
    _HOME=Array.isArray(_OLDSETTINGS.dopiousAdminHome)?_OLDSETTINGS.dopiousAdminHome:[];
    _CUSTOM_CATS=Array.isArray(_OLDSETTINGS.dopiousCustomServiceCategories)?_OLDSETTINGS.dopiousCustomServiceCategories:[];
    _SUBTOPICS=Array.isArray(_OLDSETTINGS.dopiousAdminSubtopics)?_OLDSETTINGS.dopiousAdminSubtopics:[];
    _MEDIA_LIBRARY=Array.isArray(_OLDSETTINGS.dopiousMediaLibrary)?_OLDSETTINGS.dopiousMediaLibrary:[];
    const newProjects=ps.docs.filter(d=>!LEGACY_KEYS.includes(d.id)&&d.id!=='published').map((d,i)=>normProject({_id:d.id,...d.data()},i,'new'));
    const oldProjects=Array.isArray(_OLDSETTINGS.dopiousAdminProjects)?_OLDSETTINGS.dopiousAdminProjects:[];
    _OLDPROJECTS=oldProjects.map((p,i)=>normProject(p,i,'old'));
    _P=mergeProjects(newProjects,_OLDPROJECTS);
    const newClients=cs.docs.map(d=>({_id:d.id,...d.data()}));
    const oldClients=Array.isArray(_OLDSETTINGS.dopiousClients)?_OLDSETTINGS.dopiousClients:[];
    _OLDCLIENTS=oldClients.map((c,i)=>({_id:c._id||c.id||('old_client_'+i),_legacy:true,nm:c.name||c.nm||'',name:c.name||c.nm||'',url:c.url||c.logoUrl||c.logo||c.image||'',logoUrl:c.logoUrl||c.url||c.logo||c.image||''}));
    _CL=mergeClients(newClients,_OLDCLIENTS);
    const newTeam=ts.docs.map(d=>({_id:d.id,...d.data()}));
    const oldTeam=Array.isArray(_OLDSETTINGS.dopiousAdminTeam)?_OLDSETTINGS.dopiousAdminTeam:[];
    _OLDTEAM=oldTeam.map((m,i)=>({_id:m._id||m.id||('old_team_'+i),_legacy:true,nm:m.name||m.nm||'',name:m.name||m.nm||'',pos:m.position||m.pos||'',position:m.position||m.pos||'',department:m.department||'',detail:m.detail||'',ph:m.photo||m.ph||'',photo:m.photo||m.ph||''}));
    _TM=mergePeople(newTeam,_OLDTEAM);
    rSvc();rCl();applyAllLegacySettings();updAdminStatus();
  }catch(e){console.warn('loadData full legacy:',e);const el=document.getElementById('sCt');if(el)el.textContent='Error loading';}
}

function buildGalleryItem(url,cap,i){
  const lq=isDr(url)?dTh(url,20):'';
  return '<figure class="di">'+(lq?'<div class="lq" style="background-image:url(\''+lq+'\')"></div>':'')+'<img '+(i<1?'src':'data-src')+'="'+iU(url,1100)+'" alt="" loading="'+(i<1?'eager':'lazy')+'">'+(cap?'<figcaption class="fcap">'+esc(cap)+'</figcaption>':'')+'</figure>';
}
function oPD(ai){
  const p=_P[ai];if(!p)return;
  const gls=p.gallery||p.galleryImages||[];const caps=p.galleryCaptions||[];const vE=mVE(p.vurl||p.videoUrl||'');const covFull=getCovFull(p);let gal='';
  if(covFull)gal+=buildGalleryItem(covFull,'',0);
  gls.forEach((url,i)=>{if(url!==covFull)gal+=buildGalleryItem(url,caps[i]||'',i+1)});
  if(vE)gal+='<div class="dv">'+vE+'</div>';
  if(!gal){const bg=CATS.find(c=>c.svc===(p.service||p.svc));gal='<div class="di" style="background:'+(bg?bg.bg:'#111')+'"></div>';}
  const svc=p.service||p.svc||'';const sub=p.sub||'';const folder=p.driveFolderUrl?'<a class="drive-link" href="'+esc(p.driveFolderUrl)+'" target="_blank" rel="noopener">Open Drive Folder</a>':'';
  document.getElementById('pdi').innerHTML='<div class="dh"><div class="dc">'+esc(svc)+(sub?' / '+esc(sub):'')+'</div><div class="dn">'+esc(p.name||p.nm||'')+'</div><div class="dm"><div class="db"><small>Client</small><b>'+esc(p.client||p.cl||'-')+'</b></div><div class="db"><small>Credit</small><b>'+esc(p.credit||p.cr||'Dopious+')+'</b></div><div class="db"><small>Year</small><b>'+esc(p.year||p.yr||'2026')+'</b></div></div></div>'+(p.desc||p.ds?'<div class="ds">'+esc(p.desc||p.ds).replace(/\n/g,'<br>')+folder+'</div>':'')+'<div class="gallery-layout layout-'+esc(p.layout||'stack')+'">'+gal+'</div><div class="dsc"><h3>Scope of Work</h3><p>'+esc(svc)+(sub?' — '+esc(sub):'')+' — Concept, art direction, design and production.</p></div>';
  document.querySelectorAll('#pdi img[data-src]').forEach(img=>IO&&IO.observe(img));
  document.querySelectorAll('#pdi .di').forEach(di=>{const img=di.querySelector('img');const lq=di.querySelector('.lq');if(img&&lq){const done=()=>lq.style.opacity='0';if(img.complete)done();else img.onload=done;}});
  op('pd');
}

function ensureLegacyAdminPanel(){
  const tabs=document.querySelector('.ata');const body=document.querySelector('.ab');if(!tabs||!body||document.getElementById('ttxt'))return;
  tabs.insertAdjacentHTML('beforeend','<button class="at" onclick="sT(\'txt\',this);fillTextLinkForm()">Text / Links</button><button class="at" onclick="sT(\'legacy\',this);renderLegacyOverview()">Legacy</button>');
  body.insertAdjacentHTML('beforeend',`<div class="apn" id="ttxt"><div class="nt">ดึงข้อมูลจาก Admin เก่า: Company, Contact links, Website text, Theme/SEO และบันทึกกลับ Firebase ได้</div><div class="ast" id="txtM"></div><div class="af"><label class="fw">Company Name<input id="txCompany" placeholder="Dopious Partnership Limited"></label><label>Phone<input id="txPhone" placeholder="+66 ..."></label><label>Email<input id="txEmail" placeholder="info@..."></label><label class="fw">Line URL<input id="txLine" placeholder="https://line.me/..."></label><label class="fw">WhatsApp URL<input id="txWhatsapp" placeholder="https://wa.me/..."></label><label>Facebook<input id="txFacebook"></label><label>Behance<input id="txBehance"></label><label>LinkedIn<input id="txLinkedin"></label><label class="fw">CTA Label<input id="txCta"></label><label class="fw">Homepage Intro<textarea id="txHomeIntro" rows="3"></textarea></label><label class="fw">Service Description<textarea id="txServiceDesc" rows="3"></textarea></label><label class="fw">Career Text<textarea id="txCareer" rows="3"></textarea></label><label>Accent Color<input id="txAccent" placeholder="#ff2a14"></label><label>Background Color<input id="txBg" placeholder="#050505"></label><label class="fw">SEO Title<input id="txSeoTitle"></label><label class="fw">SEO Description<textarea id="txSeoDesc" rows="3"></textarea></label><label class="fw">OG Image URL<input id="txSeoImage"></label></div><div class="arow"><button class="asv" onclick="saveTextLinks()">✓ Save Text / Links</button><button class="asv ghost" onclick="fillTextLinkForm()">Reload from Old Data</button></div></div><div class="apn" id="tlegacy"><div class="nt"><strong>Legacy Data Bridge</strong><br>แสดงจำนวนข้อมูลเก่าที่เจอ และสามารถ Import เข้าระบบใหม่ทั้งหมด</div><div class="ast" id="lgM"></div><div id="legacyOverview"></div><div class="arow"><button class="asv" onclick="importAllLegacyData()">↧ Import Everything</button><button class="asv ghost" onclick="downloadLegacyJSON()">Download Legacy JSON</button></div></div>`);
}
function fillTextLinkForm(){
  const c=normContact(_CO||{}),w=_WEBSITE||{},t=_THEME||{},s=_SEO||{};
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||''};
  set('txCompany',c.name);set('txPhone',c.phone);set('txEmail',c.email);set('txLine',c.line);set('txWhatsapp',c.whatsapp);set('txFacebook',c.facebook);set('txBehance',c.behance);set('txLinkedin',c.linkedin);
  set('txCta',w.cta||'');set('txHomeIntro',w.homeIntro||'');set('txServiceDesc',w.serviceDesc||'');set('txCareer',w.career||'');
  set('txAccent',t.accent||t.accentColor||t.primary||t.primaryColor||'');set('txBg',t.bg||t.background||t.backgroundColor||'');
  set('txSeoTitle',s.title||'');set('txSeoDesc',s.desc||s.description||'');set('txSeoImage',s.ogImage||'');
}
async function saveTextLinks(){
  if(!db){stM('txtM','Firebase ยังไม่พร้อม','err');return;}
  _CO={name:txCompany.value,company:txCompany.value,phone:txPhone.value,email:txEmail.value,line:txLine.value,whatsapp:txWhatsapp.value,facebook:txFacebook.value,behance:txBehance.value,linkedin:txLinkedin.value,office:(_CO&&_CO.office)||'Bangkok Office / Thailand'};
  _WEBSITE=Object.assign({},_WEBSITE,{cta:txCta.value,homeIntro:txHomeIntro.value,serviceDesc:txServiceDesc.value,career:txCareer.value});
  _THEME=Object.assign({},_THEME,{accent:txAccent.value,bg:txBg.value});
  _SEO=Object.assign({},_SEO,{title:txSeoTitle.value,desc:txSeoDesc.value,ogImage:txSeoImage.value});
  try{
    await Promise.all([db.collection(COL).doc('dopiousAdminCompany').set({value:_CO,updatedAt:new Date().toISOString()},{merge:true}),db.collection(COL).doc('dopiousAdminWebsite').set({value:_WEBSITE,updatedAt:new Date().toISOString()},{merge:true}),db.collection(COL).doc('dopiousTheme').set({value:_THEME,updatedAt:new Date().toISOString()},{merge:true}),db.collection(COL).doc('dopiousSEO').set({value:_SEO,updatedAt:new Date().toISOString()},{merge:true})]);
    applyAllLegacySettings();stM('txtM','✓ Saved text / links / SEO / theme','ok');
  }catch(e){stM('txtM','Error: '+e.message,'err')}
}
function renderLegacyOverview(){
  const el=document.getElementById('legacyOverview');if(!el)return;
  const counts=[['Projects',_OLDPROJECTS.length],['Clients',_OLDCLIENTS.length],['Team',_OLDTEAM.length],['Home slides',Array.isArray(_HOME)?_HOME.length:0],['Logos',Array.isArray(_OLDSETTINGS.dopiousAdminLogos)?_OLDSETTINGS.dopiousAdminLogos.length:0],['Subtopics',Array.isArray(_SUBTOPICS)?_SUBTOPICS.length:0],['Custom categories',Array.isArray(_CUSTOM_CATS)?_CUSTOM_CATS.length:0],['Media library',Array.isArray(_MEDIA_LIBRARY)?_MEDIA_LIBRARY.length:0],['SEO',Object.keys(_SEO||{}).length],['Theme',Object.keys(_THEME||{}).length],['Website text',Object.keys(_WEBSITE||{}).length],['Company links',Object.keys(_CO||{}).length]];
  el.innerHTML='<div class="legacy-grid">'+counts.map(x=>'<div class="legacy-card"><b>'+x[1]+'</b><span>'+x[0]+'</span></div>').join('')+'</div><div class="nt">รหัส Admin ที่ใช้ได้: <strong>dopious123</strong> และ <strong>dopious2026</strong></div>';
}
function downloadLegacyJSON(){
  const blob=new Blob([JSON.stringify(_OLDSETTINGS,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Dopious_Legacy_Admin_All_Data.json';a.click();URL.revokeObjectURL(a.href);
}
async function importAllLegacyData(){
  if(!db){stM('lgM','Firebase ยังไม่พร้อม','err');return;}
  if(!confirm('Import ข้อมูลเก่าทั้งหมดเข้า Firebase docs ใหม่?'))return;
  try{
    const batch=db.batch();let n=0;
    _OLDPROJECTS.forEach((p,i)=>{const id='legacy_project_'+String(p.id||p.name||i).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,80)+'_'+i;const q=Object.assign({},p,{_legacy:false,legacySource:'oldAdmin',ts:firebase.firestore.FieldValue.serverTimestamp()});delete q._id;batch.set(db.collection(COL).doc(id),q,{merge:true});n++;});
    _OLDCLIENTS.forEach((c,i)=>{const id='legacy_client_'+String(c.name||c.nm||i).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,80)+'_'+i;const q=Object.assign({},c,{legacySource:'oldAdmin',ts:firebase.firestore.FieldValue.serverTimestamp()});delete q._id;delete q._legacy;batch.set(db.collection(COL_CL).doc(id),q,{merge:true});n++;});
    _OLDTEAM.forEach((m,i)=>{const id='legacy_team_'+String(m.name||m.nm||i).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,80)+'_'+i;const q=Object.assign({},m,{legacySource:'oldAdmin',ts:firebase.firestore.FieldValue.serverTimestamp()});delete q._id;delete q._legacy;batch.set(db.collection(COL_TM).doc(id),q,{merge:true});n++;});
    ['dopiousAdminHome','dopiousAdminLogos','dopiousAdminCompany','dopiousAdminWebsite','dopiousTheme','dopiousSEO','dopiousClientSection','dopiousAdminSubtopics','dopiousCustomServiceCategories','dopiousHiddenCategories','dopiousMediaLibrary'].forEach(k=>{if(_OLDSETTINGS[k]!==undefined){batch.set(db.collection(COL).doc(k),{value:_OLDSETTINGS[k],updatedAt:new Date().toISOString()},{merge:true});n++;}});
    batch.set(db.collection(COL).doc('published'),{projects:_OLDPROJECTS,clients:_OLDCLIENTS,team:_OLDTEAM,home:_HOME,logos:_OLDSETTINGS.dopiousAdminLogos||[],company:_CO,website:_WEBSITE,theme:_THEME,seo:_SEO,clientSection:_CLIENT_SECTION,publishedAt:new Date().toISOString()},{merge:true});n++;
    await batch.commit();await loadData();rAP();rACl();rATm();renderLegacyOverview();stM('lgM','✓ Imported '+n+' legacy records/settings','ok');
  }catch(e){stM('lgM','Import error: '+e.message,'err')}
}
function importOldData(){importAllLegacyData();}
function chkA(){
  const v=document.getElementById('aPw')?.value||'';
  if(LEGACY_PASSWORDS.includes(v)){
    cAL();ensureLegacyAdminPanel();op('aP');rAP();rACl();rATm();fillTextLinkForm();renderLegacyOverview();
  }else{document.getElementById('aErr').style.display='block';}
}
function updAdminStatus(){const el=document.getElementById('apSt');if(el)el.textContent='Live '+_P.length+' works'+(_OLDPROJECTS.length?' / old admin '+_OLDPROJECTS.length:'')+' / full legacy';}

/* Make new saves preserve old feature fields too */
async function savP(){
  if(!db){stM('apM','Firebase ยังไม่พร้อม','err');return;}
  const nm=document.getElementById('pN')?.value.trim();if(!nm){stM('apM','ใส่ชื่อโปรเจกต์ก่อน','err');return;}
  const cu=document.getElementById('pCU')?.value.trim();if(!cu){stM('apM','ใส่ Cover Image URL ก่อน','err');return;}
  const gallery=(document.getElementById('pGU')?.value||'').split('\n').map(s=>s.trim()).filter(isMediaString).slice(0,20);
  const v=document.getElementById('pVU')?.value.trim()||'';
  const proj={id:'proj_'+Date.now(),nm,name:nm,cl:document.getElementById('pCl')?.value.trim()||'Dopious+ Client',client:document.getElementById('pCl')?.value.trim()||'Dopious+ Client',credit:'Dopious+',cr:'Dopious+',svc:document.getElementById('pSv')?.value||'',service:document.getElementById('pSv')?.value||'',sub:'',yr:document.getElementById('pY')?.value||'2026',year:document.getElementById('pY')?.value||'2026',ds:document.getElementById('pDs')?.value.trim()||'',desc:document.getElementById('pDs')?.value.trim()||'',layout:'stack',previewType:'image',covUrl:cu,cover:cu,coverImage:cu,coverThumb:isDr(cu)?dTh(cu,400):cu,cardThumb:isDr(cu)?dTh(cu,400):cu,lqip:isDr(cu)?dTh(cu,20):'',gallery,galleryImages:gallery,galleryCaptions:[],galleryCount:gallery.length,vurl:v,videoUrl:v,driveFolderUrl:'',ts:firebase.firestore.FieldValue.serverTimestamp()};
  try{stM('apM','กำลัง publish...','ok');await db.collection(COL).add(proj);await loadData();rAP();clrF();stM('apM','✓ Published: '+nm+' — ทุก device เห็นทันที','ok');}
  catch(e){stM('apM','Error: '+e.message,'err')}
}


/* ═════════════════════════════════════════════════════════════
   UI PARITY PATCH — video card previews, old grouping, how-it-works
═════════════════════════════════════════════════════════════ */
function ytId(u){const m=String(u||'').match(/(?:youtube\.com\/(?:watch\?[^#\s]*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);return m?m[1]:'';}
function driveId(u){const m=String(u||'').match(/[?&]id=([A-Za-z0-9_-]+)/)||String(u||'').match(/\/d\/([A-Za-z0-9_-]+)/);return m?m[1]:'';}
function isDirectVideo(u){return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(String(u||''));}
function videoPoster(u,fallback){const y=ytId(u);if(y)return 'https://i.ytimg.com/vi/'+y+'/hqdefault.jpg';const d=driveId(u);if(d)return 'https://drive.google.com/thumbnail?id='+d+'&sz=s1000';return fallback||'';}
function cleanCardText(s){return String(s||'').replace(/https?:\/\/\S+/g,'').replace(/\s+/g,' ').trim();}
function serviceShortName(s){return String(s||'').replace(/Design\+?$/i,'').replace(/\+$/,'').trim().split('/')[0].trim().split(' ').slice(0,3).join(' ');}
function labelOfService(s){return serviceShortName(s)||'Dopious';}
function serviceIndex(s){const sv=normSvc(s);return S2C[sv]!==undefined?S2C[sv]:-1;}

const DOPIOUS_HOW_TAXONOMY=[
  {key:'n1',service:'Brand Strategy Corporate Identity Design+',kicker:'Brand Strategy Corporate Identity Design+',title:'Brand Strategy',items:[]},
  {key:'n2',service:'Keyvisual Creative Ads Design+',kicker:'Keyvisual Creative Ads Design+',title:'Keyvisual / Creative Ads',items:[]},
  {key:'n9',service:'Graphic Design+',kicker:'Graphic Design+',title:'Graphic Design',items:[]},
  {key:'n3',service:'Industrial Design+',kicker:'Industrial Design+',title:'Industrial Design',items:[]},
  {key:'n4',service:'Space Design+',kicker:'Space Design+',title:'Space Design',items:['Space | Event','Space | Interior','Space | Exterior','Space | Kiosk','Space | Pop-up Store','Space | Exhibition Booth','Space | Retail']},
  {key:'n5',service:'Prototype 3D Print Service',kicker:'Prototype 3D Print Service',title:'Prototype / 3D Print Service',items:[]},
  {key:'n6',service:'Production Follow Up',kicker:'Production Follow Up',title:'Production',items:[]},
  {key:'n10',service:'Build & Installation+',kicker:'Build & Installation+',title:'Build & Installation',items:[]},
  {key:'n11',service:'2D-3D Motion Graphic Design+',kicker:'2D–3D Motion Graphic / Fashion / Sculpture Design+',title:'2D–3D Motion / Fashion / Sculpture',items:['2D-3D Motion | Animation','2D-3D Motion | Storyboard','2D-3D Motion | Render']},
  {key:'n11',service:'Fashion Design+',kicker:'2D–3D Motion Graphic / Fashion / Sculpture Design+',title:'2D–3D Motion / Fashion / Sculpture',items:['Fashion | Direction','Fashion | Styling','Fashion | Campaign']},
  {key:'n11',service:'Sculpture Design+',kicker:'2D–3D Motion Graphic / Fashion / Sculpture Design+',title:'2D–3D Motion / Fashion / Sculpture',items:['Sculpture | 3D Print','Sculpture | Character','Sculpture | Prototype']},
  {key:'n7',service:'Photo / Video / Ads Design+',kicker:'Photo / Video / Ads Design+',title:'Photo / Video / Ads',items:[]},
  {key:'n8',service:'Marketing',kicker:'Marketing+',title:'Marketing',items:['Marketing | Campaign Planning','Marketing | Social Media','Marketing | Brand Communication','Marketing | Follow Up','Marketing | Media Buying']},
  {key:'n_packaging',service:'Packaging Design+',kicker:'Packaging Design+',title:'Packaging Design',items:['Packaging | Brand Extension','Packaging | Label System','Packaging | Mockup']},
  {key:'n_website',service:'Website UX-UI Design+',kicker:'Website UX-UI Design+',title:'Website UX-UI',items:['Website UX-UI | Landing Page','Website UX-UI | Portfolio','Website UX-UI | System']}
];
function taxNorm(s){return String(s||'').toLowerCase().replace(/[–—]/g,'-').replace(/\+/g,'').replace(/[^a-z0-9]+/g,'').trim();}
function taxMetaForService(s){
  const svc=normSvc(s||'');
  return DOPIOUS_HOW_TAXONOMY.find(x=>x.service===svc)||DOPIOUS_HOW_TAXONOMY.find(x=>taxNorm(x.service)===taxNorm(svc))||{kicker:svc||'Dopious+',title:labelOfService(svc),items:[]};
}
function projectHeadLabel(p,svc){return cleanCardText((p&&p.headline)||'') || taxMetaForService(svc).title || labelOfService(svc);}
function projectSubLabel(p,rawSub,svc){return cleanCardText((p&&p.subHeadline)||'') || cleanCardText(rawSub) || taxMetaForService(svc).kicker || labelOfService(svc);}
function slideMedia(p,ai,labelTop,labelBot,bg){
  const img=getCov(p); const video=p.videoUrl||p.vurl||'';
  const useVideo=!!video && (String(p.previewType||p.cardPreviewType||'').toLowerCase().includes('video') || !img || /photo\s*\/\s*video/i.test(String(p.service||p.svc||'')));
  return {ai:ai,title:p.name||p.nm||'Untitled',img:img,video:video,isVideo:useVideo,bg:bg,desc:p.desc||p.ds||'',labelTop:labelTop,labelBot:labelBot,headline:p.headline||'',subHeadline:p.subHeadline||'',service:p.service||p.svc||'',sub:p.sub||''};
}
function renderLayer(s,li){
  const on=li===0?' is-on':''; let body='';
  if(s.isVideo && s.video){
    if(isDirectVideo(s.video)) body='<video muted loop playsinline preload="metadata" '+(li===0?'autoplay':'')+' src="'+esc(s.video)+'" poster="'+esc(videoPoster(s.video,s.img))+'"></video>';
    else body='<div class="video-poster" style="background-image:url(\''+esc(videoPoster(s.video,s.img))+'\')"></div>';
  }else if(s.img){
    body='<img '+(li===0?'src':'data-src')+'="'+iU(s.img,li===0?800:500)+'" alt="'+esc(s.title)+'" loading="'+(li===0?'eager':'lazy')+'" decoding="async">';
  }else{ body='<div style="position:absolute;inset:0;background:'+s.bg+'"></div>'; }
  return '<div class="cat-slide-layer'+on+'" data-layer="'+li+'">'+body+'</div>';
}
const SVC_ORDER=['Build & Installation+','Space Design+','Keyvisual Creative Ads Design+','2D-3D Motion Graphic Design+','Industrial Design+','Prototype 3D Print Service','Brand Strategy Corporate Identity Design+','Graphic Design+','Packaging Design+','Photo / Video / Ads Design+','Fashion Design+','Sculpture Design+','Website UX-UI Design+','Marketing','Production Follow Up'];
function rSvc(){
  const g=document.getElementById('sG');if(!g)return;
  Object.keys(_tm2||{}).forEach(k=>clearInterval(_tm2[k]));_tm2={};_ac={};
  const groups={};
  (_P||[]).forEach((p,ai)=>{let svc=normSvc(p.service||p.svc||p.cat||p.category||'Other');if(!svc)svc='Other';let sub=(p.sub&&p.sub!=='— Select sub-service —')?String(p.sub).trim():'__none__';if(!groups[svc])groups[svc]={};if(!groups[svc][sub])groups[svc][sub]=[];groups[svc][sub].push({p,ai});});
  const keys=Object.keys(groups).sort((a,b)=>{let ia=SVC_ORDER.indexOf(a),ib=SVC_ORDER.indexOf(b);if(ia<0)ia=999;if(ib<0)ib=999;return ia-ib||a.localeCompare(b);});
  let html='';
  keys.forEach(svc=>{
    const ci=serviceIndex(svc),cat=ci>=0?CATS[ci]:null,bg=(cat&&cat.bg)||'#111',shortSvc=labelOfService(svc);
    html+='<div class="svc-cat-divider">'+esc(shortSvc)+'</div>';
    Object.keys(groups[svc]).forEach((subKey,si)=>{
      const items=groups[svc][subKey]; const rawSub=subKey==='__none__'?'':subKey;
      const slides=items.map(x=>slideMedia(x.p,x.ai,projectSubLabel(x.p,rawSub,svc),projectHeadLabel(x.p,svc),bg));
      const id='csSub_'+String(svc+'_'+subKey).replace(/[^a-zA-Z0-9]/g,'_').slice(0,52)+'_'+si;
      const controls=slides.length>1?'<div class="cat-slide-controls"><button class="cat-slide-btn" data-dir="-1" type="button">‹</button><span class="cat-slide-count">1 / '+slides.length+'</span><button class="cat-slide-btn" data-dir="1" type="button">›</button></div>':'';
      const layers=slides.map(renderLayer).join('');
      const safe=JSON.stringify(slides.map(s=>({ai:s.ai,title:s.title,desc:s.desc,labelTop:s.labelTop,labelBot:s.labelBot,isVideo:s.isVideo,video:s.video,service:s.service,sub:s.sub}))).replace(/'/g,'&#39;');
      const firstDesc=cleanCardText(slides[0]&&slides[0].desc); const firstVideo=slides[0]&&slides[0].isVideo;
      html+='<article class="cat-slide-card" id="'+id+'" data-service="'+esc(svc)+'" data-sub="'+esc(rawSub)+'" data-slides=\''+safe+'\'>'+layers+'<div class="cat-slide-top"><div class="cat-slide-name">'+esc(slides[0].title)+'</div>'+controls+'</div>'+'<div class="cat-slide-label"><span>'+esc(slides[0].labelTop||'')+'</span>'+(slides[0].labelBot?'<span>'+esc(slides[0].labelBot)+'</span>':'')+'<strong>Design<em>+</em></strong></div><div class="svc-desc" '+(firstDesc?'':'style="display:none"')+'><p>'+esc(firstDesc)+'</p></div><button class="stp" aria-label="View" onclick="oCardProject(event,\''+id+'\')"></button></article>';
    });
  });
  g.innerHTML=html||CATS.slice(0,8).map(c=>'<article class="cat-slide-card sk"><div class="cat-slide-layer is-on" style="background:'+c.bg+'"></div><div class="cat-slide-label"><span>'+esc(labelOfService(c.svc))+'</span><strong>Design<em>+</em></strong></div></article>').join('');
  g.querySelectorAll('img[data-src]').forEach(img=>IO&&IO.observe(img));
  g.querySelectorAll('.cat-slide-card[id]').forEach(card=>{_ac[card.id]=0;card.querySelectorAll('.cat-slide-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();setCardSlide(card,parseInt(btn.dataset.dir||'1',10));clearInterval(_tm2[card.id]);const sl=cardSlides(card);if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);}));const sl=cardSlides(card);if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);});
  const el=document.getElementById('sCt');if(el){const t=(_P||[]).length;el.textContent=t?(t+' Project'+(t>1?'s':'')+' — Live'):'Upload projects from Admin';}
}
function cardSlides(card){try{return JSON.parse(card.getAttribute('data-slides')||'[]')}catch(e){return[]}}
function setCardSlide(card,dir){
  if(!card)return;const sl=cardSlides(card);if(!sl.length)return;const nx=((_ac[card.id]||0)+dir+sl.length)%sl.length;_ac[card.id]=nx;
  card.querySelectorAll('.cat-slide-layer').forEach((l,i)=>{l.classList.toggle('is-on',i===nx);const v=l.querySelector('video');if(v){if(i===nx){v.play&&v.play().catch(()=>{});}else{try{v.pause()}catch(e){}}}});
  const layer=card.querySelector('.cat-slide-layer[data-layer="'+nx+'"]');if(layer){const img=layer.querySelector('img[data-src]');if(img)ldI(img,img.dataset.src);const v=layer.querySelector('video:not([autoplay])');if(v){v.setAttribute('autoplay','');try{v.play().catch(()=>{})}catch(e){}}}
  const s=sl[nx]||{};const n=card.querySelector('.cat-slide-name');if(n)n.textContent=s.title||'';const c=card.querySelector('.cat-slide-count');if(c)c.textContent=(nx+1)+' / '+sl.length;const desc=card.querySelector('.svc-desc');if(desc){const t=cleanCardText(s.desc);desc.style.display=t?'block':'none';desc.innerHTML='<p>'+esc(t)+'</p>';}const vb=card.querySelector('.video-badge');if(vb)vb.remove();const lab=card.querySelector('.cat-slide-label');if(lab)lab.innerHTML='<span>'+esc(s.labelTop||'')+'</span>'+(s.labelBot?'<span>'+esc(s.labelBot)+'</span>':'')+'<strong>Design<em>+</em></strong>';
}
function oCardProject(e,id){if(e)e.stopPropagation();const card=document.getElementById(id);if(!card)return;const sl=cardSlides(card);const s=sl[_ac[id]||0]||sl[0];if(s&&s.ai!==undefined)oPD(s.ai);}
function oCd(ci){const cards=[...document.querySelectorAll('.cat-slide-card[id]')];const card=cards[ci];if(card)oCardProject(null,card.id);}
function stC(ci,dir){const cards=[...document.querySelectorAll('.cat-slide-card[id]')];const card=cards[ci];if(card)setCardSlide(card,dir);}
function nC(e,ci,d){if(e)e.stopPropagation();stC(ci,d)}
function oPD(ai){
  const p=_P[ai];if(!p)return;
  const glObjs=p.galleryObjects&&p.galleryObjects.length?p.galleryObjects:(p.galleryImages||p.gallery||[]).map((u,i)=>({data:u,caption:(p.galleryCaptions||[])[i]||''}));
  const vE=mVE(p.vurl||p.videoUrl||''); const covFull=getCovFull(p); let gal='';
  if(covFull){const lqS=isDr(covFull)?dTh(covFull,20):'';gal+='<div class="di"><div class="lq" style="background-image:url(\''+lqS+'\')"></div><img src="'+iU(covFull,1100)+'" alt="'+esc(p.name||p.nm||'')+'" loading="eager"></div>';}
  glObjs.forEach((o,i)=>{const url=typeof o==='string'?o:(o&&o.data)||'';if(!url)return;const cap=cleanCardText((o&&o.caption)||'');gal+='<div class="di"><div class="lq" style="background-image:url(\''+(isDr(url)?dTh(url,20):'')+'\')"></div><img '+(i<1?'src':'data-src')+'="'+iU(url,1100)+'" alt="'+esc(cap)+'" loading="'+(i<1?'eager':'lazy')+'"></div>'+(cap?'<div class="detail-img-caption">'+esc(cap)+'</div>':'');});
  if(vE)gal+='<div class="dv">'+vE+'</div>';
  if(!gal){const bg=CATS.find(c=>c.svc===(p.service||p.svc));gal='<div class="di" style="background:'+(bg?bg.bg:'#111')+'"></div>';}
  const svc=p.service||p.svc||'';const sub=p.sub||'';
  document.getElementById('pdi').innerHTML='<div class="dh"><div class="dc">'+esc(svc)+(sub?' / '+esc(sub):'')+'</div><div class="dn">'+esc(p.name||p.nm||'')+'</div><div class="dm"><div class="db"><small>Client</small><b>'+esc(p.client||p.cl||'-')+'</b></div><div class="db"><small>Credit</small><b>'+esc(p.credit||p.cr||'Dopious+')+'</b></div><div class="db"><small>Year</small><b>'+esc(p.year||p.yr||'2026')+'</b></div></div></div>'+(p.desc||p.ds?'<div class="ds">'+esc(p.desc||p.ds)+'</div>':'')+'<div>'+gal+'</div><div class="dsc"><h3>Scope of Work</h3><p>'+esc(svc)+' — Concept, art direction, design, production.</p></div>';
  document.querySelectorAll('#pdi img[data-src]').forEach(img=>IO&&IO.observe(img));
  document.querySelectorAll('#pdi .di').forEach(di=>{const img=di.querySelector('img');const lq=di.querySelector('.lq');if(img&&lq){const done=()=>lq.style.opacity='0';if(img.complete)done();else img.onload=done;}});
  op('pd');
}
const serviceSubData={
  dopious:{kicker:'Dopious+ system',title:'One-stop Creative Service',desc:'Choose a single service for smaller projects, or combine multiple services into a complete workflow from concept to production — Strategy, Design, Visual, and Production in one team.',items:[]},
  n1:{kicker:'Brand Strategy Corporate Identity Design+',title:'Brand Strategy',desc:'Brand positioning, Corporate Identity, Logo Systems, Brand Guidelines, and Campaign Direction.',items:[]},
  n2:{kicker:'Keyvisual Creative Ads Design+',title:'Keyvisual / Creative Ads',desc:'Campaign key visual, online ads, billboard, OOH, and social media visuals.',items:[]},
  n9:{kicker:'Graphic Design+',title:'Graphic Design',desc:'Layout design, posters, brochures, signage graphics, social templates, decks, and production-ready artwork.',items:[]},
  n3:{kicker:'Industrial Design+',title:'Industrial Design',desc:'Product form, CMF direction, 3D visualization, prototype direction, and manufacturing support.',items:[]},
  n4:{kicker:'Space Design+',title:'Space Design',desc:'Commercial spaces, events, booths, kiosks, retail, pop-up stores, and exhibitions.',items:['Space | Event','Space | Interior','Space | Exterior','Space | Kiosk','Space | Pop-up Store','Space | Exhibition Booth','Space | Retail']},
  n5:{kicker:'Prototype 3D Print Service',title:'Prototype / 3D Print Service',desc:'Physical prototypes, scale models, mockups, 3D printed parts, resin samples, FDM/SLA tests.',items:[]},
  n6:{kicker:'Production Follow Up',title:'Production',desc:'Display pieces, signage, props, mockups, printing, material sourcing, vendor coordination, quality control, and final delivery follow-up.',items:[]},
  n10:{kicker:'Build & Installation+',title:'Build & Installation',desc:'Construction, fit-out, site work, and installation for retail spaces, kiosks, booths, pop-up shops, events, exhibitions, and branded environments.',items:[]},
  n7:{kicker:'Photo / Video / Ads Design+',title:'Photo / Video / Ads',desc:'Photo direction, video production, motion graphics, commercial ads, and content packages.',items:[]},
  n8:{kicker:'Marketing+',title:'Marketing',desc:'Campaign planning, social media content, media buying coordination, and ongoing brand support.',items:['Marketing | Campaign Planning','Marketing | Social Media','Marketing | Brand Communication','Marketing | Follow Up','Marketing | Media Buying']},
  n11:{kicker:'2D–3D Motion Graphic / Fashion / Sculpture Design+',title:'2D–3D Motion / Fashion / Sculpture',desc:'2D/3D motion graphics, fashion design and styling direction, sculpture, and 3D art.',items:['2D-3D Motion | Animation','2D-3D Motion | Storyboard','2D-3D Motion | Render','Fashion | Direction','Fashion | Styling','Fashion | Campaign','Sculpture | 3D Print','Sculpture | Character','Sculpture | Prototype']}
};
function showServiceSub(key){
  const data=serviceSubData[key]||serviceSubData.dopious; const panel=document.getElementById('serviceSubPanel'); if(!panel)return;
  document.getElementById('subKicker').textContent=data.kicker; document.getElementById('subTitle').textContent=data.title; document.getElementById('subDesc').textContent=data.desc;
  document.getElementById('subChips').innerHTML=(data.items||[]).map(item=>'<button type="button" onclick="goServicesFromHow()">'+esc(item)+'</button>').join('');
  document.querySelectorAll('.mind-node').forEach(n=>n.classList.remove('active')); const node=document.querySelector('.mind-node.'+key); if(node)node.classList.add('active');
}
function clearServiceSub(){showServiceSub('dopious')}
function goServicesFromHow(){
  cH();
  setTimeout(function(){
    var svc=document.getElementById('svc');
    if(svc){svc.scrollIntoView({behavior:'smooth',block:'start'});}
  },180);
}
function _jumpNorm(s){return String(s||'').toLowerCase().replace(/[–—]/g,'-').replace(/\+/g,' plus ').replace(/[^a-z0-9ก-๙]+/gi,' ').replace(/\s+/g,' ').trim();}
function _jumpCompact(s){return _jumpNorm(s).replace(/\s+/g,'');}
const _SERVICE_KEY_MATCH={
  n1:['Brand Strategy Corporate Identity Design+'],
  n2:['Keyvisual Creative Ads Design+'],
  n3:['Industrial Design+'],
  n4:['Space Design+'],
  n5:['Prototype 3D Print Service'],
  n6:['Production Follow Up'],
  n7:['Photo / Video / Ads Design+'],
  n8:['Marketing','Marketing+'],
  n9:['Graphic Design+'],
  n10:['Build & Installation+'],
  n11:['2D-3D Motion Graphic Design+','Fashion Design+','Sculpture Design+']
};
function _scoreJumpCard(card,key,item){
  const sub=card.dataset.sub||'';
  const svc=card.dataset.service||'';
  const full=_jumpNorm(item);
  const subN=_jumpNorm(sub);
  const svcN=_jumpNorm(svc);
  const hay=_jumpNorm([svc,sub,card.textContent||''].join(' '));
  const parts=String(item||'').split('|').map(_jumpNorm).filter(Boolean);
  const family=parts[0]||full;
  const specific=parts.length>1?parts[parts.length-1]:'';
  const allowed=(_SERVICE_KEY_MATCH[key]||[]).map(_jumpNorm);
  const serviceOK=!allowed.length || allowed.some(a=>svcN.includes(a)||a.includes(svcN));
  let score=-1;
  if(full && subN===full) score=120;
  else if(full && _jumpCompact(subN)===_jumpCompact(full)) score=118;
  else if(parts.length>1 && serviceOK && specific && (subN===specific || _jumpCompact(subN)===_jumpCompact(specific))) score=110;
  else if(parts.length>1 && serviceOK && specific && subN.includes(specific)) score=95;
  else if(parts.length>1 && specific && hay.includes(specific) && (!family || hay.includes(family) || serviceOK)) score=82;
  else if(!specific && serviceOK && family && hay.includes(family)) score=70;
  else if(full && hay.includes(full)) score=60;
  return score;
}
function _findWorkCard(key,item){
  const cards=[...document.querySelectorAll('.cat-slide-card[id]')];
  if(!cards.length)return null;
  let best=null,bestScore=-1;
  cards.forEach(card=>{const s=_scoreJumpCard(card,key,item); if(s>bestScore){bestScore=s;best=card;}});
  if(bestScore>=60)return best;
  const allowed=(_SERVICE_KEY_MATCH[key]||[]).map(_jumpNorm);
  if(allowed.length){
    const bySvc=cards.find(c=>allowed.some(a=>_jumpNorm(c.dataset.service||'').includes(a)||a.includes(_jumpNorm(c.dataset.service||''))));
    if(bySvc)return bySvc;
  }
  return cards[0]||null;
}
function jumpToWork(key,item){
  goServicesFromHow();
}
function applyCustomServiceCategories(){
  const list=Array.isArray(_CUSTOM_CATS)?_CUSTOM_CATS:[]; const map=document.querySelector('.mind-map'); if(!map)return; map.querySelectorAll('.mind-node.custom-service-node').forEach(el=>el.remove());
  list.forEach((cat,i)=>{const key=cat.key||('custom_'+i);serviceSubData[key]={kicker:cat.full||cat.title||'Custom Service+',title:cat.title||'Custom Service',desc:cat.desc||'Custom service category added from Admin.',items:Array.isArray(cat.items)?cat.items:[]};const btn=document.createElement('button');btn.className='mind-node custom-service-node';btn.type='button';btn.onclick=()=>showServiceSub(key);btn.innerHTML='<b>'+esc(cat.title||'Custom Service')+'</b><span>'+esc(cat.subtitle||cat.full||'Custom Category')+'</span>';map.appendChild(btn);});
}
const _oldLoadDataForParity=loadData;
loadData=async function(){await _oldLoadDataForParity();try{applyCustomServiceCategories();showServiceSub('dopious')}catch(e){}};
if(typeof LEGACY_PASSWORDS!=='undefined'){['dopious123','dopious2026'].forEach(p=>{if(!LEGACY_PASSWORDS.includes(p))LEGACY_PASSWORDS.push(p)});}
function oAL(){op('aLo');setTimeout(()=>{const el=document.getElementById('aPw');if(el){el.type='text';el.focus();}},80)}
setTimeout(()=>{try{const el=document.getElementById('aPw');if(el)el.type='text';showServiceSub('dopious')}catch(e){}},250);


/* Full legacy admin bridge — keep public fast, load complete old Admin separately */
function oAL(){ location.href='admin.html?admin=1'; }


/* EXACT MATCH PATCH — Admin head/subhead, How It Works chips, and first-page cards use one taxonomy. */
(function(){
  try{
    if(typeof serviceSubData==='object' && Array.isArray(DOPIOUS_HOW_TAXONOMY)){
      const byKey={};
      DOPIOUS_HOW_TAXONOMY.forEach(m=>{
        if(!byKey[m.key]) byKey[m.key]={kicker:m.kicker,title:m.title,desc:(serviceSubData[m.key]&&serviceSubData[m.key].desc)||'',items:[]};
        (m.items||[]).forEach(it=>{if(!byKey[m.key].items.includes(it))byKey[m.key].items.push(it);});
      });
      Object.keys(byKey).forEach(k=>{serviceSubData[k]=Object.assign({},serviceSubData[k]||{},byKey[k]);});
      if(serviceSubData.n11){serviceSubData.n11.kicker='2D–3D Motion Graphic / Fashion / Sculpture Design+';serviceSubData.n11.title='2D–3D Motion / Fashion / Sculpture';}
    }
    const css=document.createElement('style');css.textContent='.video-badge{display:none!important}';document.head.appendChild(css);
  }catch(e){}
})();


/* SPLIT SUB-HEAD FIX — Motion, Fashion and Sculpture must never use one combined sub-head. */
(function(){
  try{
    const SPLIT_SPECIAL_META=[
      {key:'n11',service:'2D-3D Motion Graphic Design+',kicker:'2D-3D Motion Graphic Design+',title:'2D-3D Motion Graphic',desc:'2D/3D motion graphics, animation, storyboard and render for campaign, digital media, presentation and spatial content.',items:['2D-3D Motion | Animation','2D-3D Motion | Storyboard','2D-3D Motion | Render']},
      {key:'n12',service:'Fashion Design+',kicker:'Fashion Design+',title:'Fashion Design',desc:'Fashion design, styling direction, campaign look, wardrobe concept and editorial direction for brand communication.',items:['Fashion | Direction','Fashion | Styling','Fashion | Campaign']},
      {key:'n13',service:'Sculpture Design+',kicker:'Sculpture Design+',title:'Sculpture Design',desc:'Sculpture, 3D art, character, prototype and 3D print work for exhibitions, retail display and commercial art installation.',items:['Sculpture | 3D Print','Sculpture | Character','Sculpture | Prototype']}
    ];
    const specialServices=SPLIT_SPECIAL_META.map(x=>x.service);
    const isCombinedSpecial=function(v){
      const t=String(v||'').toLowerCase().replace(/[–—]/g,'-');
      return t.includes('motion') && t.includes('fashion') && t.includes('sculpture');
    };
    if(Array.isArray(DOPIOUS_HOW_TAXONOMY)){
      for(let i=DOPIOUS_HOW_TAXONOMY.length-1;i>=0;i--){
        if(specialServices.includes(DOPIOUS_HOW_TAXONOMY[i].service)) DOPIOUS_HOW_TAXONOMY.splice(i,1);
      }
      SPLIT_SPECIAL_META.forEach(m=>DOPIOUS_HOW_TAXONOMY.push(m));
    }
    if(typeof serviceSubData==='object'){
      SPLIT_SPECIAL_META.forEach(m=>{ serviceSubData[m.key]={kicker:m.kicker,title:m.title,desc:m.desc,items:m.items}; });
      if(serviceSubData.n11 && isCombinedSpecial(serviceSubData.n11.kicker)){serviceSubData.n11=SPLIT_SPECIAL_META[0];}
    }
    if(typeof _SERVICE_KEY_MATCH==='object'){
      _SERVICE_KEY_MATCH.n11=['2D-3D Motion Graphic Design+'];
      _SERVICE_KEY_MATCH.n12=['Fashion Design+'];
      _SERVICE_KEY_MATCH.n13=['Sculpture Design+'];
    }
    projectSubLabel=function(p,rawSub,svc){
      const m=taxMetaForService(svc);
      const saved=cleanCardText((p&&p.subHeadline)||'');
      const fixedSaved=isCombinedSpecial(saved)?'':saved;
      const raw=cleanCardText(rawSub);
      return fixedSaved || raw || m.kicker || labelOfService(svc);
    };
    projectHeadLabel=function(p,svc){
      const m=taxMetaForService(svc);
      const saved=cleanCardText((p&&p.headline)||'');
      const fixedSaved=isCombinedSpecial(saved)?'':saved;
      return fixedSaved || m.title || labelOfService(svc);
    };
    window.addEventListener('DOMContentLoaded',function(){
      try{
        const n11=document.querySelector('.mind-node.n11 span'); if(n11) n11.innerHTML='Graphic Design<em>+</em>';
      }catch(e){}
    });
  }catch(e){console.warn('[Dopious] split sub-head patch failed',e);}
})();


/* FINAL PATCH — one service Head and 1-3 selected Sub Heads on each service card */
(function(){
  const CARD_TAXONOMY=[
    {service:'Brand Strategy Corporate Identity Design+',head:'Brand Strategy Corporate Identity Design+',items:['Brand Strategy','Corporate Identity','Logo System','Brand Guideline']},
    {service:'Industrial Design+',head:'Industrial Design+',items:['Product Design','CMF','Prototype Direction','Manufacturing Support']},
    {service:'Space Design+',head:'Space Design+',items:['Space | Event','Space | Interior','Space | Exterior','Space | Kiosk','Space | Pop-up Store','Space | Exhibition Booth','Space | Retail']},
    {service:'Keyvisual Creative Ads Design+',head:'Keyvisual Creative Ads Design+',items:['Keyvisual','Creative Ads','OOH','Social Visual','Campaign Visual']},
    {service:'Graphic Design+',head:'Graphic Design+',items:['Graphic | Layout','Graphic | Poster','Graphic | Brochure','Graphic | Signage','Graphic | Deck','Graphic | Artwork']},
    {service:'Packaging Design+',head:'Packaging Design+',items:['Packaging | Brand Extension','Packaging | Label System','Packaging | Mockup']},
    {service:'Website UX-UI Design+',head:'Website UX-UI Design+',items:['Website UX-UI | Landing Page','Website UX-UI | Portfolio','Website UX-UI | System']},
    {service:'Photo / Video / Ads Design+',head:'Photo / Video / Ads Design+',items:['Photo Direction','Video Production','Commercial Ads','Content Package']},
    {service:'2D-3D Motion Graphic Design+',head:'2D-3D Motion Graphic Design+',items:['2D-3D Motion | Animation','2D-3D Motion | Storyboard','2D-3D Motion | Render']},
    {service:'Fashion Design+',head:'Fashion Design+',items:['Fashion | Direction','Fashion | Styling','Fashion | Campaign']},
    {service:'Sculpture Design+',head:'Sculpture Design+',items:['Sculpture | 3D Print','Sculpture | Character','Sculpture | Prototype']},
    {service:'Prototype 3D Print Service',head:'Prototype 3D Print Service',items:['Prototype','3D Print','Scale Model','Mockup']},
    {service:'Production Follow Up',head:'Production Follow Up',items:['Production','Supplier Coordination','Material Sourcing','QC','Delivery Follow-up']},
    {service:'Build & Installation+',head:'Build & Installation+',items:['Build','Installation','Site Work','Fit-out']},
    {service:'Marketing',head:'Marketing+',items:['Marketing | Campaign Planning','Marketing | Social Media','Marketing | Brand Communication','Marketing | Follow Up','Marketing | Media Buying']}
  ];
  window.DOPIOUS_CARD_TAXONOMY=CARD_TAXONOMY;
  function normTax(s){return String(s||'').toLowerCase().replace(/[–—]/g,'-').replace(/\+/g,'').replace(/[^a-z0-9]+/g,'').trim();}
  function metaForSvc(s){
    const svc=(typeof normSvc==='function')?normSvc(s):String(s||'');
    return CARD_TAXONOMY.find(x=>x.service===svc)||CARD_TAXONOMY.find(x=>normTax(x.service)===normTax(svc))||{service:svc,head:(svc||'Dopious+'),items:[]};
  }
  function headLabel(s){return metaForSvc(s).head || String(s||'Dopious+');}
  function htmlPlus(s){return esc(String(s||'').replace(/\s+/g,' ').trim()).replace(/\+/g,'<em>+</em>');}
  function unique(arr){const seen=new Set(),out=[];(arr||[]).forEach(x=>{x=String(x||'').replace(/\s+/g,' ').trim();if(!x||x==='Other'||x.indexOf('— Select')===0)return;const k=normTax(x);if(!seen.has(k)){seen.add(k);out.push(x);}});return out;}
  function splitSubString(v){
    if(Array.isArray(v))return v;
    v=String(v||'').trim(); if(!v)return [];
    if(v.includes('|||'))return v.split('|||');
    if(v.includes('\n'))return v.split(/\n+/);
    if(v.includes(','))return v.split(/,+/);
    return [v];
  }
  window.cardSubHeadsForProject=function(p,svc){
    p=p||{}; const meta=metaForSvc(svc||p.service||p.svc);
    let arr=[];
    ['subHeads','subheads','subServices','selectedSubHeads'].forEach(k=>{if(!arr.length&&Array.isArray(p[k]))arr=p[k];});
    if(!arr.length)arr=splitSubString(p.subHeadline||'');
    if(!arr.length)arr=splitSubString(p.sub||'');
    arr=unique(arr).filter(x=>!CARD_TAXONOMY.some(m=>normTax(m.head)===normTax(x)||normTax(m.service)===normTax(x)));
    const allowed=(meta.items||[]).map(normTax);
    if(allowed.length){
      const filtered=arr.filter(x=>allowed.includes(normTax(x)) || allowed.some(a=>normTax(x).includes(a)||a.includes(normTax(x))));
      if(filtered.length)arr=filtered;
    }
    if(!arr.length && (meta.items||[]).length)arr=[meta.items[0]];
    return unique(arr).slice(0,3);
  };
  window.cardHeadForProject=function(p,svc){return headLabel(svc||p?.service||p?.svc);};
  projectHeadLabel=function(p,svc){return window.cardHeadForProject(p,svc);};
  projectSubLabel=function(p,rawSub,svc){return window.cardSubHeadsForProject(Object.assign({},p||{},{sub:p?.sub||rawSub}),svc).join(' / ');};
  normProject=function(p,i,src){
    p=p||{};
    const cover=p.covUrl||p.coverImage||p.cover||p.coverThumb||'';
    const gallery=(typeof arrUrl==='function')?arrUrl(p.galleryImages&&p.galleryImages.length?p.galleryImages:(p.gallery&&p.gallery.length?p.gallery:(p.images||[]))):[];
    const name=p.name||p.nm||p.title||'Untitled';
    const svc=(typeof normSvc==='function')?normSvc(p.service||p.svc||p.cat||''):(p.service||p.svc||'');
    const subHeads=window.cardSubHeadsForProject(p,svc);
    return Object.assign({},p,{
      _id:p._id||p.id||(src+'_'+i),_legacy:src==='old',
      nm:name,name,cl:p.client||p.cl||'',client:p.client||p.cl||'',
      cr:p.credit||p.cr||'Dopious+',credit:p.credit||p.cr||'Dopious+',
      svc,service:svc,sub:subHeads[0]||p.sub||'',subHeads:subHeads,subHeadline:subHeads.join(' / '),headline:headLabel(svc),
      yr:p.year||p.yr||'2026',year:p.year||p.yr||'2026',
      ds:p.desc||p.ds||'',desc:p.desc||p.ds||'',
      covUrl:cover,cover,coverImage:cover,coverThumb:p.coverThumb||(cover&&isDr(cover)?dTh(cover,400):cover),
      lqip:p.lqip||(cover&&isDr(cover)?dTh(cover,20):''),
      gallery,galleryImages:gallery,galleryCaptions:p.galleryCaptions||[],
      vurl:p.vurl||p.videoUrl||'',videoUrl:p.videoUrl||p.vurl||'',driveFolderUrl:p.driveFolderUrl||''
    });
  };
  function labelHTML(head,subs){return '<span class="card-head">'+htmlPlus(head)+'</span><div class="card-sub-list">'+(subs||[]).slice(0,3).map(x=>'<em>'+esc(x)+'</em>').join('')+'</div>';}
  slideMedia=function(p,ai,labelTop,labelBot,bg){
    const img=getCov(p); const video=p.videoUrl||p.vurl||'';
    const useVideo=!!video && (String(p.previewType||p.cardPreviewType||'').toLowerCase().includes('video') || !img || /photo\s*\/\s*video/i.test(String(p.service||p.svc||'')));
    const svc=p.service||p.svc||''; const subs=window.cardSubHeadsForProject(p,svc); const head=window.cardHeadForProject(p,svc);
    return {ai:ai,title:p.name||p.nm||'Untitled',img:img,video:video,isVideo:useVideo,bg:bg,desc:p.desc||p.ds||'',head:head,subHeads:subs,service:svc,sub:(subs||[]).join('|||')};
  };
  const ORDER=['Build & Installation+','Space Design+','Keyvisual Creative Ads Design+','2D-3D Motion Graphic Design+','Industrial Design+','Prototype 3D Print Service','Brand Strategy Corporate Identity Design+','Graphic Design+','Packaging Design+','Photo / Video / Ads Design+','Fashion Design+','Sculpture Design+','Website UX-UI Design+','Marketing','Production Follow Up'];
  rSvc=function(){
    const g=document.getElementById('sG'); if(!g)return;
    Object.keys(_tm2||{}).forEach(k=>clearInterval(_tm2[k])); _tm2={}; _ac={};
    const groups={};
    (_P||[]).forEach((p,ai)=>{let svc=(typeof normSvc==='function')?normSvc(p.service||p.svc||p.cat||p.category||'Other'):(p.service||'Other'); if(!svc)svc='Other'; if(!groups[svc])groups[svc]=[]; groups[svc].push({p,ai});});
    const keys=Object.keys(groups).sort((a,b)=>{let ia=ORDER.indexOf(a),ib=ORDER.indexOf(b); if(ia<0)ia=999;if(ib<0)ib=999; return ia-ib||a.localeCompare(b);});
    let html='';
    keys.forEach((svc,si)=>{
      const meta=metaForSvc(svc), ci=(typeof serviceIndex==='function')?serviceIndex(svc):-1, cat=ci>=0?CATS[ci]:null, bg=(cat&&cat.bg)||'#111';
      html+='<div class="svc-cat-divider">'+htmlPlus(meta.head)+'</div>';
      const slides=groups[svc].map(x=>slideMedia(x.p,x.ai,'','',bg));
      const id='csHead_'+String(svc).replace(/[^a-zA-Z0-9]/g,'_').slice(0,52)+'_'+si;
      const controls=slides.length>1?'<div class="cat-slide-controls"><button class="cat-slide-btn" data-dir="-1" type="button">‹</button><span class="cat-slide-count">1 / '+slides.length+'</span><button class="cat-slide-btn" data-dir="1" type="button">›</button></div>':'';
      const layers=slides.map(renderLayer).join('');
      const safe=JSON.stringify(slides.map(s=>({ai:s.ai,title:s.title,desc:s.desc,isVideo:s.isVideo,video:s.video,service:s.service,sub:s.sub,head:s.head,subHeads:s.subHeads}))).replace(/'/g,'&#39;');
      const first=slides[0]||{}; const firstDesc=cleanCardText(first.desc||'');
      html+='<article class="cat-slide-card" id="'+id+'" data-service="'+esc(svc)+'" data-sub="'+esc((first.subHeads||[]).join('|||'))+'" data-slides=\''+safe+'\'>'+layers+'<div class="cat-slide-top"><div class="cat-slide-name">'+esc(first.title||'')+'</div>'+controls+'</div><div class="cat-slide-label tax-card-label">'+labelHTML(first.head||meta.head,first.subHeads||[])+'</div><div class="svc-desc" '+(firstDesc?'':'style="display:none"')+'><p>'+esc(firstDesc)+'</p></div><button class="stp" aria-label="View" onclick="oCardProject(event,\''+id+'\')"></button></article>';
    });
    g.innerHTML=html||CATS.slice(0,8).map(c=>'<article class="cat-slide-card sk"><div class="cat-slide-layer is-on" style="background:'+c.bg+'"></div><div class="cat-slide-label tax-card-label">'+labelHTML(headLabel(c.svc),(metaForSvc(c.svc).items||[]).slice(0,3))+'</div></article>').join('');
    g.querySelectorAll('img[data-src]').forEach(img=>IO&&IO.observe(img));
    g.querySelectorAll('.cat-slide-card[id]').forEach(card=>{_ac[card.id]=0;card.querySelectorAll('.cat-slide-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();setCardSlide(card,parseInt(btn.dataset.dir||'1',10));clearInterval(_tm2[card.id]);const sl=cardSlides(card);if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);}));const sl=cardSlides(card);if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);});
    const el=document.getElementById('sCt'); if(el){const t=(_P||[]).length;el.textContent=t?(t+' Project'+(t>1?'s':'')+' — Live'):'Upload projects from Admin';}
  };
  setCardSlide=function(card,dir){
    if(!card)return; const sl=cardSlides(card); if(!sl.length)return; const nx=((_ac[card.id]||0)+dir+sl.length)%sl.length; _ac[card.id]=nx;
    card.querySelectorAll('.cat-slide-layer').forEach((l,i)=>{l.classList.toggle('is-on',i===nx);const v=l.querySelector('video');if(v){if(i===nx){v.play&&v.play().catch(()=>{});}else{try{v.pause()}catch(e){}}}});
    const layer=card.querySelector('.cat-slide-layer[data-layer="'+nx+'"]'); if(layer){const img=layer.querySelector('img[data-src]'); if(img)ldI(img,img.dataset.src); const v=layer.querySelector('video:not([autoplay])'); if(v){v.setAttribute('autoplay','');try{v.play().catch(()=>{})}catch(e){}}}
    const s=sl[nx]||{}; const n=card.querySelector('.cat-slide-name'); if(n)n.textContent=s.title||''; const c=card.querySelector('.cat-slide-count'); if(c)c.textContent=(nx+1)+' / '+sl.length; const desc=card.querySelector('.svc-desc'); if(desc){const t=cleanCardText(s.desc); desc.style.display=t?'block':'none'; desc.innerHTML='<p>'+esc(t)+'</p>';}
    const lab=card.querySelector('.cat-slide-label'); if(lab){lab.classList.add('tax-card-label'); lab.innerHTML=labelHTML(s.head||headLabel(s.service),s.subHeads||[]);} card.dataset.sub=(s.subHeads||[]).join('|||');
  };
  try{if(Array.isArray(_P)&&_P.length)rSvc();}catch(e){}
})();

/* FINAL TAXONOMY PATCH — 1 Head + 1-3 Sub Heads, group by exact Head + Sub Heads */
(function(){
  const FINAL_TAXONOMY=[
    {key:'n1',service:'Brand Strategy / Corporate Identity / Design+',head:'Brand Strategy / Corporate Identity / Design+',aliases:['Brand Strategy Corporate Identity Design+','Brand Strategy / Corporate Identity / Design+'],items:['Brand Strategy','Corporate Identity','Brand Story','Logo','Visual Identity','Brand Guideline','Campaign Identity','Art Direction']},
    {key:'n3',service:'Industrial Design+',head:'Industrial Design+',aliases:['Industrial Design+'],items:['Product','Product Concept','CMF','Form','User Experience','Prototype','Product Visualization','Packaging Structure','Material','Manufacturing']},
    {key:'n4',service:'Space Design+',head:'Space Design+',aliases:['Space Design+'],items:['Interior','Retail Space','Exhibition','Pop-up Space','Event Space','Visual Merchandising','Customer Journey','Spatial Storytelling','Brand Environment','Mall Decoration']},
    {key:'n2',service:'Key Visual / Creative Ads / Design+',head:'Key Visual / Creative Ads / Design+',aliases:['Keyvisual Creative Ads Design+','Key Visual Creative Ads Design+','Key Visual / Creative Ads / Design+'],items:['Key Visual','Campaign Visual','Ads','Art Direction','Advertising Direction','Promotion Visual','Social Media','Launch Campaign','Seasonal Campaign','Storyboard','Visual Storytelling']},
    {key:'n9',service:'Graphic Design+',head:'Graphic Design+',aliases:['Graphic Design+','Packaging Design+'],items:['Graphic','Layout','Poster','Social Media','Print','Typography','Illustration','Signage','Presentation','Visual System','Packaging Graphic','Label','Box Artwork']},
    {key:'n_website',service:'Website / UX-UI Design+',head:'Website / UX-UI Design+',aliases:['Website UX-UI Design+','Website / UX-UI Design+'],items:['Website','UX-UI','Landing Page','Web Experience','Interface','Digital Branding','Mobile Experience','User Journey','Conversion']},
    {key:'n13',service:'Sculpture Design+',head:'Sculpture Design+',aliases:['Sculpture Design+'],items:['Sculpture','Art Installation','Public Art','Character Sculpture','Decorative Object','Landmark','3D Art Form','Spatial Art','Fabrication Concept']},
    {key:'n12',service:'Fashion Design+',head:'Fashion Design+',aliases:['Fashion Design+'],items:['Fashion','Costume','Uniform','Styling Direction','Fashion Concept','Textile Direction','Character Styling','Campaign Styling','Showpiece']},
    {key:'n11',service:'2D-3D Motion Graphic Design+',head:'2D-3D Motion Graphic Design+',aliases:['2D-3D Motion Graphic Design+','2D–3D Motion Graphic Design+'],items:['Motion Graphic','2D Animation','3D Animation','Logo Motion','Social Motion','Event Motion','LED Screen','Product Animation','Visual Effects','Storyboard','Animatic']},
    {key:'n7',service:'Photo / Video / Ads Design+',head:'Photo / Video / Ads Design+',aliases:['Photo / Video / Ads Design+'],items:['Photo Direction','Video Production','Ads Video','Product Shooting','Campaign Shooting','Lifestyle Content','Short Video','Brand Film','Storyboard','Shot List','Video Treatment']},
    {key:'n10',service:'Build & Installation+',head:'Build & Installation+',aliases:['Build & Installation+'],items:['Build & Installation','Production Service','Fabrication','On-site Installation','Material Execution','Supplier Coordination','Display Production','Quality Control','Production Follow-up']},
    {key:'n5',service:'Prototype / 3D Print Service+',head:'Prototype / 3D Print Service+',aliases:['Prototype 3D Print Service','Prototype / 3D Print Service+'],items:['Prototype','3D Printing','Mockup','Product Testing','Model Making','Form Study','Validation','Sample Development','Rapid Prototype']},
    {key:'n8',service:'Marketing / Brand Communication+',head:'Marketing / Brand Communication+',aliases:['Marketing','Marketing+','Marketing / Brand Communication+'],items:['Marketing Strategy','Brand Communication','Campaign Planning','Content Strategy','Promotion Planning','Launch Strategy','Social Media Direction','Brand Activation','Campaign Narrative']},
    {key:'n6',service:'Production Follow-up+',head:'Production Follow-up+',aliases:['Production Follow Up','Production Follow-up+'],items:['Production Follow-up','Supplier Briefing','Production Control','Coordination','Fabrication Check','On-site Supervision','Material Approval','Final Delivery']}
  ];
  window.DOPIOUS_FINAL_TAXONOMY=FINAL_TAXONOMY;
  function nrm(s){return String(s||'').toLowerCase().replace(/[–—]/g,'-').replace(/\+/g,'').replace(/[^a-z0-9]+/g,'').trim();}
  function htmlPlusLocal(s){return esc(String(s||'').replace(/\s+/g,' ').trim()).replace(/\+/g,'<em>+</em>');}
  function uniqueLocal(arr){const seen=new Set(),out=[];(arr||[]).forEach(v=>{v=String(v||'').replace(/\s+/g,' ').trim();if(!v||v==='Other'||/^—/.test(v))return;const k=nrm(v);if(!seen.has(k)){seen.add(k);out.push(v);}});return out;}
  function metaByService(v){const key=nrm(v);return FINAL_TAXONOMY.find(m=>nrm(m.service)===key||(m.aliases||[]).some(a=>nrm(a)===key))||null;}
  function metaByHead(v){const key=nrm(v);return FINAL_TAXONOMY.find(m=>nrm(m.head)===key)||metaByService(v);}
  const oldBg=(...names)=>{for(const name of names){const c=(CATS||[]).find(x=>nrm(x.svc)===nrm(name)||nrm(x.cat)===nrm(name)); if(c&&c.bg)return c.bg;} return 'linear-gradient(90deg,rgba(10,10,10,.88),rgba(255,42,20,.16)),#111';};
  try{
    CATS.length=0;
    FINAL_TAXONOMY.forEach(m=>CATS.push({cat:m.head.toUpperCase(),svc:m.service,bg:oldBg(m.service,...(m.aliases||[]))}));
    Object.keys(S2C).forEach(k=>delete S2C[k]);
    CATS.forEach((c,i)=>{S2C[c.svc]=i;(metaByService(c.svc)?.aliases||[]).forEach(a=>{S2C[a]=i;});});
  }catch(e){console.warn('[Dopious] CATS taxonomy patch failed',e);}
  normSvc=function(v){
    v=String(v||'').trim(); if(!v)return'';
    const m=metaByService(v)||metaByHead(v); if(m)return m.service;
    return v;
  };
  serviceIndex=function(s){const sv=normSvc(s);return S2C[sv]!==undefined?S2C[sv]:-1;};
  function splitSubs(v){
    if(Array.isArray(v))return v;
    v=String(v||'').trim(); if(!v)return[];
    if(v.includes('|||'))return v.split('|||');
    if(v.includes('\n'))return v.split(/\n+/);
    if(v.includes(','))return v.split(/,+/);
    if(v.includes(' / '))return v.split(/\s+\/\s+/);
    return [v];
  }
  function normalizeLegacySub(x,meta,originalService){
    const k=nrm(x); if(!k)return'';
    const exact=(meta.items||[]).find(it=>nrm(it)===k); if(exact)return exact;
    const partial=(meta.items||[]).find(it=>nrm(it).includes(k)||k.includes(nrm(it))); if(partial)return partial;
    if(nrm(originalService)==='packagingdesign'){
      if(/label/.test(k))return 'Label';
      if(/box|artwork/.test(k))return 'Box Artwork';
      if(/structure|structural|mockup/.test(k))return 'Packaging Graphic';
      return 'Packaging Graphic';
    }
    return '';
  }
  window.cardSubHeadsForProject=function(p,svc){
    p=p||{}; const service=normSvc(svc||p.service||p.svc||p.cat||''); const meta=metaByService(service)||FINAL_TAXONOMY[0];
    let arr=[];
    ['subHeads','subheads','subServices','selectedSubHeads'].forEach(k=>{if(!arr.length&&Array.isArray(p[k]))arr=p[k];});
    if(!arr.length)arr=splitSubs(p.subHeadline||p.projectSubHeadline||'');
    if(!arr.length)arr=splitSubs(p.sub||p.subtitle||p.subhead||p.subHead||'');
    arr=uniqueLocal(arr).map(x=>normalizeLegacySub(x,meta,p.service||p.svc||'')).filter(Boolean);
    if(!arr.length && nrm(p.service||p.svc)==='packagingdesign')arr=['Packaging Graphic'];
    if(!arr.length)arr=[(meta.items||[])[0]||''];
    return uniqueLocal(arr).slice(0,3);
  };
  window.cardHeadForProject=function(p,svc){const m=metaByService(normSvc(svc||p?.service||p?.svc||p?.cat||''));return (m&&m.head)||String(svc||'Dopious+');};
  projectHeadLabel=function(p,svc){return window.cardHeadForProject(p,svc);};
  projectSubLabel=function(p,rawSub,svc){return window.cardSubHeadsForProject(Object.assign({},p||{},{sub:(p&&p.sub)||rawSub}),svc).join(' / ');};
  const oldNormProject=normProject;
  normProject=function(p,i,src){
    const np=oldNormProject?oldNormProject(p,i,src):Object.assign({},p||{});
    const oldService=(p&&((p.service||p.svc||p.cat)||''))||np.service||np.svc||'';
    const svc=normSvc(oldService); const meta=metaByService(svc)||FINAL_TAXONOMY[0]; const subs=window.cardSubHeadsForProject(Object.assign({},p,np),svc);
    return Object.assign({},np,{svc,service:svc,headline:meta.head,projectHeadline:meta.head,subHeads:subs,subheads:subs,subServices:subs,selectedSubHeads:subs,sub:subs[0]||'',subHeadline:subs.join(' / '),projectSubHeadline:subs.join(' / ')});
  };
  function canonicalSubKey(subs,meta){
    const order=(meta&&meta.items)||[];
    return uniqueLocal(subs).slice(0,3).sort((a,b)=>{
      const ia=order.findIndex(x=>nrm(x)===nrm(a));
      const ib=order.findIndex(x=>nrm(x)===nrm(b));
      const aa=ia<0?999:ia, bb=ib<0?999:ib;
      return aa-bb || String(a).localeCompare(String(b));
    }).join(' / ');
  }
  function groupKeyForProject(p){
    const svc=normSvc(p.service||p.svc||p.cat||'Other');
    const meta=metaByService(svc)||{items:[]};
    const subs=window.cardSubHeadsForProject(p,svc);
    return svc+'|'+canonicalSubKey(subs,meta);
  }
  function labelHTML(head,subs){return '<span class="card-head">'+htmlPlusLocal(head)+'</span><div class="card-sub-list">'+(subs||[]).slice(0,3).map(x=>'<em>'+esc(x)+'</em>').join('')+'</div>';}
  const ORDER=FINAL_TAXONOMY.map(x=>x.service);
  rSvc=function(){
    const g=document.getElementById('sG'); if(!g)return;
    Object.keys(_tm2||{}).forEach(k=>clearInterval(_tm2[k])); _tm2={}; _ac={};
    const headGroups={};
    (_P||[]).forEach((p,ai)=>{
      const svc=normSvc(p.service||p.svc||p.cat||p.category||'Other')||'Other';
      const meta=metaByService(svc)||{service:svc,head:svc,items:[]};
      const subs=window.cardSubHeadsForProject(p,svc);
      const gk=groupKeyForProject(p);
      if(!headGroups[svc])headGroups[svc]={meta,groups:{}};
      if(!headGroups[svc].groups[gk])headGroups[svc].groups[gk]={svc,head:meta.head,subHeads:subs,items:[]};
      headGroups[svc].groups[gk].items.push({p,ai});
    });
    const svcKeys=Object.keys(headGroups).sort((a,b)=>{let ia=ORDER.indexOf(a),ib=ORDER.indexOf(b); if(ia<0)ia=999;if(ib<0)ib=999; return ia-ib||a.localeCompare(b);});
    let html='';
    svcKeys.forEach((svc,si)=>{
      const hg=headGroups[svc],meta=hg.meta,ci=serviceIndex(svc),cat=ci>=0?CATS[ci]:null,bg=(cat&&cat.bg)||'#111';
      html+='<div class="svc-cat-divider">'+htmlPlusLocal(meta.head)+'</div>';
      Object.keys(hg.groups).forEach((gk,gi)=>{
        const gr=hg.groups[gk];
        const slides=gr.items.map(x=>{
          const base=slideMedia(x.p,x.ai,'','',bg);
          base.head=gr.head; base.subHeads=gr.subHeads; base.service=svc; base.sub=gr.subHeads.join('|||');
          return base;
        });
        const id='csGrp_'+String(gk).replace(/[^a-zA-Z0-9]/g,'_').slice(0,62)+'_'+si+'_'+gi;
        const controls=slides.length>1?'<div class="cat-slide-controls"><button class="cat-slide-btn" data-dir="-1" type="button">‹</button><span class="cat-slide-count">1 / '+slides.length+'</span><button class="cat-slide-btn" data-dir="1" type="button">›</button></div>':'';
        const layers=slides.map(renderLayer).join('');
        const safe=JSON.stringify(slides.map(s=>({ai:s.ai,title:s.title,desc:s.desc,isVideo:s.isVideo,video:s.video,service:s.service,sub:s.sub,head:s.head,subHeads:s.subHeads}))).replace(/'/g,'&#39;');
        const first=slides[0]||{}, firstDesc=cleanCardText(first.desc||'');
        html+='<article class="cat-slide-card" id="'+id+'" data-service="'+esc(svc)+'" data-sub="'+esc(gr.subHeads.join('|||'))+'" data-slides=\''+safe+'\'>'+layers+'<div class="cat-slide-top"><div class="cat-slide-name">'+esc(first.title||'')+'</div>'+controls+'</div><div class="cat-slide-label tax-card-label">'+labelHTML(gr.head,gr.subHeads)+'</div><div class="svc-desc" '+(firstDesc?'':'style="display:none"')+'><p>'+esc(firstDesc)+'</p></div><button class="stp" aria-label="View" onclick="oCardProject(event,\''+id+'\')"></button></article>';
      });
    });
    g.innerHTML=html||CATS.slice(0,8).map(c=>'<article class="cat-slide-card sk"><div class="cat-slide-layer is-on" style="background:'+c.bg+'"></div><div class="cat-slide-label tax-card-label">'+labelHTML(c.svc,(metaByService(c.svc)?.items||[]).slice(0,3))+'</div></article>').join('');
    g.querySelectorAll('img[data-src]').forEach(img=>IO&&IO.observe(img));
    g.querySelectorAll('.cat-slide-card[id]').forEach(card=>{_ac[card.id]=0;card.querySelectorAll('.cat-slide-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();setCardSlide(card,parseInt(btn.dataset.dir||'1',10));clearInterval(_tm2[card.id]);const sl=cardSlides(card);if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);}));const sl=cardSlides(card);if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);});
    const el=document.getElementById('sCt'); if(el){const t=(_P||[]).length;el.textContent=t?(t+' Project'+(t>1?'s':'')+' — Live'):'Upload projects from Admin';}
  };
  setCardSlide=function(card,dir){
    if(!card)return; const sl=cardSlides(card); if(!sl.length)return; const nx=((_ac[card.id]||0)+dir+sl.length)%sl.length; _ac[card.id]=nx;
    card.querySelectorAll('.cat-slide-layer').forEach((l,i)=>{l.classList.toggle('is-on',i===nx);const v=l.querySelector('video');if(v){if(i===nx){v.play&&v.play().catch(()=>{});}else{try{v.pause()}catch(e){}}}});
    const layer=card.querySelector('.cat-slide-layer[data-layer="'+nx+'"]'); if(layer){const img=layer.querySelector('img[data-src]'); if(img)ldI(img,img.dataset.src); const v=layer.querySelector('video:not([autoplay])'); if(v){v.setAttribute('autoplay','');try{v.play().catch(()=>{})}catch(e){}}}
    const s=sl[nx]||{}; const n=card.querySelector('.cat-slide-name'); if(n)n.textContent=s.title||''; const c=card.querySelector('.cat-slide-count'); if(c)c.textContent=(nx+1)+' / '+sl.length; const desc=card.querySelector('.svc-desc'); if(desc){const t=cleanCardText(s.desc); desc.style.display=t?'block':'none'; desc.innerHTML='<p>'+esc(t)+'</p>';}
    const vb=card.querySelector('.video-badge'); if(vb)vb.remove();
  };
  try{
    if(Array.isArray(DOPIOUS_HOW_TAXONOMY)){DOPIOUS_HOW_TAXONOMY.length=0; FINAL_TAXONOMY.forEach(m=>DOPIOUS_HOW_TAXONOMY.push({key:m.key,service:m.service,kicker:m.head,title:m.head.replace(/\+$/,''),items:m.items.slice()}));}
    if(typeof serviceSubData==='object'){FINAL_TAXONOMY.forEach(m=>{serviceSubData[m.key]={kicker:m.head,title:m.head.replace(/\+$/,''),desc:'เลือก Service นี้แล้วกลับไปที่หน้า Services เพื่อดูผลงานที่เกี่ยวข้อง',items:m.items.slice()};});}
  }catch(e){}
  try{if(Array.isArray(_P)&&_P.length){_P=_P.map((p,i)=>normProject(p,i,p._legacy?'old':'new'));rSvc();}}catch(e){console.warn('[Dopious] final taxonomy render failed',e);}
})();

/* FINAL PATCH — Single Sub Head only per project/card */
(function(){
  'use strict';
  function cleanOne(arr){
    arr=Array.isArray(arr)?arr:[arr];
    for(var i=0;i<arr.length;i++){
      var v=String(arr[i]||'').replace(/\s+/g,' ').trim();
      if(v && v!=='Other' && !/^—/.test(v) && v.toLowerCase()!=='creative') return [v];
    }
    return [];
  }
  if(typeof window.cardSubHeadsForProject==='function' && !window.cardSubHeadsForProject.__oneOnly){
    var oldCardSubHeadsForProject=window.cardSubHeadsForProject;
    window.cardSubHeadsForProject=function(p,svc){
      var out=cleanOne(oldCardSubHeadsForProject.call(this,p,svc));
      return out;
    };
    window.cardSubHeadsForProject.__oneOnly=true;
  }
  if(typeof window.projectSubLabel==='function'){
    window.projectSubLabel=function(p,rawSub,svc){
      return cleanOne(window.cardSubHeadsForProject(Object.assign({},p||{},{sub:(p&&p.sub)||rawSub}),svc)).join(' / ');
    };
  }
  if(typeof normProject==='function' && !normProject.__oneSubOnly){
    var oldNormProjectOne=normProject;
    normProject=function(p,i,src){
      var np=oldNormProjectOne.call(this,p,i,src);
      var subs=cleanOne(np.subHeads||np.subheads||np.subServices||np.selectedSubHeads||np.subHeadline||np.sub||[]);
      if(!subs.length && typeof window.cardSubHeadsForProject==='function') subs=cleanOne(window.cardSubHeadsForProject(np,np.service||np.svc));
      np.subHeads=subs; np.subheads=subs; np.subServices=subs; np.selectedSubHeads=subs;
      np.sub=subs[0]||''; np.subHeadline=subs.join(' / '); np.projectSubHeadline=np.subHeadline;
      return np;
    };
    normProject.__oneSubOnly=true;
  }
  setTimeout(function(){
    try{
      if(Array.isArray(_P) && _P.length){ _P=_P.map(function(p,i){return typeof normProject==='function'?normProject(p,i,p&&p._legacy?'old':'new'):p;}); }
      if(typeof rSvc==='function') rSvc();
    }catch(e){ console.warn('[Dopious] one subhead render patch failed',e); }
  },60);
})();


/* =====================================================================
   DATA ENTRY FINAL PATCH — Works/Services only
   Rule: 1 Project = 1 Head + 1 Sub head, 1 Card = 1 Head + 1 Sub head
   Group key = normalize(serviceHead) + "|" + normalize(subHead)
   ===================================================================== */
(function(){
  'use strict';
  const TAXONOMY=[
    {service:'Space Design+',head:'Space Design+',aliases:['Space Design+'],subs:['Retail','Commercial','Residential','Office','Exhibition','Event','Kiosk','Pop-up Store','VM / Display','Window Display','Art Installation']},
    {service:'Sculpture Design+',head:'Sculpture Design+',aliases:['Sculpture Design+'],subs:['Sculpture','Art Installation','Public Art','Character Sculpture','Decorative Object','Landmark','3D Art Form','Spatial Art','Fabrication Concept']},
    {service:'Visual Production+',head:'Visual Production+',aliases:['Visual Production+','2D-3D Motion Graphic Design+','2D–3D Motion Graphic Design+','Photo / Video / Ads Design+','Photo Video Ads Design+','Motion Design+'],subs:['Storyboard','Animatic','Motion Graphic','2D Animation','3D Animation','2D Visualization','3D Visualization','3D Composite','Visual Effects','LED Screen','Product Animation','VDO Production','Photo Production','Ads Production','Post Production','Shot Direction','Brand Film']},
    {service:'Graphic Design+',head:'Graphic Design+',aliases:['Graphic Design+','Packaging Design+'],subs:['Graphic','Illustration','Layout','Poster','Social Media','Print','Typography','Signage','Presentation','Visual System','Packaging Graphic','Label','Box Artwork','Infographic','Icon','Character Graphic','Pattern','Menu','Brochure','Catalogue','Key Art']},
    {service:'Branding Design+',head:'Branding Design+',aliases:['Branding Design+','Brand Strategy Corporate Identity Design+','Brand Strategy / Corporate Identity / Design+','Brand Strategy / Corporate Identity Design+','Brand Strategy+'],subs:['Brand Strategy','Brand Story','Logo','Visual Identity','Brand Guideline','Campaign Identity','Art Direction','Naming','Mood & Tone','Brand Communication']},
    {service:'Key Visual Design+',head:'Key Visual Design+',aliases:['Key Visual Design+','Keyvisual Creative Ads Design+','Key Visual / Creative Ads / Design+','Key Visual Creative Ads Design+'],subs:['Key Visual','Campaign Visual','Ads','Art Direction','Advertising Direction','Promotion Visual','Social Media','Launch Campaign','Seasonal Campaign','Storyboard','Visual Storytelling']},
    {service:'Build & Install+',head:'Build & Install+',aliases:['Build & Install+','Build & Installation+'],subs:['Booth Production','Display Production','Event Production','Fabrication','On-site Installation','Site Supervision','Material Execution','Supplier Coordination','Quality Control','Final Delivery']},
    {service:'Production Sourcing+',head:'Production Sourcing+',aliases:['Production Sourcing+','Production Follow Up','Production Follow-up+','Marketing / Brand Communication+','Marketing+','Marketing'],subs:['Product Sourcing','Supplier Coordination','Factory Follow-up','Sample Development','Material Sourcing','Production Control','Quality Check','Final Delivery','Premium Gift','Merchandise','Corporate Gift']},
    {service:'Industrial Design+',head:'Industrial Design+',aliases:['Industrial Design+','Prototype / 3D Print Service+','Prototype 3D Print Service'],subs:['Product','Product Concept','CMF','Form','User Experience','Prototype','Product Visualization','Packaging Structure','Material','Manufacturing','Premium Product','Merchandise','Corporate Gift']},
    {service:'Corporate Design+',head:'Corporate Design+',aliases:['Corporate Design+','Corporate Identity+'],subs:['Corporate Identity','Brand System','Company Profile','Presentation','Stationery','Corporate Graphic','Visual System','Office Collateral','Business Document']},
    {service:'Digital Design+',head:'Digital Design+',aliases:['Digital Design+','Website / UX-UI Design+','Website UX-UI Design+','Website UX/UI Design+'],subs:['Website','UX-UI','Landing Page','Web Experience','Interface','Digital Branding','Mobile Experience','User Journey','Conversion','Portfolio Website','Service Website']},
    {service:'Fashion Design+',head:'Fashion Design+',aliases:['Fashion Design+'],subs:['Fashion','Costume','Uniform','Styling Direction','Fashion Concept','Textile Direction','Character Styling','Campaign Styling','Showpiece']},
    {service:'Creative Consultation+',head:'Creative Consultation+',aliases:['Creative Consultation+','Creative Consulting+'],subs:['Creative Brief','Concept Direction','Design Direction','Budget Planning','Scope Planning','Material Consulting','Production Consulting','Supplier Consulting','Campaign Consulting','Brand Consulting','Space Consulting','Product Consulting']}
  ];
  window.DOPIOUS_DATA_ENTRY_TAXONOMY=TAXONOMY;
  function cleanText(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function key(v){return cleanText(v).toLowerCase().replace(/[–—]/g,'-').replace(/\+/g,'').replace(/[^a-z0-9ก-๙]+/gi,' ').replace(/\s+/g,' ').trim();}
  function htmlPlus(v){return esc(cleanText(v)).replace(/\+/g,'<em>+</em>');}
  function findHead(v){const k=key(v);return TAXONOMY.find(m=>key(m.service)===k||key(m.head)===k||(m.aliases||[]).some(a=>key(a)===k))||null;}
  function normalizeService(v){const m=findHead(v);return m?m.service:cleanText(v);}
  function metaFor(v){return findHead(v)||TAXONOMY[0];}
  function parseOldSubs(v){
    if(Array.isArray(v))return v.map(cleanText).filter(Boolean);
    v=cleanText(v); if(!v)return [];
    if(v.indexOf('|||')>-1)return v.split('|||').map(cleanText).filter(Boolean);
    if(v.indexOf('\n')>-1)return v.split(/\n+/).map(cleanText).filter(Boolean);
    if(v.indexOf(',')>-1)return v.split(/,+/).map(cleanText).filter(Boolean);
    if(v.indexOf(' / ')>-1)return v.split(/\s+\/\s+/).map(cleanText).filter(Boolean);
    return [v];
  }
  function matchSub(raw,meta,originalService){
    const list=(meta&&meta.subs)||[];
    const r=cleanText(raw); if(!r||key(r)==='creative')return '';
    let found=list.find(x=>key(x)===key(r)); if(found)return found;
    found=list.find(x=>key(x).includes(key(r))||key(r).includes(key(x))); if(found)return found;
    const os=key(originalService||'');
    if(os==='packagingdesign'){
      if(/structure|structural/.test(key(r)))return meta.service==='Industrial Design+'?'Packaging Structure':'Packaging Graphic';
      if(/label/.test(key(r)))return 'Label';
      if(/box|artwork/.test(key(r)))return 'Box Artwork';
      return meta.service==='Industrial Design+'?'Packaging Structure':'Packaging Graphic';
    }
    return '';
  }
  function projectService(p){return normalizeService(p&&((p.service)||(p.svc)||(p.cat)||(p.category)||(p.head)||(p.projectHeadline))||'');}
  function projectSub(p,svc){
    p=p||{}; const meta=metaFor(svc); let arr=[];
    if(p.subHead)arr=[p.subHead];
    else if(p.sub)arr=[p.sub];
    else if(p.subhead)arr=[p.subhead];
    else if(p.subHeadline)arr=parseOldSubs(p.subHeadline);
    else if(p.projectSubHeadline)arr=parseOldSubs(p.projectSubHeadline);
    else if(Array.isArray(p.subHeads))arr=p.subHeads;
    else if(Array.isArray(p.subheads))arr=p.subheads;
    else if(Array.isArray(p.subServices))arr=p.subServices;
    else if(Array.isArray(p.selectedSubHeads))arr=p.selectedSubHeads;
    for(let i=0;i<arr.length;i++){const m=matchSub(arr[i],meta,p.service||p.svc); if(m)return m;}
    // old packaging head is removed; keep first sensible packaging sub if possible
    if(key(p.service||p.svc)==='packagingdesign')return meta.service==='Industrial Design+'?'Packaging Structure':'Packaging Graphic';
    return 'General';
  }
  function exactGroupKey(svc,sub){return key(svc)+'|'+key(sub||'General');}
  const oldNormSvc=typeof normSvc==='function'?normSvc:null;
  normSvc=function(v){return normalizeService(oldNormSvc?oldNormSvc(v):v);};
  serviceIndex=function(s){const sv=normalizeService(s);return (typeof S2C==='object'&&S2C[sv]!==undefined)?S2C[sv]:-1;};
  try{
    const oldCats=(Array.isArray(CATS)?CATS.slice():[]);
    function bgFor(m){
      const all=[m.service,m.head].concat(m.aliases||[]);
      for(const n of all){const c=oldCats.find(x=>key(x.svc)===key(n)||key(x.cat)===key(n)); if(c&&c.bg)return c.bg;}
      return 'linear-gradient(90deg,rgba(10,10,10,.88),rgba(255,42,20,.16)),#111';
    }
    if(Array.isArray(CATS)){CATS.length=0;TAXONOMY.forEach(m=>CATS.push({cat:m.head.toUpperCase(),svc:m.service,bg:bgFor(m)}));}
    if(typeof S2C==='object'){Object.keys(S2C).forEach(k=>delete S2C[k]);TAXONOMY.forEach((m,i)=>{S2C[m.service]=i;(m.aliases||[]).forEach(a=>S2C[a]=i);});}
  }catch(e){}
  const oldNormProject=typeof normProject==='function'?normProject:null;
  normProject=function(p,i,src){
    const base=oldNormProject?oldNormProject(p,i,src):Object.assign({},p||{}); const raw=Object.assign({},p||{},base||{});
    const svc=projectService(raw)||'Creative Consultation+'; const meta=metaFor(svc); const sub=projectSub(raw,svc)||'General';
    const cover=raw.covUrl||raw.coverImage||raw.cover||raw.coverThumb||raw.cardThumb||'';
    const gallery=Array.isArray(raw.galleryImages)?raw.galleryImages:(Array.isArray(raw.gallery)?raw.gallery:[]);
    return Object.assign({},base,{
      svc:svc,service:svc,headline:meta.head,projectHeadline:meta.head,
      subHead:sub,sub:sub,subHeads:[sub],subheads:[sub],subServices:[sub],selectedSubHeads:[sub],subHeadline:sub,projectSubHeadline:sub,
      covUrl:base.covUrl||cover,cover:base.cover||cover,coverImage:base.coverImage||cover,coverThumb:base.coverThumb||(cover&&isDr(cover)?dTh(cover,400):cover),
      galleryImages:base.galleryImages||gallery,gallery:base.gallery||gallery
    });
  };
  window.cardHeadForProject=function(p,svc){return metaFor(svc||projectService(p)).head;};
  window.cardSubHeadsForProject=function(p,svc){return [projectSub(p,svc||projectService(p))||'General'];};
  projectHeadLabel=function(p,svc){return window.cardHeadForProject(p,svc);};
  projectSubLabel=function(p,rawSub,svc){return projectSub(Object.assign({},p||{},{subHead:(p&&p.subHead)||rawSub}),svc||projectService(p));};
  function labelHTML(head,sub){return '<span class="card-head">'+htmlPlus(head)+'</span><div class="card-sub-list"><em>'+esc(sub||'General')+'</em></div>';}
  function slideObj(p,ai,bg){
    const svc=projectService(p); const meta=metaFor(svc); const sub=projectSub(p,svc); const img=getCov(p); const video=(p&&((p.videoUrl)||(p.vurl)))||'';
    const useVideo=!!video && (String((p&&((p.previewType)||(p.cardPreviewType)))||'').toLowerCase().includes('video') || /visual production/i.test(svc));
    return {ai:ai,title:(p&&((p.name)||(p.nm)||(p.title)))||'Untitled',img:img,video:video,isVideo:useVideo,bg:bg,desc:(p&&((p.desc)||(p.ds)||(p.description)))||'',service:svc,subHead:sub,sub:sub,head:meta.head};
  }
  function renderLabel(s){return labelHTML(s.head||metaFor(s.service).head,s.subHead||s.sub||'General');}
  function safeSlides(slides){return JSON.stringify(slides.map(s=>({ai:s.ai,title:s.title,desc:s.desc,isVideo:s.isVideo,video:s.video,service:s.service,sub:s.sub,subHead:s.subHead,head:s.head}))).replace(/'/g,'&#39;');}
  rSvc=function(){
    const g=document.getElementById('sG'); if(!g)return;
    Object.keys(_tm2||{}).forEach(k=>clearInterval(_tm2[k])); _tm2={}; _ac={};
    const groups={};
    (_P||[]).forEach((p,ai)=>{
      const svc=projectService(p); if(!svc)return; const sub=projectSub(p,svc)||'General'; const meta=metaFor(svc); const gk=exactGroupKey(svc,sub);
      if(!groups[gk])groups[gk]={svc:svc,head:meta.head,sub:sub,items:[]};
      groups[gk].items.push({p:p,ai:ai});
    });
    const order=TAXONOMY.map(m=>m.service);
    const keys=Object.keys(groups).sort((a,b)=>{const ga=groups[a],gb=groups[b];let ia=order.indexOf(ga.svc),ib=order.indexOf(gb.svc);if(ia<0)ia=999;if(ib<0)ib=999;return ia-ib||ga.sub.localeCompare(gb.sub);});
    let html=''; let lastSvc='';
    keys.forEach((k,gi)=>{
      const gr=groups[k],meta=metaFor(gr.svc),ci=serviceIndex(gr.svc),cat=(ci>=0&&Array.isArray(CATS))?CATS[ci]:null,bg=(cat&&cat.bg)||'#111';
      if(gr.svc!==lastSvc){html+='<div class="svc-cat-divider">'+htmlPlus(meta.head)+'</div>'; lastSvc=gr.svc;}
      const slides=gr.items.map(x=>slideObj(x.p,x.ai,bg));
      const id='csPair_'+k.replace(/[^a-zA-Z0-9ก-๙]/g,'_').slice(0,70)+'_'+gi;
      const controls=slides.length>1?'<div class="cat-slide-controls"><button class="cat-slide-btn" data-dir="-1" type="button">‹</button><span class="cat-slide-count">1 / '+slides.length+'</span><button class="cat-slide-btn" data-dir="1" type="button">›</button></div>':'';
      const layers=slides.map(renderLayer).join(''); const first=slides[0]||{}; const firstDesc=cleanCardText(first.desc||'');
      html+='<article class="cat-slide-card" id="'+id+'" data-service="'+esc(gr.svc)+'" data-sub="'+esc(gr.sub)+'" data-slides=\''+safeSlides(slides)+'\'>'+layers+'<div class="cat-slide-top"><div class="cat-slide-name">'+esc(first.title||'')+'</div>'+controls+'</div><div class="cat-slide-label tax-card-label">'+renderLabel(first)+'</div><div class="svc-desc" '+(firstDesc?'':'style="display:none"')+'><p>'+esc(firstDesc)+'</p></div><button class="stp" aria-label="View" onclick="oCardProject(event,\''+id+'\')"></button></article>';
    });
    g.innerHTML=html||'';
    g.querySelectorAll('img[data-src]').forEach(img=>IO&&IO.observe(img));
    g.querySelectorAll('.cat-slide-card[id]').forEach(card=>{_ac[card.id]=0;card.querySelectorAll('.cat-slide-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();setCardSlide(card,parseInt(btn.dataset.dir||'1',10));clearInterval(_tm2[card.id]);const sl=cardSlides(card);if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);}));const sl=cardSlides(card);if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);});
    const el=document.getElementById('sCt'); if(el){const t=(_P||[]).length;el.textContent=t?(t+' Project'+(t>1?'s':'')+' — Live'):'Upload projects from Admin';}
  };
  setCardSlide=function(card,dir){
    if(!card)return; const sl=cardSlides(card); if(!sl.length)return; const nx=((_ac[card.id]||0)+dir+sl.length)%sl.length; _ac[card.id]=nx;
    card.querySelectorAll('.cat-slide-layer').forEach((l,i)=>{l.classList.toggle('is-on',i===nx);const v=l.querySelector('video');if(v){if(i===nx){v.play&&v.play().catch(()=>{});}else{try{v.pause()}catch(e){}}}});
    const layer=card.querySelector('.cat-slide-layer[data-layer="'+nx+'"]'); if(layer){const img=layer.querySelector('img[data-src]');if(img)ldI(img,img.dataset.src);}
    const s=sl[nx]||{}; const n=card.querySelector('.cat-slide-name'); if(n)n.textContent=s.title||''; const c=card.querySelector('.cat-slide-count'); if(c)c.textContent=(nx+1)+' / '+sl.length;
    const desc=card.querySelector('.svc-desc'); if(desc){const t=cleanCardText(s.desc||''); desc.style.display=t?'block':'none'; desc.innerHTML='<p>'+esc(t)+'</p>';}
    const lab=card.querySelector('.cat-slide-label'); if(lab){lab.classList.add('tax-card-label'); lab.innerHTML=renderLabel(s);} const vb=card.querySelector('.video-badge'); if(vb)vb.remove();
  };
  try{if(Array.isArray(_P)&&_P.length){_P=_P.map((p,i)=>normProject(p,i,p&&p._legacy?'old':'new'));rSvc();}}catch(e){console.warn('[Dopious] data-entry final patch failed',e);}
})();

/* FINAL PATCH — media/card grouping/team captions/admin compatibility */
(function(){
  function fNormKey(v){return String(v||'').toLowerCase().replace(/[–—]/g,'-').replace(/\+/g,'').replace(/[^a-z0-9ก-๙]+/gi,' ').replace(/\s+/g,' ').trim();}
  const AL={
    'space design':'Space Design+','sculpture design':'Sculpture Design+','2d 3d motion graphic design':'Visual Production+','photo video ads design':'Visual Production+','motion design':'Visual Production+','visual production':'Visual Production+','graphic design':'Graphic Design+','packaging design':'Graphic Design+','brand strategy corporate identity design':'Branding Design+','branding design':'Branding Design+','brand strategy corporate identity':'Branding Design+','keyvisual creative ads design':'Key Visual Design+','key visual creative ads design':'Key Visual Design+','build installation':'Build & Install+','build install':'Build & Install+','production follow up':'Production Sourcing+','production follow-up':'Production Sourcing+','production sourcing':'Production Sourcing+','industrial design':'Industrial Design+','prototype 3d print service':'Industrial Design+','corporate design':'Corporate Design+','website ux ui design':'Digital Design+','website ux-ui design':'Digital Design+','digital design':'Digital Design+','fashion design':'Fashion Design+','marketing':'Branding Design+','marketing brand communication':'Branding Design+','creative consultation':'Creative Consultation+'
  };
  normSvc=function(v){v=String(v||'').trim();if(!v)return'';const direct=CATS.find(c=>c.svc===v);if(direct)return direct.svc;const k=fNormKey(v);if(AL[k])return AL[k];const hit=CATS.find(c=>fNormKey(c.svc)===k||fNormKey(c.cat)===k);return hit?hit.svc:v;};
  function fMeta(svc){const s=normSvc(svc);return CATS.find(c=>c.svc===s)||CATS[0];}
  function fSub(raw,svc){const meta=fMeta(svc),r=fNormKey(raw);if(!r||r==='creative')return meta.subs&&meta.subs[0]||'General';return (meta.subs||[]).find(x=>fNormKey(x)===r)||(meta.subs||[]).find(x=>fNormKey(x).includes(r)||r.includes(fNormKey(x)))||(meta.subs&&meta.subs[0])||'General';}
  function fFirstSub(p,svc){let arr=[];if(p.subHead)arr=[p.subHead];else if(p.sub)arr=[p.sub];else if(p.subhead)arr=[p.subhead];else if(Array.isArray(p.subHeads))arr=p.subHeads;else if(Array.isArray(p.subheads))arr=p.subheads;else if(Array.isArray(p.subServices))arr=p.subServices;else if(p.subHeadline)arr=String(p.subHeadline).split(/\s+\/\s+|,|\n|\|\|\|/);for(const x of arr){const m=fSub(x,svc);if(m)return m;}return fSub('',svc);}
  normProject=function(p,i,src){
    p=p||{}; const imgData=(typeof getImgKeyData==='function'?getImgKeyData(p):null)||{};
    const caps=Array.isArray(p.galleryCaptions)?p.galleryCaptions:(Array.isArray(p.captions)?p.captions:[]);
    const objs=(typeof arrMediaObjects==='function'?arrMediaObjects(p.galleryImages&&p.galleryImages.length?p.galleryImages:(p.gallery&&p.gallery.length?p.gallery:(p.images&&p.images.length?p.images:(imgData.images||[]))),caps):[]);
    const gallery=objs.length?objs.map(o=>o.data):arrUrl(p.galleryImages||p.gallery||p.images||[]);
    const cover=(typeof firstMedia==='function'?firstMedia(p.covUrl,p.coverImage,p.cover,p.coverThumb,p.cardThumb,imgData.cover,imgData.thumb,gallery[0]):(p.covUrl||p.coverImage||p.cover||p.coverThumb||gallery[0]||''));
    const vids=Array.isArray(imgData.videos)?imgData.videos.map(v=>typeof v==='string'?v:(v&&v.url)||'').filter(Boolean):[];
    const video=p.videoUrl||p.vurl||p.video||vids[0]||'';
    const name=p.name||p.nm||p.title||'Untitled'; const svc=normSvc(p.service||p.svc||p.cat||p.category||p.head||p.projectHeadline||''); const sub=fFirstSub(p,svc);
    return Object.assign({},p,{_id:p._id||p.id||(src+'_'+i),_legacy:src==='old',legacySource:src==='old'?'oldAdmin':(p.legacySource||''),id:p.id||p._id||(src+'_'+i),nm:name,name,cl:p.client||p.cl||'',client:p.client||p.cl||'',credit:p.credit||p.cr||'Dopious+',cr:p.credit||p.cr||'Dopious+',svc,service:svc,sub,subHead:sub,subHeads:[sub],subHeadline:sub,yr:p.year||p.yr||'2026',year:p.year||p.yr||'2026',ds:p.desc||p.ds||p.description||'',desc:p.desc||p.ds||p.description||'',story:p.story||p.detail||p.fullDescription||'',location:p.location||'',role:p.role||p.scope||'',layout:p.layout||'stack',previewType:p.cardMedia||p.cardMediaType||p.previewMedia||p.previewType||p.cardPreviewType||'image',cardMedia:p.cardMedia||p.cardMediaType||p.previewMedia||p.previewType||p.cardPreviewType||'image',cardMediaType:p.cardMedia||p.cardMediaType||p.previewMedia||p.previewType||p.cardPreviewType||'image',covUrl:cover,cover,coverImage:cover,coverThumb:p.coverThumb||(cover&&isDr(cover)?dTh(cover,400):cover),cardThumb:p.cardThumb||p.coverThumb||cover,lqip:p.lqip||(cover&&isDr(cover)?dTh(cover,20):''),gallery,galleryImages:gallery,galleryCaptions:objs.length?objs.map((o,j)=>o.caption||caps[j]||''):caps,galleryObjects:objs,galleryCount:gallery.length,vurl:video,videoUrl:video,driveFolderUrl:p.driveFolderUrl||p.driveFolder||p.folderUrl||p.referenceUrl||'',imgKey:p.imgKey||''});
  };
  function fYt(u){const m=String(u||'').match(/(?:youtube\.com\/(?:watch\?[^#\s]*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);return m?m[1]:'';}
  function fDrive(u){const m=String(u||'').match(/[?&]id=([A-Za-z0-9_-]+)/)||String(u||'').match(/\/d\/([A-Za-z0-9_-]+)/);return m?m[1]:'';}
  function fVideoUrl(u){return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(String(u||''));}
  function fPoster(u,fallback){const y=fYt(u);if(y)return 'https://i.ytimg.com/vi/'+y+'/hqdefault.jpg';const d=fDrive(u);if(d)return 'https://drive.google.com/thumbnail?id='+d+'&sz=s1000';return fallback||'';}
  function fClean(s){return String(s||'').replace(/https?:\/\/\S+/g,'').replace(/\s+/g,' ').trim();}
  function fGroupKey(svc,sub){return fNormKey(svc)+'|'+fNormKey(sub||'General');}
  function fPlus(s){return esc(String(s||'').replace(/\+$/,''))+'<em>+</em>';}
  function fLayer(s,li){let body='';if(s.isVideo&&s.video){if(fVideoUrl(s.video))body='<video muted loop playsinline preload="metadata" '+(li===0?'autoplay':'')+' src="'+esc(s.video)+'" poster="'+esc(fPoster(s.video,s.img))+'"></video>';else body='<div class="video-poster" style="background-image:url(\''+esc(fPoster(s.video,s.img))+'\')"></div>';}else if(s.img){body='<img '+(li===0?'src':'data-src')+'="'+iU(s.img,li===0?800:500)+'" alt="'+esc(s.title)+'" loading="'+(li===0?'eager':'lazy')+'" decoding="async">';}else{body='<div style="position:absolute;inset:0;background:'+s.bg+'"></div>';}return '<div class="cat-slide-layer'+(li===0?' is-on':'')+'" data-layer="'+li+'">'+body+'</div>';}
  rSvc=function(){const g=document.getElementById('sG');if(!g)return;Object.keys(_tm2||{}).forEach(k=>clearInterval(_tm2[k]));_tm2={};_ac={};const map={};(_P||[]).forEach((p,ai)=>{const svc=normSvc(p.service||p.svc||'');if(!svc||S2C[svc]===undefined)return;const sub=p.subHead||p.sub||fFirstSub(p,svc)||'General';const k=fGroupKey(svc,sub);if(!map[k])map[k]={svc,sub,idx:S2C[svc],items:[]};map[k].items.push({p,ai});});const groups=Object.values(map).sort((a,b)=>a.idx-b.idx||String(a.sub).localeCompare(String(b.sub)));let html='';let last='';groups.forEach((gr,ci)=>{const cat=CATS[gr.idx]||CATS[0],bg=cat.bg||'#111';if(gr.svc!==last){html+='<div class="svc-cat-divider">'+esc(gr.svc)+'</div>';last=gr.svc;}const slides=gr.items.map(({p,ai})=>{const img=getCov(p),video=p.videoUrl||p.vurl||'',useVideo=!!video&&String(p.cardMedia||p.cardMediaType||p.previewType||'image').toLowerCase().includes('video');return{ai,title:p.name||p.nm||'Untitled',img,video,isVideo:useVideo,bg,desc:p.desc||p.ds||'',service:gr.svc,sub:gr.sub};});const id='work_'+String(gr.svc+'_'+gr.sub).replace(/[^a-zA-Z0-9]/g,'_').slice(0,64)+'_'+ci;const controls=slides.length>1?'<div class="cat-slide-controls"><button class="cat-slide-btn" data-dir="-1" type="button">‹</button><span class="cat-slide-count">1 / '+slides.length+'</span><button class="cat-slide-btn" data-dir="1" type="button">›</button></div>':'';const safe=JSON.stringify(slides.map(s=>({ai:s.ai,title:s.title,desc:s.desc,service:s.service,sub:s.sub,isVideo:s.isVideo,video:s.video}))).replace(/'/g,'&#39;');const firstDesc=fClean(slides[0]&&slides[0].desc);html+='<article class="cat-slide-card" id="'+id+'" data-service="'+esc(gr.svc)+'" data-sub="'+esc(gr.sub)+'" data-slides=\''+safe+'\'>'+slides.map(fLayer).join('')+'<div class="cat-slide-top"><div class="cat-slide-name">'+esc(slides[0].title)+'</div>'+controls+'</div><div class="cat-slide-label tax-card-label"><span class="card-head">'+fPlus(gr.svc)+'</span><span class="card-sub-one">'+esc(gr.sub)+'</span></div><div class="svc-desc" '+(firstDesc?'':'style="display:none"')+'><p>'+esc(firstDesc)+'</p></div><button class="stp" aria-label="View" onclick="oCardProject(event,\''+id+'\')"></button></article>';});g.innerHTML=html||CATS.slice(0,8).map(c=>'<article class="cat-slide-card sk"><div class="cat-slide-layer is-on" style="background:'+c.bg+'"></div><div class="cat-slide-label tax-card-label"><span class="card-head">'+fPlus(c.svc)+'</span></div></article>').join('');g.querySelectorAll('img[data-src]').forEach(img=>IO&&IO.observe(img));g.querySelectorAll('.cat-slide-card[id]').forEach(card=>{_ac[card.id]=0;card.querySelectorAll('.cat-slide-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();setCardSlide(card,parseInt(btn.dataset.dir||'1',10));clearInterval(_tm2[card.id]);const sl=cardSlides(card);if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);}));const sl=cardSlides(card);if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);});const el=document.getElementById('sCt');if(el){const t=(_P||[]).length;el.textContent=t?(t+' Project'+(t>1?'s':'')+' — Live'):'Upload projects from Admin';}};
  cardSlides=function(card){try{return JSON.parse(card.getAttribute('data-slides')||'[]')}catch(e){return[]}};
  setCardSlide=function(card,dir){if(!card)return;const sl=cardSlides(card);if(!sl.length)return;const nx=((_ac[card.id]||0)+dir+sl.length)%sl.length;_ac[card.id]=nx;card.querySelectorAll('.cat-slide-layer').forEach((l,i)=>{l.classList.toggle('is-on',i===nx);const v=l.querySelector('video');if(v){try{i===nx?v.play().catch(()=>{}):v.pause()}catch(e){}}});const layer=card.querySelector('.cat-slide-layer[data-layer="'+nx+'"]');if(layer){const img=layer.querySelector('img[data-src]');if(img)ldI(img,img.dataset.src);}const s=sl[nx]||{};const n=card.querySelector('.cat-slide-name');if(n)n.textContent=s.title||'';const c=card.querySelector('.cat-slide-count');if(c)c.textContent=(nx+1)+' / '+sl.length;const desc=card.querySelector('.svc-desc');if(desc){const t=fClean(s.desc);desc.style.display=t?'block':'none';desc.innerHTML='<p>'+esc(t)+'</p>';}};
  oCardProject=function(e,id){if(e)e.stopPropagation();const card=document.getElementById(id);if(!card)return;const sl=cardSlides(card);const s=sl[_ac[id]||0]||sl[0];if(s&&s.ai!==undefined)oPD(s.ai);};
  oPD=function(ai){const p=_P[ai];if(!p)return;const objs=p.galleryObjects&&p.galleryObjects.length?p.galleryObjects:(p.galleryImages||p.gallery||[]).map((u,i)=>({data:u,caption:(p.galleryCaptions||[])[i]||''}));const vE=mVE(p.vurl||p.videoUrl||'');const covFull=getCovFull(p);let gal='';if(covFull){gal+='<div class="di"><div class="lq" style="background-image:url(\''+(isDr(covFull)?dTh(covFull,20):'')+'\')"></div><img src="'+iU(covFull,1100)+'" alt="'+esc(p.name||p.nm||'')+'" loading="eager"></div>';}objs.forEach((o,i)=>{const url=typeof o==='string'?o:(o&&o.data)||'';if(!url||url===covFull)return;const cap=fClean((o&&o.caption)||'');gal+='<div class="di"><div class="lq" style="background-image:url(\''+(isDr(url)?dTh(url,20):'')+'\')"></div><img '+(i<1?'src':'data-src')+'="'+iU(url,1100)+'" alt="'+esc(cap)+'" loading="'+(i<1?'eager':'lazy')+'"></div>'+(cap?'<div class="detail-img-caption">'+esc(cap)+'</div>':'');});if(vE)gal+='<div class="dv">'+vE+'</div>';if(!gal){const bg=CATS.find(c=>c.svc===(p.service||p.svc));gal='<div class="di" style="background:'+(bg?bg.bg:'#111')+'"></div>';}const svc=normSvc(p.service||p.svc||''),sub=p.subHead||p.sub||fFirstSub(p,svc)||'';const folder=p.driveFolderUrl?'<a class="drive-link" href="'+esc(p.driveFolderUrl)+'" target="_blank" rel="noopener">Open Drive Folder</a>':'';const story=p.story||p.detail||p.fullDescription||'';document.getElementById('pdi').innerHTML='<div class="dh"><div class="dc">'+esc(svc)+(sub?' / '+esc(sub):'')+'</div><div class="dn">'+esc(p.name||p.nm||'')+'</div><div class="dm"><div class="db"><small>Client</small><b>'+esc(p.client||p.cl||'-')+'</b></div><div class="db"><small>Credit</small><b>'+esc(p.credit||p.cr||'Dopious+')+'</b></div><div class="db"><small>Year</small><b>'+esc(p.year||p.yr||'2026')+'</b></div></div></div>'+(p.desc||p.ds?'<div class="ds">'+esc(p.desc||p.ds).replace(/\n/g,'<br>')+folder+'</div>':'')+'<div>'+gal+'</div><div class="dsc"><h3>Project Detail</h3><p>'+esc(story||svc+' — '+sub+' — Concept, art direction, design and production.')+'</p></div>';document.querySelectorAll('#pdi img[data-src]').forEach(img=>IO&&IO.observe(img));document.querySelectorAll('#pdi .di').forEach(di=>{const img=di.querySelector('img');const lq=di.querySelector('.lq');if(img&&lq){const done=()=>lq.style.opacity='0';if(img.complete)done();else img.onload=done;}});op('pd');};
  rTm=function(){const g=document.getElementById('tG');if(!g)return;g.innerHTML=_TM.length?_TM.map(m=>'<div class="tm"><div class="tm-ph">'+(m.photo||m.ph?'<img src="'+(m.photo||m.ph)+'" alt="'+esc(m.name||m.nm||'')+'" loading="lazy">':'<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a1a,#080808)"></div>')+'</div><b>'+esc(m.name||m.nm||'')+'</b><span>'+esc(m.position||m.pos||'')+'</span>'+((m.details||m.bio||m.desc||m.detail)?'<p>'+esc(m.details||m.bio||m.desc||m.detail)+'</p>':'')+'</div>').join(''):'<p style="color:rgba(255,255,255,.26);font-size:13px;letter-spacing:.08em">Team profiles coming soon.</p>';};
})();


/* =========================================================
   SYNC FIX — Public Works must follow Admin Head + Sub Head
   Scope: Works/Services card, slide grouping, data normalization only.
   1 Project = 1 Head + 1 Sub Head
   1 Card = 1 Head + 1 Sub Head
   ========================================================= */
(function(){
  const RESERVED_DOCS=new Set([
    'published','dopiousAdminProjects','dopiousClients','dopiousAdminTeam','dopiousAdminHome','dopiousAdminCompany','dopiousAdminWebsite','dopiousAdminLogos','dopiousTheme','dopiousSEO','dopiousClientSection','dopiousAdminSubtopics','dopiousCustomServiceCategories','dopiousHiddenCategories','dopiousMediaLibrary'
  ]);
  function _txt(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function _key(v){return _txt(v).toLowerCase().replace(/[–—]/g,'-').replace(/\+/g,'').replace(/[^a-z0-9ก-๙]+/gi,' ').trim();}
  function _headMeta(svc){
    const raw=_txt(svc);
    const k=_key(raw);
    const alias=(typeof CAT_ALIAS==='object' && CAT_ALIAS[k]) ? CAT_ALIAS[k] : raw;
    return (CATS||[]).find(c=>c.svc===raw || c.svc===alias || _key(c.svc)===k || _key(c.cat)===k) || null;
  }
  function _head(svc){const m=_headMeta(svc);return m?m.svc:'';}
  function _subFromProject(p,svc){
    const meta=_headMeta(svc);
    let raw='';
    if(p && p.subHead) raw=p.subHead;
    else if(p && p.sub) raw=p.sub;
    else if(p && p.subhead) raw=p.subhead;
    else if(p && Array.isArray(p.subHeads) && p.subHeads.length) raw=p.subHeads[0];
    else if(p && Array.isArray(p.subheads) && p.subheads.length) raw=p.subheads[0];
    else if(p && Array.isArray(p.subServices) && p.subServices.length) raw=p.subServices[0];
    else if(p && p.subHeadline) raw=String(p.subHeadline).split(/\s+\/\s+|,|\n|\|\|\|/)[0];
    raw=_txt(raw);
    if(!raw || _key(raw)==='creative') return 'General';
    if(meta && Array.isArray(meta.subs)){
      const rk=_key(raw);
      const exact=meta.subs.find(s=>_key(s)===rk);
      if(exact) return exact;
      const near=meta.subs.find(s=>_key(s).includes(rk)||rk.includes(_key(s)));
      if(near) return near;
    }
    return raw || 'General';
  }
  function _urls(arr){
    return (Array.isArray(arr)?arr:[]).map(x=>typeof x==='string'?x:(x&&(x.data||x.url||x.src)||'')).filter(x=>/^https?:\/\//i.test(String(x||'')));
  }
  function _normProject(p,i,source){
    p=p||{};
    const rawHead=p.service||p.svc||p.cat||p.category||p.head||p.projectHeadline||'';
    const service=_head(rawHead);
    if(!service) return null;
    const subHead=_subFromProject(p,service);
    const cover=p.coverImage||p.cover||p.covUrl||p.coverThumb||p.cardThumb||'';
    const gallery=_urls((p.galleryImages&&p.galleryImages.length)?p.galleryImages:((p.gallery&&p.gallery.length)?p.gallery:(p.images||[])));
    const galleryObjects=Array.isArray(p.galleryObjects)?p.galleryObjects:gallery.map((u,j)=>({data:u,caption:(p.galleryCaptions||p.captions||[])[j]||''}));
    const name=p.name||p.nm||p.title||'Untitled';
    const cardMedia=p.cardMedia||p.cardMediaType||p.previewMedia||p.previewType||p.cardPreviewType||'image';
    return Object.assign({},p,{
      _id:p._id||p.id||(source+'_'+i),_legacy:source==='old',
      name,nm:name,title:name,client:p.client||p.cl||'',cl:p.client||p.cl||'',
      year:p.year||p.yr||'2026',yr:p.year||p.yr||'2026',
      service,svc:service,head:service,projectHeadline:service,
      subHead,sub:subHead,subHeads:[subHead],subheads:[subHead],subServices:[subHead],selectedSubHeads:[subHead],subHeadline:subHead,projectSubHeadline:subHead,
      coverImage:cover,cover,covUrl:cover,coverThumb:p.coverThumb||(cover&&typeof isDr==='function'&&isDr(cover)?dTh(cover,400):cover),cardThumb:p.cardThumb||p.coverThumb||cover,
      galleryImages:gallery,gallery,galleryObjects,galleryCaptions:galleryObjects.map(o=>o.caption||''),
      videoUrl:p.videoUrl||p.vurl||'',vurl:p.videoUrl||p.vurl||'',
      cardMedia,cardMediaType:cardMedia,previewMedia:cardMedia,
      desc:p.desc||p.ds||p.description||'',ds:p.desc||p.ds||p.description||'',description:p.desc||p.ds||p.description||'',
      story:p.story||p.detail||p.fullDescription||'',detail:p.story||p.detail||p.fullDescription||'',
      location:p.location||'',role:p.role||p.scope||'',scope:p.role||p.scope||'',
      credit:p.credit||p.cr||'Dopious+',cr:p.credit||p.cr||'Dopious+',
      driveFolderUrl:p.driveFolderUrl||p.driveFolder||p.folderUrl||p.referenceUrl||'',layout:p.layout||''
    });
  }
  function _identity(p){
    const cover=p.coverImage||p.cover||p.covUrl||'';
    return _key((p.name||p.nm||p.title||'')+'|'+(p.client||p.cl||'')+'|'+cover);
  }
  function _mergeProjects(newDocs,oldDocs){
    const newIds=new Set((newDocs||[]).map(_identity).filter(Boolean));
    const seen=new Set();
    const out=[];
    (newDocs||[]).forEach(p=>{const k=_identity(p)||_key(p._id||p.id||Math.random()); if(seen.has(k))return; seen.add(k); out.push(p);});
    (oldDocs||[]).forEach(p=>{const k=_identity(p)||_key(p._id||p.id||Math.random()); if(newIds.has(k)||seen.has(k))return; seen.add(k); out.push(p);});
    return out;
  }
  function _docVal(d){return d&&d.value!==undefined?d.value:null;}
  async function _getDoc(id){try{const s=await db.collection(COL).doc(id).get();return s.exists?s.data():null;}catch(e){return null;}}
  async function _getCollection(col){
    try{return await db.collection(col).get({source:'server'});}catch(e){return await db.collection(col).get().catch(()=>({docs:[]}));}
  }
  window.loadData=async function(){
    if(!db)return;
    try{
      const [ps,cs,ts,pubDoc,oldPDoc,oldCDoc,oldTDoc,oldCoDoc,oldWDoc]=await Promise.all([
        _getCollection(COL),
        _getCollection(COL_CL),
        _getCollection(COL_TM),
        _getDoc('published'),
        _getDoc('dopiousAdminProjects'),
        _getDoc('dopiousClients'),
        _getDoc('dopiousAdminTeam'),
        _getDoc('dopiousAdminCompany')
      ]);
      const pub=pubDoc||{}; _OLDPUB=pub;
      const oldProjects=[...(Array.isArray(pub.projects)?pub.projects:[]),...(Array.isArray(_docVal(oldPDoc))?_docVal(oldPDoc):[])];
      const newProjects=(ps.docs||[]).filter(d=>!RESERVED_DOCS.has(d.id)).map((d,i)=>_normProject({_id:d.id,id:d.id,...d.data()},i,'new')).filter(Boolean);
      _OLDPROJECTS=oldProjects.map((p,i)=>_normProject(p,i,'old')).filter(Boolean);
      _P=_mergeProjects(newProjects,_OLDPROJECTS);
      const oldClients=Array.isArray(pub.clients)?pub.clients:(Array.isArray(_docVal(oldCDoc))?_docVal(oldCDoc):[]);
      const oldTeam=Array.isArray(pub.team)?pub.team:(Array.isArray(_docVal(oldTDoc))?_docVal(oldTDoc):[]);
      _CO=pub.company||_docVal(oldCoDoc)||_CO||{};
      const newClients=(cs.docs||[]).map(d=>({_id:d.id,...d.data()}));
      _OLDCLIENTS=(oldClients||[]).map((c,i)=>({_id:c._id||c.id||('old_client_'+i),_legacy:true,nm:c.name||c.nm||'',name:c.name||c.nm||'',url:c.url||c.logoUrl||c.logo||'',logoUrl:c.logoUrl||c.url||c.logo||''}));
      if(typeof mergeClients==='function') _CL=mergeClients(newClients,_OLDCLIENTS); else _CL=newClients.concat(_OLDCLIENTS);
      const newTeam=(ts.docs||[]).map(d=>({_id:d.id,...d.data()}));
      _OLDTEAM=(oldTeam||[]).map((m,i)=>({_id:m._id||m.id||('old_team_'+i),_legacy:true,nm:m.name||m.nm||'',name:m.name||m.nm||'',pos:m.position||m.pos||'',position:m.position||m.pos||'',ph:m.photo||m.ph||'',photo:m.photo||m.ph||'',details:m.details||m.bio||m.desc||m.description||''}));
      if(typeof mergePeople==='function') _TM=mergePeople(newTeam,_OLDTEAM); else _TM=newTeam.concat(_OLDTEAM);
      if(typeof rSvc==='function')rSvc();
      if(typeof rCl==='function')rCl();
      if(typeof applyCompanyContact==='function')applyCompanyContact();
      if(typeof updAdminStatus==='function')updAdminStatus();
    }catch(e){console.warn('[Dopious] loadData sync fix:',e);const el=document.getElementById('sCt');if(el)el.textContent='Error loading';}
  };
  function _gKey(service,subHead){return _key(service)+'|'+_key(subHead||'General');}
  function _plus(s){return esc(String(s||'').replace(/\+$/,''))+'<em>+</em>';}
  function _yt(u){const m=String(u||'').match(/(?:youtube\.com\/(?:watch\?[^#\s]*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);return m?m[1]:'';}
  function _videoFile(u){return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(String(u||''));}
  function _poster(u,fallback){const y=_yt(u);if(y)return 'https://i.ytimg.com/vi/'+y+'/hqdefault.jpg';if(typeof isDr==='function'&&isDr(u))return dTh(u,1000);return fallback||'';}
  function _layer(slide,active){
    if(slide.isVideo&&slide.video){
      if(_videoFile(slide.video)) return '<div class="cat-slide-layer'+(active?' is-on':'')+'" data-layer="'+slide.li+'"><video muted loop playsinline preload="metadata" '+(active?'autoplay':'')+' src="'+esc(slide.video)+'" poster="'+esc(_poster(slide.video,slide.img))+'"></video></div>';
      return '<div class="cat-slide-layer'+(active?' is-on':'')+'" data-layer="'+slide.li+'"><div class="video-poster" style="background-image:url(\''+esc(_poster(slide.video,slide.img))+'\')"></div></div>';
    }
    if(slide.img) return '<div class="cat-slide-layer'+(active?' is-on':'')+'" data-layer="'+slide.li+'"><img '+(active?'src':'data-src')+'="'+iU(slide.img,active?800:500)+'" alt="'+esc(slide.title)+'" loading="'+(active?'eager':'lazy')+'" decoding="async"></div>';
    return '<div class="cat-slide-layer'+(active?' is-on':'')+'" data-layer="'+slide.li+'" style="background:'+slide.bg+'"></div>';
  }
  function _slideData(p,ai,service,sub,bg,li){
    const img=(typeof getCov==='function'?getCov(p):(p.coverImage||p.cover||p.covUrl||''));
    const video=p.videoUrl||p.vurl||'';
    const isVideo=!!video && String(p.cardMedia||p.cardMediaType||p.previewType||'image').toLowerCase().includes('video');
    return {li,ai,title:p.name||p.nm||'Untitled',desc:p.desc||p.ds||'',img,video,isVideo,bg,service,subHead:sub};
  }
  window.rSvc=function(){
    const g=document.getElementById('sG'); if(!g)return;
    Object.keys(_tm2||{}).forEach(k=>clearInterval(_tm2[k])); _tm2={}; _ac={};
    const groups={};
    (_P||[]).forEach((p,ai)=>{
      const service=_head(p.service||p.svc||''); if(!service || S2C[service]===undefined)return;
      const subHead=_subFromProject(p,service)||'General';
      const key=_gKey(service,subHead);
      if(!groups[key])groups[key]={service,subHead,idx:S2C[service],items:[]};
      groups[key].items.push({p,ai});
    });
    const ordered=Object.values(groups).sort((a,b)=>a.idx-b.idx||String(a.subHead).localeCompare(String(b.subHead)));
    let html='',last='';
    ordered.forEach((gr,ci)=>{
      const cat=CATS[gr.idx]||CATS[0],bg=cat.bg||'#111';
      if(gr.service!==last){html+='<div class="svc-cat-divider">'+esc(gr.service)+'</div>';last=gr.service;}
      const slides=gr.items.map((x,i)=>_slideData(x.p,x.ai,gr.service,gr.subHead,bg,i));
      const id='work_'+String(gr.service+'_'+gr.subHead).replace(/[^a-zA-Z0-9]/g,'_').slice(0,64)+'_'+ci;
      const controls=slides.length>1?'<div class="cat-slide-controls"><button class="cat-slide-btn" data-dir="-1" type="button">‹</button><span class="cat-slide-count">1 / '+slides.length+'</span><button class="cat-slide-btn" data-dir="1" type="button">›</button></div>':'';
      const safe=JSON.stringify(slides.map(s=>({ai:s.ai,title:s.title,desc:s.desc,service:s.service,subHead:s.subHead,isVideo:s.isVideo,video:s.video}))).replace(/'/g,'&#39;');
      const first=slides[0]||{};
      const desc=_txt(first.desc).replace(/https?:\/\/\S+/g,'').trim();
      html+='<article class="cat-slide-card" id="'+id+'" data-service="'+esc(gr.service)+'" data-sub="'+esc(gr.subHead)+'" data-slides=\''+safe+'\'>'+slides.map((s,i)=>_layer(s,i===0)).join('')+'<div class="cat-slide-top"><div class="cat-slide-name">'+esc(first.title||'')+'</div>'+controls+'</div><div class="cat-slide-label tax-card-label"><span class="card-head">'+_plus(gr.service)+'</span><span class="card-sub-one">'+esc(gr.subHead)+'</span></div><div class="svc-desc" '+(desc?'':'style="display:none"')+'><p>'+esc(desc)+'</p></div><button class="stp" aria-label="View" onclick="oCardProject(event,\''+id+'\')"></button></article>';
    });
    g.innerHTML=html||CATS.slice(0,8).map(c=>'<article class="cat-slide-card sk"><div class="cat-slide-layer is-on" style="background:'+c.bg+'"></div><div class="cat-slide-label tax-card-label"><span class="card-head">'+_plus(c.svc)+'</span></div></article>').join('');
    g.querySelectorAll('img[data-src]').forEach(img=>IO&&IO.observe(img));
    g.querySelectorAll('.cat-slide-card[id]').forEach(card=>{
      _ac[card.id]=0;
      card.querySelectorAll('.cat-slide-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();setCardSlide(card,parseInt(btn.dataset.dir||'1',10));clearInterval(_tm2[card.id]);const sl=cardSlides(card);if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);}));
      const sl=cardSlides(card); if(sl.length>1)_tm2[card.id]=setInterval(()=>setCardSlide(card,1),4200);
    });
    const el=document.getElementById('sCt'); if(el){const t=(_P||[]).length;el.textContent=t?(t+' Project'+(t>1?'s':'')+' — Live'):'Upload projects from Admin';}
  };
  window.cardSlides=function(card){try{return JSON.parse(card.getAttribute('data-slides')||'[]')}catch(e){return[]}};
  window.setCardSlide=function(card,dir){
    if(!card)return; const slides=cardSlides(card); if(!slides.length)return;
    const nx=((_ac[card.id]||0)+dir+slides.length)%slides.length; _ac[card.id]=nx;
    card.querySelectorAll('.cat-slide-layer').forEach((layer,i)=>{layer.classList.toggle('is-on',i===nx);const v=layer.querySelector('video');if(v){try{i===nx?v.play().catch(()=>{}):v.pause()}catch(e){}}});
    const layer=card.querySelector('.cat-slide-layer[data-layer="'+nx+'"]'); if(layer){const img=layer.querySelector('img[data-src]'); if(img)ldI(img,img.dataset.src);}
    const s=slides[nx]||{}; const n=card.querySelector('.cat-slide-name'); if(n)n.textContent=s.title||'';
    const c=card.querySelector('.cat-slide-count'); if(c)c.textContent=(nx+1)+' / '+slides.length;
    const desc=card.querySelector('.svc-desc'); if(desc){const t=_txt(s.desc).replace(/https?:\/\/\S+/g,'').trim();desc.style.display=t?'block':'none';desc.innerHTML='<p>'+esc(t)+'</p>';}
  };
  window.oCardProject=function(e,id){if(e)e.stopPropagation();const card=document.getElementById(id);if(!card)return;const slides=cardSlides(card);const s=slides[_ac[id]||0]||slides[0];if(s&&s.ai!==undefined&&typeof oPD==='function')oPD(s.ai);};
})();

/* HOW IT WORKS HEAD/SUBHEAD SYNC PATCH — service nodes match CATS and chips jump to matching Works card */
(function(){
  function hk(v){return String(v||'').toLowerCase().replace(/[–—]/g,'-').replace(/\+/g,'').replace(/[^a-z0-9ก-๙]+/gi,' ').replace(/\s+/g,' ').trim();}
  function hEsc(v){return typeof esc==='function'?esc(v):String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});}
  function hPlus(s){return hEsc(String(s||'').replace(/\+$/,''))+'<em>+</em>';}
  function q(s){return String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');}
  function availableCount(service,sub){
    const s=hk(service),u=hk(sub);let n=0;
    try{(_P||[]).forEach(function(p){const ps=hk((typeof normSvc==='function'?normSvc(p.service||p.svc||''):(p.service||p.svc||'')));const pu=hk(p.subHead||p.sub||p.subHeadline||((Array.isArray(p.subHeads)&&p.subHeads[0])||''));if(ps===s&&pu===u)n++;});}catch(e){}
    return n;
  }
  function metaByKey(key){
    if(key==='dopious')return null;
    const i=parseInt(String(key).replace(/\D/g,''),10)-1;
    if(!isNaN(i)&&Array.isArray(CATS)&&CATS[i])return CATS[i];
    return null;
  }
  function updateNodes(){
    if(!Array.isArray(CATS))return;
    CATS.forEach(function(c,i){
      const node=document.querySelector('.mind-node.n'+(i+1)); if(!node)return;
      const b=node.querySelector('b'), sp=node.querySelector('span');
      if(b)b.innerHTML=hPlus(c.svc||c.cat||'');
      if(sp)sp.textContent=(c.subs||[]).slice(0,3).join(' / ');
      node.setAttribute('data-service',c.svc||'');
    });
  }
  window.showServiceSub=function(key){
    const panel=document.getElementById('serviceSubPanel'); if(!panel)return;
    const meta=metaByKey(key);
    const kicker=document.getElementById('subKicker'), title=document.getElementById('subTitle'), desc=document.getElementById('subDesc'), chips=document.getElementById('subChips');
    document.querySelectorAll('.mind-node').forEach(function(n){n.classList.remove('active')});
    const node=document.querySelector('.mind-node.'+key); if(node)node.classList.add('active');
    if(!meta){
      if(kicker)kicker.textContent='DOPIOUS+ ONE-STOP SERVICE';
      if(title)title.innerHTML='Select a Service Head';
      if(desc)desc.textContent='เลือก Head รอบวงกลมเพื่อดู Sub Head ทั้งหมด แล้วคลิก Sub Head เพื่อไปยังการ์ด Works / Services ที่ตรงกัน';
      if(chips)chips.innerHTML='';
      return;
    }
    if(kicker)kicker.textContent=meta.svc||'';
    if(title)title.innerHTML=hPlus(meta.svc||'');
    if(desc)desc.textContent='Sub Head ทั้งหมดของ '+String(meta.svc||'').replace(/\+$/,'')+' — คลิก tag เพื่อไปยัง Card ที่ใช้ Head + Sub Head นี้';
    if(chips){
      chips.innerHTML=(meta.subs||[]).map(function(sub){
        const n=availableCount(meta.svc,sub); const cls=n?' has-work':' no-work';
        const label=hEsc(sub)+(n?' <small>'+n+'</small>':'');
        return '<button class="how-sub-chip'+cls+'" type="button" onclick="goHowSub(\''+q(meta.svc)+'\',\''+q(sub)+'\')">'+label+'</button>';
      }).join('');
    }
  };
  window.goHowSub=function(service,sub){
    try{ if(typeof cH==='function')cH(); else {const h=document.getElementById('hP'); if(h)h.classList.remove('on');} }catch(e){}
    setTimeout(function(){
      const sec=document.getElementById('svc'); if(sec)sec.scrollIntoView({behavior:'smooth',block:'start'});
      setTimeout(function(){
        const s=hk(service),u=hk(sub); let target=null;
        document.querySelectorAll('.cat-slide-card[data-service][data-sub]').forEach(function(card){
          if(target)return;
          if(hk(card.getAttribute('data-service'))===s && hk(card.getAttribute('data-sub'))===u)target=card;
        });
        if(!target){
          document.querySelectorAll('.cat-slide-card[data-service]').forEach(function(card){
            if(target)return;
            if(hk(card.getAttribute('data-service'))===s)target=card;
          });
        }
        if(target){
          target.scrollIntoView({behavior:'smooth',block:'center'});
          target.classList.add('jump-focus');
          setTimeout(function(){target&&target.classList.remove('jump-focus')},2200);
        }
      },350);
    },120);
  };
  window.goServicesFromHow=function(){try{if(typeof cH==='function')cH();}catch(e){} setTimeout(function(){const s=document.getElementById('svc');if(s)s.scrollIntoView({behavior:'smooth',block:'start'});},80);};
  function boot(){updateNodes(); if(!document.querySelector('.mind-node.active'))showServiceSub('dopious');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
  const oldLoad=window.loadData;
  if(typeof oldLoad==='function'){
    window.loadData=async function(){const r=await oldLoad.apply(this,arguments);try{updateNodes();}catch(e){}return r;};
  }
})();


/* =========================================================
   CONTACT SETTINGS PATCH — Admin-editable contact page
   Keeps public layout fast and uses existing Firebase company data.
   ========================================================= */
(function(){
  function _esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function _clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function _lines(v){
    if(Array.isArray(v)) return v.map(_clean).filter(Boolean);
    return String(v||'').split(/\n|\|\||,/).map(_clean).filter(Boolean);
  }
  function _first(){for(var i=0;i<arguments.length;i++){var v=arguments[i]; if(Array.isArray(v)&&v.length)return v[0]; if(_clean(v))return _clean(v);} return '';}
  function _arr(raw){return Array.isArray(raw)?raw:(_clean(raw)?[raw]:[]);}
  function _phoneDigits(p){return String(p||'').replace(/[^+0-9]/g,'');}
  function _waFromPhone(p){var d=_phoneDigits(p).replace(/^\+/,''); if(d.startsWith('0')) d='66'+d.slice(1); return d?'https://wa.me/'+d:'';}
  function _url(v,kind){
    v=_clean(v); if(!v)return '';
    if(kind==='line' && v.charAt(0)==='@') return 'https://line.me/R/ti/p/'+encodeURIComponent(v);
    if(kind==='instagram' && !/^https?:\/\//i.test(v) && !v.includes('.')) return 'https://instagram.com/'+v.replace(/^@/,'');
    if(kind==='facebook' && !/^https?:\/\//i.test(v) && !v.includes('.')) return 'https://facebook.com/'+v.replace(/^@/,'');
    if(kind==='messenger' && !/^https?:\/\//i.test(v) && !v.includes('.')) return 'https://m.me/'+v.replace(/^@/,'');
    if(kind==='linkedin' && !/^https?:\/\//i.test(v) && !v.includes('.')) return 'https://linkedin.com/company/'+v.replace(/^@/,'');
    if(/^https?:\/\//i.test(v) || /^mailto:|^tel:/i.test(v)) return v;
    return 'https://'+v;
  }
  function _channel(label,value,href,icon,cls,force){
    value=_clean(value); href=_clean(href);
    var empty=!value && !href;
    if(empty && !force)return '';
    var show=value || 'Add in Admin';
    var isExternal=href&&/^https?:/i.test(href);
    var attrs=empty?'aria-disabled="true"':('href="'+_esc(href||'#')+'" '+(isExternal?'target="_blank" rel="noopener"':''));
    return '<a class="contact-card '+(cls||'')+(empty?' is-empty':'')+'" '+attrs+'><span class="contact-ic">'+_esc(icon||label[0]||'+')+'</span><div><b>'+_esc(label)+'</b><span>'+_esc(show)+'</span></div></a>';
  }
  window.normContact=function(raw){
    raw=raw||{};
    var phones=[].concat(_arr(raw.phones),_lines(raw.phoneList),_arr(raw.phone),_arr(raw.phone2),_arr(raw.phone3),_arr(raw.tel),_arr(raw.tel2),_arr(raw.tel3)).map(_clean).filter(Boolean);
    phones=[...new Set(phones)];
    var emails=[].concat(_arr(raw.emails),_lines(raw.emailList),_arr(raw.email),_arr(raw.email2),_arr(raw.email3)).map(_clean).filter(Boolean);
    emails=[...new Set(emails)];
    var office=_first(raw.office,raw.location,raw.city,'Bangkok / Thailand');
    return {
      name:_first(raw.name,raw.company,'Dopious Partnership Limited'),
      contactTitle:_first(raw.contactTitle,'CONTACT+'),
      contactSubtitle:_first(raw.contactSubtitle,raw.contactDesc,'Start a project, request a quotation, or talk with us about your next design / production brief.'),
      office:office,
      address:_first(raw.address,raw.fullAddress,office),
      mapUrl:_url(_first(raw.mapUrl,raw.googleMap,raw.maps),'map'),
      phones:phones.length?phones:['+66 93-691-6592'],
      emails:emails.length?emails:['info.dopiousth@gmail.com'],
      line:_url(_first(raw.line,raw.lineUrl,raw.lineURL,'https://line.me/R/ti/p/@dopious'),'line'),
      whatsapp:_url(_first(raw.whatsapp,raw.whatsappUrl,raw.whatsappURL,''),'whatsapp'),
      facebook:_url(_first(raw.facebook,raw.facebookUrl,''),'facebook'),
      messenger:_url(_first(raw.messenger,raw.facebookMessenger,raw.messengerUrl,''),'messenger'),
      instagram:_url(_first(raw.instagram,raw.ig,raw.igUrl,''),'instagram'),
      linkedin:_url(_first(raw.linkedin,raw.linkedinUrl,''),'linkedin'),
      behance:_url(_first(raw.behance,raw.behanceUrl,''),'behance'),
      website:_url(_first(raw.website,raw.websiteUrl,''),'website')
    };
  };
  function _renderContactHTML(c){
    var email=c.emails[0]||'';
    var phone=c.phones[0]||'';
    var wa=c.whatsapp||_waFromPhone(phone);
    var title=_clean(c.contactTitle||'CONTACT+');
    title=title.replace(/\+$/,'<span>+</span>');
    var cards='';
    cards+=_channel('Line', c.line&&c.line.includes('@')?c.line:'@dopious', c.line, 'L','line',true);
    cards+=_channel('WhatsApp', phone||wa, wa, 'W','whatsapp',true);
    cards+=_channel('Email', email, email?'mailto:'+email:'', '@','email',true);
    c.phones.forEach(function(p,i){cards+=_channel(i===0?'Tel':'Tel '+(i+1), p, 'tel:'+_phoneDigits(p), '☎','phone',true);});
    cards+=_channel('Facebook', c.facebook?'Facebook Page':c.facebook, c.facebook, 'f','facebook',true);
    cards+=_channel('Messenger', c.messenger?'Messenger':c.messenger, c.messenger, 'M','messenger',true);
    cards+=_channel('Instagram', c.instagram?'Instagram':c.instagram, c.instagram, 'IG','instagram',true);
    cards+=_channel('LinkedIn', c.linkedin?'LinkedIn':c.linkedin, c.linkedin, 'in','linkedin',true);
    cards+=_channel('Behance', c.behance?'Behance':c.behance, c.behance, 'Be','behance',true);
    cards+=_channel('Website', c.website?'Website':c.website, c.website, 'www','website',true);
    return '<div class="contact-clean-page"><div class="contact-intro"><small>Dopious+ Contact</small><h2>'+title+'</h2><p>'+_esc(c.contactSubtitle)+'</p></div><div class="contact-main-grid"><div class="contact-card-grid">'+cards+'</div><div class="contact-office-box"><small>Office / Location</small><strong>'+_esc(c.office)+'</strong><p>'+_esc(c.address||c.office)+'</p>'+(c.mapUrl?'<a href="'+_esc(c.mapUrl)+'" target="_blank" rel="noopener">Open Map</a>':'')+'</div></div></div>';
  }
  window.applyCompanyContact=function(){
    var c=normContact(window._CO||_CO||{});
    var phone=c.phones[0]||'';
    var email=c.emails[0]||'';
    var tel='tel:'+_phoneDigits(phone);
    var wa=c.whatsapp||_waFromPhone(phone);
    document.querySelectorAll('a[href^="https://line.me"],button[onclick*="line.me"]').forEach(function(a){if(a.tagName==='A')a.href=c.line;else a.setAttribute('onclick',"window.open('"+c.line+"','_blank')")});
    document.querySelectorAll('a[href^="https://wa.me"],button[onclick*="wa.me"]').forEach(function(a){if(a.tagName==='A')a.href=wa;else a.setAttribute('onclick',"window.open('"+wa+"','_blank')")});
    document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){a.href='mailto:'+email});
    document.querySelectorAll('a[href^="tel:"]').forEach(function(a){a.href=tel});
    document.querySelectorAll('.of').forEach(function(of){var t=of.textContent.toLowerCase();if(t.includes('office'))of.innerHTML='<b>Office</b><br>'+_esc(c.office);if(t.includes('phone'))of.innerHTML='<b>Phone</b><br>'+_esc(phone);if(t.includes('email'))of.innerHTML='<b>Email</b><br>'+_esc(email)});
    document.querySelectorAll('.poi div').forEach(function(d,i){if(i===0)d.innerHTML='<b>'+_esc(c.name)+'</b>';if(i===1)d.innerHTML='<b>'+_esc(phone)+'</b>';if(i===2)d.innerHTML='<b>'+_esc(email)+'</b>'});
    var hero=document.querySelector('#cP .cont-hero');
    if(hero) hero.innerHTML=_renderContactHTML(c);
    var home=document.querySelector('.cs');
    if(home){
      var socials='';
      socials+=c.line?'<a class="sc2" href="'+_esc(c.line)+'" target="_blank" rel="noopener">L</a>':'';
      socials+=wa?'<a class="sc2" href="'+_esc(wa)+'" target="_blank" rel="noopener">W</a>':'';
      socials+=c.facebook?'<a class="sc2" href="'+_esc(c.facebook)+'" target="_blank" rel="noopener">f</a>':'';
      socials+=c.instagram?'<a class="sc2" href="'+_esc(c.instagram)+'" target="_blank" rel="noopener">IG</a>':'';
      var scs=home.querySelector('.scs'); if(scs)scs.innerHTML=socials;
      var input=home.querySelector('.eb input'); if(input)input.placeholder=email||'YOUR EMAIL ADDRESS';
    }
  };
})();

/* =========================================================
   HOW IT WORKS EXACT CARD JUMP FIX
   Scope: How It Works sub-head chips -> exact Works/Services card only.
   Product under Industrial Design+ must jump to the Industrial Design+ / Product card.
   ========================================================= */
(function(){
  function _text(v){return String(v==null?'':v).replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();}
  function _key(v){return _text(v).toLowerCase().replace(/[–—]/g,'-').replace(/\+/g,'').replace(/[^a-z0-9ก-๙]+/gi,' ').replace(/\s+/g,' ').trim();}
  function _canonService(v){
    var raw=_text(v);
    try{ if(typeof normSvc==='function') raw=normSvc(raw); }catch(e){}
    var k=_key(raw);
    try{ if(typeof CAT_ALIAS==='object' && CAT_ALIAS[k]) raw=CAT_ALIAS[k]; }catch(e){}
    try{
      var hit=(CATS||[]).find(function(c){return _key(c.svc)===_key(raw)||_key(c.cat)===_key(raw);});
      if(hit) return hit.svc;
    }catch(e){}
    return raw;
  }
  function _meta(service){
    var s=_canonService(service), sk=_key(s);
    try{return (CATS||[]).find(function(c){return _key(c.svc)===sk || _key(c.cat)===sk;})||null;}catch(e){return null;}
  }
  function _canonSub(service,sub){
    var raw=_text(sub); if(!raw) return 'General';
    var m=_meta(service), rk=_key(raw);
    if(m && Array.isArray(m.subs)){
      var exact=m.subs.find(function(x){return _key(x)===rk;});
      if(exact) return exact;
      var near=m.subs.find(function(x){var k=_key(x);return k && (k.includes(rk)||rk.includes(k));});
      if(near) return near;
    }
    return raw;
  }
  function _cardSub(card){
    var ds=card.getAttribute('data-sub')||'';
    if(ds) return ds;
    var el=card.querySelector('.card-sub-one,.card-sub-list em,.cat-slide-label span:nth-child(2)');
    return el?_text(el.textContent):'';
  }
  function _cardService(card){
    var ds=card.getAttribute('data-service')||'';
    if(ds) return ds;
    var el=card.querySelector('.card-head,.cat-slide-label span:first-child');
    return el?_text(el.textContent):'';
  }
  function _findCard(service,sub){
    var s=_key(_canonService(service));
    var u=_key(_canonSub(service,sub));
    var cards=[].slice.call(document.querySelectorAll('.cat-slide-card[data-service], .cat-slide-card'));
    var exact=null;
    cards.some(function(card){
      var cs=_key(_canonService(_cardService(card)));
      var cu=_key(_canonSub(service,_cardSub(card)));
      if(cs===s && cu===u){exact=card;return true;}
      return false;
    });
    if(exact) return exact;
    /* Secondary fallback: inspect slide JSON because some old card labels were updated after render. */
    cards.some(function(card){
      var slides=[];try{slides=JSON.parse(card.getAttribute('data-slides')||'[]');}catch(e){}
      return slides.some(function(sl){
        var cs=_key(_canonService(sl.service||sl.svc||''));
        var cu=_key(_canonSub(service,sl.subHead||sl.sub||sl.subHeadline||''));
        if(cs===s && cu===u){exact=card;return true;}
        return false;
      });
    });
    return exact;
  }
  function _focusCard(card){
    if(!card) return false;
    try{card.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){
      var y=card.getBoundingClientRect().top+(window.pageYOffset||0)-90; window.scrollTo(0,y);
    }
    card.classList.add('jump-focus');
    setTimeout(function(){card.classList.remove('jump-focus');},2600);
    return true;
  }
  window.goHowSub=function(service,sub){
    service=_canonService(service); sub=_canonSub(service,sub);
    try{ if(typeof cH==='function') cH(); else {var h=document.getElementById('hP'); if(h)h.classList.remove('on');} }catch(e){}
    try{document.body.style.overflow='';document.documentElement.style.overflow='';document.body.style.height='';document.documentElement.style.height='';}catch(e){}
    setTimeout(function(){
      if(typeof rSvc==='function') rSvc();
      var target=_findCard(service,sub);
      var sec=document.getElementById('svc');
      if(target){_focusCard(target);return;}
      if(sec){try{sec.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){window.scrollTo(0,sec.offsetTop-70);}}
    },180);
  };
  window.showServiceSub=function(key){
    var panel=document.getElementById('serviceSubPanel'); if(!panel)return;
    var idx=parseInt(String(key||'').replace(/\D/g,''),10)-1;
    var meta=(!isNaN(idx)&&Array.isArray(CATS))?CATS[idx]:null;
    var kicker=document.getElementById('subKicker'), title=document.getElementById('subTitle'), desc=document.getElementById('subDesc'), chips=document.getElementById('subChips');
    document.querySelectorAll('.mind-node').forEach(function(n){n.classList.remove('active');});
    var node=document.querySelector('.mind-node.'+key); if(node)node.classList.add('active');
    if(!meta){
      if(kicker)kicker.textContent='DOPIOUS+ ONE-STOP SERVICE';
      if(title)title.innerHTML='Select a Service Head';
      if(desc)desc.textContent='เลือก Head รอบวงกลมเพื่อดู Sub Head ทั้งหมด แล้วคลิก Sub Head เพื่อไปยังการ์ด Works / Services ที่ตรงกัน';
      if(chips)chips.innerHTML='';
      return;
    }
    if(kicker)kicker.textContent=meta.svc||'';
    if(title)title.innerHTML=(String(meta.svc||'').replace(/\+$/,'')+'<em>+</em>');
    if(desc)desc.textContent='เลือก Sub Head เพื่อไปยังการ์ด Works / Services ที่ใช้ Head + Sub Head ตรงกัน';
    if(chips){
      chips.innerHTML=(meta.subs||[]).map(function(rawSub){
        var sub=_canonSub(meta.svc,rawSub);
        var has=!!_findCard(meta.svc,sub);
        return '<button class="how-sub-chip '+(has?'has-work':'no-work')+'" type="button" data-service="'+_text(meta.svc).replace(/"/g,'&quot;')+'" data-sub="'+_text(sub).replace(/"/g,'&quot;')+'">'+sub+'</button>';
      }).join('');
      chips.querySelectorAll('.how-sub-chip').forEach(function(btn){
        btn.addEventListener('click',function(){goHowSub(btn.getAttribute('data-service'),btn.getAttribute('data-sub'));});
      });
    }
  };
})();

/* =========================================================
   HOW IT WORKS SUBHEAD VISIBILITY FIX
   - Center/default state must not be blank.
   - Shows every Head with its Sub Head chips.
   - Each Sub Head chip jumps by exact Head + Sub Head pair.
   ========================================================= */
(function(){
  function _esc(v){
    try{return typeof esc==='function'?esc(String(v||'')):String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});}
    catch(e){return String(v||'');}
  }
  function _clean(v){return String(v||'').replace(/\s+/g,' ').trim();}
  function _key(v){return _clean(v).toLowerCase().replace(/[–—]/g,'-').replace(/\+/g,'').replace(/[^a-z0-9ก-๙]+/gi,' ').replace(/\s+/g,' ').trim();}
  function _plus(v){return _esc(String(v||'').replace(/\+$/,''))+'<em>+</em>';}
  function _quote(v){return String(v||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');}
  function _getCats(){return Array.isArray(CATS)?CATS.filter(function(c){return c && (c.svc||c.cat) && Array.isArray(c.subs) && c.subs.length;}):[];}
  function _metaFromKey(key){
    if(!key || key==='dopious') return null;
    var i=parseInt(String(key).replace(/\D/g,''),10)-1;
    var list=_getCats();
    return (!isNaN(i) && list[i]) ? list[i] : null;
  }
  function _projectService(p){
    var raw=(p&&(_clean(p.service)||_clean(p.svc)||_clean(p.cat)||_clean(p.category)))||'';
    try{if(typeof normSvc==='function') raw=normSvc(raw);}catch(e){}
    return raw;
  }
  function _projectSub(p){
    if(!p) return '';
    if(_clean(p.subHead)) return _clean(p.subHead);
    if(_clean(p.sub)) return _clean(p.sub);
    if(Array.isArray(p.subHeads) && _clean(p.subHeads[0])) return _clean(p.subHeads[0]);
    if(Array.isArray(p.subServices) && _clean(p.subServices[0])) return _clean(p.subServices[0]);
    return _clean(p.subHeadline)||'General';
  }
  function _available(service,sub){
    var s=_key(service), u=_key(sub), n=0;
    try{(_P||[]).forEach(function(p){ if(_key(_projectService(p))===s && _key(_projectSub(p))===u) n++; });}catch(e){}
    return n;
  }
  function _chip(service,sub){
    var count=_available(service,sub);
    var cls=count?' has-work':' no-work';
    return '<button class="how-sub-chip'+cls+'" type="button" onclick="goHowSub(\''+_quote(service)+'\',\''+_quote(sub)+'\')">'+_esc(sub)+(count?' <small>'+count+'</small>':'')+'</button>';
  }
  function _renderAll(chips){
    var html='';
    _getCats().forEach(function(c){
      html+='<div class="how-sub-group"><div class="how-sub-group-title">'+_plus(c.svc||c.cat||'')+'</div><div class="how-sub-group-chips">'+(c.subs||[]).map(function(s){return _chip(c.svc||c.cat,s);}).join('')+'</div></div>';
    });
    chips.innerHTML=html;
  }
  var _oldShow=window.showServiceSub;
  window.showServiceSub=function(key){
    var panel=document.getElementById('serviceSubPanel'); if(!panel)return;
    var meta=_metaFromKey(key);
    var kicker=document.getElementById('subKicker'), title=document.getElementById('subTitle'), desc=document.getElementById('subDesc'), chips=document.getElementById('subChips');
    document.querySelectorAll('.mind-node').forEach(function(n){n.classList.remove('active');});
    var node=document.querySelector('.mind-node.'+key); if(node)node.classList.add('active');
    if(!meta){
      if(kicker) kicker.textContent='DOPIOUS+ SERVICE HEADS';
      if(title) title.innerHTML='All Heads & Sub Heads';
      if(desc) desc.textContent='เลือก Sub Head ด้านล่างเพื่อเด้งไปที่การ์ด Works / Services ที่มี Head + Sub Head ตรงกัน';
      if(chips) _renderAll(chips);
      return;
    }
    if(kicker) kicker.textContent=meta.svc||meta.cat||'';
    if(title) title.innerHTML=_plus(meta.svc||meta.cat||'');
    if(desc) desc.textContent='Sub Head ของ '+String(meta.svc||meta.cat||'').replace(/\+$/,'')+' — คลิกเพื่อไปยัง Card ที่ตรงกับ Head + Sub Head นี้';
    if(chips) chips.innerHTML=(meta.subs||[]).map(function(sub){return _chip(meta.svc||meta.cat,sub);}).join('');
  };
  function _refreshDefault(){
    try{
      var h=document.getElementById('hP');
      var noActive=!document.querySelector('.mind-node.active');
      if(h && h.classList.contains('on') && noActive) window.showServiceSub('dopious');
      if(h && h.classList.contains('on')){
        var chips=document.getElementById('subChips');
        if(chips && !chips.children.length) window.showServiceSub('dopious');
      }
    }catch(e){}
  }
  try{
    var oldOH=window.oH;
    window.oH=function(){ if(typeof oldOH==='function') oldOH.apply(this,arguments); setTimeout(function(){window.showServiceSub('dopious');},80); };
  }catch(e){}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){window.showServiceSub('dopious');},300);});
  else setTimeout(function(){window.showServiceSub('dopious');},300);
  setTimeout(_refreshDefault,900);
})();

/* =========================================================
   HOW IT WORKS — static service information only
   - Sub Heads no longer jump to Works cards.
   - Panel simply explains what each Head includes.
   - Contact buttons remain at the bottom.
   ========================================================= */
(function(){
  function hEsc(v){
    try{return typeof esc==='function'?esc(String(v||'')):String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});}
    catch(e){return String(v||'');}
  }
  function cats(){return Array.isArray(CATS)?CATS.filter(function(c){return c && (c.svc||c.cat) && Array.isArray(c.subs) && c.subs.length;}):[];}
  function metaFromKey(key){
    if(!key || key==='dopious') return null;
    var i=parseInt(String(key).replace(/\D/g,''),10)-1;
    var list=cats();
    return (!isNaN(i) && list[i]) ? list[i] : null;
  }
  function plusLabel(v){return hEsc(String(v||'').replace(/\+$/,''))+'<em>+</em>';}
  function chip(sub){return '<span class="how-sub-chip static" aria-label="Sub service">'+hEsc(sub)+'</span>';}
  function renderAll(chips){
    var html='';
    cats().forEach(function(c){
      var title=c.svc||c.cat||'';
      html+='<div class="how-sub-group"><div class="how-sub-group-title">'+plusLabel(title)+'</div><div class="how-sub-group-chips">'+(c.subs||[]).map(chip).join('')+'</div></div>';
    });
    chips.innerHTML=html;
  }
  function renderOne(chips,meta){
    chips.innerHTML='<div class="how-sub-group only"><div class="how-sub-group-chips">'+(meta.subs||[]).map(chip).join('')+'</div></div>';
  }
  window.goHowSub=function(){ return false; };
  window.goServicesFromHow=function(){ try{ if(typeof oSt==='function') oSt(); }catch(e){} };
  window.showServiceSub=function(key){
    var panel=document.getElementById('serviceSubPanel'); if(!panel) return;
    var meta=metaFromKey(key);
    var kicker=document.getElementById('subKicker'), title=document.getElementById('subTitle'), desc=document.getElementById('subDesc'), chips=document.getElementById('subChips');
    document.querySelectorAll('.mind-node').forEach(function(n){n.classList.remove('active');});
    var node=document.querySelector('.mind-node.'+key); if(node) node.classList.add('active');
    if(!meta){
      if(kicker) kicker.textContent='DOPIOUS+ SERVICE HEADS';
      if(title) title.innerHTML='All Services & Sub Heads';
      if(desc) desc.textContent='รวมรายการบริการทั้งหมดของ DOPIOUS+ แยกตาม Service Head เพื่อให้เห็นว่าแต่ละหมวดมีงานย่อยอะไรบ้าง';
      if(chips) renderAll(chips);
      return;
    }
    var name=meta.svc||meta.cat||'';
    if(kicker) kicker.textContent=name;
    if(title) title.innerHTML=plusLabel(name);
    if(desc) desc.textContent='บริการย่อยในหมวด '+String(name).replace(/\+$/,'')+' มีดังนี้';
    if(chips) renderOne(chips,meta);
  };
  function bootHow(){try{window.showServiceSub('dopious');}catch(e){}}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(bootHow,250);});
  else setTimeout(bootHow,250);
})();
