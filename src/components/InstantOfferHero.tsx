
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const InstantOfferHero = () => {
  const [registration, setRegistration] = useState("");
  const [state, setState] = useState("");
  const [activeTab, setActiveTab] = useState("instant-offer");
  
  // Search form states
  const [carData, setCarData] = useState([]);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableModels, setAvailableModels] = useState([]);
  
  const navigate = useNavigate();
  
  // Fetch car data from public.json
  useEffect(() => {
    fetch('/public.json')
      .then(response => response.json())
      .then(data => {
        setCarData(data);
      })
      .catch(error => console.error('Error loading car data:', error));
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
  
  // Handle car search form submission
  const handleCarSearch = (e) => {
    e.preventDefault();
    
    // Build search parameters
    const searchParams = new URLSearchParams();
    
    if (selectedMake) searchParams.append("make", selectedMake);
    if (selectedModel) searchParams.append("model", selectedModel);
    if (searchQuery) searchParams.append("query", searchQuery.trim().toLowerCase());
    
    // Add a timestamp parameter to force refresh of data
    searchParams.append("t", Date.now().toString());
    searchParams.append("showFeatured", "false");
    
    // Redirect to search results page
    navigate({
      pathname: "/search",
      search: searchParams.toString()
    });
  };

  // Handle instant offer form submission
  const handleInstantOfferSubmit = (e) => {
    e.preventDefault();
    // Process the registration and state data (this would normally submit to backend)
    console.log("Registration:", registration, "State:", state);
    
    // For now, just show a success message and stay on page
    alert(`Thank you! We'll review your vehicle with registration ${registration} and get back to you.`);
  };

  return (
    <section className="relative">
      <div className="absolute inset-0">
        <img
          src="/hero-image.png"
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
            <ul className="flex border-b border-gray-200 mb-6">
              <li className="mr-1">
                <button 
                  className={`inline-block py-2 px-4 font-semibold ${
                    activeTab === "instant-offer" 
                      ? "text-[#007ac8] border-b-2 border-[#007ac8]" 
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab("instant-offer")}
                >
                  Get an Instant Offer
                </button>
              </li>
              <li className="mr-1">
                <button 
                  className={`inline-block py-2 px-4 font-semibold ${
                    activeTab === "find-cars" 
                      ? "text-[#007ac8] border-b-2 border-[#007ac8]" 
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab("find-cars")}
                >
                  Find cars for sale
                </button>
              </li>
            </ul>

            {/* Instant Offer Form */}
            {activeTab === "instant-offer" && (
              <form onSubmit={handleInstantOfferSubmit} className="mb-4">
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
                <Button type="submit" className="w-full bg-[#007ac8] hover:bg-[#0069b4] text-lg py-6">
                  Get a free Instant Offer
                </Button>
              </form>
            )}

            {/* Car Search Form */}
            {activeTab === "find-cars" && (
              <form onSubmit={handleCarSearch} className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Make
                    </label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedMake}
                      onChange={(e) => setSelectedMake(e.target.value)}
                    >
                      <option value="">All makes</option>
                      {carMakes.map((make) => (
                        <option key={make} value={make}>
                          {make}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      disabled={!selectedMake}
                    >
                      <option value="">All models</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4 relative">
                  <Input
                    placeholder="Search by keywords (electric, leather seats, etc)..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search 
                    className="absolute left-3 top-3 w-4 h-4 text-gray-500"
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center mb-4 text-sm text-gray-600">
                        <Info className="inline-flex h-4 w-4 mr-1 text-gray-400" />
                        <span>Choose a premium package for more visibility</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        Premium packages include features like top position in search results, 
                        featured homepage placement, and email alerts to nearby buyers.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button 
                  type="submit" 
                  className="w-full bg-[#007ac8] hover:bg-[#0069b4] text-lg py-6"
                >
                  Show available cars
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstantOfferHero;
