import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/layout/Footer";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import FeaturesCarousel from "@/components/sections/FeaturesCarousel";
import SuccessStory from "@/components/sections/SuccessStory";
import SupplierMarquee from "@/components/sections/SupplierMarquee";
import WhoIsItFor from "@/components/sections/WhoIsItFor";
import HowItWorksScroll from "@/components/sections/HowItWorksScroll";
import CommunitySection from "@/components/sections/CommunitySection";
import BlogSection from "@/components/sections/BlogSection";
import PricingSection from "@/components/sections/PricingSection";


import React from 'react'

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <TestimonialsCarousel/>
      <FeaturesCarousel/>
      <SuccessStory/>
       <SupplierMarquee />
      <WhoIsItFor />
      <HowItWorksScroll />
      <PricingSection/>
      <CommunitySection/>
      <BlogSection/>
      <Features />
      <CTA />
      <Footer />
    </div>
  )
}

export default LandingPage