
import { useState, useEffect } from "react";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

// Define the types more precisely
interface CarListing {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  price: number;
  images: string[];
  showcase: boolean;
}

// Separate interface for fallback cars to avoid type conflicts
interface FallbackCar {
  image: string;
  title: string;
  year: number;
  make: string;
  model: string;
  price: number;
}

const ShowroomSection = () => {
  const [showcaseListings, setShowcaseListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowcaseListings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("car_listings")
          .select("*")
          .eq("showcase", true)  // Only fetch listings marked as showcase by admins
          .eq("status", "approved")  // Only approved listings
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching showcase listings:", error);
          throw error;
        }

        if (data) {
          const formattedListings = data.map(item => ({
            id: item.id,
            title: item.title || `${item.year} ${item.make} ${item.model}`,
            year: item.year,
            make: item.make,
            model: item.model,
            price: item.price,
            // Convert images to string array
            images: Array.isArray(item.images) 
              ? item.images.map((img: any) => String(img))
              : [] as string[],
            showcase: true
          }));
          setShowcaseListings(formattedListings);
        }
      } catch (error) {
        console.error("Failed to load showcase listings:", error);
        toast({
          title: "Error",
          description: "Failed to load showcase listings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShowcaseListings();
  }, []);

  // Fallback showcase cars when none are set from the admin
  const fallbackCars: FallbackCar[] = [
    {
      image: "/lovable-uploads/81f60840-ae50-493d-83c5-1fd76ee68afa.png",
      title: "2025 Kia K4 Sport+",
      year: 2025,
      make: "Kia",
      model: "K4 Sport+ Auto MY25",
      price: 41590
    },
    {
      image: "/lovable-uploads/017bcd51-4a8d-41cf-b0c7-c4ac29688026.png",
      title: "2024 Mercedes-Benz EQE",
      year: 2024,
      make: "Mercedes-Benz",
      model: "EQE300 Auto",
      price: 146569
    },
    {
      image: "/lovable-uploads/dbfca8c9-20cf-495f-a562-6daf731aa402.png",
      title: "2025 Volkswagen T-Roc",
      year: 2025,
      make: "Volkswagen",
      model: "T-Roc 110TSI Style D11 Auto MY25",
      price: 45790
    },
    {
      image: "/lovable-uploads/718f76b2-f919-4358-94d5-81148a0d1815.png",
      title: "2024 Hyundai Tucson",
      year: 2024,
      make: "Hyundai",
      model: "Tucson Elite Auto AWD MY25",
      price: 50085
    },
    {
      image: "/lovable-uploads/07920f46-b9e4-4757-9140-0e1f710cc9c8.png",
      title: "2024 MG ZS Excite",
      year: 2024,
      make: "MG",
      model: "ZS Excite Hybrid+ Auto MY25",
      price: 33690
    }
  ];

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle click on a car listing
  const handleCarClick = (car: CarListing | FallbackCar, index: number) => {
    // Real car listings have an id property that we can use to navigate
    if ('id' in car) {
      navigate(`/listing/${car.id}`);
    } else {
      // For fallback cars, show a toast notification
      toast({
        title: "Demo car",
        description: "This is a demo car. No detailed listing available.",
      });
    }
  };

  // Use showcase listings or fallback if none are available
  const displayListings = showcaseListings.length > 0 ? showcaseListings : fallbackCars;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 mb-12">
      <div className="flex flex-col items-center gap-4 mb-12 text-center">
        <div className="p-2 bg-blue-50 rounded-full">
          <Car className="w-6 h-6 text-[#007ac8]" />
        </div>
        <h2 className="text-2xl font-semibold">Looking for a brand new car?</h2>
        {showcaseListings.length > 0 && (
          <p className="text-gray-600">Featured vehicles selected by our experts</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {loading ? (
          // Loading skeleton
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full h-[160px]" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-3 w-1/4 mt-1" />
              </div>
            </div>
          ))
        ) : (
          displayListings.map((car, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCarClick(car, index)}
            >
              <div className="aspect-[4/3] relative">
                {'images' in car && car.images.length > 0 ? (
                  <img 
                    src={car.images[0]} 
                    alt={car.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ) : 'image' in car ? (
                  <img src={car.image} alt={car.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                
                {/* Show showcase badge */}
                {'id' in car && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="showcase">Showcase</Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">{car.make} {car.model.split(" ")[0]}</h3>
                <p className="text-sm text-gray-600 mb-3">{car.model}</p>
                <p className="text-lg text-[#007ac8] font-semibold">
                  from {formatPrice(car.price)}
                </p>
                <p className="text-sm text-gray-500">Indicative drive away</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-center">
        <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-[#007ac8] hover:text-white">
          Discover the new car showroom
        </Button>
      </div>
    </section>
  );
};

export default ShowroomSection;
