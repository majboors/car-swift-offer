
import { Clock, Check, Shield } from "lucide-react";

const features = [
  {
    title: "Fast",
    description: "Instant Offers are obligation-free and sent in minutes. Sell in as fast as 24 hours to our accredited dealers.",
    icon: Clock
  },
  {
    title: "Easy",
    description: "No need to detail the car, get a roadworthy or buy a car from the dealer.",
    icon: Check
  },
  {
    title: "Trusted",
    description: "Powered by our exclusive pricing data, 83% of Instant Offers are priced higher than a trade-in.",
    icon: Shield
  }
];

const InstantOfferFeatures = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-[#007ac8] rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstantOfferFeatures;
