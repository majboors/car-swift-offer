
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import TrustedBanner from '@/components/TrustedBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { v4 as uuidv4 } from 'uuid';

const AddListing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
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
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        setFormData(prevState => ({
          ...prevState,
          contact_email: data.session.user.email || '',
        }));
      } else {
        toast({
          title: "Authentication required",
          description: "Please log in to add a listing.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };
    
    checkUser();
  }, [navigate]);
  
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
      
      // Format the data
      const listingData = {
        user_id: user.id,
        title: formData.title,
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <TrustedBanner />
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Add a New Car Listing</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Car Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., 2019 Honda Civic in Excellent Condition"
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
              </div>
              
              <div className="mt-4 space-y-2">
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
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Images</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="images">Upload Images (up to 10)</Label>
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
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
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
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#007ac8] hover:bg-[#0069b4] px-8"
                disabled={loading || uploadingImages}
              >
                {(loading || uploadingImages) ? 'Processing...' : 'Submit Listing'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AddListing;
