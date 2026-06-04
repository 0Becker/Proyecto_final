// =========================
// SELECTORES
// =========================

const cartContainer =
  document.getElementById(
    "cartContainer"
  );

const cartTotal =
  document.getElementById(
    "cartTotal"
  );

const checkoutBtn =
  document.getElementById(
    "checkoutBtn"
  );

const buyBtn =
  document.getElementById(
    "buyBtn"
  );

const successMessage =
  document.getElementById(
    "successMessage"
  );



// =========================
// VARIABLES
// =========================

let cart = [];



// =========================
// FUNCIONES CARRITO
// =========================

function addToCart(){
  // No se requiere en esta vista (se maneja desde index.html)
}

function removeFromCart(id){
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart(){
  if (!cartContainer) return;
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p style="color: var(--muted); text-align: center; padding: 20px 0;">El carrito está vacío.</p>`;
    updateCartTotal();
    return;
  }

  cart.forEach(item => {
    cartContainer.appendChild(generateCartItem(item));
  });

  updateCartTotal();
}

function updateCartTotal(){
  if (!cartTotal) return;
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  cartTotal.textContent = formatPrice(total);
}

function clearCart(){
  cart = [];
  saveCart();
  renderCart();
}

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart(){
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

function checkout(){
  window.location.href = "index.html";
}

function validateCheckout(){
  if (cart.length === 0) {
    alert("El carrito está vacío. Añade productos desde la tienda.");
    return;
  }

  const form = document.getElementById("checkoutForm");
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  showSuccessMessage();
}

function showSuccessMessage(){
  const modal = document.getElementById("successModal");
  if (modal) {
    if (successMessage) {
      successMessage.textContent = "¡Compra realizada con éxito! Tu pedido está en camino.";
    }
    modal.style.display = "flex";

    const closeModalBtn = document.getElementById("closeModalBtn");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
        document.getElementById("checkoutForm").reset();
        clearCart();
        window.location.href = "index.html";
      });
    }
  }
}

function formatPrice(price){
  return `${price.toFixed(2)}€`;
}

function generateCartItem(item){
  const article = document.createElement("article");
  article.classList.add("cart-item");

  const img = document.createElement("img");
  img.src = item.image;
  img.alt = item.title;

  const info = document.createElement("div");
  info.classList.add("cart-item-info");

  const title = document.createElement("p");
  title.classList.add("cart-item-title");
  title.textContent = item.title;

  const price = document.createElement("p");
  price.classList.add("cart-item-price");
  price.textContent = `${item.quantity} x ${formatPrice(item.price)}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✕";
  deleteBtn.style.cssText = "border: none; background: #fee2e2; color: #ef4444; width: 30px; height: 30px; border-radius: 8px; cursor: pointer; font-weight: bold; margin-self: center;";
  deleteBtn.addEventListener("click", () => removeFromCart(item.id));

  info.append(title, price);
  article.append(img, info, deleteBtn);

  return article;
}



// =========================
// EVENTOS
// =========================

checkoutBtn.addEventListener(
  "click",
  checkout
);

buyBtn.addEventListener(
  "click",
  validateCheckout
);



// =========================
// INIT
// =========================

loadCart();

renderCart();