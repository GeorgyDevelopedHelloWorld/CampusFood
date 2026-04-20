document.addEventListener('DOMContentLoaded', () => {
    // Данные товаров
    const products = [
        { id: 'burger', name: 'Бургер', price: 250, category: 'burgers' },
        { id: 'pizza', name: 'Пицца Маргарита', price: 350, category: 'pizza' },
        { id: 'fries', name: 'Картошка фри', price: 120, category: 'snacks' },
        { id: 'rings', name: 'Луковые кольца', price: 140, category: 'snacks' },
        { id: 'nuggets', name: 'Наггетсы', price: 180, category: 'snacks' },
        { id: 'donut', name: 'Пончик', price: 110, category: 'snacks' },
        { id: 'juice', name: 'Апельсиновый сок', price: 130, category: 'drinks' },
        { id: 'shake', name: 'Молочный коктейль', price: 190, category: 'drinks' }
    ];

    const combos = [
        { id: 'combo-classic', name: 'Комбо Классик', price: 390 },
        { id: 'combo-pizza', name: 'Пицца-комбо', price: 499 },
        { id: 'combo-snack', name: 'Снек-комбо', price: 360 }
    ];

    // Состояние приложения
    let cart = [];
    let discount = 0;
    let addressData = { building: '', room: '' };

    // DOM-элементы
    const grids = {
        burgers: document.getElementById('burgers-grid'),
        pizza: document.getElementById('pizza-grid'),
        snacks: document.getElementById('snacks-grid'),
        drinks: document.getElementById('drinks-grid')
    };
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const cartCounterEl = document.getElementById('cart-counter');
    const emptyMsgEl = document.getElementById('empty-cart-message');
    const promoInput = document.getElementById('promo-input');
    const applyPromoBtn = document.getElementById('apply-promo-btn');
    const promoStatusEl = document.getElementById('promo-status');
    const addressBtn = document.getElementById('address-btn');
    const addressModal = document.getElementById('address-modal');
    const addressForm = document.getElementById('address-form');
    const orderForm = document.getElementById('order-form');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Рендеринг карточек товаров из массива
    function renderProducts() {
        Object.keys(grids).forEach(key => grids[key].innerHTML = '');
        
        products.forEach(prod => {
            if (grids[prod.category]) {
                const article = document.createElement('article');
                article.className = 'product-card';
                article.id = `product-${prod.id}`;
                article.innerHTML = `
                    <img src="images/${prod.id}.jpg" alt="${prod.name}" class="product-image" onerror="this.style.display='none'">
                    <h4 class="product-title">${prod.name}</h4>
                    <p class="product-price">${prod.price} ₽</p>
                    <button class="btn btn-add-to-cart" type="button" data-id="${prod.id}">В корзину</button>
                `;
                grids[prod.category].appendChild(article);
            }
        });
    }

    // Навешивание обработчиков на кнопки добавления
    function attachAddToCartListeners() {
        document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('article').id.replace('product-', '');
                const product = products.find(p => p.id === id);
                if (product) addToCart(product);
            });
        });

        document.querySelectorAll('.btn-add-combo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const article = e.target.closest('.combo-card');
                const id = article.id.replace('combo-', '');
                const combo = combos.find(c => c.id === id);
                if (combo) addToCart(combo);
            });
        });
    }

    // Логика корзины
    function addToCart(item) {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ ...item, qty: 1 });
        }
        updateCartUI();
        showToast(`${item.name} добавлен в корзину`);
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    function updateCartUI() {
        const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCounterEl.textContent = totalCount;

        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let discountAmount = subtotal * discount;
        let finalTotal = Math.round(subtotal - discountAmount);
        cartTotalEl.textContent = `${finalTotal} ₽`;

        cartItemsEl.innerHTML = '';
        if (cart.length === 0) {
            cartItemsEl.appendChild(emptyMsgEl);
            emptyMsgEl.style.display = 'block';
        } else {
            emptyMsgEl.style.display = 'none';
            cart.forEach(item => {
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb; width: 100%;';
                div.innerHTML = `
                    <span style="font-weight: 500;">${item.name} <small style="color: var(--text-secondary);">x${item.qty}</small></span>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 600;">${item.price * item.qty} ₽</span>
                        <button class="btn-remove" style="background: #ef4444; color: #fff; border: none; border-radius: 6px; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
                    </div>
                `;
                div.querySelector('.btn-remove').addEventListener('click', () => removeFromCart(item.id));
                cartItemsEl.appendChild(div);
            });
        }
    }

    // Промокоды
    applyPromoBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === 'FREE25') {
            discount = 0.25;
            promoStatusEl.textContent = 'Промокод применён! Скидка 25%';
            promoStatusEl.style.color = '#16a34a';
        } else if (code === '') {
            promoStatusEl.textContent = 'Введите промокод';
            promoStatusEl.style.color = '#dc2626';
            discount = 0;
        } else {
            discount = 0;
            promoStatusEl.textContent = 'Неверный промокод';
            promoStatusEl.style.color = '#dc2626';
        }
        updateCartUI();
    });

    // Фильтрация по категориям
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            document.querySelectorAll('.category-section').forEach(sec => {
                sec.style.display = (sec.id === targetId) ? 'block' : 'none';
            });
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Toast-уведомление
    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; background: #22c55e; color: #fff; padding: 12px 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; font-weight: 500; transition: opacity 0.3s, transform 0.3s; transform: translateY(0);';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Модальное окно адреса
    addressBtn.addEventListener('click', () => {
        addressModal.showModal();
    });

    addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const building = document.getElementById('building-select').value;
        const room = document.getElementById('room-input').value;
        
        if (!room.trim()) {
            showToast('Укажите номер аудитории');
            return;
        }

        addressData = { building, room };
        addressBtn.textContent = `📍 Корпус ${building}, ауд. ${room}`;
        document.getElementById('order-building').value = `Корпус ${building}`;
        document.getElementById('order-room').value = room;
        addressModal.close();
        showToast('Адрес успешно сохранён');
    });

    // Переход к оформлению
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Корзина пуста!');
            return;
        }
        document.getElementById('checkout-form-wrapper').scrollIntoView({ behavior: 'smooth' });
    });

    // Валидация и отправка формы
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('customer-name').value.trim();
        const room = document.getElementById('order-room').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();

        if (!name || !room || !phone) {
            showToast('Заполните все обязательные поля');
            return;
        }

        const phoneRegex = /^\+7[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phone)) {
            showToast('Введите корректный номер телефона');
            return;
        }

        if (cart.length === 0) {
            showToast('Корзина пуста');
            return;
        }

        // Успешная отправка
        showToast('Заказ успешно отправлен!');
        cart = [];
        discount = 0;
        updateCartUI();
        orderForm.reset();
        addressBtn.textContent = '📍 Выбрать адрес доставки';
        document.getElementById('order-building').value = '';
        document.getElementById('order-room').value = '';
    });

    // Инициализация
    renderProducts();
    attachAddToCartListeners();
    updateCartUI();
});