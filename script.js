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

// Initialize delivery toggle when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeliveryToggle);
} else {
    initDeliveryToggle();
}

// Form submission
if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
                alert('Oops! Something went wrong. Please call us at (415) 632-8008 or email info@mybakingcreations.com');
            }
        } catch (error) {
            alert('Oops! Something went wrong. Please call us at (415) 632-8008 or email info@mybakingcreations.com');
        }
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}