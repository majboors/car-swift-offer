
import { Calculator, CarFront, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstantOfferHero from "@/components/InstantOfferHero";
import InstantOfferFeatures from "@/components/InstantOfferFeatures";
import InstantOfferSteps from "@/components/InstantOfferSteps";
import InstantOfferFAQ from "@/components/InstantOfferFAQ";

const ValueMyCar = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <InstantOfferHero />
        <div className="container mx-auto px-4">
          <InstantOfferFeatures />
          <InstantOfferSteps />
          <InstantOfferFAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ValueMyCar;
