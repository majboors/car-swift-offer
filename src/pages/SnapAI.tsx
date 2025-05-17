import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Camera, Upload, Check, Info, AlertCircle, ChevronRight, X, Code, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { processCarFeatures } from "@/lib/feature-utils";
import { LoadingContainer } from "@/components/LoadingContainer";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";

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

// Helper function to extract JSON from potentially markdown-wrapped responses
const extractJSON = (response: string): any => {
  try {
    // First try parsing directly as JSON
    return JSON.parse(response);
  } catch (e) {
    try {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        // Try to parse the content inside the code block
        const jsonContent = jsonMatch[1].trim();
        return JSON.parse(jsonContent);
      }
      
      // If no code blocks are found, check if it's an error response with raw_response field
      const errorObj = JSON.parse(response);
      if (errorObj && errorObj.raw_response) {
        // Try to extract JSON from the raw_response field which might contain markdown code blocks
        const nestedJsonMatch = errorObj.raw_response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (nestedJsonMatch && nestedJsonMatch[1]) {
          return JSON.parse(nestedJsonMatch[1].trim());
        }
      }
      
      throw new Error("No JSON found in response");
    } catch (innerError) {
      console.error("Failed to extract JSON from response:", innerError);
      throw new Error("Failed to parse response data");
    }
  }
};

const SnapAI = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState<string>("image-upload");
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [cameraDialogOpen, setCameraDialogOpen] = useState<boolean>(false);
  const [selectedImageDialogOpen, setSelectedImageDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modelYear, setModelYear] = useState<string>("");
  const [carIdentification, setCarIdentification] = useState<CarIdentification | null>(null);
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [apiResponseOpen, setApiResponseOpen] = useState<boolean>(false);
  const [apiResponseData, setApiResponseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentEditingCategory, setCurrentEditingCategory] = useState<string | null>(null);
  const [yearInputDialogOpen, setYearInputDialogOpen] = useState<boolean>(false);
  const [rawApiResponse, setRawApiResponse] = useState<string>("");
  const [showRawApiResponse, setShowRawApiResponse] = useState<boolean>(false);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [creationSuccessDialogOpen, setCreationSuccessDialogOpen] = useState<boolean>(false);

  // New state for direct submission
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [price, setPrice] = useState<string>("");
  const [priceDialogOpen, setPriceDialogOpen] = useState<boolean>(false);

  // New state to store the full car name from API
  const [identifiedCarName, setIdentifiedCarName] = useState<string>("");

  // Add a state to track loading progress for the LoadingContainer
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Hook to determine if the screen is mobile
  const isMobile = useIsMobile();

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
          facingMode: "environment", // Prefer rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
        setCameraDialogOpen(false);
        setSelectedImageDialogOpen(true); // Show image preview dialog
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
    setSelectedImageDialogOpen(true); // Show image preview dialog
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
    
    setSelectedImageDialogOpen(false); // Close the image preview
    setLoading(true);
    setLoadingDetails(true); // Show loading container
    setError(null);
    setRawApiResponse("");
    
    try {
      // Create form data for the API call
      const formData = new FormData();
      formData.append('image', selectedImage);

      // Call the first API endpoint
      const response = await fetch(`${API_BASE_URL}/get-car-name`, {
        method: 'POST',
        body: formData
      });
      
      // Get the raw text response first
      const rawText = await response.text();
      setRawApiResponse(rawText);
      
      console.log("Raw API response text:", rawText);
      
      // Try to parse using our helper function
      let data;
      try {
        data = extractJSON(rawText);
        console.log("Extracted JSON data:", data);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        setShowRawApiResponse(true);
        throw new Error("Failed to parse response from server. See raw response for details.");
      }

      // Log the API response to console
      console.log("Car identification API response:", data);

      // Store raw API response for popup
      setApiResponseData(data);

      // Store the full car name from API - handle undefined case
      const carName = data.car_name || "";
      setIdentifiedCarName(carName);

      // Extract make and model from car_name
      const nameParts = (carName || "").split(" ");
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
      
      // Open the year input dialog
      setYearInputDialogOpen(true);
      
    } catch (error: any) {
      console.error('Error identifying car:', error);
      setError(error.message || "Failed to identify car");
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      setShowRawApiResponse(true);
    } finally {
      setLoading(false);
      setLoadingDetails(false);
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
    
    setYearInputDialogOpen(false); // Close the year input dialog
    setLoading(true);
    setLoadingDetails(true); // Show the loading container with longer duration
    setError(null);
    setRawApiResponse("");
    
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
      
      // Get the raw text response
      const rawText = await response.text();
      setRawApiResponse(rawText);
      
      // Try to parse with our helper function
      let data;
      try {
        data = extractJSON(rawText);
        console.log("Extracted car details JSON data:", data);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        setShowRawApiResponse(true);
        throw new Error("Failed to parse response from server. See raw response for details.");
      }

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
      
      // Start showing categories one by one
      setCurrentEditingCategory(FEATURE_CATEGORIES[0]);
      
    } catch (error: any) {
      console.error('Error getting car details:', error);
      setError(error.message || "Failed to get car details");
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      setShowRawApiResponse(true);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLoadingDetails(false); // Hide the loading container after a brief delay
        setActiveTab("car-details");
      }, 1000);
    }
  };

  // Move to next category in the features editing flow
  const moveToNextCategory = () => {
    if (!currentEditingCategory) return;
    
    const currentIndex = FEATURE_CATEGORIES.indexOf(currentEditingCategory);
    if (currentIndex < FEATURE_CATEGORIES.length - 1) {
      setCurrentEditingCategory(FEATURE_CATEGORIES[currentIndex + 1]);
    } else {
      setCurrentEditingCategory(null);
      setActiveTab("car-details");
    }
  };

  // Check if a category exists in the features
  const hasFeatureCategory = (category: string) => {
    if (!carDetails?.features) return false;
    return !!carDetails.features[category] && carDetails.features[category].length > 0;
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
            if (featureCount < 12) { // Limit to 12 total features
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

  // NEW FUNCTION: Upload image to Supabase storage
  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `car_listings/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('car_images')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }
      
      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('car_images')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error in uploadImageToSupabase:', error);
      toast({
        title: "Image Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
      return null;
    }
  };

  // NEW FUNCTION: Submit car listing directly to Supabase
  const submitCarListing = async () => {
    if (!carDetails || !carIdentification || !modelYear || !user || !price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: "Missing Information",
        description: "Please provide all required information including a valid price",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Upload the image to Supabase storage
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImageToSupabase(selectedImage);
        if (!imageUrl) {
          throw new Error("Failed to upload image");
        }
      }
      
      // Extract field values with better fallbacks
      const specs = carDetails.specifications || {};
      
      // Extract fields from specifications
      const bodyType = specs["Body style"] || specs["Body Style"] || specs["Body Type"] || "";
      const transmission = specs["Transmission"] || "";
      const fuelType = specs["Fuel Type"] || specs["Engine"] || specs["Fuel type"] || "";
      const color = specs["Color"] || specs["Exterior Color"] || specs["colour"] || specs["Colour"] || "";
      const mileage = specs["Mileage"] || specs["Odometer"] || specs["Kilometers"] || "";
      
      // Format features as JSONB
      const featuresObject = carDetails.features || {};
      
      // Generate a well-formatted description
      const description = generateDescription(carDetails.specifications, carDetails.tags);
      
      // Prepare the listing data
      const listingData = {
        user_id: user.id,
        title: carDetails.car_name || `${carIdentification.make} ${carIdentification.model} ${modelYear}`,
        make: carIdentification.make,
        model: carIdentification.model,
        year: parseInt(modelYear),
        price: parseFloat(price),
        mileage: mileage ? parseInt(mileage) : null,
        body_type: bodyType || null,
        transmission: transmission || null,
        fuel_type: fuelType || null,
        color: color || null,
        description: description,
        features: featuresObject, // Store as JSONB
        images: imageUrl ? [imageUrl] : [],
        car_name: carDetails.car_name || `${carIdentification.make} ${carIdentification.model} ${modelYear}`,
        status: 'pending', // Default status for new listings
        contact_email: user.email || null,
        location: null // Can be updated later
      };
      
      console.log("Submitting car listing to Supabase:", listingData);
      
      // Insert the listing into Supabase
      const { data: newListing, error } = await supabase
        .from('car_listings')
        .insert(listingData)
        .select()
        .single();
        
      if (error) {
        console.error("Error inserting car listing:", error);
        throw new Error(`Failed to create listing: ${error.message}`);
      }
      
      console.log("Listing created successfully:", newListing);
      
      // Store the created listing ID and open success dialog
      setCreatedListingId(newListing.id);
      setCreationSuccessDialogOpen(true);
      
      // Show success notification with action button
      toast({
        title: "Listing Created Successfully",
        description: "Your car listing has been created",
        variant: "success",
        action: {
          label: "View Listing",
          onClick: () => {
            navigate(`/listing/${newListing.id}`);
          },
        }
      });
      
    } catch (error: any) {
      console.error("Error submitting car listing:", error);
      toast({
        title: "Error Creating Listing",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
        duration: 7000
      });
      setError(error.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
      setPriceDialogOpen(false);
    }
  };

  // NEW FUNCTION: Start the submission process
  const startSubmission = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a listing",
        variant: "destructive"
      });
      navigate('/auth', { state: { returnTo: '/snap-ai' } });
      return;
    }
    
    // Open the price dialog to get price input from user
    setPriceDialogOpen(true);
  };

  // Toggle raw API response visibility
  const toggleRawApiResponse = () => {
    setShowRawApiResponse(!showRawApiResponse);
  };

  // Add the missing createListing function
  const createListing = () => {
    if (!carDetails || !carIdentification || !modelYear) {
      toast({
        title: "Missing information",
        description: "Cannot create listing without car details",
        variant: "destructive"
      });
      return;
    }

    // Format the data to pass to the AddListing page
    const formattedData = {
      make: carIdentification.make,
      model: carIdentification.model,
      year: modelYear,
      features: carDetails.features,
      specifications: carDetails.specifications,
      carName: carDetails.car_name || identifiedCarName,
      imageFile: selectedImage
    };

    // Navigate to the AddListing page with the car details
    navigate('/add-listing', { 
      state: { 
        carData: formattedData,
        imagePreviewUrl: imagePreviewUrl
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">From snap to sale—AI-powered car selling, simplified.</h1>
          
          {/* Show the LoadingContainer when loadingDetails is true */}
          <LoadingContainer 
            isLoading={loadingDetails} 
            duration={15000} 
          />
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              {rawApiResponse && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleRawApiResponse} 
                  className="mt-2"
                >
                  {showRawApiResponse ? 'Hide' : 'Show'} Raw API Response
                  <Code className="ml-2 h-4 w-4" />
                </Button>
              )}
            </Alert>
          )}
          
          {/* Raw API Response Display */}
          {showRawApiResponse && rawApiResponse && (
            <div className="mb-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">Raw API Response</h3>
                  <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm whitespace-pre-wrap">{rawApiResponse}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Car Details Results */}
            <TabsContent value="car-details" className="space-y-6">
              {carDetails && (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">{carDetails.car_name || identifiedCarName}</h2>
                      <p className="text-gray-600">
                        Complete car details retrieved
                      </p>
                    </div>
                    
                    {/* Button to view raw API response */}
                    {rawApiResponse && (
                      <div className="flex justify-center">
                        <Button 
                          variant="outline" 
                          onClick={() => toggleRawApiResponse()} 
                          className="mb-4"
                        >
                          {showRawApiResponse ? 'Hide' : 'Show'} Raw API Response
                          <Code className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Features Section - Organized by category */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Display features organized by categories from the API */}
                        {FEATURE_CATEGORIES.map(category => 
                          hasFeatureCategory(category) && (
                            <div key={category} className="border rounded-md p-4">
                              <h4 className="font-medium mb-2">{category}</h4>
                              <ul className="space-y-1">
                                {carDetails.features[category]?.map((item, index) => (
                                  <li key={index} className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    
                    {/* Specifications Section */}
                    {Object.keys(carDetails.specifications).length > 0 && (
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
                    )}
                    
                    {/* Tags Section */}
                    {carDetails.tags && carDetails.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {carDetails.tags.map((tag, index) => (
                            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                              {tag}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description Preview */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Generated Description</h3>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <pre className="whitespace-pre-wrap text-sm">
                          {generateDescription(carDetails.specifications, carDetails.tags)}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                      {/* Create listing button (navigates to AddListing) */}
                      <Button 
                        variant="outline" 
                        onClick={() => createListing()} 
                        className="order-2 sm:order-1"
                      >
                        Create Listing Manually
                      </Button>
                      
                      {/* New Direct Submit button */}
                      <Button 
                        onClick={startSubmission} 
                        className="bg-[#007ac8] hover:bg-[#0069b4] order-1 sm:order-2"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Listing Now"
                        )}
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
            
            {error && (
              <Alert variant="destructive" className="mb-4 w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
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

      {/* Selected Image Dialog */}
      <Dialog open={selectedImageDialogOpen} onOpenChange={setSelectedImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Image</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            {imagePreviewUrl && (
              <img 
                src={imagePreviewUrl} 
                alt="Car Preview" 
                className="w-full max-h-[300px] object-contain border rounded-md mb-4" 
              />
            )}
            
            <div className="flex justify-center gap-4 w-full">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreviewUrl('');
                  setSelectedImageDialogOpen(false);
                }}
              >
                Remove
              </Button>
              <Button 
                onClick={identifyCar} 
                className="bg-[#007ac8] hover:bg-[#0069b4]" 
                disabled={loading}
              >
                {loading ? 'Identifying...' : 'Identify Car'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Year Input Dialog */}
      <Dialog open={yearInputDialogOpen} onOpenChange={setYearInputDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Car Identified</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {carIdentification && (
              <>
                <div className="text-center mb-2">
                  <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                    <Check className="h-4 w-4" />
                    <span>
                      {carIdentification.confidence === 'high' ? 'High confidence match' : 'Possible match'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="car_name">Identified Car</Label>
                  <Input 
                    id="car_name" 
                    value={identifiedCarName} 
                    readOnly 
                    className="bg-gray-50 font-medium text-center" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="year">Model Year</Label>
                  <Input 
                    id="year" 
                    value={modelYear} 
                    onChange={e => setModelYear(e.target.value)} 
                    placeholder="Enter year (e.g., 2022)" 
                    pattern="\\d{4}" 
                    maxLength={4} 
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the model year to get detailed specifications
                  </p>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={getCarDetails} 
                    disabled={!modelYear || loading} 
                    className="bg-[#007ac8] hover:bg-[#0069b4]"
                  >
                    {loading ? 'Loading...' : 'Get Car Details'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* NEW: Price Input Dialog */}
      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Asking Price</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input 
                id="price" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                placeholder="Enter price" 
                type="number"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter your asking price for the vehicle
              </p>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <Button 
                variant="outline"
                onClick={() => setPriceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={submitCarListing} 
                disabled={!price || submitting} 
                className="bg-[#007ac8] hover:bg-[#0069b4]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Listing...
                  </>
                ) : (
                  "Create Listing"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Editing - Using Drawer with sticky footer on mobile, Sheet on desktop */}
      {isMobile ? (
        <Drawer open={!!currentEditingCategory} onOpenChange={(open) => {
          if (!open) setCurrentEditingCategory(null);
        }}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit {currentEditingCategory} Features</DrawerTitle>
              <DrawerDescription>
                Review and customize the features for this category
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="px-4 overflow-y-auto flex-1 pb-[88px]">
              {carDetails && currentEditingCategory && (
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-3">{currentEditingCategory}</h4>
                    <ul className="space-y-2">
                      {(carDetails.features[currentEditingCategory] || []).map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Progress indicator showing which category we're on */}
                  <div className="text-center text-sm text-gray-500">
                    Category {FEATURE_CATEGORIES.indexOf(currentEditingCategory) + 1} of {FEATURE_CATEGORIES.length}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sticky drawer footer with navigation buttons */}
            <DrawerFooter className="fixed inset-x-0 bottom-0 bg-background border-t">
              <div className="flex justify-between w-full">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentEditingCategory(null)}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Skip All
                </Button>
                
                <Button 
                  onClick={moveToNextCategory} 
                  className="bg-[#007ac8] hover:bg-[#0069b4] flex items-center gap-1"
                >
                  Next Category
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet 
          open={!!currentEditingCategory} 
          onOpenChange={(open) => {
            if (!open) setCurrentEditingCategory(null);
          }}
        >
          <SheetContent className="sm:max-w-md flex flex-col">
            <SheetHeader>
              <SheetTitle>Edit {currentEditingCategory} Features</SheetTitle>
              <SheetDescription>
                Review and customize the features for this category
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 flex-1 overflow-y-auto">
              {carDetails && currentEditingCategory && (
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-3">{currentEditingCategory}</h4>
                    <ul className="space-y-2">
                      {(carDetails.features[currentEditingCategory] || []).map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Progress indicator showing which category we're on */}
                  <div className="text-center text-sm text-gray-500">
                    Category {FEATURE_CATEGORIES.indexOf(currentEditingCategory) + 1} of {FEATURE_CATEGORIES.length}
                  </div>
                </div>
              )}
            </div>
            
            {/* Fixed actions at bottom */}
            <div className="mt-auto border-t pt-4 sticky bottom-0 bg-background">
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentEditingCategory(null)}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Skip All
                </Button>
                
                <Button 
                  onClick={moveToNextCategory} 
                  className="bg-[#007ac8] hover:bg-[#0069b4] flex items-center gap-1"
                >
                  Next Category
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* NEW: Listing Creation Success Dialog */}
      <Dialog open={creationSuccessDialogOpen} onOpenChange={setCreationSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Listing Created Successfully!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription>
                Your car listing has been created and is pending review.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                You can view your listing or go to your dashboard to manage all your listings.
              </p>
              
              <div className="flex gap-3 mt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCreationSuccessDialogOpen(false);
                    navigate('/dashboard');
                  }}
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={() => {
                    setCreationSuccessDialogOpen(false);
                    navigate(`/listing/${createdListingId}`);
                  }}
                  className="bg-[#007ac8] hover:bg-[#0069b4] flex-1"
                >
                  View Listing
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SnapAI;
