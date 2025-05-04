// pages/index.tsx

import React from "react";
import Navbar from "@/components/Navbar";
import TrustedBanner from "@/components/TrustedBanner";
import HeroSection from "@/components/HeroSection";
import SearchForm from "@/components/SearchForm";
import CategoryStrip from "@/components/CategoryStrip";
import SaveSearchPrompt from "@/components/SaveSearchPrompt";
import CarValuationSection from "@/components/CarValuationSection";
import ShowroomSection from "@/components/ShowroomSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    // A: Root wrapper
    <div className="outline outline-red-500">
      <TrustedBanner />

      {/* B: Navbar + content wrapper */}
      <div className="outline outline-blue-500">
        <Navbar />

        {/* C: Main content */}
        <main className="outline outline-green-500">
          {/* D: Hero */}
          <div className="outline outline-yellow-500">
            <HeroSection />
          </div>

          {/* E: Inner container */}
          <div className="container mx-auto px-4 py-8 outline outline-purple-500">
            <SearchForm />
            <CategoryStrip />
            <SaveSearchPrompt />
            <CarValuationSection />
            <ShowroomSection />
            <ReviewsSection />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
