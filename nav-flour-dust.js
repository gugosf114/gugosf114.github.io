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

    // Swirl paths — invisible curves that sparkles follow
    const swirls = [];
    const swirlCount = isMobile ? 2 : 4;
    for (let i = 0; i < swirlCount; i++) {
        swirls.push({
            centerX: (canvas.width / (swirlCount + 1)) * (i + 1),
            centerY: canvas.height * 0.5,
            radiusX: 60 + Math.random() * 80,
            radiusY: 15 + Math.random() * 20,
            speed: (0.003 + Math.random() * 0.004) * (Math.random() > 0.5 ? 1 : -1),
            phase: Math.random() * Math.PI * 2,
            driftX: (Math.random() - 0.5) * 0.3
        });
    }

    // Sparkles — tiny stars that follow swirl paths and twinkle
    const sparkles = [];
    const sparkleCount = isMobile ? 31 : 63;
    for (let i = 0; i < sparkleCount; i++) {
        const swirl = swirls[Math.floor(Math.random() * swirls.length)];
        sparkles.push({
            swirl: swirl,
            angle: Math.random() * Math.PI * 2,
            offset: (Math.random() - 0.5) * 30,
            offsetY: (Math.random() - 0.5) * 15,
            size: Math.random() * 2.5 + 0.8,
            twinkleSpeed: 0.02 + Math.random() * 0.06,
            twinklePhase: Math.random() * Math.PI * 2,
            trail: [],
            trailMax: Math.floor(Math.random() * 5) + 3,
            hue: (function(){ const r = Math.random(); return r < 0.25 ? 'gold' : r < 0.5 ? 'pink' : r < 0.75 ? 'darkbrown' : r < 0.875 ? 'yellow' : 'purple'; })()
        });
    }

    let time = 0;

    function drawStar(x, y, r, alpha, hue) {
        // 4-point star shape
        const colors = {
            gold: [255, 197, 50],
            pink: [236, 38, 143],
            darkbrown: [98, 45, 43],
            yellow: [255, 197, 50],
            purple: [61, 26, 62]
        };
        const c = colors[hue] || colors.gold;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 0.02);

        // Cross sparkle
        ctx.beginPath();
        ctx.moveTo(0, -r * 2);
        ctx.lineTo(r * 0.3, -r * 0.3);
        ctx.lineTo(r * 2, 0);
        ctx.lineTo(r * 0.3, r * 0.3);
        ctx.lineTo(0, r * 2);
        ctx.lineTo(-r * 0.3, r * 0.3);
        ctx.lineTo(-r * 2, 0);
        ctx.lineTo(-r * 0.3, -r * 0.3);
        ctx.closePath();
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha + ')';
        ctx.fill();

        // Center glow
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255,' + (alpha * 0.8) + ')';
        ctx.fill();

        // Outer glow
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 4);
        grad.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (alpha * 0.4) + ')');
        grad.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
        ctx.beginPath();
        ctx.arc(0, 0, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 1;

        // Drift swirl centers slowly
        swirls.forEach(s => {
            s.centerX += s.driftX;
            if (s.centerX < -100) s.centerX = canvas.width + 100;
            if (s.centerX > canvas.width + 100) s.centerX = -100;
        });

        sparkles.forEach(sp => {
            const s = sp.swirl;

            // Move along the swirl path
            sp.angle += s.speed;
            const x = s.centerX + Math.cos(sp.angle + s.phase) * (s.radiusX + sp.offset);
            const y = s.centerY + Math.sin(sp.angle * 2 + s.phase) * (s.radiusY + sp.offsetY);

            // Twinkle — sharp on/off sparkle, not smooth fade
            const twinkle = Math.sin(time * sp.twinkleSpeed + sp.twinklePhase);
            const alpha = twinkle > 0.1 ? (twinkle * 0.7 + 0.1) : 0.03;

            // Store trail positions
            sp.trail.push({ x, y, alpha: alpha * 0.4 });
            if (sp.trail.length > sp.trailMax) sp.trail.shift();

            // Draw trail — fading dots behind the sparkle
            sp.trail.forEach((t, i) => {
                const trailAlpha = t.alpha * (i / sp.trail.length) * 0.5;
                if (trailAlpha > 0.01) {
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, sp.size * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 200, 100,' + trailAlpha + ')';
                    ctx.fill();
                }
            });

            // Draw the sparkle star
            if (alpha > 0.05) {
                drawStar(x, y, sp.size, alpha, sp.hue);
            }
        });

        requestAnimationFrame(animate);
    }
    animate();
})();
