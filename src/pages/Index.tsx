// pages/index.tsx

import React from "react";
import TrustedBanner from "@/components/TrustedBanner";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchForm from "@/components/SearchForm";
import CategoryStrip from "@/components/CategoryStrip";
import SaveSearchPrompt from "@/components/SaveSearchPrompt";
import CarValuationSection from "@/components/CarValuationSection";
import ShowroomSection from "@/components/ShowroomSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

const Index: React.FC = () => {
  return (
    <>
      <TrustedBanner />
      <Navbar />

      <main>
        <HeroSection />

        <section className="container mx-auto px-4 py-8">
          <SearchForm />
          <CategoryStrip />
          <SaveSearchPrompt />
          <CarValuationSection />
          <ShowroomSection />
          <ReviewsSection />
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Index;
