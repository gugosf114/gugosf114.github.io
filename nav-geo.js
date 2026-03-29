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
    const count = isMobile ? 15 : 30;

    const brandColors = [
        [236, 38, 143],   // pink
        [255, 197, 50],   // yellow
        [195, 98, 57],    // brown
        [98, 45, 43],     // dark brown
        [61, 26, 62]      // purple
    ];

    const shapes = [];
    for (let i = 0; i < count; i++) {
        const colorIdx = Math.random() < 0.8
            ? Math.floor(Math.random() * 4)
            : 4;
        shapes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 8 + 4,
            type: ['circle', 'triangle', 'hexagon', 'diamond'][Math.floor(Math.random() * 4)],
            color: brandColors[colorIdx],
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.015,
            speedX: (Math.random() - 0.5) * 0.25,
            speedY: (Math.random() - 0.5) * 0.15,
            opacity: Math.random() * 0.3 + 0.15,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.008
        });
    }

    let time = 0;

    function drawShape(s) {
        const c = s.color;
        const alpha = Math.sin(time * s.pulseSpeed + s.pulse) * 0.1 + s.opacity;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.globalAlpha = Math.max(0.05, alpha);

        ctx.strokeStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
        ctx.lineWidth = 1;

        if (s.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, s.size, 0, Math.PI * 2);
            ctx.stroke();
        } else if (s.type === 'triangle') {
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
                i === 0 ? ctx.moveTo(Math.cos(a) * s.size, Math.sin(a) * s.size)
                        : ctx.lineTo(Math.cos(a) * s.size, Math.sin(a) * s.size);
            }
            ctx.closePath();
            ctx.stroke();
        } else if (s.type === 'hexagon') {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                i === 0 ? ctx.moveTo(Math.cos(a) * s.size, Math.sin(a) * s.size)
                        : ctx.lineTo(Math.cos(a) * s.size, Math.sin(a) * s.size);
            }
            ctx.closePath();
            ctx.stroke();
        } else if (s.type === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(0, -s.size);
            ctx.lineTo(s.size * 0.6, 0);
            ctx.lineTo(0, s.size);
            ctx.lineTo(-s.size * 0.6, 0);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 1;

        shapes.forEach(s => {
            s.x += s.speedX;
            s.y += s.speedY;
            s.rotation += s.rotSpeed;

            if (s.x < -20) s.x = canvas.width + 20;
            if (s.x > canvas.width + 20) s.x = -20;
            if (s.y < -20) s.y = canvas.height + 20;
            if (s.y > canvas.height + 20) s.y = -20;

            drawShape(s);
        });

        requestAnimationFrame(animate);
    }
    animate();
})();
