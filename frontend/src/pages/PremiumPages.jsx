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
} from 'lucide-react';
import HeroSection from '../components/common/HeroSection';
import ProductSection from '../features/products/components/ProductSection';
import CategoryFilter from '../features/products/components/CategoryFilter';
import AuthPanel from '../features/auth/components/AuthPanel';
import products from '../data/products';
import {
  adminMetrics,
  analyticsSeries,
  authBenefits,
  blogPosts,
  careers,
  categoryShowcase,
  dashboardMetrics,
  faqItems,
  footerGroups,
  homeStats,
  helpTopics,
  notifications,
  operationsCards,
  orderTimeline,
  recommendationCards,
  serviceCards,
  testimonials,
} from '../data/siteContent';
import { useCart } from '../hooks/useCart';
import { useUI } from '../context/UIContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/constants';
import { ROUTES, toHashPath } from '../utils/routes';
import { formatPrice } from '../utils/formatters';
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
    <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
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

    <section className="premium-section home-stat-strip" aria-label="Commerce performance highlights">
      <MetricGrid metrics={homeStats} />
    </section>

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
        {categoryShowcase.map(({ id, title, stat, tone, icon }) => (
          <a className="category-showcase-card" href={toHashPath(ROUTES.PRODUCTS)} key={id}>
            {React.createElement(icon, { size: 22, 'aria-hidden': true })}
            <h3>{title}</h3>
            <p>{tone}</p>
            <span>{stat}</span>
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
      <div className="mini-product-grid">{products.slice(0, 3).map(product => <ProductMiniCard product={product} key={product.id} />)}</div>
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
      description="Browse products with search, category filters, sort-ready APIs, loading skeletons, fallback data, and responsive product cards."
      compact
    />
    <ProductSection />
  </>
);

export const CategoriesPage = () => {
  const { setSearchQuery } = useUI();
  return (
    <>
      <PageHero eyebrow="Categories" title="Collections built for quick discovery." description="Each category is optimized for merchandising, filtering, and future personalized ranking." compact />
      <div className="category-showcase-grid">
        {categoryShowcase.map(({ id, title, stat, tone, icon }) => (
          <a className="category-showcase-card" href={toHashPath(ROUTES.PRODUCTS)} key={id} onClick={() => setSearchQuery('')}>
            {React.createElement(icon, { size: 22, 'aria-hidden': true })}
            <h3>{title}</h3>
            <p>{tone}</p>
            <span>{stat}</span>
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
  const product = products.find(item => item.slug === slug || String(item.id) === slug) || products[0];
  const related = products.filter(item => item.category === product.category && item.id !== product.id).slice(0, 3);
  
  const [reviews, setReviews] = React.useState([]);
  const [loadingReviews, setLoadingReviews] = React.useState(true);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [reviewForm, setReviewForm] = React.useState({ rating: 5, title: '', comment: '', guestName: '' });
  const [submittingReview, setSubmittingReview] = React.useState(false);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/reviews?productId=${product.id}`);
        if (response.success) setReviews(response.data);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product.id]);

  const handleReviewChange = (e) => setReviewForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const payload = {
        productId: product.id,
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
      } else {
        addToast(response.error || 'Failed to submit review', 'error');
      }
    } catch (err) {
      addToast(err.error || 'Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <section className="product-detail-layout" style={{ '--product-accent': product.accent || '#2f6fed' }}>
        <div className="product-gallery">
          <img src={product.image} alt={product.name} />
          <div>
            {[product.image, ...related.map(item => item.image)].slice(0, 4).map((image, index) => (
              <img src={image} alt="" aria-hidden="true" key={`${image}-${index}`} />
            ))}
          </div>
        </div>
        <article className="premium-card product-detail-card">
          <div className="detail-kicker-row">
            <span className="status-pill">{product.badge || product.category}</span>
            <span className="status-pill">AI fit {product.aiScore || 92}%</span>
          </div>
          <h1>{product.name}</h1>
          <span className="product-brand">{product.brand || 'MythicMart'} - {product.collection || 'Premium collection'}</span>
          <p>{product.description}</p>
          <div className="rating-row"><Star size={18} fill="currentColor" /> {product.rating} · {product.reviewCount} reviews</div>
          <div className="price-stack">
            <strong>{formatPrice(product.price)}</strong>
            {product.originalPrice && <span>{formatPrice(product.originalPrice)}</span>}
          </div>
          <div className="detail-feature-grid">
            <span><Truck size={16} /> {product.freeShipping ? 'Free shipping' : 'Standard shipping'}</span>
            <span><PackageCheck size={16} /> {product.stock} units available</span>
            <span><TicketPercent size={16} /> Coupon eligible</span>
          </div>
          <button
            className="cta-button"
            type="button"
            onClick={() => {
              addItem(product);
              addToast(`Added ${product.name} to cart`, 'success');
            }}
          >
            Add to cart <ShoppingBag size={18} />
          </button>
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

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my');
        if (response.success) {
          setRecentOrders(response.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load recent orders for dashboard:', err);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  return (
    <>
      <PageHero eyebrow="User Dashboard" title={`Welcome back, ${user?.name || 'Shopper'}.`} description="Track orders, rewards, saved items, recommendations, notifications, and account health from one responsive workspace." compact />
      <MetricGrid metrics={dashboardMetrics} />
      <section className="split-panel">
        <TableShell rows={recentOrders.length > 0 ? recentOrders.map(o => ({
          id: o._id.slice(-6).toUpperCase(),
          product: o.items.length === 1 ? o.items[0].name : `${o.items[0].name} + ${o.items.length - 1} more`,
          status: o.status || o.timeline?.[o.timeline.length - 1]?.status || 'pending',
          date: new Date(o.createdAt).toLocaleDateString(),
          amount: formatPrice(o.total)
        })) : []} title="Recent Orders" />
        <article className="premium-card">
          <h3>Recommended next</h3>
          <div className="mini-product-list">{products.slice(0, 3).map(product => <ProductMiniCard product={product} key={product.id} />)}</div>
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
      <PageHero eyebrow="Admin Dashboard" title="Operate catalog, users, sales, and content from one place." description="A production admin shell for inventory, product management, reports, moderation, and platform health." compact />
      <MetricGrid metrics={adminMetrics} />
      <section className="split-panel">
        <TableShell title="Recent System Orders" rows={data.orders.map(o => ({
          id: o._id.slice(-6).toUpperCase(),
          user: o.user?.name || o.guestEmail || 'Unknown',
          status: o.status,
          date: new Date(o.createdAt).toLocaleDateString(),
          amount: formatPrice(o.total)
        }))} />
        <article className="premium-card management-list">
          <h3>Recent Users</h3>
          {data.users.length === 0 && !loading && <p>No users found.</p>}
          {loading ? <p>Loading...</p> : data.users.map(u => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
              <span>{u.name} ({u.role})</span>
              <span className="status-pill">{u.isActive ? 'Active' : 'Disabled'}</span>
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
  ] : adminMetrics;

  return (
    <>
      <PageHero eyebrow="Analytics" title="Decision-ready commerce intelligence." description="Track revenue, conversion, traffic, inventory movement, customer retention, and sales performance." compact />
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading intelligence data...</div>
      ) : (
        <>
          <MetricGrid metrics={metrics} />
          <ChartCard title="Weekly revenue index" />
        </>
      )}
    </>
  );
};

export const OrdersPage = () => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { addToast } = useToast();

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my');
        if (response.success) {
          setOrders(response.data);
        }
      } catch (err) {
        addToast(err.error || 'Failed to load orders', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [addToast]);

  return (
    <>
      <PageHero eyebrow="Orders" title="Order history and fulfillment tracking." description="Review order status, delivery progress, invoices, returns, and support handoffs." compact />
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>
      ) : (
        <TableShell rows={orders.length > 0 ? orders.map(o => ({
          id: o._id.slice(-6).toUpperCase(),
          product: o.items.length === 1 ? o.items[0].name : `${o.items[0].name} + ${o.items.length - 1} more`,
          status: o.status || o.timeline?.[o.timeline.length - 1]?.status || 'pending',
          date: new Date(o.createdAt).toLocaleDateString(),
          amount: formatPrice(o.total)
        })) : []} title="Your orders" />
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
  const { user } = useAuth();
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
        // A robust solution would also update the AuthContext user state here
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

export const SettingsPage = () => (
  <>
    <PageHero eyebrow="Settings" title="Privacy, security, and communication controls." description="Tune account security, notification channels, theme preferences, and checkout defaults." compact />
    <div className="feature-grid">{['Two-factor authentication', 'Order SMS updates', 'Price-drop emails', 'Dark mode default', 'Saved payment review', 'Data export'].map(item => <IconCard key={item} icon={ShieldCheck} title={item} description="Configured for production account management workflows." />)}</div>
  </>
);

export const NotificationsPage = () => (
  <>
    <PageHero eyebrow="Notifications" title="Order, wishlist, and security alerts." description="A central inbox for real-time commerce events and account updates." compact />
    <div className="notification-list">{notifications.map(({ icon: Icon, title, message, type }) => <IconCard key={title} icon={Icon} title={title} description={message} meta={type} />)}</div>
  </>
);

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

export const ReviewsPage = () => (
  <>
    <PageHero eyebrow="Reviews" title="Product reviews and moderation-ready feedback." description="Ratings, reviews, helpful votes, and admin moderation are ready to support buyer confidence." compact />
    <div className="feature-grid">{products.slice(0, 4).map(product => <IconCard key={product.id} icon={Star} title={product.name} description={`${product.rating} rating from ${product.reviewCount} reviews.`} />)}</div>
  </>
);

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
