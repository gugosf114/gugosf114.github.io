// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });
}

// Close mobile menu when clicking a link (for navigation)
if (navLinks) {
    navLinks.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        // Close menu when clicking a navigation link (not dropdown parent)
        if (link && !link.closest('.dropdown') || (link && link.getAttribute('href') !== 'gallery.html')) {
            if (window.innerWidth <= 968 && navLinks.classList.contains('active')) {
                // Only close if it's not the gallery dropdown toggle
                if (!link.closest('.dropdown') || link.closest('.dropdown-menu')) {
                    navLinks.classList.remove('active');
                    if (mobileMenuBtn) {
                        mobileMenuBtn.textContent = '☰';
                    }
                }
            }
        }
    });
}

// Mobile dropdown toggle - make gallery dropdown expandable on mobile
document.querySelectorAll('.dropdown > a').forEach(dropdownToggle => {
    dropdownToggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 968) {
            const dropdown = dropdownToggle.closest('.dropdown');
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');

            if (dropdownMenu) {
                e.preventDefault(); // Always prevent navigation on the toggle

                if (dropdown.classList.contains('expanded')) {
                    // Second tap - collapse the dropdown
                    dropdown.classList.remove('expanded');
                } else {
                    // First tap - expand the dropdown
                    dropdown.classList.add('expanded');
                }
            }
        }
    });
});

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
const MAX_INIT_RETRIES = 20; // Max 2 seconds of retrying

function initFlavorToggle(retryCount = 0) {
    const productRadios = document.querySelectorAll('input[name="product_type"]');
    const flavorSection = document.getElementById('flavorSection');
    const flavorSelect = document.getElementById('flavor');

    if (!productRadios.length || !flavorSection || !flavorSelect) {
        // Elements not loaded yet, retry with limit
        if (retryCount < MAX_INIT_RETRIES) {
            setTimeout(() => initFlavorToggle(retryCount + 1), 100);
        }
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
function initDeliveryToggle(retryCount = 0) {
    const pickupOption = document.getElementById('pickup_option');
    const deliveryOption = document.getElementById('delivery_option');
    const deliveryDetailsSection = document.getElementById('deliveryDetailsSection');
    const deliveryAddress = document.getElementById('delivery_address');
    const deliveryCity = document.getElementById('delivery_city');

    if (!pickupOption || !deliveryOption || !deliveryDetailsSection) {
        // Elements not loaded yet, retry with limit
        if (retryCount < MAX_INIT_RETRIES) {
            setTimeout(() => initDeliveryToggle(retryCount + 1), 100);
        }
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

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

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
            console.error('Form submission error:', error);
            alert('Oops! Something went wrong. Please call us at (415) 568-8060 or email info@mybakingcreations.com');
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// ===========================================
// HERO CAROUSEL FUNCTIONALITY (Consolidated)
// ===========================================
// Track if carousel resize handler is already attached
let heroCarouselResizeHandler = null;

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

    // Handle resize - remove previous handler to prevent memory leaks
    if (heroCarouselResizeHandler) {
        window.removeEventListener('resize', heroCarouselResizeHandler);
    }
    heroCarouselResizeHandler = () => {
        isMobile = window.innerWidth <= 768;
        goToSlide(currentSlide);
    };
    window.addEventListener('resize', heroCarouselResizeHandler);

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

    // Expose openLightbox globally
    window.openLightbox = openLightbox;

    return { openLightbox, closeLightbox, changeSlide };
}

// Simple lightbox for cupcakes (no prev/next)
function initSimpleLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (!lightbox || !lightboxImg) return;

    function openSimpleLightbox(element) {
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

    window.openSimpleLightbox = openSimpleLightbox;

    return { openSimpleLightbox, closeLightbox };
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

// ===========================================
// TYPEWRITER EFFECT FOR COOKIE TITLES (One-time, on scroll)
// ===========================================
function initCookieTypewriter() {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const cookieElements = document.querySelectorAll('.typewriter-cookie');
    if (cookieElements.length === 0) return;

    cookieElements.forEach(element => {
        const originalText = element.textContent;
        element.setAttribute('data-text', originalText);
        element.textContent = '';
        element.style.borderRight = '2px solid var(--yellow)';

        let hasTyped = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasTyped) {
                    hasTyped = true;
                    typeCookieText(element, originalText);
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(element);
    });
}

function typeCookieText(element, text) {
    let charIndex = 0;
    const typeSpeed = 80;

    function typeNext() {
        if (charIndex < text.length) {
            element.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(typeNext, typeSpeed);
        } else {
            // Remove cursor after typing complete
            setTimeout(() => {
                element.style.borderRight = 'none';
            }, 500);
        }
    }

    typeNext();
}

// Initialize cookie typewriter when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieTypewriter);
} else {
    initCookieTypewriter();
}

// ===========================================
// SIMPLE SWIPE DETECTION FOR LIGHTBOX
// ===========================================
(function() {
    let startX = 0;

    document.addEventListener('touchstart', function(e) {
        if (!document.getElementById('lightbox')?.classList.contains('active')) return;
        startX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        if (!document.getElementById('lightbox')?.classList.contains('active')) return;
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        if (Math.abs(diff) > 50) {
            if (diff < 0) {
                // Swipe left - next
                document.querySelector('.lightbox-next')?.click();
            } else {
                // Swipe right - prev
                document.querySelector('.lightbox-prev')?.click();
            }
        }
    }, { passive: true });
})();

// ===========================================
// BLUR-UP LAZY LOADING EFFECT
// Premium progressive image loading
// ===========================================
function initBlurUpLazyLoad() {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Just show images normally
        document.querySelectorAll('.blur-up-container').forEach(container => {
            container.classList.add('loaded');
        });
        return;
    }

    // Find all blur-up containers
    const containers = document.querySelectorAll('.blur-up-container');
    if (containers.length === 0) return;

    // Create intersection observer for lazy loading
    const observerOptions = {
        root: null,
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                const fullImage = container.querySelector('.blur-up-full');

                if (fullImage && fullImage.dataset.src) {
                    // Create a new image to preload
                    const img = new Image();

                    img.onload = function() {
                        // Set the actual src and mark as loaded
                        fullImage.src = fullImage.dataset.src;
                        // Small delay for smooth transition
                        requestAnimationFrame(() => {
                            container.classList.add('loaded');
                        });
                    };

                    img.onerror = function() {
                        // On error, still show the placeholder
                        console.warn('Failed to load image:', fullImage.dataset.src);
                        container.classList.add('loaded');
                    };

                    // Start loading the full image
                    img.src = fullImage.dataset.src;
                }

                // Stop observing this container
                observer.unobserve(container);
            }
        });
    }, observerOptions);

    // Observe all containers
    containers.forEach(container => {
        imageObserver.observe(container);
    });
}

// Auto-convert standard lazy images to blur-up (optional enhancement)
function convertToBlurUp(selector) {
    const images = document.querySelectorAll(selector);

    images.forEach(img => {
        // Skip if already converted or no src
        if (img.closest('.blur-up-container') || !img.src) return;

        // Get the parent element
        const parent = img.parentElement;

        // Create container
        const container = document.createElement('div');
        container.className = 'blur-up-container';
        container.style.width = '100%';
        container.style.height = '100%';

        // Create placeholder (tiny base64 placeholder or use same src with blur)
        const placeholder = document.createElement('img');
        placeholder.className = 'blur-up-placeholder';
        placeholder.src = img.src; // Use same image, CSS will blur it
        placeholder.alt = '';
        placeholder.setAttribute('aria-hidden', 'true');

        // Modify original image
        img.className = (img.className + ' blur-up-full').trim();
        img.dataset.src = img.src;
        img.removeAttribute('src'); // Remove src so it doesn't load immediately

        // Build the structure
        container.appendChild(placeholder);
        container.appendChild(img);

        // Replace in DOM
        parent.appendChild(container);
    });

    // Initialize the blur-up effect
    initBlurUpLazyLoad();
}

// Initialize blur-up when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlurUpLazyLoad);
} else {
    initBlurUpLazyLoad();
}

// ===========================================
// TESTIMONIAL CAROUSEL
// Responsive carousel with touch support
// ===========================================
function initTestimonialCarousel() {
    const track = document.getElementById('testimonialTrack');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    const dotsContainer = document.getElementById('testimonialDots');

    if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

    // Select both linked and non-linked testimonial cards
    const cards = track.querySelectorAll('.testimonial-card-link, .testimonial-card:not(.testimonial-card-link .testimonial-card)');
    if (cards.length === 0) return;

    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    let totalPages = Math.ceil(cards.length / cardsPerView);
    let autoPlayInterval;

    function getCardsPerView() {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }

    function createDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to page ${i + 1}`);
            dot.addEventListener('click', () => goToPage(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.testimonial-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function goToPage(index) {
        currentIndex = Math.max(0, Math.min(index, totalPages - 1));
        const cardWidth = 100 / cardsPerView;
        const offset = currentIndex * cardsPerView * cardWidth;
        track.style.transform = `translateX(-${offset}%)`;
        updateDots();
        resetAutoPlay();
    }

    function next() {
        goToPage(currentIndex + 1 >= totalPages ? 0 : currentIndex + 1);
    }

    function prev() {
        goToPage(currentIndex - 1 < 0 ? totalPages - 1 : currentIndex - 1);
    }

    function handleResize() {
        const newCardsPerView = getCardsPerView();
        if (newCardsPerView !== cardsPerView) {
            cardsPerView = newCardsPerView;
            totalPages = Math.ceil(cards.length / cardsPerView);
            currentIndex = Math.min(currentIndex, totalPages - 1);
            createDots();
            goToPage(currentIndex);
        }
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(next, 5000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                next();
            } else {
                prev();
            }
        }
    }, { passive: true });

    // Pause autoplay on hover
    track.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });

    track.addEventListener('mouseleave', () => {
        startAutoPlay();
    });

    // Event listeners
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);
    window.addEventListener('resize', handleResize);

    // Initialize
    createDots();
    goToPage(0);
    startAutoPlay();
}

// Initialize testimonial carousel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialCarousel);
} else {
    initTestimonialCarousel();
}

// ===========================================
// SCROLL INDICATOR - Scroll down on each click
// ===========================================
(function() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;

    scrollIndicator.addEventListener('click', function(e) {
        e.preventDefault();
        // Scroll down by 80% of viewport height each click
        window.scrollBy({
            top: window.innerHeight * 0.8,
            behavior: 'smooth'
        });
    });
})();

// ===========================================
// SITE SEARCH FUNCTIONALITY
// ===========================================
(function() {
    const searchInput = document.getElementById('site-search');
    const searchResults = document.getElementById('search-results');
    const typewriterEl = document.getElementById('search-typewriter');

    if (!searchInput || !searchResults) return;

    let searchData = null;
    let typewriterInterval = null;
    let currentPlaceholderIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    // Load search data
    fetch('search-data.json')
        .then(response => response.json())
        .then(data => {
            searchData = data;
            startTypewriterEffect();
        })
        .catch(err => console.log('Search data not loaded:', err));

    // Typewriter effect for placeholder
    function startTypewriterEffect() {
        if (!searchData || !typewriterEl) return;

        const examples = searchData.placeholderExamples || ['Baby Yoda cake', 'Corporate cookies', 'Wedding cake'];

        function typeChar() {
            if (searchInput.value !== '' || document.activeElement === searchInput) {
                // Hide typewriter when user is typing or focused
                typewriterEl.innerHTML = '';
                return;
            }

            const currentText = examples[currentPlaceholderIndex];

            if (isPaused) {
                return;
            }

            if (!isDeleting) {
                // Typing
                currentCharIndex++;
                typewriterEl.innerHTML = currentText.substring(0, currentCharIndex) + '<span class="cursor"></span>';

                if (currentCharIndex === currentText.length) {
                    isPaused = true;
                    setTimeout(() => {
                        isPaused = false;
                        isDeleting = true;
                    }, 2000); // Pause at end
                }
            } else {
                // Deleting
                currentCharIndex--;
                typewriterEl.innerHTML = currentText.substring(0, currentCharIndex) + '<span class="cursor"></span>';

                if (currentCharIndex === 0) {
                    isDeleting = false;
                    currentPlaceholderIndex = (currentPlaceholderIndex + 1) % examples.length;
                }
            }
        }

        typewriterInterval = setInterval(typeChar, isDeleting ? 50 : 100);
    }

    // Search functionality
    function performSearch(query) {
        if (!searchData || query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = [];

        // Search images
        const imageResults = searchData.images.filter(img =>
            img.alt.toLowerCase().includes(lowerQuery)
        ).slice(0, 6);

        // Search blogs
        const blogResults = searchData.blogs.filter(blog =>
            blog.title.toLowerCase().includes(lowerQuery) ||
            blog.description.toLowerCase().includes(lowerQuery) ||
            (blog.keywords && blog.keywords.toLowerCase().includes(lowerQuery))
        );

        // Build results HTML
        let html = '';

        if (imageResults.length > 0) {
            html += '<div class="search-section-header">Gallery</div>';
            imageResults.forEach(img => {
                // Extract a cleaner title from alt text
                const title = img.alt
                    .replace(/Custom |San Francisco |Bay Area |bakery/gi, '')
                    .trim();
                html += `
                    <a href="${img.url}" class="search-result-item">
                        <img src="${img.src}" alt="${img.alt}" class="search-result-image" loading="lazy">
                        <div class="search-result-info">
                            <div class="search-result-title">${title}</div>
                            <div class="search-result-category">${img.category}</div>
                        </div>
                    </a>
                `;
            });
        }

        if (blogResults.length > 0) {
            html += '<div class="search-section-header">Blog Posts</div>';
            blogResults.forEach(blog => {
                html += `
                    <a href="${blog.url}" class="search-result-item">
                        <div class="search-result-blog-icon">
                            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                        </div>
                        <div class="search-result-info">
                            <div class="search-result-title">${blog.title}</div>
                            <div class="search-result-category">Blog</div>
                        </div>
                    </a>
                `;
            });
        }

        if (html === '') {
            html = '<div class="search-results-empty">No results found for "' + query + '"</div>';
        }

        searchResults.innerHTML = html;
        searchResults.classList.add('active');
    }

    // Event listeners
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // Hide typewriter when typing
        if (typewriterEl) {
            typewriterEl.style.display = query ? 'none' : 'block';
        }

        performSearch(query);
    });

    searchInput.addEventListener('focus', () => {
        if (typewriterEl) {
            typewriterEl.style.display = 'none';
        }
        searchInput.classList.remove('typewriter-active');
    });

    searchInput.addEventListener('blur', () => {
        // Delay to allow click on results
        setTimeout(() => {
            if (searchInput.value === '') {
                searchInput.classList.add('typewriter-active');
                if (typewriterEl) {
                    typewriterEl.style.display = 'block';
                }
            }
            searchResults.classList.remove('active');
        }, 200);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.classList.remove('active');
        }
    });
})();