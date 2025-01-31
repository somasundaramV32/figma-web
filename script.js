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
    './ONLINE BOOKING - HTML TASK/Rectangle 1-1.jpg'
];

// Functions
function updateImage() {
    sliderImage.src = images[currentIndex];
    sliderImage.alt = `Slide ${currentIndex + 1}`;
    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
    });
}

function navigateImage(direction) {
    currentIndex = direction === 'prev' 
        ? (currentIndex === 0 ? images.length - 1 : currentIndex - 1)
        : (currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    updateImage();
}

function updateCart() {
    cartCount.textContent = `${cart.length} items`;
    cartItems.innerHTML = cart.map(item => `
        <div class="service-list-item">
            <span class="sername">${item.name}</span>
            <h3 class="cartserprice">$${item.price}</h3><br/>
            <small>${item.duration}</small>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, { price }) => sum + price, 0).toFixed(2);
    cartTotal.textContent = `$${total}`;
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
    if (!data?.services) return;

    // Render categories
    column1.innerHTML = Object.keys(data.services).map(category => `
        <p class="${category === activeCategory ? 'active-category' : ''}" 
           data-category="${category}">
            ${category}
        </p>
    `).join('');

    // Render services
    column2.innerHTML = Object.entries(data.services).map(([category, services]) => `
        <div id="${category}-services">
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
                            <span class="serprice">$${service.price}</span><br/>
                            <small>${service.duration}</small>
                        </label>
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('');

    // Add scroll functionality
    document.querySelectorAll('#column1 p').forEach(categoryEl => {
        categoryEl.addEventListener('click', () => {
            const category = categoryEl.dataset.category;
            const targetElement = document.getElementById(`${category}-services`);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                activeCategory = category;
                renderServices(); // Re-render to update active category
            }
        });
    });

    // Add checkbox event listeners
    document.querySelectorAll('.service-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const service = JSON.parse(checkbox.dataset.service);
            handleCheckboxChange(service);
        });
    });
}

// Event Listeners
prevBtn.addEventListener('click', () => navigateImage('prev'));
nextBtn.addEventListener('click', () => navigateImage('next'));

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const section = item.dataset.section;
        menuItems.forEach(menuItem => {
            menuItem.classList.toggle('activemenu', menuItem.dataset.section === section);
        });
        servicesSection.style.display = section === 'services' ? 'block' : 'none';
        giftSection.style.display = section === 'gift' ? 'block' : 'none';
    });
});

bookNowButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Please select at least one service before booking.');
        return;
    }
    const total = cart.reduce((sum, { price }) => sum + price, 0).toFixed(2);
    alert(`Proceeding to book ${cart.length} services for a total of $${total}`);
});

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
})
.catch(error => {
    console.error('Error initializing:', error);
    column2.innerHTML = '<p>Failed to load services. Please try again later.</p>';
});

// Initialize image slider
updateImage();
