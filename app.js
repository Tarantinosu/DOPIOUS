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
var _OLDPUB=null,_OLDPROJECTS=[],_OLDCLIENTS=[],_OLDTEAM=[],_CO={};

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
  {cat:'BRAND STRATEGY / CORPORATE IDENTITY / DESIGN+',bg:'linear-gradient(90deg,rgba(35,8,0,.88),rgba(80,18,40,.35)),radial-gradient(circle at 62% 50%,#9024a0 0 18%,transparent 19%),linear-gradient(100deg,#2a0c08 0 28%,#a11ca7 29% 58%,#6c6c6c 59% 100%)',svc:'Brand Strategy Corporate Identity Design+'},
  {cat:'INDUSTRIAL DESIGN+',bg:'linear-gradient(90deg,rgba(3,8,18,.9),rgba(0,0,0,.2)),linear-gradient(100deg,#0b0d13 0 30%,#1b2028 31% 62%,#bec4c8 63% 100%)',svc:'Industrial Design+'},
  {cat:'SPACE DESIGN+',bg:'linear-gradient(90deg,rgba(0,18,10,.85),rgba(0,0,0,.2)),radial-gradient(ellipse at 62% 52%,rgba(255,255,255,.38),transparent 25%),linear-gradient(100deg,#06120c 0 25%,#223328 26% 70%,#0a0a0a 71% 100%)',svc:'Space Design+'},
  {cat:'KEYVISUAL / CREATIVE ADS / DESIGN+',bg:'linear-gradient(90deg,rgba(40,5,5,.82),rgba(0,0,0,.12)),linear-gradient(100deg,#24100c 0 18%,#5d0d0a 19% 22%,#111 23% 72%,#7a1d12 73% 100%)',svc:'Keyvisual Creative Ads Design+'},
  {cat:'GRAPHIC DESIGN+',bg:'linear-gradient(90deg,rgba(30,0,0,.84),rgba(255,42,20,.28)),radial-gradient(circle at 70% 48%,rgba(255,42,20,.62),transparent 18%),linear-gradient(100deg,#140606 0 40%,#2b1010 41% 72%,#ff2a14 73% 100%)',svc:'Graphic Design+'},
  {cat:'PACKAGING DESIGN+',bg:'linear-gradient(90deg,rgba(70,12,28,.7),rgba(255,210,222,.35)),radial-gradient(circle at 72% 44%,#f0a6b6 0 13%,transparent 14%),linear-gradient(100deg,#2b0d16 0 38%,#efc6d2 39% 100%)',svc:'Packaging Design+'},
  {cat:'WEBSITE / UX-UI DESIGN+',bg:'linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.15)),linear-gradient(100deg,#0b1020 0 38%,#242424 39% 100%)',svc:'Website UX-UI Design+'},
  {cat:'SCULPTURE DESIGN+',bg:'linear-gradient(90deg,rgba(0,0,0,.78),rgba(255,255,255,.12)),radial-gradient(circle at 62% 52%,rgba(255,255,255,.62),transparent 20%),linear-gradient(100deg,#070707 0 45%,#3b3b3b 46% 100%)',svc:'Sculpture Design+'},
  {cat:'FASHION DESIGN+',bg:'linear-gradient(90deg,rgba(180,0,0,.72),rgba(0,0,0,.1)),linear-gradient(100deg,#ff2115 0 36%,#111 37% 100%)',svc:'Fashion Design+'},
  {cat:'2D-3D MOTION GRAPHIC DESIGN+',bg:'linear-gradient(90deg,rgba(0,68,92,.72),rgba(6,148,165,.25)),radial-gradient(circle at 55% 44%,#f4d36b 0 14%,transparent 15%),linear-gradient(100deg,#0b9aaa 0 44%,#077e8e 45% 100%)',svc:'2D-3D Motion Graphic Design+'},
  {cat:'PHOTO / VIDEO / ADS DESIGN+',bg:'linear-gradient(90deg,rgba(120,12,3,.75),rgba(8,40,52,.25)),radial-gradient(circle at 42% 48%,#ff4a28 0 10%,transparent 11%),linear-gradient(100deg,#102e3c 0 36%,#9b1d10 37% 100%)',svc:'Photo / Video / Ads Design+'},
  {cat:'BUILD & INSTALLATION+',bg:'linear-gradient(90deg,rgba(10,10,10,.88),rgba(60,30,10,.4)),linear-gradient(100deg,#0a0a08 0 38%,#2a1e0e 39% 100%)',svc:'Build & Installation+'},
];
const S2C={};CATS.forEach((c,i)=>S2C[c.svc]=i);

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
function normSvc(v){
  v=String(v||'').trim();
  if(!v)return'';
  const direct=CATS.find(c=>c.svc===v);if(direct)return direct.svc;
  const low=v.toLowerCase().replace(/[^a-z0-9]/g,'');
  const hit=CATS.find(c=>c.svc.toLowerCase().replace(/[^a-z0-9]/g,'')===low||c.cat.toLowerCase().replace(/[^a-z0-9]/g,'')===low);
  return hit?hit.svc:v;
}
function arrUrl(a){return (Array.isArray(a)?a:[]).map(x=>typeof x==='string'?x:(x&&(x.data||x.url||x.src)||'')).filter(x=>/^https?:\/\//i.test(String(x)));}
function legacyKey(p,i){return String(p&&((p.id||p._id||'')+'|'+(p.name||p.nm||'')+'|'+(p.coverImage||p.cover||p.covUrl||''))||i).toLowerCase().replace(/\s+/g,' ').trim();}
function normProject(p,i,src){
  p=p||{};
  const cover=p.covUrl||p.coverImage||p.cover||p.coverThumb||'';
  const gallery=arrUrl(p.galleryImages&&p.galleryImages.length?p.galleryImages:(p.gallery&&p.gallery.length?p.gallery:(p.images||[])));
  const name=p.name||p.nm||p.title||'Untitled';
  const svc=normSvc(p.service||p.svc||p.cat||'');
  return Object.assign({},p,{
    _id:p._id||p.id||(src+'_'+i),_legacy:src==='old',
    nm:name,name,cl:p.client||p.cl||'',client:p.client||p.cl||'',
    cr:p.credit||p.cr||'Dopious+',credit:p.credit||p.cr||'Dopious+',
    svc,service:svc,sub:p.sub||'',yr:p.year||p.yr||'2026',year:p.year||p.yr||'2026',
    ds:p.desc||p.ds||'',desc:p.desc||p.ds||'',
    covUrl:cover,cover,coverImage:cover,coverThumb:p.coverThumb||(cover&&isDr(cover)?dTh(cover,400):cover),
    lqip:p.lqip||(cover&&isDr(cover)?dTh(cover,20):''),
    gallery,galleryImages:gallery,galleryCaptions:p.galleryCaptions||[],
    vurl:p.vurl||p.videoUrl||'',videoUrl:p.videoUrl||p.vurl||'',driveFolderUrl:p.driveFolderUrl||''
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
    const [ps,cs,ts,pubDoc,oldPDoc,oldCDoc,oldTDoc,oldCoDoc]=await Promise.all([
      db.collection(COL).orderBy('ts','desc').get().catch(()=>({docs:[]})),
      db.collection(COL_CL).orderBy('ts','asc').get().catch(()=>({docs:[]})),
      db.collection(COL_TM).orderBy('ts','asc').get().catch(()=>({docs:[]})),
      getDocValue('published'),
      getDocValue('dopiousAdminProjects'),
      getDocValue('dopiousClients'),
      getDocValue('dopiousAdminTeam'),
      getDocValue('dopiousAdminCompany')
    ]);
    const pub=pubDoc||{};_OLDPUB=pub;
    const oldProjects=Array.isArray(pub.projects)?pub.projects:(Array.isArray(docVal(oldPDoc))?docVal(oldPDoc):[]);
    const oldClients=Array.isArray(pub.clients)?pub.clients:(Array.isArray(docVal(oldCDoc))?docVal(oldCDoc):[]);
    const oldTeam=Array.isArray(pub.team)?pub.team:(Array.isArray(docVal(oldTDoc))?docVal(oldTDoc):[]);
    _CO=pub.company||docVal(oldCoDoc)||_CO||{};
    const newProjects=ps.docs.filter(d=>d.id!=='published').map((d,i)=>normProject({_id:d.id,...d.data()},i,'new'));
    _OLDPROJECTS=oldProjects.map((p,i)=>normProject(p,i,'old'));
    _P=mergeProjects(newProjects,_OLDPROJECTS);
    const newClients=cs.docs.map(d=>({_id:d.id,...d.data()}));
    _OLDCLIENTS=(oldClients||[]).map((c,i)=>({_id:c._id||c.id||('old_client_'+i),_legacy:true,nm:c.name||c.nm||'',name:c.name||c.nm||'',url:c.url||c.logoUrl||c.logo||'',logoUrl:c.logoUrl||c.url||c.logo||''}));
    _CL=mergeClients(newClients,_OLDCLIENTS);
    const newTeam=ts.docs.map(d=>({_id:d.id,...d.data()}));
    _OLDTEAM=(oldTeam||[]).map((m,i)=>({_id:m._id||m.id||('old_team_'+i),_legacy:true,nm:m.name||m.nm||'',name:m.name||m.nm||'',pos:m.position||m.pos||'',position:m.position||m.pos||'',ph:m.photo||m.ph||'',photo:m.photo||m.ph||''}));
    _TM=mergePeople(newTeam,_OLDTEAM);
    rSvc();rCl();applyCompanyContact();updAdminStatus();
  }catch(e){
    console.warn('loadData:',e);
    document.getElementById('sCt').textContent='Error loading';
  }
}
function mergeClients(a,b){const seen=new Set(),out=[];(a||[]).concat(b||[]).forEach((c,i)=>{const k=String((c.name||c.nm||'')+'|'+(c.url||c.logoUrl||'')).toLowerCase();if(seen.has(k))return;seen.add(k);out.push(c);});return out;}
function mergePeople(a,b){const seen=new Set(),out=[];(a||[]).concat(b||[]).forEach((m,i)=>{const k=String((m.name||m.nm||'')+'|'+(m.position||m.pos||'')).toLowerCase();if(seen.has(k))return;seen.add(k);out.push(m);});return out;}
function updAdminStatus(){const el=document.getElementById('apSt');if(el)el.textContent='Live '+_P.length+' works'+(_OLDPROJECTS.length?' / old admin '+_OLDPROJECTS.length:'');}

/* Service grid */
var _ac={},_tm2={};
function rSvc(){
  const g=document.getElementById('sG');if(!g)return;
  Object.keys(_tm2).forEach(k=>clearInterval(_tm2[k]));_tm2={};
  const gr={};
  _P.forEach((p,ai)=>{const svc=String(p.service||p.svc||'').trim();const idx=S2C[svc];if(idx===undefined)return;if(!gr[idx])gr[idx]=[];gr[idx].push({p,ai});});
  const html=CATS.map((cat,ci)=>{
    const its=gr[ci]||[];if(!its.length)return'';
    const sls=its.map(({p,ai})=>{const cu=getCov(p);return{ai,ti:p.name||p.nm||'Untitled',img:cu,lq:p.lqip||(cu&&isDr(cu)?dTh(cu,20):'')};});
    const cnt=sls.length;const lb=cat.cat.split('/').map(s=>s.trim());
    const ctr=cnt>1?'<div class="sct2"><button class="snv" onclick="nC(event,'+ci+',-1)">‹</button><span class="scn">1/'+cnt+'</span><button class="snv" onclick="nC(event,'+ci+',1)">›</button></div>':'';
    const layers=sls.map((s,li)=>'<div class="sl'+(li===0?' on':'')+'" data-li="'+li+'">'+(s.lq?'<div class="lq" style="background-image:url(\''+s.lq+'\')"></div>':'')+(s.img?'<img '+(li===0?'src':'data-src')+'="'+iU(s.img,li===0?600:400)+'" alt="'+esc(s.ti)+'" loading="'+(li===0?'eager':'lazy')+'" decoding="async">':'')+'</div>').join('');
    return'<article class="sc" id="sc'+ci+'" data-ci="'+ci+'" data-sl=\''+JSON.stringify(sls.map(s=>({ai:s.ai,ti:s.ti})))+'\'>'+layers+'<div class="sov"></div><div class="sp"><div class="snm">'+esc(sls[0].ti)+'</div>'+ctr+'</div><div class="slb"><span>'+esc(lb[0]||'')+'</span>'+(lb.length>1?'<span>'+esc(lb.slice(1).join(' / '))+'</span>':'')+'</div><button class="stp" aria-label="View" onclick="oCd('+ci+')"></button></article>';
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
  card.querySelectorAll('.sl').forEach((l,i)=>l.classList.toggle('on',i===nx));
  const nl=card.querySelector('.sl[data-li="'+nx+'"]');if(nl){const img=nl.querySelector('img[data-src]');if(img)ldI(img,img.dataset.src);}
  const ne=card.querySelector('.snm');if(ne)ne.textContent=sl[nx].ti||'';
  const nc=card.querySelector('.scn');if(nc)nc.textContent=(nx+1)+'/'+sl.length;
}
function nC(e,ci,d){e.stopPropagation();clearInterval(_tm2[ci]);stC(ci,d);const card=document.getElementById('sc'+ci);if(card){const sl=JSON.parse(card.getAttribute('data-sl')||'[]');if(sl.length>1)_tm2[ci]=setInterval(()=>stC(ci,1),4200);}}
function oCd(ci){const card=document.getElementById('sc'+ci);if(!card)return;const sl=JSON.parse(card.getAttribute('data-sl')||'[]');const s=sl[_ac[ci]||0]||sl[0];if(s&&s.ai!==undefined)oPD(s.ai);}

/* Project detail */
function oPD(ai){
  const p=_P[ai];if(!p)return;
  const gls=p.gallery||p.galleryImages||[];const vE=mVE(p.vurl||p.videoUrl||'');const covFull=getCovFull(p);
  let gal='';
  if(covFull){const lqS=isDr(covFull)?dTh(covFull,20):'';gal+='<div class="di"><div class="lq" style="background-image:url(\''+lqS+'\')"></div><img src="'+iU(covFull,1100)+'" alt="'+esc(p.name||p.nm||'')+'" loading="eager"></div>';}
  gls.forEach((url,i)=>{gal+='<div class="di"><div class="lq" style="background-image:url(\''+( isDr(url)?dTh(url,20):'')+'\')"></div><img '+(i<1?'src':'data-src')+'="'+iU(url,1100)+'" alt="" loading="'+(i<1?'eager':'lazy')+'"></div>';});
  if(vE)gal+='<div class="dv">'+vE+'</div>';
  if(!gal){const bg=CATS.find(c=>c.svc===(p.service||p.svc));gal='<div class="di" style="background:'+(bg?bg.bg:'#111')+'"></div>';}
  const svc=p.service||p.svc||'';const sub=p.sub||'';
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
  const tabs=document.querySelector('.ata');const body=document.querySelector('.ab');if(!tabs||!body||document.getElementById('txt'))return;
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
function slideMedia(p,ai,labelTop,labelBot,bg){
  const img=getCov(p); const video=p.videoUrl||p.vurl||'';
  const useVideo=!!video && (String(p.previewType||p.cardPreviewType||'').toLowerCase().includes('video') || !img || /photo\s*\/\s*video/i.test(String(p.service||p.svc||'')));
  return {ai:ai,title:p.name||p.nm||'Untitled',img:img,video:video,isVideo:useVideo,bg:bg,desc:p.desc||p.ds||'',labelTop:labelTop,labelBot:labelBot,service:p.service||p.svc||'',sub:p.sub||''};
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
      const items=groups[svc][subKey]; const rawSub=subKey==='__none__'?'':subKey; const labelTop=rawSub||shortSvc; const labelBot=rawSub?shortSvc:'';
      const slides=items.map(x=>slideMedia(x.p,x.ai,labelTop,labelBot,bg));
      const id='csSub_'+String(svc+'_'+subKey).replace(/[^a-zA-Z0-9]/g,'_').slice(0,52)+'_'+si;
      const controls=slides.length>1?'<div class="cat-slide-controls"><button class="cat-slide-btn" data-dir="-1" type="button">‹</button><span class="cat-slide-count">1 / '+slides.length+'</span><button class="cat-slide-btn" data-dir="1" type="button">›</button></div>':'';
      const layers=slides.map(renderLayer).join('');
      const safe=JSON.stringify(slides.map(s=>({ai:s.ai,title:s.title,desc:s.desc,labelTop:s.labelTop,labelBot:s.labelBot,isVideo:s.isVideo,video:s.video,service:s.service,sub:s.sub}))).replace(/'/g,'&#39;');
      const firstDesc=cleanCardText(slides[0]&&slides[0].desc); const firstVideo=slides[0]&&slides[0].isVideo;
      html+='<article class="cat-slide-card" id="'+id+'" data-service="'+esc(svc)+'" data-sub="'+esc(rawSub)+'" data-slides=\''+safe+'\'>'+layers+'<div class="cat-slide-top"><div class="cat-slide-name">'+esc(slides[0].title)+'</div>'+controls+'</div>'+(firstVideo?'<div class="video-badge">Video Preview</div>':'')+'<div class="cat-slide-label"><span>'+esc(labelTop)+'</span>'+(labelBot?'<span>'+esc(labelBot)+'</span>':'')+'<strong>Design<em>+</em></strong></div><div class="svc-desc" '+(firstDesc?'':'style="display:none"')+'><p>'+esc(firstDesc)+'</p></div><button class="stp" aria-label="View" onclick="oCardProject(event,\''+id+'\')"></button></article>';
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
  const s=sl[nx]||{};const n=card.querySelector('.cat-slide-name');if(n)n.textContent=s.title||'';const c=card.querySelector('.cat-slide-count');if(c)c.textContent=(nx+1)+' / '+sl.length;const desc=card.querySelector('.svc-desc');if(desc){const t=cleanCardText(s.desc);desc.style.display=t?'block':'none';desc.innerHTML='<p>'+esc(t)+'</p>';}let vb=card.querySelector('.video-badge');if(s.isVideo&&!vb){vb=document.createElement('div');vb.className='video-badge';card.appendChild(vb)}if(vb){vb.textContent='Video Preview';vb.style.display=s.isVideo?'block':'none'}const lab=card.querySelector('.cat-slide-label');if(lab)lab.innerHTML='<span>'+esc(s.labelTop||'')+'</span>'+(s.labelBot?'<span>'+esc(s.labelBot)+'</span>':'')+'<strong>Design<em>+</em></strong>';
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
  document.getElementById('subChips').innerHTML=(data.items||[]).map(item=>'<button type="button" onclick="jumpToWork(\''+key+'\',\''+esc(item).replace(/'/g,'\\\'')+'\')">'+esc(item)+'</button>').join('');
  document.querySelectorAll('.mind-node').forEach(n=>n.classList.remove('active')); const node=document.querySelector('.mind-node.'+key); if(node)node.classList.add('active');
}
function clearServiceSub(){showServiceSub('dopious')}
function jumpToWork(key,item){cH();setTimeout(()=>{const needle=String(item||'').split('|')[0].trim().toLowerCase();let card=[...document.querySelectorAll('.cat-slide-card[id]')].find(c=>(c.dataset.sub||'').toLowerCase().includes(needle)|| (c.dataset.service||'').toLowerCase().includes(needle)); if(!card)card=document.querySelector('.cat-slide-card[id]'); if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.classList.add('card-highlight');setTimeout(()=>card.classList.remove('card-highlight'),1600)}},180)}
function applyCustomServiceCategories(){
  const list=Array.isArray(_CUSTOM_CATS)?_CUSTOM_CATS:[]; const map=document.querySelector('.mind-map'); if(!map)return; map.querySelectorAll('.mind-node.custom-service-node').forEach(el=>el.remove());
  list.forEach((cat,i)=>{const key=cat.key||('custom_'+i);serviceSubData[key]={kicker:cat.full||cat.title||'Custom Service+',title:cat.title||'Custom Service',desc:cat.desc||'Custom service category added from Admin.',items:Array.isArray(cat.items)?cat.items:[]};const btn=document.createElement('button');btn.className='mind-node custom-service-node';btn.type='button';btn.onclick=()=>showServiceSub(key);btn.innerHTML='<b>'+esc(cat.title||'Custom Service')+'</b><span>'+esc(cat.subtitle||cat.full||'Custom Category')+'</span>';map.appendChild(btn);});
}
const _oldLoadDataForParity=loadData;
loadData=async function(){await _oldLoadDataForParity();try{applyCustomServiceCategories();showServiceSub('dopious')}catch(e){}};
if(typeof LEGACY_PASSWORDS!=='undefined'){['dopious123','dopious2026'].forEach(p=>{if(!LEGACY_PASSWORDS.includes(p))LEGACY_PASSWORDS.push(p)});}
function oAL(){op('aLo');setTimeout(()=>{const el=document.getElementById('aPw');if(el){el.type='text';el.focus();}},80)}
setTimeout(()=>{try{const el=document.getElementById('aPw');if(el)el.type='text';showServiceSub('dopious')}catch(e){}},250);
