// ShopEasy product data is also saved in products.json for the jQuery loading task.
let products = [
    { id: 1, name: "Laptop", price: 120000, category: "electronics", rating: 4.6, inStock: true, image: "images/laptop.svg" },
    { id: 2, name: "Headphones", price: 8000, category: "electronics", rating: 4.4, inStock: true, image: "images/headphones.svg" },
    { id: 3, name: "Smartphone", price: 65000, category: "electronics", rating: 4.7, inStock: true, image: "images/smartphone.svg" },
    { id: 4, name: "Smart Watch", price: 15000, category: "electronics", rating: 4.2, inStock: false, image: "images/smartwatch.svg" },
    { id: 5, name: "Keyboard", price: 4500, category: "electronics", rating: 4.3, inStock: true, image: "images/keyboard.svg" },
    { id: 6, name: "Mouse", price: 2500, category: "electronics", rating: 4.1, inStock: true, image: "images/mouse.svg" },
    { id: 7, name: "Backpack", price: 4000, category: "accessories", rating: 4.5, inStock: true, image: "images/backpack.svg" },
    { id: 8, name: "Notebook", price: 500, category: "stationery", rating: 4.0, inStock: true, image: "images/notebook.svg" },
    { id: 9, name: "Water Bottle", price: 1200, category: "accessories", rating: 4.2, inStock: true, image: "images/bottle.svg" },
    { id: 10, name: "Desk Lamp", price: 3000, category: "electronics", rating: 4.3, inStock: true, image: "images/lamp.svg" }
];

let cart = [];
try {
    const savedCart = localStorage.getItem("shopEasyCart");
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
} catch (error) {
    cart = [];
}

let selectedCategory = "all";
let sortOrder = "none";
let searchText = "";

// Show each product as a card in the product grid.
function displayProducts(list) {
    const grid = document.getElementById("productGrid") || document.getElementById("featuredProducts");
    if (!grid) {
        return;
    }

    grid.innerHTML = "";
    if (list.length === 0) {
        grid.innerHTML = '<p class="empty-state">No products found. Try another search or category.</p>';
        return;
    }

    list.forEach(function (product) {
        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-picture">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <p class="category-label">${product.category}</p>
                <h3>${product.name}</h3>
                <p class="product-price">Rs. ${product.price.toLocaleString("en-PK")}</p>
                <p class="product-rating">★ ${product.rating.toFixed(1)} / 5</p>
                <p class="stock-status ${product.inStock ? "in-stock" : "out-stock"}">${product.inStock ? "In stock" : "Out of stock"}</p>
                <button type="button" class="primary-button add-to-cart" data-id="${product.id}" ${product.inStock ? "" : "disabled"}>Add to Cart</button>
            </div>`;
        grid.appendChild(card);
    });
}

// Return products whose names contain the search text, without checking letter case.
function searchProducts(list, text) {
    const searchText = text.toLowerCase().trim();
    return list.filter(function (product) {
        return product.name.toLowerCase().includes(searchText);
    });
}

// Return all products or only the products in the selected category.
function filterByCategory(list, category) {
    if (category === "all") {
        return [...list];
    }
    return list.filter(function (product) {
        return product.category === category;
    });
}

// Return a sorted copy of the products so the original list stays unchanged.
function sortProducts(list, order) {
    const sortedList = [...list];
    if (order === "low") {
        sortedList.sort(function (a, b) {
            return a.price - b.price;
        });
    } else if (order === "high") {
        sortedList.sort(function (a, b) {
            return b.price - a.price;
        });
    }
    return sortedList;
}

// Find one product by ID or return a message if it does not exist.
function getProductById(list, id) {
    const foundProduct = list.find(function (product) {
        return product.id === Number(id);
    });
    if (foundProduct) {
        return foundProduct;
    }
    return "Product not found";
}

// Add a product to the cart, or increase its quantity when it is already there.
function addToCart(id) {
    const product = getProductById(products, id);
    if (product === "Product not found" || !product.inStock) {
        return cart;
    }

    const existingItem = cart.find(function (item) {
        return item.id === Number(id);
    });
    if (existingItem) {
        cart = cart.map(function (item) {
            if (item.id === Number(id)) {
                return { ...item, quantity: item.quantity + 1 };
            }
            return item;
        });
    } else {
        cart = [...cart, { ...product, quantity: 1 }];
    }
    saveCart();
    return cart;
}

// Return a new cart list that does not contain the selected product.
function removeFromCart(id) {
    return cart.filter(function (item) {
        return item.id !== Number(id);
    });
}

// Change the quantity and remove the product if its quantity reaches zero.
function updateQuantity(id, change) {
    const changedCart = cart.map(function (item) {
        if (item.id === Number(id)) {
            return { ...item, quantity: item.quantity + change };
        }
        return item;
    });
    return changedCart.filter(function (item) {
        return item.quantity > 0;
    });
}

// Add the price times quantity for every item in the cart.
function getCartTotal(cartList) {
    return cartList.reduce(function (total, item) {
        return total + item.price * item.quantity;
    }, 0);
}

// Add any number of prices and then subtract the discount percentage.
function calculateBill(discount, ...prices) {
    const subtotal = prices.reduce(function (total, price) {
        return total + price;
    }, 0);
    return subtotal - (subtotal * discount / 100);
}

// Check each checkout field and show a red message when the field is not valid.
function validateCheckout() {
    const form = document.getElementById("checkoutForm");
    if (!form) {
        return true;
    }

    let formIsValid = true;
    const fields = form.querySelectorAll("input, select, textarea");
    fields.forEach(function (field) {
        const errorText = field.parentElement.querySelector(".error");
        if (!field.checkValidity()) {
            formIsValid = false;
            if (errorText) {
                errorText.textContent = field.validationMessage || "Please enter a valid value.";
            }
        } else if (errorText) {
            errorText.textContent = "";
        }
    });
    return formIsValid;
}

// Save the cart so it is still available after the page is refreshed.
const saveCart = () => {
    try {
        localStorage.setItem("shopEasyCart", JSON.stringify(cart));
    } catch (error) {
        // The cart still works for the current page if browser storage is unavailable.
    }
};

// Update the cart table, total price, and cart count shown in the navigation.
const renderCart = () => {
    const cartItems = document.getElementById("cartItems");
    if (cartItems) {
        cartItems.innerHTML = "";
        if (cart.length === 0) {
            cartItems.innerHTML = '<tr><td colspan="5" class="empty-cart">Your cart is empty. Visit the Products page to add items.</td></tr>';
        } else {
            cart.forEach(function (item) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>Rs. ${item.price.toLocaleString("en-PK")}</td>
                    <td>
                        <div class="quantity-controls">
                            <button type="button" class="quantity-minus" data-id="${item.id}" aria-label="Decrease ${item.name} quantity">−</button>
                            <span>${item.quantity}</span>
                            <button type="button" class="quantity-plus" data-id="${item.id}" aria-label="Increase ${item.name} quantity">+</button>
                        </div>
                    </td>
                    <td>Rs. ${(item.price * item.quantity).toLocaleString("en-PK")}</td>
                    <td><button type="button" class="remove-item" data-id="${item.id}">Remove</button></td>`;
                cartItems.appendChild(row);
            });
        }
    }

    document.querySelectorAll("#cartCount").forEach(function (count) {
        count.textContent = cart.reduce(function (total, item) {
            return total + item.quantity;
        }, 0);
    });

    const cartTotal = document.getElementById("cartTotal");
    if (cartTotal) {
        cartTotal.textContent = "Rs. " + getCartTotal(cart).toLocaleString("en-PK");
    }
};

// Apply the current search, category, and sorting selections together.
const updateProductList = () => {
    let visibleProducts = searchProducts(products, searchText);
    visibleProducts = filterByCategory(visibleProducts, selectedCategory);
    if (sortOrder !== "none") {
        visibleProducts = sortProducts(visibleProducts, sortOrder);
    }
    displayProducts(visibleProducts);
};

// Use one delegated click listener for Add to Cart, quantity, and Remove buttons.
document.addEventListener("click", function (event) {
    const button = event.target.closest(".add-to-cart, .quantity-plus, .quantity-minus, .remove-item");
    if (!button) {
        return;
    }

    const productId = button.dataset.id;
    if (button.classList.contains("add-to-cart")) {
        cart = addToCart(productId);
        const message = document.getElementById("cartMessage");
        if (message) {
            message.textContent = "Product added to your cart.";
            message.classList.add("show");
        }
    } else if (button.classList.contains("quantity-plus")) {
        cart = updateQuantity(productId, 1);
    } else if (button.classList.contains("quantity-minus")) {
        cart = updateQuantity(productId, -1);
    } else if (button.classList.contains("remove-item")) {
        cart = removeFromCart(productId);
    }

    saveCart();
    renderCart();
});

const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("input", function (event) {
        searchText = event.target.value;
        updateProductList();
    });
}

const categoryFilter = document.getElementById("categoryFilter");
if (categoryFilter) {
    categoryFilter.addEventListener("change", function (event) {
        selectedCategory = event.target.value;
        updateProductList();
    });
}

const sortFilter = document.getElementById("sortFilter");
if (sortFilter) {
    sortFilter.addEventListener("change", function (event) {
        sortOrder = event.target.value;
        updateProductList();
    });
}

const checkoutForm = document.getElementById("checkoutForm");
if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const checkoutMessage = document.getElementById("checkoutMessage");
        if (!validateCheckout()) {
            checkoutMessage.textContent = "Please correct the fields marked in red.";
            checkoutMessage.classList.remove("success-message");
            return;
        }

        if (cart.length === 0) {
            checkoutMessage.textContent = "Your cart is empty. Please add a product first.";
            checkoutMessage.classList.remove("success-message");
            return;
        }

        const customerName = document.getElementById("fullName").value.trim();
        checkoutMessage.textContent = "Thank you, " + customerName + "! Your demo order is complete.";
        checkoutMessage.classList.add("success-message");
        checkoutForm.reset();
        checkoutForm.querySelectorAll(".error").forEach(function (errorText) {
            errorText.textContent = "";
        });
        cart = [];
        saveCart();
        renderCart();
    });
}

renderCart();
