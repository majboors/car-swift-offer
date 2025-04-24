
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
      <div className="flex overflow-x-auto space-x-8 pb-4 scrollbar-hide">
        {categories.map((category) => (
          <div key={category.name} className="flex flex-col items-center min-w-[100px]">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2 hover:bg-gray-200 transition-colors">
              <img src={category.image} alt={category.name} className="w-12 h-12 object-contain" />
            </div>
            <span className="text-sm text-gray-700">{category.name}</span>
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <a href="#" className="text-[#007ac8] hover:text-[#0069b4]">
          New: Quiz for a car match
        </a>
      </div>
    </div>
  );
};

export default CategoryStrip;
