import React, { useMemo } from 'react';
import { useRoute } from '../../hooks/useRoute';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from '../../utils/routes';
import {
  AboutPage,
  AdminDashboardPage,
  AnalyticsPage,
  BlogPage,
  CareersPage,
  CartPage,
  CategoriesPage,
  CheckoutPage,
  ContactPage,
  FAQPage,
  ForgotPasswordPage,
  HelpCenterPage,
  HomePage,
  LegalPage,
  LoginPage,
  NotFoundPage,
  NotificationsPage,
  IntegrationsPage,
  InventoryPage,
  CustomersPage,
  CustomerDetailsPage,
  CouponsPage,
  ActivityPage,
  OrdersPage,
  OrderDetailsPage,
  OTPVerificationPage,
  ProductDetailsPage,
  ProductsPage,
  ProfilePage,
  RBACPage,
  ReviewsPage,
  ServicesPage,
  SettingsPage,
  SignupPage,
  SitemapPage,
  SupportSystemPage,
  TestimonialsPage,
  UserDashboardPage,
  WishlistPage,
} from '../../pages/PremiumPages';

const AppRouter = () => {
  const route = useRoute();

  const routeElement = useMemo(() => {
    if (route.startsWith('/products/') && route !== ROUTES.PRODUCTS) {
      return <ProductDetailsPage slug={route.split('/').at(-1)} />;
    }
    if (route.startsWith('/orders/') && route !== ROUTES.ORDERS) {
      return <ProtectedRoute><OrderDetailsPage id={route.split('/').at(-1)} /></ProtectedRoute>;
    }
    if (route.startsWith('/customers/') && route !== ROUTES.CUSTOMERS) {
      return <ProtectedRoute roles={['admin', 'manager']}><CustomerDetailsPage id={route.split('/').at(-1)} /></ProtectedRoute>;
    }

    const routes = {
      [ROUTES.HOME]: <HomePage />,
      [ROUTES.ABOUT]: <AboutPage />,
      [ROUTES.SERVICES]: <ServicesPage />,
      [ROUTES.PRODUCTS]: <ProductsPage />,
      [ROUTES.CATEGORIES]: <CategoriesPage />,
      [ROUTES.DASHBOARD]: <ProtectedRoute><UserDashboardPage /></ProtectedRoute>,
      [ROUTES.ADMIN]: <ProtectedRoute roles={['admin', 'manager']}><AdminDashboardPage /></ProtectedRoute>,
      [ROUTES.ANALYTICS]: <ProtectedRoute roles={['admin']}><AnalyticsPage /></ProtectedRoute>,
      [ROUTES.INTEGRATIONS]: <ProtectedRoute roles={['admin', 'manager']}><IntegrationsPage /></ProtectedRoute>,
      [ROUTES.INVENTORY]: <ProtectedRoute roles={['admin', 'manager']}><InventoryPage /></ProtectedRoute>,
      [ROUTES.CUSTOMERS]: <ProtectedRoute roles={['admin', 'manager']}><CustomersPage /></ProtectedRoute>,
      [ROUTES.COUPONS]: <CouponsPage />,
      [ROUTES.ACTIVITY]: <ProtectedRoute roles={['admin', 'manager']}><ActivityPage /></ProtectedRoute>,
      [ROUTES.ORDERS]: <ProtectedRoute><OrdersPage /></ProtectedRoute>,
      [ROUTES.WISHLIST]: <ProtectedRoute><WishlistPage /></ProtectedRoute>,
      [ROUTES.CART]: <CartPage />,
      [ROUTES.CHECKOUT]: <ProtectedRoute><CheckoutPage /></ProtectedRoute>,
      [ROUTES.PROFILE]: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      [ROUTES.SETTINGS]: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
      [ROUTES.NOTIFICATIONS]: <ProtectedRoute><NotificationsPage /></ProtectedRoute>,
      [ROUTES.CONTACT]: <ContactPage />,
      [ROUTES.FAQ]: <FAQPage />,
      [ROUTES.BLOG]: <BlogPage />,
      [ROUTES.CAREERS]: <CareersPage />,
      [ROUTES.REVIEWS]: <ReviewsPage />,
      [ROUTES.TESTIMONIALS]: <TestimonialsPage />,
      [ROUTES.PRIVACY]: <LegalPage type="privacy" />,
      [ROUTES.TERMS]: <LegalPage type="terms" />,
      [ROUTES.HELP]: <HelpCenterPage />,
      [ROUTES.SUPPORT]: <SupportSystemPage />,
      [ROUTES.LOGIN]: <LoginPage />,
      [ROUTES.SIGNUP]: <SignupPage />,
      [ROUTES.FORGOT_PASSWORD]: <ForgotPasswordPage />,
      [ROUTES.OTP]: <OTPVerificationPage />,
      [ROUTES.RBAC]: <ProtectedRoute roles={['admin']}><RBACPage /></ProtectedRoute>,
      '/sitemap': <SitemapPage />,
    };

    return routes[route] || <NotFoundPage />;
  }, [route]);

  return routeElement;
};

export default AppRouter;
