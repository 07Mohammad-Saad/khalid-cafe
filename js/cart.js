/**
 * cart.js — Shopping Cart & Checkout Frontend for Khalid Café
 *
 * Responsibilities:
 *  - Cart state management (add, remove, quantity update, totals calculation)
 *  - Persistent storage via localStorage
 *  - Cart Drawer open/close/toggle animations & backdrop
 *  - Visual feedback for "+ Add" buttons
 *  - Cart empty and populated states
 *  - Checkout form validation (Name, 10-digit Phone, Order type, Instructions)
 *  - submitOrder() contract function ready for future FastAPI backend integration
 *
 * NOTE:
 *  This file is strictly frontend-only. No fake delays or simulated APIs are used.
 *  When connecting to Python FastAPI, wire submitOrder() to fetch('/api/orders').
 */

'use strict';

(function () {
  const STORAGE_KEY = 'khalid_cafe_cart';

  /* ──────────────────────────────────────────
     1. STATE MANAGEMENT
  ────────────────────────────────────────── */
  let cart = loadCart();

  /**
   * Load cart from localStorage with defensive validation
   * @returns {Array<{ name: string, price: number, image: string, quantity: number }>}
   */
  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (item) {
        return (
          item &&
          typeof item.name === 'string' &&
          typeof item.price === 'number' &&
          !isNaN(item.price) &&
          item.price >= 0 &&
          typeof item.quantity === 'number' &&
          item.quantity > 0
        );
      });
    } catch (err) {
      console.warn('[Cart] Failed to load from localStorage:', err);
      return [];
    }
  }

  /**
   * Save current cart state to localStorage
   */
  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.warn('[Cart] Failed to save to localStorage:', err);
    }
  }

  /**
   * Calculate total number of individual items in cart
   * @returns {number}
   */
  function getCartItemCount() {
    return cart.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
  }

  /**
   * Calculate cart total amount in INR (₹)
   * @returns {number}
   */
  function getCartTotal() {
    return cart.reduce(function (sum, item) {
      return sum + (item.price * item.quantity);
    }, 0);
  }

  /* ──────────────────────────────────────────
     2. CART OPERATIONS
  ────────────────────────────────────────── */

  /**
   * Add an item to the cart or increment quantity
   * @param {{ name: string, price: number, image: string }} item
   */
  function addToCart(item) {
    if (!item || !item.name) return;

    const existing = cart.find(function (i) {
      return i.name.toLowerCase() === item.name.toLowerCase();
    });

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        name: item.name.trim(),
        price: Number(item.price) || 0,
        image: item.image || 'images/menu-coffee.png',
        quantity: 1
      });
    }

    saveCart();
    renderCart();
    bumpBadge();
  }

  /**
   * Update quantity of an item. Removes if quantity <= 0.
   * @param {string} name
   * @param {number} newQuantity
   */
  function updateQuantity(name, newQuantity) {
    const index = cart.findIndex(function (i) {
      return i.name === name;
    });
    if (index === -1) return;

    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = qty;
    }

    saveCart();
    renderCart();
  }

  /**
   * Remove item entirely from cart
   * @param {string} name
   */
  function removeItem(name) {
    cart = cart.filter(function (i) {
      return i.name !== name;
    });
    saveCart();
    renderCart();
  }

  /**
   * Clear all items from cart
   */
  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  /* ──────────────────────────────────────────
     3. CART DRAWER UI & VIEW SWITCHING
  ────────────────────────────────────────── */
  let drawerEl, backdropEl, viewItemsEl, viewCheckoutEl;

  function openCart() {
    if (!drawerEl || !backdropEl) return;
    drawerEl.classList.add('is-open');
    backdropEl.classList.add('is-active');
    drawerEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Default to items view when opening
    switchView('items');
  }

  function closeCart() {
    if (!drawerEl || !backdropEl) return;
    drawerEl.classList.remove('is-open');
    backdropEl.classList.remove('is-active');
    drawerEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function toggleCart() {
    if (!drawerEl) return;
    if (drawerEl.classList.contains('is-open')) {
      closeCart();
    } else {
      openCart();
    }
  }

  function switchView(viewName) {
    if (!viewItemsEl || !viewCheckoutEl) return;
    if (viewName === 'checkout') {
      viewItemsEl.classList.add('is-hidden');
      viewCheckoutEl.classList.remove('is-hidden');
      renderCheckoutSummary();
      resetCheckoutForm();
    } else {
      viewCheckoutEl.classList.add('is-hidden');
      viewItemsEl.classList.remove('is-hidden');
    }
  }

  function bumpBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    badge.classList.remove('is-bumped');
    // Force DOM reflow to re-trigger CSS animation
    void badge.offsetWidth;
    badge.classList.add('is-bumped');
  }

  /* ──────────────────────────────────────────
     4. RENDERING FUNCTIONS
  ────────────────────────────────────────── */

  /**
   * Helper to escape HTML to prevent XSS in dynamic renders
   */
  function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str || '';
    return p.innerHTML;
  }

  function renderCart() {
    const totalCount = getCartItemCount();
    const totalPrice = getCartTotal();

    // 1. Update badges & counts
    const badgeEl = document.getElementById('cart-badge');
    const headerCountEl = document.getElementById('cart-header-count');
    const floatingPillEl = document.getElementById('floating-cart-pill');
    const floatingCountEl = document.getElementById('floating-cart-count');
    const floatingTotalEl = document.getElementById('floating-cart-total');

    if (badgeEl) {
      badgeEl.textContent = String(totalCount);
      badgeEl.classList.toggle('has-items', totalCount > 0);
    }

    if (headerCountEl) {
      headerCountEl.textContent = totalCount === 1 ? '1 item' : totalCount + ' items';
    }

    if (floatingPillEl) {
      floatingPillEl.classList.toggle('is-hidden', totalCount === 0);
      if (floatingCountEl) {
        floatingCountEl.textContent = totalCount === 1 ? '1 item' : totalCount + ' items';
      }
      if (floatingTotalEl) {
        floatingTotalEl.textContent = '₹' + totalPrice;
      }
    }

    // 2. Toggle empty state vs list
    const emptyStateEl = document.getElementById('cart-empty-state');
    const itemsContainerEl = document.getElementById('cart-items-container');
    const footerEl = document.getElementById('cart-drawer-footer');

    if (!itemsContainerEl || !emptyStateEl || !footerEl) return;

    if (cart.length === 0) {
      emptyStateEl.style.display = 'flex';
      itemsContainerEl.style.display = 'none';
      footerEl.style.display = 'none';
      itemsContainerEl.innerHTML = '';
      return;
    }

    emptyStateEl.style.display = 'none';
    itemsContainerEl.style.display = 'flex';
    footerEl.style.display = 'block';

    // 3. Render items
    let html = '';
    cart.forEach(function (item) {
      const lineTotal = item.price * item.quantity;
      html += `
        <div class="cart-item" data-item-name="${escapeHTML(item.name)}">
          <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" class="cart-item__image" loading="lazy" />
          <div class="cart-item__details">
            <div class="cart-item__header">
              <h4 class="cart-item__name" title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</h4>
              <button type="button" class="cart-item__remove-btn" aria-label="Remove ${escapeHTML(item.name)} from cart" data-action="remove">&times;</button>
            </div>
            <div class="cart-item__price">₹${item.price} each</div>
            <div class="cart-item__controls">
              <div class="cart-qty-picker" role="group" aria-label="Quantity for ${escapeHTML(item.name)}">
                <button type="button" class="cart-qty-btn" aria-label="Decrease quantity" data-action="decrease">&minus;</button>
                <span class="cart-qty-value">${item.quantity}</span>
                <button type="button" class="cart-qty-btn" aria-label="Increase quantity" data-action="increase">&plus;</button>
              </div>
              <div class="cart-item__line-total">₹${lineTotal}</div>
            </div>
          </div>
        </div>
      `;
    });

    itemsContainerEl.innerHTML = html;

    // 4. Update footer totals
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    if (subtotalEl) subtotalEl.textContent = '₹' + totalPrice;
    if (totalEl) totalEl.textContent = '₹' + totalPrice;
  }

  function renderCheckoutSummary() {
    const summaryItemsEl = document.getElementById('checkout-summary-items');
    const summaryCountEl = document.getElementById('checkout-summary-count');
    const summaryTotalEl = document.getElementById('checkout-summary-total');
    const submitBtnEl = document.getElementById('checkout-submit-btn');

    const totalCount = getCartItemCount();
    const totalPrice = getCartTotal();

    if (summaryCountEl) {
      summaryCountEl.textContent = totalCount === 1 ? '1 item' : totalCount + ' items';
    }

    if (summaryTotalEl) {
      summaryTotalEl.textContent = '₹' + totalPrice;
    }

    if (submitBtnEl) {
      submitBtnEl.textContent = 'Confirm Order (₹' + totalPrice + ')';
    }

    if (!summaryItemsEl) return;

    let html = '';
    cart.forEach(function (item) {
      const lineTotal = item.price * item.quantity;
      html += `
        <div class="checkout-summary-item">
          <span class="checkout-summary-item__name">
            <strong>${item.quantity}&times;</strong> ${escapeHTML(item.name)}
          </span>
          <span class="checkout-summary-item__price">₹${lineTotal}</span>
        </div>
      `;
    });
    summaryItemsEl.innerHTML = html;
  }

  /* ──────────────────────────────────────────
     5. CHECKOUT FORM VALIDATION & SUBMISSION
  ────────────────────────────────────────── */

  function resetCheckoutForm() {
    const form = document.getElementById('checkout-form');
    const confirmation = document.getElementById('checkout-confirmation');
    if (form) {
      form.style.display = 'flex';
      clearFormErrors();
    }
    if (confirmation) {
      confirmation.classList.add('is-hidden');
    }
  }

  function clearFormErrors() {
    const nameErr = document.getElementById('checkout-name-error');
    const phoneErr = document.getElementById('checkout-phone-error');
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');

    if (nameErr) nameErr.textContent = '';
    if (phoneErr) phoneErr.textContent = '';
    if (nameInput) nameInput.classList.remove('has-error');
    if (phoneInput) phoneInput.classList.remove('has-error');
  }

  function validateCheckout(data) {
    const errors = {};

    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters).';
    }

    const cleanPhone = (data.phone || '').trim().replace(/\D/g, '');
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (!cart || cart.length === 0) {
      errors.cart = 'Your cart is empty. Please add items before checking out.';
    }

    return errors;
  }

  /**
   * Submit Order Function (Stage 1 Architecture)
   *
   * Isolated contract function. Does not use simulated API delays or fake endpoints.
   * Logs structured payload to console and triggers a custom event for FastAPI.
   *
   * @param {{ name: string, phone: string, orderType: string, instructions: string }} customerData
   */
  function submitOrder(customerData) {
    const orderPayload = {
      customer: {
        name: customerData.name.trim(),
        phone: customerData.phone.trim(),
        orderType: customerData.orderType,
        instructions: (customerData.instructions || '').trim()
      },
      items: cart.map(function (item) {
        return {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          lineTotal: item.price * item.quantity
        };
      }),
      summary: {
        itemCount: getCartItemCount(),
        totalAmount: getCartTotal()
      },
      createdAt: new Date().toISOString()
    };

    // 1. Log structured payload to console for developer inspectability
    console.info('[Khalid Café] Order payload ready for FastAPI backend submission:', orderPayload);

    // 2. Dispatch a clean custom event on document for future API integration
    document.dispatchEvent(new CustomEvent('khalid:order-ready', { detail: orderPayload }));

    // 3. Display structured confirmation state inside checkout view
    const form = document.getElementById('checkout-form');
    const confirmation = document.getElementById('checkout-confirmation');
    const detailsEl = document.getElementById('checkout-confirmation-details');

    if (form) form.style.display = 'none';
    if (confirmation) confirmation.classList.remove('is-hidden');

    if (detailsEl) {
      detailsEl.innerHTML = `
        <p><strong>Customer:</strong> ${escapeHTML(orderPayload.customer.name)} (${escapeHTML(orderPayload.customer.phone)})</p>
        <p><strong>Order Type:</strong> ${orderPayload.customer.orderType === 'dine-in' ? 'Dine-In' : 'Pickup / Takeaway'}</p>
        ${orderPayload.customer.instructions ? `<p><strong>Instructions:</strong> ${escapeHTML(orderPayload.customer.instructions)}</p>` : ''}
        <p><strong>Total Items:</strong> ${orderPayload.summary.itemCount} &bull; <strong>Total:</strong> ₹${orderPayload.summary.totalAmount}</p>
        <p style="margin-top:0.5rem; font-size:0.75rem; color:var(--color-primary);">
          &check; Payload captured in frontend. Ready to connect to FastAPI endpoint: <code>POST /api/orders</code>
        </p>
      `;
    }

    // 4. Clear the cart state after order capture
    clearCart();
  }

  /* ──────────────────────────────────────────
     6. INITIALIZATION & EVENT DELEGATION
  ────────────────────────────────────────── */

  function initCart() {
    drawerEl = document.getElementById('cart-drawer');
    backdropEl = document.getElementById('cart-backdrop');
    viewItemsEl = document.getElementById('cart-view-items');
    viewCheckoutEl = document.getElementById('cart-view-checkout');

    // 1. Render initial cart from localStorage
    renderCart();

    // 2. Navbar & Floating Cart Toggle Buttons
    const toggleBtn = document.getElementById('cart-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', openCart);
    }

    const floatingPill = document.getElementById('floating-cart-pill');
    if (floatingPill) {
      floatingPill.addEventListener('click', openCart);
    }

    // 3. Close & Backdrop Triggers
    const closeBtn = document.getElementById('cart-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeCart);

    const checkoutCloseBtn = document.getElementById('checkout-close-btn');
    if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', closeCart);

    if (backdropEl) backdropEl.addEventListener('click', closeCart);

    // Keyboard support: Escape closes drawer
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawerEl && drawerEl.classList.contains('is-open')) {
        closeCart();
      }
    });

    // 4. View Navigation inside Drawer
    const proceedCheckoutBtn = document.getElementById('cart-proceed-checkout-btn');
    if (proceedCheckoutBtn) {
      proceedCheckoutBtn.addEventListener('click', function () {
        if (cart.length > 0) switchView('checkout');
      });
    }

    const backBtn = document.getElementById('checkout-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        switchView('items');
      });
    }

    const clearAllBtn = document.getElementById('cart-clear-all-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function () {
        if (confirm('Are you sure you want to clear your cart?')) {
          clearCart();
        }
      });
    }

    const exploreMenuBtn = document.getElementById('cart-empty-explore-btn');
    if (exploreMenuBtn) {
      exploreMenuBtn.addEventListener('click', function () {
        closeCart();
      });
    }

    const newOrderBtn = document.getElementById('checkout-new-order-btn');
    if (newOrderBtn) {
      newOrderBtn.addEventListener('click', function () {
        switchView('items');
        closeCart();
      });
    }

    // 5. Delegated Item Quantity & Remove Clicks
    const itemsContainer = document.getElementById('cart-items-container');
    if (itemsContainer) {
      itemsContainer.addEventListener('click', function (e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const cartItemEl = btn.closest('.cart-item');
        if (!cartItemEl) return;

        const itemName = cartItemEl.getAttribute('data-item-name');
        const action = btn.getAttribute('data-action');
        const item = cart.find(function (i) { return i.name === itemName; });
        if (!item) return;

        if (action === 'increase') {
          updateQuantity(itemName, item.quantity + 1);
        } else if (action === 'decrease') {
          updateQuantity(itemName, item.quantity - 1);
        } else if (action === 'remove') {
          removeItem(itemName);
        }
      });
    }

    // 6. Connect Menu Card "+ Add" Buttons
    const addButtons = document.querySelectorAll('.menu-card__add-btn');
    addButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();

        const name = btn.getAttribute('data-item') || 'Menu Item';
        const price = parseInt(btn.getAttribute('data-price'), 10) || 0;

        // Find product image from card
        const card = btn.closest('.menu-card');
        let image = 'images/menu-coffee.png';
        if (card) {
          const imgEl = card.querySelector('.menu-card__image');
          if (imgEl && imgEl.getAttribute('src')) {
            image = imgEl.getAttribute('src');
          }
        }

        addToCart({ name: name, price: price, image: image });

        // Visual feedback on button
        const originalText = btn.innerHTML;
        btn.innerHTML = '&#10003; Added';
        btn.classList.add('is-added');

        setTimeout(function () {
          btn.innerHTML = originalText;
          btn.classList.remove('is-added');
        }, 900);
      });
    });

    // 7. Checkout Form Submit Handler
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearFormErrors();

        const formData = new FormData(checkoutForm);
        const customerData = {
          name: formData.get('name') || '',
          phone: formData.get('phone') || '',
          orderType: formData.get('orderType') || 'pickup',
          instructions: formData.get('instructions') || ''
        };

        const errors = validateCheckout(customerData);

        if (Object.keys(errors).length > 0) {
          if (errors.name) {
            const nameErr = document.getElementById('checkout-name-error');
            const nameInput = document.getElementById('checkout-name');
            if (nameErr) nameErr.textContent = errors.name;
            if (nameInput) {
              nameInput.classList.add('has-error');
              nameInput.focus();
            }
          }
          if (errors.phone) {
            const phoneErr = document.getElementById('checkout-phone-error');
            const phoneInput = document.getElementById('checkout-phone');
            if (phoneErr) phoneErr.textContent = errors.phone;
            if (phoneInput) {
              phoneInput.classList.add('has-error');
              if (!errors.name) phoneInput.focus();
            }
          }
          return;
        }

        submitOrder(customerData);
      });

      // Clear input errors on live typing
      const nameInput = document.getElementById('checkout-name');
      if (nameInput) {
        nameInput.addEventListener('input', function () {
          this.classList.remove('has-error');
          const err = document.getElementById('checkout-name-error');
          if (err) err.textContent = '';
        });
      }

      const phoneInput = document.getElementById('checkout-phone');
      if (phoneInput) {
        phoneInput.addEventListener('input', function () {
          this.classList.remove('has-error');
          const err = document.getElementById('checkout-phone-error');
          if (err) err.textContent = '';
        });
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
  } else {
    initCart();
  }

  // Expose clean namespace on window for external inspection and future FastAPI hook
  window.KhalidCafeCart = {
    getCart: function () { return [...cart]; },
    addToCart: addToCart,
    updateQuantity: updateQuantity,
    removeItem: removeItem,
    clearCart: clearCart,
    openCart: openCart,
    closeCart: closeCart,
    submitOrder: submitOrder
  };
})();

