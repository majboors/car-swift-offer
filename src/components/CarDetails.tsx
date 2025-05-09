import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, User, Package2, Badge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Badge as UIBadge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface CarDetailsProps {
  listing: {
    title: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number | null;
    color: string | null;
    transmission: string | null;
    fuel_type: string | null;
    body_type: string | null;
    description: string | null;
    location: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    features: any; // Could be string[], object, or null
    seller_name?: string; // Added seller name property
    user_id: string; // Need this to check if it's the owner's listing
    package_level?: number; // Package level
  };
  onContactClick?: () => void;
}

interface PackageInfo {
  name: string;
  level: number;
}

const CarDetails = ({ listing, onContactClick }: CarDetailsProps) => {
  const { user } = useAuth();
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  
  // Check if this is the user's own listing
  const isOwnListing = user && listing.user_id === user.id;
  
  // Add debugging logs
  console.log("CarDetails: onContactClick prop exists:", !!onContactClick);
  console.log("CarDetails: isOwnListing:", isOwnListing);
  if (user) console.log("CarDetails: user:", user.id);
  console.log("CarDetails: listing user_id:", listing.user_id);
  console.log("CarDetails: features data:", listing.features);
  console.log("CarDetails: package_level:", listing.package_level);
  
  useEffect(() => {
    // If the listing has a package level, fetch the package details
    const fetchPackageInfo = async () => {
      if (listing.package_level && listing.package_level > 0) {
        try {
          const { data, error } = await supabase
            .from('listing_packages')
            .select('name, level')
            .eq('level', listing.package_level)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setPackageInfo(data);
          }
        } catch (error) {
          console.error("Error fetching package info:", error);
        }
      }
    };
    
    fetchPackageInfo();
  }, [listing.package_level]);
  
  // Enhanced function to flatten features object into an array
  const getFeaturesList = () => {
    // Early exit if features is null, undefined, or an empty object
    if (!listing.features) return null;
    
    // Additional debugging for features
    console.log("Features type:", typeof listing.features);
    console.log("Features raw value:", listing.features);
    
    // Handle empty object case
    if (typeof listing.features === 'object' && 
        Object.keys(listing.features).length === 0) {
      console.log("Features is an empty object, returning null");
      return null;
    }

    // If features is already a flat array
    if (Array.isArray(listing.features)) {
      return listing.features.length > 0 ? listing.features : null;
    }

    // If features is an object of categories
    if (typeof listing.features === 'object') {
      try {
        // Convert from potential JSON format if it's a string
        let featuresObj = listing.features;
        
        // Handle if features is a JSON string
        if (typeof listing.features === 'string') {
          try {
            featuresObj = JSON.parse(listing.features);
            console.log("Successfully parsed features from string:", featuresObj);
          } catch (parseError) {
            console.error("Failed to parse features string:", parseError);
            // Keep original since parse failed
            featuresObj = listing.features;
          }
        }
        
        console.log("Processed features object:", featuresObj);
        
        // Handle empty object after parsing
        if (!featuresObj || Object.keys(featuresObj).length === 0) {
          console.log("Features object is empty after processing, returning null");
          return null;
        }
        
        // Flatten the object structure into a single array of features
        const allFeatures = [];
        
        // Handle if featuresObj is actually a string (shouldn't happen but just in case)
        if (typeof featuresObj === 'string') {
          return [featuresObj]; // Return as single item array
        }
        
        for (const category in featuresObj) {
          const categoryFeatures = featuresObj[category];
          console.log(`Processing category: ${category}, features:`, categoryFeatures);
          
          if (Array.isArray(categoryFeatures)) {
            // If the category contains an array of features
            allFeatures.push(...categoryFeatures);
          } else if (typeof categoryFeatures === 'string') {
            // If the category contains a single feature as string
            allFeatures.push(categoryFeatures);
          } else if (typeof categoryFeatures === 'object' && categoryFeatures !== null) {
            // If category contains nested objects (shouldn't happen normally but just in case)
            const nestedKeys = Object.keys(categoryFeatures);
            nestedKeys.forEach(key => {
              if (typeof categoryFeatures[key] === 'string') {
                allFeatures.push(categoryFeatures[key]);
              } else if (Array.isArray(categoryFeatures[key])) {
                allFeatures.push(...categoryFeatures[key]);
              }
            });
          }
        }
        
        console.log("All features flattened:", allFeatures);
        return allFeatures.length > 0 ? allFeatures : null;
      } catch (e) {
        console.error("Error processing features:", e);
        return null;
      }
    }

    return null;
  };

  const featuresList = getFeaturesList();
  console.log("Final processed features list:", featuresList);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
      <p className="text-2xl font-bold text-[#007ac8] mb-6">
        {formatCurrency(listing.price)}
      </p>
      
      {/* Package badge - show if listing has a package */}
      {packageInfo && (
        <div className="flex mb-4">
          <UIBadge 
            variant="secondary"
            className="text-sm flex items-center gap-1 bg-[#007ac8]/10 text-[#007ac8] hover:bg-[#007ac8]/20"
          >
            <Package2 className="h-3.5 w-3.5" />
            {packageInfo.name} Package
          </UIBadge>
        </div>
      )}
      
      {/* Seller information with Inquire Now button */}
      {listing.seller_name && (
        <div className="flex items-center mb-6 bg-gray-50 p-3 rounded-lg">
          <div className="bg-gray-200 rounded-full p-2 mr-3">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-grow">
            <p className="text-sm text-gray-600">Listed by</p>
            <p className="font-medium">{listing.seller_name}</p>
          </div>
          
          {/* "Inquire Now" button - only show if not owner's listing */}
          {onContactClick && (
            <Button 
              onClick={onContactClick}
              className="bg-[#007ac8] hover:bg-[#0069b4] text-white"
            >
              Inquire Now
            </Button>
          )}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-bold mb-4">Key Specifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Make</p>
            <p className="font-medium">{listing.make}</p>
          </div>
          <div>
            <p className="text-gray-600">Model</p>
            <p className="font-medium">{listing.model}</p>
          </div>
          <div>
            <p className="text-gray-600">Year</p>
            <p className="font-medium">{listing.year}</p>
          </div>
          {listing.mileage && (
            <div>
              <p className="text-gray-600">Mileage</p>
              <p className="font-medium">{listing.mileage.toLocaleString()} km</p>
            </div>
          )}
          {listing.transmission && (
            <div>
              <p className="text-gray-600">Transmission</p>
              <p className="font-medium">{listing.transmission}</p>
            </div>
          )}
          {listing.fuel_type && (
            <div>
              <p className="text-gray-600">Fuel Type</p>
              <p className="font-medium">{listing.fuel_type}</p>
            </div>
          )}
          {listing.color && (
            <div>
              <p className="text-gray-600">Color</p>
              <p className="font-medium">{listing.color}</p>
            </div>
          )}
          {listing.body_type && (
            <div>
              <p className="text-gray-600">Body Type</p>
              <p className="font-medium">{listing.body_type}</p>
            </div>
          )}
        </div>
      </div>

      {/* Features section - only show if featuresList exists and is not empty */}
      {featuresList && featuresList.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-3">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {featuresList.map((feature: string, index: number) => (
                <div key={index} className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {listing.description && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
        </div>
      )}
      
      <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Contact Information</h2>
        {listing.location && (
          <div className="mb-3">
            <p className="text-gray-600">Location</p>
            <p className="font-medium">{listing.location}</p>
          </div>
        )}
        {listing.contact_email && (
          <div className="mb-3">
            <p className="text-gray-600">Email</p>
            <p className="font-medium break-words">{listing.contact_email}</p>
          </div>
        )}
        {listing.contact_phone && (
          <div className="mb-3">
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{listing.contact_phone}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDetails;
