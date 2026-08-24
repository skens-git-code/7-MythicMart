import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'super-secret-jwt-key-for-test-32-chars-minimum';

const { default: app } = await import('../app.js');
const { default: Product } = await import('../models/Product.js');
const { default: User } = await import('../models/User.js');
const { default: Coupon } = await import('../models/Coupon.js');

before(async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mythicmart');
  }
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

const withServer = async (fn) => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
};

test('E2E PRODUCTION AUDIT: Complete User & Admin Lifecycle', async () => {
  await withServer(async (baseUrl) => {
    // 1. Health Probe
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const health = await healthRes.json();
    assert.equal(health.success, true);
    assert.equal(health.db, 'connected');

    // 2. User Registration
    const testEmail = `e2e.user.${Date.now()}@mythicmart.io`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E Auditor', email: testEmail, password: 'StrongPassword123' }),
    });
    assert.equal(regRes.status, 201);
    const regData = await regRes.json();
    const token = regData.data.token;
    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 3. User Login & /me verification
    const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers: authHeaders });
    assert.equal(meRes.status, 200);
    const me = await meRes.json();
    assert.equal(me.data.email, testEmail);

    // 4. Products Catalog & Category Filter
    const productsRes = await fetch(`${baseUrl}/api/products?limit=10&sort=newest`);
    assert.equal(productsRes.status, 200);
    const catalog = await productsRes.json();
    assert.ok(catalog.data.length > 0);
    let sampleProduct = catalog.data.find(p => (p.stock || 0) > 0) || catalog.data[0];
    if (sampleProduct._id) {
      await Product.findByIdAndUpdate(sampleProduct._id, { $set: { stock: 50, reservedStock: 0 } });
    }

    // 5. Coupon Validation
    const couponRes = await fetch(`${baseUrl}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'MYTHIC10', subtotal: 200 }),
    });
    assert.equal(couponRes.status, 200);
    const couponData = await couponRes.json();
    assert.equal(couponData.data.discount, 20);

    // 6. Review Creation for product
    const reviewRes = await fetch(`${baseUrl}/api/reviews`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: sampleProduct.id || sampleProduct._id,
        rating: 5,
        title: 'Outstanding quality and build',
        comment: 'Verified purchase. The finish, materials, and delivery exceeded all expectations.',
      }),
    });
    assert.equal(reviewRes.status, 201);

    // 7. Order Placement
    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        items: [{ productId: sampleProduct.id || sampleProduct._id, quantity: 1, price: sampleProduct.price }],
        couponCode: 'MYTHIC10',
        shippingAddress: { name: 'E2E Auditor', line1: '456 Silicon Blvd', city: 'San Jose', state: 'CA', zip: '95113' },
      }),
    });
    assert.equal(orderRes.status, 201);
    const orderData = await orderRes.json();
    assert.ok(orderData.data.id || orderData.data._id || orderData.data.checkoutUrl);

    // 8. User Order History
    const myOrdersRes = await fetch(`${baseUrl}/api/orders/my`, { headers: authHeaders });
    assert.equal(myOrdersRes.status, 200);
    const myOrders = await myOrdersRes.json();
    assert.ok(Array.isArray(myOrders.data));

    // 9. Admin RBAC Verification (non-admin forbidden)
    const adminCheckRes = await fetch(`${baseUrl}/api/analytics/summary`, { headers: authHeaders });
    assert.equal(adminCheckRes.status, 403);

    // 10. Elevate to Admin and verify Admin Sync & Analytics
    await User.findByIdAndUpdate(me.data.id, { role: 'admin' });
    const adminAnalyticsRes = await fetch(`${baseUrl}/api/analytics/summary`, { headers: authHeaders });
    assert.equal(adminAnalyticsRes.status, 200);
    const analytics = await adminAnalyticsRes.json();
    assert.ok(analytics.data.products >= 0);

    const syncStatusRes = await fetch(`${baseUrl}/api/products/sync/status`, { headers: authHeaders });
    assert.equal(syncStatusRes.status, 200);
  });
});
