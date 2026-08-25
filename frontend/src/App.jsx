import React from 'react';
import { useTheme } from './hooks/useTheme';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartDrawer from './features/cart/components/CartDrawer';
import ToastContainer from './components/common/Toast';
import AppRouter from './components/layout/AppRouter';
import './styles/App.css';
import './styles/ProductionPolish.css';

const App = () => {
  const { theme } = useTheme();

  return (
    <div className="app-container" data-theme={theme}>
      <div className="animated-bg" aria-hidden="true">
        <div className="gradients-container">
          <div className="gradient gradient-1"></div>
          <div className="gradient gradient-2"></div>
          <div className="gradient gradient-3"></div>
          <div className="gradient gradient-4"></div>
          <div className="gradient gradient-5"></div>
        </div>
        <div className="grid-overlay"></div>
        <div className="spotlight spotlight-1"></div>
        <div className="spotlight spotlight-2"></div>
        <div className="spotlight spotlight-3"></div>
      </div>

      {/* Global UI Components */}
      <Navbar />
      <CartDrawer />
      <ToastContainer />

      <main id="main-content" className="main-content">
        <AppRouter />
      </main>

      {/* Footer sits outside main for correct semantics */}
      <Footer />
    </div>
  );
}

export default App;
