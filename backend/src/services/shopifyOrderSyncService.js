import Order from '../models/Order.js';
import SyncRun from '../models/SyncRun.js';
import { config } from '../config/env.js';

const configured = () => Boolean(config.shopify.storeDomain && config.shopify.adminAccessToken && !config.shopify.storeDomain.includes('your-store-domain'));
const endpoint = () => `https://${config.shopify.storeDomain}/admin/api/${config.shopify.apiVersion}/graphql.json`;
const amount = value => Number(value?.shopMoney?.amount || 0);
const status = (order) => order.cancelledAt ? 'cancelled' : order.displayFulfillmentStatus === 'FULFILLED' ? 'delivered' : order.displayFulfillmentStatus === 'PARTIALLY_FULFILLED' ? 'shipped' : order.displayFulfillmentStatus === 'IN_PROGRESS' ? 'packed' : 'confirmed';
const paymentStatus = value => ({ PAID: 'paid', PARTIALLY_PAID: 'authorized', REFUNDED: 'refunded', VOIDED: 'failed', PENDING: 'authorized' }[value] || 'authorized');

const QUERY = `#graphql query Orders($first: Int!, $after: String) { orders(first: $first, after: $after, sortKey: UPDATED_AT) { nodes { id name email createdAt updatedAt cancelledAt displayFinancialStatus displayFulfillmentStatus currentTotalPriceSet { shopMoney { amount currencyCode } } subtotalPriceSet { shopMoney { amount } } totalShippingPriceSet { shopMoney { amount } } totalTaxSet { shopMoney { amount } } totalDiscountsSet { shopMoney { amount } } customer { id displayName email phone } shippingAddress { name address1 city province zip country } lineItems(first: 250) { nodes { title quantity sku originalUnitPriceSet { shopMoney { amount } } discountedTotalSet { shopMoney { amount } } variant { id product { id } } image { url } } } shippingLines(first: 20) { nodes { title code originalPriceSet { shopMoney { amount } } } } } pageInfo { hasNextPage endCursor } } }`;

const requestPage = async variables => {
  const response = await fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': config.shopify.adminAccessToken }, body: JSON.stringify({ query: QUERY, variables }) });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.map(item => item.message).join('; ') || `Shopify Orders API returned ${response.status}`);
  if (!payload.data?.orders) throw new Error('Shopify Orders API returned an invalid response.');
  return payload.data.orders;
};

export const normalizeShopifyOrder = order => {
  const items = order.lineItems?.nodes || [];
  const money = order.currentTotalPriceSet?.shopMoney;
  return {
    source: 'shopify', shopifyOrderId: order.id, orderNumber: order.name,
    guestEmail: order.email || order.customer?.email || null,
    customer: order.customer ? { shopifyCustomerId: order.customer.id, name: order.customer.displayName, email: order.customer.email, phone: order.customer.phone } : null,
    items: items.map(item => ({ name: item.title || 'Shopify item', image: item.image?.url || null, price: amount(item.originalUnitPriceSet), quantity: Math.max(1, Number(item.quantity || 1)), discountAmount: Math.max(0, amount(item.originalUnitPriceSet) * Number(item.quantity || 1) - amount(item.discountedTotalSet)), productId: null, shopifyProductId: item.variant?.product?.id || null, shopifyVariantId: item.variant?.id || null, sku: item.sku || null })),
    subtotal: amount(order.subtotalPriceSet), discountAmount: amount(order.totalDiscountsSet), shippingAmount: amount(order.totalShippingPriceSet), tax: amount(order.totalTaxSet), total: amount(order.currentTotalPriceSet), currency: money?.currencyCode || 'USD',
    shippingLines: (order.shippingLines?.nodes || []).map(line => ({ title: line.title, code: line.code, price: amount(line.originalPriceSet) })),
    shippingAddress: order.shippingAddress ? { name: order.shippingAddress.name, line1: order.shippingAddress.address1, city: order.shippingAddress.city, state: order.shippingAddress.province, zip: order.shippingAddress.zip, country: order.shippingAddress.country } : undefined,
    status: status(order), fulfillmentStatus: order.cancelledAt ? 'cancelled' : order.displayFulfillmentStatus === 'FULFILLED' ? 'fulfilled' : order.displayFulfillmentStatus === 'PARTIALLY_FULFILLED' ? 'partially_fulfilled' : 'unfulfilled', paymentStatus: paymentStatus(order.displayFinancialStatus), createdAt: order.createdAt, updatedAt: order.updatedAt,
  };
};

let running = false;
export const syncShopifyOrders = async () => {
  if (running) return { status: 'in_progress' };
  if (!configured()) throw new Error('Shopify Admin credentials are not configured.');
  if (Order.db?.readyState !== 1) throw new Error('MongoDB must be connected before Shopify order synchronization.');
  running = true;
  const run = await SyncRun.create({ source: 'shopify_orders', status: 'running', startedAt: new Date() });
  try {
    let after = null; let fetched = 0; let upserted = 0;
    do {
      const page = await requestPage({ first: 250, after });
      for (const node of page.nodes || []) {
        const normalized = normalizeShopifyOrder(node); fetched += 1;
        const result = await Order.updateOne({ shopifyOrderId: normalized.shopifyOrderId }, { $set: normalized }, { upsert: true, runValidators: true });
        if (result.upsertedCount || result.modifiedCount) upserted += 1;
      }
      after = page.pageInfo?.hasNextPage ? page.pageInfo.endCursor : null;
    } while (after);
    await SyncRun.updateOne({ _id: run._id }, { $set: { status: 'completed', completedAt: new Date(), fetched, upserted } });
    return { status: 'completed', fetched, upserted };
  } catch (error) {
    await SyncRun.updateOne({ _id: run._id }, { $set: { status: 'failed', completedAt: new Date(), error: error.message } });
    throw error;
  } finally { running = false; }
};

export const getShopifyOrderSyncStatus = () => SyncRun.findOne({ source: 'shopify_orders' }).sort({ createdAt: -1 }).lean();
