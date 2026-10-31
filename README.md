# ☕ Khalid Café — Website

A modern, premium static website for **Khalid Café**, Solapur, Maharashtra.

> **Purpose:** This is a cloud engineering learning project. The website is built as a clean static frontend foundation that will progressively gain backend features as part of a structured learning journey.

---

## 🗂️ Project Structure

```
khalid-cafe/
├── index.html          # Main HTML — all sections
├── css/
│   ├── base.css        # Design tokens, resets, shared utilities
│   ├── navbar.css      # Navigation bar
│   ├── hero.css        # Hero section
│   ├── menu.css        # Menu grid and cards
│   ├── sections.css    # About, Experience, Gallery, Order, Contact, Footer
│   └── responsive.css  # Media queries (tablet, mobile, small mobile)
├── js/
│   └── main.js         # All frontend JavaScript (no frameworks)
├── images/             # All image assets
│   ├── hero-bg.png
│   ├── about.png
│   ├── menu-coffee.png
│   ├── menu-sandwich.png
│   ├── menu-dessert.png
│   └── gallery-1.png
└── README.md
```

---

## 🚀 Running Locally

No build step required. Serve directly with any static HTTP server.

### Option 1 — Python (recommended for learning)
```bash
# Python 3
python -m http.server 8080

# Then open: http://localhost:8080
```

### Option 2 — Node.js
```bash
npx serve .
```

### Option 3 — VS Code Live Server
Install the **Live Server** extension and click "Go Live".

---

## 🛠️ Technology Stack

| Layer      | Technology        |
|------------|-------------------|
| Structure  | HTML5 (semantic)  |
| Styling    | Vanilla CSS       |
| Logic      | Vanilla JavaScript|
| Fonts      | Google Fonts (CDN)|
| Images     | Static PNG files  |

No frameworks. No build tools. No dependencies.

---

## 📋 Current Stage — Stage 1: Static Website

The website is fully frontend-only. The order form collects input and validates it client-side but does **not** send data anywhere yet.

---

## 🗺️ Learning Roadmap

| Stage | Topic                              | Status        |
|-------|------------------------------------|---------------|
| 1     | Static website (HTML/CSS/JS)       | ✅ Done       |
| 2     | Git & GitHub                       | ⬜ Next       |
| 3     | Linux server deployment            | ⬜ Planned    |
| 4     | Nginx web server                   | ⬜ Planned    |
| 5     | Reverse proxy                      | ⬜ Planned    |
| 6     | Python backend / REST API          | ⬜ Planned    |
| 7     | Database (PostgreSQL / SQLite)     | ⬜ Planned    |
| 8     | Authentication & Admin             | ⬜ Planned    |
| 9     | Docker & containers                | ⬜ Planned    |
| 10    | HTTPS / SSL (Let's Encrypt)        | ⬜ Planned    |
| 11    | Domain & DNS                       | ⬜ Planned    |
| 12    | CI/CD pipeline                     | ⬜ Planned    |
| 13    | Logging & monitoring               | ⬜ Planned    |
| 14    | Backups                            | ⬜ Planned    |
| 15    | Security hardening                 | ⬜ Planned    |
| 16    | Infrastructure automation (IaC)    | ⬜ Planned    |

---

## 🔌 Future Backend Integration Point

The order form in `js/main.js` has a clearly marked integration point:

```js
// FUTURE BACKEND INTEGRATION POINT
// Replace simulateSubmit() with:

fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
})
.then(res => res.json())
.then(data => { /* handle success */ })
.catch(err => { /* handle error */ });
```

When Stage 6 (Python API) is reached, simply replace `simulateSubmit()` with this `fetch()` call.

---

## 🎨 Design

- **Color palette:** Warm dark browns with golden amber accents
- **Typography:** Playfair Display (headings) + Inter (body) + Dancing Script (accents)
- **Animations:** CSS keyframes for hero entrance; IntersectionObserver for scroll-reveal
- **Responsive:** Desktop → Tablet (1024px) → Mobile (768px) → Small (480px)
- **Accessibility:** Semantic HTML, ARIA labels, focus-visible styles, reduced-motion support

---

## ✅ Code Standards

- No inline CSS
- No inline JavaScript  
- No secrets or API keys
- Relative asset paths (works with any base URL)
- Semantic HTML5 elements throughout
- Meaningful, consistent class naming (BEM-inspired)

---

## 📄 License

This project is for personal learning and portfolio use.

---

*Built with ☕ and curiosity.*
