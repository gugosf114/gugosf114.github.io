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
    const count = isMobile ? 20 : 40;

    const sparkles = [];
    for (let i = 0; i < count; i++) {
        sparkles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            twinkleSpeed: Math.random() * 0.05 + 0.015,
            twinklePhase: Math.random() * Math.PI * 2,
            driftX: (Math.random() - 0.5) * 0.08,
            driftY: (Math.random() - 0.5) * 0.06,
            gold: Math.random() > 0.3
        });
    }

    let time = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 1;

        sparkles.forEach(s => {
            s.x += s.driftX;
            s.y += s.driftY;

            if (s.x < -5) s.x = canvas.width + 5;
            if (s.x > canvas.width + 5) s.x = -5;
            if (s.y < -5) s.y = canvas.height + 5;
            if (s.y > canvas.height + 5) s.y = -5;

            // Sharp twinkle — mostly off, bright flashes
            const raw = Math.sin(time * s.twinkleSpeed + s.twinklePhase);
            const alpha = raw > 0.3 ? (raw - 0.3) * 1.2 : 0;

            if (alpha > 0.02) {
                const c = s.gold ? '255, 210, 80' : '255, 255, 255';

                // 4-point star
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(time * 0.008);

                ctx.beginPath();
                const r = s.size;
                ctx.moveTo(0, -r * 2.5);
                ctx.lineTo(r * 0.25, -r * 0.25);
                ctx.lineTo(r * 2.5, 0);
                ctx.lineTo(r * 0.25, r * 0.25);
                ctx.lineTo(0, r * 2.5);
                ctx.lineTo(-r * 0.25, r * 0.25);
                ctx.lineTo(-r * 2.5, 0);
                ctx.lineTo(-r * 0.25, -r * 0.25);
                ctx.closePath();
                ctx.fillStyle = 'rgba(' + c + ',' + alpha + ')';
                ctx.fill();

                // Center bright dot
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255,' + (alpha * 0.9) + ')';
                ctx.fill();

                ctx.restore();
            }
        });

        requestAnimationFrame(animate);
    }
    animate();
})();
