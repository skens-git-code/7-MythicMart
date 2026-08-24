export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  PRODUCT_DETAILS: '/products/obsidian-chronograph',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  ANALYTICS: '/analytics',
  INTEGRATIONS: '/integrations',
  INVENTORY: '/inventory',
  CUSTOMERS: '/customers',
  COUPONS: '/coupons',
  ACTIVITY: '/activity',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  CONTACT: '/contact',
  FAQ: '/faq',
  BLOG: '/blog',
  CAREERS: '/careers',
  REVIEWS: '/reviews',
  TESTIMONIALS: '/testimonials',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  HELP: '/help',
  SUPPORT: '/support',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  OTP: '/otp-verification',
  RBAC: '/rbac',
};

export const toHashPath = (path = ROUTES.HOME) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `#${normalized}`;
};

export const normalizeRoute = (hash = window.location.hash) => {
  const route = hash.replace(/^#/, '') || ROUTES.HOME;
  const cleaned = route.split('?')[0].replace(/\/+$/, '');
  if (!cleaned) return ROUTES.HOME;
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
};

export const pageTitleFromRoute = (route) => {
  const segment = route.split('/').filter(Boolean).at(-1) || 'home';
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
