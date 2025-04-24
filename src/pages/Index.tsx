
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
    <div className="min-h-screen flex flex-col">
      <TrustedBanner />
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <SearchForm />
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
