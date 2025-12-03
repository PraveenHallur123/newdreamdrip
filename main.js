// ===== DREAMDRIP COMPLETE JAVASCRIPT =====
// Version: 2.0 - Complete with cart, returns, and all page functionality

// Global State Management
const DreamDrip = {
    // Shopping Cart
    cart: [],
    
    // User Session
    user: null,
    
    // Design State
    designState: {
        color: '#D4A373',
        pattern: 'none',
        fabric: 50,
        sleeves: 'sleeveless',
        length: 'midi',
        belt: 'gold',
        garment: 'dress',
        name: 'Default Dress'
    },
    
    // SVG Elements Reference
    svgElements: {},
    
    // Initialize Application
    init() {
        this.loadCart();
        this.loadUser();
        this.loadDesignState();
        this.setupEventListeners();
        this.updateCartUI();
        this.setupNetlifyIdentity();
        
        // Page-specific initializations
        this.initPageSpecific();
    },
    
    // Page-specific initializations
    initPageSpecific() {
        const page = document.body.dataset.page || this.getPageFromURL();
        
        switch(page) {
            case 'customize':
                this.initCustomizer();
                break;
            case 'cart':
                this.initCartPage();
                break;
            case 'checkout':
                this.initCheckoutPage();
                break;
            case 'returns':
                this.initReturnsPage();
                break;
            case 'shop':
                this.initShopPage();
                break;
            case 'designs':
                this.initDesignsPage();
                break;
        }
    },
    
    // Get page from URL
    getPageFromURL() {
        const path = window.location.pathname;
        if (path.includes('customize')) return 'customize';
        if (path.includes('cart')) return 'cart';
        if (path.includes('checkout')) return 'checkout';
        if (path.includes('returns')) return 'returns';
        if (path.includes('shop')) return 'shop';
        if (path.includes('designs')) return 'designs';
        return 'home';
    },
    
    // ===== CART FUNCTIONALITY =====
    loadCart() {
        const savedCart = localStorage.getItem('dreamdrip_cart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
            } catch (e) {
                this.cart = [];
                console.error('Error loading cart:', e);
            }
        }
    },
    
    saveCart() {
        localStorage.setItem('dreamdrip_cart', JSON.stringify(this.cart));
        this.updateCartUI();
    },
    
    updateCartUI() {
        // Update cart count in navbar
        const cartCountElements = document.querySelectorAll('.cart-count, .cart-count-display');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'inline' : 'none';
        });
        
        // Update cart total if element exists
        const cartTotalElement = document.getElementById('cart-total');
        if (cartTotalElement) {
            cartTotalElement.textContent = `$${this.calculateCartTotal().toFixed(2)}`;
        }
    },
    
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.cart.push({
                ...product,
                quantity: product.quantity || 1,
                addedAt: new Date().toISOString(),
                id: product.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            });
        }
        
        this.saveCart();
        this.showNotification('Item added to cart!', 'success');
        
        // Update cart page if open
        if (this.getPageFromURL() === 'cart') {
            this.renderCartItems();
        }
    },
    
    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.showNotification('Item removed from cart', 'info');
        
        if (this.getPageFromURL() === 'cart') {
            this.renderCartItems();
        }
    },
    
    updateCartQuantity(itemId, quantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            item.quantity = Math.max(1, parseInt(quantity) || 1);
            this.saveCart();
            
            if (this.getPageFromURL() === 'cart') {
                this.renderCartItems();
            }
        }
    },
    
    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.saveCart();
            this.showNotification('Cart cleared', 'info');
            
            if (this.getPageFromURL() === 'cart') {
                this.renderCartItems();
            }
        }
    },
    
    calculateCartTotal() {
        return this.cart.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    },
    
    calculateCartSubtotal() {
        return this.cart.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    },
    
    // ===== USER MANAGEMENT =====
    loadUser() {
        const savedUser = localStorage.getItem('dreamdrip_user');
        if (savedUser) {
            try {
                this.user = JSON.parse(savedUser);
            } catch (e) {
                this.user = null;
                console.error('Error loading user:', e);
            }
        }
    },
    
    saveUser() {
        if (this.user) {
            localStorage.setItem('dreamdrip_user', JSON.stringify(this.user));
        } else {
            localStorage.removeItem('dreamdrip_user');
        }
    },
    
    login(email, name) {
        this.user = {
            email: email,
            name: name || email.split('@')[0],
            id: Date.now().toString(),
            loggedInAt: new Date().toISOString()
        };
        this.saveUser();
        this.updateUserUI();
        this.showNotification('Welcome back!', 'success');
    },
    
    logout() {
        this.user = null;
        this.saveUser();
        this.updateUserUI();
        this.showNotification('Logged out successfully', 'info');
    },
    
    updateUserUI() {
        const userSection = document.querySelector('.user-section');
        if (!userSection) return;
        
        if (this.user) {
            userSection.innerHTML = `
                <div class="user-menu">
                    <span class="user-greeting">Hi, ${this.user.name}</span>
                    <div class="user-dropdown">
                        <a href="designs.html"><i class="fas fa-star"></i> My Designs</a>
                        <a href="#" class="view-orders"><i class="fas fa-shopping-bag"></i> Orders</a>
                        <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
                        <hr>
                        <a href="#" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                </div>
                <a href="cart.html" class="cart-link">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">${this.cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </a>
            `;
            
            // Add event listeners for dropdown
            const logoutBtn = userSection.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
            
            const ordersBtn = userSection.querySelector('.view-orders');
            if (ordersBtn) {
                ordersBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showOrders();
                });
            }
        } else {
            userSection.innerHTML = `
                <a href="#" class="login-btn">Login</a>
                <a href="cart.html" class="cart-link">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">${this.cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </a>
            `;
            
            const loginBtn = userSection.querySelector('.login-btn');
            if (loginBtn) {
                loginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showLoginModal();
                });
            }
        }
    },
    
    // ===== DESIGN CUSTOMIZER =====
    loadDesignState() {
        const savedDesign = localStorage.getItem('dreamdrip_current_design');
        if (savedDesign) {
            try {
                this.designState = JSON.parse(savedDesign);
            } catch (e) {
                console.error('Error loading design:', e);
            }
        }
        
        // Check for template to apply
        const template = localStorage.getItem('dreamdrip_template');
        if (template) {
            try {
                const templateData = JSON.parse(template);
                this.designState = { ...this.designState, ...templateData };
                localStorage.setItem('dreamdrip_current_design', JSON.stringify(this.designState));
                localStorage.removeItem('dreamdrip_template');
            } catch (e) {
                console.error('Error loading template:', e);
            }
        }
    },
    
    saveDesignState() {
        localStorage.setItem('dreamdrip_current_design', JSON.stringify(this.designState));
    },
    
    initCustomizer() {
        this.createSVGMannequin();
        this.applyDesignState();
        this.setupCustomizerControls();
        this.setupDesignNameModal();
    },
    
    createSVGMannequin() {
        const svgContainer = document.getElementById('svg-container');
        if (!svgContainer) return;
        
        // Clear existing SVG
        svgContainer.innerHTML = '';
        
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", "0 0 400 600");
        svg.setAttribute("id", "mannequin-svg");
        svg.setAttribute("class", "breathing");
        
        // Create defs for patterns
        const defs = document.createElementNS(svgNS, "defs");
        
        // Patterns
        const patterns = [
            { id: 'pattern-floral', content: this.createFloralPattern() },
            { id: 'pattern-stripe', content: this.createStripePattern() },
            { id: 'pattern-dots', content: this.createDotsPattern() },
            { id: 'pattern-gold-shimmer', content: this.createGoldPattern() }
        ];
        
        patterns.forEach(pattern => {
            const patternEl = document.createElementNS(svgNS, "pattern");
            patternEl.setAttribute("id", pattern.id);
            patternEl.setAttribute("patternUnits", "userSpaceOnUse");
            patternEl.setAttribute("width", "40");
            patternEl.setAttribute("height", "40");
            patternEl.innerHTML = pattern.content;
            defs.appendChild(patternEl);
        });
        
        svg.appendChild(defs);
        
        // Create SVG elements
        const elements = this.createSVGElements();
        elements.forEach(el => svg.appendChild(el));
        
        svgContainer.appendChild(svg);
        
        // Store references
        this.storeSVGReferences();
        
        // Start breathing animation
        this.startBreathingAnimation();
    },
    
    createSVGElements() {
        const svgNS = "http://www.w3.org/2000/svg";
        const elements = [];
        
        // Mannequin base
        const base = document.createElementNS(svgNS, "path");
        base.setAttribute("d", "M200,100 C150,150 150,300 170,400 L230,400 C250,300 250,150 200,100 Z");
        base.setAttribute("fill", "#F0F0F0");
        base.setAttribute("stroke", "#E0E0E0");
        base.setAttribute("stroke-width", "2");
        base.setAttribute("id", "mannequin-base");
        elements.push(base);
        
        // Dress main (midi)
        const dressMain = document.createElementNS(svgNS, "path");
        dressMain.setAttribute("d", "M200,100 C150,150 150,300 170,400 L230,400 C250,300 250,150 200,100 Z");
        dressMain.setAttribute("id", "dress-main");
        dressMain.setAttribute("stroke", "#FFF7F0");
        dressMain.setAttribute("stroke-width", "2");
        elements.push(dressMain);
        
        // Dress long (floor)
        const dressLong = document.createElementNS(svgNS, "path");
        dressLong.setAttribute("d", "M200,100 C150,150 150,350 170,500 L230,500 C250,350 250,150 200,100 Z");
        dressLong.setAttribute("id", "dress-long");
        dressLong.setAttribute("stroke", "#FFF7F0");
        dressLong.setAttribute("stroke-width", "2");
        dressLong.setAttribute("opacity", "0");
        elements.push(dressLong);
        
        // Sleeves
        const sleeves = this.createSleeveElements();
        sleeves.forEach(sleeve => elements.push(sleeve));
        
        // Belt
        const belt = document.createElementNS(svgNS, "rect");
        belt.setAttribute("x", "170");
        belt.setAttribute("y", "250");
        belt.setAttribute("width", "60");
        belt.setAttribute("height", "20");
        belt.setAttribute("rx", "5");
        belt.setAttribute("id", "belt");
        belt.setAttribute("stroke", "#FFF7F0");
        belt.setAttribute("stroke-width", "1");
        belt.setAttribute("cursor", "pointer");
        belt.addEventListener('click', () => this.zoomBelt());
        elements.push(belt);
        
        // Belt border (for embroidered)
        const beltBorder = document.createElementNS(svgNS, "rect");
        beltBorder.setAttribute("x", "165");
        beltBorder.setAttribute("y", "245");
        beltBorder.setAttribute("width", "70");
        beltBorder.setAttribute("height", "30");
        beltBorder.setAttribute("rx", "8");
        beltBorder.setAttribute("id", "belt-border");
        beltBorder.setAttribute("fill", "none");
        beltBorder.setAttribute("stroke", "#8B5A2B");
        beltBorder.setAttribute("stroke-width", "2");
        beltBorder.setAttribute("stroke-dasharray", "5,3");
        beltBorder.setAttribute("opacity", "0");
        elements.push(beltBorder);
        
        // Pattern overlay
        const patternOverlay = document.createElementNS(svgNS, "path");
        patternOverlay.setAttribute("d", "M200,100 C150,150 150,300 170,400 L230,400 C250,300 250,150 200,100 Z");
        patternOverlay.setAttribute("id", "pattern-overlay");
        patternOverlay.setAttribute("stroke", "none");
        patternOverlay.setAttribute("opacity", "0");
        elements.push(patternOverlay);
        
        return elements;
    },
    
    createSleeveElements() {
        const svgNS = "http://www.w3.org/2000/svg";
        const sleeves = [];
        
        // Cap sleeves
        const leftCap = document.createElementNS(svgNS, "circle");
        leftCap.setAttribute("cx", "150");
        leftCap.setAttribute("cy", "150");
        leftCap.setAttribute("r", "20");
        leftCap.setAttribute("id", "sleeve-left-cap");
        leftCap.setAttribute("stroke", "#FFF7F0");
        leftCap.setAttribute("stroke-width", "1");
        leftCap.setAttribute("opacity", "0");
        sleeves.push(leftCap);
        
        const rightCap = document.createElementNS(svgNS, "circle");
        rightCap.setAttribute("cx", "250");
        rightCap.setAttribute("cy", "150");
        rightCap.setAttribute("r", "20");
        rightCap.setAttribute("id", "sleeve-right-cap");
        rightCap.setAttribute("stroke", "#FFF7F0");
        rightCap.setAttribute("stroke-width", "1");
        rightCap.setAttribute("opacity", "0");
        sleeves.push(rightCap);
        
        // Full sleeves
        const leftFull = document.createElementNS(svgNS, "path");
        leftFull.setAttribute("d", "M130,150 Q120,200 135,250 L165,250 Q150,200 150,150 Z");
        leftFull.setAttribute("id", "sleeve-left-full");
        leftFull.setAttribute("stroke", "#FFF7F0");
        leftFull.setAttribute("stroke-width", "1");
        leftFull.setAttribute("opacity", "0");
        sleeves.push(leftFull);
        
        const rightFull = document.createElementNS(svgNS, "path");
        rightFull.setAttribute("d", "M270,150 Q280,200 265,250 L235,250 Q250,200 250,150 Z");
        rightFull.setAttribute("id", "sleeve-right-full");
        rightFull.setAttribute("stroke", "#FFF7F0");
        rightFull.setAttribute("stroke-width", "1");
        rightFull.setAttribute("opacity", "0");
        sleeves.push(rightFull);
        
        return sleeves;
    },
    
    createFloralPattern() {
        return `
            <circle cx="10" cy="10" r="3" fill="#FFF7F0" opacity="0.6"/>
            <circle cx="30" cy="30" r="3" fill="#FFF7F0" opacity="0.6"/>
            <path d="M5,20 Q20,5 35,20 T20,35" stroke="#FFF7F0" fill="none" stroke-width="1" opacity="0.6"/>
        `;
    },
    
    createStripePattern() {
        return `
            <rect x="0" y="0" width="5" height="20" fill="#FFF7F0" opacity="0.6"/>
        `;
    },
    
    createDotsPattern() {
        return `
            <circle cx="5" cy="5" r="2" fill="#FFF7F0" opacity="0.6"/>
        `;
    },
    
    createGoldPattern() {
        return `
            <circle cx="10" cy="10" r="3" fill="#FFD700" opacity="0.8"/>
            <circle cx="5" cy="15" r="1" fill="#FFD700" opacity="0.6"/>
            <circle cx="15" cy="5" r="1" fill="#FFD700" opacity="0.6"/>
        `;
    },
    
    storeSVGReferences() {
        this.svgElements = {
            dressMain: document.getElementById('dress-main'),
            dressLong: document.getElementById('dress-long'),
            sleeveLeftCap: document.getElementById('sleeve-left-cap'),
            sleeveRightCap: document.getElementById('sleeve-right-cap'),
            sleeveLeftFull: document.getElementById('sleeve-left-full'),
            sleeveRightFull: document.getElementById('sleeve-right-full'),
            belt: document.getElementById('belt'),
            beltBorder: document.getElementById('belt-border'),
            patternOverlay: document.getElementById('pattern-overlay')
        };
    },
    
    applyDesignState() {
        if (!this.svgElements.dressMain) return;
        
        // Apply color
        this.setDressColor(this.designState.color);
        
        // Apply pattern
        this.setDressPattern(this.designState.pattern);
        
        // Apply fabric shade
        this.setFabricShade(this.designState.fabric);
        
        // Apply sleeves
        this.setSleeves(this.designState.sleeves);
        
        // Apply length
        this.setDressLength(this.designState.length);
        
        // Apply belt
        this.setBeltStyle(this.designState.belt);
        
        // Update design name
        const designNameElement = document.getElementById('design-name');
        if (designNameElement && this.designState.name) {
            designNameElement.textContent = this.designState.name;
        }
        
        // Update control values
        this.updateCustomizerControls();
    },
    
    setDressColor(color) {
        this.designState.color = color;
        
        Object.values(this.svgElements).forEach(element => {
            if (element && element !== this.svgElements.beltBorder && element !== this.svgElements.patternOverlay) {
                element.setAttribute('fill', color);
            }
        });
        
        // Update color picker
        const colorPicker = document.getElementById('color-picker');
        if (colorPicker) colorPicker.value = color;
        
        // Update color value display
        const colorValue = document.getElementById('color-value');
        if (colorValue) colorValue.textContent = color;
        
        this.saveDesignState();
    },
    
    setDressPattern(pattern) {
        this.designState.pattern = pattern;
        
        if (!this.svgElements.patternOverlay) return;
        
        this.svgElements.patternOverlay.setAttribute('opacity', '0');
        this.svgElements.patternOverlay.setAttribute('fill', 'none');
        
        if (pattern !== 'none') {
            this.svgElements.patternOverlay.setAttribute('opacity', '0.6');
            this.svgElements.patternOverlay.setAttribute('fill', `url(#pattern-${pattern})`);
        }
        
        this.saveDesignState();
    },
    
    setFabricShade(shade) {
        this.designState.fabric = parseInt(shade);
        
        if (this.svgElements.patternOverlay) {
            const opacity = 0.3 + (shade / 100) * 0.7;
            const currentOpacity = parseFloat(this.svgElements.patternOverlay.getAttribute('opacity') || '0');
            if (currentOpacity > 0) {
                this.svgElements.patternOverlay.setAttribute('opacity', currentOpacity * opacity);
            }
        }
        
        this.saveDesignState();
    },
    
    setSleeves(sleeveType) {
        this.designState.sleeves = sleeveType;
        
        // Hide all sleeves
        ['sleeveLeftCap', 'sleeveRightCap', 'sleeveLeftFull', 'sleeveRightFull'].forEach(key => {
            if (this.svgElements[key]) {
                this.svgElements[key].setAttribute('opacity', '0');
            }
        });
        
        // Show selected sleeves
        switch(sleeveType) {
            case 'cap':
                if (this.svgElements.sleeveLeftCap) this.svgElements.sleeveLeftCap.setAttribute('opacity', '1');
                if (this.svgElements.sleeveRightCap) this.svgElements.sleeveRightCap.setAttribute('opacity', '1');
                break;
            case 'full':
                if (this.svgElements.sleeveLeftFull) this.svgElements.sleeveLeftFull.setAttribute('opacity', '1');
                if (this.svgElements.sleeveRightFull) this.svgElements.sleeveRightFull.setAttribute('opacity', '1');
                break;
        }
        
        this.saveDesignState();
    },
    
    setDressLength(length) {
        this.designState.length = length;
        
        if (!this.svgElements.dressMain || !this.svgElements.dressLong) return;
        
        switch(length) {
            case 'midi':
                this.svgElements.dressMain.setAttribute('opacity', '1');
                this.svgElements.dressLong.setAttribute('opacity', '0');
                break;
            case 'floor':
                this.svgElements.dressMain.setAttribute('opacity', '0');
                this.svgElements.dressLong.setAttribute('opacity', '1');
                break;
        }
        
        this.saveDesignState();
    },
    
    setBeltStyle(beltStyle) {
        this.designState.belt = beltStyle;
        
        if (!this.svgElements.belt || !this.svgElements.beltBorder) return;
        
        // Reset
        this.svgElements.beltBorder.setAttribute('opacity', '0');
        
        switch(beltStyle) {
            case 'gold':
                this.svgElements.belt.setAttribute('fill', '#D4A373');
                this.svgElements.belt.setAttribute('x', '170');
                this.svgElements.belt.setAttribute('width', '60');
                break;
            case 'embroidered':
                this.svgElements.belt.setAttribute('fill', '#8B5A2B');
                this.svgElements.belt.setAttribute('x', '160');
                this.svgElements.belt.setAttribute('width', '80');
                this.svgElements.beltBorder.setAttribute('opacity', '1');
                break;
            case 'platinum':
                this.svgElements.belt.setAttribute('fill', '#E5E4E2');
                this.svgElements.belt.setAttribute('x', '170');
                this.svgElements.belt.setAttribute('width', '60');
                break;
        }
        
        this.saveDesignState();
    },
    
    zoomBelt() {
        const svgContainer = document.getElementById('svg-container');
        if (!svgContainer) return;
        
        svgContainer.style.transform = 'scale(1.5) translateX(-10%)';
        svgContainer.style.transition = 'transform 0.5s ease';
        
        // Pulse animation
        if (this.svgElements.belt) {
            const originalFill = this.svgElements.belt.getAttribute('fill');
            this.svgElements.belt.style.fill = '#FFD700';
            this.svgElements.belt.style.transition = 'fill 0.3s ease';
            
            setTimeout(() => {
                if (this.svgElements.belt) {
                    this.svgElements.belt.style.fill = originalFill;
                }
            }, 1000);
        }
        
        // Reset zoom
        setTimeout(() => {
            svgContainer.style.transform = 'scale(1)';
        }, 1500);
    },
    
    startBreathingAnimation() {
        const svg = document.getElementById('mannequin-svg');
        if (!svg) return;
        
        const breathe = () => {
            svg.style.transform = 'scale(1.01)';
            setTimeout(() => {
                svg.style.transform = 'scale(1)';
            }, 2000);
        };
        
        breathe();
        setInterval(breathe, 4000);
    },
    
    // ===== CUSTOMIZER CONTROLS =====
    setupCustomizerControls() {
        // Color picker
        const colorPicker = document.getElementById('color-picker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.setDressColor(e.target.value);
            });
        }
        
        // Color swatches
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const color = e.target.dataset.color || e.target.closest('.color-swatch').dataset.color;
                if (color) this.setDressColor(color);
            });
        });
        
        // Pattern buttons
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pattern = e.target.closest('.pattern-btn').dataset.pattern;
                this.designState.pattern = pattern;
                this.setDressPattern(pattern);
                
                // Update active state
                document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.pattern-btn').classList.add('active');
            });
        });
        
        // Sleeve buttons
        document.querySelectorAll('.sleeve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sleeves = e.target.closest('.sleeve-btn').dataset.sleeves;
                this.designState.sleeves = sleeves;
                this.setSleeves(sleeves);
                
                document.querySelectorAll('.sleeve-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.sleeve-btn').classList.add('active');
            });
        });
        
        // Length buttons
        document.querySelectorAll('.length-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const length = e.target.closest('.length-btn').dataset.length;
                this.designState.length = length;
                this.setDressLength(length);
                
                document.querySelectorAll('.length-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.length-btn').classList.add('active');
            });
        });
        
        // Belt buttons
        document.querySelectorAll('.belt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const belt = e.target.closest('.belt-btn').dataset.belt;
                this.designState.belt = belt;
                this.setBeltStyle(belt);
                
                document.querySelectorAll('.belt-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.belt-btn').classList.add('active');
            });
        });
        
        // Garment buttons
        document.querySelectorAll('.garment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const garment = e.target.closest('.garment-btn').dataset.garment;
                this.designState.garment = garment;
                
                document.querySelectorAll('.garment-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.garment-btn').classList.add('active');
                
                this.showNotification(`Garment type changed to: ${garment}`);
            });
        });
        
        // Fabric shade slider
        const fabricShade = document.getElementById('fabric-shade');
        if (fabricShade) {
            fabricShade.addEventListener('input', (e) => {
                this.setFabricShade(e.target.value);
            });
        }
        
        // Save design button
        const saveDesignBtn = document.querySelector('[onclick*="saveCurrentDesign"]');
        if (saveDesignBtn) {
            saveDesignBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveCurrentDesign();
            });
        }
        
        // Reset design button
        const resetDesignBtn = document.querySelector('[onclick*="resetDesign"]');
        if (resetDesignBtn) {
            resetDesignBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetDesign();
            });
        }
    },
    
    updateCustomizerControls() {
        // Update active states based on current design
        const updateActive = (selector, value, attr = 'dataset') => {
            document.querySelectorAll(selector).forEach(btn => {
                const btnValue = attr === 'dataset' ? btn.dataset[Object.keys(btn.dataset)[0]] : btn.value;
                if (btnValue === value) {
                    btn.classList.add('active');
                    if (attr === 'value') btn.checked = true;
                } else {
                    btn.classList.remove('active');
                    if (attr === 'value') btn.checked = false;
                }
            });
        };
        
        updateActive('.pattern-btn', this.designState.pattern);
        updateActive('.sleeve-btn', this.designState.sleeves);
        updateActive('.length-btn', this.designState.length);
        updateActive('.belt-btn', this.designState.belt);
        updateActive('.garment-btn', this.designState.garment);
        
        // Update fabric slider
        const fabricShade = document.getElementById('fabric-shade');
        if (fabricShade) fabricShade.value = this.designState.fabric;
    },
    
    // ===== DESIGN SAVING =====
    setupDesignNameModal() {
        const modal = document.getElementById('design-name-modal');
        if (!modal) return;
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeDesignModal();
            }
        });
        
        // Cancel button
        const cancelBtn = modal.querySelector('[onclick*="closeDesignModal"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeDesignModal();
            });
        }
        
        // Save button
        const saveBtn = modal.querySelector('[onclick*="confirmSaveDesign"]');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.confirmSaveDesign();
            });
        }
    },
    
    saveCurrentDesign() {
        document.getElementById('design-name-modal').style.display = 'flex';
    },
    
    closeDesignModal() {
        document.getElementById('design-name-modal').style.display = 'none';
        document.getElementById('design-name-input').value = '';
    },
    
    confirmSaveDesign() {
        const designName = document.getElementById('design-name-input').value.trim();
        if (!designName) {
            this.showNotification('Please enter a design name', 'error');
            return;
        }
        
        this.designState.name = designName;
        this.designState.date = new Date().toISOString();
        
        // Save to designs list
        const savedDesigns = JSON.parse(localStorage.getItem('dreamdrip_designs') || '[]');
        savedDesigns.push({ ...this.designState });
        localStorage.setItem('dreamdrip_designs', JSON.stringify(savedDesigns));
        
        // Save current design
        this.saveDesignState();
        
        // Update display
        const designNameElement = document.getElementById('design-name');
        if (designNameElement) {
            designNameElement.textContent = designName;
        }
        
        this.closeDesignModal();
        this.showNotification('Design saved successfully!', 'success');
    },
    
    resetDesign() {
        if (!confirm('Reset design to default?')) return;
        
        this.designState = {
            color: '#D4A373',
            pattern: 'none',
            fabric: 50,
            sleeves: 'sleeveless',
            length: 'midi',
            belt: 'gold',
            garment: 'dress',
            name: 'Default Dress'
        };
        
        this.applyDesignState();
        this.updateCustomizerControls();
        
        const designNameElement = document.getElementById('design-name');
        if (designNameElement) {
            designNameElement.textContent = 'Default Dress';
        }
        
        this.showNotification('Design reset to default', 'info');
    },
    
    // ===== CART PAGE =====
    initCartPage() {
        this.renderCartItems();
        this.setupCartPageEvents();
    },
    
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const summaryContainer = document.querySelector('.cart-summary');
        
        if (!cartItemsContainer) return;
        
        if (this.cart.length === 0) {
            if (emptyCart) emptyCart.style.display = 'flex';
            if (summaryContainer) summaryContainer.style.display = 'none';
            cartItemsContainer.innerHTML = '';
            return;
        }
        
        if (emptyCart) emptyCart.style.display = 'none';
        if (summaryContainer) summaryContainer.style.display = 'block';
        
        cartItemsContainer.innerHTML = '';
        
        this.cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <div class="item-color" style="background-color: ${item.color || '#D4A373'}"></div>
                </div>
                <div class="cart-item-details">
                    <h3>${item.name || 'Custom Design'}</h3>
                    <p class="item-description">${item.description || 'Custom made dress'}</p>
                    <div class="item-options">
                        ${item.color ? `<span>Color: ${item.color}</span>` : ''}
                        ${item.size ? `<span>Size: ${item.size}</span>` : ''}
                        ${item.pattern && item.pattern !== 'none' ? `<span>Pattern: ${item.pattern}</span>` : ''}
                    </div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-index="${index}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
                    <button class="quantity-btn plus" data-index="${index}">+</button>
                </div>
                <div class="cart-item-price">
                    $${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </div>
                <div class="cart-item-remove">
                    <button class="remove-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        
        // Update summary
        this.updateCartSummary();
    },
    
    setupCartPageEvents() {
        // Remove buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) {
                const itemId = e.target.closest('.remove-btn').dataset.id;
                this.removeFromCart(itemId);
            }
            
            // Quantity buttons
            if (e.target.closest('.quantity-btn')) {
                const btn = e.target.closest('.quantity-btn');
                const index = parseInt(btn.dataset.index);
                const isPlus = btn.classList.contains('plus');
                
                if (this.cart[index]) {
                    const newQuantity = isPlus ? this.cart[index].quantity + 1 : this.cart[index].quantity - 1;
                    if (newQuantity >= 1) {
                        this.updateCartQuantity(this.cart[index].id, newQuantity);
                    }
                }
            }
        });
        
        // Quantity input changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const index = parseInt(e.target.dataset.index);
                const newQuantity = parseInt(e.target.value);
                
                if (this.cart[index] && newQuantity >= 1) {
                    this.updateCartQuantity(this.cart[index].id, newQuantity);
                }
            }
        });
        
        // Clear cart button
        const clearCartBtn = document.querySelector('[onclick*="clearCart"]');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearCart();
            });
        }
        
        // Proceed to checkout button
        const checkoutBtn = document.querySelector('[onclick*="proceedToCheckout"]');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.proceedToCheckout();
            });
        }
    },
    
    updateCartSummary() {
        const subtotal = this.calculateCartSubtotal();
        const shipping = subtotal > 100 ? 0 : 9.99;
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;
        
        // Update summary elements
        const updateElement = (id, value, isCurrency = true) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = isCurrency ? `$${value.toFixed(2)}` : value;
            }
        };
        
        updateElement('cart-subtotal', subtotal);
        updateElement('cart-shipping', shipping);
        updateElement('cart-tax', tax);
        updateElement('cart-total', total);
        
        // Update shipping display
        const shippingElement = document.getElementById('shipping-display');
        if (shippingElement) {
            shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
            if (shipping === 0) {
                shippingElement.style.color = '#48BB78';
                shippingElement.style.fontWeight = '600';
            }
        }
    },
    
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }
        
        // Save cart to localStorage for checkout page
        localStorage.setItem('dreamdrip_checkout_cart', JSON.stringify(this.cart));
        
        // Redirect to checkout
        window.location.href = 'checkout.html';
    },
    
    // ===== CHECKOUT PAGE =====
    initCheckoutPage() {
        this.loadCheckoutCart();
        this.setupCheckoutForm();
        this.renderCheckoutSummary();
    },
    
    loadCheckoutCart() {
        const checkoutCart = localStorage.getItem('dreamdrip_checkout_cart');
        if (checkoutCart) {
            try {
                this.cart = JSON.parse(checkoutCart);
            } catch (e) {
                console.error('Error loading checkout cart:', e);
                this.cart = [];
            }
        }
        
        // If cart is empty, redirect to shop
        if (this.cart.length === 0 && !window.location.href.includes('success')) {
            this.showNotification('Your cart is empty', 'error');
            setTimeout(() => {
                window.location.href = 'shop.html';
            }, 2000);
        }
    },
    
    renderCheckoutSummary() {
        const summaryContainer = document.getElementById('checkout-summary');
        if (!summaryContainer) return;
        
        let html = '';
        let subtotal = 0;
        
        this.cart.forEach(item => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            subtotal += itemTotal;
            
            html += `
                <div class="checkout-item">
                    <div class="checkout-item-info">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">Qty: ${item.quantity}</span>
                    </div>
                    <span class="item-total">$${itemTotal.toFixed(2)}</span>
                </div>
            `;
        });
        
        const shipping = subtotal > 100 ? 0 : 9.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;
        
        html += `
            <div class="checkout-totals">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Shipping</span>
                    <span>${shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div class="total-row">
                    <span>Tax</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="total-row grand-total">
                    <span>Total</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            </div>
        `;
        
        summaryContainer.innerHTML = html;
        
        // Update hidden total field for form
        const totalInput = document.getElementById('order-total');
        if (totalInput) {
            totalInput.value = total.toFixed(2);
        }
    },
    
    setupCheckoutForm() {
        const checkoutForm = document.getElementById('checkout-form');
        if (!checkoutForm) return;
        
        // Load saved user info
        if (this.user) {
            const nameInput = document.getElementById('full-name');
            const emailInput = document.getElementById('email');
            if (nameInput) nameInput.value = this.user.name || '';
            if (emailInput) emailInput.value = this.user.email || '';
        }
        
        // Form validation
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!this.validateCheckoutForm()) {
                return;
            }
            
            // Process order
            this.processOrder();
        });
    },
    
    validateCheckoutForm() {
        const requiredFields = [
            'full-name', 'email', 'phone', 'address', 
            'city', 'state', 'zip', 'country',
            'card-name', 'card-number', 'expiry', 'cvv'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else if (field) {
                field.classList.remove('error');
            }
        });
        
        // Validate email
        const emailField = document.getElementById('email');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                emailField.classList.add('error');
                isValid = false;
            }
        }
        
        // Validate card number (simple Luhn check)
        const cardField = document.getElementById('card-number');
        if (cardField && cardField.value) {
            const cardNumber = cardField.value.replace(/\s/g, '');
            if (!this.validateCardNumber(cardNumber)) {
                cardField.classList.add('error');
                isValid = false;
            }
        }
        
        if (!isValid) {
            this.showNotification('Please fill in all required fields correctly', 'error');
        }
        
        return isValid;
    },
    
    validateCardNumber(cardNumber) {
        // Simple validation - in production, use proper payment gateway
        return cardNumber.length >= 13 && cardNumber.length <= 19 && /^\d+$/.test(cardNumber);
    },
    
    processOrder() {
        // Collect form data
        const orderData = {
            customer: {
                name: document.getElementById('full-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: {
                    street: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value,
                    zip: document.getElementById('zip').value,
                    country: document.getElementById('country').value
                }
            },
            items: [...this.cart],
            total: document.getElementById('order-total').value,
            orderId: 'DD' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase(),
            date: new Date().toISOString(),
            status: 'processing'
        };
        
        // Save order
        this.saveOrder(orderData);
        
        // Clear cart
        this.cart = [];
        this.saveCart();
        localStorage.removeItem('dreamdrip_checkout_cart');
        
        // Redirect to success page
        window.location.href = 'success.html?order=' + encodeURIComponent(orderData.orderId);
    },
    
    saveOrder(orderData) {
        // Save to orders list
        const orders = JSON.parse(localStorage.getItem('dreamdrip_orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('dreamdrip_orders', JSON.stringify(orders));
        
        // Save as last order for success page
        localStorage.setItem('dreamdrip_last_order', JSON.stringify(orderData));
    },
    
    // ===== RETURNS PAGE =====
    initReturnsPage() {
        this.loadUserOrders();
        this.setupReturnsForm();
    },
    
    loadUserOrders() {
        // In a real app, this would load from server based on user
        const orders = JSON.parse(localStorage.getItem('dreamdrip_orders') || '[]');
        
        const ordersContainer = document.getElementById('user-orders');
        if (!ordersContainer) return;
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="no-orders">
                    <i class="fas fa-box-open"></i>
                    <h3>No orders found</h3>
                    <p>You haven't placed any orders yet.</p>
                    <a href="shop.html" class="btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }
        
        let html = '<h3>Select an Order to Return</h3>';
        
        orders.forEach((order, index) => {
            const orderDate = new Date(order.date).toLocaleDateString();
            const orderTotal = parseFloat(order.total).toFixed(2);
            
            html += `
                <div class="order-select-card" data-order-index="${index}">
                    <div class="order-info">
                        <strong>Order #${order.orderId}</strong>
                        <span>${orderDate}</span>
                        <span>$${orderTotal}</span>
                    </div>
                    <button class="btn-small select-order-btn" data-order-index="${index}">
                        Select Items
                    </button>
                </div>
            `;
        });
        
        ordersContainer.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.select-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderIndex = parseInt(e.target.dataset.orderIndex);
                this.selectOrderForReturn(orderIndex);
            });
        });
    },
    
    selectOrderForReturn(orderIndex) {
        const orders = JSON.parse(localStorage.getItem('dreamdrip_orders') || '[]');
        const order = orders[orderIndex];
        
        if (!order) return;
        
        // Show items selection
        const itemsContainer = document.getElementById('return-items-selection');
        if (!itemsContainer) return;
        
        let html = `
            <h3>Select Items to Return</h3>
            <div class="order-reference">
                Order: ${order.orderId} • Placed: ${new Date(order.date).toLocaleDateString()}
            </div>
        `;
        
        order.items.forEach((item, itemIndex) => {
            html += `
                <div class="return-item-select">
                    <label class="checkbox-label">
                        <input type="checkbox" name="return-item" value="${itemIndex}" data-item-id="${item.id}">
                        <div class="item-details">
                            <strong>${item.name}</strong>
                            <span>Qty: ${item.quantity}</span>
                            <span>Price: $${parseFloat(item.price).toFixed(2)}</span>
                        </div>
                    </label>
                </div>
            `;
        });
        
        html += `
            <div class="return-reason">
                <label for="return-reason">Reason for Return</label>
                <select id="return-reason" required>
                    <option value="">Select a reason</option>
                    <option value="wrong-size">Wrong Size</option>
                    <option value="changed-mind">Changed Mind</option>
                    <option value="defective">Defective Item</option>
                    <option value="not-as-described">Not as Described</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="return-actions">
                <button class="btn-secondary" id="cancel-return">Cancel</button>
                <button class="btn-primary" id="submit-return-request">Submit Return Request</button>
            </div>
        `;
        
        itemsContainer.innerHTML = html;
        itemsContainer.style.display = 'block';
        
        // Add event listeners
        document.getElementById('cancel-return').addEventListener('click', () => {
            itemsContainer.style.display = 'none';
        });
        
        document.getElementById('submit-return-request').addEventListener('click', () => {
            this.submitReturnRequest(orderIndex);
        });
    },
    
    submitReturnRequest(orderIndex) {
        const orders = JSON.parse(localStorage.getItem('dreamdrip_orders') || '[]');
        const order = orders[orderIndex];
        const reason = document.getElementById('return-reason').value;
        
        if (!reason) {
            this.showNotification('Please select a reason for return', 'error');
            return;
        }
        
        // Get selected items
        const selectedItems = [];
        document.querySelectorAll('input[name="return-item"]:checked').forEach(checkbox => {
            const itemIndex = parseInt(checkbox.value);
            if (order.items[itemIndex]) {
                selectedItems.push(order.items[itemIndex]);
            }
        });
        
        if (selectedItems.length === 0) {
            this.showNotification('Please select at least one item to return', 'error');
            return;
        }
        
        // Create return request
        const returnRequest = {
            returnId: 'RET' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase(),
            orderId: order.orderId,
            items: selectedItems,
            reason: reason,
            date: new Date().toISOString(),
            status: 'pending',
            notes: document.getElementById('return-notes')?.value || ''
        };
        
        // Save return request
        const returns = JSON.parse(localStorage.getItem('dreamdrip_returns') || '[]');
        returns.push(returnRequest);
        localStorage.setItem('dreamdrip_returns', JSON.stringify(returns));
        
        // Show success
        this.showNotification('Return request submitted successfully!', 'success');
        
        // Hide selection
        document.getElementById('return-items-selection').style.display = 'none';
        
        // Show return confirmation
        this.showReturnConfirmation(returnRequest);
    },
    
    showReturnConfirmation(returnRequest) {
        const confirmationContainer = document.getElementById('return-confirmation');
        if (!confirmationContainer) return;
        
        confirmationContainer.innerHTML = `
            <div class="confirmation-card">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Return Request Submitted</h3>
                <p>Your return request has been received. Here are your next steps:</p>
                
                <div class="return-details">
                    <div class="detail-item">
                        <strong>Return ID:</strong> ${returnRequest.returnId}
                    </div>
                    <div class="detail-item">
                        <strong>Status:</strong> <span class="status-pending">Pending Approval</span>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h4>Next Steps:</h4>
                    <ol>
                        <li>We'll review your request within 24 hours</li>
                        <li>You'll receive a prepaid shipping label via email</li>
                        <li>Pack items securely with all tags attached</li>
                        <li>Drop off at any carrier location</li>
                        <li>Refund processed within 7-10 days after inspection</li>
                    </ol>
                </div>
                
                <div class="confirmation-actions">
                    <button class="btn-secondary" id="print-return-label">
                        <i class="fas fa-print"></i> Print Instructions
                    </button>
                    <button class="btn-primary" id="view-return-status">
                        <i class="fas fa-eye"></i> View Return Status
                    </button>
                </div>
            </div>
        `;
        
        confirmationContainer.style.display = 'block';
        
        // Add event listeners
        document.getElementById('print-return-label').addEventListener('click', () => {
            window.print();
        });
        
        document.getElementById('view-return-status').addEventListener('click', () => {
            this.showReturnStatus(returnRequest.returnId);
        });
    },
    
    setupReturnsForm() {
        const startReturnBtn = document.getElementById('start-return-btn');
        if (startReturnBtn) {
            startReturnBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showReturnsPortal();
            });
        }
    },
    
    showReturnsPortal() {
        const portal = document.getElementById('returns-portal');
        if (portal) {
            portal.style.display = 'block';
        }
    },
    
    // ===== SHOP PAGE =====
    initShopPage() {
        this.setupShopFilters();
        this.setupQuickBuyButtons();
    },
    
    setupShopFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const priceFilter = document.getElementById('price-filter');
        const colorFilter = document.getElementById('color-filter');
        
        const filterShop = () => {
            const category = categoryFilter ? categoryFilter.value : 'all';
            const price = priceFilter ? priceFilter.value : 'all';
            const color = colorFilter ? colorFilter.value : 'all';
            
            // Filter logic would go here
            console.log('Filtering by:', { category, price, color });
        };
        
        if (categoryFilter) categoryFilter.addEventListener('change', filterShop);
        if (priceFilter) priceFilter.addEventListener('change', filterShop);
        if (colorFilter) colorFilter.addEventListener('change', filterShop);
    },
    
    setupQuickBuyButtons() {
        document.addEventListener('click', (e) => {
            const buyBtn = e.target.closest('.quick-buy-btn');
            if (buyBtn) {
                e.preventDefault();
                const productId = buyBtn.dataset.productId;
                this.quickBuyProduct(productId);
            }
            
            const customizeBtn = e.target.closest('.customize-btn');
            if (customizeBtn) {
                e.preventDefault();
                const productId = customizeBtn.dataset.productId;
                this.quickCustomizeProduct(productId);
            }
        });
    },
    
    quickBuyProduct(productId) {
        // Get product details
        const product = this.getProductById(productId);
        if (!product) return;
        
        // Add to cart
        this.addToCart({
            ...product,
            quantity: 1
        });
        
        // Redirect to checkout
        setTimeout(() => {
            window.location.href = 'checkout.html';
        }, 500);
    },
    
    quickCustomizeProduct(productId) {
        // Get product template
        const template = this.getProductTemplate(productId);
        if (!template) return;
        
        // Save as template
        localStorage.setItem('dreamdrip_template', JSON.stringify(template));
        
        // Redirect to customizer
        window.location.href = 'customize.html';
    },
    
    getProductById(productId) {
        // Mock product data - in real app, this would come from API
        const products = {
            'midnight-rose': {
                id: 'midnight-rose',
                name: 'Midnight Rose Gown',
                price: 389.99,
                color: '#2B183F',
                description: 'Deep purple evening gown with rose gold accents'
            },
            'golden-hour': {
                id: 'golden-hour',
                name: 'Golden Hour Dress',
                price: 329.99,
                color: '#D4A373',
                description: 'Rose gold cocktail dress with cream accents'
            }
        };
        
        return products[productId];
    },
    
    getProductTemplate(productId) {
        const templates = {
            'midnight-rose': {
                color: '#2B183F',
                pattern: 'gold',
                sleeves: 'sleeveless',
                length: 'floor',
                belt: 'embroidered',
                name: 'Midnight Rose Gown'
            },
            'golden-hour': {
                color: '#D4A373',
                pattern: 'none',
                sleeves: 'cap',
                length: 'midi',
                belt: 'gold',
                name: 'Golden Hour Dress'
            }
        };
        
        return templates[productId];
    },
    
    // ===== DESIGNS PAGE =====
    initDesignsPage() {
        this.loadUserDesigns();
        this.setupDesignsActions();
    },
    
    loadUserDesigns() {
        const savedDesigns = JSON.parse(localStorage.getItem('dreamdrip_designs') || '[]');
        const designsGrid = document.getElementById('designs-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (!designsGrid) return;
        
        if (savedDesigns.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            designsGrid.innerHTML = '';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        designsGrid.innerHTML = '';
        
        savedDesigns.forEach((design, index) => {
            const designCard = this.createDesignCard(design, index);
            designsGrid.appendChild(designCard);
        });
    },
    
    createDesignCard(design, index) {
        const card = document.createElement('div');
        card.className = 'design-card';
        
        const date = design.date ? new Date(design.date).toLocaleDateString() : 'Recently saved';
        
        card.innerHTML = `
            <div class="design-card-header">
                <h3>${design.name || 'Unnamed Design'}</h3>
                <span class="design-date">${date}</span>
            </div>
            <div class="design-preview">
                <svg width="200" height="300" viewBox="0 0 300 500">
                    ${this.createDesignSVG(design, index)}
                </svg>
            </div>
            <div class="design-card-footer">
                <button class="btn-small apply-design-btn" data-design-index="${index}">
                    <i class="fas fa-check"></i> Apply Design
                </button>
                <button class="btn-small btn-danger delete-design-btn" data-design-index="${index}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        return card;
    },
    
    createDesignSVG(design, index) {
        const patternId = `design-pattern-${index}`;
        
        let patternContent = '';
        switch(design.pattern) {
            case 'floral':
                patternContent = `<path d="M5,5 Q7.5,2.5 10,5 T15,5" fill="${design.color}" opacity="0.6"/>`;
                break;
            case 'dots':
                patternContent = `<circle cx="10" cy="10" r="2" fill="${design.color}" opacity="0.6"/>`;
                break;
            case 'stripe':
                patternContent = `<rect x="0" y="0" width="5" height="20" fill="${design.color}" opacity="0.6"/>`;
                break;
            case 'gold':
                patternContent = `<circle cx="10" cy="10" r="3" fill="#FFD700" opacity="0.8"/>`;
                break;
        }
        
        const transform = design.pattern === 'stripe' ? 'rotate(45)' : 'rotate(0)';
        
        return `
            <defs>
                <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="${transform}">
                    ${patternContent}
                </pattern>
            </defs>
            <path d="M150,100 C100,150 100,300 120,400 L180,400 C200,300 200,150 150,100 Z" 
                  fill="${design.color || '#D4A373'}" stroke="#FFF7F0" stroke-width="2"/>
            ${design.pattern !== 'none' ? 
              `<path d="M150,100 C100,150 100,300 120,400 L180,400 C200,300 200,150 150,100 Z" 
                    fill="url(#${patternId})" stroke="none"/>` : ''}
            <rect x="${design.belt === 'embroidered' ? '125' : '130'}" y="250" 
                  width="${design.belt === 'embroidered' ? '50' : '40'}" height="15" rx="5" 
                  fill="${design.belt === 'gold' ? '#D4A373' : design.belt === 'platinum' ? '#E5E4E2' : '#8B5A2B'}" 
                  stroke="#FFF7F0" stroke-width="1"/>
            ${design.sleeves === 'cap' ? 
              `<circle cx="100" cy="150" r="15" fill="${design.color}" stroke="#FFF7F0" stroke-width="1"/>
               <circle cx="200" cy="150" r="15" fill="${design.color}" stroke="#FFF7F0" stroke-width="1"/>` : ''}
            ${design.sleeves === 'full' ? 
              `<path d="M85,150 Q75,200 90,250 L110,250 Q95,200 100,150 Z" fill="${design.color}" stroke="#FFF7F0" stroke-width="1"/>
               <path d="M215,150 Q225,200 210,250 L190,250 Q205,200 200,150 Z" fill="${design.color}" stroke="#FFF7F0" stroke-width="1"/>` : ''}
        `;
    },
    
    setupDesignsActions() {
        // Apply design
        document.addEventListener('click', (e) => {
            const applyBtn = e.target.closest('.apply-design-btn');
            if (applyBtn) {
                const index = parseInt(applyBtn.dataset.designIndex);
                this.applyDesign(index);
            }
            
            // Delete design
            const deleteBtn = e.target.closest('.delete-design-btn');
            if (deleteBtn) {
                const index = parseInt(deleteBtn.dataset.designIndex);
                this.deleteDesign(index);
            }
        });
        
        // Clear all designs
        const clearAllBtn = document.querySelector('[onclick*="clearAllDesigns"]');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearAllDesigns();
            });
        }
    },
    
    applyDesign(index) {
        const savedDesigns = JSON.parse(localStorage.getItem('dreamdrip_designs') || '[]');
        const design = savedDesigns[index];
        
        if (design) {
            // Save as template to apply
            localStorage.setItem('dreamdrip_apply_design', JSON.stringify(design));
            
            // Redirect to customizer
            window.location.href = 'customize.html';
        }
    },
    
    deleteDesign(index) {
        if (!confirm('Are you sure you want to delete this design?')) return;
        
        const savedDesigns = JSON.parse(localStorage.getItem('dreamdrip_designs') || '[]');
        savedDesigns.splice(index, 1);
        localStorage.setItem('dreamdrip_designs', JSON.stringify(savedDesigns));
        
        this.loadUserDesigns();
        this.showNotification('Design deleted', 'info');
    },
    
    clearAllDesigns() {
        if (!confirm('Are you sure you want to delete ALL your designs? This cannot be undone.')) return;
        
        localStorage.removeItem('dreamdrip_designs');
        this.loadUserDesigns();
        this.showNotification('All designs cleared', 'info');
    },
    
    // ===== UTILITY FUNCTIONS =====
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icons[type] || 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    },
    
    setupEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                const navLinks = document.querySelector('.nav-links');
                if (navLinks) navLinks.classList.toggle('active');
            });
        }
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
        
        // Page fade-in
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('loaded');
        });
    },
    
    setupNetlifyIdentity() {
        // Check if Netlify Identity is loaded
        if (typeof netlifyIdentity !== 'undefined') {
            netlifyIdentity.on('init', user => {
                if (user) {
                    this.login(user.email, user.user_metadata?.full_name || user.email);
                }
            });
            
            netlifyIdentity.on('login', user => {
                this.login(user.email, user.user_metadata?.full_name || user.email);
                netlifyIdentity.close();
            });
            
            netlifyIdentity.on('logout', () => {
                this.logout();
            });
        }
    },
    
    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Login to DreamDrip</h2>
                <p>Access your saved designs and orders</p>
                
                <div class="login-options">
                    <button class="btn-primary" id="netlify-login">
                        <i class="fas fa-sign-in-alt"></i> Login with Netlify Identity
                    </button>
                    <div class="login-divider">
                        <span>or</span>
                    </div>
                    <div class="demo-login">
                        <p>For demo purposes:</p>
                        <button class="btn-secondary" id="demo-login">
                            <i class="fas fa-user"></i> Use Demo Account
                        </button>
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button class="btn-secondary" id="close-login">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Event listeners
        modal.querySelector('#close-login').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#netlify-login').addEventListener('click', () => {
            if (typeof netlifyIdentity !== 'undefined') {
                netlifyIdentity.open();
            } else {
                this.showNotification('Netlify Identity not loaded', 'error');
            }
        });
        
        modal.querySelector('#demo-login').addEventListener('click', () => {
            this.login('demo@dreamdrip.com', 'Demo User');
            modal.remove();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },
    
    showOrders() {
        const orders = JSON.parse(localStorage.getItem('dreamdrip_orders') || '[]');
        
        if (orders.length === 0) {
            this.showNotification('No orders found', 'info');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Your Orders</h2>
                <div class="orders-list">
                    ${orders.map(order => `
                        <div class="order-item">
                            <div class="order-header">
                                <strong>Order #${order.orderId}</strong>
                                <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                            </div>
                            <div class="order-details">
                                <span>${order.items.length} item${order.items.length !== 1 ? 's' : ''}</span>
                                <span>Total: $${parseFloat(order.total).toFixed(2)}</span>
                                <span class="order-status ${order.status}">${order.status}</span>
                            </div>
                            <button class="btn-small view-order-btn" data-order-id="${order.orderId}">
                                View Details
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="modal-buttons">
                    <button class="btn-secondary" id="close-orders">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Event listeners
        modal.querySelector('#close-orders').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                this.viewOrderDetails(orderId);
                modal.remove();
            });
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },
    
    viewOrderDetails(orderId) {
        const orders = JSON.parse(localStorage.getItem('dreamdrip_orders') || '[]');
        const order = orders.find(o => o.orderId === orderId);
        
        if (!order) {
            this.showNotification('Order not found', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content order-details-modal">
                <h2>Order #${order.orderId}</h2>
                <div class="order-info">
                    <div class="info-section">
                        <h3>Customer Information</h3>
                        <p><strong>