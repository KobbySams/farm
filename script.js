document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    // We will now manage login state by checking for user info in localStorage
    let cart = []; // Array to hold cart items

    // --- Helper functions for managing user data in localStorage ---
    const storeUserInfo = (data) => {
        localStorage.setItem('userInfo', JSON.stringify(data));
    };

    const getUserInfo = () => {
        return JSON.parse(localStorage.getItem('userInfo'));
    };

    const removeUserInfo = () => {
        localStorage.removeItem('userInfo');
    };

    // --- Existing Elements ---
    const productForm = document.getElementById('product-form');
    const productGrid = document.getElementById('product-grid');

    // --- New Modal Elements ---
    const modal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const closeBtn = document.querySelector('.close-btn');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginFormContainer = document.getElementById('login-form-container');
    const signupFormContainer = document.getElementById('signup-form-container');

    // --- Cart Elements ---
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total');

    // --- New Nav Elements for Auth State ---
    const signupLink = document.getElementById('signup-link');
    const loginLink = document.getElementById('login-link');
    const userWelcome = document.getElementById('user-welcome');
    const logoutLink = document.getElementById('logout-link');
    const logoutBtn = document.getElementById('logout-btn');

    // --- UI Update Function ---
    const updateUIForAuthState = () => {
        const userInfo = getUserInfo();
        if (userInfo && userInfo.token) {
            // Hide Sign Up/Login, show Welcome/Logout
            signupLink.style.display = 'none';
            loginLink.style.display = 'none';
            userWelcome.textContent = `Welcome, ${userInfo.name}!`;
            userWelcome.style.display = 'block';
            logoutLink.style.display = 'block';
        } else {
            // Show Sign Up/Login, hide Welcome/Logout
            signupLink.style.display = 'block';
            loginLink.style.display = 'block';
            userWelcome.style.display = 'none';
            logoutLink.style.display = 'none';
        }
    };

    // --- Modal Logic ---
    const openModal = (isLogin = true) => {
        loginFormContainer.style.display = isLogin ? 'flex' : 'none';
        signupFormContainer.style.display = isLogin ? 'none' : 'flex';
        modal.classList.add('show-modal');
    };
    const closeModal = () => modal.classList.remove('show-modal');

    loginBtn.onclick = () => openModal(true);
    signupBtn.onclick = () => openModal(false);
    closeBtn.onclick = closeModal;
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };

    showSignup.onclick = (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none'; // Using display here for simple toggling
        signupFormContainer.style.display = 'flex';
    };

    showLogin.onclick = (e) => {
        e.preventDefault();
        signupFormContainer.style.display = 'none'; // Using display here for simple toggling
        loginFormContainer.style.display = 'block';
    };

    // --- Authentication Logic ---
    const handleLogin = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('http://localhost:8080/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to login');
            }

            alert('Login successful! You can now add products.');
            storeUserInfo(data); // Store user info and token
            updateUIForAuthState();
            closeModal();
        } catch (error) {
            console.error('Login Error:', error);
            alert(`Login failed: ${error.message}`);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const response = await fetch('http://localhost:8080/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to sign up');
            }

            alert('Sign up successful! You can now add products.');
            storeUserInfo(data); // Store user info and token after registration
            updateUIForAuthState();
            closeModal();
        } catch (error) {
            console.error('Signup Error:', error);
            alert(`Signup failed: ${error.message}`);
        }
    };

    const handleLogout = (e) => {
        e.preventDefault();
        removeUserInfo();
        alert('You have been logged out.');
        updateUIForAuthState();
    };

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);


    // --- Product Loading Logic ---

    /**
     * Creates an HTML product card from product data.
     * @param {object} product - An object containing product details.
     */
    const createProductCard = (product) => { // product now comes from the database
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        // The image source will be a URL path from the server
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">GH₵${product.price.toFixed(2)}</p>
            <p class="description">${product.description}</p>
            <button class="add-to-cart-btn">Add to Cart</button>
        `;
        productGrid.appendChild(productCard);
    };

    /**
     * Fetches products from the backend and displays them.
     * This function would be called on page load.
     */
    const loadProducts = async () => {
        try {
            // The backend is running on port 8080
            const response = await fetch('http://localhost:8080/api/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            productGrid.innerHTML = ''; // Clear existing products
            products.forEach(createProductCard);
        } catch (error) {
            console.error("Could not fetch products:", error);
            productGrid.innerHTML = '<p>Sorry, we could not load products at this time.</p>';
        }
    };

    // --- Product Submission Logic ---
    productForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Always prevent default to control the flow

        const userInfo = getUserInfo();

        // Check if the user is logged in before allowing product submission
        if (!userInfo || !userInfo.token) {
            alert("Please sign up or log in to add a product.");
            openModal(true); // Open the login modal
            return; // Stop the function here
        }

        // 1. Get form values
        const productName = document.getElementById('product-name').value;
        const productPrice = document.getElementById('product-price').value;
        const productDescription = document.getElementById('product-description').value;
        const productImageFile = document.getElementById('product-image').files[0];

        // NOTE: Handling file uploads (like productImageFile) requires 'multipart/form-data'.
        // This requires a library like 'multer' on the backend.
        // For now, we will send only the text data as JSON.

        const productData = {
            name: productName,
            price: productPrice,
            description: productDescription,
            // image: 'path/to/image.jpg' // In a real app, you'd get this URL after uploading the file
        };

        try {
            const response = await fetch('http://localhost:8080/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}` // Add the JWT for protected routes
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newProduct = await response.json();
            createProductCard(newProduct); // Add the new product to the grid
            alert('Product added successfully!');
            productForm.reset();
        } catch (error) {
            console.error('Error submitting product:', error);
            alert('Failed to add product. Please try again.');
        }
    });

    // --- Cart Logic ---
    const updateCartCount = () => {
        cartCount.textContent = cart.length;
    };

    const renderCart = () => {
        cartItemsContainer.innerHTML = ''; // Clear current items
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotal.textContent = 'GH₵0.00';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.price}</p>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);

            // Extract number from price string for calculation
            const priceValue = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
            if (!isNaN(priceValue)) {
                total += priceValue;
            }
        });

        cartTotal.textContent = `GH₵${total.toFixed(2)}`;
    };

    const addToCart = (productCard) => {
        const name = productCard.querySelector('h3').textContent;
        const price = productCard.querySelector('.price').textContent;

        cart.push({ name, price });
        updateCartCount();
        renderCart();
        alert(`"${name}" has been added to your cart!`);
    };

    // Use event delegation for "Add to Cart" buttons
    productGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productCard = e.target.closest('.product-card');
            addToCart(productCard);
        }
    });

    // --- Cart Modal Logic ---
    cartBtn.onclick = (e) => {
        e.preventDefault();
        cartModal.style.display = 'block';
    };
    closeCartBtn.onclick = () => cartModal.style.display = 'none';
    window.addEventListener('click', (event) => {
        if (event.target == cartModal) {
            cartModal.style.display = 'none';
        }
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        alert('Checkout functionality requires a secure backend and payment gateway. This is the end of the demo!');
    });

    // Initial load of products and UI state
    loadProducts();
    updateUIForAuthState();
    renderCart(); // Initial render for the cart
});