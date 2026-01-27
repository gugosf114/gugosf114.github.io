/**
 * Floating Consultation Widget
 * Premium, draggable "Book 15-Min Consultation" button
 */
(function() {
    'use strict';

    // Don't load on the consultation page itself
    if (window.location.pathname.includes('book-consultation')) return;

    // Create widget HTML
    const widget = document.createElement('div');
    widget.id = 'consultationWidget';
    widget.innerHTML = `
        <a href="book-consultation.html" class="consultation-widget-btn" id="consultationBtn">
            <div class="widget-glow"></div>
            <div class="widget-pulse"></div>
            <div class="widget-content">
                <div class="widget-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                </div>
                <div class="widget-text">
                    <span class="widget-label">Free Consultation</span>
                    <span class="widget-sublabel">15 min video call</span>
                </div>
            </div>
            <div class="widget-shine"></div>
        </a>
        <div class="widget-drag-hint" id="dragHint">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>
        </div>
    `;

    // Create styles
    const styles = document.createElement('style');
    styles.textContent = `
        #consultationWidget {
            position: fixed;
            bottom: 45%;
            right: 20px;
            z-index: 9998;
            touch-action: none;
            user-select: none;
        }

        .consultation-widget-btn {
            position: relative;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 20px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 50px;
            text-decoration: none;
            color: white;
            box-shadow:
                0 10px 40px rgba(0, 0, 0, 0.3),
                0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                0 0 30px rgba(236, 38, 143, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            cursor: pointer;
        }

        .consultation-widget-btn:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow:
                0 15px 50px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.2) inset,
                0 0 40px rgba(236, 38, 143, 0.5);
        }

        .consultation-widget-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 50px;
            padding: 2px;
            background: linear-gradient(135deg, #EC268F, #FFC532, #EC268F);
            background-size: 200% 200%;
            animation: widget-border-animate 3s ease infinite;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }

        @keyframes widget-border-animate {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }

        .widget-glow {
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(236, 38, 143, 0.15) 0%, transparent 60%);
            animation: widget-glow-rotate 8s linear infinite;
            pointer-events: none;
        }

        @keyframes widget-glow-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .widget-pulse {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            border-radius: 50px;
            background: transparent;
            border: 2px solid rgba(236, 38, 143, 0.5);
            animation: widget-pulse-anim 2s ease-out infinite;
            pointer-events: none;
        }

        @keyframes widget-pulse-anim {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        .widget-content {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .widget-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #EC268F, #D11F7E);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(236, 38, 143, 0.4);
            animation: widget-icon-bounce 2s ease-in-out infinite;
        }

        @keyframes widget-icon-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        .widget-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .widget-label {
            font-family: 'Fredoka One', cursive;
            font-size: 0.95rem;
            color: white;
            white-space: nowrap;
        }

        .widget-sublabel {
            font-family: 'Nunito', sans-serif;
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.6);
            white-space: nowrap;
        }

        .widget-shine {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: widget-shine 4s ease-in-out infinite;
            pointer-events: none;
        }

        @keyframes widget-shine {
            0%, 100% { left: -100%; }
            50% { left: 100%; }
        }

        /* Drag hint */
        .widget-drag-hint {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 24px;
            height: 24px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #1a1a2e;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        #consultationWidget:hover .widget-drag-hint {
            opacity: 1;
        }

        /* Dragging state */
        #consultationWidget.dragging .consultation-widget-btn {
            cursor: grabbing;
            transform: scale(1.05);
            box-shadow:
                0 20px 60px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.2) inset,
                0 0 50px rgba(236, 38, 143, 0.6);
        }

        #consultationWidget.dragging .widget-pulse {
            animation: none;
        }

        /* Mobile styles */
        @media (max-width: 600px) {
            #consultationWidget {
                bottom: 40%;
                right: 10px;
            }

            .consultation-widget-btn {
                padding: 12px 16px;
            }

            .widget-icon {
                width: 36px;
                height: 36px;
            }

            .widget-icon svg {
                width: 20px;
                height: 20px;
            }

            .widget-label {
                font-size: 0.85rem;
            }

            .widget-sublabel {
                font-size: 0.7rem;
            }
        }

        /* Very small screens - icon only */
        @media (max-width: 400px) {
            .consultation-widget-btn {
                padding: 14px;
                border-radius: 50%;
            }

            .widget-text {
                display: none;
            }

            .widget-icon {
                width: 32px;
                height: 32px;
            }
        }

        /* When chatbot is also present, keep at same height */
        #consultationWidget.with-chatbot {
            bottom: 45%;
        }
    `;

    // Append to DOM
    document.head.appendChild(styles);
    document.body.appendChild(widget);

    // Check if chatbot exists and adjust position
    setTimeout(() => {
        const chatbot = document.querySelector('.chatbot-widget, #chatbot-widget, .chatbot-container');
        if (chatbot) {
            widget.classList.add('with-chatbot');
        }
    }, 500);

    // Draggable functionality
    const btn = document.getElementById('consultationBtn');
    let isDragging = false;
    let hasMoved = false;
    let startX, startY, startLeft, startBottom;
    let touchStartTime = 0;

    function getPosition() {
        const rect = widget.getBoundingClientRect();
        return {
            left: rect.left,
            bottom: window.innerHeight - rect.bottom
        };
    }

    // Mouse start
    function onMouseStart(e) {
        startX = e.clientX;
        startY = e.clientY;
        startLeft = widget.offsetLeft || (window.innerWidth - widget.offsetWidth - 20);
        startBottom = parseInt(getComputedStyle(widget).bottom) || 100;
        isDragging = true;
        hasMoved = false;
        widget.classList.add('dragging');
        e.preventDefault();
    }

    // Touch start - don't prevent default so tap can work
    function onTouchStart(e) {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startLeft = widget.offsetLeft || (window.innerWidth - widget.offsetWidth - 20);
        startBottom = parseInt(getComputedStyle(widget).bottom) || 100;
        isDragging = true;
        hasMoved = false;
        touchStartTime = Date.now();
        widget.classList.add('dragging');
        // Don't prevent default here - allow tap to work
    }

    function onMove(e) {
        if (!isDragging) return;

        const touch = e.touches ? e.touches[0] : e;
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        // Only count as moved if dragged more than 10px (increased threshold for mobile)
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            hasMoved = true;
            // Only prevent default when actually dragging
            e.preventDefault();
        }

        if (!hasMoved) return;

        // Calculate new position
        let newRight = window.innerWidth - (startLeft + widget.offsetWidth) - deltaX;
        let newBottom = startBottom - deltaY;

        // Constrain to viewport
        const maxRight = window.innerWidth - widget.offsetWidth - 10;
        const maxBottom = window.innerHeight - widget.offsetHeight - 10;

        newRight = Math.max(10, Math.min(newRight, maxRight));
        newBottom = Math.max(10, Math.min(newBottom, maxBottom));

        widget.style.right = newRight + 'px';
        widget.style.bottom = newBottom + 'px';
        widget.style.left = 'auto';
    }

    function onEnd(e) {
        if (!isDragging) return;

        isDragging = false;
        widget.classList.remove('dragging');

        // For touch: if it was a quick tap (not drag), navigate manually
        if (e.type === 'touchend' && !hasMoved) {
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration < 300) {
                // Quick tap - navigate to consultation page
                window.location.href = 'book-consultation.html';
            }
        }

        hasMoved = false;
    }

    // Prevent click if dragged (for mouse)
    btn.addEventListener('click', (e) => {
        if (hasMoved) {
            e.preventDefault();
            hasMoved = false;
        }
    });

    // Mouse events
    widget.addEventListener('mousedown', onMouseStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    // Touch events
    widget.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);

    // 3D tilt effect on hover
    btn.addEventListener('mousemove', (e) => {
        if (isDragging) return;

        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        btn.style.transform = `perspective(500px) rotateX(${-rotateX}deg) rotateY(${-rotateY}deg) translateY(-3px)`;
    });

    btn.addEventListener('mouseleave', () => {
        if (!isDragging) {
            btn.style.transform = '';
        }
    });

    // Save position to localStorage
    window.addEventListener('beforeunload', () => {
        const pos = {
            right: widget.style.right,
            bottom: widget.style.bottom
        };
        localStorage.setItem('consultationWidgetPos', JSON.stringify(pos));
    });

    // Restore position from localStorage
    const savedPos = localStorage.getItem('consultationWidgetPos');
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            if (pos.right) widget.style.right = pos.right;
            if (pos.bottom) widget.style.bottom = pos.bottom;
        } catch (e) {}
    }

})();
