
import { ScrollArea } from "@/components/ui/scroll-area";

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
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ScrollArea className="w-full">
        <div className="flex space-x-8 pb-4 pr-8" style={{ minWidth: "max-content" }}>
          {categories.map((category) => (
            <div key={category.name} className="flex flex-col items-center min-w-[160px] cursor-pointer">
              <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mb-3 hover:bg-gray-200 transition-colors">
                <img src={category.image} alt={category.name} className="w-32 h-32 object-contain" />
              </div>
              <span className="text-base text-gray-700 font-medium">{category.name}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="text-center mt-4">
        <a href="#" className="text-[#007ac8] hover:text-[#0069b4] font-semibold">
          New: Quiz for a car match
        </a>
      </div>
    </div>
  );
};

export default CategoryStrip;
