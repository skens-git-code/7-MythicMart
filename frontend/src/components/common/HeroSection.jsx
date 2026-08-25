// components/HeroSection.jsx
import React from 'react';
import { ArrowUpRight, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom'; // if using React Router
import { ROUTES, toHashPath } from '../../utils/routes';
import '../../styles/HeroSection.css';

/**
 * HeroSection – Main introduction for the brand
 * @param {Object} props
 * @param {string} props.subtitle - The subtitle text (e.g., "AI-curated luxury commerce")
 * @param {string} props.title - The main headline (supports HTML, e.g., "MythicMart Luxe<br />...")
 * @param {string} props.description - The descriptive paragraph
 * @param {Object} props.primaryButton - { text, href, icon }
 * @param {Object} props.secondaryButton - { text, href, icon }
 */
const HeroSection = ({
  subtitle = 'AI-curated luxury commerce',
  title = 'MythicMart Luxe<br /><span class="text-gradient">Commerce OS.</span>',
  description = 'A futuristic storefront and dashboard experience for premium products, intelligent discovery, real-time operations, and smooth customer journeys.',
  primaryButton = { text: 'Explore products', href: ROUTES.PRODUCTS, icon: ArrowUpRight },
  secondaryButton = { text: 'See how it works', href: ROUTES.SERVICES, icon: Play },
}) => {
  // Use Link if available, else fallback to <a>
  const LinkComponent = typeof Link !== 'undefined' ? Link : 'a';
  const linkProps = (href) => ({
    to: href, // for Link
    href: toHashPath(href), // for <a>
  });

  return (
    <section className="hero" id="home" aria-label="MythicMart premium shopping experience">
      <div className="hero-content">
        <span className="hero-subtitle">
          <Sparkles size={15} className="hero-subtitle-icon" aria-hidden="true" />
          {subtitle}
        </span>

        <h1 className="hero-title-fade-in" dangerouslySetInnerHTML={{ __html: title }} />

        <p className="hero-description">{description}</p>

        <div className="hero-buttons stagger-animation">
          <LinkComponent
            {...linkProps(primaryButton.href)}
            className="hero-btn primary"
            data-testid="hero-primary-btn"
          >
            {primaryButton.text}
            {primaryButton.icon && <primaryButton.icon size={19} aria-hidden="true" />}
          </LinkComponent>

          <LinkComponent
            {...linkProps(secondaryButton.href)}
            className="hero-btn outline"
            data-testid="hero-secondary-btn"
          >
            {secondaryButton.icon && <secondaryButton.icon size={18} aria-hidden="true" />}
            {secondaryButton.text}
          </LinkComponent>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HeroSection);