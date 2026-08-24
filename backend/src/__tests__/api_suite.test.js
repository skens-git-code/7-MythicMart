import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'super-secret-jwt-key-for-test-32-chars-minimum';
const { default: app } = await import('../app.js');
const { default: User } = await import('../models/User.js');
const { default: Product } = await import('../models/Product.js');
const { default: Order } = await import('../models/Order.js');
const { default: Coupon } = await import('../models/Coupon.js');

const withServer = async (fn) => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
};

const ensureDb = async () => {
  if (mongoose.connection.readyState !== 1) {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mythicmart';
    await mongoose.connect(mongoUri);
  }
};

test('BACKEND MASTER QA TEST SUITE', async (t) => {
  await ensureDb();

  // Test 1: Root & Health
  await t.test('Root endpoint and Health check', async () => {
    await withServer(async (baseUrl) => {
      const rootRes = await fetch(`${baseUrl}/`);
      const rootBody = await rootRes.json();
      assert.equal(rootRes.status, 200);
      assert.equal(rootBody.name, 'MythicMart API');
      assert.ok(rootBody.requestId);

      const healthRes = await fetch(`${baseUrl}/api/health`);
      const healthBody = await healthRes.json();
      assert.equal(healthRes.status, 200);
      assert.equal(healthBody.success, true);
      assert.equal(healthBody.db, 'connected');
    });
  });

  // Test 2: Products Catalog (List, Search, Sort, Categories, Slug)
  await t.test('Products Catalog API & filters', async () => {
    await withServer(async (baseUrl) => {
      // List
      const res = await fetch(`${baseUrl}/api/products?page=1&limit=8`);
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length > 0);
      assert.ok(body.pagination);

      // Category filter
      const catRes = await fetch(`${baseUrl}/api/products?category=accessories`);
      const catBody = await catRes.json();
      assert.equal(catRes.status, 200);
      catBody.data.forEach(p => assert.equal(p.category, 'accessories'));

      // Sort price asc
      const ascRes = await fetch(`${baseUrl}/api/products?sort=price-asc`);
      const ascBody = await ascRes.json();
      assert.equal(ascRes.status, 200);
      for (let i = 1; i < ascBody.data.length; i++) {
        assert.ok(ascBody.data[i].price >= ascBody.data[i - 1].price);
      }

      // Sort price desc
      const descRes = await fetch(`${baseUrl}/api/products?sort=price-desc`);
      const descBody = await descRes.json();
      assert.equal(descRes.status, 200);
      for (let i = 1; i < descBody.data.length; i++) {
        assert.ok(descBody.data[i].price <= descBody.data[i - 1].price);
      }

      // Single product by slug
      const slugRes = await fetch(`${baseUrl}/api/products/obsidian-chronograph`);
      const slugBody = await slugRes.json();
      assert.equal(slugRes.status, 200);
      assert.equal(slugBody.data.slug, 'obsidian-chronograph');

      // Recommendations & Trending
      const recRes = await fetch(`${baseUrl}/api/products/recommendations?limit=4`);
      const recBody = await recRes.json();
      assert.equal(recRes.status, 200);
      assert.ok(recBody.data.length <= 4);

      const trendRes = await fetch(`${baseUrl}/api/products/trending?limit=4`);
      const trendBody = await trendRes.json();
      assert.equal(trendRes.status, 200);
      assert.ok(trendBody.data.length <= 4);
    });
  });

  // Test 3: Authentication & User Lifecycle
  const testUserEmail = `qa_tester_${Date.now()}@mythicmart.com`;
  let userToken = '';
  let userId = '';

  await t.test('Auth: Register, Login, Duplicate Check, Me', async () => {
    await withServer(async (baseUrl) => {
      // 1. Invalid registration (weak password)
      const weakRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Tester', email: testUserEmail, password: '123' }),
      });
      assert.equal(weakRes.status, 422);

      // 2. Valid registration
      const regRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'QA Tester', email: testUserEmail, password: 'Password123' }),
      });
      const regBody = await regRes.json();
      assert.equal(regRes.status, 201);
      assert.equal(regBody.success, true);
      assert.ok(regBody.data.token);
      assert.equal(regBody.data.user.email, testUserEmail);
      userToken = regBody.data.token;
      userId = regBody.data.user.id;

      // 3. Duplicate registration rejection (409)
      const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'QA Tester', email: testUserEmail, password: 'Password123' }),
      });
      assert.equal(dupRes.status, 409);

      // 4. Invalid Login (wrong password)
      const failLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUserEmail, password: 'WrongPassword123' }),
      });
      assert.equal(failLogin.status, 401);

      // 5. Valid Login
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUserEmail, password: 'Password123' }),
      });
      const loginBody = await loginRes.json();
      assert.equal(loginRes.status, 200);
      assert.ok(loginBody.data.token);

      // 6. GET /api/auth/me (authenticated)
      const meRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const meBody = await meRes.json();
      assert.equal(meRes.status, 200);
      assert.equal(meBody.data.email, testUserEmail);

      // 7. GET /api/auth/me (unauthenticated -> 401)
      const unauthMe = await fetch(`${baseUrl}/api/auth/me`);
      assert.equal(unauthMe.status, 401);
    });
  });

  // Test 4: Coupons
  await t.test('Coupons: Validation & Rules', async () => {
    await withServer(async (baseUrl) => {
      // Valid coupon MYTHIC10
      const validRes = await fetch(`${baseUrl}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'MYTHIC10', subtotal: 100 }),
      });
      const validBody = await validRes.json();
      assert.equal(validRes.status, 200);
      assert.equal(validBody.data.discount, 10);

      // Invalid coupon
      const invalidRes = await fetch(`${baseUrl}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'NONEXISTENT', subtotal: 100 }),
      });
      assert.equal(invalidRes.status, 404);
    });
  });

  // Test 5: Orders (Guest & Authenticated)
  let testOrderId = '';
  await t.test('Orders: Create, Calculate, History', async () => {
    await withServer(async (baseUrl) => {
      const product = await Product.findOne({ slug: 'obsidian-chronograph' });
      assert.ok(product);

      // Authenticated order with coupon
      const orderPayload = {
        couponCode: 'MYTHIC10',
        shippingAddress: {
          name: 'QA Tester',
          line1: '123 Luxe Way',
          city: 'San Francisco',
          state: 'CA',
          zip: '94107',
        },
        items: [
          {
            productId: product._id.toString(),
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
          },
        ],
      };

      const orderRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(orderPayload),
      });
      const orderBody = await orderRes.json();
      assert.equal(orderRes.status, 201);
      assert.equal(orderBody.success, true);
      assert.equal(orderBody.data.items.length, 1);
      testOrderId = orderBody.data._id || orderBody.data.id;

      // Check User Orders History
      const myOrdersRes = await fetch(`${baseUrl}/api/orders/my`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const myOrdersBody = await myOrdersRes.json();
      assert.equal(myOrdersRes.status, 200);
      assert.ok(myOrdersBody.data.length >= 1);

      // Guest order
      const guestOrderPayload = {
        guestEmail: 'guest_buyer@mythicmart.com',
        shippingAddress: {
          name: 'Guest Buyer',
          line1: '456 Market St',
          city: 'Austin',
          state: 'TX',
          zip: '78701',
        },
        items: [
          {
            productId: product._id.toString(),
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
          },
        ],
      };
      const guestRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestOrderPayload),
      });
      const guestBody = await guestRes.json();
      assert.equal(guestRes.status, 201);
      assert.equal(guestBody.data.guestEmail, 'guest_buyer@mythicmart.com');
    });
  });

  // Test 6: Reviews
  await t.test('Reviews: List & Create', async () => {
    await withServer(async (baseUrl) => {
      const product = await Product.findOne({ slug: 'obsidian-chronograph' });
      assert.ok(product);

      // Create review
      const revRes = await fetch(`${baseUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          productId: product._id.toString(),
          rating: 5,
          title: 'Exceptional craftsmanship',
          comment: 'The sapphire crystal and mechanical precision are flawless.',
        }),
      });
      const revBody = await revRes.json();
      assert.equal(revRes.status, 201);
      assert.equal(revBody.data.status, 'approved');

      // Get reviews
      const listRes = await fetch(`${baseUrl}/api/reviews?productId=${product._id.toString()}`);
      const listBody = await listRes.json();
      assert.equal(listRes.status, 200);
      assert.ok(listBody.data.length >= 1);
    });
  });

  // Test 7: Support & Contact Tickets
  await t.test('Support Tickets: Create and Retrieve', async () => {
    await withServer(async (baseUrl) => {
      const ticketRes = await fetch(`${baseUrl}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          email: testUserEmail,
          subject: 'Inquiry about express delivery options',
          message: 'Can I choose overnight shipping for weekend delivery?',
          type: 'order',
          priority: 'normal',
        }),
      });
      const ticketBody = await ticketRes.json();
      assert.equal(ticketRes.status, 201);
      assert.equal(ticketBody.data.email, testUserEmail);

      const myTicketsRes = await fetch(`${baseUrl}/api/support/my`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const myTicketsBody = await myTicketsRes.json();
      assert.equal(myTicketsRes.status, 200);
      assert.ok(myTicketsBody.data.length >= 1);
    });
  });

  // Test 8: Wishlist & User Profile
  await t.test('User Profile & Wishlist API', async () => {
    await withServer(async (baseUrl) => {
      const product = await Product.findOne({ slug: 'obsidian-chronograph' });
      assert.ok(product);

      // Add to wishlist
      const addWishRes = await fetch(`${baseUrl}/api/users/wishlist/${product._id.toString()}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const addWishBody = await addWishRes.json();
      assert.equal(addWishRes.status, 200);
      assert.ok(addWishBody.data.some(p => (p._id?.toString() || p.id?.toString() || String(p)) === product._id.toString()));

      // Profile details
      const profRes = await fetch(`${baseUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const profBody = await profRes.json();
      assert.equal(profRes.status, 200);
      assert.equal(profBody.data.email, testUserEmail);
      assert.ok(profBody.data.wishlist.length >= 1);

      // Remove from wishlist
      const delWishRes = await fetch(`${baseUrl}/api/users/wishlist/${product._id.toString()}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assert.equal(delWishRes.status, 200);
    });
  });

  // Test 9: Authorization & RBAC Checks
  await t.test('Authorization: Non-admin vs Admin RBAC', async () => {
    await withServer(async (baseUrl) => {
      // Regular user trying to access admin routes -> 403 Forbidden
      const unauthAdminOrders = await fetch(`${baseUrl}/api/orders/admin`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assert.equal(unauthAdminOrders.status, 403);

      const unauthAnalytics = await fetch(`${baseUrl}/api/analytics/summary`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assert.equal(unauthAnalytics.status, 403);

      const unauthAdminUsers = await fetch(`${baseUrl}/api/users/admin`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assert.equal(unauthAdminUsers.status, 403);

      // Promote test user to admin for admin verification
      await User.findByIdAndUpdate(userId, { role: 'admin' });

      // Re-fetch with admin role
      const adminOrdersRes = await fetch(`${baseUrl}/api/orders/admin`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assert.equal(adminOrdersRes.status, 200);

      const adminAnalyticsRes = await fetch(`${baseUrl}/api/analytics/summary`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const analyticsBody = await adminAnalyticsRes.json();
      assert.equal(adminAnalyticsRes.status, 200);
      assert.ok(analyticsBody.data.revenue >= 0);
      assert.ok(analyticsBody.data.orders >= 1);
    });
  });

  // Test 10: Security & 404 Handling
  await t.test('Security & Error Handling', async () => {
    await withServer(async (baseUrl) => {
      // 404 Route
      const notFoundRes = await fetch(`${baseUrl}/api/non-existent-route-xyz`);
      assert.equal(notFoundRes.status, 404);

      // Malformed JSON (handled with 400 Bad Request)
      const malformedRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"invalid_json": ',
      });
      assert.equal(malformedRes.status, 400);
    });
  });
});

test.after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
