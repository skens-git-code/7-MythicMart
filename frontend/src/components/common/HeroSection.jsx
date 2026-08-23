import React from 'react';
import { ArrowUpRight, Play, Sparkles } from 'lucide-react';
import { ROUTES, toHashPath } from '../../utils/routes';
import '../../styles/HeroSection.css'; // Might not need this if we rely completely on global index.css, but keeping for safety.

const HeroSection = () => {
  return (
    <section className="hero" id="home" aria-label="MythicMart premium shopping experience">
      <div className="hero-3d-container">
        {/* We can place 3D elements or extra ambient effects here if needed, 
            but global index.css already has gradients in App.jsx */}
      </div>

      <div className="hero-content">
        <span className="hero-subtitle">
          <Sparkles size={15} aria-hidden="true" style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'text-bottom' }} />
          AI-curated luxury commerce
        </span>
        
        <h1 className="hero-title-fade-in">
          MythicMart Luxe<br />
          <span className="text-gradient">Commerce OS.</span>
        </h1>
        
        <p className="hero-description">
          A futuristic storefront and dashboard experience for premium products, intelligent discovery,
          real-time operations, and smooth customer journeys.
        </p>
        
        <div className="hero-buttons stagger-animation">
          <a href="#products" className="hero-btn primary">
            Explore products <ArrowUpRight size={19} aria-hidden="true" />
          </a>
          <a href={toHashPath(ROUTES.DASHBOARD)} className="hero-btn outline">
            <Play size={18} aria-hidden="true" /> View dashboard
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
