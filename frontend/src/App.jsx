import React from 'react';
import GlassNavbar from './components/layout/GlassNavbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import StatsSection from './components/sections/StatsSection';
import ProductSection from './components/sections/ProductSection';
import './styles/App.css';

/* Root layout — navbar, main content sections, and footer */
function App() {
  return (
    <div className="app-container">
      {/* Ambient gradient blobs */}
      <div className="gradient-bg" aria-hidden="true">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <a href="#main-content" className="skip-link">Skip to content</a>

      <header>
        <GlassNavbar />
      </header>

      {/* Main page content */}
      <main id="main-content" className="content-area">
        <HeroSection />
        <StatsSection />
        <ProductSection />
      </main>

      {/* Footer sits outside main for correct semantics */}
      <Footer />
    </div>
  );
}

export default App;
