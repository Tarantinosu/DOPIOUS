/* =========================================================
   patch.js — Services page v3
   Clean list of all 13 services + sub-head navigation
   ========================================================= */
(function(){

  /* ---------- inject styles ---------- */
  var st=document.createElement('style');
  st.textContent=
    '.svcp-top{position:sticky;top:0;z-index:30;height:62px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:rgba(5,5,5,.96);border-bottom:1px solid rgba(255,255,255,.08)}'+
    '#svcPgBody{padding:28px 24px 64px}'+
    '.svcp-hd{margin-bottom:28px}'+
    '.svcp-hd-label{font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.28);margin-bottom:6px}'+
    '.svcp-hd-title{font-size:clamp(26px,5vw,40px);font-weight:900;letter-spacing:-.055em;line-height:.95}'+
    '.svcp-hd-title em{color:#ff2a14;font-style:normal}'+
    '.svcp-section{padding:22px 0;border-bottom:1px solid rgba(255,255,255,.07)}'+
    '.svcp-section:last-child{border-bottom:none}'+
    '.svcp-num{font-size:10px;font-weight:900;letter-spacing:.14em;color:#ff2a14;margin-bottom:4px}'+
    '.svcp-name{font-size:clamp(18px,4vw,24px);font-weight:900;letter-spacing:-.04em;line-height:1;margin-bottom:8px}'+
    '.svcp-name em{color:#ff2a14;font-style:normal}'+
    '.svcp-desc{font-size:12px;color:rgba(255,255,255,.36);line-height:1.65;margin-bottom:14px;max-width:500px}'+
    '.svcp-tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}'+
    '.svcp-tile{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px 12px;text-align:left;cursor:pointer;transition:border-color .15s,background .15s;color:#fff}'+
    '.svcp-tile:hover,.svcp-tile:active{background:rgba(255,255,255,.07)}'+
    '.svcp-tile.active{border-color:rgba(255,42,20,.55);background:rgba(255,42,20,.08)}'+
    '.svcp-tile-num{font-size:10px;color:rgba(255,255,255,.25);margin-bottom:4px;font-weight:700;letter-spacing:.1em}'+
    '.svcp-tile-name{font-size:13px;font-weight:900;letter-spacing:-.03em;line-height:1.25;color:rgba(255,255,255,.8)}'+
    '.svcp-tile.active .svcp-tile-name{color:#fff}'+
    '.svcp-tile-name em{color:#ff2a14;font-style:normal}'+
    '.svcp-expanded{display:none;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:18px;background:rgba(255,255,255,.03);margin-bottom:12px}'+
    '.svcp-exp-name{font-size:clamp(20px,4vw,26px);font-weight:900;letter-spacing:-.05em;line-height:1;margin-bottom:10px}'+
    '.svcp-exp-name em{color:#ff2a14;font-style:normal}'+
    '.svcp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin-bottom:16px}'+
    '.svcp-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:13px 12px 11px;cursor:pointer;text-align:left;transition:background .12s,border-color .12s}'+
    '.svcp-card:hover,.svcp-card:active{background:rgba(255,42,20,.12);border-color:rgba(255,42,20,.38)}'+
    '.svcp-card-name{font-size:11px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.72);line-height:1.35}'+
    '.svcp-card-arr{font-size:11px;color:rgba(255,42,20,.55);margin-top:7px;line-height:1}'+
    '.svcp-btn{font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.38);background:none;border:1px solid rgba(255,255,255,.08);padding:9px 16px;border-radius:6px;cursor:pointer;transition:color .12s,border-color .12s}'+
    '.svcp-btn:hover,.svcp-btn:active{color:#ff2a14;border-color:rgba(255,42,20,.38)}'+
    '.svcp-mm{padding:40px 24px 0;text-align:center}'+
    '.svcp-mm-label{font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#ff2a14;margin-bottom:8px}'+
    '.svcp-mm-title{font-size:clamp(28px,5vw,42px);font-weight:900;letter-spacing:-.055em;line-height:.95;margin:0 0 10px}'+
    '.svcp-mm-title em{color:#ff2a14;font-style:normal}'+
    '.svcp-mm-sub{font-size:14px;color:rgba(255,255,255,.45);line-height:1.55;max-width:400px;margin:0 auto 28px}'+
    '.svcp-loading{padding:40px 0;text-align:center;font-size:13px;color:rgba(255,255,255,.3);letter-spacing:.06em}'+
    '@media(max-width:768px){'+
      '.svcp-top{padding:0 16px}'+
      '#svcPgBody{padding:20px 16px 56px}'+
      '.svcp-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:7px}'+
    '}';
  document.head.appendChild(st);

  /* ---------- helpers ---------- */
  function safe(v){
    v=String(v||'');
    try{if(typeof esc==='function')return esc(v);}catch(e){}
    return v.replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
  }
  function clean(v){return String(v||'').replace(/\+$/,'').trim();}

  function clrLocks(){
    document.body.style.overflow='';
    document.body.style.height='';
    document.documentElement.style.overflow='';
    document.documentElement.style.height='';
  }

  /* ---------- find card in works grid ---------- */
  function findCard(subN,svcN){
    var norm=function(s){return String(s||'').toLowerCase().replace(/[^a-z0-9ก-๙]/g,'');};
    var pfx=svcN?svcN.substring(0,Math.min(8,svcN.length)):'';
    var hit=null;
    document.querySelectorAll('#sG .cat-slide-card[data-service]').forEach(function(card){
      if(hit)return;
      var svcAttr=norm(card.getAttribute('data-service')||'');
      var subAttr=norm(card.getAttribute('data-sub')||'');
      if(pfx&&!svcAttr.includes(pfx))return;
      if(subN){if(subAttr.includes(subN))hit=card.id;}
      else hit=card.id;
    });
    return hit;
  }

  /* ---------- navigate to card ---------- */
  window.patchNavSub=function(subName,svcName){
    var norm=function(s){return String(s||'').toLowerCase().replace(/[^a-z0-9ก-๙]/g,'');};
    var subN=norm(subName);
    var svcN=norm(svcName);
    var raf=window.requestAnimationFrame||function(fn){setTimeout(fn,16);};

    var targetId=findCard(subN,svcN);
    var el=targetId?document.getElementById(targetId):null;

    /* iOS: override _sy ก่อน cH() เพื่อให้ uk() scroll ไปหาการ์ด */
    if(el){
      try{
        var savedY=typeof window._sy==='number'?window._sy:(window.scrollY||window.pageYOffset||0);
        var rect=el.getBoundingClientRect();
        window._sy=Math.max(0,savedY+rect.top-70);
      }catch(e){}
    }

    try{if(typeof cH==='function')cH();}catch(e){}
    clrLocks();

    function scrollNow(target){
      clrLocks();
      if(!target){
        var s=document.getElementById('svc');
        if(s)s.scrollIntoView({behavior:'smooth'});
        return;
      }
      raf(function(){raf(function(){
        clrLocks();
        var curY=window.scrollY||window.pageYOffset||0;
        var r=target.getBoundingClientRect();
        var destY=Math.max(0,curY+r.top-70);
        try{window.scrollTo({top:destY,behavior:'smooth'});}catch(e){window.scrollTo(0,destY);}
      });});
    }

    if(el){setTimeout(function(){scrollNow(el);},220);return;}

    /* retry ถ้า Firebase ยังโหลดอยู่ */
    var tries=0;
    var t=setInterval(function(){
      tries++;
      clrLocks();
      var tid=findCard(subN,svcN);
      if(tid||tries>=4){
        clearInterval(t);
        scrollNow(tid?document.getElementById(tid):null);
      }
    },500);
  };

  /* ---------- service data ---------- */
  var descs={
    'Space Design+':'Retail, commercial, residential, exhibition, event, kiosk, pop-up, VM / display, art installation',
    'Sculpture Design+':'Sculpture, art installation, public art, character sculpture, decorative object, landmark, spatial art',
    'Visual Production+':'Motion graphic, 2D/3D animation, visualization, video, photo, storyboard, ads, post-production',
    'Graphic Design+':'Layout, poster, social media, print, signage, packaging graphic, label, menu, brochure, catalogue',
    'Branding Design+':'Brand strategy, story, logo, visual identity, guideline, campaign identity, naming, mood & tone',
    'Key Visual Design+':'Key visual, campaign visual, ads, art direction, promotion visual, launch campaign, seasonal campaign',
    'Build & Install+':'Booth, display, event production, fabrication, on-site installation, site supervision, quality control',
    'Production Sourcing+':'Product sourcing, supplier, factory follow-up, sample development, material sourcing, quality check',
    'Industrial Design+':'Product, CMF, form, user experience, prototype, product visualization, packaging structure, manufacturing',
    'Corporate Design+':'Corporate identity, brand system, company profile, presentation, stationery, business document',
    'Digital Design+':'Website, UX-UI, landing page, interface, digital branding, mobile experience, user journey',
    'Fashion Design+':'Fashion, costume, uniform, styling direction, fashion concept, campaign styling, showpiece',
    'Creative Consultation+':'Creative brief, concept direction, design direction, budget, scope, material, production, supplier consulting'
  };

  var SVCS=[
    {svc:'Space Design+',subs:['Retail','Commercial','Residential','Office','Exhibition','Event','Kiosk','Pop-up Store','VM / Display','Window Display','Art Installation']},
    {svc:'Sculpture Design+',subs:['Sculpture','Art Installation','Public Art','Character Sculpture','Decorative Object','Landmark','3D Art Form','Spatial Art','Fabrication Concept']},
    {svc:'Visual Production+',subs:['Storyboard','Animatic','Motion Graphic','2D Animation','3D Animation','2D Visualization','3D Visualization','3D Composite','Visual Effects','LED Screen','Product Animation','VDO Production','Photo Production','Ads Production','Post Production','Shot Direction','Brand Film']},
    {svc:'Graphic Design+',subs:['Graphic','Illustration','Layout','Poster','Social Media','Print','Typography','Signage','Presentation','Visual System','Packaging Graphic','Label','Box Artwork','Infographic','Icon','Character Graphic','Pattern','Menu','Brochure','Catalogue','Key Art']},
    {svc:'Branding Design+',subs:['Brand Strategy','Brand Story','Logo','Visual Identity','Brand Guideline','Campaign Identity','Art Direction','Naming','Mood & Tone','Brand Communication']},
    {svc:'Key Visual Design+',subs:['Key Visual','Campaign Visual','Ads','Art Direction','Advertising Direction','Promotion Visual','Social Media','Launch Campaign','Seasonal Campaign','Storyboard','Visual Storytelling']},
    {svc:'Build & Install+',subs:['Booth Production','Display Production','Event Production','Fabrication','On-site Installation','Site Supervision','Material Execution','Supplier Coordination','Quality Control','Final Delivery']},
    {svc:'Production Sourcing+',subs:['Product Sourcing','Supplier Coordination','Factory Follow-up','Sample Development','Material Sourcing','Production Control','Quality Check','Final Delivery','Premium Gift','Merchandise','Corporate Gift']},
    {svc:'Industrial Design+',subs:['Product','Product Concept','CMF','Form','User Experience','Prototype','Product Visualization','Packaging Structure','Material','Manufacturing','Premium Product','Merchandise','Corporate Gift']},
    {svc:'Corporate Design+',subs:['Corporate Identity','Brand System','Company Profile','Presentation','Stationery','Corporate Graphic','Visual System','Office Collateral','Business Document']},
    {svc:'Digital Design+',subs:['Website','UX-UI','Landing Page','Web Experience','Interface','Digital Branding','Mobile Experience','User Journey','Conversion','Portfolio Website','Service Website']},
    {svc:'Fashion Design+',subs:['Fashion','Costume','Uniform','Styling Direction','Fashion Concept','Textile Direction','Character Styling','Campaign Styling','Showpiece']},
    {svc:'Creative Consultation+',subs:['Creative Brief','Concept Direction','Design Direction','Budget Planning','Scope Planning','Material Consulting','Production Consulting','Supplier Consulting','Campaign Consulting','Brand Consulting','Space Consulting','Product Consulting']}
  ];

  /* ---------- open a service (highlight tile + show expanded panel) ---------- */
  window.patchOpenSvc=function(svcName){
    var body=document.getElementById('svcPgBody');
    var expanded=document.getElementById('svcExpanded');
    if(!body||!expanded)return;

    /* highlight active tile */
    body.querySelectorAll('.svcp-tile').forEach(function(t){
      t.classList.toggle('active',t.getAttribute('data-svc')===svcName);
    });

    /* build expanded content */
    var g=readGroups();
    var items=g.map[svcName]||[];
    var name=clean(svcName);
    var svcEnc=safe(name).replace(/'/g,'&#39;');

    var cards=items.map(function(item){
      var label=item.sub||name;
      var enc=safe(item.sub).replace(/'/g,'&#39;');
      return '<button class="svcp-card" type="button" onclick="patchNavSub(\''+enc+'\',\''+svcEnc+'\')">'
        +'<div class="svcp-card-name">'+safe(label)+'</div>'
        +'<div class="svcp-card-arr">→</div>'
        +'</button>';
    }).join('');

    expanded.innerHTML='<div class="svcp-exp-name">'+safe(name)+'<em>+</em></div>'
      +(descs[svcName]?'<div class="svcp-desc">'+safe(descs[svcName])+'</div>':'')
      +'<div class="svcp-grid">'+cards+'</div>'
      +'<button class="svcp-btn" type="button" onclick="patchNavSub(\'\',\''+svcEnc+'\')">'
      +'View All '+safe(name)+' Work <span style="color:#ff2a14">→</span>'
      +'</button>';
    expanded.style.display='block';

    /* scroll expanded into view inside the panel */
    setTimeout(function(){
      var panel=document.getElementById('hP');
      if(!panel)return;
      var panelTop=panel.getBoundingClientRect().top;
      var expTop=expanded.getBoundingClientRect().top;
      panel.scrollBy({top:expTop-panelTop-70,behavior:'smooth'});
    },40);
  };

  /* ---------- mind map node → open service ---------- */
  window.patchScrollToSvc=function(svcName){patchOpenSvc(svcName);};

  /* ---------- read live cards from works grid ---------- */
  function readGroups(){
    var order=[],map={};
    document.querySelectorAll('#sG .cat-slide-card[data-service]').forEach(function(card){
      var svc=card.getAttribute('data-service')||'';
      var sub=card.getAttribute('data-sub')||'';
      if(!svc)return;
      if(!map[svc]){map[svc]=[];order.push(svc);}
      map[svc].push({id:card.id,sub:sub});
    });
    return{order:order,map:map};
  }

  /* ---------- render services page ---------- */
  var _renderTimer=null;
  function renderSvcPage(){
    var body=document.getElementById('svcPgBody');
    if(!body)return;

    var g=readGroups();

    /* ถ้า Firebase ยังโหลดอยู่ — แสดง loading แล้ว retry */
    if(!g.order.length){
      body.innerHTML='<div class="svcp-loading">Loading projects…</div>';
      clearTimeout(_renderTimer);
      _renderTimer=setTimeout(renderSvcPage,600);
      return;
    }
    clearTimeout(_renderTimer);

    var tiles='';
    g.order.forEach(function(svc,i){
      var name=clean(svc);
      var num=(i+1<10?'0':'')+(i+1);
      var svcEncQ=safe(svc).replace(/'/g,'&#39;');
      tiles+='<button class="svcp-tile" data-svc="'+safe(svc)+'" type="button" onclick="patchOpenSvc(\''+svcEncQ+'\')">'
        +'<div class="svcp-tile-num">'+num+'</div>'
        +'<div class="svcp-tile-name">'+safe(name)+'<em>+</em></div>'
        +'</button>';
    });

    body.innerHTML='<div class="svcp-hd">'
      +'<div class="svcp-hd-label">What We Do</div>'
      +'<div class="svcp-hd-title">Services<em>+</em></div>'
      +'</div>'
      +'<div class="svcp-tiles">'+tiles+'</div>'
      +'<div class="svcp-expanded" id="svcExpanded"></div>';
  }

  /* ---------- render on panel open ---------- */
  var _origOH=window.oH;
  window.oH=function(){
    if(typeof _origOH==='function')_origOH.apply(this,arguments);
    setTimeout(renderSvcPage,80);
  };

  /* re-render if works grid updates after panel already open */
  var _obs=null;
  try{
    _obs=new MutationObserver(function(){
      if(document.getElementById('hP')&&document.getElementById('hP').classList.contains('on')){
        clearTimeout(_renderTimer);
        _renderTimer=setTimeout(renderSvcPage,200);
      }
    });
    var sg=document.getElementById('sG');
    if(sg)_obs.observe(sg,{childList:true});
    else document.addEventListener('DOMContentLoaded',function(){
      var sg2=document.getElementById('sG');
      if(sg2&&_obs)_obs.observe(sg2,{childList:true});
    });
  }catch(e){}

  function boot(){renderSvcPage();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,400);});
  else setTimeout(boot,400);

})();
