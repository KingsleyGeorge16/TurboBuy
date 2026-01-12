// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const searchIcon = document.getElementById('search-icon');
const searchBox = document.querySelector('.search-box');
const filterButtons = document.querySelectorAll('.filter-btn');
const carCards = document.querySelectorAll('.car-card');
const sliderImages = document.querySelectorAll('.slider-img');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const quickViewButtons = document.querySelectorAll('.quick-view');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const backToTop = document.getElementById('back-to-top');
const newsletterForm = document.getElementById('newsletter-form');
const quickViewModal = document.getElementById('quick-view-modal');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');

// Current slide index for hero slider
let currentSlide = 0;

// Cart items array
let cartItems = [];

// Initialize the application
function init() {
    setupEventListeners();
    startHeroSlider();
    updateCartCount();
}

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu toggle
    navToggle.addEventListener('click', toggleMobileMenu);

    // Search box toggle
    searchIcon.addEventListener('click', toggleSearchBox);

    // Close search box when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchIcon.contains(e.target) && !searchBox.contains(e.target)) {
            searchBox.classList.remove('active');
        }
    });

    // Car filtering
    filterButtons.forEach(button => {
        button.addEventListener('click', filterCars);
    });

    // Hero slider controls
    prevBtn.addEventListener('click', showPrevSlide);
    nextBtn.addEventListener('click', showNextSlide);

    // Add to cart buttons
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    // Quick view buttons
    quickViewButtons.forEach(button => {
        button.addEventListener('click', showQuickView);
    });

    // Cart sidebar controls
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Back to top button
    backToTop.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', toggleBackToTop);

    // Newsletter form submission
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);

    // Modal close
    modalClose.addEventListener('click', closeModal);
    quickViewModal.addEventListener('click', (e) => {
        if (e.target === quickViewModal) closeModal();
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            e.preventDefault();

            const targetElement = document.querySelector(href);
            if (targetElement) {
                // Close mobile menu if open
                navMenu.classList.remove('active');

                // Scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Nav link active state on scroll
    window.addEventListener('scroll', setActiveNavLink);
}

// Toggle mobile menu
function toggleMobileMenu() {
    navMenu.classList.toggle('active');

    // Close search box if open
    searchBox.classList.remove('active');
}

// Toggle search box
function toggleSearchBox() {
    searchBox.classList.toggle('active');

    // Close mobile menu if open
    navMenu.classList.remove('active');

    // Focus on search input
    if (searchBox.classList.contains('active')) {
        setTimeout(() => {
            document.querySelector('.search-input').focus();
        }, 100);
    }
}

// Filter cars by category
function filterCars() {
    const filter = this.getAttribute('data-filter');

    // Update active filter button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');

    // Filter car cards
    carCards.forEach(card => {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || filter === category) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Hero slider functionality
function startHeroSlider() {
    // Show first slide
    sliderImages[0].classList.add('active');

    // Auto slide every 5 seconds
    setInterval(() => {
        showNextSlide();
    }, 5000);
}

function showNextSlide() {
    // Hide current slide
    sliderImages[currentSlide].classList.remove('active');

    // Calculate next slide index
    currentSlide = (currentSlide + 1) % sliderImages.length;

    // Show next slide
    sliderImages[currentSlide].classList.add('active');
}

function showPrevSlide() {
    // Hide current slide
    sliderImages[currentSlide].classList.remove('active');

    // Calculate previous slide index
    currentSlide = (currentSlide - 1 + sliderImages.length) % sliderImages.length;

    // Show previous slide
    sliderImages[currentSlide].classList.add('active');
}

// Add item to cart
function addToCart(e) {
    const partId = e.target.getAttribute('data-part');
    const partCard = e.target.closest('.part-card');
    const partName = partCard.querySelector('.part-title').textContent;
    const partPrice = parseFloat(partCard.querySelector('.part-price h4').textContent.replace('$', ''));
    const partImage = partCard.querySelector('.part-img img').src;

    // Check if item already in cart
    const existingItem = cartItems.find(item => item.id === partId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({
            id: partId,
            name: partName,
            price: partPrice,
            image: partImage,
            quantity: 1
        });
    }

    // Update cart UI
    updateCartUI();

    // Show confirmation
    showNotification(`${partName} added to cart!`);

    // Open cart sidebar
    openCart();
}

// Update cart UI
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    // Clear current items
    cartItemsContainer.innerHTML = '';

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotalElement.textContent = '$0.00';
        return;
    }

    // Calculate total
    let total = 0;

    // Add each item to cart UI
    cartItems.forEach(item => {
        total += item.price * item.quantity;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">
                    <span>$${item.price.toFixed(2)}</span>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    // Update total
    cartTotalElement.textContent = `$${total.toFixed(2)}`;

    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', updateCartItemQuantity);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', removeCartItem);
    });

    // Update cart count in header
    updateCartCount();
}

// Update cart item quantity
function updateCartItemQuantity(e) {
    const itemId = e.target.getAttribute('data-id');
    const item = cartItems.find(item => item.id === itemId);
    const isPlus = e.target.classList.contains('plus');

    if (item) {
        if (isPlus) {
            item.quantity++;
        } else {
            item.quantity = Math.max(1, item.quantity - 1);
        }

        updateCartUI();
    }
}

// Remove item from cart
function removeCartItem(e) {
    const itemId = e.target.closest('.cart-item-remove').getAttribute('data-id');
    cartItems = cartItems.filter(item => item.id !== itemId);
    updateCartUI();

    // Show notification
    showNotification('Item removed from cart');
}

// Update cart count in header
function updateCartCount() {
    // You can add a cart count badge to the header if needed
}

// Open cart sidebar
function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close cart sidebar
function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Show quick view modal
function showQuickView(e) {
    const partId = e.target.getAttribute('data-part');
    const partCard = e.target.closest('.part-card');

    // Get part details
    const partName = partCard.querySelector('.part-title').textContent;
    const partDescription = partCard.querySelector('.part-description').textContent;
    const partPrice = partCard.querySelector('.part-price h4').textContent;
    const partImage = partCard.querySelector('.part-img img').src;
    const partRating = partCard.querySelector('.stars').innerHTML;
    const partReviews = partCard.querySelector('.review-count').textContent;
    const partStock = partCard.querySelector('.part-stock').textContent;
    const stockClass = partCard.querySelector('.part-stock').classList.contains('in-stock') ? 'in-stock' : 'low-stock';

    // Create modal content
    modalBody.innerHTML = `
        <div class="modal-product">
            <div class="modal-product-images">
                <div class="main-image">
                    <img src="${partImage}" alt="${partName}">
                </div>
            </div>
            <div class="modal-product-details">
                <h2>${partName}</h2>
                <div class="modal-product-rating">
                    ${partRating}
                    <span>${partReviews}</span>
                </div>
                <div class="modal-product-price">
                    ${partPrice}
                    <span class="modal-product-stock ${stockClass}">${partStock}</span>
                </div>
                <p class="modal-product-description">${partDescription}</p>
                <p class="modal-product-full-description">This premium auto part is manufactured to the highest standards, ensuring perfect fit and performance. Comes with a 2-year warranty and includes all necessary installation hardware.</p>

                <div class="modal-product-actions">
                    <div class="quantity-selector">
                        <button class="qty-btn minus">-</button>
                        <input type="number" value="1" min="1" class="qty-input">
                        <button class="qty-btn plus">+</button>
                    </div>
                    <button class="btn btn-primary add-to-cart-modal" data-part="${partId}">Add to Cart</button>
                </div>

                <div class="modal-product-features">
                    <h4>Features:</h4>
                    <ul>
                        <li><i class="fas fa-check"></i> Premium quality materials</li>
                        <li><i class="fas fa-check"></i> Direct fit installation</li>
                        <li><i class="fas fa-check"></i> 2-year warranty included</li>
                        <li><i class="fas fa-check"></i> Improves performance</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // Show modal
    quickViewModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Add event listeners for modal actions
    document.querySelector('.add-to-cart-modal').addEventListener('click', addToCartFromModal);

    // Quantity selector functionality
    const qtyInput = document.querySelector('.qty-input');
    document.querySelector('.qty-btn.minus').addEventListener('click', () => {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
    });

    document.querySelector('.qty-btn.plus').addEventListener('click', () => {
        qtyInput.value = parseInt(qtyInput.value) + 1;
    });
}

// Add to cart from modal
function addToCartFromModal(e) {
    const partId = e.target.getAttribute('data-part');
    const qty = parseInt(document.querySelector('.qty-input').value);
    const partCard = document.querySelector(`.quick-view[data-part="${partId}"]`).closest('.part-card');
    const partName = partCard.querySelector('.part-title').textContent;
    const partPrice = parseFloat(partCard.querySelector('.part-price h4').textContent.replace('$', ''));
    const partImage = partCard.querySelector('.part-img img').src;

    // Check if item already in cart
    const existingItem = cartItems.find(item => item.id === partId);

    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cartItems.push({
            id: partId,
            name: partName,
            price: partPrice,
            image: partImage,
            quantity: qty
        });
    }

    // Update cart UI
    updateCartUI();

    // Show confirmation
    showNotification(`${qty} x ${partName} added to cart!`);

    // Close modal and open cart
    closeModal();
    openCart();
}

// Close modal
function closeModal() {
    quickViewModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Handle newsletter form submission
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value.trim();

    if (email) {
        // In a real application, you would send this to your backend
        showNotification('Thank you for subscribing to our newsletter!');
        emailInput.value = '';

        // Reset form
        e.target.reset();
    }
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Toggle back to top button visibility
function toggleBackToTop() {
    if (window.scrollY > 300) {
        backToTop.classList.add('active');
    } else {
        backToTop.classList.remove('active');
    }
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Set active navigation link based on scroll position
function setActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink.classList.add('active');
        } else {
            navLink.classList.remove('active');
        }
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        z-index: 2000;
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .notification i {
        font-size: 1.2rem;
    }

    .cart-item {
        display: flex;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid var(--light-gray);
    }

    .cart-item:last-child {
        border-bottom: none;
    }

    .cart-item-img {
        width: 80px;
        height: 80px;
        border-radius: var(--border-radius);
        overflow: hidden;
        flex-shrink: 0;
    }

    .cart-item-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .cart-item-info {
        flex: 1;
    }

    .cart-item-info h4 {
        font-size: 1rem;
        margin-bottom: 5px;
    }

    .cart-item-price {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .cart-item-quantity {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .quantity-btn {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 1px solid var(--light-gray);
        background: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .cart-item-remove {
        background: none;
        border: none;
        color: var(--gray-color);
        cursor: pointer;
        align-self: flex-start;
    }

    .modal-product {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }

    @media (max-width: 768px) {
        .modal-product {
            grid-template-columns: 1fr;
        }
    }

    .main-image {
        border-radius: var(--border-radius);
        overflow: hidden;
        margin-bottom: 1rem;
    }

    .main-image img {
        width: 100%;
        height: auto;
        display: block;
    }

    .modal-product-rating {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 1rem;
    }

    .modal-product-price {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 1rem;
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--primary-color);
    }

    .modal-product-stock {
        font-size: 0.9rem;
        padding: 3px 10px;
        border-radius: 20px;
    }

    .modal-product-description {
        font-size: 1rem;
        margin-bottom: 1rem;
    }

    .modal-product-full-description {
        margin-bottom: 1.5rem;
        color: var(--gray-color);
    }

    .modal-product-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .quantity-selector {
        display: flex;
        align-items: center;
        border: 1px solid var(--light-gray);
        border-radius: var(--border-radius);
        overflow: hidden;
    }

    .qty-btn {
        width: 40px;
        height: 40px;
        border: none;
        background: var(--light-gray);
        cursor: pointer;
        font-size: 1.2rem;
    }

    .qty-input {
        width: 50px;
        height: 40px;
        border: none;
        text-align: center;
        font-size: 1rem;
    }

    .add-to-cart-modal {
        flex: 1;
    }

    .modal-product-features ul {
        list-style: none;
        padding-left: 0;
    }

    .modal-product-features li {
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .modal-product-features i {
        color: #4CAF50;
    }
`;

document.head.appendChild(notificationStyles);