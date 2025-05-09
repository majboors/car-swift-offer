import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import TrustedBanner from '@/components/TrustedBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';

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

const AddListing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState<string>("details");
  
  const [formData, setFormData] = useState({
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
    contact_email: '',
    contact_phone: '',
  });
  
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submittedListingId, setSubmittedListingId] = useState<string | null>(null);
  
  useEffect(() => {
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
  }, [user, navigate, authLoading]);
  
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
  
  // Fix the toggleFeature function to safely handle state updates
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
    }
  };
  
  // Function to handle going back to the previous tab
  const handlePreviousStep = () => {
    if (activeTab === "features") {
      setActiveTab("details");
    } else if (activeTab === "images") {
      setActiveTab("features");
    }
  };

  // Function to fetch placeholder images for testing
  const fetchPlaceholderImages = async () => {
    try {
      // Define placeholders to use
      const placeholderImageUrls = [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop'
      ];
      
      // Convert URLs to image files
      const imagePromises = placeholderImageUrls.map(async (url, index) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const fileName = `placeholder-${index + 1}.jpg`;
        return new File([blob], fileName, { type: 'image/jpeg' });
      });
      
      const imageFiles = await Promise.all(imagePromises);
      
      // Create object URLs for preview
      const newPreviewUrls = imageFiles.map(file => URL.createObjectURL(file));
      
      // Set the fetched images and preview URLs
      setSelectedImages(imageFiles);
      setPreviewUrls(newPreviewUrls);
      
      return imageFiles;
    } catch (error) {
      console.error('Error fetching placeholder images:', error);
      toast({
        title: "Error loading test images",
        description: "Could not fetch placeholder images for testing.",
        variant: "destructive",
      });
      return [];
    }
  };
  
  // Function to populate test data
  const populateTestData = () => {
    // Populate form data with test values
    setFormData({
      car_name: '2022 Tesla Model 3 Long Range',
      title: '2022 Tesla Model 3 Long Range - Excellent Condition',
      make: 'Tesla',
      model: 'Model 3',
      year: 2022,
      price: '49990',
      mileage: '15000',
      color: 'Midnight Silver',
      transmission: 'Automatic',
      fuel_type: 'Electric',
      body_type: 'Sedan',
      description: 'This Tesla Model 3 Long Range is in excellent condition with only 15,000 km. Features include Autopilot, premium interior, and glass roof. Full service history available. Car is located in Sydney and available for inspection.',
      location: 'Sydney, NSW',
      contact_email: user?.email || 'test@example.com',
      contact_phone: '0412345678',
    });
    
    console.log("Test data populated:", formData);
    
    // Select some features for testing
    setSelectedFeatures({
      'Audio, Visual & Communication': ['Bluetooth', 'Navigation System', 'Smartphone Integration', 'USB Port', 'Apple CarPlay', 'Android Auto'],
      'Comfort & Convenience': ['Automatic Climate Control', 'Cruise Control', 'Electric Parking Brake', 'Keyless Entry', 'Push Button Start'],
      'Interior': ['Adjustable Steering Column', 'Cup Holders', 'Front Center Armrest', 'Leather Steering Wheel'],
      'Safety & Security': ['ABS', 'Airbags', 'Electronic Stability Control', 'Lane Departure Warning', 'Parking Sensors', 'Reversing Camera'],
      'Seating': ['Electric Seats', 'Heated Seats', 'Leather Seats']
    });
    
    console.log("Test features populated:", selectedFeatures);
  };
  
  // Function to handle the test submission
  const handleTestSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the test feature.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    setLoading(true);
    
    try {
      // Populate test data first - this will update state but won't be immediately available
      populateTestData();
      
      // Instead of relying on the state update from populateTestData,
      // we'll create the features object directly here
      const testFeatures = {
        'Audio, Visual & Communication': ['Bluetooth', 'Navigation System', 'Smartphone Integration', 'USB Port', 'Apple CarPlay', 'Android Auto'],
        'Comfort & Convenience': ['Automatic Climate Control', 'Cruise Control', 'Electric Parking Brake', 'Keyless Entry', 'Push Button Start'],
        'Interior': ['Adjustable Steering Column', 'Cup Holders', 'Front Center Armrest', 'Leather Steering Wheel'],
        'Safety & Security': ['ABS', 'Airbags', 'Electronic Stability Control', 'Lane Departure Warning', 'Parking Sensors', 'Reversing Camera'],
        'Seating': ['Electric Seats', 'Heated Seats', 'Leather Seats']
      };
      
      console.log("Direct test features object:", testFeatures);
      
      // Fetch placeholder images
      const testImages = await fetchPlaceholderImages();
      console.log("Test images fetched:", testImages.length);
      
      // Upload images
      const imageUrls = await uploadImages(testImages);
      console.log("Test images uploaded:", imageUrls);
      
      // Format the listing data using our direct features object, not relying on state
      const listingData = {
        user_id: user.id,
        title: '2022 Tesla Model 3 Long Range - Excellent Condition',
        car_name: '2022 Tesla Model 3 Long Range',
        make: 'Tesla',
        model: 'Model 3',
        year: 2022,
        price: 49990, 
        mileage: 15000,
        color: 'Midnight Silver',
        transmission: 'Automatic',
        fuel_type: 'Electric',
        body_type: 'Sedan',
        description: 'This Tesla Model 3 Long Range is in excellent condition with only 15,000 km. Features include Autopilot, premium interior, and glass roof. Full service history available. Car is located in Sydney and available for inspection.',
        location: 'Sydney, NSW',
        contact_email: user?.email || 'test@example.com',
        contact_phone: '0412345678',
        features: testFeatures, // Using our direct features object
        images: imageUrls,
        status: 'pending', // Set status as pending for test listings
      };
      
      console.log("Final test listing data with features:", listingData);
      console.log("Features object structure:", JSON.stringify(listingData.features, null, 2));
      
      // Insert the listing
      const { data, error } = await supabase
        .from('car_listings')
        .insert(listingData)
        .select('id')
        .single();
        
      if (error) {
        console.error("Error inserting test listing:", error);
        throw error;
      }
      
      console.log("Test listing created successfully:", data);
      
      // Set submission success state
      setSubmissionSuccess(true);
      setSubmittedListingId(data.id);
      
      toast({
        title: "Test Listing Created!",
        description: "Your test listing has been submitted for review.",
      });
      
    } catch (error: any) {
      console.error("Error adding test listing:", error);
      toast({
        title: "Error adding test listing",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Add a New Car Listing</h1>
            
            <Button 
              type="button" 
              onClick={handleTestSubmit} 
              variant="outline" 
              className="border-blue-500 text-blue-500 hover:bg-blue-100"
              disabled={loading || uploadingImages}
            >
              {loading ? 'Creating Test...' : 'Create Test Listing'}
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Car Details</TabsTrigger>
                <TabsTrigger value="features">
                  Features {totalSelectedFeatures > 0 && `(${totalSelectedFeatures})`}
                </TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
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
                          <option value="Automatic">Automatic</option>
                          <option value="Manual">Manual</option>
                          <option value="CVT">CVT</option>
                          <option value="Semi-Automatic">Semi-Automatic</option>
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
                          <option value="Petrol">Petrol</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Electric">Electric</option>
                          <option value="LPG">LPG</option>
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
                          <option value="Sedan">Sedan</option>
                          <option value="Hatchback">Hatchback</option>
                          <option value="SUV">SUV</option>
                          <option value="Wagon">Wagon</option>
                          <option value="Coupe">Coupe</option>
                          <option value="Convertible">Convertible</option>
                          <option value="Ute">Ute</option>
                          <option value="Van">Van</option>
                          <option value="Truck">Truck</option>
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
