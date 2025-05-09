
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, User, MessageSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  };
  onContactClick?: () => void;
}

const CarDetails = ({ listing, onContactClick }: CarDetailsProps) => {
  const { user } = useAuth();
  
  // Check if this is the user's own listing
  const isOwnListing = user && listing.user_id === user.id;
  
  // Function to flatten features object into an array if needed
  const getFeaturesList = () => {
    if (!listing.features) return null;

    // Check if features is already an array
    if (Array.isArray(listing.features)) {
      return listing.features;
    }

    // If features is an object of categories, flatten it
    if (typeof listing.features === 'object') {
      try {
        // Try to convert from potential JSON format or object of categories
        const featuresObj = typeof listing.features === 'string' 
          ? JSON.parse(listing.features) 
          : listing.features;
        
        // If it's an object with categories as keys and arrays as values
        if (Object.keys(featuresObj).length > 0) {
          return Object.values(featuresObj).flat();
        }
      } catch (e) {
        console.error("Error parsing features:", e);
      }
    }

    return null;
  };

  const featuresList = getFeaturesList();
  
  // Handle button click for anonymous users
  const handleInquiryClick = () => {
    if (!user && onContactClick) {
      // Redirect to auth page if user is not logged in
      window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
    } else if (onContactClick) {
      // Execute onContactClick if user is logged in
      onContactClick();
    }
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
      <p className="text-2xl font-bold text-[#007ac8] mb-6">
        {formatCurrency(listing.price)}
      </p>
      
      {/* Seller information - New section */}
      {listing.seller_name && (
        <div className="flex items-center mb-6 bg-gray-50 p-3 rounded-lg">
          <div className="bg-gray-200 rounded-full p-2 mr-3">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-grow">
            <p className="text-sm text-gray-600">Listed by</p>
            <p className="font-medium">{listing.seller_name}</p>
          </div>
          
          {/* "Inquire Now" button - the only button in seller info section */}
          {!isOwnListing && (
            <Button 
              onClick={handleInquiryClick}
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

      {/* Features section */}
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
