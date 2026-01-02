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