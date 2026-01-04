// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Order Form Modal
const orderModal = document.getElementById('orderModal');
const orderBtn = document.getElementById('floatingOrderBtn');
const closeModal = document.querySelector('.close-modal');
const orderForm = document.getElementById('orderForm');

// Open modal when floating button or any .open-order-form button is clicked
document.addEventListener('click', (e) => {
    if (e.target.id === 'floatingOrderBtn' || e.target.classList.contains('open-order-form')) {
        e.preventDefault();
        orderModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
});

// Close modal
if (closeModal) {
    closeModal.addEventListener('click', () => {
        orderModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// Close modal when clicking outside
orderModal?.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        orderModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// FLAVOR DROPDOWN TOGGLE FUNCTIONALITY
function initFlavorToggle() {
    const productRadios = document.querySelectorAll('input[name="product_type"]');
    const flavorSection = document.getElementById('flavorSection');
    const flavorSelect = document.getElementById('flavor');

    if (!productRadios.length || !flavorSection || !flavorSelect) {
        // Elements not loaded yet, try again in 100ms
        setTimeout(initFlavorToggle, 100);
        return;
    }

    // Flavor options by product type
    const flavorOptions = {
        'Cake': [
            'Strawberry Vanilla Cream',
            'Chocolate Mousse',
            'Lemon Orange Cream',
            'Blueberry Lavender Cream'
        ],
        'Cookies': [
            'Vanilla Shortbread',
            'Chocolate Shortbread',
            'Lemon Orange Shortbread',
            'Gingerbread'
        ],
        'Cake Pops': [
            'Vanilla',
            'Chocolate'
        ],
        'Cupcakes': [
            'Vanilla',
            'Chocolate'
        ]
    };

    function updateFlavorOptions(productType) {
        // Clear existing options except the first placeholder
        flavorSelect.innerHTML = '<option value="">Select flavor (optional)</option>';

        // Add options for selected product type
        const flavors = flavorOptions[productType] || [];
        flavors.forEach(flavor => {
            const option = document.createElement('option');
            option.value = flavor;
            option.textContent = flavor;
            flavorSelect.appendChild(option);
        });

        // Show the flavor section
        flavorSection.style.display = 'block';
    }

    productRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateFlavorOptions(this.value);
        });
    });
}

// DELIVERY TOGGLE FUNCTIONALITY
function initDeliveryToggle() {
    const pickupOption = document.getElementById('pickup_option');
    const deliveryOption = document.getElementById('delivery_option');
    const deliveryDetailsSection = document.getElementById('deliveryDetailsSection');
    const deliveryAddress = document.getElementById('delivery_address');
    const deliveryCity = document.getElementById('delivery_city');

    if (!pickupOption || !deliveryOption || !deliveryDetailsSection) {
        // Elements not loaded yet, try again in 100ms
        setTimeout(initDeliveryToggle, 100);
        return;
    }

    function toggleDeliverySection() {
        if (deliveryOption.checked) {
            deliveryDetailsSection.style.display = 'block';
            deliveryAddress.required = true;
            deliveryCity.required = true;
        } else {
            deliveryDetailsSection.style.display = 'none';
            deliveryAddress.required = false;
            deliveryCity.required = false;
        }
    }

    pickupOption.addEventListener('change', toggleDeliverySection);
    deliveryOption.addEventListener('change', toggleDeliverySection);
}

// Initialize form toggles when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initFlavorToggle();
        initDeliveryToggle();
    });
} else {
    initFlavorToggle();
    initDeliveryToggle();
}

// Form submission
if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // File size validation (5MB max)
        const fileInput = document.getElementById('reference_photo');
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                alert('File is too large. Please upload a file smaller than 5MB.');
                return;
            }
        }

        const submitBtn = orderForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(orderForm);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('Thank you! Your order inquiry has been sent. We\'ll get back to you within 24 hours.');
                orderForm.reset();
                orderModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            } else {
                alert('Oops! Something went wrong. Please call us at (415) 568-8060 or email info@mybakingcreations.com');
            }
        } catch (error) {
            alert('Oops! Something went wrong. Please call us at (415) 568-8060 or email info@mybakingcreations.com');
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// ===========================================
// HERO CAROUSEL FUNCTIONALITY (Consolidated)
// ===========================================
function initHeroCarousel(startSlide = 0) {
    const track = document.querySelector('.carousel-track');
    const dots = document.querySelectorAll('.hero-dot');

    if (!track || !dots.length) return;

    let currentSlide = 0;
    const totalSlides = dots.length;
    let autoRotate;
    let isMobile = window.innerWidth <= 768;

    function getSlideWidth() {
        return isMobile ? 100 : 33.333;
    }

    function goToSlide(index) {
        dots[currentSlide].classList.remove('active');
        currentSlide = index;
        if (currentSlide >= totalSlides) currentSlide = 0;
        if (currentSlide < 0) currentSlide = totalSlides - 1;
        track.style.transform = `translateX(-${currentSlide * getSlideWidth()}%)`;
        dots[currentSlide].classList.add('active');
        resetAutoRotate();
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function resetAutoRotate() {
        clearInterval(autoRotate);
        autoRotate = setInterval(nextSlide, 4000);
    }

    // Expose goToSlide globally for dot onclick handlers
    window.goToSlide = goToSlide;

    // Handle resize
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 768;
        goToSlide(currentSlide);
    });

    // Set up dot click handlers (replacing inline onclick)
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Start carousel
    autoRotate = setInterval(nextSlide, 4000);
    goToSlide(startSlide);
}

// ===========================================
// LIGHTBOX FUNCTIONALITY (Consolidated)
// ===========================================
function initLightbox(images) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = lightbox?.querySelector('.lightbox-close');
    const prevBtn = lightbox?.querySelector('.lightbox-prev');
    const nextBtn = lightbox?.querySelector('.lightbox-next');

    if (!lightbox || !lightboxImg) return;

    let currentIndex = 0;
    let imageList = images || [];

    function openLightbox(index) {
        currentIndex = index;
        if (imageList.length > 0) {
            lightboxImg.src = imageList[currentIndex];
        }
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function changeSlide(direction) {
        currentIndex += direction;
        if (currentIndex < 0) currentIndex = imageList.length - 1;
        if (currentIndex >= imageList.length) currentIndex = 0;
        lightboxImg.src = imageList[currentIndex];
    }

    // Event listeners
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeSlide(-1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeSlide(1);
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' && prevBtn) changeSlide(-1);
        if (e.key === 'ArrowRight' && nextBtn) changeSlide(1);
    });

    // Touch swipe navigation for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 50; // Minimum distance for swipe

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
        if (!touchStartX) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Only trigger if horizontal swipe is greater than vertical (prevent scroll conflicts)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
            if (deltaX < 0) {
                // Swipe left → next image
                changeSlide(1);
            } else {
                // Swipe right → previous image
                changeSlide(-1);
            }
        }

        // Reset
        touchStartX = 0;
        touchStartY = 0;
    }

    // Attach to both lightbox overlay and image for reliable detection
    lightbox.addEventListener('touchstart', handleTouchStart, { passive: true });
    lightbox.addEventListener('touchend', handleTouchEnd, { passive: true });
    lightboxImg.addEventListener('touchstart', handleTouchStart, { passive: true });
    lightboxImg.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Expose openLightbox globally
    window.openLightbox = openLightbox;

    return { openLightbox, closeLightbox, changeSlide };
}

// Simple lightbox for cupcakes (no prev/next)
function initSimpleLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (!lightbox || !lightboxImg) return;

    function openLightbox(element) {
        const img = element.querySelector('img');
        if (img) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    window.openLightbox = openLightbox;

    return { openLightbox, closeLightbox };
}

// ===========================================
// SCROLL REVEAL ANIMATIONS
// ===========================================
function initScrollReveal() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // If reduced motion is preferred, make all reveal elements visible immediately
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('visible');
        });
        return;
    }

    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length === 0) return;

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px 0px 100px 0px', // trigger 100px before element enters viewport
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}

// Initialize scroll reveal when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
    initScrollReveal();
}

// ===========================================
// BUTTON RIPPLE EFFECT
// ===========================================
function initButtonRipple() {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Target all buttons with .btn class
    document.addEventListener('click', (e) => {
        const button = e.target.closest('.btn');
        if (!button) return;

        // Create ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        // Get button dimensions and click position
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        // Style the ripple
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        // Add ripple to button
        button.appendChild(ripple);

        // Remove ripple after animation completes
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    });
}

// Initialize ripple effect when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButtonRipple);
} else {
    initButtonRipple();
}

// ===========================================
// TYPEWRITER EFFECT (All Pages with .typewriter-headline)
// ===========================================
function initTypewriter() {
    // Respect reduced motion preference - show text immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Find all typewriter headlines on the page
    const headlines = document.querySelectorAll('.typewriter-headline');
    if (headlines.length === 0) return;

    // Initialize typewriter for each headline
    headlines.forEach(headline => {
        initSingleTypewriter(headline);
    });
}

function initSingleTypewriter(headline) {
    // Store original HTML structure (preserves spans for SEO and styling)
    const originalHTML = headline.innerHTML;

    // Build a character map with styling info from original spans
    const charMap = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalHTML;

    function extractChars(node, className) {
        if (node.nodeType === Node.TEXT_NODE) {
            for (const char of node.textContent) {
                charMap.push({ char: char, className: className });
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const newClass = node.className || className;
            for (const child of node.childNodes) {
                extractChars(child, newClass);
            }
        }
    }

    for (const child of tempDiv.childNodes) {
        extractChars(child, '');
    }

    // Timing configuration
    const typeSpeed = 65;        // ms per character when typing
    const deleteSpeed = 35;      // ms per character when deleting (faster)
    const pauseAfterType = 3000; // 3 seconds pause after typing complete
    const pauseBeforeRestart = 500; // 0.5 seconds before restarting

    // Create persistent cursor
    const cursor = document.createElement('span');
    cursor.classList.add('typewriter-cursor');

    // Start the loop
    function startTypewriterLoop() {
        // Clear headline and add cursor
        headline.innerHTML = '';
        headline.classList.add('typing');
        headline.appendChild(cursor);
        cursor.classList.remove('hidden');

        let charIndex = 0;
        let currentSpan = null;
        let currentClass = null;

        function typeNextChar() {
            if (charIndex < charMap.length) {
                const { char, className } = charMap[charIndex];

                // If class changed or no current span, create new span
                if (className !== currentClass) {
                    if (className) {
                        currentSpan = document.createElement('span');
                        currentSpan.className = className;
                        headline.insertBefore(currentSpan, cursor);
                    } else {
                        currentSpan = null;
                    }
                    currentClass = className;
                }

                // Add character to current span or directly to headline
                if (currentSpan) {
                    currentSpan.appendChild(document.createTextNode(char));
                } else {
                    headline.insertBefore(document.createTextNode(char), cursor);
                }

                charIndex++;
                setTimeout(typeNextChar, typeSpeed);
            } else {
                // Typing complete - pause then start deleting
                setTimeout(startDeleting, pauseAfterType);
            }
        }

        function startDeleting() {
            // Get all text content for deletion
            let textContent = '';
            for (const node of headline.childNodes) {
                if (node !== cursor) {
                    textContent += node.textContent || '';
                }
            }

            let deleteIndex = textContent.length;

            function deleteNextChar() {
                if (deleteIndex > 0) {
                    // Remove one character from the end
                    deleteIndex--;

                    // Rebuild content up to deleteIndex
                    headline.innerHTML = '';
                    let builtChars = 0;
                    let currentSpan = null;
                    let currentClass = null;

                    for (let i = 0; i < charMap.length && builtChars < deleteIndex; i++) {
                        const { char, className } = charMap[i];

                        if (className !== currentClass) {
                            if (className) {
                                currentSpan = document.createElement('span');
                                currentSpan.className = className;
                                headline.appendChild(currentSpan);
                            } else {
                                currentSpan = null;
                            }
                            currentClass = className;
                        }

                        if (currentSpan) {
                            currentSpan.appendChild(document.createTextNode(char));
                        } else {
                            headline.appendChild(document.createTextNode(char));
                        }
                        builtChars++;
                    }

                    headline.appendChild(cursor);
                    setTimeout(deleteNextChar, deleteSpeed);
                } else {
                    // Deletion complete - pause then restart
                    setTimeout(startTypewriterLoop, pauseBeforeRestart);
                }
            }

            deleteNextChar();
        }

        // Start typing
        typeNextChar();
    }

    // Begin the loop
    startTypewriterLoop();
}

// Initialize typewriter when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypewriter);
} else {
    initTypewriter();
}