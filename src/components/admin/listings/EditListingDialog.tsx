
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Listing } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, X, Upload, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface EditListingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  onSave: (id: string, data: any) => Promise<void>;
}

// Utility function to convert features object to an array of strings
const flattenFeatures = (features: any): string[] => {
  if (!features) return [];
  
  // If features is already an array, return it as string array
  if (Array.isArray(features)) {
    return features.map(item => String(item));
  }
  
  // If features is a string, try to parse it
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item));
      }
      
      // If it's an object with categories
      if (typeof parsed === 'object') {
        return Object.values(parsed)
          .flat()
          .map(item => String(item));
      }
    } catch (e) {
      return [];
    }
  }
  
  // If features is an object with categories
  if (typeof features === 'object') {
    const allFeatures = Object.values(features).flat();
    return allFeatures.map(item => String(item));
  }
  
  return [];
};

export const EditListingDialog = ({ 
  isOpen, 
  onClose, 
  listing, 
  onSave 
}: EditListingDialogProps) => {
  const [featuresInput, setFeaturesInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  
  // Create a more comprehensive form object
  const [formData, setFormData] = useState<{
    title: string;
    make: string;
    model: string;
    year: string;
    price: string;
    mileage: string;
    color: string;
    transmission: string;
    fuel_type: string;
    body_type: string;
    description: string;
    location: string;
    contact_email: string;
    contact_phone: string;
  }>({
    title: "",
    make: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    color: "",
    transmission: "",
    fuel_type: "",
    body_type: "",
    description: "",
    location: "",
    contact_email: "",
    contact_phone: "",
  });

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || "",
        make: listing.make || "",
        model: listing.model || "",
        year: listing.year?.toString() || new Date().getFullYear().toString(),
        price: listing.price?.toString() || "",
        mileage: listing.mileage?.toString() || "",
        color: listing.color || "",
        transmission: listing.transmission || "",
        fuel_type: listing.fuel_type || "",
        body_type: listing.body_type || "",
        description: listing.description || "",
        location: listing.location || "",
        contact_email: listing.contact_email || "",
        contact_phone: listing.contact_phone || "",
      });
      
      // Set features as a comma-separated string for editing
      const features = flattenFeatures(listing.features);
      setFeaturesInput(features.join(', '));
      
      // Set images from listing
      if (listing.images && Array.isArray(listing.images)) {
        setImages(listing.images as string[]);
      } else {
        setImages([]);
      }
    }
  }, [listing]);

  const handleSaveChanges = async () => {
    if (!listing) return;
    
    // Parse features from comma-separated list to array
    const featuresArray = featuresInput
      .split(',')
      .map(feature => feature.trim())
      .filter(feature => feature !== '');
    
    // Prepare data for saving
    const updatedData = {
      title: formData.title,
      make: formData.make,
      model: formData.model,
      year: parseInt(formData.year),
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
      features: featuresArray.length > 0 ? featuresArray : null,
      images: images.length > 0 ? images : null,
    };
    
    await onSave(listing.id, updatedData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('car-listings')
        .upload(fileName, file);
        
      if (error) throw error;
      
      const publicUrl = `${supabase.supabaseUrl}/storage/v1/object/public/car-listings/${fileName}`;
      setImages(prev => [...prev, publicUrl]);
      toast({ title: "Success", description: "Image uploaded successfully" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to upload image",
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogDescription>
            Make changes to the car listing details below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Images Section */}
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={img} 
                    alt={`Car listing ${idx + 1}`} 
                    className="h-20 w-20 object-cover rounded-md border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex items-center justify-center h-20 w-20 border-2 border-dashed border-muted-foreground/50 rounded-md cursor-pointer hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Plus className="h-6 w-6" />
                  <span className="text-xs mt-1">Add Image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
            {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Listing title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="Price"
              />
            </div>
            
            {/* Car Details */}
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                placeholder="Car make"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Car model"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                placeholder="Car year"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage (km)</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => handleChange('mileage', e.target.value)}
                placeholder="Mileage"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="Car color"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission</Label>
              <Select 
                value={formData.transmission}
                onValueChange={(value) => handleChange('transmission', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
                  <SelectItem value="CVT">CVT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fuel_type">Fuel Type</Label>
              <Select 
                value={formData.fuel_type}
                onValueChange={(value) => handleChange('fuel_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body_type">Body Type</Label>
              <Select 
                value={formData.body_type}
                onValueChange={(value) => handleChange('body_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                  <SelectItem value="Coupe">Coupe</SelectItem>
                  <SelectItem value="Convertible">Convertible</SelectItem>
                  <SelectItem value="Wagon">Wagon</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Truck">Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-2">
            <Label htmlFor="features">Features (comma-separated)</Label>
            <Textarea
              id="features"
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
              placeholder="Feature 1, Feature 2, Feature 3..."
              rows={3}
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description"
              rows={5}
            />
          </div>
          
          {/* Location and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Location"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="Contact Email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                placeholder="Contact Phone"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
