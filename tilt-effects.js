// Defer loading order form modal until after page is interactive
// This removes it from the critical request chain
function loadOrderModal() {
    fetch('order-form-modal.html')
        .then(r => r.text())
        .then(h => {
            document.body.insertAdjacentHTML('beforeend', h);
            const script = document.createElement('script');
            script.src = 'script.js';
            document.body.appendChild(script);
        });
}
// Load after page is fully loaded, or on first user interaction
if (document.readyState === 'complete') {
    setTimeout(loadOrderModal, 100);
} else {
    window.addEventListener('load', () => setTimeout(loadOrderModal, 100));
}

// Electric sparks effect for Get a Quote button
const navCta = document.querySelector('.nav-cta');
if (navCta) {
    let sparkInterval;

    function createNavSpark(x, y) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 35;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        spark.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${2 + Math.random() * 3}px;
            height: ${2 + Math.random() * 3}px;
        `;
        navCta.appendChild(spark);

        spark.animate([
            { opacity: 1, transform: 'scale(1) translate(0, 0)' },
            { opacity: 0, transform: `scale(0.3) translate(${tx}px, ${ty}px)` }
        ], {
            duration: 400 + Math.random() * 200,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => spark.remove();
    }

    navCta.addEventListener('mouseenter', () => {
        // Burst of sparks on enter
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const x = Math.random() * navCta.offsetWidth;
                const y = Math.random() * navCta.offsetHeight;
                createNavSpark(x, y);
            }, i * 40);
        }

        // Continuous sparks while hovering
        sparkInterval = setInterval(() => {
            const x = Math.random() * navCta.offsetWidth;
            const y = Math.random() * navCta.offsetHeight;
            createNavSpark(x, y);
        }, 120);
    });

    navCta.addEventListener('mouseleave', () => {
        clearInterval(sparkInterval);
    });

    navCta.addEventListener('click', () => {
        // Big burst on click
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const x = navCta.offsetWidth / 2 + (Math.random() - 0.5) * 30;
                const y = navCta.offsetHeight / 2 + (Math.random() - 0.5) * 15;
                createNavSpark(x, y);
            }, i * 25);
        }
    });
}

// Service Card 3D Tilt with Light Effect
(function() {
    const cards = document.querySelectorAll('.tile-grid-4 .service-card');

    cards.forEach(card => {
        // Create light reflection overlay
        const shine = document.createElement('div');
        shine.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
            border-radius: 30px;
            background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%);
            transition: background 0.1s ease;
        `;
        card.style.position = 'relative';
        card.style.transformStyle = 'preserve-3d';
        card.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease';
        card.appendChild(shine);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 50;
            const rotateY = (centerX - x) / 50;

            // 3D tilt
            card.style.transform = `perspective(800px) rotateX(${-rotateX}deg) rotateY(${-rotateY}deg) scale(1.02)`;

            // Light follows cursor
            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;
            shine.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
            shine.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)';
        });
    });
})();

// Instagram Post 3D Tilt with Light Effect
(function() {
    const posts = document.querySelectorAll('.ig-post');

    posts.forEach(post => {
        // Create light reflection overlay
        const shine = document.createElement('div');
        shine.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
            border-radius: 8px;
            background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%);
            transition: background 0.1s ease;
        `;
        post.style.position = 'relative';
        post.style.transformStyle = 'preserve-3d';
        post.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease';
        post.appendChild(shine);

        post.addEventListener('mousemove', (e) => {
            const rect = post.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 50;
            const rotateY = (centerX - x) / 50;

            // 3D tilt
            post.style.transform = `perspective(800px) rotateX(${-rotateX}deg) rotateY(${-rotateY}deg) scale(1.02)`;

            // Light follows cursor
            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;
            shine.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)`;
        });

        post.addEventListener('mouseleave', () => {
            post.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
            shine.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)';
        });
    });
})();

// Hero Text Box Subtle Tilt
(function() {
    const heroBox = document.querySelector('.hero-text-box');
    if (!heroBox) return;

    heroBox.style.transformStyle = 'preserve-3d';
    heroBox.style.transition = 'transform 0.4s ease-out';

    heroBox.addEventListener('mousemove', (e) => {
        const rect = heroBox.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 150;
        const rotateY = (centerX - x) / 150;

        heroBox.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${-rotateY}deg)`;
    });

    heroBox.addEventListener('mouseleave', () => {
        heroBox.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
})();

// Corporate Logo 3D Tilt Effect
(function() {
    const logos = document.querySelectorAll('.corporate-logos-grid img');

    logos.forEach(logo => {
        logo.addEventListener('mousemove', (e) => {
            const rect = logo.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 8;
            const rotateY = (centerX - x) / 8;

            logo.style.transform = `perspective(500px) rotateX(${-rotateX}deg) rotateY(${-rotateY}deg) translateY(-8px) scale(1.08)`;
        });

        logo.addEventListener('mouseleave', () => {
            logo.style.transform = 'perspective(500px) rotateX(0) rotateY(0) translateY(0) scale(1)';
        });
    });
})();
