/* App-wide configuration constants */

export const APP_NAME = 'MythicMart';

/* localStorage keys — centralized to avoid typos */
export const STORAGE_KEYS = {
  CART: 'mm_cart',
  THEME: 'mm_theme',
  TOKEN: 'mm_token',
};

/* Main navigation links */
export const NAV_LINKS = [
  { label: 'Home', href: '#/' },
  { label: 'Products', href: '#/products' },
  { label: 'Categories', href: '#/categories' },
  { label: 'Services', href: '#/services' },
  { label: 'Dashboard', href: '#/dashboard' },
  { label: 'Support', href: '#/support' },
];

/* Product category filters */
export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'bags', label: 'Bags' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'footwear', label: 'Footwear' },
];

/* Platform stats displayed on homepage */
export const STATS = [
  { id: 'customers', value: '50k+', label: 'Happy Customers' },
  { id: 'brands', value: '200+', label: 'Premium Brands' },
  { id: 'support', value: '24/7', label: 'Support System' },
];
