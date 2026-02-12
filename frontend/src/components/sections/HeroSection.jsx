import React from 'react';
import { ArrowRight, Play, Trophy } from 'lucide-react';
import '../../styles/HeroSection.css';

/* Hero banner with headline, CTA buttons, and featured product showcase */
const HeroSection = () => {
    return (
        <section className="hero-section" aria-label="Hero banner">
            {/* Left: headline + CTA */}
            <div className="hero-content">
                <span className="hero-badge" role="status">New Arrival</span>
                <h1 className="hero-title">
                    The Future of <br />
                    <span className="text-gradient">Shopping</span> is Here
                </h1>
                <p className="hero-subtitle">
                    Experience the next generation of e-commerce. Immersive, fast, and
                    beautiful.
                </p>
                <div className="hero-actions">
                    <a href="#products" className="primary-btn" role="button">
                        Start Exploring <ArrowRight size={20} aria-hidden="true" />
                    </a>
                    <button className="secondary-btn" aria-label="Watch product demo video">
                        <Play size={20} fill="currentColor" aria-hidden="true" /> Watch Demo
                    </button>
                </div>
            </div>

            {/* Right: featured product image with floating cards */}
            <div className="hero-image-container" aria-hidden="true">
                <div className="hero-product-display">
                    <img
                        src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80"
                        alt="Obsidian Chronograph"
                        className="hero-watch-image"
                    />
                    {/* Rewards card overlay */}
                    <div className="hero-card rewards-card">
                        <div className="card-header">
                            <div className="rewards-title">
                                <Trophy size={16} strokeWidth={2.5} />
                                <span>Rewards</span>
                            </div>
                            <span className="rewards-tier">Gold</span>
                        </div>
                        <div className="rewards-balance">
                            <div className="rewards-content">
                                <span className="rewards-label">Balance</span>
                                <strong className="rewards-amount">$240.00</strong>
                            </div>
                            <div className="rewards-chart">
                                <div className="chart-bar" style={{ height: '40%' }}></div>
                                <div className="chart-bar" style={{ height: '70%' }}></div>
                                <div className="chart-bar active" style={{ height: '100%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating indicator pills */}
                <div className="floating-element float-1">
                    <span>⚡ Flash Sale</span>
                </div>
                <div className="floating-element float-2">
                    <span>🚚 Free Shipping</span>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
