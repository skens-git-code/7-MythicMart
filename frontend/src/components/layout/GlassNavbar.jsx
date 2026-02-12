import React, { useState, useCallback } from 'react';
import { Search, ShoppingBag, Heart, Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCart } from '../../hooks/useCart';
import '../../styles/GlassNavbar.css';

/* Glassmorphism floating navbar with search, actions, and mobile menu */
const GlassNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { totalCount } = useCart();

    const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

    /* Close mobile menu on Escape key */
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && isMobileMenuOpen) closeMobileMenu();
    }, [isMobileMenuOpen, closeMobileMenu]);

    return (
        <nav aria-label="Main navigation" onKeyDown={handleKeyDown}>
            {/* Desktop nav island */}
            <div className="glass-nav-main-island" role="banner">
                <a href="/" className="navbar-logo" aria-label="MythicMart home">
                    <span className="logo-icon" aria-hidden="true">MM</span>
                    <span className="logo-text">MYTHICMART</span>
                </a>

                {/* Search bar */}
                <form className="navbar-search-container desktop-only" role="search" onSubmit={e => e.preventDefault()}>
                    <label htmlFor="desktop-search" className="sr-only">Search products</label>
                    <input
                        id="desktop-search"
                        type="search"
                        placeholder="Search products..."
                        className="navbar-search-input"
                        autoComplete="off"
                    />
                    <button type="submit" className="navbar-search-btn" aria-label="Search">
                        <Search size={18} strokeWidth={2.5} aria-hidden="true" />
                    </button>
                </form>

                {/* Desktop action icons */}
                <div className="navbar-actions desktop-only" role="toolbar" aria-label="User actions">
                    {/* Theme toggle */}
                    <button
                        className={`icon-btn ${theme === 'dark' ? 'active' : ''}`}
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
                    </button>

                    {/* Cart */}
                    <button className="icon-btn" aria-label={`Shopping cart, ${totalCount} items`}>
                        <ShoppingBag size={20} strokeWidth={2.5} aria-hidden="true" />
                        <span className="cart-badge" aria-hidden="true">{totalCount}</span>
                    </button>

                    {/* Wishlist */}
                    <button className="icon-btn heart-btn" aria-label="Wishlist">
                        <Heart size={20} strokeWidth={2.5} aria-hidden="true" />
                    </button>

                    {/* User profile chip */}
                    <div className="user-profile" role="button" tabIndex={0} aria-label="User profile, Ryman Alex">
                        <span className="user-name">Arpita S</span>
                        <div className="avatar-container">
                            <img
                                src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&q=80"
                                alt="Ryman Alex profile"
                                className="user-avatar"
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#ddd" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="#999" font-size="40">RA</text></svg>')}`;
                                }}
                            />
                            <span className="status-dot" aria-label="Online"></span>
                        </div>
                    </div>
                </div>

                {/* Mobile hamburger toggle */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-menu"
                >
                    {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
                </button>
            </div>

            {/* Mobile fullscreen menu */}
            <div
                id="mobile-menu"
                className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile menu"
                aria-hidden={!isMobileMenuOpen}
            >
                <form className="mobile-search" role="search" onSubmit={e => e.preventDefault()}>
                    <label htmlFor="mobile-search" className="sr-only">Search products</label>
                    <input id="mobile-search" type="search" placeholder="Search products..." className="mobile-search-input" autoComplete="off" />
                    <button type="submit" className="mobile-search-btn" aria-label="Search">
                        <Search size={18} aria-hidden="true" />
                    </button>
                </form>

                <div className="mobile-links" role="list">
                    <a href="#main-content" className="mobile-link" role="listitem" onClick={closeMobileMenu}>Home <ArrowRight size={18} aria-hidden="true" /></a>
                    <a href="#products" className="mobile-link" role="listitem" onClick={closeMobileMenu}>Categories <ArrowRight size={18} aria-hidden="true" /></a>
                    <a href="#products" className="mobile-link" role="listitem" onClick={closeMobileMenu}>Trending <ArrowRight size={18} aria-hidden="true" /></a>
                    <a href="#products" className="mobile-link" role="listitem" onClick={closeMobileMenu}>Deals <ArrowRight size={18} aria-hidden="true" /></a>
                </div>

                <div className="mobile-actions">
                    <button className="mobile-action-btn" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button className="mobile-action-btn" aria-label={`Cart, ${totalCount} items`}>
                        <ShoppingBag size={18} aria-hidden="true" /> Cart {totalCount > 0 && `(${totalCount})`}
                    </button>
                    <button className="mobile-action-btn" aria-label="Wishlist">
                        <Heart size={18} aria-hidden="true" /> Wishlist
                    </button>
                    <button className="mobile-action-btn" aria-label="User profile">Profile</button>
                </div>
            </div>
        </nav>
    );
};

export default GlassNavbar;
