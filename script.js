document.addEventListener("DOMContentLoaded", () => {
  const cartCount = document.getElementById("cartCount");

  // Функція для оновлення лічильника
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cartCount) cartCount.textContent = cart.length;
  }
  updateCartCount();

  // 1. ЛОГІКА ДОДАВАННЯ У КОШИК (працює на catalog.html)
  document.querySelectorAll(".buy-button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      // ✅ ВИПРАВЛЕНО: Обробляємо лише кнопки додавання та видалення
      if(btn.classList.contains('remove-btn') || e.target.closest('#cartItems')) {
        return; 
      }
      
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price);
      const img = btn.dataset.img;

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      // Додаємо ID для унікальності
      cart.push({ id: Date.now() + Math.random(), name, price, img }); 
      localStorage.setItem("cart", JSON.stringify(cart));

      updateCartCount();
      // Тут спливає повідомлення про додавання. Інші кнопки його не викликають.
      alert(`🎉 ${name} додано в кошик!`);
    });
  });

  // 2. ЛОГІКА ВІДОБРАЖЕННЯ ТА ВИДАЛЕННЯ (працює на cart.html)
  const cartItems = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");
  // checkoutBtn все ще потрібен, щоб приєднати до нього обробник кліку (пункт 3)
  const checkoutBtn = document.getElementById("checkoutBtn"); 
  
  // Функція для відображення кошика
  function renderCart() {
    if (!cartItems || !totalPriceEl) return; 

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (cart.length === 0) {
      cartItems.innerHTML = "<p style='text-align:center; width:100%;'>Ваш кошик порожній</p>";
      totalPriceEl.textContent = "Загальна сума: 0 грн";
      if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
      if (checkoutBtn) checkoutBtn.disabled = false;
      let total = 0;
      cartItems.innerHTML = cart.map((item) => {
        total += item.price;
        // Використовуємо item.id як унікальний ідентифікатор для видалення
        return `
          <div class="product-card">
            <img src="${item.img}" class="product-img">
            <p class="product-name">${item.name}</p>
            <p class="product-price">${item.price} грн</p>
            <button class="buy-button remove-btn" data-id="${item.id}">Видалити</button>
          </div>
        `;
      }).join("");
      totalPriceEl.textContent = `Загальна сума: ${total} грн`;

      // Додаємо обробники для кнопок видалення
      document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const idToRemove = parseFloat(e.target.dataset.id); 
          
          let currentCart = JSON.parse(localStorage.getItem("cart")) || [];
          
          const index = currentCart.findIndex(item => item.id === idToRemove);
          if (index > -1) {
            currentCart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(currentCart));
            
            renderCart(); 
            updateCartCount();
          }
        });
      });
    }
  }

  renderCart(); 

  // 3. ЛОГІКА ОФОРМЛЕННЯ ЗАМОВЛЕННЯ (працює на cart.html)
  
  const modal = document.getElementById("orderModal");
  const closeBtn = document.querySelector(".close-btn");
  const orderForm = document.getElementById("orderForm");

  // Відкриття модального вікна
  if (checkoutBtn) {
    // Обробник додається безпосередньо до кнопки #checkoutBtn, 
    // яка більше не має класу .buy-button, тому конфлікту немає
    checkoutBtn.addEventListener("click", () => { 
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      if(cart.length === 0){
        alert("Ваш кошик порожній!");
        return;
      }
      modal.style.display = "block";
    });
  }

  // Закриття модального вікна
  if (closeBtn) closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Обробка форми замовлення
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("name").value;
      const phone = document.getElementById("phone").value;
      const address = document.getElementById("address").value;
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const total = cart.reduce((sum, item) => sum + item.price, 0);

      // Імітація відправки замовлення
      console.log("--- НОВЕ ЗАМОВЛЕННЯ ---");
      console.log(`Клієнт: ${name}`);
      console.log(`Телефон: ${phone}`);
      console.log(`Адреса: ${address}`);
      console.log(`Товари: ${cart.map(item => item.name).join(', ')}`);
      console.log(`Сума: ${total} грн`);
      console.log("------------------------");
      
      // Повідомлення про успіх
      alert(`🎉 Дякуємо, ${name}! Ваше замовлення на суму ${total} грн оформлено. Очікуйте дзвінка!`);
      
      // Очищення
      localStorage.removeItem("cart");
      modal.style.display = "none";
      renderCart(); // Оновлюємо кошик на сторінці
      updateCartCount(); // Оновлюємо лічильник
      orderForm.reset();
    });
  }
});
