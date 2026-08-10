// Hero lens: the text box shows a sharp, enlarged crop of the slide directly
// behind it, synced to the carousel — a magnifying glass instead of frosted blur.
// Desktop only; mobile keeps its existing clear box.
(function () {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    var box = document.querySelector('.hero-home .hero-text-box');
    var track = document.querySelector('.hero-home .carousel-track');
    var slides = document.querySelectorAll('.hero-home .carousel-slide img');
    if (!box || !track || !slides.length) return;

    var layerA = document.createElement('div');
    var layerB = document.createElement('div');
    layerA.className = 'lens-layer';
    layerB.className = 'lens-layer';
    box.prepend(layerB);
    box.prepend(layerA);
    var showingA = false;

    function centerIndex() {
        var m = /translateX\(-?([\d.]+)%\)/.exec(track.style.transform || '');
        var left = m ? Math.round(parseFloat(m[1]) / 33.333) : 0;
        return Math.min(left + 1, slides.length - 1);
    }

    function update() {
        var img = slides[centerIndex()];
        if (!img) return;
        var url = img.currentSrc || img.src;
        if (!url) return;
        var incoming = showingA ? layerB : layerA;
        var outgoing = showingA ? layerA : layerB;
        incoming.style.backgroundImage = 'linear-gradient(180deg, rgba(0,0,0,0.52), rgba(0,0,0,0.44)), url("' + url + '")';
        requestAnimationFrame(function () {
            incoming.classList.add('visible');
            outgoing.classList.remove('visible');
            showingA = !showingA;
        });
    }

    new MutationObserver(update).observe(track, { attributes: true, attributeFilter: ['style'] });
    if (document.readyState === 'complete') update();
    else window.addEventListener('load', update);
})();
