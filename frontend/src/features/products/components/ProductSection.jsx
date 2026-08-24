import React, { useCallback, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowRight, Check, Heart, ShoppingBag, SlidersHorizontal, Sparkles, Star, Truck } from 'lucide-react';
import { useCart } from '../../../hooks/useCart';
import { useToast } from '../../../context/ToastContext';
import { useUI } from '../../../context/UIContext';
import { useAuth } from '../../../context/AuthContext';
import { useProducts } from '../../../hooks/useProducts';
import { api } from '../../../services/api';
import CategoryFilter from './CategoryFilter';
import { formatPrice } from '../../../utils/formatters';
import { CATEGORIES } from '../../../utils/constants';
import { ROUTES, toHashPath } from '../../../utils/routes';
import '../../../styles/ProductSection.css';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price low' },
  { value: 'price-desc', label: 'Price high' },
];

const ProductSkeleton = () => (
  <article className="glass-card skeleton-card" aria-hidden="true">
    <div className="product-image-container skeleton" />
    <div className="product-details" style={{ padding: '20px' }}>
      <div className="skeleton-line short" />
      <div className="skeleton-line long" />
      <div className="skeleton-line medium" />
    </div>
  </article>
);

const getCategoryFromHash = () => {
  if (typeof window === 'undefined') return 'all';
  const query = window.location.hash.split('?')[1] || '';
  const category = new URLSearchParams(query).get('category');
  return CATEGORIES.some(item => item.id === category) ? category : 'all';
};

const ProductSection = ({ title = 'Trending and Featured Collections', eyebrow = 'Live catalog' }) => {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { searchQuery, clearSearch } = useUI();
  const [activeCategory, setActiveCategory] = useState(getCategoryFromHash);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const trimmedSearch = searchQuery.trim();
  const { products: displayProducts, loading, error, pagination } = useProducts(activeCategory, sort, trimmedSearch, page, 12);

  React.useEffect(() => { setPage(1); }, [activeCategory, sort, trimmedSearch]);

  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category);
    const query = category === 'all' ? '' : `?category=${encodeURIComponent(category)}`;
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${ROUTES.PRODUCTS}${query}`);
  }, []);

  const handleAddToCart = useCallback((product) => {
    addItem(product);
    addToast(`Added ${product.name} to cart`, 'success');
  }, [addItem, addToast]);

  const handleWishlist = useCallback(async (product) => {
    if (!user) {
      addToast('Sign in to save products to your wishlist', 'info');
      return;
    }

    if (!product._id) {
      addToast('Wishlist sync is unavailable while the catalog is offline', 'info');
      return;
    }

    try {
      const response = await api.post(`/users/wishlist/${product._id}`);
      if (!response.success) throw new Error(response.error || 'Wishlist sync failed');
      addToast(`${product.name} saved to wishlist`, 'success');
    } catch (err) {
      addToast(err.error || 'Could not save this product right now', 'error');
    }
  }, [user, addToast]);

  return (
    <section id="products" className="section-transition" aria-label="Product catalog">
      <div className="container">
        <div className="product-section-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="hero-subtitle">
              <Sparkles size={15} aria-hidden="true" style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'text-bottom' }} />
              {eyebrow}
            </span>
            <h2 className="section-title text-left" style={{ marginBottom: '10px' }}>{title}</h2>
            <p className="elegant-text" style={{ maxWidth: '600px' }}>
              Discover premium products with category browsing, cached API search, AI-style ranking signals,
              and fast add-to-cart interactions.
            </p>
          </div>
          <div className="catalog-control-panel glass-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '30px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{loading ? 'Syncing catalog' : `${displayProducts.length} products`}</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <SlidersHorizontal size={15} aria-hidden="true" color="var(--clr-primary)" />
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products" style={{ background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {sortOptions.map((option) => (
                  <option value={option.value} key={option.value} style={{ background: 'var(--c-surface-solid)' }}>{option.label}</option>
                ))}
              </select>
            </label>
            {trimmedSearch && (
              <button type="button" className="hero-btn outline" style={{ height: '36px', minWidth: 'auto', padding: '0 15px' }} onClick={clearSearch}>
                Clear
              </button>
            )}
          </div>
        </div>

        <CategoryFilter activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

        {error && (
          <div className="glass-card" role="status" style={{ padding: '20px', textAlign: 'center', color: 'var(--warning)', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div className="projects-grid" role="list">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={`product-skeleton-${index}`} />)
          ) : displayProducts.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <strong style={{ fontSize: '1.2rem', color: 'var(--clr-primary)' }}>No products found</strong>
              <p className="elegant-text">Try a different category or search term.</p>
            </div>
          ) : (
            displayProducts.map((product) => (
              <article
                key={product.id}
                className="project-card glass-card"
                role="listitem"
                style={{ '--product-accent': product.accent || 'var(--clr-primary)' }}
                aria-label={`${product.name}, ${formatPrice(product.price)}`}
              >
                <div className="image-hover-zoom" style={{ position: 'relative' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="project-img"
                    loading="lazy"
                    decoding="async"
                    width="520"
                    height="520"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                      event.currentTarget.parentElement.classList.add('image-load-failed');
                    }}
                  />
                  {product.badge && (
                    <span className="talk-date" style={{ left: '18px', right: 'auto', backgroundColor: 'var(--clr-primary)', color: '#000' }}>
                      {product.badge}
                    </span>
                  )}
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--glass-bg)', backdropFilter: 'var(--blur)', border: 'var(--glass-border)', color: 'var(--text)' }}
                    aria-label={`Save ${product.name} to wishlist`}
                    onClick={() => handleWishlist(product)}
                  >
                    <Heart size={17} aria-hidden="true" />
                  </button>
                </div>

                <div className="project-content">
                  <div className="project-tech" style={{ marginBottom: '8px' }}>
                    <span className="tech-tag"><Check size={12} strokeWidth={3} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {product.stock > 0 ? 'In stock' : 'Out of stock'}</span>
                    {product.freeShipping && <span className="tech-tag" style={{ background: 'rgba(0, 255, 140, 0.1)', color: 'var(--clr-green)', borderColor: 'rgba(0, 255, 140, 0.2)' }}><Truck size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Free ship</span>}
                    <span className="tech-tag" style={{ background: 'rgba(255, 199, 0, 0.1)', color: 'var(--clr-gold)', borderColor: 'rgba(255, 199, 0, 0.2)' }}><Star size={12} fill="currentColor" style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {product.rating}</span>
                  </div>

                  <span style={{ fontSize: '0.8rem', color: 'var(--clr-primary-lt)', fontWeight: '600' }}>{product.brand || 'MythicMart'}</span>
                  <h3 className="project-title" style={{ margin: '4px 0 8px' }}>{product.name}</h3>
                  <p className="project-desc" style={{ marginBottom: '15px' }}>{product.description}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', marginBottom: '20px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>AI fit</span>
                    <strong style={{ color: 'var(--clr-primary)' }}>{product.aiScore || 92}%</strong>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${product.aiScore || 92}%`, height: '100%', background: 'var(--clr-grad)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid var(--c-border)' }}>
                    <div>
                      <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text)', display: 'block' }}>{formatPrice(product.price)}</span>
                      {product.originalPrice && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(product.originalPrice)}</span>}
                    </div>
                    <button
                      className="cta-button"
                      style={{ height: '40px', minWidth: '100px', padding: '0 20px', fontSize: '0.85rem' }}
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <ShoppingBag size={16} aria-hidden="true" />
                      <span>{product.stock > 0 ? 'Add' : 'Unavailable'}</span>
                    </button>
                  </div>

                  <a href={toHashPath(`/products/${product.slug || product.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)', justifyContent: 'center', marginTop: '15px', textDecoration: 'none' }}>
                    View premium detail <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
        {!loading && pagination.pages > 1 && (
          <nav className="catalog-pagination" aria-label="Product pages">
            <button type="button" className="hero-btn outline" onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page === 1}><ArrowLeft size={15} /> Previous</button>
            <span aria-live="polite">Page {pagination.page} of {pagination.pages}</span>
            <button type="button" className="hero-btn outline" onClick={() => setPage(value => Math.min(pagination.pages, value + 1))} disabled={page >= pagination.pages}>Next <ArrowRight size={15} /></button>
          </nav>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
