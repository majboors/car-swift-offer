
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Camera, Upload, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

const ApiTesting = () => {
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

  // Camera functions
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported in this browser");
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
      setCameraDialogOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach((track) => {
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
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        setSelectedImage(file);
        setImagePreviewUrl(URL.createObjectURL(file));
        setCameraDialogOpen(false); // Close dialog after capturing
        stopCamera();
      }
    }, 'image/jpeg');
  };

  // File upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Mock API call (replace with real API when available)
  const identifyCar = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload or capture a car image first.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log the image to console for debugging
      console.log("Selected image:", selectedImage);
      
      // Mock response - This would be replaced with actual API call
      const mockCarIdentification: CarIdentification = {
        make: "Toyota",
        model: "Camry",
        confidence: "high"
      };
      
      setCarIdentification(mockCarIdentification);
      setActiveTab("year-input");
      
      // Log response to console
      console.log("Car identified:", mockCarIdentification);

      // Show toast with possible match
      toast({
        title: "Car Identified",
        description: `Possible match: ${mockCarIdentification.make} ${mockCarIdentification.model}`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error identifying car:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock API call for car details
  const getCarDetails = async () => {
    if (!carIdentification) {
      toast({
        title: "Missing information",
        description: "Please identify your car first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!modelYear || !/^\d{4}$/.test(modelYear)) {
      toast({
        title: "Invalid year",
        description: "Please enter a valid 4-digit year.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock car details - This would be replaced with actual API call
      const mockCarDetails: CarDetails = {
        car_name: `${carIdentification.make} ${carIdentification.model} ${modelYear}`,
        features: {
          "Safety": ["Anti-lock Braking System", "Electronic Stability Control", "Airbags"],
          "Comfort": ["Air Conditioning", "Power Windows", "Cruise Control"],
          "Technology": ["Bluetooth", "Navigation System", "Backup Camera"]
        },
        specifications: {
          "Engine": "2.5L 4-Cylinder",
          "Transmission": "8-Speed Automatic",
          "Fuel Economy": "28 city / 39 highway",
          "Horsepower": "203 hp",
          "Torque": "184 lb-ft"
        },
        tags: ["Sedan", "Reliable", "Fuel Efficient", "Family Car"]
      };
      
      setCarDetails(mockCarDetails);
      setActiveTab("car-details");
      
      // Log details to console
      console.log("Car details retrieved:", mockCarDetails);
    } catch (error: any) {
      console.error('Error getting car details:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Create listing with car details
  const createListing = () => {
    if (!carDetails || !carIdentification || !modelYear) {
      toast({
        title: "Missing information",
        description: "Please complete all previous steps first.",
        variant: "destructive",
      });
      return;
    }
    
    // Create description with specifications and tags
    let description = '';
    
    if (carDetails.specifications) {
      description += "Specifications:\n";
      Object.entries(carDetails.specifications).forEach(([key, value]) => {
        description += `- ${key}: ${value}\n`;
      });
      description += "\n";
    }
    
    if (carDetails.tags && carDetails.tags.length > 0) {
      description += `Tags: ${carDetails.tags.join(', ')}`;
    }
    
    // Navigate to add-listing with query params for simple data
    // and state for complex data
    navigate(
      `/add-listing?make=${encodeURIComponent(carIdentification.make)}&model=${encodeURIComponent(carIdentification.model)}&title=${encodeURIComponent(carDetails.car_name)}&year=${encodeURIComponent(modelYear)}`, 
      {
        state: {
          description,
          features: carDetails.features,
          preFilledFromApi: true
        }
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Car Identification API Testing</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="image-upload" disabled={loading}>Car Image</TabsTrigger>
              <TabsTrigger 
                value="year-input" 
                disabled={loading || !carIdentification}
              >
                Car Details
              </TabsTrigger>
              <TabsTrigger 
                value="car-details" 
                disabled={loading || !carDetails}
              >
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
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                      onClick={triggerFileInput}
                    >
                      <Upload className="h-10 w-10 text-gray-400 mb-3" />
                      <p className="font-medium">Upload image</p>
                      <p className="text-sm text-gray-500">Click to browse files</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    
                    {/* Camera Capture */}
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setCameraDialogOpen(true);
                        startCamera();
                      }}
                    >
                      <Camera className="h-10 w-10 text-gray-400 mb-3" />
                      <p className="font-medium">Take photo</p>
                      <p className="text-sm text-gray-500">Use your device camera</p>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  {imagePreviewUrl && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-3">Selected Image</h3>
                      <div className="relative">
                        <img 
                          src={imagePreviewUrl} 
                          alt="Car Preview" 
                          className="w-full max-h-[300px] object-contain border rounded-md"
                        />
                        <div className="mt-2 flex justify-end">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreviewUrl('');
                            }}
                            className="mr-2"
                          >
                            Remove
                          </Button>
                          <Button 
                            onClick={identifyCar}
                            disabled={loading}
                            className="bg-[#007ac8] hover:bg-[#0069b4]"
                          >
                            {loading ? 'Identifying...' : 'Identify Car'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Year Input and Identified Car Info */}
            <TabsContent value="year-input" className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {carIdentification && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Car Identified</h2>
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                          <Check className="h-4 w-4" />
                          <span>
                            {carIdentification.confidence === 'high' 
                              ? 'High confidence match' 
                              : 'Possible match'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="make">Make</Label>
                          <Input 
                            id="make" 
                            value={carIdentification.make} 
                            readOnly 
                            className="bg-gray-50"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="model">Model</Label>
                          <Input 
                            id="model" 
                            value={carIdentification.model} 
                            readOnly 
                            className="bg-gray-50"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="year">Model Year</Label>
                          <Input 
                            id="year" 
                            value={modelYear} 
                            onChange={(e) => setModelYear(e.target.value)} 
                            placeholder="Enter year (e.g., 2022)" 
                            pattern="\\d{4}"
                            maxLength={4}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Enter the model year to get detailed specifications
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-6">
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab('image-upload')}
                        >
                          Back
                        </Button>
                        <Button 
                          onClick={getCarDetails} 
                          disabled={!modelYear || loading}
                          className="bg-[#007ac8] hover:bg-[#0069b4]"
                        >
                          {loading ? 'Loading...' : 'Get Car Details'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 3: Car Details Results */}
            <TabsContent value="car-details" className="space-y-6">
              {carDetails && (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">{carDetails.car_name}</h2>
                      <p className="text-gray-600">
                        Complete car details retrieved
                      </p>
                    </div>
                    
                    <Separator />
                    
                    {/* Features Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(carDetails.features).map(([category, items]) => (
                          <div key={category} className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">{category}</h4>
                            <ul className="space-y-1">
                              {items.map((item, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <Check className="h-4 w-4 text-green-500" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Specifications Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(carDetails.specifications).map(([name, value]) => (
                          <div key={name} className="flex justify-between border-b py-2">
                            <span className="font-medium">{name}</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Tags Section */}
                    {carDetails.tags && carDetails.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {carDetails.tags.map((tag, index) => (
                            <div 
                              key={index}
                              className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                            >
                              {tag}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('year-input')}
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={createListing}
                        className="bg-[#007ac8] hover:bg-[#0069b4]"
                      >
                        Create Listing with These Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
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
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full h-auto border rounded-md mb-4"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  stopCamera();
                  setCameraDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={captureImage}
                className="bg-[#007ac8] hover:bg-[#0069b4]"
                disabled={!streamActive}
              >
                Capture
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ApiTesting;
