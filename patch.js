/* =========================================================
   patch.js — How It Works panel fix  v2 (sub-chip nav)
   Load this AFTER app.js (already done in index.html).

   BEFORE: default state showed "All Services & Sub Heads"
           with a full grid of every service.

   AFTER:  default state shows a clean "Select a service"
           prompt with empty chips area.
           Clicking a node shows ONLY that service's
           sub heads in the panel.
           Clicking a sub-head chip closes the panel and
           scrolls to that service's section in #sG.
   ========================================================= */
(function(){

  /* ---------- helpers ---------- */
  function safe(v){
    v=String(v||'');
    try{if(typeof esc==='function')return esc(v);}catch(e){}
    return v.replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function clean(v){return String(v||'').replace(/\+$/,'').trim();}
  function plus(v){return safe(clean(v))+'<em>+</em>';}

  /* ---------- clickable chip with nav ---------- */
  function chip(v,svcName){
    var attr='onclick="patchNavSub(\''+safe(v).replace(/'/g,'&#39;')+'\',\''+safe(clean(svcName)).replace(/'/g,'&#39;')+'\')"';
    return '<span class="how-sub-chip explain-chip final-chip patch-chip-nav" '+attr+' role="button" tabindex="0">'+safe(v)+'</span>';
  }

  /* ---------- navigate: close panel → scroll to matching card ---------- */
  window.patchNavSub=function(subName,svcName){
    try{if(typeof cH==='function')cH();}catch(e){}

    setTimeout(function(){
      var norm=function(s){return String(s||'').toLowerCase().replace(/[^a-z0-9ก-๙]/g,'');};
      var subN=norm(subName);
      var svcN=norm(svcName);
      var target=null;

      /* ── ตรง: หา .slb em ที่ตรงกับ sub-head แล้วขึ้น article.sc ── */
      if(subN){
        var ems=document.querySelectorAll('#sG .slb em');
        ems.forEach(function(em){
          if(target)return;
          if(norm(em.textContent)===subN)target=em.closest('article')||em.closest('.sc');
        });
      }

      /* ── fallback: หา .slb .head ที่ตรงกับ service name ── */
      if(!target&&svcN){
        var heads=document.querySelectorAll('#sG .slb .head');
        heads.forEach(function(h){
          if(target)return;
          var t=norm(h.textContent);
          if(t&&(t===svcN||t.includes(svcN.substring(0,5))||svcN.includes(t.substring(0,5))))
            target=h.closest('article')||h.closest('.sc');
        });
      }

      /* ── fallback สุดท้าย: scroll ไป #svc ── */
      if(!target){
        var svcEl=document.getElementById('svc');
        if(svcEl)svcEl.scrollIntoView({behavior:'smooth'});
        return;
      }

      var y=target.getBoundingClientRect().top+window.pageYOffset-70;
      window.scrollTo({top:y,behavior:'smooth'});
      target.style.outline='2px solid #ff2a14';
      target.style.outlineOffset='4px';
      setTimeout(function(){target.style.outline='';target.style.outlineOffset='';},1400);
    },360);
  };

  /* ---------- service descriptions ---------- */
  var descs={
    'Space Design+':'ออกแบบพื้นที่จริงให้แบรนด์ใช้งานได้จริง ตั้งแต่ retail, commercial, exhibition, event, kiosk, pop-up, VM / display ไปจนถึง art installation',
    'Sculpture Design+':'ออกแบบงานประติมากรรมและ art object สำหรับพื้นที่จริง เช่น landmark, public art, character sculpture, decorative object และ spatial art',
    'Visual Production+':'ผลิตภาพและคอนเทนต์ภาพเคลื่อนไหว เช่น storyboard, motion graphic, 2D/3D animation, visualization, video, photo, ads และ post-production',
    'Graphic Design+':'ออกแบบกราฟิกที่ใช้กับแบรนด์และสื่อจริง เช่น layout, poster, social media, print, signage, presentation, packaging graphic, label, menu และ catalogue',
    'Branding Design+':'วางระบบแบรนด์ให้ชัดเจน ตั้งแต่ strategy, story, logo, visual identity, guideline, campaign identity, naming, mood & tone และ brand communication',
    'Key Visual Design+':'ออกแบบภาพหลักสำหรับแคมเปญและโฆษณา เช่น key visual, campaign visual, ads, promotion visual, launch campaign, seasonal campaign และ visual storytelling',
    'Build & Install+':'ดูแลงานผลิตและติดตั้งจริง เช่น booth, display, event production, fabrication, on-site installation, site supervision, material execution และ quality control',
    'Production Sourcing+':'ช่วยหาและประสานงานการผลิต เช่น product sourcing, supplier, factory follow-up, sample development, material sourcing, production control และ quality check',
    'Industrial Design+':'ออกแบบผลิตภัณฑ์และงานที่เชื่อมกับการผลิต เช่น product, CMF, form, user experience, prototype, product visualization, packaging structure และ manufacturing',
    'Corporate Design+':'ออกแบบภาพลักษณ์และเอกสารองค์กร เช่น corporate identity, brand system, company profile, presentation, stationery, office collateral และ business document',
    'Digital Design+':'ออกแบบประสบการณ์ดิจิทัล เช่น website, UX-UI, landing page, interface, digital branding, mobile experience, user journey และ conversion',
    'Fashion Design+':'ออกแบบแฟชั่น คอสตูม ยูนิฟอร์ม และ styling direction สำหรับแคมเปญ คาแรกเตอร์ โชว์พีซ หรือภาพลักษณ์ของแบรนด์',
    'Creative Consultation+':'ให้คำปรึกษาด้าน creative brief, concept direction, design direction, budget, scope, material, production, supplier, campaign, brand, space และ product direction'
  };

  /* ---------- get meta from node key (n1–n13) ---------- */
  function metaFromKey(key){
    if(!key||key==='dopious')return null;
    var n=parseInt(String(key).replace(/\D/g,''),10)-1;
    var _cats=typeof CATS!=='undefined'?CATS:(window.CATS||[]);
    var arr=(Array.isArray(_cats)?_cats:[]).filter(function(c){
      return c&&(c.svc||c.cat)&&Array.isArray(c.subs);
    });
    return(!isNaN(n)&&arr[n])?arr[n]:null;
  }

  /* ---------- render sub heads for a selected service ---------- */
  function selectedHTML(meta){
    var name=meta.svc||meta.cat||'';
    var desc=descs[name]||('Sub-services available in '+clean(name)+'.');
    var svcAttr=safe(clean(name)).replace(/'/g,'&#39;');
    return '<div class="how-selected-explain final-selected">'
      +'<div class="how-selected-copy">'
        +'<b>WHAT '+safe(clean(name).toUpperCase())+' INCLUDES</b>'
        +'<p>'+safe(desc)+'</p>'
      +'</div>'
      +'<div class="how-sub-list-title">Sub Head / Service Types <small style="color:rgba(255,255,255,.35);font-weight:400">— แตะ chip เพื่อดูผลงาน</small></div>'
      +'<div class="how-sub-group-chips">'+(meta.subs||[]).map(function(s){return chip(s,name);}).join('')+'</div>'
      +'<div style="margin-top:10px">'
        +'<button type="button" class="patch-view-work-btn" onclick="patchNavSub(\'\',\''+svcAttr+'\')">'
          +'View '+safe(clean(name))+' Work <span style="color:#ff2a14">→</span>'
        +'</button>'
      +'</div>'
    +'</div>';
  }

  /* ---------- MAIN OVERRIDE ---------- */
  window.showServiceSub=function(key){
    var panel=document.getElementById('serviceSubPanel');if(!panel)return;
    var meta=metaFromKey(key);
    var kicker=document.getElementById('subKicker');
    var title=document.getElementById('subTitle');
    var desc=document.getElementById('subDesc');
    var chips=document.getElementById('subChips');

    /* clear active state on all nodes */
    document.querySelectorAll('.mind-node').forEach(function(n){n.classList.remove('active');});
    var node=document.querySelector('.mind-node.'+key);if(node)node.classList.add('active');

    if(!meta){
      /* ── Default / reset state ── */
      if(kicker)kicker.textContent='DOPIOUS+ SERVICES';
      if(title)title.innerHTML='Select a Service<em>+</em>';
      if(desc)desc.textContent='Click any service around the circle to see what we offer in that category.';
      if(chips)chips.innerHTML='';
      return;
    }

    /* ── Service selected ── */
    var name=meta.svc||meta.cat||'';
    if(kicker)kicker.textContent='SERVICE HEAD';
    if(title)title.innerHTML=plus(name);
    if(desc)desc.textContent='Sub-services available in '+clean(name)+':';
    if(chips)chips.innerHTML=selectedHTML(meta);
    /* scroll panel into view on mobile */
    setTimeout(function(){
      var p=document.getElementById('serviceSubPanel');
      if(p)p.scrollIntoView({behavior:'smooth',block:'nearest'});
    },80);
  };

  /* ---------- reset panel to clean default whenever How panel opens ---------- */
  var _origOH=window.oH;
  window.oH=function(){
    if(typeof _origOH==='function')_origOH.apply(this,arguments);
    setTimeout(function(){try{window.showServiceSub('dopious');}catch(e){}},120);
  };

  /* ---------- boot: apply default state immediately ---------- */
  function boot(){try{window.showServiceSub('dopious');}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,400);});
  else setTimeout(boot,400);

})();
