// State management
let data = null;
let cart = [];
let currentIndex = 0;
let activeCategory = null;

// DOM Elements
const sliderImage = document.getElementById('slider-image');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dots = document.querySelectorAll('.dot');
const menuItems = document.querySelectorAll('.menu span');
const servicesSection = document.getElementById('services');
const giftSection = document.getElementById('gift');
const column1 = document.getElementById('column1');
const column2 = document.getElementById('column2');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.querySelector('#cart-total .total');
const bookNowButton = document.getElementById('book-now-button');

// Constants
const images = [
    './ONLINE BOOKING - HTML TASK/Group 2-1.jpg',
    './ONLINE BOOKING - HTML TASK/Group 2-1.jpg'
];

// Functions
function updateImage() {
    if (sliderImage && images[currentIndex]) {
        sliderImage.src = images[currentIndex];
        sliderImage.alt = `Slide ${currentIndex + 1}`;
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });
    }
}

function navigateImage(direction) {
    currentIndex = direction === 'prev' 
        ? (currentIndex === 0 ? images.length - 1 : currentIndex - 1)
        : (currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    updateImage();
}

function updateCart() {
    if (!cartCount || !cartItems || !cartTotal) return;

    cartCount.textContent = `${cart.length} items`;
    cartItems.innerHTML = cart.map(item => `
        <div class="service-list-item">
            <span class="sername">${item.name}</span>
            <span class="cartserprice">$${item.price.toFixed(2)}</span><br/>
            <small>${item.duration}</small>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, { price }) => sum + price, 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function handleCheckboxChange(service) {
    const existingIndex = cart.findIndex(item => item.id === service.id);
    if (existingIndex >= 0) {
        cart.splice(existingIndex, 1);
    } else {
        cart.push(service);
    }
    updateCart();
}

function renderServices() {
    if (!data?.services || !column1 || !column2) return;

    // Render categories
    column1.innerHTML = Object.keys(data.services).map(category => `
        <p class="${category === activeCategory ? 'active-category' : ''}" 
           data-category="${category}">
            ${category}
        </p>
    `).join('');

    // Render services
    column2.innerHTML = Object.entries(data.services).map(([category, services]) => `
        <div id="${category}-services" class="category-services">
            <h4>${category}</h4>
            <ul class="service-list">
                ${services.map(service => `
                    <li class="service-list-item">
                        <label class="service-label">
                            <input type="checkbox" 
                                   class="service-checkbox"
                                   data-service='${JSON.stringify(service)}'
                                   ${cart.some(item => item.id === service.id) ? 'checked' : ''}>
                            <span class="sername">${service.name}</span>
                            <span class="serprice">$${service.price.toFixed(2)}</span><br/>
                            <small>${service.duration}</small>
                        </label>
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('#column1 p').forEach(categoryEl => {
        categoryEl.addEventListener('click', () => {
            const category = categoryEl.dataset.category;
            const targetElement = document.getElementById(`${category}-services`);
            if (targetElement) {
                column2.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });
                activeCategory = category;
                document.querySelectorAll('#column1 p').forEach(p => {
                    p.classList.toggle('active-category', p.dataset.category === category);
                });
            }
        });
    });

    document.querySelectorAll('.service-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const service = JSON.parse(checkbox.dataset.service);
            handleCheckboxChange(service);
        });
    });
}

// Event Listeners
if (prevBtn) prevBtn.addEventListener('click', () => navigateImage('prev'));
if (nextBtn) nextBtn.addEventListener('click', () => navigateImage('next'));

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const section = item.dataset.section;
        menuItems.forEach(menuItem => {
            menuItem.classList.toggle('activemenu', menuItem.dataset.section === section);
        });
        if (servicesSection) servicesSection.style.display = section === 'services' ? 'block' : 'none';
        if (giftSection) giftSection.style.display = section === 'gift' ? 'block' : 'none';
    });
});

if (bookNowButton) {
    bookNowButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Please select at least one service before booking.');
            return;
        }
        const total = cart.reduce((sum, { price }) => sum + price, 0);
        alert(`Proceeding to book ${cart.length} services for a total of $${total.toFixed(2)}`);
    });
}

// Initialize
Promise.all([
    fetch('data.json').then(response => response.json()),
    // Preload images
    ...images.map(src => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
    }))
])
.then(([jsonData]) => {
    data = jsonData;
    renderServices();
    // Set initial active category
    if (data.services) {
        activeCategory = Object.keys(data.services)[0];
        renderServices();
    }
})
.catch(error => {
    console.error('Error initializing:', error);
    if (column2) {
        column2.innerHTML = '<p>Failed to load services. Please try again later.</p>';
    }
});

// Initialize image slider
updateImage();
