
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CarValuationSection = () => {
  const navigate = useNavigate();
  
  // State management for car data and selections
  const [carData, setCarData] = useState([]);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch car data from public.json
  useEffect(() => {
    setIsLoading(true);
    fetch('/public.json')
      .then(response => response.json())
      .then(data => {
        setCarData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading car data:', error);
        setIsLoading(false);
      });
  }, []);
  
  // Get unique car makes
  const carMakes = [...new Set(carData.map(item => item.car))].sort();
  
  // Update available models when make changes
  useEffect(() => {
    if (selectedMake) {
      const models = [...new Set(
        carData
          .filter(item => item.car === selectedMake)
          .map(item => item.model)
      )].sort();
      
      setAvailableModels(models);
      setSelectedModel("");
    } else {
      setAvailableModels([]);
      setSelectedModel("");
    }
  }, [selectedMake, carData]);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedMake || !selectedModel) {
      // Simple validation
      alert("Please select both make and model");
      return;
    }
    
    // Navigate to add-listing page with car information
    navigate(`/add-listing?make=${selectedMake}&model=${selectedModel}&title=${selectedMake} ${selectedModel}`);
  };

  return (
    <section className="relative mb-12">
      <div className="w-full relative">
        <img
          src="https://i.ibb.co/L7XWZBx/Chat-GPT-Image-May-9-2025-at-09-16-29-PM.png"
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
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                  <Select value={selectedMake} onValueChange={setSelectedMake} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select make" />
                    </SelectTrigger>
                    <SelectContent>
                      {carMakes.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel} 
                    disabled={!selectedMake || isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                type="submit"
                className="bg-[#007ac8] hover:bg-[#0069b4] text-white w-full py-6 text-lg"
                disabled={!selectedMake || !selectedModel || isLoading}
              >
                {isLoading ? "Loading..." : "Value your car"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarValuationSection;
