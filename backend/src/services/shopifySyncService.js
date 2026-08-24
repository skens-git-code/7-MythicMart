import Product from '../models/Product.js';
import SyncRun from '../models/SyncRun.js';
import { config } from '../config/env.js';

const adminEndpoint = () => `https://${config.shopify.storeDomain}/admin/api/${config.shopify.apiVersion}/graphql.json`;
const isConfigured = () => Boolean(config.shopify.storeDomain && config.shopify.adminAccessToken && !config.shopify.storeDomain.includes('your-store-domain'));
const money = value => value == null || value === '' ? null : Number(value);
const cleanText = value => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const categoryFor = node => {
  const value = `${node.productType || ''} ${node.tags?.join(' ') || ''}`.toLowerCase();
  return ['accessories', 'bags', 'electronics', 'clothing', 'footwear'].find(item => value.includes(item)) || 'other';
};

const ADMIN_PRODUCTS_QUERY = `#graphql query Products($first: Int!, $after: String) { products(first: $first, after: $after, sortKey: UPDATED_AT) { nodes { id handle title descriptionHtml vendor productType status tags createdAt updatedAt totalInventory options { name values } featuredImage { url altText } images(first: 250) { nodes { url altText } } collections(first: 50) { nodes { title } } variants(first: 250) { nodes { id title sku price compareAtPrice inventoryQuantity availableForSale selectedOptions { name value } image { url } } } } pageInfo { hasNextPage endCursor } } }`;

export const normalizeShopifyAdminProduct = node => {
  const variants = node.variants?.nodes || [];
  const images = node.images?.nodes?.length ? node.images.nodes : (node.featuredImage ? [node.featuredImage] : []);
  const first = variants[0] || {};
  const inventory = variants.reduce((sum, item) => sum + Math.max(0, Number(item.inventoryQuantity || 0)), 0);
  return {
    source: 'shopify', shopifyProductId: node.id, shopifyHandle: node.handle,
    name: String(node.title || 'Untitled product').slice(0, 100), slug: node.handle,
    description: (cleanText(node.descriptionHtml) || node.title || 'Shopify product').slice(0, 500),
    brand: node.vendor || 'MythicMart', productType: node.productType || '', shopifyStatus: node.status, shopifyTags: [...new Set(node.tags || [])],
    category: categoryFor(node), collectionName: node.collections?.nodes?.[0]?.title || '',
    price: money(first.price) ?? 0, originalPrice: money(first.compareAtPrice), image: images[0]?.url || null, images,
    variants: variants.map(item => ({ shopifyVariantId: item.id, title: item.title, sku: item.sku || undefined, price: money(item.price) ?? 0, compareAtPrice: money(item.compareAtPrice), inventoryQuantity: Math.max(0, Number(item.inventoryQuantity || 0)), availableForSale: Boolean(item.availableForSale), selectedOptions: item.selectedOptions || [], image: item.image?.url || undefined })),
    shopifyVariantIds: [...new Set(variants.map(item => item.id).filter(Boolean))], options: node.options || [], variantId: first.id || node.id,
    stock: Math.max(0, Number(node.totalInventory ?? inventory)), isActive: node.status === 'ACTIVE', freeShipping: false,
    shopifyProductCreatedAt: node.createdAt, shopifyProductUpdatedAt: node.updatedAt,
  };
};

const requestPage = async variables => {
  const response = await fetch(adminEndpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': config.shopify.adminAccessToken }, body: JSON.stringify({ query: ADMIN_PRODUCTS_QUERY, variables }) });
  if (!response.ok) throw new Error(`Shopify Admin API returned ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors.map(error => error.message).join('; '));
  if (!payload.data?.products) throw new Error('Shopify Admin API returned an invalid products response.');
  return payload.data.products;
};

export const verifyShopifyConnection = async () => {
  if (!isConfigured()) return { configured: false, connection: 'not_configured', store: null };
  const response = await fetch(adminEndpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': config.shopify.adminAccessToken }, body: JSON.stringify({ query: '{ shop { name primaryDomain { host } currencyCode } }' }) });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.map(error => error.message).join('; ') || `Shopify Admin API returned ${response.status}`);
  return { configured: true, connection: 'connected', store: payload.data.shop };
};

let isSyncInProgress = false;
export const syncShopifyProducts = async () => {
  if (isSyncInProgress) return { status: 'in_progress', message: 'Synchronization is already running', run: await getShopifySyncStatus() };
  if (!Product.db?.readyState || Product.db.readyState !== 1) throw new Error('MongoDB must be connected before Shopify synchronization.');
  isSyncInProgress = true;
  const run = await SyncRun.create({ source: 'shopify', status: 'running', startedAt: new Date() });
  try {
    if (!isConfigured()) throw new Error('Shopify Admin credentials are not configured. Add SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN before syncing.');
    const ids = [];
    let after = null; let fetched = 0; let upserted = 0;
    do {
      const page = await requestPage({ first: 250, after });
      for (const node of page.nodes || []) {
        const normalized = normalizeShopifyAdminProduct(node);
        ids.push(normalized.shopifyProductId); fetched += 1;
        const result = await Product.updateOne({ shopifyProductId: normalized.shopifyProductId }, { $set: normalized }, { upsert: true, runValidators: true });
        if (result.upsertedCount || result.modifiedCount) upserted += 1;
      }
      after = page.pageInfo?.hasNextPage ? page.pageInfo.endCursor : null;
    } while (after);
    const stale = await Product.updateMany({ source: 'shopify', shopifyProductId: { $nin: ids } }, { $set: { isActive: false, shopifyStatus: 'ARCHIVED' } });
    await SyncRun.updateOne({ _id: run._id }, { $set: { status: 'completed', completedAt: new Date(), fetched, upserted, deactivated: stale.modifiedCount } });
    return { status: 'completed', fetched, upserted, deactivated: stale.modifiedCount, source: 'shopify_admin' };
  } catch (error) {
    await SyncRun.updateOne({ _id: run._id }, { $set: { status: 'failed', completedAt: new Date(), error: error.message } });
    throw error;
  } finally { isSyncInProgress = false; }
};

export const getShopifySyncStatus = async () => SyncRun.findOne({ source: 'shopify' }).sort({ createdAt: -1 }).lean();
export const shopifySyncConfigured = isConfigured;
