
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturedDesigns from '@/components/FeaturedDesigns';
import HowItWorks from '@/components/HowItWorks';
import ArtistSpotlight from '@/components/ArtistSpotlight';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturedDesigns />
      <HowItWorks />
      <ArtistSpotlight />
      <Footer />
    </div>
  );
};

export default Index;
