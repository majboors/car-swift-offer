// pages/index.tsx

import React from "react";
import Navbar from "@/components/Navbar";
import TrustedBanner from "@/components/TrustedBanner";
import HeroSection from "@/components/HeroSection";
import SearchForm from "@/components/SearchForm";
import CategoryStrip from "@/components/CategoryStrip";
import SaveSearchPrompt from "@/components/SaveSearchPrompt";
import ShowroomSection from "@/components/ShowroomSection";
import ReviewsSection from "@/components/ReviewsSection";
import CarValuationSection from "@/components/CarValuationSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    // No more min-h-screen or flex-grow
    <div className="flex flex-col">
      <TrustedBanner />
      <Navbar />

      {/* main now just flows with content */}
      <main>
        <HeroSection />
        <div className="container mx-auto px-4">
          <SearchForm />
        </div>
        <CategoryStrip />
        <SaveSearchPrompt />
        <CarValuationSection />
        <ShowroomSection />
        <ReviewsSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
