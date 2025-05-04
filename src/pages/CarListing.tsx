
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import TrustedBanner from '@/components/TrustedBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface CarListing {
  id: string;
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
  images: string[];
  created_at: string;
}

const CarListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data, error } = await supabase
          .from('car_listings')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setListing(data as CarListing);
        } else {
          toast({
            title: "Listing not found",
            description: "The requested car listing could not be found.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error loading listing",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TrustedBanner />
        <Navbar />
        <div className="flex-grow flex justify-center items-center p-10">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col min-h-screen">
        <TrustedBanner />
        <Navbar />
        <div className="flex-grow flex justify-center items-center p-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
            <p className="mb-6">The car listing you're looking for doesn't exist or has been removed.</p>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
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
        <Link to="/" className="text-[#007ac8] hover:text-[#0069b4] flex items-center mb-6">
          &larr; Back to listings
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image gallery */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <div className="relative aspect-w-16 aspect-h-9 bg-gray-100">
              {listing.images && listing.images.length > 0 ? (
                <img 
                  src={listing.images[activeImageIndex]} 
                  alt={listing.title}
                  className="w-full h-[400px] object-cover" 
                />
              ) : (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
            
            {listing.images && listing.images.length > 1 && (
              <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
                {listing.images.map((image, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-20 overflow-hidden rounded ${
                      index === activeImageIndex ? 'ring-2 ring-[#007ac8]' : ''
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${listing.title} - image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Listing details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <p className="text-2xl font-bold text-[#007ac8] mb-6">
              {formatCurrency(listing.price)}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
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
              
              <Button className="w-full bg-[#007ac8] hover:bg-[#0069b4]">
                Contact Seller
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CarListingPage;
