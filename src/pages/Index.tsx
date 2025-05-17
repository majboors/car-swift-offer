// pages/index.tsx

import React from "react";
import TrustedBanner from "@/components/TrustedBanner";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchForm from "@/components/SearchForm";
import CategoryStrip from "@/components/CategoryStrip";
import RecommendedCarsSection from "@/components/RecommendedCarsSection";
import CarValuationSection from "@/components/CarValuationSection";
import ShowroomSection from "@/components/ShowroomSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

const Index: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* 1. Top banner never grows */}
      <TrustedBanner />

      {/* 2. Navbar is fixed-height (won't stretch) */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* 3. Main content will take whatever space it needs */}
      <main className="flex-grow">
        <HeroSection />

        <section className="container mx-auto px-4 py-8 space-y-8">
          {/* Keep the negative margin for the form to overlap the hero section */}
          <div className="-mt-12">
            <SearchForm />
          </div>
          <CategoryStrip />
          <RecommendedCarsSection />
          <CarValuationSection />
          <ShowroomSection />
          <ReviewsSection />
        </section>
      </main>

      {/* 4. Footer will stick to bottom only if content is short */}
      <Footer />
    </div>
  );
};

export default Index;
