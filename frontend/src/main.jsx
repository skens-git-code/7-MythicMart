import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './styles/index.css';

/* App entry — wraps App with ErrorBoundary, ThemeProvider, and CartProvider */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
