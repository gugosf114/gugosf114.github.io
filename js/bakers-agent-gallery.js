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
    var image = document.createElement('img');
    image.src = item.image_url;
    image.alt = item.alt_text || item.title || 'Bakery creation';
    image.loading = 'lazy';
    image.className = 'ba-card-img';
    var label = document.createElement('span');
    label.className = 'ba-card-label';
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
    css.textContent = [
      /* card - matches .service-card's material, at tile scale */
      '.bakers-agent-gallery-card{appearance:none;border:0;padding:0;min-width:0;cursor:zoom-in;',
      'text-align:left;background:var(--white,#FDFBF8);border-radius:18px;overflow:hidden;',
      'box-shadow:var(--shadow-card,0 2px 12px rgba(0,0,0,.1));',
      'transition:transform .3s ease,box-shadow .3s ease;font-family:inherit}',
      '.bakers-agent-gallery-card:hover{transform:translateY(-6px);',
      'box-shadow:var(--shadow-hover,0 8px 25px rgba(236,38,143,.2))}',
      '.bakers-agent-gallery-card:focus-visible{outline:3px solid var(--pink,#EC268F);outline-offset:3px}',
      '.ba-card-img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;background:#FFF8F0}',
      '.ba-card-label{display:block;padding:12px 14px;color:var(--dark-brown,#622D2B);',
      "font-family:'Nunito','Nunito Fallback',sans-serif;font-weight:700;font-size:.92rem;line-height:1.35}",
      /* desktop grid */
      '.ba-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:1.25rem}',
      /* mobile rail */
      '.ba-rail{overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none;',
      '-webkit-overflow-scrolling:touch;cursor:grab;',
      '-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);',
      'mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}',
      '.ba-rail::-webkit-scrollbar{display:none}',
      '.ba-rail.is-grabbing{cursor:grabbing}',
      '.ba-track{display:flex;gap:8px;width:max-content;padding:0 10px}',
      '.ba-rail .bakers-agent-gallery-card{width:' + TILE + 'px;flex:none;border-radius:14px}',
      '.ba-rail .bakers-agent-gallery-card:hover{transform:none}',
      '.ba-rail .bakers-agent-gallery-card.is-held{transform:scale(1.045);',
      'box-shadow:0 10px 26px rgba(236,38,143,.34);outline:2px solid var(--pink,#EC268F);outline-offset:-2px}',
      '.ba-rail .ba-card-label{font-size:.62rem;padding:6px 8px;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '@media (prefers-reduced-motion:reduce){.ba-rail{scroll-behavior:auto}}'
    ].join('');
    document.head.appendChild(css);
  }

  /* Horizontal auto-scrolling rail. Drag to move it, tap a card to stop on it. */
  function makeRail(wrapper) {
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

  /* One card per bake.
     Pass 1: photos of one bake share an upload id (<hash>, <hash>-2, ...).
     Pass 2: the same cake published twice under a reworded title
     ("Custom Pirate Ship Sculpted..." vs "Custom Sculpted Pirate Ship...")
     - compare the sorted set of words. */
  function titleKey(t) {
    return String(t || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ')
      .split(/\s+/).filter(Boolean).sort().join(' ');
  }
  function onePerBake(list) {
    var uploads = {}, titles = {};
    return list.filter(function (item) {
      var upload = String(item.id || '').replace(/-\d+$/, '');
      if (upload) {
        if (uploads[upload]) return false;
        uploads[upload] = true;
      }
      var tk = titleKey(item.title);
      if (tk) {
        if (titles[tk]) return false;
        titles[tk] = true;
      }
      return true;
    });
  }

  function createContainer() {
    injectStyles();

    /* Use the site's own section furniture so this block reads as part of
       the page, not bolted onto it: cream wrapper, Fredoka heading with a
       pink highlight word, same as "What We Create". */
    var section = document.createElement('section');
    section.className = 'page-content bakers-agent-latest';

    var wrapper = document.createElement('div');
    wrapper.className = 'section-wrapper section-beige';

    var header = document.createElement('div');
    header.className = 'section-header';
    var heading = document.createElement('h2');
    heading.appendChild(text('Latest '));
    var hl = document.createElement('span');
    hl.className = 'highlight';
    hl.appendChild(text('Creations'));
    heading.appendChild(hl);
    var sub = document.createElement('p');
    sub.appendChild(text('Fresh out of our kitchen'));
    header.appendChild(heading);
    header.appendChild(sub);
    wrapper.appendChild(header);

    section.appendChild(wrapper);
    var anchor = document.querySelector('.gallery-order-cta, .gallery-cta, footer');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(section, anchor);
    else document.body.appendChild(section);

    if (MOBILE.matches) {
      var rail = makeRail(wrapper);
      return { node: rail.track, done: rail.start, rail: true };
    }
    var grid = document.createElement('div');
    grid.className = 'ba-grid';
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

      matching = onePerBake(matching);

      /* Some pages have nothing tagged for them (wedding cakes, printed
         cookies, corporate printed cookies). Rather than draw nothing, fall
         back to the newest bakes from the whole feed. */
      if (!matching.length) matching = onePerBake(items).slice(0, 12);

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
