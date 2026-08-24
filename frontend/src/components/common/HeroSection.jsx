import React from 'react';
import { ArrowUpRight, Play, Sparkles } from 'lucide-react';
import { ROUTES, toHashPath } from '../../utils/routes';
import '../../styles/HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero" id="home" aria-label="MythicMart premium shopping experience">
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
          <a href={toHashPath(ROUTES.PRODUCTS)} className="hero-btn primary">
            Explore products <ArrowUpRight size={19} aria-hidden="true" />
          </a>
          <a href={toHashPath(ROUTES.SERVICES)} className="hero-btn outline">
            <Play size={18} aria-hidden="true" /> See how it works
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
