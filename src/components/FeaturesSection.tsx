
import { ArrowRight, Shield, Calendar, MessageSquare } from "lucide-react";

const features = [
  {
    title: "AI-Driven Price Prediction",
    description: "Get accurate market value estimates powered by machine learning",
    icon: Shield,
  },
  {
    title: "Instant Online Offers",
    description: "Receive competitive offers within minutes",
    icon: ArrowRight,
  },
  {
    title: "Real-Time AR Car Detection",
    description: "Simply point your camera to identify any car model",
    icon: Calendar,
  },
  {
    title: "End-to-End Digital Checkout",
    description: "Complete your purchase entirely online, securely",
    icon: MessageSquare,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose CarSwift</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-[#007ac8] mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
