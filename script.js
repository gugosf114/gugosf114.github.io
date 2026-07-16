const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const searchContainer = document.querySelector('.search-container');
if (mobileMenuBtn) {
mobileMenuBtn.addEventListener('click', () => {
navLinks.classList.toggle('active');
mobileMenuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
if (searchContainer && window.innerWidth <= 968) {
if (navLinks.classList.contains('active')) {
searchContainer.classList.add('mobile-search');
navLinks.appendChild(searchContainer);
} else {
searchContainer.classList.remove('mobile-search');
const nav = document.querySelector('nav');
if (nav && mobileMenuBtn) {
nav.insertBefore(searchContainer, mobileMenuBtn);
}
}
}
});
}
if (navLinks) {
navLinks.addEventListener('click', (e) => {
const link = e.target.closest('a');
if (link && !link.closest('.dropdown') || (link && link.getAttribute('href') !== 'gallery.html')) {
if (window.innerWidth <= 968 && navLinks.classList.contains('active')) {
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
function initMobileDropdownIndicators() {
document.querySelectorAll('.dropdown > a').forEach(dropdownToggle => {
if (!dropdownToggle.querySelector('.mobile-dropdown-indicator')) {
const indicator = document.createElement('span');
indicator.className = 'mobile-dropdown-indicator';
indicator.textContent = '+';
indicator.setAttribute('aria-hidden', 'true');
dropdownToggle.appendChild(indicator);
}
});
}
if (window.innerWidth <= 968) {
initMobileDropdownIndicators();
}
window.addEventListener('resize', () => {
if (window.innerWidth <= 968) {
initMobileDropdownIndicators();
}
});
document.querySelectorAll('.dropdown > a').forEach(dropdownToggle => {
dropdownToggle.addEventListener('click', (e) => {
if (window.innerWidth <= 968) {
const dropdown = dropdownToggle.closest('.dropdown');
const dropdownMenu = dropdown.querySelector('.dropdown-menu');
const indicator = dropdownToggle.querySelector('.mobile-dropdown-indicator');
if (dropdownMenu) {
e.preventDefault(); 
if (dropdown.classList.contains('expanded')) {
dropdown.classList.remove('expanded');
if (indicator) indicator.textContent = '+';
} else {
dropdown.classList.add('expanded');
if (indicator) indicator.textContent = '−'; 
}
}
}
});
});
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
const orderModal = document.getElementById('orderModal');
const orderBtn = document.getElementById('floatingOrderBtn');
const closeModal = document.querySelector('.close-modal');
const orderForm = document.getElementById('orderForm');
document.addEventListener('click', (e) => {
if (e.target.id === 'floatingOrderBtn' || e.target.classList.contains('open-order-form')) {
e.preventDefault();
if (orderModal) {
orderModal.style.display = 'flex';
document.body.style.overflow = 'hidden';
}
}
});
if (closeModal) {
closeModal.addEventListener('click', () => {
if (orderModal) {
orderModal.style.display = 'none';
document.body.style.overflow = 'auto';
}
});
}
orderModal?.addEventListener('click', (e) => {
if (e.target === orderModal) {
orderModal.style.display = 'none';
document.body.style.overflow = 'auto';
}
});
const MAX_INIT_RETRIES = 20; 
function initFlavorToggle(retryCount = 0) {
const productRadios = document.querySelectorAll('input[name="product_type"]');
const flavorSection = document.getElementById('flavorSection');
const flavorSelect = document.getElementById('flavor');
if (!productRadios.length || !flavorSection || !flavorSelect) {
if (retryCount < MAX_INIT_RETRIES) {
setTimeout(() => initFlavorToggle(retryCount + 1), 100);
}
return;
}
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
flavorSelect.innerHTML = '<option value="">Select flavor (optional)</option>';
const flavors = flavorOptions[productType] || [];
flavors.forEach(flavor => {
const option = document.createElement('option');
option.value = flavor;
option.textContent = flavor;
flavorSelect.appendChild(option);
});
flavorSection.style.display = 'block';
}
productRadios.forEach(radio => {
radio.addEventListener('change', function() {
updateFlavorOptions(this.value);
});
});
}
function initDeliveryToggle(retryCount = 0) {
const pickupOption = document.getElementById('pickup_option');
const deliveryOption = document.getElementById('delivery_option');
const deliveryDetailsSection = document.getElementById('deliveryDetailsSection');
const deliveryAddress = document.getElementById('delivery_address');
const deliveryCity = document.getElementById('delivery_city');
if (!pickupOption || !deliveryOption || !deliveryDetailsSection) {
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
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
initFlavorToggle();
initDeliveryToggle();
});
} else {
initFlavorToggle();
initDeliveryToggle();
}
if (orderForm) {
orderForm.addEventListener('submit', async (e) => {
e.preventDefault();
const fileInput = document.getElementById('reference_photo');
if (fileInput && fileInput.files.length > 0) {
const file = fileInput.files[0];
const maxSize = 5 * 1024 * 1024; 
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
const custName = formData.get('name') || 'Unknown';
const productType = formData.get('product_type') || 'Order';
const eventDate = formData.get('event_date');
let dateLabel = '';
if (eventDate) {
const d = new Date(eventDate + 'T00:00:00');
dateLabel = ' - ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
formData.set('subject', productType + ' Order - ' + custName + dateLabel);
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
sendConfirmationEmail({
email: formData.get('email'),
name: formData.get('name'),
form_type: 'order',
product_type: formData.get('product_type'),
event_date: formData.get('event_date')
});
if (typeof gtag === 'function') {
gtag('event', 'generate_lead', {
form_type: 'order',
product_type: formData.get('product_type') || 'Unknown',
transport_type: 'beacon'
});
}
window.location.href = '/thank-you';
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
window.goToSlide = goToSlide;
if (heroCarouselResizeHandler) {
window.removeEventListener('resize', heroCarouselResizeHandler);
}
heroCarouselResizeHandler = () => {
isMobile = window.innerWidth <= 768;
goToSlide(currentSlide);
};
window.addEventListener('resize', heroCarouselResizeHandler);
dots.forEach((dot, index) => {
dot.addEventListener('click', () => goToSlide(index));
});
autoRotate = setInterval(nextSlide, 4000);
goToSlide(startSlide);
}
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
document.addEventListener('keydown', (e) => {
if (!lightbox.classList.contains('active')) return;
if (e.key === 'Escape') closeLightbox();
if (e.key === 'ArrowLeft' && prevBtn) changeSlide(-1);
if (e.key === 'ArrowRight' && nextBtn) changeSlide(1);
});
window.openLightbox = openLightbox;
return { openLightbox, closeLightbox, changeSlide };
}
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
function initScrollReveal() {
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
document.querySelectorAll('.reveal').forEach(el => {
el.classList.add('visible');
});
return;
}
const revealElements = document.querySelectorAll('.reveal');
if (revealElements.length === 0) return;
const observerOptions = {
root: null,
rootMargin: '0px 0px 300px 0px',
threshold: 0
};
const revealObserver = new IntersectionObserver((entries, observer) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('visible');
observer.unobserve(entry.target);
}
});
}, observerOptions);
revealElements.forEach(el => {
revealObserver.observe(el);
});
function revealFallback() {
const vh = window.innerHeight;
revealElements.forEach(el => {
if (el.classList.contains('visible')) return;
const rect = el.getBoundingClientRect();
if (rect.top < vh + 300) {
el.classList.add('visible');
}
});
}
window.addEventListener('scroll', revealFallback, { passive: true });
setTimeout(revealFallback, 500);
setTimeout(revealFallback, 1500);
window.addEventListener('load', revealFallback);
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
initScrollReveal();
}
function initButtonRipple() {
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
return;
}
document.addEventListener('click', (e) => {
const button = e.target.closest('.btn');
if (!button) return;
const ripple = document.createElement('span');
ripple.classList.add('ripple');
const rect = button.getBoundingClientRect();
const size = Math.max(rect.width, rect.height);
const x = e.clientX - rect.left - size / 2;
const y = e.clientY - rect.top - size / 2;
ripple.style.width = ripple.style.height = size + 'px';
ripple.style.left = x + 'px';
ripple.style.top = y + 'px';
button.appendChild(ripple);
ripple.addEventListener('animationend', () => {
ripple.remove();
});
});
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initButtonRipple);
} else {
initButtonRipple();
}
function initTypewriter() {
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
return;
}
const headlines = document.querySelectorAll('.typewriter-headline');
if (headlines.length === 0) return;
headlines.forEach(headline => {
initSingleTypewriter(headline);
});
}
function initSingleTypewriter(headline) {
const originalHTML = headline.innerHTML;
const charMap = [];
const tempDiv = document.createElement('div');
tempDiv.innerHTML = originalHTML;
function extractChars(node, className) {
if (node.nodeType === Node.TEXT_NODE) {
for (const char of node.textContent) {
charMap.push({ char: char, className: className });
}
} else if (node.nodeType === Node.ELEMENT_NODE) {
if (node.tagName === 'BR') {
charMap.push({ char: '\n', className: className, isBr: true });
return;
}
const newClass = node.className || className;
for (const child of node.childNodes) {
extractChars(child, newClass);
}
}
}
for (const child of tempDiv.childNodes) {
extractChars(child, '');
}
const typeSpeed = 65; 
const deleteSpeed = 35; 
const pauseAfterType = 3000; 
const pauseBeforeRestart = 500; 
const cursor = document.createElement('span');
cursor.classList.add('typewriter-cursor');
function startTypewriterLoop() {
headline.innerHTML = '';
headline.classList.add('typing');
headline.appendChild(cursor);
cursor.classList.remove('hidden');
let charIndex = 0;
let currentSpan = null;
let currentClass = null;
function typeNextChar() {
if (charIndex < charMap.length) {
const { char, className, isBr } = charMap[charIndex];
if (isBr) {
const br = document.createElement('br');
headline.insertBefore(br, cursor);
currentSpan = null; 
currentClass = null;
charIndex++;
setTimeout(typeNextChar, typeSpeed);
return;
}
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
if (currentSpan) {
currentSpan.appendChild(document.createTextNode(char));
} else {
headline.insertBefore(document.createTextNode(char), cursor);
}
charIndex++;
setTimeout(typeNextChar, typeSpeed);
} else {
setTimeout(startDeleting, pauseAfterType);
}
}
function startDeleting() {
let textContent = '';
for (const node of headline.childNodes) {
if (node !== cursor) {
textContent += node.textContent || '';
}
}
let deleteIndex = textContent.length;
function deleteNextChar() {
if (deleteIndex > 0) {
deleteIndex--;
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
setTimeout(startTypewriterLoop, pauseBeforeRestart);
}
}
deleteNextChar();
}
typeNextChar();
}
startTypewriterLoop();
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initTypewriter);
} else {
initTypewriter();
}
function initCookieTypewriter() {
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
setTimeout(() => {
element.style.borderRight = 'none';
}, 500);
}
}
typeNext();
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initCookieTypewriter);
} else {
initCookieTypewriter();
}
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
document.querySelector('.lightbox-next')?.click();
} else {
document.querySelector('.lightbox-prev')?.click();
}
}
}, { passive: true });
})();
function initBlurUpLazyLoad() {
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
document.querySelectorAll('.blur-up-container').forEach(container => {
container.classList.add('loaded');
});
return;
}
const containers = document.querySelectorAll('.blur-up-container');
if (containers.length === 0) return;
const observerOptions = {
root: null,
rootMargin: '50px 0px', 
threshold: 0.01
};
const imageObserver = new IntersectionObserver((entries, observer) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const container = entry.target;
const fullImage = container.querySelector('.blur-up-full');
if (fullImage && fullImage.dataset.src) {
const img = new Image();
img.onload = function() {
fullImage.src = fullImage.dataset.src;
requestAnimationFrame(() => {
container.classList.add('loaded');
});
};
img.onerror = function() {
console.warn('Failed to load image:', fullImage.dataset.src);
container.classList.add('loaded');
};
img.src = fullImage.dataset.src;
} else if (fullImage && fullImage.src) {
if (fullImage.complete) {
container.classList.add('loaded');
} else {
fullImage.onload = function() {
container.classList.add('loaded');
};
fullImage.onerror = function() {
container.classList.add('loaded');
};
}
}
observer.unobserve(container);
}
});
}, observerOptions);
containers.forEach(container => {
imageObserver.observe(container);
});
}
function convertToBlurUp(selector) {
const images = document.querySelectorAll(selector);
images.forEach(img => {
if (img.closest('.blur-up-container') || !img.src) return;
const parent = img.parentElement;
const container = document.createElement('div');
container.className = 'blur-up-container';
container.style.width = '100%';
container.style.height = '100%';
const placeholder = document.createElement('img');
placeholder.className = 'blur-up-placeholder';
placeholder.src = img.src; 
placeholder.alt = '';
placeholder.setAttribute('aria-hidden', 'true');
img.className = (img.className + ' blur-up-full').trim();
img.dataset.src = img.src;
img.removeAttribute('src'); 
container.appendChild(placeholder);
container.appendChild(img);
parent.appendChild(container);
});
initBlurUpLazyLoad();
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initBlurUpLazyLoad);
} else {
initBlurUpLazyLoad();
}
function initTestimonialCarousel() {
const track = document.getElementById('testimonialTrack');
const prevBtn = document.getElementById('testimonialPrev');
const nextBtn = document.getElementById('testimonialNext');
const dotsContainer = document.getElementById('testimonialDots');
if (!track || !prevBtn || !nextBtn || !dotsContainer) return;
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
track.addEventListener('mouseenter', () => {
clearInterval(autoPlayInterval);
});
track.addEventListener('mouseleave', () => {
startAutoPlay();
});
prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);
window.addEventListener('resize', handleResize);
createDots();
goToPage(0);
startAutoPlay();
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initTestimonialCarousel);
} else {
initTestimonialCarousel();
}
(function() {
const scrollIndicator = document.querySelector('.scroll-indicator');
if (!scrollIndicator) return;
scrollIndicator.addEventListener('click', function(e) {
e.preventDefault();
window.scrollBy({
top: window.innerHeight * 0.8,
behavior: 'smooth'
});
});
})();
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
fetch('search-data.json')
.then(response => response.json())
.then(data => {
searchData = data;
startTypewriterEffect();
})
.catch(err => console.log('Search data not loaded:', err));
function startTypewriterEffect() {
if (!searchData || !typewriterEl) return;
const examples = searchData.placeholderExamples || ['Baby Yoda cake', 'Corporate cookies', 'Wedding cake'];
function typeChar() {
if (searchInput.value !== '' || document.activeElement === searchInput) {
typewriterEl.innerHTML = '';
return;
}
const currentText = examples[currentPlaceholderIndex];
if (isPaused) {
return;
}
if (!isDeleting) {
currentCharIndex++;
typewriterEl.innerHTML = currentText.substring(0, currentCharIndex) + '<span class="cursor"></span>';
if (currentCharIndex === currentText.length) {
isPaused = true;
setTimeout(() => {
isPaused = false;
isDeleting = true;
}, 2000); 
}
} else {
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
function performSearch(query) {
if (!searchData || query.length < 2) {
searchResults.classList.remove('active');
return;
}
const lowerQuery = query.toLowerCase();
const results = [];
const imageResults = searchData.images.filter(img =>
img.alt.toLowerCase().includes(lowerQuery)
).slice(0, 6);
const blogResults = searchData.blogs.filter(blog =>
blog.title.toLowerCase().includes(lowerQuery) ||
blog.description.toLowerCase().includes(lowerQuery) ||
(blog.keywords && blog.keywords.toLowerCase().includes(lowerQuery))
);
let html = '';
if (imageResults.length > 0) {
html += '<div class="search-section-header">Gallery</div>';
imageResults.forEach(img => {
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
searchInput.addEventListener('input', (e) => {
const query = e.target.value.trim();
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
document.addEventListener('click', (e) => {
if (!e.target.closest('.search-container')) {
searchResults.classList.remove('active');
}
});
})();
(function() {
if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const galleryItems = document.querySelectorAll('.cake-thumb, .gallery-item');
if (galleryItems.length === 0) return;
galleryItems.forEach(item => {
const img = item.querySelector('img');
if (!img) return;
item.addEventListener('mousemove', function(e) {
const rect = item.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;
const xPercent = (x / rect.width - 0.5) * 2;
const yPercent = (y / rect.height - 0.5) * 2;
const shiftX = -xPercent * 8;
const shiftY = -yPercent * 8;
img.style.transform = `scale(1.08) translate(${shiftX}px, ${shiftY}px)`;
});
item.addEventListener('mouseleave', function() {
img.style.transform = 'scale(1)';
});
});
})();
(function() {
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const ratingCounts = document.querySelectorAll('.rating-count');
if (ratingCounts.length === 0) return;
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const element = entry.target;
const text = element.textContent;
const match = text.match(/(\d+\.?\d*)/);
if (match) {
const targetValue = parseFloat(match[1]);
const suffix = text.replace(match[1], '');
animateCounter(element, targetValue, suffix);
}
observer.unobserve(element);
}
});
}, { threshold: 0.5 });
ratingCounts.forEach(el => observer.observe(el));
function animateCounter(element, target, suffix) {
const duration = 1500;
const startTime = performance.now();
const startValue = 0;
function update(currentTime) {
const elapsed = currentTime - startTime;
const progress = Math.min(elapsed / duration, 1);
const easeOut = 1 - Math.pow(1 - progress, 3);
const currentValue = startValue + (target - startValue) * easeOut;
element.textContent = currentValue.toFixed(1) + suffix;
if (progress < 1) {
requestAnimationFrame(update);
}
}
requestAnimationFrame(update);
}
})();
(function() {
const hints = document.querySelectorAll('.has-hint');
if (!hints.length) return;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let activeHint = null;
let hoverTimeout = null;
hints.forEach(el => {
const hasDelay = el.classList.contains('hint-delay');
const delay = hasDelay ? 300 : 0; 
el.addEventListener('mouseenter', () => {
if (isTouchDevice) return;
if (delay > 0) {
hoverTimeout = setTimeout(() => {
checkEdgeCollision(el);
el.classList.add('hint-active');
}, delay);
} else {
checkEdgeCollision(el);
}
});
el.addEventListener('mouseleave', () => {
if (isTouchDevice) return;
clearTimeout(hoverTimeout);
el.classList.remove('hint-active', 'hint-flip-bottom', 'hint-flip-top');
});
el.addEventListener('click', (e) => {
if (!isTouchDevice) return;
if (el.tagName === 'A' || el.tagName === 'BUTTON') return;
e.preventDefault();
if (activeHint && activeHint !== el) {
activeHint.classList.remove('hint-active', 'hint-flip-bottom', 'hint-flip-top');
}
if (el.classList.contains('hint-active')) {
el.classList.remove('hint-active', 'hint-flip-bottom', 'hint-flip-top');
activeHint = null;
} else {
checkEdgeCollision(el);
el.classList.add('hint-active');
activeHint = el;
}
});
});
if (isTouchDevice) {
document.addEventListener('click', (e) => {
if (activeHint && !activeHint.contains(e.target)) {
activeHint.classList.remove('hint-active', 'hint-flip-bottom', 'hint-flip-top');
activeHint = null;
}
});
}
function checkEdgeCollision(el) {
const rect = el.getBoundingClientRect();
const pos = el.dataset.hintPos || 'top';
el.classList.remove('hint-flip-bottom', 'hint-flip-top');
if (pos === 'top' && rect.top < 80) {
el.classList.add('hint-flip-bottom');
} else if (pos === 'bottom' && (window.innerHeight - rect.bottom) < 80) {
el.classList.add('hint-flip-top');
}
}
})();
(function() {
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
if (window.innerWidth < 768) return;
const canvas = document.createElement('canvas');
canvas.id = 'particles-canvas';
canvas.style.cssText = `
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
pointer-events: none;
z-index: 0;
`;
document.body.insertBefore(canvas, document.body.firstChild);
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 88; 
function resize() {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);
function createParticle() {
return {
x: Math.random() * canvas.width,
y: canvas.height + 10,
size: Math.random() * 3.6 + 1.2, 
speedY: Math.random() * 0.5 + 0.2,
speedX: (Math.random() - 0.5) * 0.3,
opacity: Math.random() * 0.48 + 0.12, 
wobble: Math.random() * Math.PI * 2,
wobbleSpeed: Math.random() * 0.02 + 0.01
};
}
for (let i = 0; i < particleCount; i++) {
const p = createParticle();
p.y = Math.random() * canvas.height;
particles.push(p);
}
function animate() {
ctx.clearRect(0, 0, canvas.width, canvas.height);
particles.forEach((p, index) => {
p.wobble += p.wobbleSpeed;
p.x += Math.sin(p.wobble) * 0.3 + p.speedX;
p.y -= p.speedY;
if (p.y < -10) {
particles[index] = createParticle();
}
ctx.beginPath();
ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
ctx.fill();
});
requestAnimationFrame(animate);
}
animate();
})();