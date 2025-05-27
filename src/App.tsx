
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
// Import route guards
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import ArtistRoute from "@/components/auth/ArtistRoute";
import AuthenticatedRoute from "@/components/auth/AuthenticatedRoute";

import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import CustomStudio from "./pages/CustomStudio";
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
import RequestPayment from "./pages/RequestPayment";
import Reviews from "./pages/Reviews";
import Notifications from "./pages/Notifications";
import Search from "./pages/Search";

const queryClient = new QueryClient();

const App = () => {

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/custom-studio" element={<CustomStudio />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artist/:id" element={<ArtistProfile />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            {/* Protected routes requiring authentication */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
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
            <Route path="/order-tracking" element={<OrderTracking />} />
            <Route path="/track-order" element={<OrderTracking />} />
            <Route path="/orders/:id/track" element={<OrderTracking />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/wishlist" element={<Favorites />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reviews/:productId" element={<Reviews />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/search" element={<Search />} />

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
            <Route path="/request-payment" element={
              <ArtistRoute>
                <RequestPayment />
              </ArtistRoute>
            } />

            {/* Admin-only routes */}
            <Route path="/admin-panel" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />

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
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
