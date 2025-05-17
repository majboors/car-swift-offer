import React, { useState, useEffect } from "react";
import TrustedBanner from "@/components/TrustedBanner";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchForm from "@/components/SearchForm";
import CategoryStrip from "@/components/CategoryStrip";
import RecommendedCarsSection from "@/components/RecommendedCarsSection";
import CarValuationSection from "@/components/CarValuationSection";
import ShowroomSection from "@/components/ShowroomSection";
import ReviewsSection from "@/components/ReviewsSection";
import SnapAIShowcase from "@/components/SnapAIShowcase";
import SnapAIPromotionDialog from "@/components/SnapAIPromotionDialog";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Handler for when loading is complete
  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Add a class to the body to enable transitions after loading
    document.body.classList.add('content-loaded');
  };

  return (
    <>
      {isLoading && <PageLoader onLoaded={handleLoadingComplete} />}
      
      <div className={`flex flex-col transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {/* 1. Top banner never grows */}
        <TrustedBanner />

        {/* 2. Navbar is fixed-height (won't stretch) */}
        <div className="flex-shrink-0">
          <Navbar />
        </div>

        {/* SnapAI Promotion Dialog */}
        <SnapAIPromotionDialog />

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
            
            {/* Add SnapAI showcase section */}
            <SnapAIShowcase />
            
            <CarValuationSection />
            <ShowroomSection />
            <ReviewsSection />
          </section>
        </main>

        {/* 4. Footer will stick to bottom only if content is short */}
        <Footer />
      </div>
    </>
  );
};

export default Index;
