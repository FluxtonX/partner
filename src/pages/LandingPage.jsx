import React from 'react';
import Navbar from '@/components/common/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import HowItWorks from "@/components/landing/HowItWorks";
import ProductPreview from '@/components/landing/ProductPreview';
import UserTypes from '@/components/landing/UserTypes';
import PricingPreview from '@/components/landing/PricingPreview';
import Testimonials from '@/components/landing/Testimonials';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/common/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <HeroSection />
        <FeaturesGrid />
        <HowItWorks />
        <ProductPreview />
        <UserTypes />
        <PricingPreview />
        <Testimonials />
        <FinalCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;