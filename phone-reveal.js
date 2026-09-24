/* phone-reveal.js — Stratos-style scroll reveal for phones.
 * Stratos reveals each piece on its own (section title, then the line under it,
 * then every card), each rising 40px and fading over 0.9s. Bakery pages mark
 * whole sections with .reveal, so a section used to arrive as one block.
 * On phones this splits every top-level .reveal section into its pieces and
 * reveals each piece when it reaches the screen; pieces that arrive together
 * go 0.1s apart. Desktop and reduced-motion users are untouched.
 * Loaded on every page by ga-events.js. */
(function () {
  if (!window.matchMedia('(max-width: 768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  // Containers that move on their own (sliders, feeds) stay one piece.
  var NO_SPLIT = /carousel|slider|feed|rail|marquee|swiper|scroller|ticker/i;
  // Blocks with their own entrance animation are left completely alone.
  var SKIP = '.why-mbc, script, style, canvas, noscript, template, link, meta';

  function usable(el) {
    if (el.matches(SKIP)) return false;
    if (el.classList.contains('reveal') || el.querySelector('.reveal')) return false;
    var r = el.getBoundingClientRect();
    if (r.height < 2 || r.width < 2) return false;
    var cs = getComputedStyle(el);
    if (cs.position === 'absolute' || cs.position === 'fixed') return false;
    if (cs.transform !== 'none' || cs.display === 'contents') return false;
    return true;
  }

  function isList(el) {
    var cls = typeof el.className === 'string' ? el.className : '';
    if (NO_SPLIT.test(cls)) return false;
    var kids = Array.prototype.filter.call(el.children, usable);
    if (kids.length < 2) return false;
    var cs = getComputedStyle(el);
    // A painted box (white panel etc.) rises as one, so its items never poke out of it mid-glide.
    if (cs.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)) return false;
    var d = cs.display;
    return d === 'grid' || d === 'flex' || /grid|list|faq|prose|seo-content|steps|testimonials|linktiles|facts/i.test(cls) || el.tagName === 'UL' || el.tagName === 'OL';
  }

  function piecesOf(section) {
    var out = [];
    Array.prototype.forEach.call(section.children, function (child) {
      if (child.classList.contains('section-header')) {
        Array.prototype.forEach.call(child.children, function (h) { if (usable(h)) out.push(h); });
      } else if (isList(child)) {
        Array.prototype.forEach.call(child.children, function (k) { if (usable(k)) out.push(k); });
      } else if (usable(child)) {
        out.push(child);
      }
    });
    return out;
  }

  function init() {
    var sections = Array.prototype.filter.call(document.querySelectorAll('.reveal'), function (s) {
      if (s.parentElement && s.parentElement.closest('.reveal')) return false;   // top-level only
      if (s.matches('body.mbc-home #services > .section-wrapper')) return false; // first screen stays put
      return true;
    });
    var io = new IntersectionObserver(function (entries) {
      var arriving = entries.filter(function (e) { return e.isIntersecting; })
        .map(function (e) { return e.target; })
        .sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
      arriving.forEach(function (el, i) {
        io.unobserve(el);
        el.style.transitionDelay = Math.min(i * 0.1, 0.4) + 's';
        el.classList.add('m-in');
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0 });

    sections.forEach(function (s) {
      var pieces = piecesOf(s);
      if (pieces.length < 2) return;           // nothing to split: keep the section glide
      s.classList.add('m-split');
      pieces.forEach(function (p) { p.classList.add('m-rise'); io.observe(p); });
    });

    // When a piece finishes, give it back its own styles (hover, transitions).
    document.addEventListener('transitionend', function (e) {
      var el = e.target;
      if (e.propertyName !== 'opacity' || !el.classList || !el.classList.contains('m-in')) return;
      el.classList.remove('m-rise', 'm-in');
      el.style.transitionDelay = '';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
