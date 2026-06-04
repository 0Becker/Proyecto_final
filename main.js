const productsContainer = document.getElementById("productsContainer");
const cartContainer = document.getElementById("cartContainer");
const cartTotal = document.getElementById("cartTotal");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");
const loginModal = document.getElementById("loginModal");
const accountBtn = document.querySelector(".account-btn");
const closeLogin = document.getElementById("closeLogin");
const loginForm = document.getElementById("loginForm");

let products = [];          
let cart = [];            
let favorites = [];        

function getProducts() {
  fetch("https://fakestoreapi.com/products")
    .then(res => res.json())
    .then(data => {
      products = data;
      renderCategories();
      displayProducts(products);
    })
    .catch(error => console.error("Error fetching products:", error));
}

function displayProducts(productsArray) {
  if (!productsContainer) return;
  productsContainer.innerHTML = ""; 
  productsArray.forEach(product => {
    renderProducts(product);
  });
}

function renderProducts(product) {
  const tarjeta = document.createElement("article");
  const contenedorImagen = document.createElement("div");
  const imageProduct = document.createElement("img");
  const info = document.createElement("div");
  const categoryProduct = document.createElement("p");
  const titleProduct = document.createElement("h3");
  const priceProduct = document.createElement("p");
  const buttons = document.createElement("div");
  const addBtn = document.createElement("button");
  const favBtn = document.createElement("button");

  tarjeta.classList.add("product-card");
  contenedorImagen.classList.add("product-image");
  imageProduct.setAttribute("src", product.image);
  imageProduct.setAttribute("alt", product.title);
  info.classList.add("product-info");
  categoryProduct.classList.add("product-category");
  titleProduct.classList.add("product-title");
  priceProduct.classList.add("product-price");
  buttons.classList.add("card-actions");
  addBtn.classList.add("add-btn");
  favBtn.classList.add("fav-btn");

  categoryProduct.textContent = product.category;
  titleProduct.textContent = product.title;
  priceProduct.textContent = `${product.price} €`;
  addBtn.textContent = "Añadir";

  const esFavorito = favorites.some(fav => fav.id === product.id);
  favBtn.textContent = esFavorito ? "❤️" : "🤍";

  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(product);
  });

  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(product.id);
  });

  contenedorImagen.append(imageProduct);
  buttons.append(addBtn, favBtn);
  info.append(categoryProduct, titleProduct, priceProduct, buttons);
  tarjeta.append(contenedorImagen, info);

  if (productsContainer) {
    productsContainer.appendChild(tarjeta);
  }

  contenedorImagen.style.cursor = "pointer";
  titleProduct.style.cursor = "pointer";

  const irADetalle = () => {
    localStorage.setItem("selectedProductId", product.id);
    window.location.href = "detalle.html";
  };

  contenedorImagen.addEventListener("click", irADetalle);
  titleProduct.addEventListener("click", irADetalle);
}

function renderCategories() {
  const categories = [...new Set(products.map(producto => producto.category))];
  
  categoryFilter.innerHTML = '<option value="all">Todas las categorías</option>';

  categories.forEach(categoria => {
    const opcion = document.createElement("option");
    opcion.value = categoria;
    opcion.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
    categoryFilter.appendChild(opcion);
  });
}

function filterProducts() {
  let resultado = [...products];

  const busqueda = searchInput.value.toLowerCase().trim();
  if (busqueda) {
    resultado = resultado.filter(p => p.title.toLowerCase().includes(busqueda));
  }

  const categoriaSeleccionada = categoryFilter.value;
  if (categoriaSeleccionada !== "all") {
    resultado = resultado.filter(p => p.category === categoriaSeleccionada);
  }

  const orden = sortSelect.value;
  if (orden === "priceAsc") {
    resultado.sort((a, b) => a.price - b.price);
  } else if (orden === "priceDesc") {
    resultado.sort((a, b) => b.price - a.price);
  } else if (orden === "az") {
    resultado.sort((a, b) => a.title.localeCompare(b.title));
  } else if (orden === "za") {
    resultado.sort((a, b) => b.title.localeCompare(a.title));
  }

  displayProducts(resultado);
}

searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);
sortSelect.addEventListener("change", filterProducts);

function buscarProducto(id) {
  return products.find(product => product.id === id);
}

function addToCart(id) {
  const product = buscarProducto(id);
  if (product) {
    const cartItem = cart.find(item => item.id === id);
    if (cartItem) {
      cartItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    renderCart();
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  if (!cartContainer) return;
  cartContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    cartContainer.innerHTML += `
      <div class="cart-item">
        <div class="cart-item-info">
          <p class="cart-item-title">${item.title}</p>
          <p class="cart-item-price">${item.quantity} x ${item.price}€</p>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">X</button>
      </div>
    `;
  });

  cartTotal.textContent = total.toFixed(2) + "€";
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  let carritoGuardado = localStorage.getItem("cart");
  if (carritoGuardado) {
    cart = JSON.parse(carritoGuardado);
  }
  renderCart();
}

function toggleFavorite(product) {
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("¡Atención! Debes iniciar sesión en tu cuenta para poder añadir productos a tus favoritos.");
    if (loginModal) loginModal.classList.remove("hidden");
    return;
  }

  const activeUser = localStorage.getItem('activeUser') || 'default';
  const userFavoritesKey = `favoritos_${activeUser}`;

  const index = favorites.findIndex(fav => fav.id === product.id);
  if (index === -1) {
    favorites.push(product);
  } else {
    favorites.splice(index, 1);
  }
  
  localStorage.setItem(userFavoritesKey, JSON.stringify(favorites));
  displayProducts(products);
}

function loadFavorites() {
  const activeUser = localStorage.getItem('activeUser');
  if (activeUser) {
    const userFavoritesKey = `favoritos_${activeUser}`;
    let favsGuardados = localStorage.getItem(userFavoritesKey);
    if (favsGuardados) {
      favorites = JSON.parse(favsGuardados);
    } else {
      favorites = [];
    }
  } else {
    favorites = [];
  }
}

function checkSession() {
  const token = sessionStorage.getItem("token");
  const navActions = document.querySelector(".nav-actions");

  if (!navActions) return;

  if (token) {
    if (loginModal) loginModal.classList.add("hidden");
    
    loadFavorites();
    displayProducts(products);
    
    const activeUser = localStorage.getItem('activeUser') || 'Usuario';
    
    navActions.innerHTML = `
      <div id="loggedInActions" style="display: flex; align-items: center; gap: 15px;">
        <span id="navUsername" style="color: white; font-weight: 500;">Hola, ${activeUser}</span>
        <a href="perfil.html">
          <button class="account-btn" style="background: var(--primary);">
            Ver Detalles
          </button>
        </a>
        <a href="admin.html">
          <button class="account-btn" style="background: #10b981; border: none;">
            Admin
          </button>
        </a>
        <button id="navLogoutBtn" class="account-btn" style="background: var(--danger); margin-left: 5px;">
          Salir
        </button>
      </div>
    `;

    document.getElementById("navLogoutBtn").addEventListener("click", logout);

  } else {
    favorites = [];
    displayProducts(products);
    
    navActions.innerHTML = `
      <button class="account-btn">
        Mi cuenta
      </button>
    `;
    
    const newAccountBtn = document.querySelector(".account-btn");
    if (newAccountBtn) {
      newAccountBtn.addEventListener("click", () => {
        loginModal.classList.remove("hidden");
      });
    }
  }

  const checkoutAnchor = document.querySelector('a[href="carrito.html"]');
  if (checkoutAnchor) {
    checkoutAnchor.replaceWith(checkoutAnchor.cloneNode(true));
    const newCheckoutAnchor = document.querySelector('a[href="carrito.html"]');
    newCheckoutAnchor.addEventListener("click", function(event) {
      const currentToken = sessionStorage.getItem("token");
      if (!currentToken) {
        event.preventDefault();
        alert("Acceso denegado: Debes iniciar sesión con tu cuenta para acceder al proceso de compra.");
        if (loginModal) {
          loginModal.classList.remove("hidden");
        }
      }
    });
  }
}

function logout() {
  sessionStorage.removeItem("token");
  localStorage.removeItem("activeUser"); 
  checkSession();
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const usernameInput = document.getElementById("username")?.value || 'mor_2314';
  const passwordInput = document.getElementById("password")?.value || '83r5^_';

  const credentials = { username: usernameInput, password: passwordInput };

  fetch('https://fakestoreapi.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  .then(response => {
    if (!response.ok) throw new Error("Credenciales incorrectas");
    return response.json();
  })
  .then(data => {
    console.log("Login exitoso. Token recibido:", data.token);
    sessionStorage.setItem('token', data.token);
    localStorage.setItem('activeUser', usernameInput);
    
    loginForm.reset();
    checkSession();
  })
  .catch(error => alert("Error en el login: " + error.message));
});

if (accountBtn) {
  accountBtn.addEventListener("click", () => {
    loginModal.classList.remove("hidden");
  });
}

if (closeLogin) {
  closeLogin.addEventListener("click", () => {
    loginModal.classList.add("hidden");
    loginForm.reset();
  });
}

if (loginModal) {
  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      loginModal.classList.add("hidden");
    }
  });
}

function init() {
  loadFavorites(); 
  loadCart();
  getProducts();   
  checkSession();
}

init();