/* Keep category landing pages connected to live CMS work and shared project details. */
(function () {
  'use strict';
  const grid = document.getElementById('sG');
  const category = document.body.dataset.seoCategory;
  let pending = new URLSearchParams(location.search).get('project');
  function findProject(id) {
    return typeof _P === 'undefined' ? -1 : _P.findIndex(p => (p._id || p.id) === id);
  }
  function refresh() {
    if (category) {
      grid.querySelectorAll('.cat-slide-card').forEach(card => {
        card.hidden = card.dataset.service !== 'Space Design+' || card.dataset.sub !== category;
      });
      grid.querySelectorAll('.svc-cat-divider').forEach(divider => { divider.hidden = true; });
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
