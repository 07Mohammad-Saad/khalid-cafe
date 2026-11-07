/**
 * main.js — Khalid Café Frontend Logic
 *
 * Responsibilities:
 *  - Navbar scroll behaviour
 *  - Mobile menu toggle
 *  - Menu category filtering
 *  - Order form submission handler (frontend-only; API-ready structure)
 *  - Scroll-reveal animations
 *  - Hero loaded class
 *
 * NOTE (Future Backend):
 *  The order form's submitOrder() function is intentionally separated and
 *  structured to be easily wired to a Python API endpoint later:
 *
 *    fetch('/api/orders', { method: 'POST', body: JSON.stringify(data) })
 *
 *  No fake backend is implemented here.
 */

'use strict';

/* ──────────────────────────────────────────
   1. DOM READY HELPER
────────────────────────────────────────── */
function onDOMReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/* ──────────────────────────────────────────
   2. NAVBAR — scroll & mobile toggle
────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navbar-toggle');
  const navMenu = document.getElementById('navbar-nav');
  const navLinks = navMenu ? navMenu.querySelectorAll('.navbar__link') : [];

  if (!navbar) return;

  /* Scroll: add .is-scrolled when page scrolls past 60px */
  function handleScroll() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on init

  /* Mobile toggle */
  if (toggle && navMenu) {
    toggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  /* Close mobile menu when a nav link is clicked */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (navMenu) navMenu.classList.remove('is-open');
      if (toggle) toggle.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  /* Close mobile menu on outside click */
  document.addEventListener('click', function (event) {
    if (navMenu && navMenu.classList.contains('is-open')) {
      if (!navMenu.contains(event.target) && !toggle.contains(event.target)) {
        navMenu.classList.remove('is-open');
        toggle.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    }
  });
}

/* ──────────────────────────────────────────
   3. HERO — trigger loaded animation
────────────────────────────────────────── */
function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  /* Small delay so the bg image has time to paint */
  requestAnimationFrame(function () {
    hero.classList.add('is-loaded');
  });
}

/* ──────────────────────────────────────────
   4. MENU FILTER TABS
────────────────────────────────────────── */
function initMenuFilter() {
  const tabs = document.querySelectorAll('.menu-tab');
  const cards = document.querySelectorAll('.menu-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      /* Update active tab */
      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');

      const filter = tab.getAttribute('data-filter');

      /* Show / hide cards */
      cards.forEach(function (card) {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
}

/* ──────────────────────────────────────────
   5. ORDER FORM
   Structure is intentionally API-ready.
   When a backend exists, replace the
   simulateSubmit() call with a real fetch().
────────────────────────────────────────── */
function initOrderForm() {
  const form = document.getElementById('order-form');
  const statusEl = document.getElementById('order-form-status');
  const submitBtn = document.getElementById('order-submit-btn');

  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    /* If cart is empty, but an item is selected in dropdown, auto-add it to cart */
    const itemSelect = document.getElementById('order-item-select');
    const qtyInput = document.getElementById('order-item-qty');
    const currentCart = (window.KhalidCafeCart ? window.KhalidCafeCart.getCart() : []);

    if (currentCart.length === 0 && itemSelect && itemSelect.value) {
      const picked = CAFE_MENU_ITEMS.find(function (i) { return i.name === itemSelect.value; });
      if (picked && window.KhalidCafeCart) {
        const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;
        window.KhalidCafeCart.addToCart({
          name: picked.name,
          price: picked.price,
          quantity: qty,
          image: MENU_ITEM_IMAGES[picked.name] || 'images/menu-coffee.png'
        });
      }
    }

    const cartNow = (window.KhalidCafeCart ? window.KhalidCafeCart.getCart() : []);
    const formData = new FormData(form);
    const orderData = {};
    formData.forEach(function (value, key) {
      orderData[key] = value;
    });

    if (cartNow.length > 0) {
      orderData.items = cartNow.map(function (i) {
        return i.quantity + '× ' + i.name + ' (₹' + (i.price * i.quantity) + ')';
      }).join(', ');
    } else {
      orderData.items = '';
    }

    /* Validate required fields */
    const validationError = validateOrderData(orderData);
    if (validationError) {
      showFormStatus(statusEl, 'error', validationError);
      return;
    }

    /* Disable button during submission */
    setSubmitLoading(submitBtn, true);

    /*
     * ─── FUTURE BACKEND INTEGRATION POINT ───────────────────
     *
     * Replace simulateSubmit() with:
     *
     *   fetch('/api/orders', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(orderData)
     *   })
     *   .then(function (res) { return res.json(); })
     *   .then(function (data) {
     *     showFormStatus(statusEl, 'success', '✓ Order placed! We will call you to confirm.');
     *     form.reset();
     *     if (window.KhalidCafeCart) window.KhalidCafeCart.clearCart();
     *   })
     *   .catch(function (err) {
     *     showFormStatus(statusEl, 'error', 'Something went wrong. Please try again or call us.');
     *   })
     *   .finally(function () {
     *     setSubmitLoading(submitBtn, false);
     *   });
     *
     * ─────────────────────────────────────────────────────────
     */

    simulateSubmit(function (success) {
      setSubmitLoading(submitBtn, false);
      if (success) {
        showFormStatus(
          statusEl,
          'success',
          '✓ Your order request has been received! We\'ll call you shortly to confirm.'
        );
        form.reset();
        if (window.KhalidCafeCart) {
          window.KhalidCafeCart.clearCart();
        }
      } else {
        showFormStatus(
          statusEl,
          'error',
          '✗ Something went wrong. Please call us directly at +91 98765 43210.'
        );
      }
    });
  });
}

/**
 * Basic client-side validation.
 * Returns an error string if invalid, or null if valid.
 */
function validateOrderData(data) {
  if (!data.name || data.name.trim().length < 2) {
    return 'Please enter your full name.';
  }
  if (!data.phone || !/^[6-9]\d{9}$/.test(data.phone.trim())) {
    return 'Please enter a valid 10-digit Indian mobile number.';
  }
  if (!data.items || data.items.trim().length < 3) {
    return 'Please select at least one item from the menu.';
  }
  return null;
}

/**
 * Temporary placeholder — simulates async API call.
 * Remove this function when connecting a real backend.
 */
function simulateSubmit(callback) {
  setTimeout(function () {
    callback(true); // always succeeds in the frontend-only stage
  }, 900);
}

/** Show a status message below the form */
function showFormStatus(el, type, message) {
  if (!el) return;
  el.textContent = message;
  el.className = 'form-status';
  el.classList.add(type === 'success' ? 'is-success' : 'is-error');

  /* Auto-hide after 6 seconds */
  setTimeout(function () {
    el.className = 'form-status';
    el.textContent = '';
  }, 6000);
}

/** Toggle button loading state */
function setSubmitLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Sending…' : 'Place Order';
}

/* ──────────────────────────────────────────
   6. SCROLL-REVEAL using IntersectionObserver
────────────────────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  /* Fallback for browsers without IntersectionObserver */
  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(function (el) { observer.observe(el); });
}

/* ──────────────────────────────────────────
   7. ORDER ITEM PICKER (Dropdowns & Quantity)
────────────────────────────────────────── */
const CAFE_MENU_ITEMS = [
  // Coffee
  { name: 'Classic Cappuccino', price: 120, category: 'coffee' },
  { name: 'Cold Brew', price: 150, category: 'coffee' },
  { name: 'Café Mocha', price: 140, category: 'coffee' },
  // Food
  { name: 'Classic Club Sandwich', price: 180, category: 'food' },
  { name: 'Spicy Paneer Wrap', price: 160, category: 'food' },
  { name: 'Crispy Veg Burger', price: 50, category: 'food' },
  // Desserts
  { name: 'Chocolate Lava Cake', price: 200, category: 'dessert' },
  { name: 'Belgian Waffle', price: 175, category: 'dessert' },
  // Cold Drinks
  { name: 'Alphonso Mango Cooler', price: 130, category: 'beverage' },
  { name: 'Rose Lemonade', price: 110, category: 'beverage' },
  { name: 'Signature Mocktail', price: 150, category: 'beverage' },
  { name: 'Campa', price: 10, category: 'beverage' }
];

const MENU_ITEM_IMAGES = {
  'Classic Cappuccino': 'images/menu-coffee.png',
  'Cold Brew': 'images/menu-coffee.png',
  'Café Mocha': 'images/menu-coffee.png',
  'Classic Club Sandwich': 'images/menu-sandwich.png',
  'Spicy Paneer Wrap': 'images/menu-sandwich.png',
  'Crispy Veg Burger': 'images/menu-burger.jpg',
  'Chocolate Lava Cake': 'images/menu-dessert.png',
  'Belgian Waffle': 'images/menu-dessert.png',
  'Alphonso Mango Cooler': 'images/menu-coffee.png',
  'Rose Lemonade': 'images/menu-coffee.png',
  'Signature Mocktail': 'images/menu-mocktail.jpg',
  'Campa': 'images/menu-campa.jpg'
};

function initOrderPicker() {
  const categorySelect = document.getElementById('order-category-select');
  const itemSelect = document.getElementById('order-item-select');
  const qtyInput = document.getElementById('order-item-qty');
  const qtyMinus = document.getElementById('order-qty-minus');
  const qtyPlus = document.getElementById('order-qty-plus');
  const addBtn = document.getElementById('order-add-item-btn');
  const selectedList = document.getElementById('order-selected-list');
  const selectedEmpty = document.getElementById('order-selected-empty');
  const selectedTotal = document.getElementById('order-selected-total');
  const selectedTotalVal = document.getElementById('order-selected-total-val');
  const hiddenItemsInput = document.getElementById('order-items');
  const pickerError = document.getElementById('order-picker-error');
  const viewCartLink = document.getElementById('order-view-cart-link');
  const form = document.getElementById('order-form');

  if (!categorySelect || !itemSelect || !addBtn || !hiddenItemsInput) return;

  function escapeText(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function populateItems(filterCategory) {
    if (!itemSelect) return;

    // Clear options collection safely
    itemSelect.options.length = 0;

    // Add prompt option
    const promptOpt = new Option('-- Choose an item --', '');
    itemSelect.add(promptOpt);

    const filtered = (!filterCategory || filterCategory === 'all')
      ? CAFE_MENU_ITEMS
      : CAFE_MENU_ITEMS.filter(function (i) { return i.category === filterCategory; });

    filtered.forEach(function (item) {
      const opt = new Option(item.name + ' (₹' + item.price + ')', item.name);
      opt.setAttribute('data-category', item.category);
      opt.setAttribute('data-price', String(item.price));
      itemSelect.add(opt);
    });

    if (filtered.length > 0) {
      itemSelect.selectedIndex = 1;
      itemSelect.value = filtered[0].name;
    } else {
      itemSelect.selectedIndex = 0;
      itemSelect.value = '';
    }
  }

  /**
   * Render pre-order selected items synchronized with central cart store
   * @param {Array} [items] Optional item list from cart event
   */
  function renderOrderTray(items) {
    const cartItems = items || (window.KhalidCafeCart ? window.KhalidCafeCart.getCart() : []);

    if (!cartItems || cartItems.length === 0) {
      hiddenItemsInput.value = '';
      if (selectedEmpty) selectedEmpty.style.display = 'flex';
      if (selectedTotal) selectedTotal.classList.add('is-hidden');
      if (selectedList) selectedList.innerHTML = '';
      return;
    }

    if (selectedEmpty) selectedEmpty.style.display = 'none';
    if (selectedTotal) selectedTotal.classList.remove('is-hidden');

    let totalAmount = 0;
    let listHTML = '';
    const summaryParts = [];

    cartItems.forEach(function (item) {
      const lineTotal = item.price * item.quantity;
      totalAmount += lineTotal;
      summaryParts.push(item.quantity + '× ' + item.name + ' (₹' + lineTotal + ')');

      listHTML +=
        '<div class="order-selected-item" data-item-name="' + escapeText(item.name) + '">' +
          '<div class="order-selected-item__title">' +
            '<span class="order-selected-item__qty">' + item.quantity + '&times;</span>' +
            '<span class="order-selected-item__name">' + escapeText(item.name) + '</span>' +
            '<span class="order-selected-item__unit-price">(₹' + item.price + ' each)</span>' +
          '</div>' +
          '<span class="order-selected-item__price">₹' + lineTotal + '</span>' +
          '<button type="button" class="order-selected-item__remove" data-remove-name="' + escapeText(item.name) + '" aria-label="Remove ' + escapeText(item.name) + '">&times;</button>' +
        '</div>';
    });

    if (selectedList) selectedList.innerHTML = listHTML;
    if (selectedTotalVal) selectedTotalVal.textContent = '₹' + totalAmount;
    hiddenItemsInput.value = summaryParts.join(', ');

    if (pickerError) {
      pickerError.textContent = '';
      pickerError.classList.remove('is-visible');
    }
  }

  // Populate items on init
  populateItems(categorySelect.value || 'all');

  // Filter items by category (listen to both change and input)
  categorySelect.addEventListener('change', function () {
    populateItems(this.value);
  });
  categorySelect.addEventListener('input', function () {
    populateItems(this.value);
  });

  // Quantity stepper listeners
  if (qtyMinus && qtyInput) {
    qtyMinus.addEventListener('click', function () {
      const current = parseInt(qtyInput.value, 10) || 1;
      if (current > 1) {
        qtyInput.value = current - 1;
      }
    });
  }

  if (qtyPlus && qtyInput) {
    qtyPlus.addEventListener('click', function () {
      const current = parseInt(qtyInput.value, 10) || 1;
      if (current < 50) {
        qtyInput.value = current + 1;
      }
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('change', function () {
      let val = parseInt(this.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 50) val = 50;
      this.value = val;
    });
  }

  // Add Item button listener — adds to central cart
  addBtn.addEventListener('click', function () {
    const itemName = itemSelect.value;
    if (!itemName) {
      if (pickerError) {
        pickerError.textContent = 'Please choose an item from the dropdown.';
        pickerError.classList.add('is-visible');
      }
      return;
    }

    const menuItem = CAFE_MENU_ITEMS.find(function (i) { return i.name === itemName; });
    if (!menuItem) return;

    const qty = parseInt(qtyInput.value, 10) || 1;
    const img = MENU_ITEM_IMAGES[menuItem.name] || 'images/menu-coffee.png';

    // Add to single source of truth (KhalidCafeCart)
    if (window.KhalidCafeCart) {
      window.KhalidCafeCart.addToCart({
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        image: img
      });
    }

    // Reset quantity back to 1 by default
    qtyInput.value = '1';

    // Visual feedback on add button
    const origText = addBtn.innerHTML;
    addBtn.innerHTML = '&#10003; Added' + (qty > 1 ? ' (' + qty + ')' : '');
    addBtn.classList.add('is-added');

    setTimeout(function () {
      addBtn.innerHTML = origText;
      addBtn.classList.remove('is-added');
    }, 800);
  });

  // Remove Item delegation — removes from central cart
  if (selectedList) {
    selectedList.addEventListener('click', function (e) {
      const removeBtn = e.target.closest('[data-remove-name]');
      if (!removeBtn) return;
      const itemName = removeBtn.getAttribute('data-remove-name');
      if (itemName && window.KhalidCafeCart) {
        window.KhalidCafeCart.removeItem(itemName);
      }
    });
  }

  // View Cart link opens the global drawer
  if (viewCartLink) {
    viewCartLink.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.KhalidCafeCart) {
        window.KhalidCafeCart.openCart();
      }
    });
  }

  // Synchronize whenever cart updates anywhere on page
  window.addEventListener('khalid:cart-updated', function (e) {
    const items = (e.detail && Array.isArray(e.detail.items)) ? e.detail.items : null;
    renderOrderTray(items);
  });

  // Initial render from existing cart (e.g. from localStorage)
  renderOrderTray();

  if (form) {
    form.addEventListener('reset', function () {
      setTimeout(function () {
        populateItems('all');
        if (qtyInput) qtyInput.value = '1';
        renderOrderTray();
      }, 50);
    });
  }
}

/* ──────────────────────────────────────────
   8. SMOOTH SCROLL — for anchor links
────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      event.preventDefault();

      const navbarHeight = document.getElementById('navbar')
        ? document.getElementById('navbar').offsetHeight
        : 0;

      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}

/* ──────────────────────────────────────────
   9. INIT ALL
────────────────────────────────────────── */
onDOMReady(function () {
  initNavbar();
  initHero();
  initMenuFilter();
  initOrderForm();
  initOrderPicker();
  initScrollReveal();
  initSmoothScroll();
});
