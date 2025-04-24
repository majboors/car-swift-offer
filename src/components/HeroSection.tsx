
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="absolute inset-0">
        <img
          src="/lovable-uploads/ee51f090-5d93-4707-b130-7c802e256860.png"
          alt="Hero background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center justify-center mb-8">
          <Shield className="w-12 h-12 mr-4" />
          <h1 className="text-4xl md:text-6xl font-bold">safer with carswift</h1>
        </div>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xl md:text-2xl text-gray-300">
            Sell your car with a single click – fast, easy, and reliable!
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-xl">
          <h2 className="text-gray-900 text-xl font-semibold mb-4">Find your next car</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select>
              <option value="">All makes</option>
            </Select>
            <Select>
              <option value="">All models</option>
            </Select>
            <Select>
              <option value="">Body type</option>
            </Select>
            <Select>
              <option value="">Location</option>
            </Select>
          </div>
          <Button className="w-full md:w-auto bg-[#007ac8] hover:bg-[#0069b4]">
            Show available cars
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
