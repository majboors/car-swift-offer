
import { DollarSign, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const CarValuationSection = () => {
  return (
    <section className="relative mb-12">
      <div className="w-full relative">
        <img
          src="/lovable-uploads/dbf5324a-2c9d-40f6-a1e6-76153c4ea546.png"
          alt="Background image of person with car"
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-full">
                <DollarSign className="w-6 h-6 text-[#007ac8]" />
              </div>
              <h2 className="text-2xl font-semibold">See how much your car is worth</h2>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-[#007ac8]" />
                <p className="text-gray-600">Based on live market data and thousands of listed car sales</p>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#007ac8]" />
                <p className="text-gray-600">No follow-up calls or strings attached</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <select id="make" className="w-full p-3 border border-gray-300 rounded-md">
                  <option value="">Select</option>
                  <option value="toyota">Toyota</option>
                  <option value="honda">Honda</option>
                  <option value="bmw">BMW</option>
                </select>
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <select id="model" className="w-full p-3 border border-gray-300 rounded-md">
                  <option value="">Select</option>
                </select>
              </div>
            </div>
            
            <Button className="bg-[#007ac8] hover:bg-[#0069b4] text-white w-full py-6 text-lg">
              Value your car
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarValuationSection;
