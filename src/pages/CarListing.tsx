import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import TrustedBanner from '@/components/TrustedBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import CarDetails from '@/components/CarDetails';
import { Chat } from '@/components/chat/Chat';
import { MessageSquareIcon, X as XIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  features: any;
  user_id: string;
  seller_name?: string; // Property for seller name
}

const CarListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<boolean[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  
  // Calculate if it's the user's own listing
  const isOwnListing = user && listing && user.id === listing.user_id;

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
          
          // Make sure features is properly processed
          let processedFeatures = data.features;
          
          // If features is a string, try to parse it as JSON
          if (typeof data.features === 'string') {
            try {
              processedFeatures = JSON.parse(data.features);
              console.log("Parsed features from string:", processedFeatures);
            } catch (e) {
              console.error("Error parsing features string:", e);
              processedFeatures = null;
            }
          }
          
          // Ensure images is always an array
          const processedImages = Array.isArray(data.images) 
            ? data.images 
            : data.images 
              ? Array.isArray(JSON.parse(String(data.images))) 
                ? JSON.parse(String(data.images))
                : []
              : [];
          
          // Create a simple seller name using user_id
          let sellerName = "Anonymous";
          
          if (data.user_id) {
            try {
              // Get user email directly from the database via our custom RPC function
              const { data: emailData, error: emailError } = await supabase
                .rpc('get_user_email', { 
                  user_id_input: data.user_id
                });
              
              if (emailError) {
                console.error("Error fetching seller email:", emailError);
                sellerName = `User ${data.user_id.substring(0, 6)}`;
              } else if (emailData) {
                // Use the email as the seller name or create a username from it
                sellerName = emailData.split('@')[0] || `User ${data.user_id.substring(0, 6)}`;
              }
            } catch (error) {
              console.error("Error fetching seller details:", error);
              // Fall back to user_id if we can't get the email
              sellerName = `User ${data.user_id.substring(0, 6)}`;
            }
          }
          
          const processedListing: CarListing = {
            ...data,
            features: processedFeatures,
            images: processedImages,
            make: data.make || '',
            model: data.model || '',
            title: data.title || `${data.year || ''} ${data.make || ''} ${data.model || ''}`.trim(),
            year: data.year || new Date().getFullYear(),
            seller_name: sellerName // Add seller name
          };
          
          console.log("Processed listing for display:", processedListing);
          setListing(processedListing);
          
          // Initialize image load error array
          if (processedImages.length > 0) {
            setImageLoadErrors(new Array(processedImages.length).fill(false));
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

  // Add debugging logs
  useEffect(() => {
    if (user && listing) {
      console.log("CarListing - isOwnListing:", isOwnListing);
      console.log("CarListing - user:", user.id);
      console.log("CarListing - listing user_id:", listing.user_id);
    }
  }, [user, listing, isOwnListing]);

  const handleImageError = (index: number) => {
    console.log(`Image at index ${index} failed to load`);
    setImageLoadErrors(prev => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  const handleContactClick = () => {
    if (!user) {
      // Redirect to auth page if user is not logged in
      toast({
        title: "Authentication required",
        description: "Please sign in to contact the seller.",
      });
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
    } else {
      setShowChat(!showChat);
      // If we're opening the main chat, close the floating one
      if (!showChat) {
        setShowFloatingChat(false);
      }
    }
  };

  const toggleFloatingChat = () => {
    if (!user) {
      // Redirect to auth page if user is not logged in
      toast({
        title: "Authentication required",
        description: "Please sign in to contact the seller.",
      });
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
    } else {
      setShowFloatingChat(!showFloatingChat);
      // If we're opening the floating chat, close the main one
      if (!showFloatingChat) {
        setShowChat(false);
      }
    }
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
            <CarDetails 
              listing={listing} 
              onContactClick={!isOwnListing ? handleContactClick : undefined} 
            />
          </div>
        </div>
        
        {/* Floating chat button on mobile - only for logged in users who don't own the listing */}
        {!isOwnListing && !showChat && !showFloatingChat && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button 
              className="rounded-full w-16 h-16 shadow-lg bg-[#007ac8] hover:bg-[#0069b4] text-white"
              onClick={toggleFloatingChat}
            >
              <MessageSquareIcon className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* New Floating Chat Panel */}
        {showFloatingChat && user && !isOwnListing && (
          <div className="fixed bottom-6 right-6 z-50 w-80 rounded-lg shadow-xl">
            <div className="flex justify-between items-center bg-primary text-white p-2 rounded-t-lg">
              <h3 className="text-sm font-medium">Chat with Seller</h3>
              <button 
                onClick={toggleFloatingChat} 
                className="p-1 rounded-full hover:bg-primary-dark"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="h-80 bg-white rounded-b-lg overflow-hidden">
              <Chat 
                listingId={listing.id} 
                receiverId={listing.user_id}
                onClose={toggleFloatingChat} 
                className="h-full border-0"
              />
            </div>
          </div>
        )}
        
        {/* Main Chat component - only shown when user is logged in */}
        {showChat && user && !isOwnListing && (
          <div className="mt-6 border rounded-lg shadow-md">
            <Chat 
              listingId={listing.id} 
              receiverId={listing.user_id}
              onClose={handleContactClick} 
            />
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default CarListingPage;
