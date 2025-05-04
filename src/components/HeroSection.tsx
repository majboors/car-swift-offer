

import { Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="absolute inset-0">
        <img
          src="https://i.ibb.co/93nCxsDG/upscalemedia-transformed.jpg"
          alt="Hero background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12">
        <div className="flex items-center justify-center mb-6">
          <Shield className="w-12 h-12 mr-4" />
          <h1 className="text-4xl md:text-6xl font-bold">safer with snap my car</h1>
        </div>
        <div className="max-w-3xl mx-auto text-center mb-8">
          <p className="text-xl md:text-2xl text-gray-300">
            Sell your car with a single click – fast, easy, and reliable!
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
