
<div align="center">
# 🛍️ MythicMart
### A Premium, Glassmorphic E-commerce Experience

[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.3.9-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.16.0-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[View Demo](#) · [Report Bug](issues) · [Request Feature](issues)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Component Deep Dive](#-component-deep-dive)
- [State Management](#-state-management)
- [Styling & Theming](#-styling--theming)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🌟 Overview

**MythicMart** is not just another e-commerce platform; it's a visual journey. Built with a "premium-first" mindset, MythicMart leverages modern web technologies to deliver a seamless, responsive, and aesthetically stunning shopping experience.

At its core, MythicMart embraces the **Glassmorphism** design trend—featuring translucent, frosted-glass elements, vivid gradients, and floating shapes that create a sense of depth and immersion. Whether you're browsing the hero section or managing your cart, every interaction is designed to feel fluid and polished.

This project serves as a showcase of advanced React patterns, custom hook implementation, context-based state management, and the power of raw CSS for creating bespoke user interfaces without relying on heavy UI libraries.

---

## ✨ Key Features

### 🎨 Immersive Glassmorphism UI
-   **Frosted Glass Aesthetics**: Utilizing `backdrop-filter: blur()` and semi-transparent backgrounds to create a sleek, modern look.
-   **Dynamic Gradients**: Animated background blobs that shift and morph, giving the site a "living" feel.
-   **Responsive Design**: A mobile-first approach ensuring the premium experience translates perfectly to tablets and desktops.

### 🛒 Intelligent Shopping Cart
-   **Real-time Updates**: Instant feedback when adding/removing items.
-   **Persistent State**: Cart contents are preserved across sessions (implementation ready for `localStorage` integration).
-   **Smart Calculations**: Automatic computation of subtotals, taxes, and grand totals.

### 🌓 Theme Personalization
-   **Dark/Light Mode**: Seamless toggle that inverts the color palette while maintaining the glassmorphic integrity.
-   **System Preference Detection**: Automatically aligns with the user's OS settings on first load.

### ⚡ Performance Optimized
-   **Vite-Powered**: Blazing fast hot module replacement (HMR) and optimized build times.
-   **Lazy Loading**: Components are loaded only when needed to improve initial load speed.
-   **Efficient Re-renders**: Optimized React components using `memo` and `useCallback` where necessary.

---

## 💻 Technology Stack

MythiMart is built on a robust MERN-adjacent stack (excluding MongoDB for this demo version, replaced with mock data service).

### Frontend
| Technology | Description |
| :--- | :--- |
| **React** | The core library for building the user interface. |
| **Vite** | Next-generation frontend tooling for ultra-fast development. |
| **CSS3** | Custom properties (variables), Flexbox, Grid, and Animations. |
| **Lucide React** | Beautiful, consistent, and lightweight icons. |
| **Context API** | Native state management for Cart and Theme global states. |

### Backend
| Technology | Description |
| :--- | :--- |
| **Node.js** | JavaScript runtime for the server-side environment. |
| **Express** | Fast, unopinionated, minimalist web framework for Node.js. |
| **Dotenv** | Zero-dependency module that loads environment variables. |
| **Nodemon** | Utility that monitors for changes and automatically restarts the server. |

---

## 🏗 Project Architecture

The project is structured to ensure scalability and maintainability.

```text
7-MythicMart/
├── backend/                # Express server and API logic
│   ├── src/
│   │   ├── app.js          # App configuration
│   │   └── server.js       # Server entry point
│   └── package.json        # Backend dependencies
├── frontend/               # React client application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── assets/         # Images and icons
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Structural components (Navbar, Footer)
│   │   │   ├── sections/   # Page sections (Hero, Product, Stats)
│   │   │   └── ui/         # Generic UI elements (Buttons, Inputs)
│   │   ├── context/        # Global state (Cart, Theme)
│   │   ├── hooks/          # Custom Hooks (useCart)
│   │   ├── services/       # API integration services
│   │   ├── styles/         # Global and Component CSS
│   │   ├── utils/          # Helper functions (formatters)
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # React DOM entry point
│   ├── index.html          # HTML template
│   └── vite.config.js      # Vite configuration
└── README.md               # Project Documentation
```

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

*   **Node.js**: Ensure you have Node.js installed (v14.0.0 or higher recommended).
*   **npm**: Usually comes with Node.js.

### Installation

1.  **Clone the repository**
    ```sh
    git clone https://github.com/yourusername/7-MythicMart.git
    cd 7-MythicMart
    ```

2.  **Setup Backend**
    ```sh
    cd backend
    npm install
    # Create a .env file if needed (see .env.example)
    npm run dev
    ```
    The server should start on `http://localhost:5000` (or your configured port).

3.  **Setup Frontend**
    Open a new terminal window.
    ```sh
    cd frontend
    npm install
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

---

## 🧩 Component Deep Dive

### `<GlassNavbar />`
The navigation bar is the crown jewel of the UI. It uses a semi-transparent white background with a high blur value to ensure legibility over the moving background blobs.
-   **Scroll Effect**: Changes opacity on scroll.
-   **Code Highlight**:
    ```javascript
    // src/components/layout/GlassNavbar.jsx
    <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo">MythicMart</div>
      <CartIcon count={cartCount} />
    </nav>
    ```

### `<HeroSection />`
Designed to grab attention immediately. It features large typography, a clear Call-to-Action (CTA), and floating 3D-like elements implemented purely in CSS.

### `<ProductSection />`
Displays items in a responsive grid. Each card features:
-   Hover effects that lift the card.
-   "Quick Add" button visible on hover.
-   Glassmorphic overlay for price tags.

---

## 📦 State Management

We avoid "prop drilling" by utilizing React's Context API.

### Cart Context (`CartContext.jsx`)
Manages the shopping cart state.
-   `cartItems`: Array of product objects.
-   `addToCart(item)`: Handles adding logic (deduplication or quantity increment).
-   `removeFromCart(id)`: Removes item by ID.
-   `total`: Derived state calculating the final price.

### Custom Hook: `useCart`
We encapsulate the Context consumption in a custom hook for cleaner component code.
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
```

---

## 🎨 Styling & Theming

### CSS Variables
We use a robust set of CSS variables in `index.css` to manage colors, spacing, and glass effects. This makes theming incredibly easy.

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  --primary-color: #646cff;
  --text-main: #213547;
}

[data-theme='dark'] {
  --glass-bg: rgba(0, 0, 0, 0.2);
  --text-main: #ffffff;
}
```

### The "Blob" Background
The animated background is created using absolute positioned `div`s with high border-radius and CSS keyframe animations to translate and rotate them continuously.

---

## 📡 API Documentation

While this project focuses on the frontend, the backend structure is ready to scale.

### Base URL
`http://localhost:5000/api`

### Endpoints (Draft)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/products` | Retrieve all products. |
| **GET** | `/products/:id` | Retrieve a single product by ID. |
| **POST** | `/cart/checkout` | Process payment (Mock). |
| **GET** | `/status` | Server health check. |

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

-   [Vite Documentation](https://vitejs.dev/guide/)
-   [React Documentation](https://reactjs.org/docs/getting-started.html)
-   [Glassmorphism Generator](https://glassmorphism.com/)
-   [Lucide Icons](https://lucide.dev/)

---

<div align="center">
  <p>Made with by Sarthak.</p>
</div>