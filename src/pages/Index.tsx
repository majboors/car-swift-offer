
import Navbar from "@/components/Navbar";
import TrustedBanner from "@/components/TrustedBanner";
import HeroSection from "@/components/HeroSection";
import SearchForm from "@/components/SearchForm";
import CategoryStrip from "@/components/CategoryStrip";
import SaveSearchPrompt from "@/components/SaveSearchPrompt";

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
      </main>
    </div>
  );
};

export default Index;
