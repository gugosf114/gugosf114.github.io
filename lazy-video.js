// Lazy-load Instagram feed videos: fetch + autoplay only when scrolled near.
// Markup contract: <video muted loop playsinline preload="none" data-lazy> with <source data-src="...">
(function () {
    var vids = document.querySelectorAll('video[data-lazy]');
    if (!vids.length) return;
    function activate(video) {
        var sources = video.querySelectorAll('source[data-src]');
        for (var i = 0; i < sources.length; i++) {
            sources[i].src = sources[i].getAttribute('data-src');
            sources[i].removeAttribute('data-src');
        }
        video.load();
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
    }
    if (!('IntersectionObserver' in window)) {
        for (var i = 0; i < vids.length; i++) activate(vids[i]);
        return;
    }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                io.unobserve(e.target);
                activate(e.target);
            }
        });
    }, { rootMargin: '600px 0px' });
    for (var j = 0; j < vids.length; j++) io.observe(vids[j]);
})();
