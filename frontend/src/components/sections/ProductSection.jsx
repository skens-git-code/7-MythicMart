import React, { useCallback, useState } from 'react';
import { ArrowUpRight, Check, Heart, ShoppingBag, SlidersHorizontal, Sparkles, Star, Truck } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../context/ToastContext';
import { useUI } from '../../context/UIContext';
import { useProducts } from '../../hooks/useProducts';
import CategoryFilter from '../ui/CategoryFilter';
import { formatPrice } from '../../utils/formatters';
import { toHashPath } from '../../utils/routes';
import '../../styles/ProductSection.css';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price low' },
  { value: 'price-desc', label: 'Price high' },
];

const ProductSkeleton = () => (
  <article className="product-card skeleton-card" aria-hidden="true">
    <div className="product-image-container skeleton" />
    <div className="product-details">
      <div className="skeleton-line short" />
      <div className="skeleton-line long" />
      <div className="skeleton-line medium" />
    </div>
  </article>
);

const ProductSection = ({ title = 'Trending and Featured Collections', eyebrow = 'Live catalog' }) => {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { searchQuery, clearSearch } = useUI();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState('newest');

  const trimmedSearch = searchQuery.trim();
  const { products: displayProducts, loading, error } = useProducts(activeCategory, sort, trimmedSearch);

  const handleAddToCart = useCallback((product) => {
    addItem(product);
    addToast(`Added ${product.name} to cart`, 'success');
  }, [addItem, addToast]);

  const handleWishlist = useCallback((product) => {
    addToast(`${product.name} saved to wishlist`, 'success');
  }, [addToast]);

  return (
    <section id="products" className="product-section" aria-label="Product catalog">
      <div className="product-section-header">
        <div>
          <span className="section-eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            {eyebrow}
          </span>
          <h2 className="section-title">{title}</h2>
          <p>
            Discover premium products with category browsing, cached API search, AI-style ranking signals,
            and fast add-to-cart interactions.
          </p>
        </div>
        <div className="catalog-control-panel">
          <span>{loading ? 'Syncing catalog' : `${displayProducts.length} products visible`}</span>
          <label>
            <SlidersHorizontal size={15} aria-hidden="true" />
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
              {sortOptions.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          {trimmedSearch && (
            <button type="button" className="clear-search-btn" onClick={clearSearch}>
              Clear search
            </button>
          )}
        </div>
      </div>

      <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {error && (
        <div className="product-error-state" role="status">
          Showing resilient offline catalog data while the API reconnects.
        </div>
      )}

      <div className="product-grid" role="list">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={`product-skeleton-${index}`} />)
        ) : displayProducts.length === 0 ? (
          <div className="empty-state">
            <strong>No products found</strong>
            <p>Try a different category or search term.</p>
          </div>
        ) : (
          displayProducts.map((product) => (
            <article
              key={product.id}
              className="product-card"
              role="listitem"
              style={{ '--product-accent': product.accent || '#2f6fed' }}
              aria-label={`${product.name}, ${formatPrice(product.price)}`}
            >
              <div className="product-image-container">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                  decoding="async"
                  width="520"
                  height="520"
                />
                {product.badge && (
                  <span className={`product-badge badge-${product.badge.toLowerCase().replace(' ', '-')}`}>
                    {product.badge}
                  </span>
                )}
                <button
                  type="button"
                  className="wishlist-btn"
                  aria-label={`Save ${product.name} to wishlist`}
                  onClick={() => handleWishlist(product)}
                >
                  <Heart size={17} aria-hidden="true" />
                </button>
              </div>

              <div className="product-details">
                <div className="product-meta-row">
                  <span className="meta-badge stock-badge"><Check size={12} strokeWidth={3} /> In stock</span>
                  {product.freeShipping && <span className="meta-badge shipping-badge"><Truck size={12} /> Free ship</span>}
                  <span className="meta-badge rating-badge"><Star size={12} fill="currentColor" /> {product.rating}</span>
                </div>

                <span className="product-brand">{product.brand || 'MythicMart'}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>

                <div className="ai-fit-row">
                  <span>AI fit</span>
                  <strong>{product.aiScore || 92}%</strong>
                  <div aria-hidden="true"><span style={{ width: `${product.aiScore || 92}%` }} /></div>
                </div>

                <div className="product-footer">
                  <div className="product-price-container">
                    <span className="current-price">{formatPrice(product.price)}</span>
                    {product.originalPrice && <span className="original-price">{formatPrice(product.originalPrice)}</span>}
                  </div>
                  <button
                    className="add-btn"
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingBag size={17} aria-hidden="true" />
                    <span>Add</span>
                  </button>
                </div>

                <a className="product-detail-link" href={toHashPath(`/products/${product.slug || product.id}`)}>
                  View premium detail <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default ProductSection;
