import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import TrustedBanner from '@/components/TrustedBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import CarDetails from '@/components/CarDetails';

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
  features: string[] | null;
}

const CarListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<boolean[]>([]);

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
          console.log("Fetched listing data:", data);
          setListing(data as CarListing);
          
          // Initialize image load error array
          if (data.images && Array.isArray(data.images)) {
            setImageLoadErrors(new Array(data.images.length).fill(false));
          }
        } else {
          toast({
            title: "Listing not found",
            description: "The requested car listing could not be found.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error loading listing:", error);
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

  const handleImageError = (index: number) => {
    console.log(`Image at index ${index} failed to load`);
    setImageLoadErrors(prev => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

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
              {listing?.images && listing.images.length > 0 ? (
                <img 
                  src={listing.images[activeImageIndex]} 
                  alt={listing.title}
                  className="w-full h-[400px] object-cover"
                  onError={() => handleImageError(activeImageIndex)}
                  style={{ 
                    display: imageLoadErrors[activeImageIndex] ? 'none' : 'block' 
                  }}
                />
              ) : (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              {listing?.images && listing.images.length > 0 && imageLoadErrors[activeImageIndex] && (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">Image failed to load</span>
                </div>
              )}
            </div>
            
            {listing?.images && listing.images.length > 1 && (
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
                      onError={() => handleImageError(index)}
                      style={{ 
                        display: imageLoadErrors[index] ? 'none' : 'block' 
                      }}
                    />
                    {imageLoadErrors[index] && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-xs text-gray-500">Failed</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Listing details */}
          <div>
            <CarDetails listing={listing} />
            
            <Button className="w-full bg-[#007ac8] hover:bg-[#0069b4] mt-6">
              Contact Seller
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CarListingPage;
