
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

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
    features: string[] | null;
  }
}

const CarDetails = ({ listing }: CarDetailsProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
      <p className="text-2xl font-bold text-[#007ac8] mb-6">
        {formatCurrency(listing.price)}
      </p>
      
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
      {listing.features && Array.isArray(listing.features) && listing.features.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-3">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {listing.features.map((feature, index) => (
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
          <div className="mb-4">
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{listing.contact_phone}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDetails;
