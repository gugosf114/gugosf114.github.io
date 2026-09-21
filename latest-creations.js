(function () {
  'use strict';

  // Each page explicitly chooses the placement and image category.
  var slot = document.querySelector('[data-latest-creations]');
  if (!slot) return;
  var target = slot.getAttribute('data-latest-creations') || 'all';

  function text(value) {
    return document.createTextNode(String(value || ''));
  }

  function openPhoto(item) {
    if (!item) return;
    var opener = document.activeElement;
    var dialog = document.createElement('dialog'); dialog.className = 'ba-photo-viewer';
    dialog.setAttribute('aria-label', item.title || 'Bakery creation');
    var close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', 'Close photo');
    var image = document.createElement('img'); image.src = item.image_url; image.alt = item.alt_text || item.title || 'Bakery creation';
    var caption = document.createElement('p'); caption.textContent = item.title || 'Latest creation';
    dialog.append(close, image, caption); document.body.appendChild(dialog);
    close.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () { dialog.remove(); if (opener && opener.isConnected) opener.focus({preventScroll:true}); });
    dialog.showModal();
  }

  function card(item, inRail, copy) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'bakers-agent-gallery-card';
    button.creationItem = item; button.title = item.title || 'Latest creation';
    if (copy) { button.tabIndex = -1; button.setAttribute('aria-hidden', 'true'); }
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
    button.addEventListener('click', function (event) { if (!inRail || event.detail === 0) openPhoto(item); });
    return button;
  }

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
    rail.setAttribute('aria-label', 'Latest creations. Drag to explore or select a photo.');
    var track = document.createElement('div');
    track.className = 'ba-track';
    rail.appendChild(track);
    var controls = document.createElement('div');
    controls.className = 'ba-run-controls';
    var paused = false; // Autoplay is the selected default; Pause remains available.
    var hovered = false, held = false, moved = false, picked = null, visible = true;
    var unit = 0, position = 0, downX = 0, downLeft = 0, previousTime = 0, frame = 0;
    var resumeAt = 0, resumeTimer;
    function control(label, contents, fn) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', label);
      b.textContent = contents; b.addEventListener('click', fn); controls.appendChild(b); return b;
    }
    function normalize() {
      if (!unit) return;
      position = unit + ((position - unit) % unit + unit) % unit;
      rail.scrollLeft = position;
    }
    function nudge(direction) {
      position = rail.scrollLeft + direction * (track.children[1].offsetLeft - track.children[0].offsetLeft);
      normalize(); delayResume();
    }
    control('Previous creations', '‹', function () { nudge(-1); });
    var pause = control('Pause moving creations', 'Pause', function () { paused = !paused; updatePause(); start(); });
    control('Next creations', '›', function () { nudge(1); });
    function updatePause() { pause.textContent = paused ? 'Play' : 'Pause'; pause.setAttribute('aria-label', paused ? 'Play moving creations' : 'Pause moving creations'); pause.setAttribute('aria-pressed', String(paused)); }
    updatePause();
    wrapper.querySelector('.section-header').appendChild(controls);
    wrapper.appendChild(rail);
    function measure() {
      var count = track.children.length / 3;
      if (!count) return;
      var fraction = unit ? (position - unit) / unit : 0;
      unit = track.children[count].offsetLeft - track.children[0].offsetLeft;
      position = unit * (1 + fraction); normalize();
    }
    function canMove() { return visible && !document.hidden && !paused && !held && !hovered && Date.now() >= resumeAt && !rail.contains(document.activeElement); }
    function tick(time) {
      frame = 0;
      if (!canMove() || !unit) { previousTime = 0; return; }
      if (previousTime) { position += Math.min(time - previousTime, 60) * 28 / 1000; normalize(); }
      previousTime = time; frame = requestAnimationFrame(tick);
    }
    function start() { if (!frame && canMove() && unit) frame = requestAnimationFrame(tick); }
    function delayResume() { resumeAt = Date.now() + 2500; clearTimeout(resumeTimer); resumeTimer = setTimeout(start, 2550); }
    rail.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovered = true; });
    rail.addEventListener('pointerleave', function () { hovered = false; start(); });
    rail.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      held = true; moved = false; downX = e.clientX; downLeft = rail.scrollLeft;
      picked = e.target.closest('.bakers-agent-gallery-card'); rail.classList.add('is-grabbing');
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', function (e) {
      if (!held) return;
      var dx = e.clientX - downX;
      if (Math.abs(dx) > 6) moved = true;
      if (moved) { rail.scrollLeft = downLeft - dx; position = rail.scrollLeft; }
    });
    function release(e) {
      if (!held) return;
      held = false; rail.classList.remove('is-grabbing');
      if (e.type === 'pointerup' && !moved && picked) openPhoto(picked.creationItem);
      position = rail.scrollLeft; normalize(); picked = null; delayResume();
    }
    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', release);
    rail.addEventListener('wheel', function () { position = rail.scrollLeft; delayResume(); }, { passive: true });
    rail.addEventListener('scroll', function () { if (!frame) position = rail.scrollLeft; }, { passive: true });
    rail.addEventListener('focusout', function () { setTimeout(start, 0); });
    document.addEventListener('visibilitychange', start);
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; start(); }).observe(rail);
    return {track: track, start: function () {
      measure(); new ResizeObserver(function () { measure(); start(); }).observe(rail); start();
      document.fonts.ready.then(function () { if (location.hash === '#latest-creations') rail.closest('section').scrollIntoView({block:'start'}); });
    }};
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
    if (slot.closest('.section-wrapper')) section.classList.add('ba-latest-inset');
    else if (slot.closest('.page-content')) section.classList.add('ba-latest-contained');
    section.id = 'latest-creations';

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
    header.appendChild(heading);
    wrapper.appendChild(header);

    section.appendChild(wrapper);
    var anchor = slot;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(section, anchor);
    else document.body.appendChild(section);

    var rail = makeRail(wrapper);
    return { node: rail.track, done: rail.start, rail: true };
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

      /* Thin pages read as broken rather than curated: a strip of one card
         is not a strip. Top up with the newest other bakes, so every page
         gets a real row. Covers the three pages with nothing tagged at all
         (wedding cakes, printed cookies, corporate printed cookies) and the
         thin ones (cupcakes had 1, cake pops 2). */
      var MIN = 6, MAX = 12;
      if (matching.length < MIN) {
        var have = {};
        matching.forEach(function (m) { have[m.id] = true; });
        onePerBake(items).forEach(function (extra) {
          if (matching.length >= MIN || have[extra.id]) return;
          matching.push(extra);
          have[extra.id] = true;
        });
      }
      matching = matching.slice(0, MAX);

      if (!matching.length) return;
      var container = createContainer();
      var passes = container.rail ? 3 : 1;
      for (var p = 0; p < passes; p++) {
        matching.forEach(function (item) { container.node.appendChild(card(item, container.rail, p > 0)); });
      }
      container.done();
    })
    .catch(function (error) {
      console.warn('[Bakers Agent gallery]', error.message);
    });
})();
