/* Translate shared navigation and dynamically rendered service labels.
Project titles, client names and CMS descriptions retain their original language. */
(function () {
  'use strict';
  if (document.documentElement.lang !== 'th') return;
  const words = new Map([["Works","ผลงาน"],["Services","บริการ"],["Who We Are","เกี่ยวกับเรา"],["Contact","ติดต่อเรา"],["Start a Project","ปรึกษางานออกแบบ"],["View Work","ดูผลงาน"],["What We Do","สิ่งที่เราทำ"],["SERVICES","บริการของเรา"],["Loading...","กำลังโหลด…"],["← Back","← กลับ"],["One-stop Service","ออกแบบ ผลิต และติดตั้ง"],["Strategy","กลยุทธ์"],["Design","ออกแบบ"],["Visual","ภาพนำเสนอ"],["Production","ผลิต"],["Install","ติดตั้ง"],["Phone","โทรศัพท์"],["Email","อีเมล"],["Office","สำนักงาน"],["Choose how to reach us","เลือกช่องทางติดต่อ"],["YOUR EMAIL ADDRESS","อีเมลของคุณ"],["SPACE DESIGN+","ออกแบบพื้นที่+"],["SCULPTURE DESIGN+","ออกแบบประติมากรรม+"],["VISUAL PRODUCTION+","ผลิตสื่อภาพและวิดีโอ+"],["GRAPHIC DESIGN+","ออกแบบกราฟิก+"],["BRANDING DESIGN+","ออกแบบแบรนด์+"],["BUILD & INSTALL+","ผลิตและติดตั้ง+"],["Retail","ร้านค้า"],["Exhibition","นิทรรศการ"],["Kiosk","คีออส"],["Event","อีเวนต์"],["Pop-up Store","ร้านป๊อปอัป"],["All","ทั้งหมด"],["View Project","ดูโครงการ"],["Project","โครงการ"],["Client","ลูกค้า"],["Location","สถานที่"],["Year","ปี"],["Scope","ขอบเขตงาน"]]);
  function translate(root) {
    if (root.nodeType === 3) {
      const key = root.nodeValue.trim();
      if (words.has(key)) root.nodeValue = root.nodeValue.replace(key, words.get(key));
      return;
    }
    if (root.nodeType !== 1 || root.closest('script,style,textarea,[contenteditable],.language-switch')) return;
    Array.from(root.childNodes).forEach(translate);
  }
  translate(document.body);
  const observer = new MutationObserver(function (records) {
    observer.disconnect();
    records.forEach(function (record) {
      if (record.type === 'characterData') translate(record.target);
      else record.addedNodes.forEach(translate);
    });
    observe();
  });
  function observe() { observer.observe(document.body, {childList:true, subtree:true, characterData:true}); }
  observe();
})();