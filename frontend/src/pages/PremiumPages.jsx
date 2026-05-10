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
import HeroSection from '../components/sections/HeroSection';
import ProductSection from '../components/sections/ProductSection';
import CategoryFilter from '../components/ui/CategoryFilter';
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
import { CATEGORIES } from '../utils/constants';
import { ROUTES, toHashPath } from '../utils/routes';
import { formatPrice } from '../utils/formatters';
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

const ProductMiniCard = ({ product, actionLabel = 'View details' }) => (
  <article className="product-mini-card">
    <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
    <div>
      <span className="status-pill">{product.category}</span>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="mini-card-footer">
        <strong>{formatPrice(product.price)}</strong>
        <a href={toHashPath(`/products/${product.slug || product.id}`)}>{actionLabel}</a>
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

const AuthPanel = ({ mode }) => {
  const labels = {
    login: ['Welcome back', 'Access orders, wishlist, rewards, and dashboard tools.'],
    signup: ['Create account', 'Start a protected shopping profile with personalized recommendations.'],
    forgot: ['Reset password', 'Receive a secure recovery link and OTP verification.'],
    otp: ['Verify OTP', 'Confirm your identity before sensitive account changes.'],
  };
  const [title, description] = labels[mode];

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <span className="page-eyebrow">Secure Access</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="auth-benefit-list">
          {authBenefits.map(({ icon, title: itemTitle, description: itemDescription }) => (
            <div key={itemTitle}>
              {React.createElement(icon, { size: 18, 'aria-hidden': true })}
              <span>{itemTitle}</span>
              <small>{itemDescription}</small>
            </div>
          ))}
        </div>
      </div>
      <form className="premium-card auth-form">
        {mode === 'signup' && <label>Name<input type="text" placeholder="Sarthak Mathapati" /></label>}
        {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
          <label>Email<input type="email" placeholder="you@mythicmart.com" /></label>
        )}
        {(mode === 'login' || mode === 'signup') && (
          <label>Password<input type="password" placeholder="Password" /></label>
        )}
        {mode === 'otp' && <label>OTP Code<input type="text" inputMode="numeric" placeholder="123456" /></label>}
        <button type="button" className="primary-action">
          {mode === 'login' ? 'Login' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Verify account'}
          <ArrowRight size={18} />
        </button>
        <div className="auth-links">
          <a href={toHashPath(ROUTES.LOGIN)}>Login</a>
          <a href={toHashPath(ROUTES.SIGNUP)}>Signup</a>
          <a href={toHashPath(ROUTES.FORGOT_PASSWORD)}>Forgot password</a>
        </div>
      </form>
    </section>
  );
};

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
  const product = products.find(item => item.slug === slug || String(item.id) === slug) || products[0];
  const related = products.filter(item => item.category === product.category && item.id !== product.id).slice(0, 3);

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
            className="primary-action"
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
          <span className="page-eyebrow">Related Products</span>
          <h2>Complete the collection.</h2>
        </div>
        <div className="mini-product-grid">{related.map(item => <ProductMiniCard product={item} key={item.id} />)}</div>
      </section>
    </>
  );
};

export const UserDashboardPage = () => (
  <>
    <PageHero eyebrow="User Dashboard" title="Your shopping command center." description="Track orders, rewards, saved items, recommendations, notifications, and account health from one responsive workspace." compact />
    <MetricGrid metrics={dashboardMetrics} />
    <section className="split-panel">
      <TableShell />
      <article className="premium-card">
        <h3>Recommended next</h3>
        <div className="mini-product-list">{products.slice(0, 3).map(product => <ProductMiniCard product={product} key={product.id} />)}</div>
      </article>
    </section>
  </>
);

export const AdminDashboardPage = () => (
  <>
    <PageHero eyebrow="Admin Dashboard" title="Operate catalog, users, sales, and content from one place." description="A production admin shell for inventory, product management, reports, moderation, and platform health." compact />
    <MetricGrid metrics={adminMetrics} />
    <section className="split-panel">
      <ChartCard title="Sales tracking" />
      <article className="premium-card management-list">
        <h3>Management Queue</h3>
        {['Review low-stock products', 'Approve 12 pending reviews', 'Publish summer collection', 'Export weekly sales report'].map(item => (
          <div key={item}><CheckCircle2 size={18} /><span>{item}</span><ChevronRight size={16} /></div>
        ))}
      </article>
    </section>
  </>
);

export const AnalyticsPage = () => (
  <>
    <PageHero eyebrow="Analytics" title="Decision-ready commerce intelligence." description="Track revenue, conversion, traffic, inventory movement, customer retention, and sales performance." compact />
    <MetricGrid metrics={adminMetrics} />
    <ChartCard title="Weekly revenue index" />
  </>
);

export const OrdersPage = () => (
  <>
    <PageHero eyebrow="Orders" title="Order history and fulfillment tracking." description="Review order status, delivery progress, invoices, returns, and support handoffs." compact />
    <TableShell title="Order tracking" />
  </>
);

export const WishlistPage = () => (
  <>
    <PageHero eyebrow="Wishlist" title="Saved products and price-drop alerts." description="A personalized saved catalog with fast checkout entry points and notification-ready price monitoring." compact />
    <div className="mini-product-grid">{products.slice(2, 6).map(product => <ProductMiniCard product={product} key={product.id} actionLabel="Move to cart" />)}</div>
  </>
);

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
  const { totalPrice } = useCart();
  return (
    <>
      <PageHero eyebrow="Checkout" title="Secure, payment-ready checkout." description="Shipping, coupon, payment authorization, and review steps are organized for a fast production checkout flow." compact />
      <section className="checkout-grid">
        <form className="premium-card form-grid">
          <label>Full name<input type="text" placeholder="Sarthak Mathapati" /></label>
          <label>Email<input type="email" placeholder="you@mythicmart.com" /></label>
          <label>Address<input type="text" placeholder="Street address" /></label>
          <label>Coupon<input type="text" placeholder="MYTHIC10" /></label>
          <button className="primary-action" type="button">Validate and pay <CreditCard size={18} /></button>
        </form>
        <article className="premium-card checkout-summary">
          <h3>Payment Review</h3>
          <div><span>Subtotal</span><strong>{formatPrice(totalPrice)}</strong></div>
          <div><span>Shipping</span><strong>Free</strong></div>
          <div><span>Total</span><strong>{formatPrice(totalPrice * 1.08)}</strong></div>
        </article>
      </section>
    </>
  );
};

export const ProfilePage = () => (
  <>
    <PageHero eyebrow="Profile" title="Account identity and preferences." description="Manage personal details, saved addresses, rewards profile, and secure account metadata." compact />
    <form className="premium-card form-grid"><label>Name<input defaultValue="Guest User" /></label><label>Email<input defaultValue="guest@mythicmart.com" /></label><label>Phone<input placeholder="+91 98765 43210" /></label><button className="primary-action" type="button">Save profile</button></form>
  </>
);

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

export const ContactPage = () => (
  <>
    <PageHero eyebrow="Contact" title="Reach the MythicMart team." description="Sales, support, partnerships, and customer care are routed through a production-ready contact workflow." compact />
    <section className="split-panel"><form className="premium-card form-grid"><label>Name<input /></label><label>Email<input type="email" /></label><label>Message<textarea rows="5" /></label><button className="primary-action" type="button">Send message <Mail size={18} /></button></form><IconCard icon={MapPin} title="Commerce HQ" description="Remote-first support with regional fulfillment partners and 24/7 escalation paths." /></section>
  </>
);

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

export const SupportSystemPage = () => (
  <>
    <PageHero eyebrow="Support System" title="Ticketing, routing, and customer care workflows." description="A complete support surface for escalations, order issues, refunds, technical help, and priority routing." compact />
    <section className="split-panel"><form className="premium-card form-grid"><label>Issue type<select><option>Order issue</option><option>Payment support</option><option>Account security</option></select></label><label>Priority<select><option>Standard</option><option>High</option><option>Urgent</option></select></label><label>Description<textarea rows="5" /></label><button className="primary-action" type="button">Create ticket <ArrowRight size={18} /></button></form><IconCard icon={Headphones} title="SLA Routing" description="Tickets can be routed by role, severity, order value, and customer tier." /></section>
  </>
);

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
