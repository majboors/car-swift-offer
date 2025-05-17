import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowRight, ArrowLeft, Check, Camera } from 'lucide-react';
import TrustedBanner from '@/components/TrustedBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import PackageSelection from '@/components/PackageSelection';
import SnapAIPromotionDialog from '@/components/SnapAIPromotionDialog';

// Feature categories and options
const featureCategories = {
  'Audio, Visual & Communication': [
    'AM/FM Radio', 'Bluetooth', 'CD Player', 'DAB Radio', 'Navigation System', 
    'Smartphone Integration', 'Sound System', 'USB Port', 'Apple CarPlay', 'Android Auto'
  ],
  'Comfort & Convenience': [
    'Air Conditioning', 'Automatic Climate Control', 'Cruise Control', 'Electric Parking Brake',
    'Heated Steering Wheel', 'Keyless Entry', 'Push Button Start', 'Rain-sensing Wipers', 
    'Remote Boot/Hatch Release', 'Wireless Phone Charging'
  ],
  'Factory fitted': [
    'Alloy Wheels', 'Sunroof/Panoramic Roof', 'Tow Bar', 'Roof Rails'
  ],
  'Interior': [
    'Adjustable Steering Column', 'Cup Holders', 'Front Center Armrest', 
    'Leather Steering Wheel', 'Split Rear Seats'
  ],
  'Lights & Windows': [
    'Adaptive Headlights', 'Automatic Headlights', 'Daytime Running Lights',
    'Electric Windows', 'Fog Lights', 'LED Headlights', 'Tinted Windows'
  ],
  'Safety & Security': [
    'ABS', 'Airbags', 'Alarm', 'Central Locking', 'Electronic Stability Control', 
    'Immobilizer', 'ISOFIX', 'Lane Departure Warning', 'Parking Sensors', 
    'Reversing Camera', 'Traction Control'
  ],
  'Seating': [
    'Electric Seats', 'Heated Seats', 'Isofix Anchor Points', 'Leather Seats', 
    'Memory Seats', 'Ventilated Seats'
  ]
};

// Transmission options with case-insensitive mapping
const transmissionOptions = [
  { value: 'Automatic', display: 'Automatic' },
  { value: 'Manual', display: 'Manual' },
  { value: 'CVT', display: 'CVT' },
  { value: 'Semi-Automatic', display: 'Semi-Automatic' },
  { value: 'PDK', display: 'PDK (Porsche Dual-Clutch)' },
  { value: 'DCT', display: 'DCT (Dual-Clutch)' },
  { value: 'Automated Manual', display: 'Automated Manual' }
];

// Fuel type options with case-insensitive mapping
const fuelTypeOptions = [
  { value: 'Petrol', display: 'Petrol' },
  { value: 'Diesel', display: 'Diesel' },
  { value: 'Hybrid', display: 'Hybrid' },
  { value: 'Electric', display: 'Electric' },
  { value: 'LPG', display: 'LPG' },
  { value: 'CNG', display: 'CNG' },
  { value: 'Hydrogen', display: 'Hydrogen' }
];

// Body type options with case-insensitive mapping
const bodyTypeOptions = [
  { value: 'Sedan', display: 'Sedan' },
  { value: 'Hatchback', display: 'Hatchback' },
  { value: 'SUV', display: 'SUV' },
  { value: 'Wagon', display: 'Wagon' },
  { value: 'Coupe', display: 'Coupe' },
  { value: 'Convertible', display: 'Convertible' },
  { value: 'Fastback', display: 'Fastback' },
  { value: 'Ute', display: 'Ute' },
  { value: 'Van', display: 'Van' },
  { value: 'Truck', display: 'Truck' }
];

// Helper function to find best match option based on input string
const findBestMatchOption = (input: string | undefined, options: { value: string; display: string }[]): string => {
  if (!input) return '';
  
  // Direct match (case-insensitive)
  const directMatch = options.find(
    opt => opt.value.toLowerCase() === input.toLowerCase()
  );
  if (directMatch) return directMatch.value;
  
  // Partial match (contains)
  const partialMatch = options.find(
    opt => opt.value.toLowerCase().includes(input.toLowerCase()) ||
           input.toLowerCase().includes(opt.value.toLowerCase())
  );
  if (partialMatch) return partialMatch.value;
  
  // No match
  return input;
};

// Helper function to extract features from description or other properties
const extractFeaturesFromText = (text: string | undefined, categories: Record<string, string[]>): Record<string, string[]> => {
  if (!text) return {};
  
  const result: Record<string, string[]> = {};
  
  // For each category, check if any of its features are mentioned in the text
  Object.entries(categories).forEach(([category, features]) => {
    const foundFeatures = features.filter(feature => 
      text.toLowerCase().includes(feature.toLowerCase())
    );
    
    if (foundFeatures.length > 0) {
      result[category] = foundFeatures;
    }
  });
  
  return result;
};

// Helper function to decode URL parameter safely
const getUrlParam = (params: URLSearchParams, name: string): string => {
  try {
    const value = params.get(name);
    return value ? decodeURIComponent(value) : '';
  } catch (e) {
    console.error(`Error decoding URL parameter: ${name}`, e);
    return '';
  }
};

const AddListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState<string>("details");
  
  // Add new states for package selection
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedPackageLevel, setSelectedPackageLevel] = useState<number>(0);
  
  // Parse URL parameters - Enhanced to handle more parameters
  const queryParams = new URLSearchParams(location.search);
  
  // Use safe parameter extraction to avoid decoding errors
  const makeParam = getUrlParam(queryParams, 'make');
  const modelParam = getUrlParam(queryParams, 'model');
  const titleParam = getUrlParam(queryParams, 'title');
  const yearParam = getUrlParam(queryParams, 'year');
  const bodyTypeParam = getUrlParam(queryParams, 'body_type');
  const transmissionParam = getUrlParam(queryParams, 'transmission');
  const fuelTypeParam = getUrlParam(queryParams, 'fuel_type');
  const colorParam = getUrlParam(queryParams, 'color');
  const featuresCountParam = getUrlParam(queryParams, 'features_count');
  
  // Log URL parameters for debugging
  console.log("URL parameters:", { 
    make: makeParam, 
    model: modelParam, 
    title: titleParam, 
    year: yearParam,
    bodyType: bodyTypeParam,
    transmission: transmissionParam,
    fuelType: fuelTypeParam,
    color: colorParam,
    featuresCount: featuresCountParam
  });
  
  // Get state from navigation if available
  const locationState = location.state as any;
  
  const [formData, setFormData] = useState({
    car_name: titleParam || '',
    title: titleParam || '',
    make: makeParam || '',
    model: modelParam || '',
    year: parseInt(yearParam) || new Date().getFullYear(),
    price: '',
    mileage: '',
    color: colorParam || locationState?.color || '',
    transmission: transmissionParam || locationState?.transmission || '',
    fuel_type: fuelTypeParam || locationState?.fuelType || locationState?.fuel_type || '',
    body_type: bodyTypeParam || locationState?.bodyType || locationState?.body_type || '',
    description: locationState?.description || '',
    location: '',
    contact_email: '',
    contact_phone: '',
  });
  
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submittedListingId, setSubmittedListingId] = useState<string | null>(null);
  
  useEffect(() => {
    console.log("AddListing component mounted, locationState:", locationState);
    console.log("URL params processed:", {
      makeParam, modelParam, titleParam, yearParam,
      bodyTypeParam, transmissionParam, fuelTypeParam, colorParam
    });
    
    // Wait for auth to finish loading before checking
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add a listing.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    // Only update form data if user exists
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        contact_email: user.email || '',
      }));
      
      console.log("User authenticated:", user.id);
    }
    
    // Set active tab to details when component mounts
    setActiveTab("details");
    
    // Process data from either URL parameters or location state
    // Always prefer URL parameters first (they're more reliable when sharing links)
    const processData = () => {
      // Create combined data source prioritizing URL params over state
      const dataSource = {
        make: makeParam || locationState?.make || '',
        model: modelParam || locationState?.model || '',
        title: titleParam || locationState?.title || locationState?.car_name || '',
        car_name: titleParam || locationState?.car_name || locationState?.title || '',
        year: yearParam ? parseInt(yearParam) : locationState?.year || new Date().getFullYear(),
        body_type: bodyTypeParam || locationState?.bodyType || locationState?.body_type || '',
        transmission: transmissionParam || locationState?.transmission || '',
        fuel_type: fuelTypeParam || locationState?.fuelType || locationState?.fuel_type || '',
        color: colorParam || locationState?.color || '',
        description: locationState?.description || '',
        features: locationState?.features || {},
        specifications: locationState?.specifications || {},
        mileage: locationState?.mileage || '',
      };
      
      console.log("Combined data source:", dataSource);
      
      // Extract features from location state or try from description
      if (dataSource.features && Object.keys(dataSource.features).length > 0) {
        console.log("Features from data source:", dataSource.features);
        setSelectedFeatures(dataSource.features);
      } else if (dataSource.description) {
        // Try to extract features from description if no features are provided
        const extractedFeatures = extractFeaturesFromText(dataSource.description, featureCategories);
        if (Object.keys(extractedFeatures).length > 0) {
          console.log("Extracted features from description:", extractedFeatures);
          setSelectedFeatures(extractedFeatures);
        }
      }
      
      // Process specifications for additional data
      const specs = dataSource.specifications || {};
      
      // Process body type
      let bodyType = dataSource.body_type;
      if (!bodyType) {
        bodyType = specs["Body style"] || specs["Body Style"] || specs["Body Type"] || specs["body type"] || '';
        // Check for partial matches in specs
        if (!bodyType) {
          for (const [key, value] of Object.entries(specs)) {
            if (key.toLowerCase().includes('body') && value) {
              bodyType = String(value);
              break;
            }
          }
        }
      }
      
      // Process transmission
      let transmission = dataSource.transmission;
      if (!transmission) {
        transmission = specs["Transmission"] || specs["transmission"] || '';
        // Look for PDK, DCT, etc. in specifications
        if (!transmission) {
          for (const [key, value] of Object.entries(specs)) {
            if (
              value && 
              typeof value === 'string' && 
              (value.toLowerCase().includes('pdk') || 
               value.toLowerCase().includes('dct') || 
               value.toLowerCase().includes('automatic') || 
               value.toLowerCase().includes('manual'))
            ) {
              transmission = String(value);
              break;
            }
          }
        }
      }
      
      // Process fuel type
      let fuelType = dataSource.fuel_type;
      if (!fuelType) {
        fuelType = specs["Fuel Type"] || specs["fuel type"] || specs["Engine"] || '';
        // Extract fuel type from engine description if needed
        if (fuelType.toLowerCase().includes('petrol')) fuelType = "Petrol";
        else if (fuelType.toLowerCase().includes('diesel')) fuelType = "Diesel";
        else if (fuelType.toLowerCase().includes('hybrid')) fuelType = "Hybrid";
        else if (fuelType.toLowerCase().includes('electric')) fuelType = "Electric";
      }
      
      // Process color
      let color = dataSource.color;
      if (!color) {
        color = specs["Color"] || specs["Exterior Color"] || specs["color"] || '';
      }

      // Process mileage (could be in km or odometer)
      let mileage = dataSource.mileage;
      if (!mileage) {
        mileage = specs["Mileage"] || specs["Odometer"] || specs["KM"] || specs["Kilometers"] || '';
        // Convert to numeric value if it's a string with units
        if (typeof mileage === 'string') {
          const numericMatch = mileage.match(/\d+/);
          if (numericMatch) {
            mileage = numericMatch[0];
          }
        }
      }

      // Map to best matching values for dropdowns
      const mappedTransmission = findBestMatchOption(transmission, transmissionOptions);
      const mappedFuelType = findBestMatchOption(fuelType, fuelTypeOptions);
      const mappedBodyType = findBestMatchOption(bodyType, bodyTypeOptions);
      
      console.log("Mapped dropdown values:", {
        transmission: mappedTransmission,
        fuelType: mappedFuelType,
        bodyType: mappedBodyType
      });
      
      // Update form data with the processed values
      setFormData(prevState => ({
        ...prevState,
        car_name: dataSource.car_name,
        title: dataSource.title,
        make: dataSource.make,
        model: dataSource.model,
        year: dataSource.year,
        price: locationState?.price || '',
        mileage: mileage || '',
        color: color,
        transmission: mappedTransmission,
        fuel_type: mappedFuelType,
        body_type: mappedBodyType,
        description: dataSource.description || '',
      }));
    };
    
    // Process data if we have params or state data
    if (makeParam || modelParam || locationState) {
      processData();
    }
    
  }, [
    user, navigate, authLoading, locationState, 
    makeParam, modelParam, titleParam, yearParam,
    bodyTypeParam, transmissionParam, fuelTypeParam, colorParam,
    featuresCountParam
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    setSelectedImages(prevImages => [...prevImages, ...files]);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
  };
  
  const removeImage = (index: number) => {
    setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };
  
  const toggleFeature = (category: string, feature: string) => {
    setSelectedFeatures(prev => {
      // Create a deep copy of the previous state to avoid mutation issues
      const newState = { ...prev };
      
      // Ensure the category exists in our state
      if (!newState[category]) {
        newState[category] = [];
      }
      
      const categoryFeatures = [...(newState[category] || [])];
      
      // Check if the feature is already selected
      const featureIndex = categoryFeatures.indexOf(feature);
      
      if (featureIndex !== -1) {
        // Remove the feature if it's already selected
        categoryFeatures.splice(featureIndex, 1);
      } else {
        // Add the feature if it's not selected
        categoryFeatures.push(feature);
      }
      
      // Update the category with the new features array
      newState[category] = categoryFeatures;
      
      return newState;
    });
  };
  
  const uploadImages = async (images: File[] = selectedImages) => {
    if (images.length === 0) return [];
    
    setUploadingImages(true);
    const imageUrls: string[] = [];
    
    try {
      for (const image of images) {
        // Limit filesize to 5MB to avoid potential size-related issues
        if (image.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `Image ${image.name} exceeds 5MB limit`,
            variant: "destructive",
          });
          continue;
        }
        
        const fileExt = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`; // Remove nested path to avoid confusion
        
        console.log(`Uploading file ${fileName} to bucket car-listings`);
        
        const { data, error: uploadError } = await supabase.storage
          .from('car-listings')
          .upload(filePath, image, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
        
        console.log('Upload successful:', data);
        
        const { data: urlData } = supabase.storage
          .from('car-listings')
          .getPublicUrl(filePath);
          
        console.log('Public URL:', urlData.publicUrl);
        imageUrls.push(urlData.publicUrl);
      }
      
      return imageUrls;
    } catch (error: any) {
      console.error('Error in uploadImages:', error);
      toast({
        title: "Error uploading images",
        description: error.message || "Failed to upload one or more images",
        variant: "destructive",
      });
      return imageUrls; // Return any successfully uploaded images
    } finally {
      setUploadingImages(false);
    }
  };
  
  const handlePackageSelect = (packageId: string, packageLevel: number) => {
    setSelectedPackageId(packageId);
    setSelectedPackageLevel(packageLevel);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add a listing.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    // Validate price is not empty
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Price required",
        description: "Please enter a valid price for your listing.",
        variant: "destructive",
      });
      setActiveTab("details");
      return;
    }

    // Validate required fields
    if (!formData.make || !formData.model) {
      toast({
        title: "Required fields missing",
        description: "Make and Model are required fields.",
        variant: "destructive",
      });
      setActiveTab("details");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Form data being submitted:", formData);
      console.log("Selected features:", selectedFeatures);
      console.log("Selected package:", selectedPackageId, selectedPackageLevel);
      
      // Upload images first
      const imageUrls = await uploadImages();
      console.log("Uploaded image URLs:", imageUrls);
      
      // Prepare features data
      const featuresData = Object.entries(selectedFeatures).reduce((acc, [category, features]) => {
        if (features.length > 0) {
          return { ...acc, [category]: features };
        }
        return acc;
      }, {});
      
      console.log("Processed features data:", featuresData);
      
      // Calculate package expiration if a package was selected
      let packageExpiresAt = null;
      let featured = false;
      let topSearch = false;
      
      if (selectedPackageId) {
        // Get package details to determine duration
        const { data: packageData } = await supabase
          .from('listing_packages')
          .select('duration_days')
          .eq('id', selectedPackageId)
          .single();
          
        if (packageData) {
          // Calculate expiration date
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + packageData.duration_days);
          packageExpiresAt = expirationDate.toISOString();
          
          // Set featured flag for package level 2 or 3
          featured = selectedPackageLevel >= 2;
          
          // Set top search flag for package level 1, 2 or 3
          topSearch = selectedPackageLevel >= 1;
        }
      }
      
      // Format the data
      const listingData = {
        user_id: user.id,
        title: formData.car_name || formData.title || `${formData.year} ${formData.make} ${formData.model}`, // Ensure title isn't empty
        car_name: formData.car_name,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year.toString()),
        price: parseFloat(formData.price),
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        color: formData.color || null,
        transmission: formData.transmission || null,
        fuel_type: formData.fuel_type || null,
        body_type: formData.body_type || null,
        description: formData.description || null,
        location: formData.location || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        features: Object.keys(featuresData).length > 0 ? featuresData : null,
        images: imageUrls,
        status: 'pending', // Set status as pending for new listings
        // Add package-related fields
        package_level: selectedPackageLevel,
        package_expires_at: packageExpiresAt,
        featured: featured,
        top_search: topSearch
      };

      console.log("Final listing data to be inserted:", listingData);
      
      // Insert the listing
      const { data, error } = await supabase
        .from('car_listings')
        .insert(listingData)
        .select('id')
        .single();
        
      if (error) throw error;

      console.log("Listing created successfully:", data);
      
      // Set submission success state
      setSubmissionSuccess(true);
      setSubmittedListingId(data.id);
      
      toast({
        title: "Success!",
        description: "Your listing has been submitted for review.",
      });
      
    } catch (error: any) {
      console.error("Error adding listing:", error);
      toast({
        title: "Error adding listing",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle proceeding to the next tab
  const handleNextStep = () => {
    if (activeTab === "details") {
      setActiveTab("features");
    } else if (activeTab === "features") {
      setActiveTab("images");
    } else if (activeTab === "images") {
      setActiveTab("packages");
    }
  };
  
  // Function to handle going back to the previous tab
  const handlePreviousStep = () => {
    if (activeTab === "features") {
      setActiveTab("details");
    } else if (activeTab === "images") {
      setActiveTab("features");
    } else if (activeTab === "packages") {
      setActiveTab("images");
    }
  };

  // Count total selected features
  const totalSelectedFeatures = Object.values(selectedFeatures).reduce(
    (total, features) => total + features.length, 
    0
  );
  
  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TrustedBanner />
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Add a success submission screen
  if (submissionSuccess) {
    return (
      <div className="flex flex-col min-h-screen">
        <TrustedBanner />
        <Navbar />
        
        <div className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Listing Submitted Successfully!</h1>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-700 mb-2">
                <strong>Your listing is now pending review.</strong>
              </p>
              <p className="text-amber-600">
                Our team will review your listing shortly. You'll be notified when your listing is approved and becomes visible to other users.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mt-8">
              {submittedListingId && (
                <Button
                  onClick={() => navigate(`/listing/${submittedListingId}`)}
                  className="bg-[#007ac8] hover:bg-[#0069b4]"
                >
                  View My Listing
                </Button>
              )}
              
              <Button
                onClick={() => {
                  // Reset form and states
                  setSubmissionSuccess(false);
                  setSubmittedListingId(null);
                  setFormData({
                    car_name: '',
                    title: '',
                    make: '',
                    model: '',
                    year: new Date().getFullYear(),
                    price: '',
                    mileage: '',
                    color: '',
                    transmission: '',
                    fuel_type: '',
                    body_type: '',
                    description: '',
                    location: '',
                    contact_email: user?.email || '',
                    contact_phone: '',
                  });
                  setSelectedImages([]);
                  setPreviewUrls([]);
                  setSelectedFeatures({});
                }}
                variant="outline"
              >
                Add Another Listing
              </Button>
              
              <Button
                onClick={() => navigate('/')}
                variant="outline"
              >
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <TrustedBanner />
      <Navbar />
      <SnapAIPromotionDialog />
      
      <div className="bg-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-lg shadow-sm p-6">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Try SnapAI - The Fastest Way to Sell Your Car</h2>
              <p className="text-gray-600 mb-4">
                Take a photo of your car and let our AI identify its make, model, and year automatically.
                Skip the manual form filling and sell your car in minutes!
              </p>
              <Button 
                onClick={() => navigate('/snap-ai')} 
                className="bg-[#007ac8] hover:bg-[#0069b4] flex items-center gap-2"
              >
                <Camera size={18} /> Try SnapAI Now
              </Button>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <img 
                src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg" 
                alt="SnapAI" 
                className="h-32 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Add a New Car Listing</h1>
            
            <Button 
              type="button" 
              onClick={handleSubmit} 
              variant="outline" 
              className="border-blue-500 text-blue-500 hover:bg-blue-100"
              disabled={loading || uploadingImages}
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Car Details</TabsTrigger>
                <TabsTrigger value="features">
                  Features {totalSelectedFeatures > 0 && `(${totalSelectedFeatures})`}
                </TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="packages">Package</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="car_name">Car Name / Title *</Label>
                        <Input
                          id="car_name"
                          name="car_name"
                          value={formData.car_name}
                          onChange={handleChange}
                          placeholder="e.g., 2019 Honda Civic Sport Turbo"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="make">Make *</Label>
                        <Input
                          id="make"
                          name="make"
                          value={formData.make}
                          onChange={handleChange}
                          placeholder="e.g., Toyota"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="model">Model *</Label>
                        <Input
                          id="model"
                          name="model"
                          value={formData.model}
                          onChange={handleChange}
                          placeholder="e.g., Camry"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="year">Year *</Label>
                        <Input
                          id="year"
                          name="year"
                          type="number"
                          value={formData.year}
                          onChange={handleChange}
                          min={1900}
                          max={new Date().getFullYear() + 1}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (AUD) *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleChange}
                          min={0}
                          step={0.01}
                          placeholder="e.g., 15000"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mileage">Mileage (km)</Label>
                        <Input
                          id="mileage"
                          name="mileage"
                          type="number"
                          value={formData.mileage}
                          onChange={handleChange}
                          min={0}
                          placeholder="e.g., 50000"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          placeholder="e.g., Silver"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="transmission">Transmission</Label>
                        <select
                          id="transmission"
                          name="transmission"
                          value={formData.transmission}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Transmission</option>
                          {transmissionOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.display}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fuel_type">Fuel Type</Label>
                        <select
                          id="fuel_type"
                          name="fuel_type"
                          value={formData.fuel_type}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Fuel Type</option>
                          {fuelTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.display}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="body_type">Body Type</Label>
                        <select
                          id="body_type"
                          name="body_type"
                          value={formData.body_type}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Body Type</option>
                          {bodyTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.display}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="e.g., Sydney, NSW"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Email</Label>
                        <Input
                          id="contact_email"
                          name="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={handleChange}
                          placeholder="Your contact email"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">Phone</Label>
                        <Input
                          id="contact_phone"
                          name="contact_phone"
                          value={formData.contact_phone}
                          onChange={handleChange}
                          placeholder="Your contact phone"
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Provide details about the car's condition, features, history, etc."
                          rows={5}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    type="button"
                    onClick={handleNextStep}
                    className="bg-[#007ac8] hover:bg-[#0069b4] px-8"
                  >
                    Next Step <ArrowRight className="ml-2" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {Object.entries(featureCategories).map(([category, features]) => (
                        <Collapsible key={category} className="border rounded-md">
                          <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-md">
                            <div className="font-medium">{category}</div>
                            <div className="text-sm text-gray-500">
                              {selectedFeatures[category]?.length || 0} selected
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {features.map((feature) => {
                                // Determine if this feature is selected
                                const isSelected = selectedFeatures[category]?.includes(feature) || false;
                                
                                return (
                                  <div 
                                    key={feature} 
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                    onClick={() => toggleFeature(category, feature)}
                                  >
                                    {/* Replace Checkbox with a custom toggle UI to avoid the issue */}
                                    <div 
                                      className={`w-4 h-4 border rounded flex items-center justify-center ${
                                        isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                                      }`}
                                    >
                                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                    </div>
                                    <Label 
                                      className="cursor-pointer"
                                    >
                                      {feature}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button 
                    type="button"
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="px-8"
                  >
                    <ArrowLeft className="mr-2" /> Back
                  </Button>
                  
                  <Button 
                    type="button"
                    onClick={handleNextStep}
                    className="bg-[#007ac8] hover:bg-[#0069b4] px-8"
                  >
                    Next Step <ArrowRight className="ml-2" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="images">Upload Images</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                          <Input
                            id="images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <Label htmlFor="images" className="cursor-pointer block">
                            <div className="space-y-2">
                              <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-500">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                              </div>
                              <div className="text-blue-500 font-medium">Click to upload</div>
                              <div className="text-sm text-gray-500">PNG, JPG up to 5MB</div>
                            </div>
                          </Label>
                        </div>
                      </div>
                      
                      {/* Preview images */}
                      {previewUrls.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-3">Selected Images</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {previewUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={url} 
                                  alt={`Preview ${index+1}`} 
                                  className="h-40 w-full object-cover rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button 
                    type="button"
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="px-8"
                  >
                    <ArrowLeft className="mr-2" /> Back
                  </Button>
                  
                  <Button 
                    type="button"
                    onClick={handleNextStep}
                    className="bg-[#007ac8] hover:bg-[#0069b4] px-8"
                  >
                    Next Step <ArrowRight className="ml-2" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="packages" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <PackageSelection 
                      onSelect={handlePackageSelect} 
                      selectedPackageId={selectedPackageId} 
                    />
                  </CardContent>
                </Card>
                
                <div className="flex justify-between mt-6">
                  <Button 
                    type="button"
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="px-8"
                  >
                    <ArrowLeft className="mr-2" /> Back
                  </Button>
                  
                  <Button 
                    type="submit"
                    disabled={loading || uploadingImages}
                    className="bg-[#007ac8] hover:bg-[#0069b4] px-8"
                  >
                    {loading || uploadingImages ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {uploadingImages ? 'Uploading Images...' : 'Submitting...'}
                      </>
                    ) : (
                      'Submit Listing'
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AddListing;
