
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { CartProvider } from "@/contexts/CartContext";
// Import route guards
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import ArtistRoute from "@/components/auth/ArtistRoute";
import AuthenticatedRoute from "@/components/auth/AuthenticatedRoute";

import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import CustomStudio from "./pages/CustomStudio";
import RequestQuote from "./pages/RequestQuote";
import Artists from "./pages/Artists";
import ArtistProfile from "./pages/ArtistProfile";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProductDetails from "./pages/ProductDetails";
import ArtistStudio from "./pages/ArtistStudio";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import OrderTracking from "./pages/OrderTracking";
import ArtistOrders from "./pages/ArtistOrders";
import Favorites from "./pages/Favorites";
import SizeGuide from "./pages/SizeGuide";
import HowItWorksPage from "./pages/HowItWorksPage";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import UploadDesign from "./pages/UploadDesign";

import Reviews from "./pages/Reviews";
import Notifications from "./pages/Notifications";
import Search from "./pages/Search";
import SystemTest from "./pages/SystemTest";
import MobileTest from "./pages/MobileTest";
import AdminSetup from "./pages/AdminSetup";
import AdminLogin from "./pages/AdminLogin";
import OrderManagement from "./pages/admin/OrderManagement";
import UserManagement from "./pages/admin/UserManagement";
import ProductManagement from "./pages/admin/ProductManagement";

import AdminAnalytics from "./pages/admin/Analytics";
import MessagesSupport from "./pages/admin/MessagesSupport";
import AdminNotifications from "./pages/admin/Notifications";
import Reports from "./pages/admin/Reports";
import SystemSettings from "./pages/admin/SystemSettings";
import AdminDesignLicensing from "./pages/admin/DesignLicensing";
import DesignSubmissions from "./pages/admin/DesignSubmissions";
import QuoteManagement from "./pages/admin/QuoteManagement";
import MyLicenses from "./pages/MyLicenses";
import DeploymentStatus from "./pages/DeploymentStatus";

import AdminLayout from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/custom-studio" element={<CustomStudio />} />
                  <Route path="/request-quote" element={<RequestQuote />} />
                  <Route path="/design/:productType" element={<CustomStudio />} />
                  <Route path="/artists" element={<Artists />} />
                  <Route path="/artist/:id" element={<ArtistProfile />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  {/* Protected routes requiring authentication */}
                  <Route path="/profile" element={
                    <AuthenticatedRoute>
                      <Profile />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/cart" element={
                    <AuthenticatedRoute>
                      <Cart />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/checkout" element={
                    <AuthenticatedRoute>
                      <Checkout />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/order-confirmation" element={
                    <AuthenticatedRoute>
                      <OrderConfirmation />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/order-tracking" element={
                    <AuthenticatedRoute>
                      <OrderTracking />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/track-order" element={
                    <AuthenticatedRoute>
                      <OrderTracking />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/orders/:id/track" element={
                    <AuthenticatedRoute>
                      <OrderTracking />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/favorites" element={
                    <AuthenticatedRoute>
                      <Favorites />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/wishlist" element={
                    <AuthenticatedRoute>
                      <Favorites />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/messages" element={
                    <AuthenticatedRoute>
                      <Messages />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/notifications" element={
                    <AuthenticatedRoute>
                      <Notifications />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/my-licenses" element={
                    <AuthenticatedRoute>
                      <MyLicenses />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/reviews/:productId" element={<Reviews />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/system-test" element={
                    <AuthenticatedRoute>
                      <SystemTest />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/mobile-test" element={<MobileTest />} />
                  <Route path="/deployment-status" element={<DeploymentStatus />} />


                  {/* Dashboard routes with role-based access */}
                  <Route path="/customer-dashboard" element={
                    <AuthenticatedRoute>
                      <Dashboard />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/artist-dashboard" element={
                    <ArtistRoute>
                      <Dashboard />
                    </ArtistRoute>
                  } />
                  <Route path="/admin-dashboard" element={
                    <AdminRoute>
                      <Dashboard />
                    </AdminRoute>
                  } />

                  {/* Artist-only routes */}
                  <Route path="/artist-studio" element={
                    <ArtistRoute>
                      <ArtistStudio />
                    </ArtistRoute>
                  } />
                  <Route path="/artist-orders" element={
                    <ArtistRoute>
                      <ArtistOrders />
                    </ArtistRoute>
                  } />
                  <Route path="/analytics" element={
                    <ArtistRoute>
                      <Analytics />
                    </ArtistRoute>
                  } />
                  <Route path="/upload-design" element={
                    <ArtistRoute>
                      <UploadDesign />
                    </ArtistRoute>
                  } />


                  {/* Admin-only routes */}
                  <Route path="/admin-panel" element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <AdminRoute>
                      <AdminLayout>
                        <OrderManagement />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin/users" element={
                    <AdminRoute>
                      <AdminLayout>
                        <UserManagement />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin/products" element={
                    <AdminRoute>
                      <AdminLayout>
                        <ProductManagement />
                      </AdminLayout>
                    </AdminRoute>
                  } />

                  <Route path="/admin/analytics" element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminAnalytics />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin/messages" element={
                    <AdminRoute>
                      <AdminLayout>
                        <MessagesSupport />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin/notifications" element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminNotifications />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin/reports" element={
                    <AdminRoute>
                      <AdminLayout>
                        <Reports />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <AdminRoute>
                      <AdminLayout>
                        <SystemSettings />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin/design-licensing" element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminDesignLicensing />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin/design-submissions" element={
                    <AdminRoute>
                      <AdminLayout>
                        <DesignSubmissions />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin/quotes" element={
                    <AdminRoute>
                      <AdminLayout>
                        <QuoteManagement />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin-setup" element={<AdminSetup />} />
                  <Route path="/admin-login" element={<AdminLogin />} />

                  {/* Public routes */}
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/size-guide" element={<SizeGuide />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
