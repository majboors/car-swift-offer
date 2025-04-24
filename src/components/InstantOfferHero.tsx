
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InstantOfferHero = () => {
  const [registration, setRegistration] = useState("");
  const [state, setState] = useState("");

  return (
    <section className="relative">
      <div className="absolute inset-0">
        <img
          src="public/lovable-uploads/b6da5a4b-2b70-44f4-9c22-61c2228cf0d3.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold text-white mb-6">Instant Offer™</h1>
          <p className="text-xl text-white mb-8">
            Sell hassle-free to an accredited dealer in as fast as 24 hours
          </p>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration
                </label>
                <Input
                  type="text"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value)}
                  placeholder="Enter registration"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nsw">NSW</SelectItem>
                    <SelectItem value="vic">VIC</SelectItem>
                    <SelectItem value="qld">QLD</SelectItem>
                    <SelectItem value="wa">WA</SelectItem>
                    <SelectItem value="sa">SA</SelectItem>
                    <SelectItem value="tas">TAS</SelectItem>
                    <SelectItem value="act">ACT</SelectItem>
                    <SelectItem value="nt">NT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full bg-[#007ac8] hover:bg-[#0069b4] text-lg py-6">
              Get a free Instant Offer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstantOfferHero;
