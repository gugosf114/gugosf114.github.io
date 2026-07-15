(function () {
  'use strict';

  var pageKey = location.pathname.split('/').pop().replace(/\.html$/, '') || 'gallery';
  var pageMap = {
    gallery: 'all',
    'gallery-cakes': 'cakes',
    'gallery-cookies': 'cookies',
    'gallery-cakepops': 'cake-pops',
    'gallery-cupcakes': 'cupcakes',
    'gallery-corporate-cakes': 'corporate-cakes',
    'gallery-corporate-cookies': 'corporate-cookies',
    'gallery-corporate-cakepops': 'corporate-cake-pops',
    'gallery-corporate-cupcakes': 'corporate-cupcakes',
    'gallery-cakes-sculpted': 'cakes-sculpted',
    'gallery-cakes-realistic': 'cakes-realistic',
    'gallery-cakes-wedding': 'cakes-wedding',
    'gallery-cookies-hand-piped': 'cookies-hand-piped',
    'gallery-cookies-printed': 'cookies-printed',
    'gallery-corporate-cookies-printed': 'corporate-cookies-printed'
  };
  var target = pageMap[pageKey];
  if (!target) return;

  function text(value) {
    return document.createTextNode(String(value || ''));
  }

  function openPhoto(item) {
    var overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;padding:24px;cursor:zoom-out';
    var image = document.createElement('img');
    image.src = item.image_url;
    image.alt = item.alt_text || item.title || 'Bakery creation';
    image.style.cssText = 'max-width:min(1100px,95vw);max-height:90vh;object-fit:contain;border-radius:12px;box-shadow:0 20px 70px rgba(0,0,0,.5)';
    overlay.appendChild(image);
    overlay.addEventListener('click', function () { overlay.remove(); });
    document.body.appendChild(overlay);
  }

  function card(item) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'bakers-agent-gallery-card';
    button.style.cssText = 'appearance:none;border:0;background:#fff;padding:0;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(63,35,20,.12);cursor:zoom-in;text-align:left;min-width:0';
    var image = document.createElement('img');
    image.src = item.image_url;
    image.alt = item.alt_text || item.title || 'Bakery creation';
    image.loading = 'lazy';
    image.style.cssText = 'display:block;width:100%;aspect-ratio:1/1;object-fit:cover';
    var label = document.createElement('span');
    label.style.cssText = 'display:block;padding:10px 12px;color:#4a2b20;font:600 14px/1.35 Outfit,Arial,sans-serif';
    label.appendChild(text(item.title || 'Latest creation'));
    button.appendChild(image);
    button.appendChild(label);
    button.addEventListener('click', function () { openPhoto(item); });
    return button;
  }

  function createContainer() {
    var wrapper = document.createElement('section');
    wrapper.className = 'bakers-agent-latest';
    wrapper.style.cssText = 'max-width:1200px;margin:28px auto;padding:0 20px';
    var heading = document.createElement('h2');
    heading.appendChild(text('Latest creations'));
    heading.style.cssText = 'text-align:center;margin:0 0 18px;color:#4a2b20';
    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px';
    wrapper.appendChild(heading);
    wrapper.appendChild(grid);
    var anchor = document.querySelector('.gallery-order-cta, .gallery-cta, footer');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(wrapper, anchor);
    else document.body.appendChild(wrapper);
    return grid;
  }

  fetch('/data/bakers-agent-gallery.json', { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('gallery manifest unavailable');
      return response.json();
    })
    .then(function (items) {
      if (!Array.isArray(items)) return;
      var matching = items.filter(function (item) {
        return Array.isArray(item.gallery_targets) && item.gallery_targets.indexOf(target) !== -1;
      });
      if (!matching.length) return;
      var container = createContainer();
      matching.forEach(function (item) { container.appendChild(card(item)); });
    })
    .catch(function (error) {
      console.warn('[Bakers Agent gallery]', error.message);
    });
})();
