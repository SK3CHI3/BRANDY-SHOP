
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
// Import debug utilities for development
// import "@/utils/userRoleDebug"; // Disabled to prevent 403 errors
import "@/utils/databaseDebug";
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
import Favorites from "./pages/Favorites";
import SizeGuide from "./pages/SizeGuide";
import HowItWorksPage from "./pages/HowItWorksPage";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import UploadDesign from "./pages/UploadDesign";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="/profile" element={<Profile />} />
            <Route path="/artist-studio" element={<ArtistStudio />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/customer-dashboard" element={<Dashboard />} />
            <Route path="/artist-dashboard" element={<Dashboard />} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
            <Route path="/orders/:id/track" element={<OrderTracking />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/wishlist" element={<Favorites />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/upload-design" element={<UploadDesign />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
