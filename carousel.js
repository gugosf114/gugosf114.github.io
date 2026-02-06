// 3-Image Sliding Carousel
let currentSlide = 0;
const track = document.querySelector('.carousel-track');
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.hero-dot');
const totalSlides = 9;
let autoRotate;
// Use matchMedia instead of innerWidth to avoid forced reflow
const mobileQuery = window.matchMedia('(max-width: 768px)');
let isMobile = mobileQuery.matches;

function getSlideWidth() {
    return isMobile ? 100 : 33.333;
}

function goToSlide(index) {
    dots[currentSlide].classList.remove('active');
    currentSlide = index;
    if (currentSlide >= totalSlides) currentSlide = 0;
    if (currentSlide < 0) currentSlide = totalSlides - 1;
    const offset = currentSlide * getSlideWidth();
    track.style.transform = `translateX(-${offset}%)`;
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

// Handle resize using matchMedia (avoids forced reflow)
mobileQuery.addEventListener('change', (e) => {
    isMobile = e.matches;
    goToSlide(currentSlide);
});

// Start auto-rotation
autoRotate = setInterval(nextSlide, 4000);
