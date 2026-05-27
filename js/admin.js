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
    return'<div class="pr"><div class="pth"><img src="'+th+'" loading="lazy" onerror="this.style.opacity=0"></div><div class="pin"><b>'+esc(p.name||p.nm||'')+'</b><span>'+esc(p.service||p.svc||'')+' · '+(p.year||p.yr||'')+'</span></div><button class="apb" onclick="oPD('+i+');cAP()">View</button><button class="apb d" onclick="delP(\''+p._id+'\')">Del</button></div>';
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
if(typeof window._adminReady==='function')window._adminReady();
