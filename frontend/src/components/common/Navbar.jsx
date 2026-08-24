import React, { useEffect, useState } from 'react';
import { Bell, Heart, Menu, Moon, Search, ShoppingBag, Sun, UserRound, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCart } from '../../hooks/useCart';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { primaryNavLinks } from '../../data/siteContent';
import { ROUTES, toHashPath } from '../../utils/routes';
import { useRoute } from '../../hooks/useRoute';
import '../../styles/GlassNavbar.css';
import '../../styles/ResponsivePolish.css';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { totalCount } = useCart();
  const { openCart, searchQuery, setSearchQuery } = useUI();
  const { user } = useAuth();
  const route = useRoute();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, []);

  const go = (path) => {
    window.location.hash = toHashPath(path);
    setMobileOpen(false);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    go(ROUTES.PRODUCTS);
  };

  return (
    <header className="site-navbar">
      <div className="nav-container">
        <a className="port" href={toHashPath(ROUTES.HOME)} aria-label="MythicMart home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" focusable="false"><path d="M7 30V10l13 10L33 10v20M13 30V20m14 10V20" /></svg>
          </span>
          <span className="brand-wordmark"><span>Mythic</span>Mart</span>
        </a>

        <nav className="navbar-primary-links desktop-only" aria-label="Primary navigation">
          {primaryNavLinks.slice(0, 5).map((link) => <a className={`nav-link${route === link.path ? ' active' : ''}`} href={toHashPath(link.path)} key={link.path}>{link.label}</a>)}
        </nav>

        <form className="navbar-search-container desktop-only" role="search" onSubmit={submitSearch}>
          <label className="sr-only" htmlFor="desktop-search">Search products</label>
          <div className="navbar-search-field">
            <Search size={17} aria-hidden="true" />
            <input id="desktop-search" type="search" placeholder="Search products" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>
        </form>

        <div className="navbar-actions desktop-only">
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
          <a className="theme-toggle" aria-label="Notifications" href={toHashPath(ROUTES.NOTIFICATIONS)}><Bell size={19} /></a>
          <a className="theme-toggle" aria-label="Wishlist" href={toHashPath(ROUTES.WISHLIST)}><Heart size={19} /></a>
          <a className="theme-toggle" aria-label={user ? `Account: ${user.name}` : 'Login'} href={toHashPath(user ? ROUTES.DASHBOARD : ROUTES.LOGIN)}><UserRound size={19} /></a>
          <button className="theme-toggle cart-nav-button" type="button" onClick={openCart} aria-label={`Shopping cart, ${totalCount} items`}><ShoppingBag size={19} />{totalCount > 0 && <span className="cart-nav-count">{totalCount}</span>}</button>
        </div>

        <button className="mobile-menu-toggle" type="button" onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen} aria-controls="mobile-menu" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}>
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      <div id="mobile-menu" className={`mobile-menu-overlay${mobileOpen ? ' open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="mobile-menu-inner">
          <form className="mobile-search-form" role="search" onSubmit={submitSearch}>
            <label className="sr-only" htmlFor="mobile-search">Search products</label>
            <div className="navbar-search-field"><Search size={17} aria-hidden="true" /><input id="mobile-search" type="search" placeholder="Search products" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div>
          </form>
          <nav className="mobile-links" aria-label="Mobile navigation">
            {primaryNavLinks.map((link) => <a className="nav-link" href={toHashPath(link.path)} key={link.path}>{link.label}</a>)}
            <a className="nav-link" href={toHashPath(user ? ROUTES.DASHBOARD : ROUTES.LOGIN)}>{user ? `Account (${user.name})` : 'Login / Register'}</a>
          </nav>
          <div className="mobile-action-row">
            <button className="theme-toggle" type="button" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}<span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>
            <a className="theme-toggle" href={toHashPath(ROUTES.WISHLIST)}><Heart size={18} /><span>Wishlist</span></a>
            <button className="theme-toggle" type="button" onClick={() => { openCart(); setMobileOpen(false); }}><ShoppingBag size={18} /><span>Cart ({totalCount})</span></button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
