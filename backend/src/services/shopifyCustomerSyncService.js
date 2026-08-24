import Customer from '../models/Customer.js';
import User from '../models/User.js';
import SyncRun from '../models/SyncRun.js';
import { config } from '../config/env.js';

const configured = () => Boolean(config.shopify.storeDomain && config.shopify.adminAccessToken && !config.shopify.storeDomain.includes('your-store-domain'));
const endpoint = () => `https://${config.shopify.storeDomain}/admin/api/${config.shopify.apiVersion}/graphql.json`;
const QUERY = `#graphql query Customers($first: Int!, $after: String) { customers(first: $first, after: $after, sortKey: UPDATED_AT) { nodes { id displayName firstName lastName email phone numberOfOrders amountSpent { amount currencyCode } defaultAddress { name address1 address2 city province zip country } createdAt updatedAt } pageInfo { hasNextPage endCursor } } }`;
const requestPage = async variables => {
  const response = await fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': config.shopify.adminAccessToken }, body: JSON.stringify({ query: QUERY, variables }) });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.map(item => item.message).join('; ') || `Shopify Customers API returned ${response.status}`);
  if (!payload.data?.customers) throw new Error('Shopify Customers API returned an invalid response.');
  return payload.data.customers;
};
export const normalizeShopifyCustomer = customer => ({ source: 'shopify', shopifyCustomerId: customer.id, name: customer.displayName || [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Shopify customer', email: customer.email, phone: customer.phone || null, addresses: customer.defaultAddress ? [{ name: customer.defaultAddress.name, line1: customer.defaultAddress.address1, line2: customer.defaultAddress.address2, city: customer.defaultAddress.city, state: customer.defaultAddress.province, zip: customer.defaultAddress.zip, country: customer.defaultAddress.country }] : [], status: 'active', orderCount: Number(customer.numberOfOrders || 0), totalSpent: Number(customer.amountSpent?.amount || 0), currency: customer.amountSpent?.currencyCode || 'USD', lastActivityAt: customer.updatedAt, createdAt: customer.createdAt });
let running = false;
export const syncShopifyCustomers = async () => {
  if (running) return { status: 'in_progress' };
  if (!configured()) throw new Error('Shopify Admin credentials are not configured.');
  if (Customer.db?.readyState !== 1) throw new Error('MongoDB must be connected before Shopify customer synchronization.');
  running = true; const run = await SyncRun.create({ source: 'shopify_customers', status: 'running', startedAt: new Date() });
  try {
    let after = null; let fetched = 0; let upserted = 0;
    do {
      const page = await requestPage({ first: 250, after });
      for (const node of page.nodes || []) {
        const normalized = normalizeShopifyCustomer(node); fetched += 1;
        const existing = await Customer.findOne({ $or: [{ shopifyCustomerId: normalized.shopifyCustomerId }, { email: normalized.email }] }).select('_id').lean();
        const result = existing ? await Customer.updateOne({ _id: existing._id }, { $set: normalized }, { runValidators: true }) : await Customer.create(normalized);
        if (result?.upsertedCount || result?.modifiedCount || result?._id) upserted += 1;
      }
      after = page.pageInfo?.hasNextPage ? page.pageInfo.endCursor : null;
    } while (after);
    await SyncRun.updateOne({ _id: run._id }, { $set: { status: 'completed', completedAt: new Date(), fetched, upserted } });
    return { status: 'completed', fetched, upserted };
  } catch (error) { await SyncRun.updateOne({ _id: run._id }, { $set: { status: 'failed', completedAt: new Date(), error: error.message } }); throw error; } finally { running = false; }
};
export const getShopifyCustomerSyncStatus = () => SyncRun.findOne({ source: 'shopify_customers' }).sort({ createdAt: -1 }).lean();

export const syncLocalCustomers = async () => {
  const users = await User.find({}).select('name email phone isActive createdAt lastLoginAt').lean();
  if (!users.length) return 0;
  const operations = users.map(user => ({ updateOne: { filter: { email: user.email }, update: { $set: { user: user._id, source: 'local', name: user.name, email: user.email, phone: user.phone || null, status: user.isActive ? 'active' : 'disabled', lastActivityAt: user.lastLoginAt || user.createdAt }, $setOnInsert: { createdAt: user.createdAt } }, upsert: true } }));
  await Customer.bulkWrite(operations, { ordered: false });
  return users.length;
};
