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
    const count = isMobile ? 18 : 35;
    const connectionDist = isMobile ? 110 : 160;

    const nodes = [];
    for (let i = 0; i < count; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 2.5 + 1.8,  // 2x bigger
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.025 + 0.01
        });
    }

    // Triangle fill colors — brown, pink, purple/dark blue
    const triangleColors = [
        'rgba(78, 45, 43, ',     // brown
        'rgba(236, 38, 143, ',   // pink
        'rgba(61, 26, 62, '      // purple/dark blue
    ];

    // Node colors — visible mix
    const nodeColors = [
        'rgba(255, 255, 255, ',    // white
        'rgba(236, 38, 143, ',     // pink
        'rgba(255, 197, 50, ',     // yellow
        'rgba(78, 45, 43, '        // brown
    ];

    let triColorIdx = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Move nodes
        nodes.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            n.pulse += n.pulseSpeed;
            if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
            if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
            n.x = Math.max(0, Math.min(canvas.width, n.x));
            n.y = Math.max(0, Math.min(canvas.height, n.y));
        });

        // Precompute distances for connections + triangles
        const dists = [];
        for (let i = 0; i < nodes.length; i++) {
            dists[i] = [];
            for (let j = 0; j < nodes.length; j++) {
                if (j <= i) { dists[i][j] = j < i ? dists[j][i] : 0; continue; }
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                dists[i][j] = Math.sqrt(dx * dx + dy * dy);
            }
        }

        // Draw connections — thicker, more visible
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = dists[i][j];
                if (dist < connectionDist) {
                    const alpha = (1 - dist / connectionDist) * 0.4;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = 'rgba(200, 180, 210, ' + alpha + ')';
                    ctx.lineWidth = 2.4;
                    ctx.stroke();
                }
            }
        }

        // Draw nodes — 2x bigger with glow
        nodes.forEach((n, i) => {
            const pulseAlpha = Math.sin(n.pulse) * 0.15 + 0.55;
            const colorIdx = i % 5 === 0 ? 1 : (i % 7 === 0 ? 2 : (i % 3 === 0 ? 3 : 0));
            const color = nodeColors[colorIdx];

            // Glow
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = color + (pulseAlpha * 0.12) + ')';
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = color + pulseAlpha + ')';
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
})();
