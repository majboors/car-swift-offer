
import Navbar from "@/components/Navbar";
import TrustedBanner from "@/components/TrustedBanner";
import HeroSection from "@/components/HeroSection";
import SearchForm from "@/components/SearchForm";
import CategoryStrip from "@/components/CategoryStrip";
import SaveSearchPrompt from "@/components/SaveSearchPrompt";
import ShowroomSection from "@/components/ShowroomSection";
import ReviewsSection from "@/components/ReviewsSection";
import CarValuationSection from "@/components/CarValuationSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <TrustedBanner />
      <Navbar />
      <main>
        <HeroSection />
        <SearchForm />
        <CategoryStrip />
        <SaveSearchPrompt />
        <CarValuationSection />
        <ShowroomSection />
        <ReviewsSection />
      </main>
    </div>
  );
};

export default Index;
