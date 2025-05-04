import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowRight, ArrowLeft } from 'lucide-react';
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
  
  const toggleFeature = (category: string, feature: string) => {
    setSelectedFeatures(prev => {
      const categoryFeatures = prev[category] || [];
      
      if (categoryFeatures.includes(feature)) {
        return {
          ...prev,
          [category]: categoryFeatures.filter(item => item !== feature)
        };
      } else {
        return {
          ...prev,
          [category]: [...categoryFeatures, feature]
        };
      }
    });
  };
  
  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];
    
    setUploadingImages(true);
    const imageUrls: string[] = [];
    
    try {
      for (const image of selectedImages) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `car-listings/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('car-listings')
          .upload(filePath, image);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('car-listings').getPublicUrl(filePath);
        imageUrls.push(data.publicUrl);
      }
      
      return imageUrls;
    } catch (error: any) {
      toast({
        title: "Error uploading images",
        description: error.message,
        variant: "destructive",
      });
      return [];
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
    
    setLoading(true);
    
    try {
      // Upload images first
      const imageUrls = await uploadImages();
      
      // Prepare features data
      const featuresData = Object.entries(selectedFeatures).reduce((acc, [category, features]) => {
        if (features.length > 0) {
          return { ...acc, [category]: features };
        }
        return acc;
      }, {});
      
      // Format the data
      const listingData = {
        user_id: user.id,
        title: formData.car_name || formData.title, // Use car_name as title if available
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
      };
      
      // Insert the listing
      const { data, error } = await supabase
        .from('car_listings')
        .insert(listingData)
        .select('id')
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your listing has been added successfully.",
      });
      
      navigate(`/listing/${data.id}`);
    } catch (error: any) {
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

  // If not loading and no user, this will be caught by the useEffect and redirected
  
  return (
    <div className="flex flex-col min-h-screen">
      <TrustedBanner />
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Add a New Car Listing</h1>
          
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
                              {features.map((feature) => (
                                <div 
                                  key={feature} 
                                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                  onClick={() => toggleFeature(category, feature)}
                                >
                                  <Checkbox 
                                    id={`${category}-${feature}`}
                                    checked={selectedFeatures[category]?.includes(feature) || false}
                                    onCheckedChange={() => toggleFeature(category, feature)}
                                  />
                                  <Label 
                                    htmlFor={`${category}-${feature}`}
                                    className="cursor-pointer"
                                  >
                                    {feature}
                                  </Label>
                                </div>
                              ))}
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
                      <div>
                        <Label htmlFor="images" className="block mb-2">Upload Images (up to 10)</Label>
                        <Input
                          id="images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          disabled={previewUrls.length >= 10}
                          className="mt-1"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          You can upload up to 10 images. First image will be the main image.
                        </p>
                      </div>
                      
                      {previewUrls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Preview ${index}`}
                                className="w-full h-32 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/3 -translate-y-1/3"
                              >
                                &times;
                              </button>
                              {index === 0 && (
                                <span className="absolute top-0 left-0 bg-blue-500 text-white text-xs py-1 px-2 rounded-br-md">
                                  Main
                                </span>
                              )}
                            </div>
                          ))}
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
                    className="bg-[#007ac8] hover:bg-[#0069b4] px-8"
                    disabled={loading || uploadingImages}
                  >
                    {(loading || uploadingImages) ? 'Processing...' : 'Submit Listing'}
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
