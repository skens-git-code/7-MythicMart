import React from 'react';
import { ArrowRight, Instagram, Linkedin, ShieldCheck, Sparkles, Truck, Twitter } from 'lucide-react';
import { footerGroups } from '../../data/siteContent';
import { ROUTES, toHashPath } from '../../utils/routes';
import '../../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-footer" role="contentinfo">
      <section className="footer-command">
        <div className="footer-brand-panel">
          <span className="footer-logo-mark">M</span>
          <div>
            <span className="footer-logo-text">MythicMart</span>
            <p>Premium ecommerce meets calm SaaS-grade operations, AI recommendations, and secure checkout.</p>
          </div>
        </div>

        <form className="footer-newsletter" aria-label="Join MythicMart updates">
          <label htmlFor="footer-email">Get curated drops and operations insights</label>
          <div>
            <input id="footer-email" type="email" placeholder="you@company.com" />
            <button type="button" aria-label="Join updates">
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>

      <div className="footer-trust-row" aria-label="Trust signals">
        <span><ShieldCheck size={16} aria-hidden="true" /> Secure auth</span>
        <span><Truck size={16} aria-hidden="true" /> Tracked fulfillment</span>
        <span><Sparkles size={16} aria-hidden="true" /> AI recommendations</span>
      </div>

      <div className="footer-directory">
        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3>{group.title}</h3>
            {group.links.map((link) => (
              <a href={toHashPath(link.path)} key={link.path}>{link.label}</a>
            ))}
          </nav>
        ))}
      </div>

      <div className="footer-bar">
        <div className="footer-brand-minimal">
          <span className="footer-copyright">© {currentYear} MythicMart. Built for premium commerce.</span>
        </div>

        <nav className="footer-nav-minimal" aria-label="Quick footer links">
          <a href={toHashPath(ROUTES.PRODUCTS)}>Shop</a>
          <a href={toHashPath(ROUTES.SUPPORT)}>Support</a>
          <a href={toHashPath(ROUTES.ANALYTICS)}>Analytics</a>
          <a href={toHashPath(ROUTES.CONTACT)}>Contact</a>
        </nav>

        <div className="footer-social-minimal">
          <a href="https://mathapati8.netlify.app/" className="social-link-minimal" aria-label="Visit portfolio">
            <Linkedin size={18} />
          </a>
          <a href="#" className="social-link-minimal" aria-label="Visit Twitter profile">
            <Twitter size={18} />
          </a>
          <a href="#" className="social-link-minimal" aria-label="Visit Instagram profile">
            <Instagram size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
