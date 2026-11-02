import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Public Components & Pages
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HelpProvider } from './context/HelpContext';

// Load route pages on demand so storefront visitors do not download the admin tools.
const lazyNamed = <T extends React.ComponentType<any>>(
  loader: () => Promise<Record<string, T>>,
  exportName: string,
) => React.lazy(async () => ({ default: (await loader())[exportName] }));

const HomePage = lazyNamed(() => import('./pages/HomePage'), 'HomePage');
const ShopPage = lazyNamed(() => import('./pages/ShopPage'), 'ShopPage');
const BrandPage = lazyNamed(() => import('./pages/BrandPage'), 'BrandPage');
const CategoryPage = lazyNamed(() => import('./pages/CategoryPage'), 'CategoryPage');
const ProductDetailPage = lazyNamed(() => import('./pages/ProductDetailPage'), 'ProductDetailPage');
const SchemesPage = lazyNamed(() => import('./pages/SchemesPage'), 'SchemesPage');
const CartPage = lazyNamed(() => import('./pages/CartPage'), 'CartPage');
const CheckoutPage = lazyNamed(() => import('./pages/CheckoutPage'), 'CheckoutPage');
const WishlistPage = lazyNamed(() => import('./pages/WishlistPage'), 'WishlistPage');
const AboutPage = lazyNamed(() => import('./pages/AboutPage'), 'AboutPage');
const ContactPage = lazyNamed(() => import('./pages/ContactPage'), 'ContactPage');
const PoliciesPage = lazyNamed(() => import('./pages/PoliciesPage'), 'PoliciesPage');
const AdminLayout = lazyNamed(() => import('./pages/admin/AdminLayout'), 'AdminLayout');
const AdminLoginPage = lazyNamed(() => import('./pages/admin/AdminLoginPage'), 'AdminLoginPage');
const AdminOverviewPage = lazyNamed(() => import('./pages/admin/AdminOverviewPage'), 'AdminOverviewPage');
const AdminProductsPage = lazyNamed(() => import('./pages/admin/AdminProductsPage'), 'AdminProductsPage');
const AdminCatalogueStudioPage = lazyNamed(() => import('./pages/admin/AdminCatalogueStudioPage'), 'AdminCatalogueStudioPage');
const AdminContentPage = lazyNamed(() => import('./pages/admin/AdminContentPage'), 'AdminContentPage');
const AdminAttributesPage = lazyNamed(() => import('./pages/admin/AdminAttributesPage'), 'AdminAttributesPage');
const AdminBrandsPage = lazyNamed(() => import('./pages/admin/AdminBrandsPage'), 'AdminBrandsPage');
const AdminCategoriesPage = lazyNamed(() => import('./pages/admin/AdminCategoriesPage'), 'AdminCategoriesPage');
const AdminImportPage = lazyNamed(() => import('./pages/admin/AdminImportPage'), 'AdminImportPage');
const AdminEnquiriesPage = lazyNamed(() => import('./pages/admin/AdminEnquiriesPage'), 'AdminEnquiriesPage');
const AdminOrdersPage = lazyNamed(() => import('./pages/admin/AdminOrdersPage'), 'AdminOrdersPage');
const AdminBannersPage = lazyNamed(() => import('./pages/admin/AdminBannersPage'), 'AdminBannersPage');
const AdminBulkCataloguesPage = lazyNamed(() => import('./admin/pages/AdminBulkCataloguesPage'), 'AdminBulkCataloguesPage');
const AdminFeedbackPage = lazyNamed(() => import('./admin/pages/AdminFeedbackPage'), 'AdminFeedbackPage');
const AdminSchemesPage = lazyNamed(() => import('./pages/admin/AdminSchemesPage'), 'AdminSchemesPage');
const AdminSettingsPage = lazyNamed(() => import('./pages/admin/AdminSettingsPage'), 'AdminSettingsPage');

import { ErrorBoundary } from './components/common/ErrorBoundary';

// Protected Admin Route Guard
const ProtectedAdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <SettingsProvider>
          <AuthProvider>
            <HelpProvider>
              <CartProvider>
                <WishlistProvider>
                  <React.Suspense fallback={<div className="p-8 text-center text-slate-500" role="status">Loading page…</div>}>
                  <Routes>
                    {/* Admin Auth Route */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />

                    {/* Protected Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedAdminRoute>
                          <AdminLayout />
                        </ProtectedAdminRoute>
                      }
                    >
                      <Route index element={<AdminOverviewPage />} />
                      <Route path="catalogue-studio" element={<AdminCatalogueStudioPage />} />
                      <Route path="content" element={<AdminContentPage />} />
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="attributes" element={<AdminAttributesPage />} />
                      <Route path="brands" element={<AdminBrandsPage />} />
                      <Route path="categories" element={<AdminCategoriesPage />} />
                      <Route path="bulk-catalogues" element={<AdminBulkCataloguesPage />} />
                      <Route path="feedback" element={<AdminFeedbackPage />} />
                      <Route path="import" element={<AdminBulkCataloguesPage />} />
                      <Route path="enquiries" element={<AdminEnquiriesPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="banners" element={<AdminBannersPage />} />
                      <Route path="schemes" element={<AdminSchemesPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                    </Route>

                    {/* Public Storefront Routes with Navbar & Footer */}
                    <Route
                      path="*"
                      element={
                        <div className="flex flex-col min-h-screen">
                          <Navbar />
                          <main className="flex-1">
                            <Routes>
                              <Route path="/" element={<HomePage />} />
                              <Route path="/shop" element={<ShopPage />} />
                              <Route path="/search" element={<ShopPage />} />
                              <Route path="/brand/:slug" element={<BrandPage />} />
                              <Route path="/category/:slug" element={<CategoryPage />} />
                              <Route path="/product/:slug" element={<ProductDetailPage />} />
                              <Route path="/schemes" element={<SchemesPage />} />
                              <Route path="/cart" element={<CartPage />} />
                              <Route path="/checkout" element={<CheckoutPage />} />
                              <Route path="/wishlist" element={<WishlistPage />} />
                              <Route path="/about" element={<AboutPage />} />
                              <Route path="/contact" element={<ContactPage />} />
                              <Route path="/policies/:policyType" element={<PoliciesPage />} />
                              <Route path="/policies" element={<PoliciesPage />} />
                              <Route path="/faq" element={<PoliciesPage />} />
                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </main>
                          <Footer />
                        </div>
                      }
                    />
                  </Routes>
                  </React.Suspense>
                </WishlistProvider>
              </CartProvider>
            </HelpProvider>
          </AuthProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
