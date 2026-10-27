/* Keep category landing pages connected to live CMS work and shared project details. */
(function () {
  'use strict';
  const grid = document.getElementById('sG');
  const service = document.body.dataset.seoService;
  const category = document.body.dataset.seoCategory;
  let pending = new URLSearchParams(location.search).get('project');
  function findProject(id) {
    return typeof _P === 'undefined' ? -1 : _P.findIndex(p => (p._id || p.id) === id);
  }
  function refresh() {
    if (service) {
      grid.querySelectorAll('.cat-slide-card').forEach(card => {
        card.hidden = card.dataset.service !== service || Boolean(category && card.dataset.sub !== category);
      });
      grid.querySelectorAll('.svc-cat-divider').forEach(divider => { divider.hidden = true; });
      const count = typeof _P === 'undefined' ? 0 : _P.filter(p => (p.service || p.svc) === service && (!category || (p.subHead || p.sub) === category)).length;
      const counter = document.getElementById('sCt');
      if (counter) {
        counter.hidden = !count;
        counter.replaceChildren(...[['th', count + ' ผลงาน'], ['en', count + ' projects']].map(([language, text]) => {
          const span = document.createElement('span'); span.dataset.contentLanguage = language; span.textContent = text; return span;
        }));
      }
    }
    if (pending) {
      const index = findProject(pending);
      if (index >= 0) { pending = null; oPD(index); }
    }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-project-id]');
    if (!link) return;
    const index = findProject(link.dataset.projectId);
    if (index >= 0) { event.preventDefault(); oPD(index); }
  });
  new MutationObserver(refresh).observe(grid, {childList:true});
  refresh();
})();
