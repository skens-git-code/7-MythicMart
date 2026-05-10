import React from 'react';
import { ArrowUpRight, Play, ShieldCheck, Sparkles, Star, TrendingUp } from 'lucide-react';
import products from '../../data/products';
import { formatPrice } from '../../utils/formatters';
import { ROUTES, toHashPath } from '../../utils/routes';
import '../../styles/HeroSection.css';

const heroProduct = products[3];
const miniProducts = [products[0], products[1], products[2]];
const colorSwatches = ['#2f6fed', '#ff8a1f', '#16a34a', '#ef4444', '#22c8cf'];

const HeroSection = () => {
  return (
    <section className="hero-section" aria-label="MythicMart premium shopping experience">
      <div className="hero-copy">
        <span className="hero-badge">
          <Sparkles size={15} aria-hidden="true" />
          AI-curated luxury commerce
        </span>
        <h1 className="hero-title">
          MythicMart Luxe Commerce OS.
        </h1>
        <p className="hero-subtitle">
          A futuristic storefront and dashboard experience for premium products, intelligent discovery,
          real-time operations, and smooth customer journeys.
        </p>
        <div className="hero-actions">
          <a href="#products" className="primary-btn">
            Explore products <ArrowUpRight size={19} aria-hidden="true" />
          </a>
          <a href={toHashPath(ROUTES.DASHBOARD)} className="secondary-btn">
            <Play size={18} fill="currentColor" aria-hidden="true" /> View dashboard
          </a>
        </div>
      </div>

      <div className="hero-experience" aria-label="Featured product command board">
        <div className="hero-feature-card">
          <div className="hero-card-copy">
            <span className="micro-label">
              <ShieldCheck size={14} aria-hidden="true" />
              Featured drop
            </span>
            <h2>{heroProduct.name}</h2>
            <p>{heroProduct.description}</p>
            <div className="hero-product-meta">
              <span>{formatPrice(heroProduct.price)}</span>
              <span><Star size={14} fill="currentColor" aria-hidden="true" /> {heroProduct.rating}</span>
            </div>
          </div>

          <div className="hero-product-stage">
            <img
              src={heroProduct.image}
              alt={heroProduct.name}
              className="hero-product-image"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              width="640"
              height="640"
            />
            <span className="stage-ring one" aria-hidden="true" />
            <span className="stage-ring two" aria-hidden="true" />
            <div className="floating-spec spec-top">
              <strong>{heroProduct.aiScore}%</strong>
              <span>AI match</span>
            </div>
            <div className="floating-spec spec-bottom">
              <TrendingUp size={15} aria-hidden="true" />
              <span>Trending</span>
            </div>
          </div>
        </div>

        <aside className="hero-side-panel" aria-label="Popular product shortcuts">
          <article className="color-card">
            <div>
              <span className="micro-label">Popular colors</span>
              <p>Personalized palettes</p>
            </div>
            <div className="swatch-row" aria-hidden="true">
              {colorSwatches.map((color) => (
                <span key={color} style={{ '--swatch': color }} />
              ))}
            </div>
          </article>

          <article className="spotlight-card">
            <div>
              <span className="micro-label">New Gen</span>
              <h3>{products[0].name}</h3>
            </div>
            <img src={products[0].image} alt="" aria-hidden="true" loading="lazy" />
            <a href={toHashPath(`/products/${products[0].slug}`)} aria-label={`View ${products[0].name}`}>
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </article>
        </aside>

        <div className="hero-bottom-grid">
          <article className="mini-gallery-card">
            <div>
              <strong>More products</strong>
              <span>460 plus curated items</span>
            </div>
            <div className="mini-gallery">
              {miniProducts.map((product) => (
                <img src={product.image} alt="" aria-hidden="true" loading="lazy" key={product.id} />
              ))}
            </div>
          </article>

          <article className="social-proof-card">
            <div className="avatar-stack" aria-hidden="true">
              <span>RA</span>
              <span>NC</span>
              <span>EP</span>
            </div>
            <strong>5m+</strong>
            <span>personalized recommendations delivered</span>
          </article>

          <article className="release-card">
            <span className="micro-label">Popular</span>
            <h3>Listening Has Been Released</h3>
            <div className="release-footer">
              <span><Star size={14} fill="currentColor" aria-hidden="true" /> 4.7</span>
              <a href={toHashPath(ROUTES.PRODUCTS)} aria-label="Open product catalog">
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
