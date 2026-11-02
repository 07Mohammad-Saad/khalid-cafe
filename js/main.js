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

    /* Collect form data into a plain object */
    const formData = new FormData(form);
    const orderData = {};
    formData.forEach(function (value, key) {
      orderData[key] = value;
    });

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
    return 'Please specify what you would like to order.';
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
   7. SMOOTH SCROLL — for anchor links
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
   8. INIT ALL
────────────────────────────────────────── */
onDOMReady(function () {
  initNavbar();
  initHero();
  initMenuFilter();
  initOrderForm();
  initScrollReveal();
  initSmoothScroll();
});
