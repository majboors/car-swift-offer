
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Car } from "lucide-react";

interface FeaturedCar {
  id: string;
  title: string;
  price: number;
  make: string;
  model: string;
  year: number;
  location: string | null;
  images: string[] | null;
}

const RecommendedCarsSection = () => {
  const [featuredCars, setFeaturedCars] = useState<FeaturedCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("car_listings")
          .select("id, title, price, make, model, year, location, images")
          .eq("status", "approved")
          .eq("featured", true)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        
        // Parse images coming from the database
        const parsedCars = (data || []).map(car => ({
          ...car,
          images: Array.isArray(car.images) ? car.images : (car.images ? JSON.parse(car.images as string) : null)
        }));
        
        setFeaturedCars(parsedCars);
      } catch (error) {
        console.error("Error fetching featured cars:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-semibold mb-6">Featured Vehicles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (featuredCars.length === 0) {
    return null;
  }

  // Split cars into two rows for better display
  const firstRow = featuredCars.slice(0, Math.min(10, featuredCars.length));
  const secondRow = featuredCars.slice(Math.min(10, featuredCars.length));

  const renderCarItem = (car: FeaturedCar) => {
    const defaultImage = "/placeholder.svg";
    const mainImage = car.images && car.images.length > 0 
      ? car.images[0] 
      : defaultImage;

    return (
      <Card className="overflow-hidden h-full border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="relative">
          <img 
            src={mainImage} 
            alt={car.title} 
            className="h-40 w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
          />
          <Badge className="absolute top-2 right-2 bg-[#007ac8]">Featured</Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{car.title}</h3>
          <p className="text-lg font-bold text-[#007ac8]">${car.price.toLocaleString()}</p>
          <p className="text-sm text-gray-500 line-clamp-1">{car.year} {car.make} {car.model}</p>
          {car.location && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{car.location}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">Featured Vehicles</h3>
          <Button 
            variant="outline" 
            onClick={() => navigate("/search?featured=true")}
            className="flex items-center gap-2"
          >
            <Car className="h-4 w-4" />
            View All Featured
          </Button>
        </div>

        <div className="space-y-6">
          {firstRow.length > 0 && (
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {firstRow.map((car) => (
                  <CarouselItem 
                    key={car.id} 
                    className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/4"
                    onClick={() => navigate(`/listing/${car.id}`)}
                  >
                    {renderCarItem(car)}
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:flex">
                <CarouselPrevious className="-left-4 bg-white" />
                <CarouselNext className="-right-4 bg-white" />
              </div>
            </Carousel>
          )}

          {secondRow.length > 0 && (
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {secondRow.map((car) => (
                  <CarouselItem 
                    key={car.id} 
                    className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/4"
                    onClick={() => navigate(`/listing/${car.id}`)}
                  >
                    {renderCarItem(car)}
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:flex">
                <CarouselPrevious className="-left-4 bg-white" />
                <CarouselNext className="-right-4 bg-white" />
              </div>
            </Carousel>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendedCarsSection;
