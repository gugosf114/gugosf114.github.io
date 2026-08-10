// Hero lens: the text box behaves like a real magnifying glass held over the
// carousel — it shows the exact region of the strip beneath it, enlarged, and
// tracks the strip's motion frame-by-frame so front and back move in lockstep.
// Desktop only; mobile keeps its existing clear box.
(function () {
    var MAG = 1.16; // magnification factor
    if (window.matchMedia('(max-width: 768px)').matches) return;
    var box = document.querySelector('.hero-home .hero-text-box');
    var track = document.querySelector('.hero-home .carousel-track');
    if (!box || !track) return;

    // A full magnified copy of the strip lives inside the box.
    var viewport = document.createElement('div');
    viewport.className = 'lens-viewport';
    var strip = track.cloneNode(true);
    strip.className = 'lens-strip';
    strip.removeAttribute('style');
    viewport.appendChild(strip);
    var tint = document.createElement('div');
    tint.className = 'lens-tint';
    box.prepend(tint);
    box.prepend(viewport);

    function size() {
        strip.style.width = track.offsetWidth + 'px';
        strip.style.height = track.offsetHeight + 'px';
    }

    function frame() {
        var boxR = box.getBoundingClientRect();
        var trackR = track.getBoundingClientRect(); // includes live transform mid-transition
        // Point of the strip under the box's center, in strip coordinates:
        var uX = (boxR.left + boxR.width / 2) - trackR.left;
        var uY = (boxR.top + boxR.height / 2) - trackR.top;
        // Place the magnified strip so that point sits at the box's center:
        var tx = boxR.width / 2 - MAG * uX;
        var ty = boxR.height / 2 - MAG * uY;
        strip.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + MAG + ')';
        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', size);
    size();
    requestAnimationFrame(frame);
})();
