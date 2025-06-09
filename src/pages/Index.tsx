
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProductShowcase from '@/components/ProductShowcase';
import FeaturedDesigns from '@/components/FeaturedDesigns';
import HowItWorks from '@/components/HowItWorks';
import ArtistSpotlight from '@/components/ArtistSpotlight';
import Footer from '@/components/Footer';
// import { AuthDataDebug } from '@/components/debug/AuthDataDebug';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ProductShowcase />
      <FeaturedDesigns />
      <HowItWorks />
      <ArtistSpotlight />
      <Footer />
      {/* <AuthDataDebug /> */}
    </div>
  );
};

export default Index;
