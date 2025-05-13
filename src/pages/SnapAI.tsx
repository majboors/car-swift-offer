import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Camera, Upload, Check, Info, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { processCarFeatures } from "@/lib/feature-utils";
import { LoadingContainer } from "@/components/LoadingContainer";
interface CarIdentification {
  make: string;
  model: string;
  year?: string;
  confidence?: string;
}
interface CarDetails {
  car_name: string;
  features: Record<string, string[]>;
  specifications: Record<string, string>;
  tags: string[];
}

// Feature categories (for sorting and display)
const FEATURE_CATEGORIES = ["Factory fitted", "Audio, Visual & Communication", "Safety & Security", "Comfort & Convenience", "Lights & Windows", "Interior", "Seating"];
const API_BASE_URL = "https://car.applytocollege.pk";
const SnapAI = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [activeTab, setActiveTab] = useState<string>("image-upload");
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [cameraDialogOpen, setCameraDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modelYear, setModelYear] = useState<string>("");
  const [carIdentification, setCarIdentification] = useState<CarIdentification | null>(null);
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [apiResponseOpen, setApiResponseOpen] = useState<boolean>(false);
  const [apiResponseData, setApiResponseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // New state to store the full car name from API
  const [identifiedCarName, setIdentifiedCarName] = useState<string>("");

  // Add a state to track loading progress for the LoadingContainer
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  useEffect(() => {
    if (!cameraDialogOpen) {
      stopCamera();
    }
  }, [cameraDialogOpen]);

  // Camera functions
  const startCamera = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported in this browser");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          // Prefer rear camera
          width: {
            ideal: 1280
          },
          height: {
            ideal: 720
          }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setError(`Camera error: ${error.message || "Could not access camera"}`);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  };
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to match video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    // Draw the video frame to the canvas
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    // Convert canvas to blob
    canvasRef.current.toBlob(blob => {
      if (blob) {
        const file = new File([blob], "camera-capture.jpg", {
          type: "image/jpeg"
        });
        setSelectedImage(file);
        setImagePreviewUrl(URL.createObjectURL(file));
        setCameraDialogOpen(false); // Close dialog after capturing
        stopCamera();
      }
    }, 'image/jpeg', 0.9); // 0.9 quality
  };

  // File upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setError(null);
  };
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Real API call to identify car
  const identifyCar = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload or capture a car image first.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Create form data for the API call
      const formData = new FormData();
      formData.append('image', selectedImage);

      // Call the first API endpoint
      const response = await fetch(`${API_BASE_URL}/get-car-name`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to identify car');
      }
      const data = await response.json();

      // Log the API response to console
      console.log("Car identification API response:", data);

      // Store raw API response for popup
      setApiResponseData(data);

      // Store the full car name from API
      const carName = data.car_name || "";
      setIdentifiedCarName(carName);

      // Extract make and model from car_name
      const nameParts = carName.split(" ");
      const make = nameParts[0] || "";
      const model = nameParts.slice(1).join(" ") || "";

      // Format the received data for our application state
      const formattedData: CarIdentification = {
        make: make,
        model: model,
        year: data.year || "",
        confidence: data.confidence > 0.8 ? "high" : "medium"
      };
      setCarIdentification(formattedData);

      // If API already provided year, pre-fill it
      if (data.year) {
        setModelYear(data.year);
      }

      // Display toast notification for the match
      toast({
        title: "Car Identified",
        description: `Possible match: ${carName}`,
        variant: "default"
      });
      setActiveTab("year-input");
    } catch (error: any) {
      console.error('Error identifying car:', error);
      setError(error.message || "Failed to identify car");
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Real API call to get car details
  const getCarDetails = async () => {
    if (!carIdentification) {
      toast({
        title: "Missing information",
        description: "Please identify your car first.",
        variant: "destructive"
      });
      return;
    }
    if (!modelYear || !/^\d{4}$/.test(modelYear)) {
      toast({
        title: "Invalid year",
        description: "Please enter a valid 4-digit year.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    setLoadingDetails(true); // Show the loading container
    setError(null);
    try {
      // Create form data for the API call
      const formData = new FormData();

      // Use the full car name if available, or construct one
      const carName = identifiedCarName || `${carIdentification.make} ${carIdentification.model} ${modelYear}`;
      formData.append('car_name', carName);

      // Add the image file
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      // Call the second API endpoint
      const response = await fetch(`${API_BASE_URL}/get-car-details`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get car details');
      }
      const data = await response.json();

      // Log the car details response
      console.log("Car details API response:", data);

      // Update API response data for popup
      setApiResponseData(data);

      // Process features to properly categorize them
      const processedFeatures = processCarFeatures(data.features || {});

      // Ensure features are properly structured
      const formattedDetails: CarDetails = {
        car_name: data.car_name || carName,
        features: processedFeatures,
        specifications: data.specifications || {},
        tags: data.tags || []
      };
      console.log("Processed features:", processedFeatures);

      // Update state with car details
      setCarDetails(formattedDetails);

      // Move to next step
      setActiveTab("car-details");
    } catch (error: any) {
      console.error('Error getting car details:', error);
      setError(error.message || "Failed to get car details");
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLoadingDetails(false); // Hide the loading container after a brief delay
      }, 1000);
    }
  };

  // Generate a description with specifications and tags in a readable format
  const generateDescription = (specs: Record<string, string>, tags: string[]) => {
    let description = 'This vehicle comes with the following specifications:\n\n';

    // Add specifications
    if (Object.keys(specs).length > 0) {
      Object.entries(specs).forEach(([key, value]) => {
        description += `- ${key}: ${value}\n`;
      });
      description += '\n';
    } else {
      description = 'This vehicle features:'; // Fallback if no specs
    }

    // Add list of key features
    if (carDetails && carDetails.features) {
      let featureCount = 0;
      description += '\nKey features include:\n';

      // Add a selection of features from each category
      Object.entries(carDetails.features).forEach(([category, features]) => {
        if (features && features.length > 0) {
          // Add up to 3 features from each non-empty category
          const categoryFeatures = features.slice(0, 3);
          categoryFeatures.forEach(feature => {
            if (featureCount < 12) {
              // Limit to 12 total features
              description += `- ${feature}\n`;
              featureCount++;
            }
          });
        }
      });
      description += '\n';
    }

    // Add tags
    if (tags && tags.length > 0) {
      description += 'This car is perfect for those looking for a ';
      description += tags.join(', ').toLowerCase();
      description += ' driving experience.';
    }
    return description;
  };

  // Create listing with car details
  const createListing = () => {
    if (!carDetails || !carIdentification || !modelYear) {
      toast({
        title: "Missing information",
        description: "Please complete all previous steps first.",
        variant: "destructive"
      });
      return;
    }

    // Generate a well-formatted description with specifications and tags
    const description = generateDescription(carDetails.specifications, carDetails.tags);

    // Get the car title from car_name in carDetails or construct it
    const carTitle = carDetails.car_name || `${carIdentification.make} ${carIdentification.model} ${modelYear}`;

    // Navigate to add-listing with query params for simple data
    // and state for complex data
    navigate(`/add-listing?make=${encodeURIComponent(carIdentification.make)}&model=${encodeURIComponent(carIdentification.model)}&title=${encodeURIComponent(carTitle)}&year=${encodeURIComponent(modelYear)}`, {
      state: {
        description,
        features: carDetails.features,
        specifications: carDetails.specifications,
        tags: carDetails.tags,
        preFilledFromApi: true
      }
    });
  };

  // Format the API response for display
  const formatApiResponse = (data: any) => {
    if (!data) return "";
    return JSON.stringify(data, null, 2);
  };

  // Check if a category exists in the features
  const hasFeatureCategory = (category: string) => {
    if (!carDetails?.features) return false;
    return !!carDetails.features[category] && carDetails.features[category].length > 0;
  };
  return <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">From snap to sale—AI-powered car selling, simplified.</h1>
          
          {/* Show the LoadingContainer when loadingDetails is true */}
          <LoadingContainer isLoading={loadingDetails} />
          
          {error && <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="image-upload" disabled={loading}>Car Image</TabsTrigger>
              <TabsTrigger value="year-input" disabled={loading || !carIdentification}>
                Car Details
              </TabsTrigger>
              <TabsTrigger value="car-details" disabled={loading || !carDetails}>
                Results
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Car Image Upload/Capture */}
            <TabsContent value="image-upload" className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Upload or Capture a Car Image</h2>
                    <p className="text-gray-600">Our AI will identify the make and model of your car</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50" onClick={triggerFileInput}>
                      <Upload className="h-10 w-10 text-gray-400 mb-3" />
                      <p className="font-medium">Upload image</p>
                      <p className="text-sm text-gray-500">Click to browse files</p>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                    
                    {/* Camera Capture */}
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50" onClick={() => {
                    setCameraDialogOpen(true);
                    startCamera();
                  }}>
                      <Camera className="h-10 w-10 text-gray-400 mb-3" />
                      <p className="font-medium">Take photo</p>
                      <p className="text-sm text-gray-500">Use your device camera</p>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  {imagePreviewUrl && <div className="mt-4">
                      <h3 className="text-lg font-medium mb-3">Selected Image</h3>
                      <div className="relative">
                        <img src={imagePreviewUrl} alt="Car Preview" className="w-full max-h-[300px] object-contain border rounded-md" />
                        <div className="mt-2 flex justify-end">
                          <Button variant="outline" onClick={() => {
                        setSelectedImage(null);
                        setImagePreviewUrl('');
                      }} className="mr-2">
                            Remove
                          </Button>
                          <Button onClick={identifyCar} disabled={loading} className="bg-[#007ac8] hover:bg-[#0069b4]">
                            {loading ? 'Identifying...' : 'Identify Car'}
                          </Button>
                        </div>
                      </div>
                    </div>}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Year Input and Identified Car Info */}
            <TabsContent value="year-input" className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {carIdentification && <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Car Identified</h2>
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                          <Check className="h-4 w-4" />
                          <span>
                            {carIdentification.confidence === 'high' ? 'High confidence match' : 'Possible match'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="car_name">Identified Car</Label>
                          <Input id="car_name" value={identifiedCarName} readOnly className="bg-gray-50 font-medium text-center" />
                          {apiResponseData && <div className="flex justify-end mt-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                                    <Info className="h-4 w-4" />
                                    <span>View API Response</span>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">API Response</h4>
                                    <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-[400px]">
                                      {formatApiResponse(apiResponseData)}
                                    </pre>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="make">Make</Label>
                          <Input id="make" value={carIdentification.make} readOnly className="bg-gray-50" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="model">Model</Label>
                          <Input id="model" value={carIdentification.model} readOnly className="bg-gray-50" />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="year">Model Year</Label>
                          <Input id="year" value={modelYear} onChange={e => setModelYear(e.target.value)} placeholder="Enter year (e.g., 2022)" pattern="\\d{4}" maxLength={4} />
                          <p className="text-sm text-gray-500 mt-1">
                            Enter the model year to get detailed specifications
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={() => setActiveTab('image-upload')}>
                          Back
                        </Button>
                        <Button onClick={getCarDetails} disabled={!modelYear || loading} className="bg-[#007ac8] hover:bg-[#0069b4]">
                          {loading ? 'Loading...' : 'Get Car Details'}
                        </Button>
                      </div>
                    </div>}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 3: Car Details Results */}
            <TabsContent value="car-details" className="space-y-6">
              {carDetails && <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">{carDetails.car_name || identifiedCarName}</h2>
                      <p className="text-gray-600">
                        Complete car details retrieved
                      </p>
                      
                      {apiResponseData && <div className="flex justify-center mt-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Info className="h-4 w-4" />
                                <span>View Raw API Response</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">API Response</h4>
                                <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-[400px]">
                                  {formatApiResponse(apiResponseData)}
                                </pre>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>}
                    </div>
                    
                    <Separator />
                    
                    {/* Features Section - Organized by category */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Display features organized by categories from the API */}
                        {FEATURE_CATEGORIES.map(category => hasFeatureCategory(category) && <div key={category} className="border rounded-md p-4">
                              <h4 className="font-medium mb-2">{category}</h4>
                              <ul className="space-y-1">
                                {carDetails.features[category]?.map((item, index) => <li key={index} className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>)}
                              </ul>
                            </div>)}
                      </div>
                    </div>
                    
                    {/* Specifications Section */}
                    {Object.keys(carDetails.specifications).length > 0 && <div>
                        <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(carDetails.specifications).map(([name, value]) => <div key={name} className="flex justify-between border-b py-2">
                              <span className="font-medium">{name}</span>
                              <span>{value}</span>
                            </div>)}
                        </div>
                      </div>}
                    
                    {/* Tags Section */}
                    {carDetails.tags && carDetails.tags.length > 0 && <div>
                        <h3 className="text-lg font-semibold mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {carDetails.tags.map((tag, index) => <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                              {tag}
                            </div>)}
                        </div>
                      </div>}

                    {/* Description Preview */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Generated Description</h3>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <pre className="whitespace-pre-wrap text-sm">
                          {generateDescription(carDetails.specifications, carDetails.tags)}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={() => setActiveTab('year-input')}>
                        Back
                      </Button>
                      <Button onClick={createListing} className="bg-[#007ac8] hover:bg-[#0069b4]">
                        Create Listing with These Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Camera Dialog */}
      <Dialog open={cameraDialogOpen} onOpenChange={setCameraDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take a Photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto border rounded-md mb-4" />
            <canvas ref={canvasRef} className="hidden" />
            
            {error && <Alert variant="destructive" className="mb-4 w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>}
            
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => {
              stopCamera();
              setCameraDialogOpen(false);
            }}>
                Cancel
              </Button>
              <Button onClick={captureImage} className="bg-[#007ac8] hover:bg-[#0069b4]" disabled={!streamActive}>
                Capture
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>;
};
export default SnapAI;