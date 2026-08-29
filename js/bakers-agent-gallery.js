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

  function card(item, inRail) {
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
    if (!inRail) button.addEventListener('click', function () { openPhoto(item); });
    return button;
  }

  var MOBILE = window.matchMedia('(max-width: 768px)');
  var TILE = 115;

  function injectStyles() {
    if (document.getElementById('ba-latest-css')) return;
    var css = document.createElement('style');
    css.id = 'ba-latest-css';
    css.textContent =
      '.ba-rail{overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none;' +
      '-webkit-overflow-scrolling:touch;cursor:grab;' +
      '-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);' +
      'mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}' +
      '.ba-rail::-webkit-scrollbar{display:none}' +
      '.ba-rail.is-grabbing{cursor:grabbing}' +
      '.ba-track{display:flex;gap:8px;width:max-content;padding:0 10px}' +
      '.ba-rail .bakers-agent-gallery-card{width:' + TILE + 'px;flex:none;' +
      'transition:transform .18s ease,box-shadow .18s ease}' +
      '.ba-rail .bakers-agent-gallery-card.is-held{transform:scale(1.045);' +
      'box-shadow:0 10px 26px rgba(236,38,143,.34);outline:2px solid #EC268F;outline-offset:-2px}' +
      '.ba-rail .bakers-agent-gallery-card span{font-size:9.5px;padding:5px 7px;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '@media (prefers-reduced-motion:reduce){.ba-rail{scroll-behavior:auto}}';
    document.head.appendChild(css);
  }

  /* Horizontal auto-scrolling rail. Drag to move it, tap a card to stop on it. */
  function makeRail(wrapper) {
    injectStyles();
    var rail = document.createElement('div');
    rail.className = 'ba-rail';
    var track = document.createElement('div');
    track.className = 'ba-track';
    rail.appendChild(track);
    wrapper.appendChild(rail);

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var held = false, picked = null, unit = 0, downX = 0, downLeft = 0, moved = false;

    function measure() { unit = track.scrollWidth / 3; }
    function wrapAround() {
      if (!unit) return;
      if (rail.scrollLeft < unit * 0.5) rail.scrollLeft += unit;
      else if (rail.scrollLeft > unit * 1.5) rail.scrollLeft -= unit;
    }
    function tick() {
      if (!held && !picked && !reduce) rail.scrollLeft += 0.45;
      wrapAround();
      requestAnimationFrame(tick);
    }

    rail.addEventListener('pointerdown', function (e) {
      held = true; moved = false; downX = e.clientX; downLeft = rail.scrollLeft;
      rail.classList.add('is-grabbing');
      if (rail.setPointerCapture) rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', function (e) {
      if (!held) return;
      var dx = e.clientX - downX;
      if (Math.abs(dx) > 6) moved = true;
      rail.scrollLeft = downLeft - dx;
      wrapAround();
    });
    rail.addEventListener('pointerup', function (e) {
      if (!held) return;
      held = false;
      rail.classList.remove('is-grabbing');
      if (moved) return;
      var t = e.target.closest ? e.target.closest('.bakers-agent-gallery-card') : null;
      if (!t) return;
      if (picked === t) { t.classList.remove('is-held'); picked = null; }
      else {
        if (picked) picked.classList.remove('is-held');
        picked = t; t.classList.add('is-held');
      }
    });
    rail.addEventListener('pointercancel', function () {
      held = false; rail.classList.remove('is-grabbing');
    });

    window.addEventListener('resize', measure);
    return {
      track: track,
      start: function () {
        requestAnimationFrame(function () { measure(); rail.scrollLeft = unit; requestAnimationFrame(tick); });
      }
    };
  }

  function createContainer() {
    var wrapper = document.createElement('section');
    wrapper.className = 'bakers-agent-latest';
    wrapper.style.cssText = 'max-width:1200px;margin:28px auto;padding:0 20px';
    var heading = document.createElement('h2');
    heading.appendChild(text('Latest creations'));
    heading.style.cssText = 'text-align:center;margin:0 0 18px;color:#4a2b20';
    wrapper.appendChild(heading);

    var anchor = document.querySelector('.gallery-order-cta, .gallery-cta, footer');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(wrapper, anchor);
    else document.body.appendChild(wrapper);

    if (MOBILE.matches) {
      var rail = makeRail(wrapper);
      return { node: rail.track, done: rail.start, rail: true };
    }
    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px';
    wrapper.appendChild(grid);
    return { node: grid, done: function () {}, rail: false };
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

      /* One card per cake, not per photo.
         Photos of the same bake share an upload id: <hash>, <hash>-2, <hash>-3.
         Keep the first of each group, which is the newest the feed lists. */
      var seen = {};
      matching = matching.filter(function (item) {
        var upload = String(item.id || '').replace(/-\d+$/, '');
        if (!upload) return true;
        if (seen[upload]) return false;
        seen[upload] = true;
        return true;
      });

      if (!matching.length) return;
      var container = createContainer();
      var passes = container.rail ? 3 : 1;
      for (var p = 0; p < passes; p++) {
        matching.forEach(function (item) { container.node.appendChild(card(item, container.rail)); });
      }
      container.done();
    })
    .catch(function (error) {
      console.warn('[Bakers Agent gallery]', error.message);
    });
})();
