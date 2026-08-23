import React, { useState } from 'react';
import { Instagram, Linkedin, Twitter, ArrowRight } from 'lucide-react';
import { footerGroups } from '../../data/siteContent';
import { useToast } from '../../context/ToastContext';
import { toHashPath } from '../../utils/routes';
import '../../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { addToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      addToast(`Subscribed ${newsletterEmail} to MythicMart drops!`, 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-about">
          <div className="footer-logo">MythicMart</div>
          <p>
            Premium ecommerce meets calm SaaS-grade operations, AI recommendations, and secure checkout. Built for the future of digital storefronts.
          </p>
          <div className="social-icons">
            <a href="https://mathapati8.netlify.app/" aria-label="Visit portfolio/LinkedIn">
              <Linkedin size={18} />
            </a>
            <a href="https://twitter.com" aria-label="Visit Twitter profile">
              <Twitter size={18} />
            </a>
            <a href="https://instagram.com" aria-label="Visit Instagram profile">
              <Instagram size={18} />
            </a>
          </div>
        </div>

        {footerGroups.map((group) => (
          <div className="footer-links" key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.links.map((link) => (
                <li key={link.path}>
                  <a href={toHashPath(link.path)}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="newsletter-section-footer">
          <h4>Stay Updated</h4>
          <p>Get curated drops and operations insights.</p>
          <form className="newsletter-form" onSubmit={handleNewsletter}>
            <input
              type="email"
              placeholder="Email Address"
              className="newsletter-input"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit" className="hero-btn primary" style={{ minWidth: '0', padding: '0 20px', height: '100%', borderRadius: '25px' }} aria-label="Subscribe">
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="copyright">
        © {currentYear} MythicMart. Built for premium commerce.
      </div>
    </footer>
  );
};

export default Footer;
