/* Cloudinary uploads only populate the form; Save remains an explicit action. */
(function(){
  'use strict';
  const cloud='dogllrvmb';
  const panel=document.createElement('section');
  panel.className='panel';
  panel.innerHTML='<h2>Cloudinary Images</h2><p class="hint">Cloud: dogllrvmb — เลือกรูปเพื่ออัปโหลด แล้วตรวจรูปก่อนกด Save ตามปกติ รูปเดิมใน Drive จะยังอยู่</p><label>Unsigned upload preset<input id="cloudPreset" value="o2hpg8xt" autocomplete="off" placeholder="ชื่อ upload preset"></label><p class="hint">ตั้งค่า preset ให้รับเฉพาะ JPG / PNG / WebP / AVIF ไม่เกิน 10 MB</p><div id="cloudUploadStatus" class="status" role="status" aria-live="polite"></div>';
  const page=document.querySelector('#admin .page');
  if(!page)return;
  page.insertBefore(panel,page.firstChild);
  const status=panel.querySelector('#cloudUploadStatus');
  let busy=false;
  const controls=[];
  function validResult(data){
    const url=new URL(data.secure_url);
    if(url.protocol!=='https:'||url.hostname!=='res.cloudinary.com'||
       !url.pathname.startsWith('/'+cloud+'/image/upload/'))
      throw new Error('Cloudinary ส่ง URL รูปที่ไม่ตรงกับบัญชี');
    return url.href;
  }
  async function upload(file,preset){
    if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type))
      throw new Error('รองรับเฉพาะ JPG, PNG, WebP และ AVIF');
    if(!file.size||file.size>10*1024*1024)throw new Error('รูปต้องมีขนาดไม่เกิน 10 MB');
    const body=new FormData();
    body.append('file',file);
    body.append('upload_preset',preset);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),60000);
    try{
      const response=await fetch('https://api.cloudinary.com/v1_1/'+cloud+'/image/upload',{
        method:'POST',body,signal:controller.signal
      });
      const data=await response.json();
      if(!response.ok)throw new Error('อัปโหลดไม่สำเร็จ กรุณาตรวจ preset และโควตา Cloudinary');
      return validResult(data);
    }finally{clearTimeout(timeout);}
  }
  function attach(id,label,multiple,preview){
    const target=document.getElementById(id);
    if(!target)return;
    const control=document.createElement('input');
    control.type='file';
    control.accept='image/jpeg,image/png,image/webp,image/avif';
    control.multiple=multiple;
    control.setAttribute('aria-label',label);
    target.parentElement.appendChild(control);
    controls.push(control);
    control.addEventListener('change',async()=>{
      const files=Array.from(control.files||[]);
      if(!files.length||busy)return;
      const preset=document.getElementById('cloudPreset').value.trim();
      if(!preset){status.textContent='ใส่ชื่อ Unsigned upload preset ก่อน';control.value='';return;}
      // Legacy Save currently deletes its source. Keep uploads out of that path.
      if((id==='tPhoto'&&editingTeamSource==='old')||(id!=='tPhoto'&&editingSource==='old')){
        status.textContent='รายการข้อมูลเก่ายังไม่ย้ายอัตโนมัติ เพื่อเก็บต้นฉบับไว้ครบ';
        control.value='';return;
      }
      if(files.length>30){status.textContent='เลือกได้ไม่เกิน 30 รูปต่อครั้ง';control.value='';return;}
      const before=target.value;
      const record=id==='tPhoto'?editingTeamId:editingId;
      busy=true;controls.forEach(c=>c.disabled=true);
      try{
        // Stage results before changing any field. A failed batch leaves the form intact.
        const urls=[];
        for(const file of files){
          status.textContent='กำลังอัปโหลด '+(urls.length+1)+' / '+files.length;
          urls.push(await upload(file,preset));
        }
        const current=id==='tPhoto'?editingTeamId:editingId;
        if(current!==record||target.value!==before){
          status.textContent='แบบฟอร์มเปลี่ยนระหว่างอัปโหลด จึงยังไม่แทนรูป กรุณาเลือกใหม่';
          return;
        }
        target.value=multiple?[before,...urls].filter(Boolean).join('\n'):urls[0];
        preview(target.value);
        status.textContent='อัปโหลดแล้ว ตรวจรูปและกด Save เพื่อบันทึก ข้อมูลเดิมยังไม่ถูกเปลี่ยน';
      }catch(e){
        status.textContent=e.name==='AbortError'?'อัปโหลดใช้เวลานานเกินไป กรุณาลองใหม่':e.message;
      }finally{busy=false;controls.forEach(c=>c.disabled=false);control.value='';}
    });
  }
  attach('cover','Upload cover image',false,tinyPreview);
  attach('gallery','Upload gallery images',true,renderGalleryPreview);
  attach('tPhoto','Upload team photo',false,teamPreview);
})();
