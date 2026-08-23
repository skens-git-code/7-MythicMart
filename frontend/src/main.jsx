import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/index.css';

/* App entry — wraps App with ErrorBoundary and Context Providers */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <UIProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </UIProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
