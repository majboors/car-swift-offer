
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SearchForm = () => {
  const [carData, setCarData] = useState([]);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  
  const [availableModels, setAvailableModels] = useState([]);
  const [availableBodyTypes, setAvailableBodyTypes] = useState([]);
  
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
    
    // Build search parameters
    const searchParams = new URLSearchParams();
    
    if (selectedMake) searchParams.append("make", selectedMake);
    if (selectedModel) searchParams.append("model", selectedModel);
    if (selectedBodyType) searchParams.append("bodyType", selectedBodyType);
    
    // Redirect to search results page with query parameters
    navigate({
      pathname: "/search",
      search: searchParams.toString()
    });
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
