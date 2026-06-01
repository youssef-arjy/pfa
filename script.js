const API_URL = 'https://pfa-amazigh-backend.vercel.app/api';

function getAuthHeader() {
    const token = localStorage.getItem('amazigh_admin_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

const initialProducts = [
    {
        id: "1",
        name: "T-shirt Amazigh Blanc",
        category: "T-shirts",
        priceDH: 150,
        priceEUR: 14,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "T-shirt 100% coton premium avec motif géométrique berbère imprimé. Coupe moderne et confortable."
    },
    {
        id: "2",
        name: "T-shirt Amazigh Noir",
        category: "T-shirts",
        priceDH: 150,
        priceEUR: 14,
        image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Élégant T-shirt noir arborant le symbole Yaz (ⵣ) en doré. Idéal pour un look affirmé et authentique."
    },
    {
        id: "3",
        name: "Casquette Tifinagh",
        category: "Accessoires",
        priceDH: 120,
        priceEUR: 11,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Casquette brodée avec l'alphabet Tifinagh. Taille ajustable, qualité premium et design épuré."
    }
];

// Init App Data
let products = [];

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
            products = data.data;
            // Map backend structure to frontend structure if necessary
            products = products.map(p => ({
                id: p._id,
                name: p.name,
                category: p.category,
                priceDH: p.price,
                priceEUR: Math.round(p.price / 10.7), // Fallback conversion if priceEUR not in DB
                image: p.image,
                description: p.description
            }));
        } else {
            products = JSON.parse(localStorage.getItem('amazigh_products')) || initialProducts;
        }
    } catch (err) {
        console.error("Error fetching products:", err);
        products = JSON.parse(localStorage.getItem('amazigh_products')) || initialProducts;
    }
    renderProducts();
    if (typeof renderAdminProducts === 'function') renderAdminProducts();
}
fetchProducts();

let cart = JSON.parse(localStorage.getItem('amazigh_cart')) || [];
let orders = JSON.parse(localStorage.getItem('amazigh_orders')) || [];
let currency = localStorage.getItem('amazigh_currency') || 'DH'; // 'DH' or 'EUR'
let currentCategory = 'all';

// Save functions
const saveProducts = () => localStorage.setItem('amazigh_products', JSON.stringify(products));
const saveCart = () => localStorage.setItem('amazigh_cart', JSON.stringify(cart));
const saveOrders = () => localStorage.setItem('amazigh_orders', JSON.stringify(orders));
const saveCurrency = () => localStorage.setItem('amazigh_currency', currency);

// --- DOM ELEMENTS ---
const productsGrid = document.getElementById('productsGrid');
const currencyToggle = document.getElementById('currencyToggle');

// Cart
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');

// Admin
const secretAdminTrigger = document.getElementById('secretAdminTrigger');
const loginOverlay = document.getElementById('loginOverlay');
const loginBtn = document.getElementById('loginBtn');
const cancelLoginBtn = document.getElementById('cancelLoginBtn');
const adminPassword = document.getElementById('adminPassword');
const adminModal = document.getElementById('adminModal');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const productForm = document.getElementById('productForm');
const adminProductsList = document.getElementById('adminProductsList');

// Orders & Admin UI Elements
const adminProductsView = document.getElementById('adminProductsView');
const adminOrdersView = document.getElementById('adminOrdersView');
const adminOrdersList = document.getElementById('adminOrdersList');
const adminOrderBadge = document.getElementById('adminOrderBadge');
const tabProducts = document.getElementById('tabProducts');
const tabOrders = document.getElementById('tabOrders');

// Checkout Elements
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutOrderSummary = document.getElementById('checkoutOrderSummary');

// Confirmation Elements
const confirmationModal = document.getElementById('confirmationModal');
const closeConfirmBtn = document.getElementById('closeConfirmBtn');
const confirmOrderId = document.getElementById('confirmOrderId');
const confirmOrderTotal = document.getElementById('confirmOrderTotal');

// Filters
const categoryFilters = document.querySelectorAll('.filter-btn[data-category]');

// --- CURRENCY LOGIC ---
function formatPrice(dh, eur) {
    return currency === 'DH' ? `${dh} DH` : `${eur} €`;
}

if (currencyToggle) {
    currencyToggle.addEventListener('click', () => {
        currency = currency === 'DH' ? 'EUR' : 'DH';
        saveCurrency();
        currencyToggle.innerText = currency === 'DH' ? '🇲🇦 DH' : '🇪🇺 EUR';
        if (productsGrid) renderProducts();
        renderCart();
        if (adminModal && adminModal.classList.contains('show')) {
            renderAdminProducts();
        }
    });

    // Initialize currency button text
    currencyToggle.innerText = currency === 'DH' ? '🇲🇦 DH' : '🇪🇺 EUR';
}

// --- RENDER PRODUCTS ---
function renderProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    const filteredProducts = currentCategory === 'all'
        ? products
        : products.filter(p => p.category === currentCategory);

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 1.2rem; color: #666;">Aucun produit dans cette catégorie.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const isTshirt = product.category === 'T-shirts';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
                    ${isTshirt ? '<div class="badge"><i class="fas fa-paint-brush"></i> Personnalisable</div>' : ''}
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-desc">${product.description}</p>
                        
                        ${isTshirt ? `
                        <div class="sizes">
                            <button class="size-btn selected" onclick="selectSize(this)">S</button>
                            <button class="size-btn" onclick="selectSize(this)">M</button>
                            <button class="size-btn" onclick="selectSize(this)">L</button>
                            <button class="size-btn" onclick="selectSize(this)">XL</button>
                            <button class="size-btn" onclick="selectSize(this)">XXL</button>
                        </div>
                        ` : ''}
                        
                        <div class="product-price">
                            ${formatPrice(product.priceDH, product.priceEUR)}
                        </div>
                        <button class="add-to-cart" onclick="addToCart('${product.id}', this)">
                            <i class="fas fa-shopping-cart"></i> Ajouter au panier
                        </button>
                    </div>
                `;
        productsGrid.appendChild(card);
    });
}

// Global function for size selection
window.selectSize = function (btn) {
    const siblings = btn.parentElement.querySelectorAll('.size-btn');
    siblings.forEach(s => s.classList.remove('selected'));
    btn.classList.add('selected');
};

// Filters logic
if (categoryFilters) {
    categoryFilters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryFilters.forEach(f => f.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderProducts();
        });
    });
}

// --- CART LOGIC ---
window.addToCart = function (productId, btnElement) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let size = null;
    if (product.category === 'T-shirts' && btnElement) {
        const sizeContainer = btnElement.parentElement.querySelector('.sizes');
        if (sizeContainer) {
            const selectedSizeBtn = sizeContainer.querySelector('.size-btn.selected');
            if (selectedSizeBtn) {
                size = selectedSizeBtn.innerText;
            }
        }
    }

    const cartItem = {
        ...product,
        cartItemId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        selectedSize: size
    };

    cart.push(cartItem);
    saveCart();
    updateCartCount();
    renderCart();

    openCart();
};

window.removeFromCart = function (cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart();
    updateCartCount();
    renderCart();
};

function updateCartCount() {
    if (cartCountEl) {
        cartCountEl.innerText = cart.length;

        if (cart.length > 0) {
            cartCountEl.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartCountEl.style.transform = 'scale(1)';
            }, 200);
        }
    }
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let totalDH = 0;
    let totalEUR = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
                    <div style="text-align:center; margin-top:3rem; color:#999;">
                        <i class="fas fa-shopping-basket" style="font-size: 4rem; margin-bottom: 1rem; color: #ddd;"></i>
                        <p style="font-size: 1.1rem;">Votre panier est vide.</p>
                    </div>
                `;
    } else {
        cart.forEach(item => {
            totalDH += Number(item.priceDH);
            totalEUR += Number(item.priceEUR);

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <div>
                                <div class="cart-item-title">${item.name}</div>
                                ${item.selectedSize ? `<div class="cart-item-meta">Taille: <strong>${item.selectedSize}</strong></div>` : ''}
                            </div>
                            <div class="cart-item-bottom">
                                <div class="cart-item-price">${formatPrice(item.priceDH, item.priceEUR)}</div>
                                <button class="cart-item-remove" onclick="removeFromCart('${item.cartItemId}')">
                                    <i class="fas fa-trash-alt"></i> Retirer
                                </button>
                            </div>
                        </div>
                    `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    if (cartTotalEl) cartTotalEl.innerText = formatPrice(totalDH, totalEUR);
    updateCartCount();
}

// Cart Sidebar Toggles
function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('show');
}

function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('show');
}

if (cartIcon) cartIcon.addEventListener('click', openCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if (cartOverlay) {
    cartOverlay.addEventListener('click', (e) => {
        if (checkoutModal && checkoutModal.classList.contains('show')) {
            closeCheckoutBtn.click();
        } else if (adminModal && adminModal.classList.contains('show')) {
            closeAdminBtn.click();
        } else if (confirmationModal && confirmationModal.classList.contains('show')) {
            closeConfirmBtn.click();
        } else {
            closeCart();
        }
    });
}

// Stop propagation inside modals to prevent closing when clicking content
if (checkoutModal) checkoutModal.addEventListener('click', (e) => e.stopPropagation());
if (adminModal) adminModal.addEventListener('click', (e) => e.stopPropagation());
if (confirmationModal) confirmationModal.addEventListener('click', (e) => e.stopPropagation());


// --- ADMIN LOGIC ---

// Hash detection for admin
function checkHash() {
    if (window.location.hash === '#admin') {
        loginOverlay.style.display = 'flex';
        window.history.replaceState(null, null, ' ');
    }
}
window.addEventListener('hashchange', checkHash);
if (window.location.hash === '#admin') checkHash();

// Secret trigger in footer
if (secretAdminTrigger) {
    secretAdminTrigger.addEventListener('click', () => {
        loginOverlay.style.display = 'flex';
    });
}

if (cancelLoginBtn) {
    cancelLoginBtn.addEventListener('click', () => {
        loginOverlay.style.display = 'none';
        adminPassword.value = '';
    });
}

// Enter key to login
if (adminPassword) {
    adminPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && loginBtn) loginBtn.click();
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: document.getElementById('adminEmail').value, password: adminPassword.value })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('amazigh_admin_token', data.token);
                loginOverlay.style.display = 'none';
                adminPassword.value = '';
                openAdmin();
            } else {
                alert('Identifiants incorrects ou admin non créé!');
            }
        } catch (err) {
            console.error(err);
            alert('Erreur de connexion au serveur');
        }
    });
}

function openAdmin() {
    adminModal.classList.add('show');
    cartOverlay.classList.add('show');
    renderAdminProducts();
}

function closeAdmin() {
    adminModal.classList.remove('show');
    cartOverlay.classList.remove('show');
    productForm.reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('saveProductBtn').innerHTML = '<i class="fas fa-plus"></i> Ajouter Produit';
    if (document.getElementById('pImagePreview')) {
        document.getElementById('pImagePreview').style.display = 'none';
        document.getElementById('pImagePreview').src = '';
        document.getElementById('pImageBase64').value = '';
    }
}

if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdmin);

function renderAdminProducts() {
    if (!adminProductsList) return;
    adminProductsList.innerHTML = '';
    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'admin-product-item';
        item.innerHTML = `
                    <div class="admin-product-info">
                        <img src="${product.image}" alt="${product.name}">
                        <div>
                            <strong style="font-size: 1.1rem; display:block;">${product.name}</strong>
                            <span style="color: #666; font-size: 0.9rem;">${product.category} • ${product.priceDH} DH / ${product.priceEUR} €</span>
                        </div>
                    </div>
                    <div class="admin-product-actions">
                        <button class="btn btn-primary" onclick="editProduct('${product.id}')" style="padding:8px 15px; font-size:0.9rem; margin-right:5px;">
                            <i class="fas fa-edit"></i> Éditer
                        </button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')" style="padding:8px 15px; font-size:0.9rem;">
                            <i class="fas fa-trash-alt"></i> Supprimer
                        </button>
                    </div>
                `;
        adminProductsList.appendChild(item);
    });
}

// --- IMAGE UPLOAD LOGIC ---
const imageUploadZone = document.getElementById('imageUploadZone');
const pImageFile = document.getElementById('pImageFile');
const pImagePreview = document.getElementById('pImagePreview');
const pImageBase64 = document.getElementById('pImageBase64');

if (imageUploadZone) {
    imageUploadZone.addEventListener('click', () => {
        pImageFile.click();
    });
}

if (pImageFile) {
    pImageFile.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                pImageBase64.value = event.target.result;
                pImagePreview.src = event.target.result;
                pImagePreview.style.display = 'inline-block';
            };
            reader.readAsDataURL(file);
        }
    });
}

if (productForm && pImageBase64) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

    const editId = document.getElementById('editProductId').value;

    if (!pImageBase64.value) {
        alert("Veuillez ajouter une image pour ce produit.");
        return;
    }

    const newProduct = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pCategory').value,
        price: Number(document.getElementById('pPriceDH').value),
        image: pImageBase64.value,
        description: document.getElementById('pDesc').value
    };

    try {
        const url = editId ? `${API_URL}/products/${editId}` : `${API_URL}/products`;
        const method = editId ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(newProduct)
        });
        const data = await res.json();
        
        if (data.success) {
            await fetchProducts();
            
            productForm.reset();
            document.getElementById('editProductId').value = '';
            document.getElementById('saveProductBtn').innerHTML = '<i class="fas fa-plus"></i> Ajouter Produit';
            pImagePreview.style.display = 'none';
            pImagePreview.src = '';
            pImageBase64.value = '';

            alert(editId ? 'Produit modifié avec succès!' : 'Produit ajouté avec succès!');
        } else {
            alert('Erreur: ' + data.error);
        }
        } catch(err) {
            console.error(err);
            alert('Erreur réseau');
        }
    });
}

window.deleteProduct = async function (id) {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
        try {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                await fetchProducts();
            } else {
                alert('Erreur: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Erreur réseau');
        }
    }
};

window.editProduct = function (id) {
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('editProductId').value = product.id;
        document.getElementById('pName').value = product.name;
        document.getElementById('pCategory').value = product.category;
        document.getElementById('pPriceDH').value = product.priceDH;
        document.getElementById('pPriceEUR').value = product.priceEUR;
        document.getElementById('pDesc').value = product.description;
        document.getElementById('saveProductBtn').innerHTML = '<i class="fas fa-save"></i> Enregistrer les modifications';

        // Image setup
        pImageBase64.value = product.image;
        pImagePreview.src = product.image;
        pImagePreview.style.display = 'inline-block';

        // Scroll to top of modal
        adminModal.scrollTo(0, 0);
    }
};

// --- CHECKOUT & ORDER LOGIC ---

function updateAdminBadge() {
    const pendingCount = orders.filter(o => o.status === 'En attente').length;
    adminOrderBadge.innerText = pendingCount;
    if (pendingCount > 0) {
        adminOrderBadge.style.display = 'inline-block';
    } else {
        adminOrderBadge.style.display = 'none';
    }
}

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
        alert('Votre panier est vide !');
        return;
    }
    closeCart();

    // Build summary
    checkoutOrderSummary.innerHTML = '';
    let totalDH = 0; let totalEUR = 0;
    cart.forEach(item => {
        totalDH += Number(item.priceDH);
        totalEUR += Number(item.priceEUR);
        checkoutOrderSummary.innerHTML += `
                    <div class="order-summary-item">
                        <span>${item.name} ${item.selectedSize ? '(' + item.selectedSize + ')' : ''}</span>
                        <strong>${formatPrice(item.priceDH, item.priceEUR)}</strong>
                    </div>
                `;
    });
    checkoutOrderSummary.innerHTML += `
                <div class="order-summary-item" style="border:none; font-size:1.2rem; margin-top:10px;">
                    <span><strong>Total:</strong></span>
                    <strong style="color:var(--primary-green);">${formatPrice(totalDH, totalEUR)}</strong>
                </div>
            `;

    // Reset AI & Stepper
    currentStep = 1;
    document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
    document.getElementById('stepContent1').classList.add('active');
    document.querySelectorAll('.step-item').forEach((item, index) => {
        item.classList.remove('active', 'completed');
        if (index === 0) item.classList.add('active');
    });
    document.getElementById('aiSuggestionOutput').innerHTML = '';
    document.getElementById('aiChatBox').innerHTML = '<div class="ai-msg bot">Bonjour ! Je suis Claude. Comment puis-je vous aider avec votre commande ?</div>';

        cartOverlay.classList.add('show');
        checkoutModal.classList.add('show');
    });
}

if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('show');
        cartOverlay.classList.remove('show');
    });
}

if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

    let totalDH = 0; let totalEUR = 0;
    cart.forEach(item => {
        totalDH += Number(item.priceDH);
        totalEUR += Number(item.priceEUR);
    });

    const orderId = '#AZ' + Math.floor(1000 + Math.random() * 9000);
    const customerName = document.getElementById('cName').value;
    const customerEmail = document.getElementById('cEmail').value;
    const customerPhone = document.getElementById('cPhone').value;
    const customerCity = document.getElementById('cCity').value;
    const customerAddr = document.getElementById('cAddress').value;
    const customerNotes = document.getElementById('cNotes').value;

    // Build cart summary string for Formspree
    const cartSummary = cart.map(item =>
        `${item.name}${item.selectedSize ? ' (' + item.selectedSize + ')' : ''} — ${item.priceDH} DH / ${item.priceEUR} €`
    ).join('\n');

    // --- Send to Formspree ---
    const payload = {
        _subject: `Nouvelle Commande ${orderId} - ${customerName}`,
        email: customerEmail,
        "Numéro de commande": orderId,
        "Nom client": customerName,
        "Téléphone": customerPhone,
        "Ville": customerCity,
        "Adresse": customerAddr,
        "Notes": customerNotes || 'Aucune',
        "Articles commandés": cartSummary,
        "Total (DH)": totalDH + ' DH',
        "Total (EUR)": totalEUR + ' €',
        "Date": new Date().toLocaleString('fr-FR')
    };

    fetch('https://formspree.io/f/xojrryrv', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).catch(err => console.warn('Formspree error:', err));
    // --- End Formspree ---

    const newOrder = {
        id: orderId,
        customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            city: customerCity,
            address: customerAddr,
            notes: customerNotes
        },
        items: [...cart],
        totalDH,
        totalEUR,
        date: new Date().toLocaleString('fr-FR'),
        status: 'En attente'
    };

    fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
    }).then(res => res.json())
      .then(data => {
          if (data.success) console.log('Order saved to DB');
      }).catch(err => console.error('Error saving order:', err));

    orders.unshift(newOrder);
    saveOrders();

    // Clear cart
    cart = [];
    saveCart();
    renderCart();
    updateAdminBadge();

    // Hide checkout, show confirm
    checkoutModal.classList.remove('show');
    checkoutForm.reset();

        confirmOrderId.innerText = newOrder.id;
        confirmOrderTotal.innerText = formatPrice(newOrder.totalDH, newOrder.totalEUR);
        confirmationModal.classList.add('show');
    });
}

if (closeConfirmBtn) {
    closeConfirmBtn.addEventListener('click', () => {
        confirmationModal.classList.remove('show');
        cartOverlay.classList.remove('show');
    });
}

// --- ADMIN TABS & ORDERS RENDERING ---

if (tabProducts) {
    tabProducts.addEventListener('click', () => {
        tabProducts.classList.add('active');
        tabOrders.classList.remove('active');
        adminProductsView.style.display = 'block';
        adminOrdersView.style.display = 'none';
    });
}

if (tabOrders) {
    tabOrders.addEventListener('click', () => {
        tabOrders.classList.add('active');
        tabProducts.classList.remove('active');
        adminOrdersView.style.display = 'block';
        adminProductsView.style.display = 'none';
        renderOrders();
    });
}

async function renderOrders() {
    adminOrdersList.innerHTML = '<p style="text-align:center;">Chargement...</p>';
    try {
        const res = await fetch(`${API_URL}/orders`, { headers: getAuthHeader() });
        const data = await res.json();
        if (data.success) {
            orders = data.data;
        }
    } catch(err) {
        console.error(err);
    }

    adminOrdersList.innerHTML = '';
    if (orders.length === 0) {
        adminOrdersList.innerHTML = '<p style="text-align:center; color:#999; padding:2rem;">Aucune commande pour le moment.</p>';
        return;
    }

    orders.forEach(order => {
        const orderEl = document.createElement('div');
        orderEl.className = 'admin-order-item';

        let statusClass = 'status-attente';
        if (order.status === 'Confirmée') statusClass = 'status-confirmee';
        if (order.status === 'Expédiée') statusClass = 'status-expediee';
        if (order.status === 'Livrée') statusClass = 'status-livree';

        let itemsHtml = order.items.map(i => `${i.name} ${i.selectedSize ? '(' + i.selectedSize + ')' : ''}`).join(', ');

        orderEl.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                        <div>
                            <strong style="color:var(--primary-red); font-size:1.2rem;">${order.id}</strong>
                            <span style="font-size:0.8rem; color:#888; margin-left:10px;"><i class="far fa-clock"></i> ${order.date}</span>
                        </div>
                        <span class="order-status ${statusClass}">${order.status}</span>
                    </div>
                    
                    <div style="margin-bottom:15px; font-size:0.95rem;">
                        <p><i class="fas fa-user"></i> <strong>${order.customer.name}</strong> • ${order.customer.phone}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${order.customer.city} — ${order.customer.address}</p>
                        ${order.customer.notes ? `<p><i class="fas fa-comment"></i> ${order.customer.notes}</p>` : ''}
                    </div>

                    <div style="background:#f9f9f9; padding:10px; border-radius:6px; font-size:0.9rem; margin-bottom:15px;">
                        <strong>Produits:</strong> ${itemsHtml}<br>
                        <strong style="color:var(--primary-green); font-size:1.1rem; display:block; margin-top:5px;">Total: ${order.totalDH} DH / ${order.totalEUR} €</strong>
                    </div>

                    <div style="display:flex; gap:10px; align-items:center;">
                        <select onchange="changeOrderStatus('${order.id}', this.value)" class="form-control" style="width:auto; padding:6px 10px; font-size:0.9rem;">
                            <option value="En attente" ${order.status === 'En attente' ? 'selected' : ''}>En attente</option>
                            <option value="Confirmée" ${order.status === 'Confirmée' ? 'selected' : ''}>Confirmée</option>
                            <option value="Expédiée" ${order.status === 'Expédiée' ? 'selected' : ''}>Expédiée</option>
                            <option value="Livrée" ${order.status === 'Livrée' ? 'selected' : ''}>Livrée</option>
                        </select>
                        
                        <button onclick="deleteOrder('${order.id}')" class="btn btn-danger" style="padding:6px 12px; font-size:0.9rem; margin-left:auto;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
        adminOrdersList.appendChild(orderEl);
    });
}

window.changeOrderStatus = async function (id, newStatus) {
    try {
        await fetch(`${API_URL}/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ status: newStatus })
        });
        await renderOrders();
        updateAdminBadge();
    } catch(err) {
        console.error(err);
    }
};

window.deleteOrder = async function (id) {
    if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
        try {
            await fetch(`${API_URL}/orders/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            await renderOrders();
            updateAdminBadge();
        } catch(err) {
            console.error(err);
        }
    }
};

// --- INIT CALLS ---
renderProducts();
renderCart();
updateAdminBadge();

// --- AI & STEPPER LOGIC ---
let currentStep = 1;

window.goStep = function (step) {
    // Basic validation for Step 1
    if (step > 1 && currentStep === 1) {
        if (!document.getElementById('cName').value || !document.getElementById('cEmail').value || !document.getElementById('cPhone').value || !document.getElementById('cCity').value || !document.getElementById('cAddress').value) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }
    }

    // Update UI
    document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`stepContent${step}`).classList.add('active');

    document.querySelectorAll('.step-item').forEach((item, index) => {
        const itemStep = index + 1;
        item.classList.remove('active', 'completed');
        if (itemStep === step) item.classList.add('active');
        if (itemStep < step) item.classList.add('completed');
    });

    currentStep = step;

    // AI Contextual Message
    if (step === 1) addAiMsg("bot", "Remplissez vos informations de livraison ci-dessous.");
    if (step === 2) addAiMsg("bot", "Vérifiez vos articles. Vous pouvez me demander des suggestions !");
    if (step === 3) addAiMsg("bot", "Voici votre récapitulatif professionnel généré par mes soins.");
}

// --- CLAUDE API FETCH ---
async function callClaude(prompt) {
    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1000,
                messages: [{ role: "user", content: prompt }]
            })
        });
        const data = await response.json();
        return data.content[0].text;
    } catch (err) {
        console.error("Claude Error:", err);
        return "Désolé, je rencontre une petite difficulté technique. Ɛafak, réessayez dans un instant.";
    }
}

// --- AI CHAT ---
const aiChatBox = document.getElementById('aiChatBox');
const aiInput = document.getElementById('aiInput');
const aiSendBtn = document.getElementById('aiSendBtn');

function addAiMsg(role, text) {
    const div = document.createElement('div');
    div.className = `ai-msg ${role}`;
    div.innerText = text;
    aiChatBox.appendChild(div);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
}

aiSendBtn.addEventListener('click', async () => {
    const val = aiInput.value.trim();
    if (!val) return;
    addAiMsg("user", val);
    aiInput.value = '';

    const reply = await callClaude(`L'utilisateur dit: "${val}". Contexte: Il est en train de passer commande sur "Amazigh Store". Réponds de manière concise en Français avec quelques mots de Darija.`);
    addAiMsg("bot", reply);
});

aiInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') aiSendBtn.click(); });

// --- STEP 2 SUGGESTIONS ---
const aiSuggestBtn = document.getElementById('aiSuggestBtn');
const aiSuggestionOutput = document.getElementById('aiSuggestionOutput');

aiSuggestBtn.addEventListener('click', async () => {
    aiSuggestBtn.disabled = true;
    aiSuggestBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyse en cours...';

    const itemsList = cart.map(i => `${i.name} (${i.category})`).join(', ');
    const prompt = `Voici les articles dans le panier du client: ${itemsList}. Suggère 2 ou 3 articles complémentaires ou des conseils de style Amazigh. Réponds en Français avec une touche de Darija. Sois bref.`;

    const suggestion = await callClaude(prompt);
    aiSuggestionOutput.innerHTML = `<div class="ai-suggestion-box">${suggestion}</div>`;

    aiSuggestBtn.disabled = false;
    aiSuggestBtn.innerHTML = '✨ Suggérer avec l\'IA';
    addAiMsg("bot", "J'ai quelques suggestions pour vous dans la section articles !");
});

// --- STEP 3 RECAP ---
window.prepareRecap = async function () {
    goStep(3);
    const recapDiv = document.getElementById('aiRecapContent');
    recapDiv.innerHTML = '<div style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Génération de votre récapitulatif par Claude...</div>';

    const clientInfo = {
        name: document.getElementById('cName').value,
        city: document.getElementById('cCity').value,
        address: document.getElementById('cAddress').value
    };
    const items = cart.map(i => `- ${i.name} (${i.priceDH} DH)`).join('\n');
    const total = document.getElementById('confirmOrderTotal') ? document.getElementById('confirmOrderTotal').innerText : 'DH';

    const prompt = `Génère une confirmation de commande professionnelle pour le client ${clientInfo.name} à ${clientInfo.city}. 
            Articles:
            ${items}
            
            Écris cela de manière chaleureuse en Français avec une touche de Darija marocaine. Inclut un mot sur l'artisanat Amazigh.`;

    const summary = await callClaude(prompt);
    recapDiv.innerText = summary;
    addAiMsg("bot", "Votre récapitulatif est prêt ! Bssaħa wa rraħa d'avance.");
}
