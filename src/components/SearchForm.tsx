import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

const SearchForm = () => {
  const [searchParams] = useSearchParams();
  const [carData, setCarData] = useState([]);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [availableModels, setAvailableModels] = useState([]);
  const [availableBodyTypes, setAvailableBodyTypes] = useState([]);
  
  const navigate = useNavigate();
  
  // Parse search parameters
  useEffect(() => {
    // Extract search query from URL if any
    for (const param of searchParams.keys()) {
      // If it's an empty param key (e.g. "/search?" with no value), skip it
      if (!param) continue;
      
      // Check if parameter is a car make
      if (carData.some(item => item.car === param)) {
        setSelectedMake(param);
        continue;
      }
      
      // Check if parameter is a body type
      const bodyTypes = ["Cab Chassis", "Convertible", "Coupe", "Hatch", 
                         "Sedan", "SUV", "Ute", "Van", "Wagon"];
      if (bodyTypes.includes(param)) {
        setSelectedBodyType(param);
        continue;
      }
      
      // Otherwise, treat it as a search query
      setSearchQuery(param);
    }
    
    // For backward compatibility, also check for specific named parameters
    const makeParam = searchParams.get('make');
    if (makeParam && !selectedMake) {
      setSelectedMake(makeParam);
    }
    
    const modelParam = searchParams.get('model');
    if (modelParam && !selectedModel) {
      setSelectedModel(modelParam);
    }
    
    const bodyTypeParam = searchParams.get('bodyType');
    if (bodyTypeParam && !selectedBodyType) {
      setSelectedBodyType(bodyTypeParam);
    }
    
    const queryParam = searchParams.get('query');
    if (queryParam && !searchQuery) {
      setSearchQuery(queryParam);
    }
  }, [searchParams, carData]);
  
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
      setAvailableBodyTypes([]);
      setSelectedBodyType("");
    } else {
      setAvailableModels([]);
      setSelectedModel("");
      setAvailableBodyTypes([]);
      setSelectedBodyType("");
    }
  }, [selectedMake, carData]);
  
  // Update available body types when model changes
  useEffect(() => {
    if (selectedMake && selectedModel) {
      const car = carData.find(
        item => item.car === selectedMake && item.model === selectedModel
      );
      
      if (car) {
        setAvailableBodyTypes(car.body_type);
        setSelectedBodyType("");
      } else {
        setAvailableBodyTypes([]);
        setSelectedBodyType("");
      }
    } else {
      setAvailableBodyTypes([]);
      setSelectedBodyType("");
    }
  }, [selectedModel, selectedMake, carData]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build search parameters in the simplest form possible
    const params = [];
    
    // Add primary search terms
    if (selectedMake) params.push(selectedMake);
    if (selectedModel) params.push(selectedModel);
    if (selectedBodyType) params.push(selectedBodyType);
    if (searchQuery && searchQuery.trim()) params.push(searchQuery.trim());
    
    // Construct the URL with simple parameters
    let searchUrl = "/search";
    if (params.length > 0) {
      searchUrl += "?" + params.map(p => encodeURIComponent(p)).join("&");
    }
    
    console.log("Navigating to:", searchUrl);
    
    // Redirect to search results page
    navigate(searchUrl);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 -mt-24 relative z-10 mx-4 lg:mx-auto max-w-7xl">
      <h2 className="text-xl font-semibold mb-4">Find your next car</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Car Make Selection */}
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
          
          {/* Car Model Selection */}
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
          
          {/* Body Type Selection */}
          <select 
            className="w-full p-2 border rounded-md"
            value={selectedBodyType}
            onChange={(e) => setSelectedBodyType(e.target.value)}
            disabled={!selectedModel}
          >
            <option value="">Body type</option>
            {availableBodyTypes.map((bodyType) => (
              <option key={bodyType} value={bodyType}>
                {bodyType}
              </option>
            ))}
          </select>
        </div>
        
        {/* Text search field */}
        <div className="mb-4 relative">
          <Input
            placeholder="Search by make, model, keywords (electric, leather seats, etc)..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search 
            className="absolute left-3 top-3 w-4 h-4 text-gray-500"
          />
        </div>
        
        <Button 
          type="submit" 
          className="bg-[#007ac8] hover:bg-[#0069b4] text-white w-full md:w-auto"
        >
          Show available cars
        </Button>
      </form>
    </div>
  );
};

export default SearchForm;
