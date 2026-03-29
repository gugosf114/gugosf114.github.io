(function() {
    const canvas = document.getElementById('nav-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const header = canvas.parentElement;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = header.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const isMobile = window.innerWidth <= 768;

    const ripples = [];
    const maxRipples = isMobile ? 4 : 7;

    const brandColors = [
        [236, 38, 143],   // pink
        [255, 197, 50],   // yellow
        [195, 98, 57],    // brown
        [200, 200, 210]   // light gray
    ];

    // Spawn a new ripple
    function spawn() {
        if (ripples.length >= maxRipples * 3) return;
        const color = brandColors[Math.floor(Math.random() * brandColors.length)];
        ripples.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 0,
            maxRadius: 30 + Math.random() * 40,
            speed: 0.3 + Math.random() * 0.3,
            opacity: 0.25 + Math.random() * 0.15,
            color: color,
            lineWidth: Math.random() * 1 + 0.5
        });
    }

    // Seed initial ripples at various stages
    for (let i = 0; i < maxRipples; i++) {
        spawn();
        ripples[i].radius = Math.random() * ripples[i].maxRadius;
    }

    let time = 0;
    let nextSpawn = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 1;

        // Spawn new ripples periodically
        if (time >= nextSpawn) {
            spawn();
            nextSpawn = time + 60 + Math.random() * 80;
        }

        // Draw and update ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            r.radius += r.speed;

            const progress = r.radius / r.maxRadius;
            const alpha = r.opacity * (1 - progress);

            if (alpha <= 0.01 || r.radius >= r.maxRadius) {
                ripples.splice(i, 1);
                continue;
            }

            const c = r.color;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha + ')';
            ctx.lineWidth = r.lineWidth;
            ctx.stroke();
        }

        requestAnimationFrame(animate);
    }
    animate();
})();
