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
import { useAuth } from '../../context/AuthContext';
import { primaryNavLinks } from '../../data/siteContent';
import products from '../../data/products';
import { ROUTES, toHashPath } from '../../utils/routes';
import '../../styles/GlassNavbar.css';

const suggestionLimit = 4;

const GlassNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { totalCount } = useCart();
  const { openCart, searchQuery, setSearchQuery } = useUI();
  const { user } = useAuth();

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
    <header className={isScrolled ? 'scrolled' : ''} onKeyDown={handleKeyDown}>
      <div className="nav-container">
        <div className="nav-indicator"></div>
        <a href={toHashPath(ROUTES.HOME)} className="port" aria-label="MythicMart home">
          MythicMart
        </a>

        <div className="navbar-primary-links desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
          {primaryNavLinks.slice(0, 5).map((link) => (
            <a href={toHashPath(link.path)} key={link.path} className="nav-link">{link.label}</a>
          ))}
        </div>

        <form className="navbar-search-container desktop-only" role="search" onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', marginRight: '20px' }}>
          <label htmlFor="desktop-search" className="sr-only">Search products</label>
        <div
          style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
          onBlur={(e) => {
            // Close suggestions only if focus moves outside this container
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setIsSearchActive(false);
            }
          }}
        >
          <input
            id="desktop-search"
            type="search"
            placeholder="Search..."
            className="form-input"
            style={{ padding: '8px 16px', borderRadius: '20px', minWidth: '200px' }}
            autoComplete="off"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setIsSearchActive(true)}
          />
          {isSearchActive && searchSuggestions.length > 0 && (
            <div className="search-suggestions glass-card" role="listbox" style={{ position: 'absolute', top: '120%', right: '0', width: '300px', zIndex: 1000, padding: '16px' }}>
              <div className="suggestion-header" style={{ color: 'var(--clr-primary)', marginBottom: '10px' }}>
                <span>AI recommendations</span>
              </div>
              {searchSuggestions.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  className="suggestion-row"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionClick(product.name)}
                >
                  <img src={product.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} loading="lazy" />
                  <span>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>{product.name}</strong>
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{product.collection || product.category}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        </form>

        <div className="navbar-actions desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <a className="theme-toggle" aria-label="Notifications" href={toHashPath(ROUTES.NOTIFICATIONS)}>
            <Bell size={19} />
          </a>

          <a className="theme-toggle" aria-label="Wishlist" href={toHashPath(ROUTES.WISHLIST)}>
            <Heart size={19} />
          </a>

          <a
            className="theme-toggle"
            aria-label={user ? `Account: ${user.name}` : 'Login'}
            href={toHashPath(user ? ROUTES.DASHBOARD : ROUTES.LOGIN)}
            title={user ? `${user.name} (${user.role})` : 'Login / Register'}
          >
            <UserRound size={19} />
          </a>

          <button
            className="theme-toggle"
            style={{ position: 'relative' }}
            type="button"
            aria-label={`Shopping cart, ${totalCount} items`}
            onClick={openCart}
          >
            <ShoppingBag size={19} />
            {totalCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--clr-magenta)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>{totalCount}</span>}
          </button>
        </div>

        <button
          className="mobile-menu-toggle"
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          style={{ display: 'flex' }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        style={{ display: isMobileMenuOpen ? 'block' : 'none', position: 'fixed', inset: 0, background: 'var(--c-bg)', zIndex: 900, paddingTop: '100px' }}
      >
        <div style={{ padding: '20px' }}>
          {/* Mobile search */}
          <form role="search" onSubmit={(e) => { e.preventDefault(); runSearch(); }} style={{ marginBottom: '20px' }}>
            <label htmlFor="mobile-search" className="sr-only">Search products</label>
            <input
              id="mobile-search"
              type="search"
              placeholder="Search products..."
              className="form-input"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px' }}
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="mobile-links" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {primaryNavLinks.map((link) => (
              <a key={link.label} href={toHashPath(link.path)} className="nav-link" onClick={closeMobileMenu} style={{ fontSize: '1.2rem', padding: '10px' }}>
                {link.label}
              </a>
            ))}
            <a
              href={toHashPath(user ? ROUTES.DASHBOARD : ROUTES.LOGIN)}
              className="nav-link"
              onClick={closeMobileMenu}
              style={{ fontSize: '1.2rem', padding: '10px', color: 'var(--clr-primary)' }}
            >
              {user ? `Account (${user.name})` : 'Login / Register'}
            </a>
          </div>

          {/* Mobile action row */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--c-border)', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ flex: 1, minWidth: '44px', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <a
              href={toHashPath(ROUTES.WISHLIST)}
              className="theme-toggle"
              aria-label="Wishlist"
              onClick={closeMobileMenu}
              style={{ flex: 1, minWidth: '44px', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', textDecoration: 'none' }}
            >
              <Heart size={18} />
              <span>Wishlist</span>
            </a>
            <button
              type="button"
              className="theme-toggle"
              style={{ position: 'relative', flex: 1, minWidth: '44px', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}
              aria-label={`Shopping cart, ${totalCount} items`}
              onClick={() => { openCart(); closeMobileMenu(); }}
            >
              <ShoppingBag size={18} />
              <span>Cart</span>
              {totalCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--clr-magenta)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>{totalCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlassNavbar;
