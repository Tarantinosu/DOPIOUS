/* Render per-project CMS translations without changing project identity or grouping. */
(function () {
  'use strict';
  const originalOpen = window.oPD;
  window.oPD = function (index) {
    originalOpen(index);
    document.getElementById('pd').dataset.projectIndex = String(index);
  };
  function copy(project, language, field, index) {
    if (!project || !project.translations) return null;
    const own = project.translations[language] || {};
    const other = project.translations[language === 'th' ? 'en' : 'th'] || {};
    const value = object => index === undefined ? object[field] : (object[field] || [])[index];
    for (const candidate of [value(own), value(other)]) {
      if (typeof candidate === 'string' && candidate.trim()) return candidate;
    }
    return null;
  }
  function write(element, text) {
    if (!element) return;
    if (text === null) { element.removeAttribute('data-authored-copy'); return; }
    element.setAttribute('data-authored-copy', '');
    const links = Array.from(element.children).filter(child => child.matches('a'));
    const current = Array.from(element.childNodes).filter(n => !links.includes(n)).map(n => n.textContent).join('');
    if (current !== text) element.replaceChildren(document.createTextNode(text), ...links);
  }
  window.renderProjectLanguage = function (language) {
    if (typeof _P === 'undefined') return;
    document.querySelectorAll('.cat-slide-card[data-slides]').forEach(card => {
      let slides;
      try { slides = JSON.parse(card.dataset.slides); } catch (_) { return; }
      const active = typeof _ac !== 'undefined' ? _ac[card.id] || 0 : 0;
      const slide = slides[active];
      const project = slide && _P[slide.ai];
      write(card.querySelector('.cat-slide-name'), copy(project, language, 'name'));
      const description = copy(project, language, 'desc');
      write(card.querySelector('.svc-desc p'), description);
      if (description !== null && card.querySelector('.svc-desc')) card.querySelector('.svc-desc').style.display = '';
    });
    const detail = document.getElementById('pd');
    if (!detail.hasAttribute('data-project-index')) return;
    const project = _P[Number(detail.dataset.projectIndex)];
    write(detail.querySelector('.dn'), copy(project, language, 'name'));
    write(detail.querySelector('.ds'), copy(project, language, 'desc'));
    write(detail.querySelector('.dsc p'), copy(project, language, 'story'));
    detail.querySelectorAll('.detail-img-caption[data-caption-index]').forEach(caption => {
      write(caption, copy(project, language, 'galleryCaptions', Number(caption.dataset.captionIndex)));
    });
  };
})();
