/**
 * Jecell Cakery - Main JavaScript
 * Handles product display, cart functionality, and checkout
 */

// ========================================
// CAKE DATABASE
// ========================================
const cakes = [
    { id: 1, name: 'Chocolate Cake', price: 550, description: 'Rich chocolate flavor, 8-inch', image: 'products/Chocolate Cake.jpg', category: 'birthday' },
    { id: 2, name: 'Mango Cake', price: 490, description: 'Fresh mango filling, 8-inch', image: 'products/Mango Cake.png', category: 'birthday' },
    { id: 3, name: 'Black Forest Cake', price: 650, description: 'Classic black forest, 8-inch', image: 'products/Black Forest Cake.jpeg', category: 'anniversary' },
    { id: 4, name: 'Ube Cake', price: 580, description: 'Purple yam flavor, 8-inch', image: 'products/Ube Cake.jpg', category: 'special' },
    { id: 5, name: 'Red Velvet Cake', price: 590, description: 'Cream cheese frosting, 8-inch', image: 'products/Red Velvet Cake.jpg', category: 'wedding' },
    { id: 6, name: 'Strawberry Cake', price: 520, description: 'Fresh strawberries, 8-inch', image: 'products/Strawberry Cake.jpeg', category: 'birthday' },
    { id: 7, name: 'Vanilla Cake', price: 440, description: 'Classic vanilla, 8-inch', image: 'products/Vanilla Cake.png', category: 'anniversary' },
    { id: 8, name: 'Tiramisu Cake', price: 690, description: 'Coffee and mascarpone, 8-inch', image: 'products/Tiramisu Cake.jpg', category: 'special' },
    { id: 9, name: 'Lemon Cake', price: 470, description: 'Tangy lemon flavor, 8-inch', image: 'products/Lemon Cake.jpeg', category: 'birthday' },
    { id: 10, name: 'Wedding Cake', price: 1650, description: 'Elegant 3-tier wedding cake', image: 'products/Wedding Cake.jpg', category: 'wedding' }
];

// ========================================
// CART MANAGEMENT
// ========================================
let cart = [];

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('jecell_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        cart = cart.filter(item => item && typeof item === 'object' && item.id);
        cart = cart.map(item => ({ id: item.id, quantity: item.quantity || 1 }));
    }
    updateCartUI();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('jecell_cart', JSON.stringify(cart));
}

// Update cart count in navbar
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountSpan = document.getElementById('cart-count');
    if (cartCountSpan) cartCountSpan.textContent = totalItems;
    saveCart();
}

// Add item to cart
function addToCart(cakeId, quantity) {
    const cake = cakes.find(c => c.id == cakeId);
    if (!cake) return;
    
    const existingItem = cart.find(item => item.id == cakeId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: cakeId, quantity: quantity });
    }
    
    updateCartUI();
    showToast(`🍰 ${cake.name} x${quantity} added to cart!`);
}

// Remove item from cart
function removeFromCart(index) {
    const removedItem = cart[index];
    const cake = cakes.find(c => c.id == removedItem.id);
    cart.splice(index, 1);
    updateCartUI();
    showToast(`🗑️ ${cake?.name || 'Item'} removed from cart`);
    renderOrderSummary();
}

// Get cart items with full details
function getCartItems() {
    return cart.map(item => {
        const cake = cakes.find(c => c.id == item.id);
        return {
            ...item,
            name: cake?.name || 'Unknown',
            price: cake?.price || 0,
            subtotal: (cake?.price || 0) * item.quantity
        };
    });
}

// Calculate cart total
function getCartTotal() {
    return getCartItems().reduce((sum, item) => sum + item.subtotal, 0);
}

// ========================================
// UI DISPLAY FUNCTIONS
// ========================================

// Display products based on filter
function displayProducts(filter = 'all') {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    const filteredCakes = filter === 'all' 
        ? cakes 
        : cakes.filter(cake => cake.category === filter);
    
    filteredCakes.forEach((cake, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.animationDelay = `${index * 0.05}s`;
        productCard.innerHTML = `
            <img src="${cake.image}" alt="${cake.name}" class="product-image" onerror="this.src='https://placehold.co/300x250/F8F8F8/D44C5E?text=${encodeURIComponent(cake.name)}'">
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(cake.name)}</h3>
                <div class="product-price">₱${cake.price.toLocaleString()}</div>
                <p class="product-description">${escapeHtml(cake.description)}</p>
                <div class="quantity-controls">
                    <input type="number" class="quantity-input" value="1" min="1" max="10" step="1">
                    <button class="add-to-cart" data-id="${cake.id}">Add to Cart</button>
                </div>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

// Render order summary in checkout modal
function renderOrderSummary() {
    const orderSummaryDiv = document.getElementById('order-summary');
    const totalPriceSpan = document.getElementById('total-price');
    
    if (!orderSummaryDiv) return;
    
    orderSummaryDiv.innerHTML = '';
    const cartItems = getCartItems();
    let total = 0;
    
    cartItems.forEach((item, index) => {
        total += item.subtotal;
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div style="flex: 1;">
                    <strong>${escapeHtml(item.name)}</strong> <span style="color:var(--primary);">₱${item.subtotal.toLocaleString()}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="qty-btn qty-minus" data-index="${index}">−</button>
                    <span class="qty-display" data-index="${index}">${item.quantity}</span>
                    <button class="qty-btn qty-plus" data-index="${index}">+</button>
                    <button class="remove-btn" data-index="${index}">Remove</button>
                </div>
            </div>
        `;
        orderSummaryDiv.appendChild(orderItem);
    });
    
    if (totalPriceSpan) totalPriceSpan.textContent = total.toLocaleString();
    
    // Attach quantity button events
    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(btn.dataset.index);
            if (!isNaN(index)) updateCartQuantity(index, 1);
        });
    });
    
    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(btn.dataset.index);
            if (!isNaN(index)) updateCartQuantity(index, -1);
        });
    });
    
    // Attach remove button events
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(btn.dataset.index);
            if (!isNaN(index)) removeFromCart(index);
        });
    });
}

// Update cart quantity function
function updateCartQuantity(index, change) {
    if (index >= 0 && index < cart.length) {
        const newQuantity = cart[index].quantity + change;
        if (newQuantity > 0) {
            cart[index].quantity = newQuantity;
            cart[index].subtotal = cart[index].quantity * cart[index].price;
            updateCartUI();
            renderOrderSummary();
        } else if (newQuantity === 0) {
            removeFromCart(index);
        }
    }
}

// ========================================
// MODAL FUNCTIONS
// ========================================
function openCheckoutModal() {
    if (cart.length === 0) {
        showToast('Your cart is empty! Add some delicious cakes first 🍰');
        return;
    }
    renderOrderSummary();
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.style.display = 'block';
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.style.display = 'none';
}

// ========================================
// ORDER PLACEMENT
// ========================================
function placeOrder(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('full-name')?.value.trim();
    const contact = document.getElementById('contact-number')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const address = document.getElementById('delivery-address')?.value.trim();
    
    if (!fullName) {
        showToast('Please enter your full name');
        return;
    }
    if (!contact) {
        showToast('Please enter your contact number');
        return;
    }
    if (!email) {
        showToast('Please enter your email address');
        return;
    }
    if (!address) {
        showToast('Please enter your delivery address');
        return;
    }
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    
    // In a real application, this would send data to a server
    const orderSummary = getCartItems().map(item => 
        `${item.name} x${item.quantity} (₱${item.subtotal})`
    ).join(', ');
    
    console.log('Order placed:', {
        customer: { fullName, contact, email },
        delivery: { address, date: document.getElementById('delivery-date')?.value },
        items: getCartItems(),
        total: getCartTotal()
    });
    
    showToast(`🎉 Thank you ${fullName}! Your order has been placed successfully. We'll contact you soon!`);
    
    // Clear cart and reset form
    cart = [];
    updateCartUI();
    closeCheckoutModal();
    
    // Reset form
    const form = document.getElementById('checkout-form');
    if (form) form.reset();
    
    renderOrderSummary();
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayProducts(btn.dataset.filter);
        });
    });
    
    // Add to cart (event delegation)
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-to-cart');
            if (addBtn) {
                const cakeId = addBtn.dataset.id;
                const card = addBtn.closest('.product-card');
                const qtyInput = card?.querySelector('.quantity-input');
                const quantity = parseInt(qtyInput?.value) || 1;
                addToCart(cakeId, quantity);
            }
        });
    }
    
    // Cart link
    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            openCheckoutModal();
        });
    }
    
    // Modal close
    const closeBtn = document.querySelector('.close');
    if (closeBtn) closeBtn.addEventListener('click', closeCheckoutModal);
    
    // Click outside modal to close
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeCheckoutModal();
        });
    }
    
    // Checkout form submit
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) checkoutForm.addEventListener('submit', placeOrder);
}

// Mobile hamburger menu
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    
    if (hamburger && navList) {
        hamburger.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-list a').forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
            });
        });
    }
}

// Smooth scroll for anchor links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// INITIALIZATION
// ========================================
function init() {
    loadCart();
    displayProducts('all');
    setupEventListeners();
    setupMobileMenu();
    setupSmoothScroll();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);