import { GraphQLClient, gql } from 'graphql-request';
import { config } from '../config/env.js';

const endpoint = `https://${config.shopify.storeDomain}/api/2024-01/graphql.json`;

const client = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token': config.shopify.storefrontAccessToken,
    'Content-Type': 'application/json',
  },
});

const STATIC_FALLBACK_PRODUCTS = [
  { id: 'shopify-prod-1', variantId: 'gid://shopify/ProductVariant/101', slug: 'obsidian-chronograph', name: 'Obsidian Chronograph', brand: 'Mythic Atelier', collection: 'Signature Edit', accent: '#2563eb', aiScore: 98, salesCount: 920, featured: true, description: 'Precision-engineered timepiece with sapphire crystal and automatic movement.', price: 199, originalPrice: 249, category: 'accessories', image: '/assets/product-watch.png', badge: 'Best Seller', stock: 12, freeShipping: true, rating: 4.8, reviewCount: 124 },
  { id: 'shopify-prod-2', variantId: 'gid://shopify/ProductVariant/102', slug: 'midnight-leather-tote', name: 'Midnight Leather Tote', brand: 'Nocturne Goods', collection: 'Executive Carry', accent: '#f97316', aiScore: 91, salesCount: 610, featured: false, description: 'Hand-stitched full-grain Italian leather with magnetic clasp.', price: 129, originalPrice: 169, category: 'bags', image: '/assets/product-bag.png', badge: 'Popular', stock: 8, freeShipping: true, rating: 4.6, reviewCount: 89 },
  { id: 'shopify-prod-3', variantId: 'gid://shopify/ProductVariant/103', slug: 'carbon-fiber-sunglasses', name: 'Carbon Fiber Polarized Shades', brand: 'Vector Shade', collection: 'Aero Carbon', accent: '#06b6d4', aiScore: 94, salesCount: 480, featured: false, description: 'Ultra-light carbon fiber frames with UV400 polarized optics.', price: 139, originalPrice: 179, category: 'accessories', image: '/assets/product-sunglasses.png', badge: 'New', stock: 24, freeShipping: false, rating: 4.5, reviewCount: 67 },
  { id: 'shopify-prod-4', variantId: 'gid://shopify/ProductVariant/104', slug: 'onyx-wireless-earbuds', name: 'Onyx Studio Wireless Earbuds', brand: 'Sequoia Labs', collection: 'Signal Sound', accent: '#10b981', aiScore: 99, salesCount: 1280, featured: true, description: 'Active noise cancellation with 32-hour battery life and spatial audio.', price: 149, originalPrice: 199, category: 'electronics', image: '/assets/product-earbuds.png', badge: 'Trending', stock: 15, freeShipping: true, rating: 4.9, reviewCount: 203 },
  { id: 'shopify-prod-5', variantId: 'gid://shopify/ProductVariant/105', slug: 'phantom-runner-pro', name: 'Phantom Carbon Runner Pro', brand: 'Kinetic House', collection: 'Motion System', accent: '#d946ef', aiScore: 93, salesCount: 430, featured: true, description: 'Featherlight performance marathon shoe with carbon fiber propulsion plate.', price: 189, originalPrice: 229, category: 'footwear', image: '/assets/product-watch.png', badge: 'New', stock: 18, freeShipping: true, rating: 4.7, reviewCount: 58 },
  { id: 'shopify-prod-6', variantId: 'gid://shopify/ProductVariant/106', slug: 'eclipse-merino-pullover', name: 'Eclipse Merino Wool Pullover', brand: 'Northline Studio', collection: 'Soft Utility', accent: '#64748b', aiScore: 88, salesCount: 310, featured: false, description: 'Ultra-soft 100% fine merino wool knit in midnight graphite.', price: 119, originalPrice: 149, category: 'clothing', image: '/assets/product-bag.png', badge: 'Staff Pick', stock: 20, freeShipping: false, rating: 4.4, reviewCount: 41 },
  { id: 'shopify-prod-7', variantId: 'gid://shopify/ProductVariant/107', slug: 'titanium-card-wallet', name: 'Titanium RFID Minimalist Wallet', brand: 'Vaultform', collection: 'Everyday Armor', accent: '#84cc16', aiScore: 96, salesCount: 760, featured: true, description: 'Aerospace-grade CNC-milled titanium with integrated RFID shield.', price: 79, originalPrice: 99, category: 'accessories', image: '/assets/product-sunglasses.png', badge: 'Best Seller', stock: 35, freeShipping: true, rating: 4.6, reviewCount: 176 },
  { id: 'shopify-prod-8', variantId: 'gid://shopify/ProductVariant/108', slug: 'noir-smart-speaker', name: 'Noir Wireless Studio Speaker', brand: 'Roomtone', collection: 'Home Signal', accent: '#ef4444', aiScore: 92, salesCount: 540, featured: false, description: 'Acoustic 360-degree spatial sound enclosed in matte aluminum housing.', price: 229, originalPrice: 279, category: 'electronics', image: '/assets/product-earbuds.png', badge: 'Sale', stock: 9, freeShipping: true, rating: 4.7, reviewCount: 92 },
  { id: 'shopify-prod-9', variantId: 'gid://shopify/ProductVariant/109', slug: 'apex-mechanical-keyboard', name: 'Apex Custom Mechanical Keyboard', brand: 'KeyForge', collection: 'Workspace Edit', accent: '#6366f1', aiScore: 97, salesCount: 840, featured: true, description: 'Gasket-mounted CNC aluminum chassis with pre-lubed linear switches.', price: 179, originalPrice: 219, category: 'electronics', image: '/assets/product-watch.png', badge: 'Hot', stock: 14, freeShipping: true, rating: 4.9, reviewCount: 142 },
  { id: 'shopify-prod-10', variantId: 'gid://shopify/ProductVariant/110', slug: 'voyager-waterproof-backpack', name: 'Voyager All-Weather Commuter Pack', brand: 'Nomad Grid', collection: 'Urban Expedition', accent: '#0ea5e9', aiScore: 95, salesCount: 670, featured: true, description: 'Cordura ballistic nylon with magnetic Fidlock closures and 16" laptop sleeve.', price: 165, originalPrice: 195, category: 'bags', image: '/assets/product-bag.png', badge: 'Best Seller', stock: 22, freeShipping: true, rating: 4.8, reviewCount: 118 },
  { id: 'shopify-prod-11', variantId: 'gid://shopify/ProductVariant/111', slug: 'solaris-smart-ring', name: 'Solaris Health & Sleep Smart Ring', brand: 'AuraTech', collection: 'Biometrics', accent: '#eab308', aiScore: 96, salesCount: 910, featured: true, description: 'Titanium biometric ring tracking sleep, HRV, recovery and temperature.', price: 249, originalPrice: 299, category: 'accessories', image: '/assets/product-watch.png', badge: 'Trending', stock: 11, freeShipping: true, rating: 4.7, reviewCount: 165 },
  { id: 'shopify-prod-12', variantId: 'gid://shopify/ProductVariant/112', slug: 'zenith-chelsea-boot', name: 'Zenith Waterproof Chelsea Boot', brand: 'Kinetic House', collection: 'Motion System', accent: '#a855f7', aiScore: 90, salesCount: 390, featured: false, description: 'Waterproof oiled suede with custom Vibram cushion lug sole.', price: 215, originalPrice: 260, category: 'footwear', image: '/assets/product-bag.png', badge: 'Exclusive', stock: 16, freeShipping: true, rating: 4.6, reviewCount: 52 },
  { id: 'shopify-prod-13', variantId: 'gid://shopify/ProductVariant/113', slug: 'stealth-tech-bomber', name: 'Stealth Shield Waterproof Bomber', brand: 'Northline Studio', collection: 'Soft Utility', accent: '#3b82f6', aiScore: 92, salesCount: 490, featured: false, description: 'Three-layer breathable GORE-TEX stormproof membrane with laser-cut vents.', price: 289, originalPrice: 340, category: 'clothing', image: '/assets/product-sunglasses.png', badge: 'Premium', stock: 7, freeShipping: true, rating: 4.8, reviewCount: 73 },
  { id: 'shopify-prod-14', variantId: 'gid://shopify/ProductVariant/114', slug: 'maglock-fast-charge-powerbank', name: 'MagLock 100W Wireless Power Hub', brand: 'Sequoia Labs', collection: 'Power Series', accent: '#14b8a6', aiScore: 95, salesCount: 1150, featured: true, description: 'Anodized aluminum 20,000mAh magnetic power bank with digital wattage display.', price: 89, originalPrice: 119, category: 'electronics', image: '/assets/product-earbuds.png', badge: 'Best Seller', stock: 40, freeShipping: true, rating: 4.9, reviewCount: 280 },
  { id: 'shopify-prod-15', variantId: 'gid://shopify/ProductVariant/115', slug: 'artisan-leather-desk-pad', name: 'Artisan Top-Grain Leather Desk Mat', brand: 'Nocturne Goods', collection: 'Workspace Edit', accent: '#f59e0b', aiScore: 89, salesCount: 520, featured: false, description: 'Vegetable-tanned leather desk protector with integrated pen rest and cable channel.', price: 69, originalPrice: 89, category: 'accessories', image: '/assets/product-bag.png', badge: null, stock: 28, freeShipping: false, rating: 4.6, reviewCount: 64 },
  { id: 'shopify-prod-16', variantId: 'gid://shopify/ProductVariant/116', slug: 'lunar-acoustic-overear-headphones', name: 'Lunar Hi-Fi ANC Wireless Headphones', brand: 'Roomtone', collection: 'Acoustic Master', accent: '#ec4899', aiScore: 98, salesCount: 890, featured: true, description: 'Custom 50mm beryllium dynamic drivers with lossless spatial audio decoding.', price: 349, originalPrice: 399, category: 'electronics', image: '/assets/product-earbuds.png', badge: 'Flagship', stock: 6, freeShipping: true, rating: 4.9, reviewCount: 189 },
  { id: 'shopify-prod-17', variantId: 'gid://shopify/ProductVariant/117', slug: 'krypton-folding-knife', name: 'Krypton S35VN Damascus Pocket Tool', brand: 'Vaultform', collection: 'Everyday Armor', accent: '#6b7280', aiScore: 94, salesCount: 620, featured: false, description: 'Ceramic ball bearing deployment with titanium pocket clip.', price: 115, originalPrice: 145, category: 'accessories', image: '/assets/product-sunglasses.png', badge: 'Limited', stock: 19, freeShipping: true, rating: 4.7, reviewCount: 95 },
  { id: 'shopify-prod-18', variantId: 'gid://shopify/ProductVariant/118', slug: 'velocity-lowtop-trainer', name: 'Velocity Minimalist Knit Trainer', brand: 'Kinetic House', collection: 'Motion System', accent: '#10b981', aiScore: 91, salesCount: 710, featured: false, description: 'Seamless recycled knit upper on a high-rebound responsive EVA midsole.', price: 135, originalPrice: 165, category: 'footwear', image: '/assets/product-watch.png', badge: 'New', stock: 25, freeShipping: true, rating: 4.5, reviewCount: 82 },
  { id: 'shopify-prod-19', variantId: 'gid://shopify/ProductVariant/119', slug: 'hyperion-insulated-flask', name: 'Hyperion Vacuum Ceramic Thermal Flask', brand: 'Nomad Grid', collection: 'Urban Expedition', accent: '#0284c7', aiScore: 93, salesCount: 880, featured: false, description: 'Dual-wall copper vacuum insulation with taste-neutral ceramic interior coating.', price: 45, originalPrice: 55, category: 'accessories', image: '/assets/product-bag.png', badge: 'Sale', stock: 50, freeShipping: false, rating: 4.8, reviewCount: 134 },
  { id: 'shopify-prod-20', variantId: 'gid://shopify/ProductVariant/120', slug: 'astral-cashmere-scarf', name: 'Astral Pure Mongolian Cashmere Scarf', brand: 'Mythic Atelier', collection: 'Signature Edit', accent: '#8b5cf6', aiScore: 95, salesCount: 340, featured: true, description: 'Feather-soft grade-A pure Mongolian cashmere with hand-twisted fringe.', price: 155, originalPrice: 185, category: 'clothing', image: '/assets/product-bag.png', badge: 'Luxury', stock: 12, freeShipping: true, rating: 4.9, reviewCount: 61 },
];

export const getProducts = async ({ limit = 20, page = 1, sortKey = 'CREATED_AT', reverse = true, query = '', category = '' } = {}) => {
  if (!config.shopify.storeDomain || config.shopify.storeDomain.includes('your-store-domain')) {
    let list = [...STATIC_FALLBACK_PRODUCTS];
    if (category && category !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    
    const skip = (page - 1) * limit;
    const paginated = list.slice(skip, skip + limit);
    return {
      products: paginated,
      total: list.length,
      page,
      limit,
      pages: Math.ceil(list.length / limit),
    };
  }

  const GET_PRODUCTS = gql`
    query getProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
      products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query) {
        edges {
          node {
            id
            handle
            title
            description
            vendor
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
            collections(first: 1) {
              edges {
                node {
                  title
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    let fullQuery = query;
    if (category && category !== 'all') {
      fullQuery = fullQuery ? `${fullQuery} AND tag:${category}` : `tag:${category}`;
    }
    const data = await client.request(GET_PRODUCTS, { first: limit, sortKey, reverse, query: fullQuery });
    const items = data.products.edges.map(edge => normalizeShopifyProduct(edge.node));
    return {
      products: items,
      total: items.length,
      page: 1,
      limit,
      pages: 1,
    };
  } catch (error) {
    console.warn('Shopify Storefront query fallback to static products:', error.message || error);
    let list = [...STATIC_FALLBACK_PRODUCTS];
    if (category && category !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    const skip = (page - 1) * limit;
    return {
      products: list.slice(skip, skip + limit),
      total: list.length,
      page,
      limit,
      pages: Math.ceil(list.length / limit),
    };
  }
};

export const getProductById = async (idOrHandle) => {
  if (!config.shopify.storeDomain || config.shopify.storeDomain.includes('your-store-domain')) {
    const fallback = STATIC_FALLBACK_PRODUCTS.find(p => p.id === idOrHandle || p.slug === idOrHandle);
    return fallback || null;
  }

  try {
    // If it looks like a global ID (gid://), use it, otherwise use handle
    const isGid = idOrHandle.startsWith('gid://');
    
    if (isGid) {
      const GET_PRODUCT_BY_ID = gql`
        query getProductById($id: ID!) {
          product(id: $id) {
            id
            handle
            title
            description
            vendor
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `;
      const data = await client.request(GET_PRODUCT_BY_ID, { id: idOrHandle });
      return data.product ? normalizeShopifyProduct(data.product) : null;
    } else {
      const GET_PRODUCT_BY_HANDLE = gql`
        query getProductByHandle($handle: String!) {
          product(handle: $handle) {
            id
            handle
            title
            description
            vendor
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `;
      const data = await client.request(GET_PRODUCT_BY_HANDLE, { handle: idOrHandle });
      return data.product ? normalizeShopifyProduct(data.product) : null;
    }
  } catch (error) {
    console.warn('Shopify Storefront product query fallback:', error.message || error);
    const fallback = STATIC_FALLBACK_PRODUCTS.find(p => p.id === idOrHandle || p.slug === idOrHandle);
    return fallback || null;
  }
};

const normalizeShopifyProduct = (node) => {
  const imageUrl = node.images?.edges?.[0]?.node?.url || '/assets/product-placeholder.png';
  const price = parseFloat(node.priceRange?.minVariantPrice?.amount || 0);
  const variantId = node.variants?.edges?.[0]?.node?.id || node.id;
  
  return {
    id: node.id,
    variantId: variantId,
    slug: node.handle,
    name: node.title,
    brand: node.vendor || 'MythicMart',
    description: node.description,
    price: price,
    originalPrice: null, // You can expand this to fetch compareAtPrice
    category: 'general', // Default category
    image: imageUrl,
    featured: false,
    rating: 4.5,
    reviewCount: 0,
    salesCount: 0,
    aiScore: 90,
  };
};

export const createCart = async (items) => {
  const CREATE_CART = gql`
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // First, we need to get the variant ID for each product ID
  // since Shopify CartCreate requires variant IDs (merchandiseId)
  const lines = [];
  for (const item of items) {
    const product = await getProductById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    lines.push({
      merchandiseId: product.variantId,
      quantity: item.quantity
    });
  }

  try {
    const data = await client.request(CREATE_CART, {
      input: {
        lines: lines
      }
    });

    if (data.cartCreate.userErrors.length > 0) {
      console.error('Shopify Cart Errors:', data.cartCreate.userErrors);
      throw new Error(data.cartCreate.userErrors[0].message);
    }

    return data.cartCreate.cart.checkoutUrl;
  } catch (error) {
    console.error('Error creating Shopify cart:', error);
    throw error;
  }
};
