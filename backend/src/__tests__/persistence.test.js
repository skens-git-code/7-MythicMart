import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'super-secret-jwt-key-for-test-32-chars-minimum';
const { default: app } = await import('../app.js');
const { default: Product } = await import('../models/Product.js');

after(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

const ensureDb = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mythicmart');
  }
};

const withServer = async (fn) => {
  const server = app.listen(0);
  try {
    return await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
};

test('PERSISTENCE FLOWS: profile, settings, newsletter, notifications', async () => {
  await ensureDb();
  await withServer(async (baseUrl) => {
    const email = `persistence.${Date.now()}@mythicmart.test`;
    const register = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Persistence Tester', email, password: 'Password123' }),
    });
    const registerBody = await register.json();
    assert.equal(register.status, 201);
    const token = registerBody.data.token;
    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const profileUpdate = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Updated Tester', preferences: { orderUpdates: false, priceDrops: false } }),
    });
    const profileBody = await profileUpdate.json();
    assert.equal(profileUpdate.status, 200);
    assert.equal(profileBody.data.name, 'Updated Tester');
    assert.equal(profileBody.data.preferences.notifications.orderUpdates, false);
    assert.equal(profileBody.data.preferences.notifications.priceDrops, false);

    const newsletter = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    assert.equal(newsletter.status, 200);
    const duplicateNewsletter = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    assert.equal(duplicateNewsletter.status, 200);

    const product = await Product.findOne({ isActive: true, stock: { $gt: 0 } });
    const order = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        shippingAddress: { name: 'Updated Tester', line1: '1 Test Way', city: 'Austin', state: 'TX', zip: '78701' },
        items: [{ productId: product._id.toString(), price: 0, quantity: 1 }],
      }),
    });
    assert.equal(order.status, 201);

    const notifications = await fetch(`${baseUrl}/api/notifications/my`, { headers: { Authorization: `Bearer ${token}` } });
    const notificationsBody = await notifications.json();
    assert.equal(notifications.status, 200);
    assert.ok(notificationsBody.data.some(item => item.type === 'order'));
  });
});

test('PERSISTENCE VALIDATION rejects reviews for missing products', async () => {
  await ensureDb();
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: new mongoose.Types.ObjectId().toString(), rating: 5, comment: 'This product does not exist.' }),
    });
    assert.equal(response.status, 404);
  });
});
