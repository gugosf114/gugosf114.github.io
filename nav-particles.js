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

    const particles = [];
    const isMobile = window.innerWidth <= 768;
    const particleCount = isMobile ? 26 : 40;
    const colors = [
        'rgba(236, 38, 143, 0.75)',   // Pink
        'rgba(255, 197, 50, 0.8)',    // Yellow/Gold
        'rgba(255, 130, 160, 0.75)',  // Light pink
        'rgba(255, 180, 140, 0.75)',  // Peach
        'rgba(154, 149, 144, 0.75)',  // Gray (cream)
        'rgba(195, 98, 57, 0.75)'     // Brown (corporate)
    ];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: (Math.random() * 8 + 6) * 1.2,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: -(Math.random() * 0.4 + 0.15),
            speedX: (Math.random() - 0.5) * 0.2,
            swayOffset: Math.random() * Math.PI * 2,
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayAmount: Math.random() * 0.15 + 0.1,
            stringAngle: (Math.random() - 0.5) * 0.8
        });
    }

    let time = 0;

    // Collision detection - soft bounce when balloons touch
    function handleCollisions() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = (p1.radius + p2.radius) * 1.1;

                if (dist < minDist && dist > 0) {
                    // Normalize direction
                    const nx = dx / dist;
                    const ny = dy / dist;

                    // Soft push apart (gentle, like real balloons)
                    const pushStrength = 0.15;
                    const overlap = (minDist - dist) * 0.5;

                    p1.x -= nx * overlap * pushStrength;
                    p1.y -= ny * overlap * pushStrength;
                    p2.x += nx * overlap * pushStrength;
                    p2.y += ny * overlap * pushStrength;

                    // Exchange a bit of velocity (soft bounce)
                    const dvx = p2.speedX - p1.speedX;
                    const dvy = p2.speedY - p1.speedY;
                    const dotProduct = dvx * nx + dvy * ny;

                    if (dotProduct > 0) {
                        const bounce = 0.3;
                        p1.speedX += nx * dotProduct * bounce;
                        p2.speedX -= nx * dotProduct * bounce;
                    }
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 1;

        handleCollisions();

        particles.forEach(p => {
            const sway = Math.sin(time * p.swaySpeed + p.swayOffset) * p.swayAmount;

            p.y += p.speedY;
            p.x += p.speedX + Math.sin(time * p.swaySpeed * 0.5 + p.swayOffset) * 0.3;

            if (p.y < -p.radius * 3) {
                p.y = canvas.height + p.radius * 3;
                p.x = Math.random() * canvas.width;
            }
            if (p.x < -p.radius * 3) p.x = canvas.width + p.radius * 3;
            if (p.x > canvas.width + p.radius * 3) p.x = -p.radius * 3;

            const r = p.radius;
            const tilt = p.stringAngle * 0.4 + sway;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(tilt);

            ctx.fillStyle = p.color;

            // Balloon body (oval)
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 0.85, r * 1.1, 0, 0, Math.PI * 2);
            ctx.fill();

            // Highlight/shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(-r * 0.3, -r * 0.4, r * 0.25, r * 0.35, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // Knot
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(-r * 0.15, r * 1.1);
            ctx.lineTo(r * 0.15, r * 1.1);
            ctx.lineTo(0, r * 1.35);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            // String
            const knotX = p.x + Math.sin(tilt) * r * 1.35;
            const knotY = p.y + Math.cos(tilt) * r * 1.35;
            ctx.beginPath();
            ctx.moveTo(knotX, knotY);
            ctx.quadraticCurveTo(
                knotX + r * p.stringAngle * 1.5,
                knotY + r * 0.8,
                knotX + r * p.stringAngle * 2,
                knotY + r * 1.5
            );
            ctx.strokeStyle = 'rgba(150, 150, 150, 0.6)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
        });

        requestAnimationFrame(animate);
    }
    animate();
})();
