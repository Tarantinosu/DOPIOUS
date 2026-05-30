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
    '.svcp-chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px}'+
    '.svcp-chip{font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.65);padding:7px 12px;border-radius:999px;cursor:pointer;transition:background .12s,color .12s,border-color .12s;white-space:nowrap}'+
    '.svcp-chip:hover,.svcp-chip:active{background:rgba(255,42,20,.15);border-color:rgba(255,42,20,.45);color:#fff}'+
    '.svcp-btn{font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.42);background:none;border:1px solid rgba(255,255,255,.1);padding:9px 16px;border-radius:6px;cursor:pointer;transition:color .12s,border-color .12s}'+
    '.svcp-btn:hover,.svcp-btn:active{color:#ff2a14;border-color:rgba(255,42,20,.38)}'+
    '@media(max-width:768px){'+
      '.svcp-top{padding:0 16px}'+
      '#svcPgBody{padding:20px 16px 56px}'+
      '.svcp-chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}'+
      '.svcp-chips::-webkit-scrollbar{display:none}'+
      '.svcp-chip{flex-shrink:0}'+
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

  /* ---------- render services page ---------- */
  function renderSvcPage(){
    var body=document.getElementById('svcPgBody');
    if(!body)return;
    var html='<div class="svcp-hd">'
      +'<div class="svcp-hd-label">What We Do</div>'
      +'<div class="svcp-hd-title">Services<em>+</em></div>'
      +'</div>';
    SVCS.forEach(function(s,i){
      var name=clean(s.svc);
      var num=(i+1<10?'0':'')+(i+1);
      var svcEnc=safe(name).replace(/'/g,'&#39;');
      var chips=(s.subs||[]).map(function(sub){
        var enc=safe(sub).replace(/'/g,'&#39;');
        return '<button class="svcp-chip" type="button" onclick="patchNavSub(\''+enc+'\',\''+svcEnc+'\')">'
          +safe(sub)+'</button>';
      }).join('');
      html+='<div class="svcp-section">'
        +'<div class="svcp-num">'+num+'</div>'
        +'<div class="svcp-name">'+safe(name)+'<em>+</em></div>'
        +(descs[s.svc]?'<div class="svcp-desc">'+safe(descs[s.svc])+'</div>':'')
        +'<div class="svcp-chips">'+chips+'</div>'
        +'<button class="svcp-btn" type="button" onclick="patchNavSub(\'\',\''+svcEnc+'\')">'
        +'View '+safe(name)+' Work <span style="color:#ff2a14">→</span>'
        +'</button>'
        +'</div>';
    });
    body.innerHTML=html;
  }

  /* ---------- render on panel open ---------- */
  var _origOH=window.oH;
  window.oH=function(){
    if(typeof _origOH==='function')_origOH.apply(this,arguments);
    setTimeout(renderSvcPage,80);
  };

  function boot(){renderSvcPage();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,300);});
  else setTimeout(boot,300);

})();
