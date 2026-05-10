import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './styles/index.css';

/* App entry — wraps App with ErrorBoundary and Context Providers */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <ThemeProvider>
        <CartProvider>
          <UIProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </UIProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
