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
    const brandColors = [
        [236, 38, 143],   // pink
        [255, 197, 50],   // yellow
        [195, 98, 57],    // brown
        [98, 45, 43],     // dark brown
        [61, 26, 62]      // purple — fewer
    ];

    const gravity = 0.012;
    const pieces = [];

    // Popper positions — bottom corners, angled 45° inward
    const popperSize = 18;
    const popperAngle = Math.PI / 4; // 45 degrees

    function spawnBurst(fromLeft) {
        const burstCount = isMobile ? 12 : 20;
        for (let i = 0; i < burstCount; i++) {
            const colorIdx = Math.random() < 0.8
                ? Math.floor(Math.random() * 4)
                : 4;
            const shape = Math.random() > 0.5 ? 'rect' : 'circle';
            // Tight cone — 45° up-inward with small spread
            const baseAngle = fromLeft ? -popperAngle : (Math.PI + popperAngle);
            const spreadAngle = baseAngle + (Math.random() - 0.5) * 0.35;
            const speed = 2.5 + Math.random() * 2.0;

            pieces.push({
                x: fromLeft ? 12 : canvas.width - 12,
                y: canvas.height - 8 + (Math.random() - 0.5) * 6,
                w: shape === 'rect' ? (Math.random() > 0.4 ? Math.random() * 14 + 6 : Math.random() * 6 + 2) : 0,
                h: shape === 'rect' ? (Math.random() * 3 + 1.5) : 0,
                r: shape === 'circle' ? (Math.random() * 3 + 1) : 0,
                shape: shape,
                color: brandColors[colorIdx],
                vx: Math.cos(spreadAngle) * speed,
                vy: Math.sin(spreadAngle) * speed,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.08,
                opacity: Math.random() * 0.45 + 0.35,
                life: 0,
                maxLife: 300 + Math.random() * 450,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.03 + 0.01
            });
        }
    }

    // Draw a party popper tube — angled 45° from bottom corner
    function drawPopper(isLeft) {
        const x = isLeft ? 0 : canvas.width;
        const y = canvas.height;

        ctx.save();
        ctx.translate(x, y);
        // Rotate 45° — left points up-right, right points up-left
        ctx.rotate(isLeft ? -popperAngle : (Math.PI + popperAngle));

        // Tube body
        ctx.beginPath();
        ctx.moveTo(-2, -7);
        ctx.lineTo(popperSize + 4, -4);
        ctx.lineTo(popperSize + 4, 4);
        ctx.lineTo(-2, 7);
        ctx.closePath();
        const tubeGrad = ctx.createLinearGradient(0, -7, 0, 7);
        tubeGrad.addColorStop(0, '#C36239');
        tubeGrad.addColorStop(0.5, '#E8975A');
        tubeGrad.addColorStop(1, '#8B3A1F');
        ctx.fillStyle = tubeGrad;
        ctx.fill();

        // Gold ring at opening
        ctx.beginPath();
        ctx.ellipse(popperSize + 4, 0, 2.5, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFC532';
        ctx.fill();
        ctx.strokeStyle = '#D4A020';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Handle/grip
        ctx.beginPath();
        ctx.moveTo(-2, -5);
        ctx.lineTo(-9, -3);
        ctx.lineTo(-9, 3);
        ctx.lineTo(-2, 5);
        ctx.closePath();
        ctx.fillStyle = '#622D2B';
        ctx.fill();

        ctx.restore();
    }

    // Seed some initial pieces mid-flight
    for (let i = 0; i < (isMobile ? 15 : 30); i++) {
        const fromLeft = Math.random() > 0.5;
        const colorIdx = Math.random() < 0.8 ? Math.floor(Math.random() * 4) : 4;
        const shape = Math.random() > 0.5 ? 'rect' : 'circle';
        pieces.push({
            x: canvas.width * (0.1 + Math.random() * 0.8),
            y: canvas.height * Math.random(),
            w: shape === 'rect' ? (Math.random() > 0.4 ? Math.random() * 14 + 6 : Math.random() * 6 + 2) : 0,
            h: shape === 'rect' ? (Math.random() * 3 + 1.5) : 0,
            r: shape === 'circle' ? (Math.random() * 3 + 1) : 0,
            shape: shape,
            color: brandColors[colorIdx],
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 0.3,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.06,
            opacity: Math.random() * 0.3 + 0.15,
            life: 150 + Math.random() * 200,
            maxLife: 300 + Math.random() * 450,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.03 + 0.01
        });
    }

    let time = 0;
    let nextBurst = 60; // first burst after 1 second
    let burstSide = true; // alternate sides

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 1;

        // Burst every ~3 seconds (180 frames), alternating sides
        if (time >= nextBurst) {
            spawnBurst(burstSide);
            spawnBurst(!burstSide); // both sides at once
            burstSide = !burstSide;
            nextBurst = time + 180;
        }

        // Draw poppers at bottom corners
        drawPopper(true);
        drawPopper(false);

        // Update and draw pieces
        for (let i = pieces.length - 1; i >= 0; i--) {
            const p = pieces[i];

            p.x += p.vx;
            p.vy += gravity;
            p.y += p.vy;
            p.vx *= 0.998;
            p.rotation += p.rotSpeed;
            p.life += 1;

            p.x += Math.sin(time * p.wobbleSpeed + p.wobble) * 0.3;

            const fadeOut = p.life > p.maxLife * 0.7
                ? 1 - (p.life - p.maxLife * 0.7) / (p.maxLife * 0.3)
                : 1;
            const alpha = p.opacity * fadeOut;

            if (p.life >= p.maxLife || p.y > canvas.height + 20 || alpha <= 0.01) {
                pieces.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = Math.max(0, alpha);

            const c = p.color;

            if (p.shape === 'rect') {
                ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
                ctx.fill();
            }

            ctx.restore();
        }

        requestAnimationFrame(animate);
    }
    animate();
})();
