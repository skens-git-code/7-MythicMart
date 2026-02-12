import React from 'react';
import '../../styles/Footer.css';

/* Glassmorphism footer bar with brand, nav links, and social icons */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="glass-footer" role="contentinfo">
            <div className="footer-bar">
                <div className="footer-brand-minimal">
                    <span className="footer-logo-text">MythicMart</span>
                    <span className="footer-copyright">© {currentYear}</span>
                </div>

                <nav className="footer-nav-minimal">
                    <a href="#products">Shop</a>
                    <a href="#support">Support</a>
                    <a href="https://mathapati8.netlify.app/">About Me</a>
                    <a href="https://mathapati8.netlify.app/">Contact</a>
                </nav>

                <div className="footer-social-minimal">
                    <a href="https://mathapati8.netlify.app/" aria-label="Twitter" className="social-link-minimal">𝕏</a>
                    <a href="https://mathapati8.netlify.app/" aria-label="Instagram" className="social-link-minimal">IG</a>
                    <a href="https://mathapati8.netlify.app/" aria-label="LinkedIn" className="social-link-minimal">in</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
