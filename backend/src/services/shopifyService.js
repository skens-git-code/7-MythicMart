import { GraphQLClient, gql } from 'graphql-request';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import Product from '../models/Product.js';
import { syncShopifyProducts, getShopifySyncStatus } from './shopifySyncService.js';

const storefrontConfigured = () => Boolean(config.shopify.storeDomain && config.shopify.storefrontAccessToken && !config.shopify.storeDomain.includes('your-store-domain'));
const localCatalogMode = () => !config.shopify.storeDomain || config.shopify.storeDomain.includes('your-store-domain');
const databaseReady = () => mongoose.connection.readyState === 1;
const client = () => {
  if (!storefrontConfigured()) throw new Error('Shopify Storefront credentials are not configured.');
  return new GraphQLClient(`https://${config.shopify.storeDomain}/api/${config.shopify.apiVersion}/graphql.json`, { headers: { 'X-Shopify-Storefront-Access-Token': config.shopify.storefrontAccessToken, 'Content-Type': 'application/json' } });
};

const normalizeDatabaseProduct = product => ({ ...product, id: product._id?.toString() || product.id, collection: product.collectionName, variantId: product.variantId || product.shopifyVariantIds?.[0] || product.id, image: product.image || product.images?.[0]?.url || null });

export const getProducts = async ({ limit = 20, page = 1, sortKey = 'CREATED_AT', reverse = true, query = '', category = '' } = {}) => {
  if (!databaseReady()) return { products: [], total: 0, page, limit, pages: 0, syncStatus: 'database_unavailable' };
  const { shopifySyncConfigured } = await import('./shopifySyncService.js');
  if (!localCatalogMode() && !shopifySyncConfigured()) return { products: [], total: 0, page, limit, pages: 0, syncStatus: 'shopify_not_configured' };
  const filter = localCatalogMode() ? { isActive: true } : { source: 'shopify', isActive: true };
  if (category && category !== 'all') filter.category = category.toLowerCase();
  if (query) filter.$text = { $search: query };
  const sort = sortKey === 'PRICE' ? { price: reverse ? -1 : 1 } : sortKey === 'BEST_SELLING' ? { rating: reverse ? -1 : 1, reviewCount: -1 } : localCatalogMode() ? { createdAt: reverse ? -1 : 1 } : { shopifyProductUpdatedAt: reverse ? -1 : 1 };
  const skip = Math.max(0, page - 1) * limit;
  const [rows, total, sync] = await Promise.all([Product.find(filter).sort(sort).skip(skip).limit(limit).lean(), Product.countDocuments(filter), getShopifySyncStatus()]);
  return { products: rows.map(normalizeDatabaseProduct), total, page, limit, pages: Math.ceil(total / limit), syncStatus: sync?.status || (localCatalogMode() ? 'local_catalog' : 'not_synced') };
};

export const getProductById = async idOrHandle => {
  if (!databaseReady()) return null;
  const { shopifySyncConfigured } = await import('./shopifySyncService.js');
  if (!localCatalogMode() && !shopifySyncConfigured()) return null;
  const filter = mongoose.isValidObjectId(idOrHandle) ? { _id: idOrHandle, isActive: true } : localCatalogMode() ? { slug: idOrHandle, isActive: true } : { $or: [{ shopifyProductId: idOrHandle }, { shopifyHandle: idOrHandle }, { slug: idOrHandle }], source: 'shopify', isActive: true };
  const product = await Product.findOne(filter).lean();
  return product ? normalizeDatabaseProduct(product) : null;
};

export { syncShopifyProducts, getShopifySyncStatus };

export const createCart = async items => {
  const CREATE_CART = gql`mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { checkoutUrl } userErrors { field message } } }`;
  const lines = [];
  for (const item of items) {
    const product = item.variantId ? { variantId: item.variantId } : await getProductById(item.productId);
    if (!product?.variantId) throw new Error(`Product ${item.productId} not found`);
    lines.push({ merchandiseId: product.variantId, quantity: item.quantity });
  }
  const data = await client().request(CREATE_CART, { input: { lines } });
  if (data.cartCreate.userErrors?.length) throw new Error(data.cartCreate.userErrors[0].message);
  return data.cartCreate.cart.checkoutUrl;
};
