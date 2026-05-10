import React from 'react';
import { useTheme } from './hooks/useTheme';
import GlassNavbar from './components/layout/GlassNavbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/ui/CartDrawer';
import ToastContainer from './components/ui/Toast';
import AppRouter from './components/layout/AppRouter';
import './styles/App.css';

const App = () => {
  const { theme } = useTheme();

  return (
    <div className="app-container" data-theme={theme}>
      <div className="surface-bg" aria-hidden="true" />

      {/* Global UI Components */}
      <GlassNavbar />
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
