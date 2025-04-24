
import { Calculator, CarFront, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import InstantOfferHero from "@/components/InstantOfferHero";
import InstantOfferFeatures from "@/components/InstantOfferFeatures";
import InstantOfferSteps from "@/components/InstantOfferSteps";
import InstantOfferFAQ from "@/components/InstantOfferFAQ";

const ValueMyCar = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <InstantOfferHero />
      <InstantOfferFeatures />
      <InstantOfferSteps />
      <InstantOfferFAQ />
    </div>
  );
};

export default ValueMyCar;
