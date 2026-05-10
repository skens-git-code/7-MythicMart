import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Headphones,
  Heart,
  LineChart,
  LockKeyhole,
  PackageCheck,
  Palette,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Truck,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-react';
import { ROUTES } from '../utils/routes';

export const primaryNavLinks = [
  { label: 'Home', path: ROUTES.HOME },
  { label: 'Products', path: ROUTES.PRODUCTS },
  { label: 'Categories', path: ROUTES.CATEGORIES },
  { label: 'Services', path: ROUTES.SERVICES },
  { label: 'Dashboard', path: ROUTES.DASHBOARD },
  { label: 'Support', path: ROUTES.SUPPORT },
];

export const quickAccessLinks = [
  { label: 'Orders', path: ROUTES.ORDERS, icon: ClipboardList },
  { label: 'Wishlist', path: ROUTES.WISHLIST, icon: Heart },
  { label: 'Analytics', path: ROUTES.ANALYTICS, icon: BarChart3 },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: SlidersHorizontal },
];

export const footerGroups = [
  {
    title: 'Company',
    links: [
      { label: 'About', path: ROUTES.ABOUT },
      { label: 'Careers', path: ROUTES.CAREERS },
      { label: 'Blog', path: ROUTES.BLOG },
      { label: 'Contact', path: ROUTES.CONTACT },
    ],
  },
  {
    title: 'Commerce',
    links: [
      { label: 'Products', path: ROUTES.PRODUCTS },
      { label: 'Categories', path: ROUTES.CATEGORIES },
      { label: 'Reviews', path: ROUTES.REVIEWS },
      { label: 'Checkout', path: ROUTES.CHECKOUT },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', path: ROUTES.HELP },
      { label: 'Support System', path: ROUTES.SUPPORT },
      { label: 'FAQ', path: ROUTES.FAQ },
      { label: 'Notifications', path: ROUTES.NOTIFICATIONS },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', path: ROUTES.PRIVACY },
      { label: 'Terms', path: ROUTES.TERMS },
      { label: 'RBAC', path: ROUTES.RBAC },
    ],
  },
];

export const serviceCards = [
  { title: 'Personal Shopping', description: 'Curated recommendations powered by order history, browsing intent, and premium collection signals.', icon: Sparkles },
  { title: 'Secure Checkout', description: 'Hardened authentication, coupon validation, order review, and payment-ready checkout flow.', icon: ShieldCheck },
  { title: 'Fast Fulfillment', description: 'Inventory-aware ordering, delivery tracking, returns workflows, and customer support handoff.', icon: Truck },
  { title: 'Commerce Operations', description: 'Admin analytics, catalog controls, sales reports, review moderation, and content management.', icon: Activity },
];

export const categoryShowcase = [
  { id: 'electronics', title: 'Electronics', stat: '148 items', tone: 'Signal black', icon: Activity },
  { id: 'accessories', title: 'Accessories', stat: '226 items', tone: 'Brushed gold', icon: WalletCards },
  { id: 'bags', title: 'Bags', stat: '83 items', tone: 'Italian leather', icon: ShoppingBag },
  { id: 'clothing', title: 'Clothing', stat: '117 items', tone: 'Merino edit', icon: Palette },
  { id: 'footwear', title: 'Footwear', stat: '62 items', tone: 'Performance fit', icon: PackageCheck },
];

export const dashboardMetrics = [
  { label: 'Lifetime spend', value: '$4,820', delta: '+18%', icon: CreditCard },
  { label: 'Orders tracked', value: '28', delta: '4 active', icon: PackageCheck },
  { label: 'Wishlist value', value: '$1,430', delta: '9 items', icon: Heart },
  { label: 'Reward tier', value: 'Gold', delta: '82% to Platinum', icon: Sparkles },
];

export const adminMetrics = [
  { label: 'Revenue', value: '$184.6k', delta: '+12.4%', icon: LineChart },
  { label: 'Orders', value: '3,482', delta: '+8.1%', icon: ClipboardList },
  { label: 'Customers', value: '28.9k', delta: '+5.6%', icon: Users },
  { label: 'Conversion', value: '6.8%', delta: '+1.2%', icon: Activity },
];

export const analyticsSeries = [
  { label: 'Mon', value: 42 },
  { label: 'Tue', value: 58 },
  { label: 'Wed', value: 74 },
  { label: 'Thu', value: 69 },
  { label: 'Fri', value: 88 },
  { label: 'Sat', value: 96 },
  { label: 'Sun', value: 81 },
];

export const orderTimeline = [
  { id: 'MM-1092', status: 'Delivered', product: 'Obsidian Chronograph', amount: '$199.00', date: 'May 6, 2026' },
  { id: 'MM-1087', status: 'In transit', product: 'Onyx Wireless Earbuds', amount: '$149.00', date: 'May 4, 2026' },
  { id: 'MM-1074', status: 'Processing', product: 'Midnight Leather Tote', amount: '$129.00', date: 'May 2, 2026' },
];

export const notifications = [
  { title: 'Order shipped', message: 'Your Onyx Wireless Earbuds are moving through express fulfillment.', type: 'Shipping', icon: Truck },
  { title: 'Price drop', message: 'Titanium Card Wallet is now 20% lower than your saved price.', type: 'Wishlist', icon: Heart },
  { title: 'Security review complete', message: 'Your account login settings passed the latest protection check.', type: 'Security', icon: LockKeyhole },
];

export const testimonials = [
  { quote: 'MythicMart feels like a premium concierge wrapped around a fast e-commerce engine.', name: 'Aarav Mehta', role: 'Product Designer' },
  { quote: 'The checkout and order tracking experience are clean, predictable, and fast on mobile.', name: 'Nora Collins', role: 'Retail Founder' },
  { quote: 'The admin side gives the right signals without drowning the team in dashboards.', name: 'Elena Park', role: 'Operations Lead' },
];

export const homeStats = [
  { label: 'Curated products', value: '12.8k', delta: '+24% discovery velocity', icon: Sparkles },
  { label: 'Avg. checkout', value: '42s', delta: 'Express-ready flow', icon: CreditCard },
  { label: 'Live orders', value: '3,482', delta: 'Tracked across regions', icon: PackageCheck },
  { label: 'Repeat buyers', value: '68%', delta: '+11% retention lift', icon: RefreshCcw },
];

export const recommendationCards = [
  { title: 'AI Style Match', description: 'Ranks products by browsing intent, saved items, budget, and active collection context.', icon: Sparkles, score: '98%' },
  { title: 'Smart Search', description: 'Search suggestions, category weighting, cached product results, and fallback catalog data.', icon: Search, score: '0.14s' },
  { title: 'Delivery Fit', description: 'Prioritizes in-stock items with free shipping, regional fulfillment, and support handoff signals.', icon: Truck, score: '24/7' },
];

export const operationsCards = [
  { label: 'Inventory health', value: '94%', detail: '5 low-stock alerts', icon: PackageCheck },
  { label: 'Revenue index', value: '$184.6k', detail: '+12.4% weekly', icon: LineChart },
  { label: 'Support SLA', value: '98.7%', detail: 'Priority routing active', icon: Headphones },
  { label: 'Risk review', value: 'Clean', detail: 'Auth and RBAC checks', icon: ShieldCheck },
];

export const faqItems = [
  { question: 'How are orders tracked?', answer: 'Each order receives a fulfillment timeline with processing, packed, shipped, and delivered states.' },
  { question: 'Can admins manage inventory?', answer: 'The admin workspace includes inventory alerts, product management, and catalog performance reports.' },
  { question: 'Is the application mobile ready?', answer: 'The UI uses responsive layouts, touch-friendly controls, accessible focus states, and compact mobile navigation.' },
  { question: 'How is user data protected?', answer: 'The backend uses JWT auth, validation, rate limiting, strict CORS, request IDs, and sanitized MongoDB queries.' },
];

export const blogPosts = [
  { title: 'Building a Premium Commerce Experience', tag: 'Design', read: '6 min read' },
  { title: 'Inventory Signals Every Store Should Track', tag: 'Operations', read: '5 min read' },
  { title: 'Checkout UX Patterns That Reduce Drop-off', tag: 'Growth', read: '7 min read' },
];

export const careers = [
  { role: 'Frontend Platform Engineer', team: 'Experience', location: 'Remote' },
  { role: 'Commerce Operations Analyst', team: 'Growth', location: 'Bengaluru' },
  { role: 'Backend API Engineer', team: 'Infrastructure', location: 'Remote' },
];

export const authBenefits = [
  { title: 'Role-based access', description: 'Users, support agents, managers, and admins see only the tools they need.', icon: UserRound },
  { title: 'Protected checkout', description: 'Sessions, rate limits, validation, and account-aware order history stay aligned.', icon: LockKeyhole },
  { title: 'Personalized commerce', description: 'Saved carts, wishlists, recommendations, and notifications follow each user.', icon: RefreshCcw },
];

export const helpTopics = [
  { title: 'Account and security', description: 'Password reset, OTP verification, session safety, and role permissions.', icon: ShieldCheck },
  { title: 'Orders and delivery', description: 'Tracking, invoices, delivery estimates, returns, and address updates.', icon: PackageCheck },
  { title: 'Payments and coupons', description: 'Cards, payment authorization, coupon validation, and refunds.', icon: CreditCard },
  { title: 'Contact support', description: 'Ticket triage, priority routing, status updates, and customer care.', icon: Headphones },
  { title: 'Product discovery', description: 'Search, filters, sorting, recommendations, categories, and reviews.', icon: Search },
  { title: 'Notifications', description: 'Order updates, price alerts, wishlist reminders, and security notices.', icon: Bell },
];
