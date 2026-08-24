# 🛍️ MythicMart
## A Premium,E-commerce Experience

<div align="center">

[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.3.9-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.16.0-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=700&size=32&duration=2500&pause=800&color=646CFF&center=true&vCenter=true&width=600&height=60&lines=Glassmorphism+UI;React+18+%2B+Vite;Context+API;Responsive+Design" alt="Typing SVG" />

[View Demo](https://skens-git-code.github.io/7-MythicMart/) · [Report Bug](issues) · [Request Feature](issues)

</div>

---

<br>

## 📖 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [💻 Technology Stack](#-technology-stack)
- [🏗 Project Architecture](#-project-architecture)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🧩 Component Deep Dive](#-component-deep-dive)
- [📦 State Management](#-state-management)
- [🎨 Styling & Theming](#-styling--theming)
- [📡 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgements](#-acknowledgements)

---

## 🌟 Overview

**MythicMart** is not just another e-commerce platform—it's a **visual journey**. Built with a "premium-first" mindset, MythicMart leverages modern web technologies to deliver a seamless, responsive, and aesthetically stunning shopping experience.

At its core, MythicMart embraces the **Glassmorphism** design trend—featuring translucent, frosted-glass elements, vivid gradients, and floating shapes that create a sense of depth and immersion. Whether you're browsing the hero section or managing your cart, every interaction is designed to feel fluid and polished.

> *"E-commerce should feel magical, not transactional."*

This project serves as a showcase of advanced React patterns, custom hook implementation, context-based state management, and the power of raw CSS for creating bespoke user interfaces without relying on heavy UI libraries.

---

## ✨ Key Features

### 🎨 **Immersive Glassmorphism UI**

| Feature | Implementation | Impact |
|:--------|:---------------|:-------|
| **Frosted Glass** | `backdrop-filter: blur(20px) saturate(180%)` | Depth & Modernity |
| **Animated Gradients** | CSS keyframes + absolute positioning | Living, breathing interface |
| **Floating Blobs** | 6 gradient orbs, 20s animation cycles | Visual intrigue |
| **Responsive Glass** | Adaptive blur values for mobile | Performance optimized |

### 🛒 **Intelligent Shopping Cart**

```javascript
// Smart cart with derived state
const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  
  const addToCart = (product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  
  const total = items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  
  return (
    <CartContext.Provider value={{ items, addToCart, total }}>
      {children}
    </CartContext.Provider>
  );
};
```

### 🌓 **Theme Personalization**
- **Dark/Light Mode** — Seamless toggle with CSS custom properties
- **System Preference Detection** — Matches `prefers-color-scheme`
- **Persistent Choice** — localStorage synchronization
- **Smooth Transitions** — 0.3s ease color transitions

### ⚡ **Performance Optimized**
- **Vite-Powered** — Sub-second HMR, optimized production builds
- **Code Splitting** — Route-based lazy loading
- **Memoized Components** — Prevent unnecessary component updates
- **Tree Shaking** — Eliminate dead code

---

## 💻 Technology Stack

### 🎨 **Frontend Ecosystem**

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Core** | React 18.2.0 | UI library with concurrent features |
| **Build** | Vite 4.3.9 | Next-gen frontend tooling |
| **Icons** | Lucide React | Consistent, lightweight SVG icons |
| **State** | Context API | Native React global state |
| **Styling** | CSS3 | Custom properties, Flexbox, Grid |
| **Animations** | CSS Keyframes | 60fps hardware-accelerated |

### ⚙️ **Backend Ecosystem**

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Runtime** | Node.js 18.16.0 | JavaScript server environment |
| **Framework** | Express 4.18.2 | Minimalist web framework |
| **Config** | Dotenv | Environment variable management |
| **Dev** | Nodemon | Auto-restart on file changes |

---

## 🏗 Project Architecture

```
7-MythicMart/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📄 app.js          # Express app configuration
│   │   └── 📄 server.js       # Server entry point
│   ├── 📄 package.json        # Backend dependencies
│   └── 📄 .env.example        # Environment template
│
├── 📁 frontend/
│   ├── 📁 public/             # Static assets
│   │   └── 📄 favicon.svg     # Site icon
│   │
│   ├── 📁 src/
│   │   ├── 📁 assets/         # Images, fonts, icons
│   │   │   └── 📁 images/     # Product photography
│   │   │
│   │   ├── 📁 components/     # Reusable UI components
│   │   │   ├── 📁 layout/     # Structural components
│   │   │   │   ├── 📄 GlassNavbar.jsx
│   │   │   │   └── 📄 Footer.jsx
│   │   │   │
│   │   │   ├── 📁 sections/   # Page sections
│   │   │   │   ├── 📄 HeroSection.jsx
│   │   │   │   ├── 📄 ProductSection.jsx
│   │   │   │   └── 📄 StatsSection.jsx
│   │   │   │
│   │   │   └── 📁 ui/         # Generic UI elements
│   │   │       ├── 📄 GlassButton.jsx
│   │   │       ├── 📄 ProductCard.jsx
│   │   │       └── 📄 CartIcon.jsx
│   │   │
│   │   ├── 📁 context/        # Global state
│   │   │   ├── 📄 CartContext.jsx
│   │   │   └── 📄 ThemeContext.jsx
│   │   │
│   │   ├── 📁 hooks/          # Custom React hooks
│   │   │   ├── 📄 useCart.js
│   │   │   └── 📄 useTheme.js
│   │   │
│   │   ├── 📁 services/       # API integration
│   │   │   └── 📄 productService.js
│   │   │
│   │   ├── 📁 styles/         # Global styles
│   │   │   ├── 📄 index.css   # CSS variables, reset
│   │   │   └── 📄 glass.css   # Glassmorphism utilities
│   │   │
│   │   ├── 📁 utils/          # Helper functions
│   │   │   ├── 📄 formatters.js
│   │   │   └── 📄 constants.js
│   │   │
│   │   ├── 📄 App.jsx         # Main component
│   │   └── 📄 main.jsx        # React entry point
│   │
│   ├── 📄 index.html          # HTML template
│   ├── 📄 vite.config.js      # Vite configuration
│   └── 📄 package.json        # Frontend dependencies
│
└── 📄 README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Purpose |
|:------------|:--------|:--------|
| **Node.js** | ≥ 14.0.0 | JavaScript runtime |
| **npm** | ≥ 6.0.0 | Package manager |
| **Git** | ≥ 2.0.0 | Version control |

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/7-MythicMart.git
cd 7-MythicMart
```

#### 2️⃣ Setup Backend Server

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

**Expected Output:**
```
🚀 Server running on http://localhost:5000
📡 API ready at /api
```

#### 3️⃣ Setup Frontend Client

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

**Expected Output:**
```
  VITE v4.3.9  ready in 320ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.x:5173/
```

#### 4️⃣ Verify Installation

Open [http://localhost:5173](http://localhost:5173) in your browser. You should see the MythicMart hero section with animated glassmorphism effects.

---

## 🧩 Component Deep Dive

### 🥂 `<GlassNavbar />`

The crown jewel of the UI—a navigation bar that exemplifies glassmorphism.

```jsx
// src/components/layout/GlassNavbar.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useCart } from '../../hooks/useCart';

export const GlassNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo">
        <span className="logo-icon">🛡️</span>
        MythicMart
      </div>
      
      <div className="nav-actions">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="cart-wrapper">
          <CartIcon count={cartCount} />
        </div>
      </div>
    </nav>
  );
};
```

**CSS Magic:**
```css
.glass-nav {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-nav.scrolled {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(25px) saturate(200%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

---

### 🎯 `<HeroSection />`

Designed to grab attention immediately with cinematic typography and floating elements.

```jsx
// src/components/sections/HeroSection.jsx
export const HeroSection = () => (
  <section className="hero">
    <div className="floating-blob blob-1"></div>
    <div className="floating-blob blob-2"></div>
    <div className="floating-blob blob-3"></div>
    
    <div className="hero-content glass-card">
      <h1 className="hero-title">
        Discover the <span className="gradient-text">Mythic</span> in Shopping
      </h1>
      <p className="hero-subtitle">
        Where premium design meets seamless functionality
      </p>
      <GlassButton to="/shop" size="large">
        Explore Collection
      </GlassButton>
    </div>
  </section>
);
```

**Floating Blob Animation:**
```css
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(50px, 30px) scale(1.1); }
  50% { transform: translate(20px, 60px) scale(0.95); }
  75% { transform: translate(-30px, 20px) scale(1.05); }
}

.floating-blob {
  animation: float 20s infinite ease-in-out;
  filter: blur(60px);
  opacity: 0.6;
}
```

---

### 🃏 `<ProductCard />`

Glassmorphic product display with hover interactions.

| Feature | Implementation | Feedback |
|:--------|:---------------|:---------|
| **Card Lift** | `transform: translateY(-8px)` | 0.3s ease |
| **Image Zoom** | `transform: scale(1.05)` | 0.4s cubic-bezier |
| **Quick Add** | Appears on hover | Slide up animation |
| **Price Tag** | Glass overlay | Subtle gradient |

---

## 📦 State Management

### 🎭 **Context Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    PROVIDER HIERARCHY                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────┐     │
│   │            ThemeProvider                   │     │
│   │  • theme state (dark/light)              │     │
│   │  • toggleTheme()                        │     │
│   └────────────────┬────────────────────────────┘     │
│                    │                                   │
│                    ▼                                   │
│   ┌─────────────────────────────────────────────┐     │
│   │            CartProvider                    │     │
│   │  • items array                           │     │
│   │  • addToCart()                         │     │
│   │  • removeFromCart()                   │     │
│   │  • total quantity & price             │     │
│   └─────────────────────────────────────────────┘     │
│                    │                                   │
│                    ▼                                   │
│   ┌─────────────────────────────────────────────┐     │
│   │               App Component                 │     │
│   │         Consumer of all contexts           │     │
│   └─────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 🪝 **Custom Hooks**

```javascript
// src/hooks/useCart.js
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

// Usage in components
const { items, addToCart, removeFromCart, total } = useCart();
```

### 📊 **State Shape**

```javascript
// Cart State
{
  items: [
    {
      id: "prod_123",
      name: "Mythic Sword",
      price: 299.99,
      quantity: 2,
      image: "/assets/sword.jpg"
    }
  ],
  totalItems: 2,
  subtotal: 599.98,
  tax: 48.00,
  grandTotal: 647.98
}

// Theme State
{
  theme: "dark", // "dark" | "light"
  systemPreference: "dark",
  toggleTheme: () => {}
}
```

---

## 🎨 Styling & Theming

### 🎭 **CSS Custom Properties**

```css
/* src/styles/index.css */
:root {
  /* Glass Effects */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  --glass-blur: blur(20px);
  
  /* Colors */
  --primary: #646cff;
  --primary-dark: #535bf2;
  --secondary: #ff6b6b;
  --success: #34c759;
  --warning: #ff9500;
  --error: #ff3b30;
  
  /* Text */
  --text-main: #213547;
  --text-secondary: #6c757d;
  --text-light: #f8f9fa;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Animation */
  --transition-fast: 0.2s ease;
  --transition-base: 0.3s ease;
  --transition-slow: 0.5s ease;
}

[data-theme='dark'] {
  --glass-bg: rgba(0, 0, 0, 0.2);
  --glass-border: rgba(255, 255, 255, 0.08);
  --text-main: rgba(255, 255, 255, 0.87);
  --text-secondary: rgba(255, 255, 255, 0.6);
}
```

### 🧊 **Glassmorphism Utilities**

```css
/* src/styles/glass.css */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur) saturate(180%);
  -webkit-backdrop-filter: var(--glass-blur) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-base);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
}

.glass-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.glass-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px var(--primary);
}
```

---

## 📡 API Documentation

### 🌐 **Base URL**

```
Development: http://localhost:5000/api
Production:  https://api.mythicmart.com/v1
```

### 📋 **Endpoints**

#### Products

| Method | Endpoint | Description | Response |
|:-------|:---------|:------------|:---------|
| **GET** | `/products` | Fetch all products | `{ products: [], total: 24 }` |
| **GET** | `/products/:id` | Fetch single product | `{ product: {} }` |
| **GET** | `/products/search?q=` | Search products | `{ products: [] }` |
| **GET** | `/products/category/:cat` | Filter by category | `{ products: [] }` |

#### Cart Operations

| Method | Endpoint | Description | Request Body |
|:-------|:---------|:------------|:-------------|
| **POST** | `/cart/checkout` | Process checkout | `{ items: [], total: 0 }` |

#### System

| Method | Endpoint | Description | Response |
|:-------|:---------|:------------|:---------|
| **GET** | `/health` | Server health check | `{ status: 'OK', timestamp }` |

### 📦 **Sample Response**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_123",
        "name": "Mythic Sword",
        "description": "Legendary blade forged in digital fire",
        "price": 299.99,
        "category": "weapons",
        "image": "/assets/sword.jpg",
        "inStock": true
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🤝 Contributing

### 📋 **Contribution Guidelines**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### 🎯 **Priority Areas**

| Area | Focus | Difficulty |
|:-----|:------|:-----------|
| **Performance** | Image optimization, code splitting | Intermediate |
| **Accessibility** | ARIA labels, keyboard navigation | Beginner |
| **Testing** | Jest + React Testing Library | Intermediate |
| **PWA** | Service workers, offline support | Advanced |

### 📏 **Code Standards**

```javascript
// ✅ Do this
import { useState, useEffect } from 'react';

// ❌ Avoid this
import React, { useState, useEffect } from 'react';

// ✅ Use named exports
export const ComponentName = () => {};

// ✅ CSS class naming (BEM-inspired)
.block__element--modifier
```

---

## 📄 License

**MIT License** — Free for personal and commercial use

```
Copyright (c) 2024 Sarthak Mathapati

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 🙏 Acknowledgements

### 🛠️ **Tools & Libraries**
- [Vite](https://vitejs.dev/) — Blazing fast build tool
- [Lucide Icons](https://lucide.dev/) — Beautiful, consistent icons
- [Glassmorphism Generator](https://glassmorphism.com/) — CSS generator
- [React](https://reactjs.org/) — UI library

### 🎨 **Inspiration**
- [Apple](https://apple.com) — Glassmorphism pioneer
- [Stripe](https://stripe.com) — Clean typography
- [Linear](https://linear.app) — Dark mode aesthetics

### 👨‍💻 **Developer**
- **Sarthak Mathapati** — Full Stack Developer

---

<div align="center">
  <br>
  
  
  <br>
  <br>
  
  <p>
    <strong>✨ Premium Glassmorphism · React 18 · Vite · Express ✨</strong>
  </p>
  
  <br>
  
  <table>
    <tr>
      <td align="center">
        <strong>Frontend</strong><br>
        React + Vite
      </td>
      <td align="center">
        <strong>Backend</strong><br>
        Node + Express
      </td>
      <td align="center">
        <strong>State</strong><br>
        Context API
      </td>
      <td align="center">
        <strong>Styling</strong><br>
        CSS3 + Glassmorphism
      </td>
    </tr>
  </table>
  
  <br>
  
  <p>
    Made with ❤️ by <strong>Sarthak Mathapati</strong>
  </p>
  
  <p>
    <a href="https://github.com/skens-git-code">
      <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" />
    </a>
    <a href="https://linkedin.com/in/sarthak-mathapati-b2b04430a">
      <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" />
    </a>
  </p>
  
  <br>
  
  <sub>© 2024 MythicMart · All Rights Reserved · 1st Full Stack E-commerce Project</sub>
  
  <br>
  <br>
  
  <a href="#-mythicmart">
    <img src="https://img.shields.io/badge/⬆️-Back%20to%20Top-646CFF?style=for-the-badge" />
  </a>
  
  <br>
  <br>
  
  <!-- Decorative elements -->
  ⚡ 🛡️ ⚡ 🛒 ⚡ 🎨 ⚡
  
</div>
