import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Public Components & Pages
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { BrandPage } from './pages/BrandPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SchemesPage } from './pages/SchemesPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WishlistPage } from './pages/WishlistPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PoliciesPage } from './pages/PoliciesPage';

import { HelpProvider } from './context/HelpContext';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCatalogueStudioPage } from './pages/admin/AdminCatalogueStudioPage';
import { AdminContentPage } from './pages/admin/AdminContentPage';
import { AdminAttributesPage } from './pages/admin/AdminAttributesPage';
import { AdminBrandsPage } from './pages/admin/AdminBrandsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminImportPage } from './pages/admin/AdminImportPage';
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminSchemesPage } from './pages/admin/AdminSchemesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Protected Admin Route Guard
const ProtectedAdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) {
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
    <BrowserRouter>
      <ScrollToTop />
      <SettingsProvider>
        <AuthProvider>
          <HelpProvider>
            <CartProvider>
              <WishlistProvider>
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
                    <Route path="import" element={<AdminImportPage />} />
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
            </WishlistProvider>
          </CartProvider>
        </HelpProvider>
      </AuthProvider>
    </SettingsProvider>
  </BrowserRouter>
  );
}

export default App;
