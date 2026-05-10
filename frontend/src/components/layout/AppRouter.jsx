import React, { useMemo } from 'react';
import { useRoute } from '../../hooks/useRoute';
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
  OrdersPage,
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

    const routes = {
      [ROUTES.HOME]: <HomePage />,
      [ROUTES.ABOUT]: <AboutPage />,
      [ROUTES.SERVICES]: <ServicesPage />,
      [ROUTES.PRODUCTS]: <ProductsPage />,
      [ROUTES.CATEGORIES]: <CategoriesPage />,
      [ROUTES.DASHBOARD]: <UserDashboardPage />,
      [ROUTES.ADMIN]: <AdminDashboardPage />,
      [ROUTES.ANALYTICS]: <AnalyticsPage />,
      [ROUTES.ORDERS]: <OrdersPage />,
      [ROUTES.WISHLIST]: <WishlistPage />,
      [ROUTES.CART]: <CartPage />,
      [ROUTES.CHECKOUT]: <CheckoutPage />,
      [ROUTES.PROFILE]: <ProfilePage />,
      [ROUTES.SETTINGS]: <SettingsPage />,
      [ROUTES.NOTIFICATIONS]: <NotificationsPage />,
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
      [ROUTES.RBAC]: <RBACPage />,
      '/sitemap': <SitemapPage />,
    };

    return routes[route] || <NotFoundPage />;
  }, [route]);

  return routeElement;
};

export default AppRouter;
