import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Heart,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Sun,
  UserRound,
  X,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCart } from '../../hooks/useCart';
import { useUI } from '../../context/UIContext';
import { primaryNavLinks } from '../../data/siteContent';
import products from '../../data/products';
import { ROUTES, toHashPath } from '../../utils/routes';
import '../../styles/GlassNavbar.css';

const suggestionLimit = 4;

const GlassNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { totalCount } = useCart();
  const { openCart, searchQuery, setSearchQuery } = useUI();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 18);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const searchSuggestions = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    const source = term
      ? products.filter((product) =>
          [product.name, product.category, product.brand, product.collection]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        )
      : products.filter((product) => product.badge || product.aiScore > 94);

    return source.slice(0, suggestionLimit);
  }, [searchQuery]);

  const runSearch = useCallback(() => {
    window.location.hash = toHashPath(ROUTES.PRODUCTS).replace(/^#/, '');
    window.setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    closeMobileMenu();
    setIsSearchActive(false);
  }, [closeMobileMenu]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    runSearch();
  };

  const handleSuggestionClick = (name) => {
    setSearchQuery(name);
    runSearch();
  };

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
      setIsSearchActive(false);
    }
  }, [closeMobileMenu]);

  return (
    <nav aria-label="Main navigation" onKeyDown={handleKeyDown}>
      <div className={`glass-nav-main-island ${isScrolled ? 'scrolled' : ''}`}>
        <a href={toHashPath(ROUTES.HOME)} className="navbar-logo" aria-label="MythicMart home">
          <span className="logo-icon" aria-hidden="true">M</span>
          <span className="logo-lockup">
            <span className="logo-text">MythicMart</span>
            <span className="logo-subtitle">Luxe OS</span>
          </span>
        </a>

        <div className="navbar-primary-links desktop-only" aria-label="Primary">
          {primaryNavLinks.slice(0, 5).map((link) => (
            <a href={toHashPath(link.path)} key={link.path}>{link.label}</a>
          ))}
        </div>

        <form className="navbar-search-container desktop-only" role="search" onSubmit={handleSearchSubmit}>
          <label htmlFor="desktop-search" className="sr-only">Search products</label>
          <Sparkles size={16} className="search-leading-icon" aria-hidden="true" />
          <input
            id="desktop-search"
            type="search"
            placeholder="Search products, collections, categories..."
            className="navbar-search-input"
            autoComplete="off"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setIsSearchActive(true)}
          />
          <button type="submit" className="navbar-search-btn" aria-label="Search">
            <Search size={18} strokeWidth={2.5} aria-hidden="true" />
          </button>
          {isSearchActive && searchSuggestions.length > 0 && (
            <div className="search-suggestions" role="listbox" aria-label="Search suggestions">
              <div className="suggestion-header">
                <span>AI recommendations</span>
                <SlidersHorizontal size={14} aria-hidden="true" />
              </div>
              {searchSuggestions.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  className="suggestion-row"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionClick(product.name)}
                >
                  <img src={product.image} alt="" aria-hidden="true" loading="lazy" />
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.collection || product.category}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="navbar-actions desktop-only" role="toolbar" aria-label="User actions">
          <button
            className={`icon-btn ${theme === 'dark' ? 'active' : ''}`}
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
          </button>

          <a className="icon-btn" aria-label="Notifications" href={toHashPath(ROUTES.NOTIFICATIONS)}>
            <Bell size={19} aria-hidden="true" />
            <span className="notification-dot" aria-hidden="true" />
          </a>

          <a className="icon-btn heart-btn" aria-label="Wishlist" href={toHashPath(ROUTES.WISHLIST)}>
            <Heart size={19} strokeWidth={2.5} aria-hidden="true" />
          </a>

          <button
            className="icon-btn"
            type="button"
            aria-label={`Shopping cart, ${totalCount} items`}
            onClick={openCart}
          >
            <ShoppingBag size={19} strokeWidth={2.5} aria-hidden="true" />
            {totalCount > 0 && <span className="cart-badge" aria-hidden="true">{totalCount}</span>}
          </button>

          <a className="user-profile" aria-label="User profile" href={toHashPath(ROUTES.PROFILE)}>
            <span className="user-name">Ryman Alex</span>
            <span className="avatar-container" aria-hidden="true">
              <UserRound size={18} />
            </span>
          </a>
        </div>

        <button
          className="mobile-menu-btn"
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
        aria-hidden={!isMobileMenuOpen}
      >
        <form className="mobile-search" role="search" onSubmit={handleSearchSubmit}>
          <label htmlFor="mobile-search" className="sr-only">Search products</label>
          <input
            id="mobile-search"
            type="search"
            placeholder="Search MythicMart"
            className="mobile-search-input"
            autoComplete="off"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button type="submit" className="mobile-search-btn" aria-label="Search">
            <Search size={18} aria-hidden="true" />
          </button>
        </form>

        <div className="mobile-links" role="list">
          {primaryNavLinks.map((link) => (
            <a key={link.label} href={toHashPath(link.path)} className="mobile-link" role="listitem" onClick={closeMobileMenu}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="mobile-actions">
          <button className="mobile-action-btn" type="button" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="mobile-action-btn" type="button" aria-label={`Cart, ${totalCount} items`} onClick={openCart}>
            <ShoppingBag size={18} aria-hidden="true" /> Cart {totalCount > 0 && `(${totalCount})`}
          </button>
          <a className="mobile-action-btn" aria-label="Wishlist" href={toHashPath(ROUTES.WISHLIST)} onClick={closeMobileMenu}>
            <Heart size={18} aria-hidden="true" /> Wishlist
          </a>
          <a className="mobile-action-btn" aria-label="Notifications" href={toHashPath(ROUTES.NOTIFICATIONS)} onClick={closeMobileMenu}>
            <Bell size={18} aria-hidden="true" /> Alerts
          </a>
        </div>
      </div>
    </nav>
  );
};

export default GlassNavbar;
