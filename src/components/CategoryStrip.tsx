
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const categories = [
  { name: "Family", image: "https://resource.csnstatic.com/mobile/carsales/api/home-categories/Family.png" },
  { name: "First Car", image: "https://resource.csnstatic.com/mobile/carsales/api/home-categories/First.png" },
  { name: "Green", image: "https://resource.csnstatic.com/mobile/carsales/api/home-categories/Electric.png" },
  { name: "Offroad", image: "https://resource.csnstatic.com/mobile/carsales/api/home-categories/offroad.png" },
  { name: "Performance", image: "https://resource.csnstatic.com/mobile/carsales/api/home-categories/Performance.png" },
  { name: "Prestige", image: "https://resource.csnstatic.com/mobile/carsales/api/home-categories/Prestige.png" },
  { name: "Tradie", image: "https://resource.csnstatic.com/mobile/carsales/api/home-categories/Tradie.png" },
  { name: "Unique", image: "https://i.ibb.co/Vp2hFy03/16256705477101551816.png" },
];

const CategoryStrip = () => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollLeft = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="relative">
        <div 
          ref={carouselRef} 
          className="flex overflow-x-auto space-x-8 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={handleScroll}
        >
          {categories.map((category) => (
            <div key={category.name} className="flex flex-col items-center min-w-[160px] flex-shrink-0 cursor-pointer">
              <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mb-3 hover:bg-gray-200 transition-colors">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-32 h-32 object-contain" 
                  draggable="false" 
                />
              </div>
              <span className="text-base text-gray-700 font-medium">{category.name}</span>
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        {canScrollLeft && (
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        {canScrollRight && (
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100"
            onClick={scrollRight}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </div>

      <div className="text-center mt-4">
        <a href="#" className="text-[#007ac8] hover:text-[#0069b4] font-semibold">
          New: Quiz for a car match
        </a>
      </div>
    </div>
  );
};

export default CategoryStrip;
