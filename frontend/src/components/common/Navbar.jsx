// components/Navbar.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Bell, Heart, Menu, Moon, Search, ShoppingBag, Sun, UserRound, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // assuming React Router v6
import { useTheme } from '../../hooks/useTheme';
import { useCart } from '../../hooks/useCart';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { primaryNavLinks } from '../../data/siteContent';
import { ROUTES } from '../../utils/routes';
import '../../styles/GlassNavbar.css';
import '../../styles/ResponsivePolish.css';

// Helper to lock body scroll
const lockBodyScroll = (lock) => {
  document.body.style.overflow = lock ? 'hidden' : '';
};

// Focus trap for mobile menu
const useFocusTrap = (containerRef, isOpen) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const focusable = containerRef.current.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      if (e.key === 'Escape') {
        // close menu (handled by parent)
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    first?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, containerRef]);
};

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { totalCount } = useCart();
  const { openCart, searchQuery, setSearchQuery } = useUI();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Lock body scroll when mobile menu opens
  useEffect(() => {
    lockBodyScroll(mobileOpen);
    return () => lockBodyScroll(false);
  }, [mobileOpen]);

  // Focus trap
  useFocusTrap(mobileMenuRef, mobileOpen);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Navigation handler
  const navigateTo = useCallback(
    (path) => {
      navigate(path);
      setMobileOpen(false);
    },
    [navigate]
  );

  // Search submit
  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`${ROUTES.PRODUCTS}?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(ROUTES.PRODUCTS);
      }
    },
    [searchQuery, navigate]
  );

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  return (
    <header className="site-navbar">
      <div className="nav-container">
        {/* Brand */}
        <Link className="port" to={ROUTES.HOME} aria-label="MythicMart home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" focusable="false">
              <path d="M7 30V10l13 10L33 10v20M13 30V20m14 10V20" />
            </svg>
          </span>
          <span className="brand-wordmark"><span>Mythic</span>Mart</span>
        </Link>

        {/* Desktop Primary Nav */}
        <nav className="navbar-primary-links desktop-only" aria-label="Primary navigation">
          {primaryNavLinks.slice(0, 5).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link${location.pathname === link.path ? ' active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Search */}
        <form className="navbar-search-container desktop-only" role="search" onSubmit={handleSearchSubmit}>
          <label className="sr-only" htmlFor="desktop-search">Search products</label>
          <div className="navbar-search-field">
            <Search size={17} aria-hidden="true" />
            <input
              id="desktop-search"
              type="search"
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Desktop Actions */}
        <div className="navbar-actions desktop-only">
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <Link className="theme-toggle" aria-label="Notifications" to={ROUTES.NOTIFICATIONS}>
            <Bell size={19} />
          </Link>
          <Link className="theme-toggle" aria-label="Wishlist" to={ROUTES.WISHLIST}>
            <Heart size={19} />
          </Link>
          <Link
            className="theme-toggle"
            aria-label={user ? `Account: ${user.name}` : 'Login'}
            to={user ? ROUTES.DASHBOARD : ROUTES.LOGIN}
          >
            <UserRound size={19} />
          </Link>
          <button
            className="theme-toggle cart-nav-button"
            type="button"
            onClick={openCart}
            aria-label={`Shopping cart, ${totalCount} items`}
          >
            <ShoppingBag size={19} />
            {totalCount > 0 && <span className="cart-nav-count">{totalCount}</span>}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          type="button"
          onClick={toggleMobileMenu}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        ref={mobileMenuRef}
        className={`mobile-menu-overlay${mobileOpen ? ' open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        <div className="mobile-menu-inner">
          <form className="mobile-search-form" role="search" onSubmit={handleSearchSubmit}>
            <label className="sr-only" htmlFor="mobile-search">Search products</label>
            <div className="navbar-search-field">
              <Search size={17} aria-hidden="true" />
              <input
                id="mobile-search"
                type="search"
                placeholder="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          <nav className="mobile-links" aria-label="Mobile navigation">
            {primaryNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={user ? ROUTES.DASHBOARD : ROUTES.LOGIN}
              className="nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {user ? `Account (${user.name})` : 'Login / Register'}
            </Link>
          </nav>
          <div className="mobile-action-row">
            <button className="theme-toggle" type="button" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <Link className="theme-toggle" to={ROUTES.WISHLIST} onClick={() => setMobileOpen(false)}>
              <Heart size={18} />
              <span>Wishlist</span>
            </Link>
            <button
              className="theme-toggle"
              type="button"
              onClick={() => {
                openCart();
                setMobileOpen(false);
              }}
            >
              <ShoppingBag size={18} />
              <span>Cart ({totalCount})</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Navbar);