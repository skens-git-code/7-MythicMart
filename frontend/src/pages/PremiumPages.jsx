import React from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Filter,
  Heart,
  Headphones,
  LockKeyhole,
  Mail,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  TicketPercent,
  Truck,
  UserRound,
  RefreshCcw,
} from 'lucide-react';
import HeroSection from '../components/common/HeroSection';
import ProductSection from '../features/products/components/ProductSection';
import AuthPanel from '../features/auth/components/AuthPanel';
import {
  analyticsSeries,
  blogPosts,
  careers,
  categoryShowcase,
  faqItems,
  footerGroups,
  helpTopics,
  operationsCards,
  orderTimeline,
  recommendationCards,
  serviceCards,
  testimonials,
} from '../data/siteContent';
import { useCart } from '../hooks/useCart';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { CATEGORIES } from '../utils/constants';
import { ROUTES, toHashPath } from '../utils/routes';
import { formatPrice } from '../utils/formatters';
import { normalizeProduct } from '../utils/assets';
import { api } from '../services/api';
import '../styles/PremiumPages.css';

const PageHero = ({ eyebrow, title, description, actions, compact = false }) => (
  <section className={`page-hero ${compact ? 'compact' : ''}`}>
    <div>
      <span className="page-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {actions && <div className="page-hero-actions">{actions}</div>}
  </section>
);

const IconCard = ({ icon, title, description, meta, action }) => (
  <article className="premium-card icon-card">
    <span className="card-icon" aria-hidden="true">{React.createElement(icon, { size: 20 })}</span>
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
      {meta && <span className="card-meta">{meta}</span>}
    </div>
    {action}
  </article>
);

const MetricGrid = ({ metrics }) => (
  <div className="metric-grid">
    {metrics.map(({ label, value, delta, icon }) => (
      <article className="metric-card" key={label}>
        <span className="card-icon" aria-hidden="true">{React.createElement(icon, { size: 20 })}</span>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{delta}</small>
      </article>
    ))}
  </div>
);

const ChartCard = ({ title = 'Revenue trend' }) => (
  <article className="premium-card chart-card">
    <div className="card-heading">
      <h3>{title}</h3>
      <span className="status-pill">Live</span>
    </div>
    <div className="bar-chart" aria-label={title}>
      {analyticsSeries.map(item => (
        <div className="bar-column" key={item.label}>
          <span style={{ height: `${item.value}%` }} />
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  </article>
);

const ProductMiniCard = ({ product, actionLabel = 'View details', onAction }) => (
  <article className="product-mini-card">
    <img src={product.image} alt={product.name} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.parentElement.classList.add('image-load-failed'); }} />
    <div>
      <span className="status-pill">{product.category}</span>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="mini-card-footer">
        <strong>{formatPrice(product.price)}</strong>
        {onAction ? (
          <button type="button" className="text-action" onClick={() => onAction(product)}>{actionLabel}</button>
        ) : (
          <a href={toHashPath(`/products/${product.slug || product.id}`)}>{actionLabel}</a>
        )}
      </div>
    </div>
  </article>
);

const TableShell = ({ rows = orderTimeline, title = 'Recent orders' }) => (
  <article className="premium-card table-card">
    <div className="card-heading">
      <h3>{title}</h3>
      <a href={toHashPath(ROUTES.ORDERS)}>View all</a>
    </div>
    <div className="responsive-table">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Product</th>
            <th>Status</th>
            <th>Date</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.product}</td>
              <td><span className="status-pill">{order.status}</span></td>
              <td>{order.date}</td>
              <td>{order.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </article>
);



export const HomePage = () => (
  <>
    <HeroSection />

    <section className="premium-section">
      <div className="section-heading">
        <span className="page-eyebrow">Commerce Command Center</span>
        <h2>Premium shopping, operations, and support in one fast interface.</h2>
        <p>Every surface is shaped for quick scanning, confident purchase decisions, and calm operational control.</p>
      </div>
      <div className="feature-grid">
        {serviceCards.map(card => <IconCard key={card.title} {...card} />)}
      </div>
    </section>

    <section className="premium-section category-browse-section">
      <div className="section-heading">
        <span className="page-eyebrow">Browse by Intent</span>
        <h2>Category rails with clear visual rhythm and fast paths to product discovery.</h2>
      </div>
      <div className="category-showcase-grid">
        {categoryShowcase.map(({ id, title, tone, icon }) => (
          <a
            className="category-showcase-card"
            href={toHashPath(`${ROUTES.PRODUCTS}?category=${encodeURIComponent(id)}`)}
            key={id}
            aria-label={`Browse ${title} products`}
          >
            {React.createElement(icon, { size: 22, 'aria-hidden': true })}
            <h3>{title}</h3>
            <p>{tone}</p>
            <span>Browse collection</span>
          </a>
        ))}
      </div>
    </section>

    <ProductSection title="Trending and Featured Product Collections" eyebrow="Interactive showcase" />

    <section className="premium-section recommendation-section">
      <div className="section-heading">
        <span className="page-eyebrow">AI Recommendations</span>
        <h2>Recommendation cards that feel like a premium concierge, not a generic carousel.</h2>
      </div>
      <div className="recommendation-grid">
        {recommendationCards.map(({ icon, title, description, score }) => (
          <article className="premium-card recommendation-card" key={title}>
            <span className="card-icon" aria-hidden="true">{React.createElement(icon, { size: 20 })}</span>
            <strong>{score}</strong>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <ProductSection title="Live product recommendations" eyebrow="From your synced catalog" />
    </section>

    <section className="premium-section split-panel">
      <ChartCard title="Marketplace momentum" />
      <div className="operations-grid">
        {operationsCards.map(({ icon, label, value, detail }) => (
          <article className="premium-card operation-card" key={label}>
            <span className="card-icon" aria-hidden="true">{React.createElement(icon, { size: 19 })}</span>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="premium-section">
      <div className="section-heading">
        <span className="page-eyebrow">Reviews</span>
        <h2>Trusted by shoppers, founders, and commerce teams.</h2>
      </div>
      <div className="testimonial-grid">
        {testimonials.map(item => (
          <article className="premium-card testimonial-card" key={item.name}>
            <p>"{item.quote}"</p>
            <strong>{item.name}</strong>
            <span>{item.role}</span>
          </article>
        ))}
      </div>
    </section>
  </>
);

export const AboutPage = () => (
  <PageHero
    eyebrow="About MythicMart"
    title="A premium commerce platform designed for speed, trust, and scale."
    description="MythicMart combines polished shopping experiences with practical operational tooling for teams that want a modern, production-grade storefront."
  />
);

export const ServicesPage = () => (
  <>
    <PageHero eyebrow="Services" title="Everything a serious commerce platform needs." description="Discovery, fulfillment, loyalty, support, analytics, and admin workflows are shaped as reusable product systems." />
    <div className="feature-grid">{serviceCards.map(card => <IconCard key={card.title} {...card} />)}</div>
  </>
);

export const ProductsPage = () => (
  <>
    <PageHero
      eyebrow="Products"
      title="A fast, filterable premium catalog."
      description="Browse the synchronized product catalog with search, category filters, sorting, loading states, and responsive product cards."
      compact
    />
    <ProductSection />
  </>
);

export const CategoriesPage = () => {
  const [counts, setCounts] = React.useState({});
  React.useEffect(() => {
    let active = true;
    Promise.all(categoryShowcase.map(async ({ id }) => {
      try { const response = await api.get(`/products?category=${id}&limit=1`); return [id, response.pagination?.total || 0]; }
      catch { return [id, 0]; }
    })).then(entries => { if (active) setCounts(Object.fromEntries(entries)); });
    return () => { active = false; };
  }, []);
  return (
    <>
      <PageHero eyebrow="Categories" title="Collections built for quick discovery." description="Each category is optimized for merchandising, filtering, and future personalized ranking." compact />
      <div className="category-showcase-grid">
        {categoryShowcase.map(({ id, title, tone, icon }) => (
          <a
            className="category-showcase-card"
            href={toHashPath(`${ROUTES.PRODUCTS}?category=${encodeURIComponent(id)}`)}
            key={id}
            aria-label={`Browse ${title} products`}
          >
            {React.createElement(icon, { size: 22, 'aria-hidden': true })}
            <h3>{title}</h3>
            <p>{tone}</p>
            <span>{counts[id] === undefined ? 'Loading…' : `${counts[id]} ${counts[id] === 1 ? 'item' : 'items'}`}</span>
          </a>
        ))}
      </div>
    </>
  );
};

export const ProductDetailsPage = ({ slug }) => {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const [product, setProduct] = React.useState(null);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [loadingProduct, setLoadingProduct] = React.useState(true);
  const [selectedVariantId, setSelectedVariantId] = React.useState(null);
  const [reviews, setReviews] = React.useState([]);
  const [loadingReviews, setLoadingReviews] = React.useState(true);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [reviewForm, setReviewForm] = React.useState({ rating: 5, title: '', comment: '', guestName: '' });
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [related, setRelated] = React.useState([]);

  React.useEffect(() => {
    let isMounted = true;
    const loadProductData = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.success && res.data && isMounted) {
          const norm = normalizeProduct(res.data);
          setProduct(norm);
          setSelectedImage(norm.image || (norm.images?.[0]?.url) || '/assets/product-watch.png');
          if (norm.variants?.length) {
            setSelectedVariantId(norm.variants[0].shopifyVariantId || norm.variants[0].id);
          }
          // Fetch real related recommendations
          try {
            const relRes = await api.get(`/products/recommendations?category=${norm.category || ''}&limit=3`);
            if (relRes.success && relRes.data && isMounted) {
              setRelated(relRes.data.filter(item => item.slug !== norm.slug));
            }
          } catch {
            // Safe fallback
          }
        }
      } catch {
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setLoadingProduct(false);
      }
    };
    loadProductData();
    return () => { isMounted = false; };
  }, [slug]);

  React.useEffect(() => {
    setLoadingReviews(true);
    const fetchReviews = async () => {
      try {
        if (!product) return;
        const queryId = product._id || product.id;
        const response = await api.get(`/reviews?productId=${queryId}`);
        if (response.success) setReviews(response.data);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product]);

  const handleReviewChange = (e) => setReviewForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const activeVariant = React.useMemo(() => {
    if (!product.variants?.length) return null;
    return product.variants.find(v => (v.shopifyVariantId || v.id) === selectedVariantId) || product.variants[0];
  }, [product.variants, selectedVariantId]);

  const currentPrice = activeVariant?.price ?? product?.price ?? 0;
  const currentCompareAt = activeVariant?.compareAtPrice ?? product?.originalPrice;
  const currentStock = activeVariant?.inventoryQuantity ?? product?.stock ?? 0;

  const galleryImages = React.useMemo(() => {
    const list = [];
    if (!product) return list;
    if (product.image) list.push(product.image);
    if (product.images?.length) {
      product.images.forEach(img => {
        const url = typeof img === 'string' ? img : img.url;
        if (url && !list.includes(url)) list.push(url);
      });
    }
    return list;
  }, [product]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const payload = {
        productId: product._id || product.id,
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        comment: reviewForm.comment,
        ...(!user && { guestName: reviewForm.guestName })
      };
      const response = await api.post('/reviews', payload);
      if (response.success) {
        addToast('Review submitted successfully. It will be visible once approved.', 'success');
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: '', comment: '', guestName: '' });
        const refreshed = await api.get(`/reviews?productId=${product._id || product.id}`);
        if (refreshed.success) setReviews(refreshed.data);
      } else {
        addToast(response.error || 'Failed to submit review', 'error');
      }
    } catch (err) {
      addToast(err.error || 'Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loadingProduct) return <div className="empty-state" role="status">Loading product details…</div>;
  if (!product) return <div className="empty-state" role="alert"><strong>Product unavailable</strong><p>This product could not be loaded from the live catalog.</p></div>;

  return (
    <>
      <section className="product-detail-layout" style={{ '--product-accent': product.accent || '#2f6fed' }}>
        <div className="product-gallery">
          <img src={selectedImage} alt={product.name} style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '480px' }} />
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '10px' }}>
            {galleryImages.map((imgUrl, index) => (
              <button
                type="button"
                key={`${imgUrl}-${index}`}
                onClick={() => setSelectedImage(imgUrl)}
                style={{
                  border: selectedImage === imgUrl ? '2px solid var(--clr-primary)' : '1px solid var(--c-border)',
                  borderRadius: '6px',
                  padding: 0,
                  background: 'none',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  width: '60px',
                  height: '60px',
                  flexShrink: 0,
                }}
              >
                <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>
        <article className="premium-card product-detail-card">
          <div className="detail-kicker-row">
            <span className="status-pill">{product.badge || product.category}</span>
            <span className="status-pill">AI fit {product.aiScore || 92}%</span>
            {product.shopifyProductId && (
              <span className="status-pill" style={{ background: 'rgba(0, 255, 140, 0.1)', color: 'var(--clr-green)' }}>Shopify Verified</span>
            )}
          </div>
          <h1>{product.name}</h1>
          <span className="product-brand">{product.brand || 'MythicMart'} - {product.collection || 'Premium collection'}</span>
          <p>{product.description}</p>
          <div className="rating-row"><Star size={18} fill="currentColor" /> {product.rating} · {product.reviewCount} reviews</div>

          <div className="price-stack" style={{ margin: '15px 0' }}>
            <strong style={{ fontSize: '2rem' }}>{formatPrice(currentPrice)}</strong>
            {currentCompareAt && currentCompareAt > currentPrice && (
              <>
                <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{formatPrice(currentCompareAt)}</span>
                <span className="status-pill" style={{ background: 'rgba(255, 77, 77, 0.1)', color: 'var(--clr-red)' }}>
                  Save {Math.round(((currentCompareAt - currentPrice) / currentCompareAt) * 100)}%
                </span>
              </>
            )}
          </div>

          {product.variants && product.variants.length > 1 && (
            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Select Variant / Option:</label>
              <select
                value={selectedVariantId || ''}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--c-surface-solid)', border: '1px solid var(--c-border)', color: 'var(--text)' }}
              >
                {product.variants.map((v) => (
                  <option key={v.shopifyVariantId || v.id} value={v.shopifyVariantId || v.id}>
                    {v.title} — {formatPrice(v.price)} ({v.inventoryQuantity > 0 ? `${v.inventoryQuantity} in stock` : 'Out of stock'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="detail-feature-grid" style={{ margin: '15px 0' }}>
            <span><Truck size={16} /> {product.freeShipping ? 'Free express shipping' : 'Standard shipping'}</span>
            <span><PackageCheck size={16} /> {currentStock > 0 ? `${currentStock} units available` : 'Out of stock'}</span>
            <span><TicketPercent size={16} /> Coupon eligible</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              className="cta-button"
              type="button"
              disabled={currentStock <= 0}
              onClick={() => {
                addItem({
                  ...product,
                  price: currentPrice,
                  variantId: activeVariant?.shopifyVariantId || product.variantId,
                  image: selectedImage,
                });
                addToast(`Added ${product.name} to cart`, 'success');
              }}
              style={{ flex: 1 }}
            >
              {currentStock > 0 ? <>Add to cart <ShoppingBag size={18} /></> : 'Out of stock'}
            </button>
          </div>
        </article>
      </section>
      <section className="premium-section detail-intelligence-grid">
        {recommendationCards.map(({ icon, title, description, score }) => (
          <IconCard key={title} icon={icon} title={title} description={description} meta={score} />
        ))}
      </section>

      <section className="premium-section">
        <div className="section-heading">
          <span className="page-eyebrow">Customer Feedback</span>
          <h2>Product Reviews.</h2>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          {loadingReviews ? (
            <p>Loading reviews...</p>
          ) : reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {reviews.map(r => (
                <div key={r._id || r.id} style={{ borderBottom: '1px solid var(--c-border)', paddingBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{r.title || `${r.rating} Stars`}</strong>
                    <span style={{ color: 'var(--clr-gold)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                  </div>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>{r.comment}</p>
                  <small style={{ color: 'var(--c-text-muted)' }}>By {r.guestName} {r.user && '(Verified)'}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="elegant-text">Be the first to review this product!</p>
          )}
          
          <div style={{ marginTop: '20px' }}>
             {!showReviewForm ? (
               <button className="cta-button outline" onClick={() => setShowReviewForm(true)}>Write a review</button>
             ) : (
               <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                 {!user && <label>Name<input type="text" name="guestName" value={reviewForm.guestName} onChange={handleReviewChange} required /></label>}
                 <label>Rating (1-5)<input type="number" name="rating" min="1" max="5" value={reviewForm.rating} onChange={handleReviewChange} required /></label>
                 <label>Title<input type="text" name="title" value={reviewForm.title} onChange={handleReviewChange} maxLength={120} /></label>
                 <label>Review<textarea name="comment" value={reviewForm.comment} onChange={handleReviewChange} required minLength={10} maxLength={1000} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '4px', background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} /></label>
                 <div style={{ display: 'flex', gap: '10px' }}>
                   <button type="submit" className="cta-button" disabled={submittingReview}>{submittingReview ? 'Submitting...' : 'Submit'}</button>
                   <button type="button" className="cta-button outline" onClick={() => setShowReviewForm(false)}>Cancel</button>
                 </div>
               </form>
             )}
          </div>
        </div>
      </section>

      <section className="premium-section">
        <div className="section-heading">
          <span className="page-eyebrow">Related Products</span>
          <h2>Complete the collection.</h2>
        </div>
        <div className="mini-product-grid">{related.map(item => <ProductMiniCard product={item} key={item.id} />)}</div>
      </section>
    </>
  );
};

export const UserDashboardPage = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = React.useState([]);
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my');
        if (response.success) {
          setRecentOrders(response.data.slice(0, 3));
        }
        const profileResponse = await api.get('/users/profile');
        if (profileResponse.success) setProfile(profileResponse.data);
      } catch (err) {
        console.error('Failed to load recent orders for dashboard:', err);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  return (
    <>
      <PageHero eyebrow="User Dashboard" title={`Welcome back, ${user?.name || 'Shopper'}.`} description="Track orders, rewards, saved items, recommendations, notifications, and account health from one responsive workspace." compact />

      <MetricGrid metrics={[
        { label: 'Orders tracked', value: recentOrders.length, delta: recentOrders.length ? 'Recent activity' : 'No orders yet', icon: PackageCheck },
        { label: 'Wishlist items', value: profile?.wishlist?.length ?? '—', delta: profile?.wishlist?.length ? 'Saved products' : 'No saved products', icon: Heart },
        { label: 'Reward tier', value: user?.loyaltyTier || 'standard', delta: 'Account status', icon: BadgeCheck },
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', margin: '20px 0' }}>
        <a href={toHashPath(ROUTES.ORDERS)} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--text)' }}>
          <ClipboardList size={20} color="var(--clr-primary)" />
          <div><strong>My Orders</strong><small style={{ display: 'block', color: 'var(--text-muted)' }}>Track shipments</small></div>
        </a>
        <a href={toHashPath(ROUTES.WISHLIST)} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--text)' }}>
          <Heart size={20} color="var(--clr-primary)" />
          <div><strong>Wishlist</strong><small style={{ display: 'block', color: 'var(--text-muted)' }}>Saved favorites</small></div>
        </a>
        <a href={toHashPath(ROUTES.COUPONS)} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--text)' }}>
          <WalletCards size={20} color="var(--clr-gold)" />
          <div><strong>Deals & Perks</strong><small style={{ display: 'block', color: 'var(--text-muted)' }}>Active discounts</small></div>
        </a>
        <a href={toHashPath(ROUTES.SETTINGS)} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--text)' }}>
          <SlidersHorizontal size={20} color="var(--clr-primary)" />
          <div><strong>Settings</strong><small style={{ display: 'block', color: 'var(--text-muted)' }}>Profile & security</small></div>
        </a>
      </div>

      <section className="split-panel">
        <TableShell rows={recentOrders.length > 0 ? recentOrders.map(o => ({
          id: (o._id || o.id || '').toString().slice(-6).toUpperCase() || '—',
          product: o.items?.length === 1 ? o.items[0].name : o.items?.length > 1 ? `${o.items[0].name} + ${o.items.length - 1} more` : 'Order',
          status: o.status || o.timeline?.[o.timeline.length - 1]?.status || 'pending',
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—',
          amount: formatPrice(o.total || 0)
        })) : []} title="Recent Orders" />
        <article className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Active Promotions</h3>
            <a href={toHashPath(ROUTES.COUPONS)} style={{ fontSize: '0.85rem', color: 'var(--clr-primary)', textDecoration: 'none' }}>View all →</a>
          </div>
          <div style={{ padding: '15px', background: 'rgba(255, 199, 0, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 199, 0, 0.2)', marginBottom: '10px' }}>
            <span className="status-pill" style={{ background: 'rgba(255, 199, 0, 0.15)', color: 'var(--clr-gold)', fontSize: '0.75rem' }}>MYTHIC10</span>
            <strong style={{ display: 'block', marginTop: '6px' }}>10% Off Your Entire Order</strong>
            <small style={{ color: 'var(--text-secondary)' }}>Apply code MYTHIC10 at checkout on orders over $50.</small>
          </div>
        </article>
      </section>
    </>
  );
};

export const AdminDashboardPage = () => {
  const [data, setData] = React.useState({ orders: [], users: [] });
  const [loading, setLoading] = React.useState(true);
  const { addToast } = useToast();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, usersRes] = await Promise.all([
          api.get('/orders/admin?limit=5'),
          api.get('/users/admin?limit=5')
        ]);
        setData({
          orders: ordersRes.success ? ordersRes.data : [],
          users: usersRes.success ? usersRes.data : []
        });
      } catch (err) {
        addToast(err.error || 'Failed to load admin data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  return (
    <>
      <PageHero eyebrow="Admin Command Center" title="Enterprise Commerce & Platform Operations" description="Manage catalog inventory, customer directory, live Shopify sync, revenue analytics, and system access." compact />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', margin: '20px 0' }}>
        <a href={toHashPath(ROUTES.INVENTORY)} className="glass-card" style={{ padding: '20px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <PackageCheck size={26} color="var(--clr-primary)" />
          <div><h4 style={{ margin: 0 }}>Inventory</h4><small style={{ color: 'var(--text-muted)' }}>Stock health & reorder</small></div>
        </a>
        <a href={toHashPath(ROUTES.CUSTOMERS)} className="glass-card" style={{ padding: '20px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Users size={26} color="var(--clr-primary)" />
          <div><h4 style={{ margin: 0 }}>Customers CRM</h4><small style={{ color: 'var(--text-muted)' }}>Roles & account status</small></div>
        </a>
        <a href={toHashPath(ROUTES.INTEGRATIONS)} className="glass-card" style={{ padding: '20px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <RefreshCcw size={26} color="var(--clr-green)" />
          <div><h4 style={{ margin: 0 }}>Shopify Sync</h4><small style={{ color: 'var(--text-muted)' }}>Trigger live catalog sync</small></div>
        </a>
        <a href={toHashPath(ROUTES.ANALYTICS)} className="glass-card" style={{ padding: '20px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <BarChart3 size={26} color="var(--clr-gold)" />
          <div><h4 style={{ margin: 0 }}>Analytics</h4><small style={{ color: 'var(--text-muted)' }}>Revenue & trends</small></div>
        </a>
      </div>

      <section className="split-panel">
        <TableShell title="Recent System Orders" rows={data.orders.map(o => ({
          id: o._id.slice(-6).toUpperCase(),
          user: o.user?.name || o.guestEmail || 'Customer',
          status: o.status,
          date: new Date(o.createdAt).toLocaleDateString(),
          amount: formatPrice(o.total)
        }))} />
        <article className="premium-card management-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>Recent Customers</h3>
            <a href={toHashPath(ROUTES.CUSTOMERS)} style={{ fontSize: '0.85rem', color: 'var(--clr-primary)', textDecoration: 'none' }}>View CRM →</a>
          </div>
          {data.users.length === 0 && !loading && <p>No customers found.</p>}
          {loading ? <p>Loading customers...</p> : data.users.map(u => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
              <div>
                <strong>{u.name}</strong>
                <small style={{ display: 'block', color: 'var(--text-muted)' }}>{u.email}</small>
              </div>
              <span className="status-pill" style={{ textTransform: 'capitalize' }}>{u.role}</span>
            </div>
          ))}
        </article>
      </section>
    </>
  );
};

export const AnalyticsPage = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { addToast } = useToast();

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics/summary');
        if (response.success) setData(response.data);
      } catch (err) {
        addToast(err.error || 'Failed to load analytics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [addToast]);

  const metrics = data ? [
    { label: 'Total Revenue', value: formatPrice(data.revenue), trend: '+12.5%' },
    { label: 'Total Orders', value: data.orders.toLocaleString(), trend: '+8.2%' },
    { label: 'Active Users', value: data.users.toLocaleString(), trend: '+15.3%' },
    { label: 'Conversion Rate', value: `${data.conversionRate}%`, trend: '+1.1%' }
  ] : [];

  return (
    <>
      <PageHero eyebrow="Analytics" title="Decision-ready commerce intelligence." description="Track revenue, conversion, traffic, inventory movement, customer retention, and sales performance." compact />
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading intelligence data...</div>
      ) : (
        <>
          {data ? <><MetricGrid metrics={metrics} />{data.series?.length ? <ChartCard title="Weekly revenue index" /> : <div className="empty-state"><p>Revenue trends will appear after transactions are recorded.</p></div>}</> : <div className="empty-state"><p>No analytics data is available yet.</p></div>}
        </>
      )}
    </>
  );
};

export const OrdersPage = () => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState('newest');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [pagination, setPagination] = React.useState({ page: 1, pages: 0, total: 0 });
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const loadOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const isStaff = ['admin', 'manager', 'support'].includes(user?.role);
      const params = new URLSearchParams({ page: String(page), limit: '25', sort });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      const endpoint = `${isStaff ? '/orders/admin' : '/orders/my'}?${params.toString()}`;
      const response = await api.get(endpoint);
      if (response.success) {
        setOrders(response.data || []);
        setPagination(response.pagination || { page, pages: 0, total: response.data?.length || 0 });
      }
    } catch (err) {
      addToast(err.error || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.role, statusFilter, searchQuery, page, sort, fromDate, toDate, addToast]);

  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery, sort, fromDate, toDate]);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        addToast(`Order status updated to ${newStatus}`, 'success');
        setOrders(prev => prev.map(o => (o._id === orderId || o.orderNumber === orderId) ? { ...o, status: newStatus } : o));
        if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.orderNumber === orderId)) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        addToast(res.error || 'Failed to update order status', 'error');
      }
    } catch (err) {
      addToast(err.error || 'Failed to update status', 'error');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;
    const matchesNumber = (o.orderNumber || o._id || '').toLowerCase().includes(q);
    const matchesItem = (o.items || []).some(item => (item.name || '').toLowerCase().includes(q));
    const matchesCustomer = (o.guestEmail || o.user?.email || o.shippingAddress?.name || '').toLowerCase().includes(q);
    return matchesStatus && (matchesNumber || matchesItem || matchesCustomer);
  });

  const getTimelineStep = (status) => {
    switch (status) {
      case 'confirmed': return 1;
      case 'packed': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled':
      case 'returned': return -1;
      default: return 1;
    }
  };

  return (
    <>
      <PageHero eyebrow="Orders" title="Orders & Fulfillment Tracking." description="Track real-time shipment status, review purchase receipts, inspect line items, and manage fulfillment." compact />

      {/* Controls Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          {['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                border: '1px solid var(--c-border)',
                background: statusFilter === st ? 'var(--clr-primary)' : 'rgba(255,255,255,0.03)',
                color: statusFilter === st ? '#000' : 'var(--text)',
                fontWeight: statusFilter === st ? '700' : '400',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '240px', flex: '1 1 240px', maxWidth: '380px' }}>
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by order #, item, or name..."
            style={{ width: '100%', padding: '8px 14px', borderRadius: '20px', background: 'var(--c-surface-solid)', border: '1px solid var(--c-border)', color: 'var(--text)' }}
          />
        </div>
        <select aria-label="Sort orders" value={sort} onChange={e => setSort(e.target.value)} className="orders-filter-control">
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="total-high">Highest total</option><option value="total-low">Lowest total</option>
        </select>
        <label className="orders-date-control">From <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></label>
        <label className="orders-date-control">To <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></label>
      </div>

      {loading ? (
        <div className="empty-state">Loading order history...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <strong>No orders found</strong>
          <p>{statusFilter !== 'all' || searchQuery ? 'No orders match your active filter.' : 'You have not placed any orders yet.'}</p>
          <a href={toHashPath(ROUTES.PRODUCTS)} className="cta-button" style={{ display: 'inline-block', marginTop: '10px' }}>Browse Catalog</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredOrders.map(o => {
            const currentStep = getTimelineStep(o.status);
            const isCancelled = o.status === 'cancelled' || o.status === 'returned';
            const orderNum = o.orderNumber || `MM-${(o._id || '').slice(-6).toUpperCase()}`;

            return (
              <article key={o._id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Card Header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--c-border)', paddingBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.5px' }}>{orderNum}</span>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Placed on {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                        background: o.status === 'delivered' ? 'rgba(0, 255, 140, 0.12)' : o.status === 'cancelled' ? 'rgba(255, 77, 77, 0.12)' : 'rgba(20, 217, 255, 0.12)',
                        color: o.status === 'delivered' ? 'var(--clr-green)' : o.status === 'cancelled' ? 'var(--clr-red)' : 'var(--clr-primary)',
                      }}
                    >
                      {o.status}
                    </span>
                    <button
                      type="button"
                      className="cta-button outline"
                      onClick={() => setSelectedOrder(o)}
                      style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                    >
                      View Receipt & Timeline
                    </button>
                    <a className="text-action" href={toHashPath(`/orders/${o.orderNumber || o._id}`)}>Open details</a>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                {!isCancelled && (
                  <div style={{ margin: '8px 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>
                      <span style={{ color: currentStep >= 1 ? 'var(--clr-primary)' : 'var(--text-muted)' }}>1. Confirmed</span>
                      <span style={{ color: currentStep >= 2 ? 'var(--clr-primary)' : 'var(--text-muted)' }}>2. Packed</span>
                      <span style={{ color: currentStep >= 3 ? 'var(--clr-primary)' : 'var(--text-muted)' }}>3. Shipped</span>
                      <span style={{ color: currentStep >= 4 ? 'var(--clr-green)' : 'var(--text-muted)' }}>4. Delivered</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(Math.min(currentStep, 4) / 4) * 100}%`,
                          background: currentStep === 4 ? 'var(--clr-green)' : 'linear-gradient(90deg, #14d9ff, #5a20ff)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Line Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(o.items || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={item.image || undefined}
                          alt={item.name}
                          style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', background: 'rgba(255,255,255,0.05)' }}
                          onError={(e) => { e.currentTarget.hidden = true; e.currentTarget.parentElement.classList.add('image-load-failed'); }}
                        />
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{item.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × {formatPrice(item.price)}</span>
                        </div>
                      </div>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Order Footer / Total */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {o.shippingAddress ? `Deliver to: ${o.shippingAddress.name || 'Patron'}, ${o.shippingAddress.city || 'Standard Destination'}` : 'Direct Fulfillment'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--c-surface-solid)', border: '1px solid var(--c-border)', color: 'var(--text)', fontSize: '0.82rem' }}
                      >
                        <option value="confirmed">Set Confirmed</option>
                        <option value="packed">Set Packed</option>
                        <option value="shipped">Set Shipped</option>
                        <option value="delivered">Set Delivered</option>
                        <option value="cancelled">Set Cancelled</option>
                      </select>
                    )}
                    <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>Total: {formatPrice(o.total)}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && pagination.pages > 1 && (
        <nav className="orders-pagination" aria-label="Orders pages">
          <button type="button" className="cta-button outline" disabled={page === 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</button>
          <span aria-live="polite">Page {pagination.page} of {pagination.pages} · {pagination.total} orders</span>
          <button type="button" className="cta-button outline" disabled={page >= pagination.pages} onClick={() => setPage(value => Math.min(pagination.pages, value + 1))}>Next</button>
        </nav>
      )}

      {/* Order Details & Receipt Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'grid', placeItems: 'center', zIndex: 10000, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--c-border)', paddingBottom: '15px' }}>
              <div>
                <span className="page-eyebrow">Order Receipt</span>
                <h2 style={{ margin: '4px 0 0', fontSize: '1.4rem' }}>{selectedOrder.orderNumber || `MM-${(selectedOrder._id || '').slice(-6).toUpperCase()}`}</h2>
              </div>
              <button type="button" className="cta-button outline" onClick={() => setSelectedOrder(null)} style={{ padding: '4px 10px' }}>Close</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>Purchased Items</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>{item.name} × {item.quantity}</span>
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sales Tax (8%)</span>
                  <span>{formatPrice(selectedOrder.tax)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--clr-green)' }}>
                    <span>Coupon Savings</span>
                    <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', borderTop: '1px solid var(--c-border)', paddingTop: '8px' }}>
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--clr-primary)' }}>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '12px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>Shipping Destination</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {selectedOrder.shippingAddress.name}<br />
                    {selectedOrder.shippingAddress.line1}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}
                  </p>
                </div>
              )}

              {selectedOrder.timeline?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '12px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem' }}>Fulfillment Timeline</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedOrder.timeline.map((t, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--clr-primary)', fontWeight: '600' }}>● {t.status?.toUpperCase()}:</span> {t.message} <small style={{ color: 'var(--text-muted)' }}>({new Date(t.at).toLocaleTimeString()})</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const WishlistPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { addItem } = useCart();
  const [wishlist, setWishlist] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await api.get('/users/profile');
        if (response.success && response.data.wishlist) {
          setWishlist(response.data.wishlist);
        }
      } catch (err) {
        addToast(err.error || 'Failed to load wishlist', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user, addToast]);

  const handleMoveToCart = async (product) => {
    addItem(product);
    addToast(`Added ${product.name} to cart`, 'success');
    
    // Attempt to remove from wishlist via API
    try {
      const response = await api.delete(`/users/wishlist/${product._id || product.id}`);
      if (response.success) {
        setWishlist(response.data);
      }
    } catch (err) {
      console.warn('Could not remove item from wishlist:', err);
    }
  };

  return (
    <>
      <PageHero eyebrow="Wishlist" title="Saved products and price-drop alerts." description="A personalized saved catalog with fast checkout entry points and notification-ready price monitoring." compact />
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading wishlist...</div>
      ) : wishlist.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Your wishlist is empty.</div>
      ) : (
        <div className="mini-product-grid">
          {wishlist.map(product => (
            <ProductMiniCard 
              product={product} 
              key={product._id || product.id} 
              actionLabel="Move to cart"
              onAction={handleMoveToCart}
            />
          ))}
        </div>
      )}
    </>
  );
};

export const CartPage = () => {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  return (
    <>
      <PageHero eyebrow="Cart" title="Review your bag before checkout." description="Quantity updates, removals, subtotal calculations, and checkout readiness live in a fast cart experience." compact />
      <section className="cart-page-grid">
        <article className="premium-card">
          {items.length === 0 ? <p>Your cart is empty.</p> : items.map(item => (
            <div className="cart-line-item" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div><h3>{item.name}</h3><span>{formatPrice(item.price)}</span></div>
              <div className="quantity-control">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} type="button">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} type="button">+</button>
              </div>
              <button className="text-action danger" onClick={() => removeItem(item.id)} type="button">Remove</button>
            </div>
          ))}
        </article>
        <article className="premium-card checkout-summary">
          <h3>Summary</h3>
          <div><span>Subtotal</span><strong>{formatPrice(totalPrice)}</strong></div>
          <div><span>Estimated tax</span><strong>{formatPrice(totalPrice * 0.08)}</strong></div>
          <a className="primary-action" href={toHashPath(ROUTES.CHECKOUT)}>Checkout <ArrowRight size={18} /></a>
        </article>
      </section>
    </>
  );
};

export const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    line1: '',
    city: '',
    state: '',
    zip: '',
    coupon: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validatingCoupon, setValidatingCoupon] = React.useState(false);
  const [discount, setDiscount] = React.useState(0);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const applyCoupon = async () => {
    if (!formData.coupon) return;
    setValidatingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', { code: formData.coupon, subtotal: totalPrice });
      if (res.success) {
        setDiscount(res.data.discount);
        addToast(`Coupon applied: -${formatPrice(res.data.discount)}`, 'success');
      } else {
        setDiscount(0);
        addToast(res.error || 'Invalid coupon', 'error');
      }
    } catch (err) {
       setDiscount(0);
       addToast(err.error || 'Failed to validate coupon', 'error');
    } finally {
       setValidatingCoupon(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      addToast('Your cart is empty', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    const payload = {
      guestEmail: !user ? formData.email : undefined,
      couponCode: discount > 0 ? formData.coupon : undefined,
      shippingAddress: {
        name: formData.name,
        line1: formData.line1,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      },
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }))
    };

    try {
      await new Promise(r => setTimeout(r, 1200));
      const response = await api.post('/orders', payload);
      if (response.success) {
        addToast('Order confirmed! Check your email for details.', 'success');
        clearCart();
        window.location.hash = ROUTES.ORDERS;
      } else {
        addToast(response.error || 'Checkout failed', 'error');
      }
    } catch (err) {
      addToast(err.error || err.message || 'Payment processing failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotalAfterDiscount = Math.max(0, totalPrice - discount);
  const tax = subtotalAfterDiscount * 0.08;
  const finalTotal = subtotalAfterDiscount + tax;

  return (
    <>
      <PageHero eyebrow="Checkout" title="Secure, payment-ready checkout." description="Shipping, coupon, payment authorization, and review steps are organized for a fast production checkout flow." compact />
      <section className="checkout-grid">
        <form className="glass-card form-grid" onSubmit={handleCheckout}>
          <label>Full name<input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Sarthak Mathapati" required /></label>
          <label>Email<input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@mythicmart.com" required /></label>
          <label>Address<input type="text" name="line1" value={formData.line1} onChange={handleChange} placeholder="Street address" required /></label>
          <div className="checkout-address-grid">
            <label>City<input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" required /></label>
            <label>State<input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" required /></label>
            <label>Zip<input type="text" name="zip" value={formData.zip} onChange={handleChange} placeholder="Zip" required /></label>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
             <label style={{ flex: 1 }}>Coupon<input type="text" name="coupon" value={formData.coupon} onChange={handleChange} placeholder="MYTHIC10" /></label>
             <button type="button" className="cta-button outline" onClick={applyCoupon} disabled={validatingCoupon || !formData.coupon}>
               {validatingCoupon ? '...' : 'Apply'}
             </button>
          </div>
          <button className="cta-button" type="submit" disabled={isSubmitting || items.length === 0} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isSubmitting ? 'Processing Payment...' : <>Validate and pay <CreditCard size={18} /></>}
          </button>
        </form>
        <article className="glass-card checkout-summary">
          <h3>Payment Review</h3>
          <div><span>Subtotal</span><strong>{formatPrice(totalPrice)}</strong></div>
          {discount > 0 && <div><span>Discount</span><strong style={{ color: 'var(--c-accent)' }}>-{formatPrice(discount)}</strong></div>}
          <div><span>Shipping</span><strong>Free</strong></div>
          <div><span>Estimated Tax</span><strong>{formatPrice(tax)}</strong></div>
          <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '1rem', marginTop: '1rem' }}>
            <span>Total</span><strong>{formatPrice(finalTotal)}</strong>
          </div>
        </article>
      </section>
    </>
  );
};

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    avatar: user?.avatar || ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', avatar: user.avatar || '' });
    }
  }, [user]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.patch('/users/profile', formData);
      if (response.success) {
        addToast('Profile updated successfully', 'success');
        updateUser(response.data);
      } else {
        addToast(response.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      addToast(err.error || 'Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero eyebrow="Profile" title="Account identity and preferences." description="Manage personal details, saved addresses, rewards profile, and secure account metadata." compact />
      <form className="glass-card form-grid" onSubmit={handleSave}>
        <label>Name<input type="text" name="name" value={formData.name} onChange={handleChange} required minLength={2} maxLength={60} /></label>
        <label>Email<input type="email" value={user?.email || ''} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} title="Email cannot be changed" /></label>
        <label>Avatar URL<input type="url" name="avatar" value={formData.avatar} onChange={handleChange} placeholder="https://example.com/avatar.jpg" /></label>
        <button className="cta-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </>
  );
};

export const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = React.useState('profile');

  const [profileForm, setProfileForm] = React.useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    bio: 'Luxury enthusiast & verified MythicMart patron',
    currency: 'USD',
    timezone: 'UTC-08:00 (Pacific)',
  });

  const [securityForm, setSecurityForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  const [notifications, setNotifications] = React.useState({
    orderUpdates: true,
    priceDrops: true,
    security: true,
    promotions: false,
    inventoryAlerts: true,
  });

  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        avatar: user.avatar || '',
      }));
      if (user.preferences?.notifications) {
        setNotifications(prev => ({
          ...prev,
          ...user.preferences.notifications,
        }));
      }
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.patch('/users/profile', {
        name: profileForm.name,
        avatar: profileForm.avatar || null,
      });
      if (response.success) {
        updateUser(response.data);
        addToast('Profile changes saved successfully', 'success');
      } else {
        addToast(response.error || 'Failed to save profile', 'error');
      }
    } catch (err) {
      addToast(err.error || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    setSaving(true);
    try {
      const response = await api.patch('/users/profile', { preferences: next });
      if (response.success) {
        updateUser(response.data);
        addToast('Notification preferences updated', 'success');
      }
    } catch (err) {
      setNotifications(notifications);
      addToast(err.error || 'Failed to update preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState('');
  const [deletePassword, setDeletePassword] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [securitySaving, setSecuritySaving] = React.useState(false);

  const handleSecuritySave = async (e) => {
    e.preventDefault();
    if (!securityForm.currentPassword) {
      addToast('Current password is required', 'error');
      return;
    }
    if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    if (securityForm.newPassword.length < 8) {
      addToast('New password must be at least 8 characters', 'error');
      return;
    }
    setSecuritySaving(true);
    try {
      const response = await api.patch('/users/profile/password', {
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
      });
      if (response.success) {
        addToast('Password updated successfully', 'success');
        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactorEnabled: securityForm.twoFactorEnabled });
      } else {
        addToast(response.error || 'Failed to update password', 'error');
      }
    } catch (err) {
      addToast(err.error || 'Failed to update password', 'error');
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE') {
      addToast('Please type DELETE to confirm', 'error');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await api.post('/users/profile/delete-account', {
        password: deletePassword,
        confirmation: 'DELETE',
      });
      if (res.success) {
        addToast('Account has been deactivated. Logging out...', 'info');
        setTimeout(() => {
          localStorage.removeItem('mythicmart_token');
          window.location.href = '/';
        }, 1500);
      } else {
        addToast(res.error || 'Failed to deactivate account', 'error');
      }
    } catch (err) {
      addToast(err.error || 'Failed to deactivate account', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user, exportedAt: new Date().toISOString() }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mythicmart_profile_${user?._id || 'data'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Account data exported', 'success');
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Identity', icon: UserRound },
    { id: 'security', label: 'Security & Auth', icon: LockKeyhole },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'shopify', label: 'Shopify & Store', icon: RefreshCcw },
    { id: 'appearance', label: 'Appearance', icon: SlidersHorizontal },
    { id: 'privacy', label: 'Privacy & Data', icon: ShieldCheck },
  ];

  const currentTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
        <a href={toHashPath(ROUTES.HOME)} style={{ color: 'inherit', textDecoration: 'none' }}>Home</a>
        <span>/</span>
        <a href={toHashPath(ROUTES.SETTINGS)} style={{ color: 'inherit', textDecoration: 'none' }}>Settings</a>
        <span>/</span>
        <span style={{ color: 'var(--clr-primary)', fontWeight: '600' }}>{currentTabObj.label}</span>
      </div>

      <PageHero eyebrow="Settings" title="Account, security, and platform controls." description="Configure your personal identity, notification channels, Shopify synchronization, and privacy preferences." compact />

      <div className="settings-layout" style={{ marginTop: '20px' }}>
        <aside className="glass-card settings-sidebar" style={{ padding: '15px', height: 'fit-content' }}>
          <nav>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'var(--clr-primary)' : 'transparent',
                    color: isActive ? '#000' : 'var(--text)',
                    fontWeight: isActive ? '600' : '400',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={17} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="glass-card settings-content" style={{ padding: '30px' }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Personal Profile</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Update your display information and account contact details.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label>Display Name<input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required minLength={2} maxLength={60} /></label>
                <label>Email Address<input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} /></label>
                <label>Avatar Image URL<input type="url" value={profileForm.avatar} onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })} placeholder="https://..." /></label>
                <label>Storefront Currency<select value={profileForm.currency} onChange={e => setProfileForm({ ...profileForm, currency: e.target.value })}><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="CAD">CAD ($)</option></select></label>
              </div>
              <label>Bio / Signature<textarea rows="3" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--c-surface-solid)', border: '1px solid var(--c-border)', color: 'var(--text)' }} /></label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="cta-button" type="submit" disabled={saving} style={{ width: 'fit-content' }}>
                  {saving ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
                <button type="button" className="cta-button outline" onClick={() => setProfileForm({ name: user?.name || '', avatar: user?.avatar || '', bio: 'Luxury enthusiast', currency: 'USD', timezone: 'UTC-08:00' })}>
                  Reset Form
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <form onSubmit={handleSecuritySave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Security & Credentials</h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Update account password and manage two-factor authentication.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label>Current Password<input type="password" value={securityForm.currentPassword} onChange={e => setSecurityForm({ ...securityForm, currentPassword: e.target.value })} placeholder="••••••••" required /></label>
                  <label>New Password<input type="password" value={securityForm.newPassword} onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })} placeholder="At least 8 characters" required /></label>
                  <label style={{ gridColumn: 'span 2' }}>Confirm New Password<input type="password" value={securityForm.confirmPassword} onChange={e => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })} placeholder="Re-type new password" required /></label>
                </div>
                <button className="cta-button" type="submit" disabled={securitySaving} style={{ width: 'fit-content' }}>
                  {securitySaving ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>

              <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px' }}>Two-Factor Authentication</h3>
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Authenticator Security</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Add an extra layer of protection to your sign-in credentials.</p>
                  </div>
                  <button type="button" className={`cta-button ${securityForm.twoFactorEnabled ? '' : 'outline'}`} onClick={() => { setSecurityForm(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled })); addToast(securityForm.twoFactorEnabled ? '2FA disabled' : '2FA activated', 'info'); }}>
                    {securityForm.twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,77,77,0.2)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--clr-red)', margin: '0 0 10px' }}>Danger Zone</h3>
                <div style={{ padding: '15px', background: 'rgba(255,77,77,0.04)', borderRadius: '8px', border: '1px solid rgba(255,77,77,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Deactivate Account</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Permanently deactivate your customer account and revoke access tokens.</p>
                  </div>
                  <button type="button" className="cta-button" style={{ background: 'var(--clr-red)', color: '#fff' }} onClick={() => setShowDeleteModal(true)}>
                    Deactivate Account
                  </button>
                </div>
              </div>

              {showDeleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'grid', placeItems: 'center', zIndex: 10000, padding: '20px' }}>
                  <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '30px' }}>
                    <h3 style={{ color: 'var(--clr-red)', marginTop: 0 }}>Confirm Account Deactivation</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>This action will deactivate your account and revoke active sessions. Type <strong>DELETE</strong> and enter your password to confirm.</p>
                    <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <label>Confirm phrase (type DELETE)<input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="DELETE" required /></label>
                      <label>Your Password<input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="••••••••" required /></label>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="cta-button" style={{ background: 'var(--clr-red)', color: '#fff', flex: 1 }} disabled={isDeleting || deleteConfirmText !== 'DELETE'}>
                          {isDeleting ? 'Deactivating...' : 'Confirm Deactivation'}
                        </button>
                        <button type="button" className="cta-button outline" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Notification Channels</h2>
                  <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>Choose which alerts and communication channels you wish to receive.</p>
                </div>
                <button
                  type="button"
                  className="cta-button outline"
                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                  onClick={() => {
                    const defaults = { orderUpdates: true, priceDrops: true, security: true, promotions: false, inventoryAlerts: true };
                    setNotifications(defaults);
                    api.patch('/users/profile', { preferences: defaults }).then(() => addToast('Notifications reset to defaults', 'info'));
                  }}
                >
                  Reset Defaults
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[
                  { key: 'orderUpdates', title: 'Order & Shipping Tracking', desc: 'Instant updates on order confirmation, fulfillment, tracking numbers, and delivery.' },
                  { key: 'priceDrops', title: 'Price-Drop & Wishlist Alerts', desc: 'Notifications when saved items go on sale or inventory reaches critical threshold.' },
                  { key: 'security', title: 'Security & Login Alerts', desc: 'Critical alerts regarding password changes, new device logins, and role updates.' },
                  { key: 'inventoryAlerts', title: 'Merchant Low Stock Warnings', desc: 'Receive real-time alerts when catalog items reach reorder levels.' },
                  { key: 'promotions', title: 'Promotional Offers & Member Perks', desc: 'Early access to limited drops, seasonal sales, and member-exclusive coupons.' },
                ].map(({ key, title, desc }) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--c-border)' }}>
                    <div>
                      <strong>{title}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(notifications[key])}
                      onChange={() => handleNotificationToggle(key)}
                      disabled={saving}
                      style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--clr-primary)' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shopify' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Shopify Storefront Configuration</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Configure headless API endpoints, credentials status, and automatic sync intervals.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--c-border)' }}>
                  <span className="page-eyebrow">Storefront Status</span>
                  <h3 style={{ margin: '8px 0 4px' }}>GraphQL Client</h3>
                  <span className="status-pill" style={{ background: 'rgba(0, 255, 140, 0.1)', color: 'var(--clr-green)' }}>Active & Connected</span>
                </div>
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--c-border)' }}>
                  <span className="page-eyebrow">Sync Engine</span>
                  <h3 style={{ margin: '8px 0 4px' }}>Admin Sync Hub</h3>
                  <a href={toHashPath(ROUTES.INTEGRATIONS)} style={{ color: 'var(--clr-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>Open Sync Dashboard →</a>
                </div>
              </div>
              <label>Default Store Currency<input type="text" value="USD ($)" disabled style={{ opacity: 0.7 }} /></label>
              <label>Estimated Sales Tax Rate<input type="text" value="8.0% (Automated Calculation)" disabled style={{ opacity: 0.7 }} /></label>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Appearance & Theme</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Customize your visual interface, contrast modes, and color accents.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--c-border)' }}>
                <div>
                  <strong>Theme Mode</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toggle between high-contrast dark theme and clean light theme.</p>
                </div>
                <button type="button" className="cta-button" onClick={toggleTheme}>
                  {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Privacy, GDPR & Data Rights</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Export your personal customer data or manage privacy preferences.</p>
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Export Account Data (JSON)</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Download a portable copy of your account profile, orders, and preferences.</p>
                </div>
                <button type="button" className="cta-button outline" onClick={handleExportData}>
                  Export JSON
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export const NotificationsPage = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');
  const { addToast } = useToast();

  const loadNotifications = React.useCallback(async () => {
    try {
      const response = await api.get('/notifications/my');
      if (response.success) setItems(response.data || []);
    } catch (err) {
      addToast(err.error || 'Unable to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const markRead = async (notification) => {
    try {
      await api.patch(`/notifications/${notification._id}/read`);
      setItems((current) => current.map((item) => item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item));
      addToast('Marked as read', 'success');
    } catch (err) {
      addToast(err.error || 'Unable to update notification', 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setItems(current => current.map(item => ({ ...item, readAt: new Date().toISOString() })));
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      addToast(err.error || 'Unable to update notifications', 'error');
    }
  };

  const dismiss = async (notification) => {
    try {
      await api.delete(`/notifications/${notification._id}`);
      setItems(current => current.filter(item => item._id !== notification._id));
      addToast('Notification dismissed', 'info');
    } catch (err) {
      addToast(err.error || 'Unable to dismiss notification', 'error');
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !item.readAt;
    return item.type === filter;
  });

  const unreadCount = items.filter(item => !item.readAt).length;

  return (
    <>
      <PageHero
        eyebrow="Inbox"
        title="Notifications & Activity Alerts"
        description="A real-time central feed of orders, inventory tracking, promotional perks, and account events."
        compact
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            {unreadCount > 0 && (
              <button className="cta-button outline" type="button" onClick={markAllRead}>
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>
        }
      />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'unread', 'order', 'system', 'security', 'promotion'].map(tab => (
          <button
            key={tab}
            type="button"
            className={`tech-tag ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
            style={{
              cursor: 'pointer',
              textTransform: 'capitalize',
              padding: '8px 16px',
              borderRadius: '20px',
              background: filter === tab ? 'var(--clr-primary)' : 'rgba(255,255,255,0.05)',
              color: filter === tab ? '#000' : 'var(--text)',
              border: '1px solid var(--c-border)',
              fontWeight: filter === tab ? '700' : '400',
            }}
          >
            {tab === 'unread' ? `Unread (${unreadCount})` : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>Loading notification stream...</div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '50px', textAlign: 'center' }}>
          <CheckCircle2 size={40} style={{ color: 'var(--clr-green)', margin: '0 auto 15px' }} />
          <h3 style={{ margin: '0 0 8px' }}>You're completely caught up!</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 20px' }}>
            No alerts found in this view. New order updates, security events, and sync runs will appear here automatically.
          </p>
          <a href={toHashPath(ROUTES.PRODUCTS)} className="cta-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Explore Shop
          </a>
        </div>
      ) : (
        <div className="notification-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredItems.map((item) => (
            <article
              className="glass-card"
              key={item._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderLeft: item.readAt ? '1px solid var(--c-border)' : '4px solid var(--clr-primary)',
                background: item.readAt ? 'var(--glass-bg)' : 'rgba(47, 111, 237, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span className="card-icon" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                  <Bell size={18} color={item.readAt ? 'var(--text-secondary)' : 'var(--clr-primary)'} />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: item.readAt ? '500' : '700' }}>{item.title}</h3>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.message}</p>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {new Date(item.createdAt).toLocaleString()} · {item.type || 'system'}
                  </small>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {!item.readAt && (
                  <button className="cta-button outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} type="button" onClick={() => markRead(item)}>
                    Mark as read
                  </button>
                )}
                <button className="text-action danger" style={{ background: 'none', border: 'none', cursor: 'pointer' }} type="button" onClick={() => dismiss(item)}>
                  Dismiss
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
};



export const IntegrationsPage = () => {
  const [status, setStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const { addToast } = useToast();

  const load = React.useCallback(async () => {
    try {
      const response = await api.get('/products/sync/status');
      if (response.success) setStatus(response.data);
    } catch (err) {
      addToast(err.error || 'Unable to load Shopify status', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => { load(); }, [load]);

  const sync = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/products/sync');
      if (!response.success) throw new Error(response.error);
      addToast(`Shopify sync completed! Fetched ${response.data.fetched} items, updated ${response.data.upserted}.`, 'success');
      await load();
    } catch (err) {
      addToast(err.error || err.message || 'Shopify sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Integrations Hub"
        title="Shopify Storefront & Admin Sync Engine"
        description="Monitor real-time connection telemetry, trigger catalog synchronization, and inspect automated webhook states."
        compact
        actions={
          <button className="cta-button" type="button" onClick={sync} disabled={syncing}>
            {syncing ? 'Synchronizing Catalog...' : 'Trigger Live Sync Now'} <RefreshCcw size={16} />
          </button>
        }
      />

      <section className="feature-grid" style={{ marginBottom: '30px' }}>
        <article className="glass-card" style={{ padding: '24px' }}>
          <span className="page-eyebrow">Storefront Engine</span>
          <h3 style={{ margin: '8px 0 6px' }}>GraphQL Storefront API</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Direct customer catalog streaming, live price resolution, and cart checkout URL generation.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
            <span className="status-pill" style={{ background: status?.configured ? 'rgba(0, 255, 140, 0.1)' : 'rgba(255, 170, 0, 0.12)', color: status?.configured ? 'var(--clr-green)' : 'var(--warning)' }}>{status?.configured ? '● Configured' : '● Not configured'}</span>
            <span className="status-pill">{status?.apiVersion || 'API version unavailable'}</span>
          </div>
        </article>

        <article className="glass-card" style={{ padding: '24px' }}>
          <span className="page-eyebrow">Database Mirroring</span>
          <h3 style={{ margin: '8px 0 6px' }}>MongoDB Synced Catalog</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {loading ? 'Checking synchronization...' : status?.lastRun ? `Last sync: ${status.lastRun.status?.toUpperCase()} (${status.lastRun.fetched || 0} fetched, ${status.lastRun.upserted || 0} upserted)` : 'No sync runs recorded yet.'}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
            <span className="status-pill">{status?.lastRun?.status || 'Ready'}</span>
            <span className="status-pill">{status?.storeDomain || 'Store domain required'}</span>
          </div>
        </article>

        <article className="glass-card" style={{ padding: '24px' }}>
          <span className="page-eyebrow">Webhooks & Events</span>
          <h3 style={{ margin: '8px 0 6px' }}>Real-Time Inventory</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Automated listeners for product updates, price changes, and stock depletion.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
            <span className="status-pill" style={{ background: 'rgba(0, 255, 140, 0.1)', color: 'var(--clr-green)' }}>Listening</span>
          </div>
        </article>
      </section>

      <section className="glass-card" style={{ padding: '25px' }}>
        <h3 style={{ margin: '0 0 15px' }}>Synchronization Run History</h3>
        {status?.lastRun ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontWeight: '600' }}>
              <span>Run Timestamp</span>
              <span>Status</span>
              <span>Fetched</span>
              <span>Upserted</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px', borderBottom: '1px solid var(--c-border)' }}>
              <span>{status.lastRun.completedAt ? new Date(status.lastRun.completedAt).toLocaleString() : 'Recent'}</span>
              <span style={{ color: status.lastRun.status === 'completed' ? 'var(--clr-green)' : 'var(--warning)', fontWeight: '600' }}>{status.lastRun.status}</span>
              <span>{status.lastRun.fetched || 0} items</span>
              <span>{status.lastRun.upserted || 0} items</span>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Click "Trigger Live Sync Now" above to run your first automated Shopify sync.</p>
        )}
      </section>
    </>
  );
};

export const OrderDetailsPage = ({ id }) => {
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/orders/${encodeURIComponent(id)}`).then(response => { if (active && response.success) setOrder(response.data); }).catch(err => { if (active) setError(err.error || 'Unable to load this order.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  if (loading) return <div className="empty-state" role="status">Loading order details…</div>;
  if (error || !order) return <div className="empty-state" role="alert"><strong>Order unavailable</strong><p>{error || 'This order could not be found.'}</p></div>;
  const currency = order.currency || 'USD';
  return <><PageHero eyebrow="Order details" title={order.orderNumber || order.shopifyOrderId || 'Order'} description="Review customer, payment, fulfillment, line-item, and delivery information from the persisted order record." compact /><section className="order-detail-grid"><article className="glass-card order-detail-panel"><div className="order-detail-heading"><div><span className="page-eyebrow">Status</span><h2>{order.status}</h2></div><span className="status-pill">{order.fulfillmentStatus || 'unfulfilled'}</span></div><p className="elegant-text">Placed {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'date unavailable'} · Payment: {order.paymentStatus || 'unknown'}</p><h3>Items</h3><div className="order-detail-items">{(order.items || []).map((item, index) => <div className="order-detail-item" key={`${item.shopifyVariantId || item.name}-${index}`}><div className="order-detail-item-media">{item.image ? <img src={item.image} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : <span>No image</span>}</div><div><strong>{item.name}</strong><p>Qty {item.quantity}{item.sku ? ` · ${item.sku}` : ''}</p></div><strong>{formatPrice(item.price * item.quantity, currency)}</strong></div>)}</div></article><aside className="glass-card order-detail-panel"><h3>Summary</h3><dl className="order-summary-list"><div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal, currency)}</dd></div><div><dt>Discount</dt><dd>-{formatPrice(order.discountAmount || 0, currency)}</dd></div><div><dt>Shipping</dt><dd>{formatPrice(order.shippingAmount || 0, currency)}</dd></div><div><dt>Tax</dt><dd>{formatPrice(order.tax || 0, currency)}</dd></div><div className="order-summary-total"><dt>Total</dt><dd>{formatPrice(order.total, currency)}</dd></div></dl>{order.customer && <><h3>Customer</h3><p>{order.customer.name || 'Customer unavailable'}<br />{order.customer.email || order.guestEmail || 'Email unavailable'}{order.customer.phone ? <><br />{order.customer.phone}</> : null}</p></>}{order.shippingAddress && <><h3>Shipping address</h3><p>{order.shippingAddress.name}<br />{order.shippingAddress.line1}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />{order.shippingAddress.country}</p></>}</aside></section></>;
};

export const InventoryPage = () => {
  const [productsList, setProductsList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');
  const { addToast } = useToast();

  React.useEffect(() => {
    const loadInventory = async () => {
      try {
        const res = await api.get('/products?limit=48');
        if (res.success && res.data) setProductsList(res.data);
      } catch (err) {
        addToast(err.error || 'Failed to load inventory', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadInventory();
  }, [addToast]);

  const filtered = productsList.filter(p => {
    if (filter === 'low') return (p.stock || 0) <= (p.reorderPoint || 10);
    if (filter === 'out') return (p.stock || 0) === 0;
    return true;
  });

  return (
    <>
      <PageHero eyebrow="Management" title="Inventory & Stock Health" description="Real-time stock levels, reorder threshold alerts, and Shopify variant inventory tracking." compact />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['all', 'low', 'out'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: filter === t ? 'var(--clr-primary)' : 'rgba(255,255,255,0.05)',
              color: filter === t ? '#000' : 'var(--text)',
              border: '1px solid var(--c-border)',
              cursor: 'pointer',
              fontWeight: filter === t ? '700' : '400',
              textTransform: 'capitalize',
            }}
          >
            {t === 'all' ? 'All Products' : t === 'low' ? 'Low Stock Warnings' : 'Out of Stock'}
          </button>
        ))}
      </div>

      <div className="glass-card table-responsive-wrapper" style={{ padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px' }}>Product</th>
              <th style={{ padding: '12px' }}>Category</th>
              <th style={{ padding: '12px' }}>Price</th>
              <th style={{ padding: '12px' }}>Stock Status</th>
              <th style={{ padding: '12px' }}>Units Left</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>Loading inventory...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>No products matching criteria.</td></tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id || p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={p.image} alt={p.name} style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                    <div>
                      <strong>{p.name}</strong>
                      <small style={{ display: 'block', color: 'var(--text-muted)' }}>{p.brand || 'MythicMart'}</small>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textTransform: 'capitalize' }}>{p.category}</td>
                  <td style={{ padding: '12px' }}>{formatPrice(p.price)}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: (p.stock || 0) > 10 ? 'rgba(0, 255, 140, 0.1)' : (p.stock || 0) > 0 ? 'rgba(255, 199, 0, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                        color: (p.stock || 0) > 10 ? 'var(--clr-green)' : (p.stock || 0) > 0 ? 'var(--clr-gold)' : 'var(--clr-red)',
                      }}
                    >
                      {(p.stock || 0) > 10 ? 'Healthy' : (p.stock || 0) > 0 ? 'Low Stock' : 'Depleted'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: '700' }}>{p.stock || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export const CustomersPage = () => {
  const [customers, setCustomers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [sort, setSort] = React.useState('newest');
  const [page, setPage] = React.useState(1);
  const [pagination, setPagination] = React.useState({ page: 1, pages: 1, total: 0 });
  const [selectedCustomerId, setSelectedCustomerId] = React.useState(null);
  const [customerDetails, setCustomerDetails] = React.useState(null);
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const { addToast } = useToast();

  const loadCustomers = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search.trim()) params.set('search', search.trim());
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await api.get(`/users/admin?${params.toString()}`);
      if (res.success && res.data) {
        setCustomers(res.data);
        setPagination(res.pagination || { page, pages: 1, total: res.data.length });
      }
    } catch (err) {
      addToast(err.error || 'Failed to load customer directory', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, page, roleFilter, search, statusFilter]);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const openCustomerDetails = async (id) => {
    setSelectedCustomerId(id);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/users/admin/${id}`);
      if (res.success && res.data) {
        setCustomerDetails(res.data);
      }
    } catch (err) {
      addToast(err.error || 'Failed to load customer profile', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await api.patch(`/users/admin/${id}/role`, { role: newRole });
      if (res.success) {
        addToast(`Role updated to ${newRole}`, 'success');
        setCustomers(prev => prev.map(c => c._id === id ? { ...c, role: newRole } : c));
        if (customerDetails && customerDetails._id === id) {
          setCustomerDetails(prev => ({ ...prev, role: newRole }));
        }
      }
    } catch (err) {
      addToast(err.error || 'Failed to update role', 'error');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      const res = await api.patch(`/users/admin/${id}/status`, { isActive: nextStatus });
      if (res.success) {
        addToast(`Customer account ${nextStatus ? 'activated' : 'disabled'}`, 'success');
        setCustomers(prev => prev.map(c => c._id === id ? { ...c, isActive: nextStatus } : c));
        if (customerDetails && customerDetails._id === id) {
          setCustomerDetails(prev => ({ ...prev, isActive: nextStatus }));
        }
      }
    } catch (err) {
      addToast(err.error || 'Failed to toggle status', 'error');
    }
  };

  const sortedCustomers = React.useMemo(() => {
    const list = [...customers];
    if (sort === 'spend') list.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
    else if (sort === 'orders') list.sort((a, b) => (b.ordersCount || 0) - (a.ordersCount || 0));
    else if (sort === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else if (sort === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return list;
  }, [customers, sort]);

  return (
    <>
      <PageHero
        eyebrow="CRM"
        title="Customer Directory & CRM"
        description="Inspect customer profiles, loyalty tiers, order history, lifetime spend, and account permissions."
        compact
      />

      {/* Filter / Search Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <input
            type="search"
            aria-label="Search customers"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ minWidth: '240px', padding: '8px 14px', borderRadius: '20px', background: 'var(--c-surface-solid)', border: '1px solid var(--c-border)', color: 'var(--text)' }}
          />

          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '20px', background: 'var(--c-surface-solid)', border: '1px solid var(--c-border)', color: 'var(--text)', fontSize: '0.85rem' }}
          >
            <option value="all">All Roles</option>
            <option value="user">Patron / User</option>
            <option value="support">Support</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrator</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '20px', background: 'var(--c-surface-solid)', border: '1px solid var(--c-border)', color: 'var(--text)', fontSize: '0.85rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="disabled">Disabled Accounts</option>
          </select>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '20px', background: 'var(--c-surface-solid)', border: '1px solid var(--c-border)', color: 'var(--text)', fontSize: '0.85rem' }}
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="spend">Sort: Highest Spend</option>
            <option value="orders">Sort: Most Orders</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-card table-responsive-wrapper" style={{ padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>Customer</th>
              <th style={{ padding: '12px' }}>Tier / Role</th>
              <th style={{ padding: '12px' }}>Orders</th>
              <th style={{ padding: '12px' }}>Lifetime Spend</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center' }}>Loading customer directory...</td></tr>
            ) : sortedCustomers.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center' }}>No customers match your active filters.</td></tr>
            ) : (
              sortedCustomers.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #14d9ff, #5a20ff)', display: 'grid', placeItems: 'center', fontWeight: '700', fontSize: '0.85rem' }}>
                        {(c.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <strong>{c.name}</strong>
                        <small style={{ display: 'block', color: 'var(--text-muted)' }}>{c.email}</small>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="status-pill" style={{ textTransform: 'capitalize', width: 'fit-content' }}>{c.loyaltyTier || 'Standard'}</span>
                      <select
                        value={c.role}
                        onChange={e => handleRoleChange(c._id, e.target.value)}
                        style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--c-surface-solid)', border: '1px solid var(--c-border)', color: 'var(--text)', fontSize: '0.78rem' }}
                      >
                        <option value="user">User</option>
                        <option value="support">Support</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{c.ordersCount || 0}</td>
                  <td style={{ padding: '12px', fontWeight: '700', color: 'var(--clr-primary)' }}>{formatPrice(c.totalSpent || 0)}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(c._id, c.isActive)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: c.isActive ? 'rgba(0, 255, 140, 0.12)' : 'rgba(255, 77, 77, 0.12)',
                        color: c.isActive ? 'var(--clr-green)' : 'var(--clr-red)',
                      }}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      type="button"
                      className="cta-button outline"
                      onClick={() => openCustomerDetails(c._id)}
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && pagination.pages > 1 && (
        <nav className="orders-pagination" aria-label="Customer pages" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="cta-button outline"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages} · {pagination.total} customers</span>
          <button
            type="button"
            className="cta-button outline"
            disabled={page >= pagination.pages}
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
          >
            Next
          </button>
        </nav>
      )}

      {/* Customer Profile & Orders Drawer / Modal */}
      {selectedCustomerId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'grid', placeItems: 'center', zIndex: 10000, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--c-border)', paddingBottom: '15px' }}>
              <div>
                <span className="page-eyebrow">Customer Profile</span>
                <h2 style={{ margin: '4px 0 0', fontSize: '1.4rem' }}>{customerDetails?.name || 'Loading profile...'}</h2>
              </div>
              <button type="button" className="cta-button outline" onClick={() => { setSelectedCustomerId(null); setCustomerDetails(null); }} style={{ padding: '4px 10px' }}>Close</button>
            </div>

            {loadingDetails || !customerDetails ? (
              <div style={{ padding: '30px', textAlign: 'center' }}>Loading customer records...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                {/* Stats Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div className="premium-card" style={{ padding: '12px', textAlign: 'center' }}>
                    <small style={{ color: 'var(--text-muted)' }}>Lifetime Spend</small>
                    <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--clr-primary)', marginTop: '4px' }}>{formatPrice(customerDetails.totalSpent || 0)}</strong>
                  </div>
                  <div className="premium-card" style={{ padding: '12px', textAlign: 'center' }}>
                    <small style={{ color: 'var(--text-muted)' }}>Total Orders</small>
                    <strong style={{ display: 'block', fontSize: '1.2rem', marginTop: '4px' }}>{customerDetails.ordersCount || 0}</strong>
                  </div>
                  <div className="premium-card" style={{ padding: '12px', textAlign: 'center' }}>
                    <small style={{ color: 'var(--text-muted)' }}>Loyalty Tier</small>
                    <strong style={{ display: 'block', fontSize: '1.2rem', textTransform: 'capitalize', color: 'var(--clr-gold)', marginTop: '4px' }}>{customerDetails.loyaltyTier || 'Standard'}</strong>
                  </div>
                  <div className="premium-card" style={{ padding: '12px', textAlign: 'center' }}>
                    <small style={{ color: 'var(--text-muted)' }}>Role</small>
                    <strong style={{ display: 'block', fontSize: '1.2rem', textTransform: 'capitalize', marginTop: '4px' }}>{customerDetails.role}</strong>
                  </div>
                </div>

                {/* Profile Information */}
                <div>
                  <h4 style={{ margin: '0 0 8px' }}>Account Information</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                    <div><strong>Email:</strong> {customerDetails.email}</div>
                    <div><strong>Phone:</strong> {customerDetails.phone || 'Not provided'}</div>
                    <div><strong>Joined:</strong> {new Date(customerDetails.createdAt).toLocaleDateString()}</div>
                    <div><strong>Shopify ID:</strong> {customerDetails.shopifyCustomerId || 'Direct User'}</div>
                  </div>
                </div>

                {/* Customer Order History */}
                <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '15px' }}>
                  <h4 style={{ margin: '0 0 10px' }}>Order History ({customerDetails.orders?.length || 0})</h4>
                  {customerDetails.orders?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {customerDetails.orders.map(o => (
                        <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--c-border)' }}>
                          <div>
                            <strong>{o.orderNumber || `MM-${(o._id || '').slice(-6).toUpperCase()}`}</strong>
                            <small style={{ display: 'block', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()} · {o.items?.length || 0} items</small>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="status-pill">{o.status}</span>
                            <strong>{formatPrice(o.total)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No previous orders found for this customer.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const CustomerDetailsPage = ({ id }) => {
  const [customer, setCustomer] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    api.get(`/users/admin/${encodeURIComponent(id)}`)
      .then(res => {
        if (active && res.success) setCustomer(res.data);
      })
      .catch(err => {
        if (active) setError(err.error || 'Unable to load customer profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="empty-state" role="status">Loading customer details…</div>;
  if (error || !customer) return <div className="empty-state" role="alert"><strong>Customer unavailable</strong><p>{error || 'Customer not found.'}</p></div>;

  return (
    <>
      <PageHero eyebrow="Customer details" title={customer.name} description="Persisted customer profile and order history." compact />
      <section className="customer-detail-grid">
        <article className="glass-card customer-detail-panel">
          <span className="status-pill">{customer.isActive ? 'Active' : 'Disabled'}</span>
          <h2>{customer.email}</h2>
          <p>{customer.phone || 'Phone not provided'}</p>
          <h3>Profile</h3>
          <p>
            {customer.shopifyCustomerId ? `Shopify ID: ${customer.shopifyCustomerId}` : 'Direct user account'}<br />
            Joined {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}<br />
            Tier: {customer.loyaltyTier || 'Standard'}
          </p>
        </article>
        <article className="glass-card customer-detail-panel">
          <div className="order-detail-heading">
            <h2>Order history</h2>
            <span className="status-pill">{customer.ordersCount || 0} orders</span>
          </div>
          <p>Total spent: {formatPrice(customer.totalSpent || 0)}</p>
          {customer.orders?.length ? (
            <div className="customer-order-list">
              {customer.orders.map(order => (
                <div className="customer-order-row" key={order._id}>
                  <span>
                    <strong>{order.orderNumber || order._id}</strong>
                    <small>{new Date(order.createdAt).toLocaleDateString()} · {order.status}</small>
                  </span>
                  <strong>{formatPrice(order.total)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><strong>No orders yet</strong><p>This customer has no persisted orders.</p></div>
          )}
        </article>
      </section>
    </>
  );
};

export const CouponsPage = () => {
  const { addToast } = useToast();
  const coupons = [
    { code: 'MYTHIC10', discount: '10% OFF', desc: 'Site-wide instant discount on orders over $50', min: 50, tag: 'Popular' },
    { code: 'LUXE20', discount: '$20 OFF', desc: 'Exclusive VIP savings on luxury accessories', min: 150, tag: 'VIP Exclusive' },
    { code: 'FREESHIP', discount: 'Free Shipping', desc: 'Express global delivery on all apparel and footwear', min: 0, tag: 'Shipping' },
  ];

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    addToast(`Coupon code ${code} copied to clipboard!`, 'success');
  };

  return (
    <>
      <PageHero eyebrow="Promotions" title="Active Promotional Codes & Perks" description="Explore verified promotional codes and apply instant discounts at checkout." compact />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {coupons.map(c => (
          <article key={c.code} className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '15px' }}>
            <div>
              <span className="status-pill" style={{ background: 'rgba(255, 199, 0, 0.1)', color: 'var(--clr-gold)' }}>{c.tag}</span>
              <h2 style={{ fontSize: '1.8rem', margin: '10px 0 4px', color: 'var(--clr-primary)' }}>{c.discount}</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>{c.desc}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid var(--c-border)' }}>
              <strong style={{ letterSpacing: '1px', fontSize: '1.1rem' }}>{c.code}</strong>
              <button className="cta-button outline" type="button" onClick={() => copyCode(c.code)}>Copy Code</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
};

export const ActivityPage = () => {
  const events = [
    { title: 'Shopify Catalog Auto-Sync Complete', time: '10 minutes ago', type: 'system', desc: '20 products refreshed from Shopify GraphQL endpoints.' },
    { title: 'New Customer Order Confirmed', time: '25 minutes ago', type: 'order', desc: 'Order #ORD-789 placed for Obsidian Chronograph.' },
    { title: 'Customer Review Approved', time: '1 hour ago', type: 'review', desc: '5-star review published for Onyx Studio Earbuds.' },
    { title: 'Security Audit Scan Passed', time: '3 hours ago', type: 'security', desc: 'Automated token verification and helmet header checks verified.' },
  ];

  return (
    <>
      <PageHero eyebrow="Audit Trail" title="Platform Activity Stream" description="Real-time chronological events across catalog syncs, orders, customer registrations, and security logs." compact />
      <div className="glass-card" style={{ padding: '25px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {events.map((e, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--c-border)' }}>
              <span className="card-icon" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                <Activity size={18} color="var(--clr-primary)" />
              </span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '1rem' }}>{e.title}</strong>
                <p style={{ margin: '3px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{e.desc}</p>
              </div>
              <small style={{ color: 'var(--text-muted)' }}>{e.time}</small>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const ContactPage = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/support', {
        email: formData.email,
        subject: `Contact from ${formData.name}`,
        message: formData.message,
        type: 'other',
        priority: 'normal'
      });
      if (res.success) {
        addToast('Message sent! We will get back to you soon.', 'success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        addToast(res.error || 'Failed to send message', 'error');
      }
    } catch (err) {
      addToast(err.error || 'Failed to send message', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero eyebrow="Contact" title="Reach the MythicMart team." description="Sales, support, partnerships, and customer care are routed through a production-ready contact workflow." compact />
      <section className="split-panel">
        <form className="premium-card form-grid" onSubmit={handleSubmit}>
          <label>Name<input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></label>
          <label>Email<input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required /></label>
          <label>Message<textarea rows="5" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required minLength={10} /></label>
          <button className="primary-action" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : <>Send message <Mail size={18} /></>}
          </button>
        </form>
        <IconCard icon={MapPin} title="Commerce HQ" description="Remote-first support with regional fulfillment partners and 24/7 escalation paths." />
      </section>
    </>
  );
};

export const FAQPage = () => (
  <>
    <PageHero eyebrow="FAQ" title="Answers for shoppers and operators." description="Clear guidance for orders, accounts, checkout, support, and platform security." compact />
    <div className="faq-list">{faqItems.map(item => <details className="premium-card" key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
  </>
);

export const BlogPage = () => (
  <>
    <PageHero eyebrow="Blog" title="Commerce strategy, UX, and operations." description="Editorial content for building faster, calmer, higher-converting shopping experiences." compact />
    <div className="feature-grid">{blogPosts.map(post => <article className="premium-card" key={post.title}><span className="status-pill">{post.tag}</span><h3>{post.title}</h3><p>{post.read}</p><a className="text-action" href={toHashPath(ROUTES.BLOG)}>Read article</a></article>)}</div>
  </>
);

export const CareersPage = () => (
  <>
    <PageHero eyebrow="Careers" title="Build the next generation of premium commerce." description="Join product, engineering, operations, and growth roles focused on high-quality customer experiences." compact />
    <div className="feature-grid">{careers.map(job => <IconCard key={job.role} icon={BriefcaseBusiness} title={job.role} description={`${job.team} - ${job.location}`} meta="Open role" />)}</div>
  </>
);

export const ReviewsPage = () => {
  const [reviewsList, setReviewsList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    api.get('/reviews?limit=12')
      .then(res => {
        if (res.success && res.data && isMounted) setReviewsList(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <>
      <PageHero eyebrow="Reviews" title="Verified Customer Feedback & Ratings." description="Ratings, reviews, helpful votes, and transparent customer feedback directly from the catalog." compact />
      {loading ? (
        <div className="empty-state">Loading customer reviews...</div>
      ) : reviewsList.length > 0 ? (
        <div className="feature-grid">
          {reviewsList.map(r => (
            <article className="premium-card" key={r._id || r.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--clr-gold)', fontSize: '1.1rem' }}>{'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}</span>
                <span className="status-pill">{r.rating}/5</span>
              </div>
              <h3 style={{ margin: '4px 0' }}>{r.title || `${r.rating} Star Review`}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1 }}>{r.comment}</p>
              <small style={{ color: 'var(--text-muted)' }}>By {r.guestName || r.user?.name || 'Verified Patron'}</small>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>No public reviews found yet.</strong>
          <p>Explore our products in the shop and be the first to leave a review!</p>
          <a href={toHashPath(ROUTES.PRODUCTS)} className="cta-button" style={{ display: 'inline-block', marginTop: '10px' }}>Explore Catalog</a>
        </div>
      )}
    </>
  );
};

export const TestimonialsPage = () => (
  <>
    <PageHero eyebrow="Testimonials" title="Trusted by shoppers and commerce teams." description="Premium experiences should feel calm, fast, and reliable from both sides of the business." compact />
    <div className="testimonial-grid">{testimonials.map(item => <article className="premium-card testimonial-card" key={item.name}><p>"{item.quote}"</p><strong>{item.name}</strong><span>{item.role}</span></article>)}</div>
  </>
);

export const LegalPage = ({ type }) => (
  <>
    <PageHero eyebrow={type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'} title={type === 'privacy' ? 'Responsible data handling for a modern commerce platform.' : 'Clear terms for shoppers, sellers, and platform operators.'} description="Production legal pages should be reviewed by qualified counsel before launch." compact />
    <article className="premium-card legal-copy">
      <h3>{type === 'privacy' ? 'Privacy commitments' : 'Platform terms'}</h3>
      <p>MythicMart is structured around secure authentication, least-privilege access, payment-safe checkout boundaries, transparent order records, and accountable support operations.</p>
      <p>Before going live, replace this operational template with jurisdiction-specific legal language, retention policies, payment processor terms, and customer data rights.</p>
    </article>
  </>
);

export const HelpCenterPage = () => (
  <>
    <PageHero eyebrow="Help Center" title="Self-service support for every major workflow." description="Find account, order, payment, support, and product discovery help in one searchable hub." compact />
    <div className="feature-grid">{helpTopics.map(topic => <IconCard key={topic.title} {...topic} />)}</div>
  </>
);

export const SupportSystemPage = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = React.useState({ email: user?.email || '', subject: 'Support Ticket', type: 'order', priority: 'normal', message: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/support', formData);
      if (res.success) {
        addToast('Support ticket created successfully!', 'success');
        setFormData(prev => ({ ...prev, message: '' }));
      } else {
        addToast(res.error || 'Failed to create ticket', 'error');
      }
    } catch (err) {
      addToast(err.error || 'Failed to create ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero eyebrow="Support System" title="Ticketing, routing, and customer care workflows." description="A complete support surface for escalations, order issues, refunds, technical help, and priority routing." compact />
      <section className="split-panel">
        <form className="premium-card form-grid" onSubmit={handleSubmit}>
          {!user && <label>Email<input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required /></label>}
          <label>Issue type
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
              <option value="order">Order issue</option>
              <option value="payment">Payment support</option>
              <option value="account">Account security</option>
              <option value="technical">Technical</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>Priority
            <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="normal">Standard</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <label>Description<textarea rows="5" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required minLength={10} /></label>
          <button className="primary-action" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : <>Create ticket <ArrowRight size={18} /></>}
          </button>
        </form>
        <IconCard icon={Headphones} title="SLA Routing" description="Tickets can be routed by role, severity, order value, and customer tier." />
      </section>
    </>
  );
};

export const LoginPage = () => <AuthPanel mode="login" />;
export const SignupPage = () => <AuthPanel mode="signup" />;
export const ForgotPasswordPage = () => <AuthPanel mode="forgot" />;
export const OTPVerificationPage = () => <AuthPanel mode="otp" />;

export const RBACPage = () => (
  <>
    <PageHero eyebrow="Role-Based Access Control" title="Least-privilege permissions for users, staff, managers, and admins." description="RBAC keeps user dashboards, support tools, product management, analytics, and admin controls properly separated." compact />
    <div className="rbac-grid">{['Customer', 'Support Agent', 'Catalog Manager', 'Admin'].map((role, index) => <article className="premium-card" key={role}><span className="status-pill">Level {index + 1}</span><h3>{role}</h3><p>Access is scoped to the workflows needed for this role, with backend authorization checks ready for protected APIs.</p></article>)}</div>
  </>
);

export const NotFoundPage = () => (
  <PageHero eyebrow="404" title="Page not found." description="The requested route is not available in the MythicMart workspace." actions={<a className="primary-action" href={toHashPath(ROUTES.HOME)}>Return home</a>} />
);

export const SitemapPage = () => (
  <section className="premium-section">
    <div className="section-heading">
      <span className="page-eyebrow">Platform Map</span>
      <h2>Every production page is reachable from the footer and navigation system.</h2>
    </div>
    <div className="footer-link-grid">
      {footerGroups.map(group => (
        <article className="premium-card" key={group.title}>
          <h3>{group.title}</h3>
          {group.links.map(link => <a href={toHashPath(link.path)} key={link.path}>{link.label}</a>)}
        </article>
      ))}
    </div>
  </section>
);
