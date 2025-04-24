
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarCard {
  image: string;
  title: string;
  year: string;
  make: string;
  model: string;
  price: string;
  variant?: string;
}

const featuredCars: CarCard[] = [
  {
    image: "/lovable-uploads/81f60840-ae50-493d-83c5-1fd76ee68afa.png",
    title: "2025 Kia K4 Sport+",
    year: "2025",
    make: "Kia",
    model: "K4 Sport+ Auto MY25",
    price: "$41,590"
  },
  {
    image: "/lovable-uploads/017bcd51-4a8d-41cf-b0c7-c4ac29688026.png",
    title: "2024 Mercedes-Benz EQE",
    year: "2024",
    make: "Mercedes-Benz",
    model: "EQE300 Auto",
    price: "$146,569"
  },
  {
    image: "/lovable-uploads/dbfca8c9-20cf-495f-a562-6daf731aa402.png",
    title: "2025 Volkswagen T-Roc",
    year: "2025",
    make: "Volkswagen",
    model: "T-Roc 110TSI Style D11 Auto MY25",
    price: "$45,790"
  },
  {
    image: "/lovable-uploads/718f76b2-f919-4358-94d5-81148a0d1815.png",
    title: "2024 Hyundai Tucson",
    year: "2024",
    make: "Hyundai",
    model: "Tucson Elite Auto AWD MY25",
    price: "$50,085"
  },
  {
    image: "/lovable-uploads/07920f46-b9e4-4757-9140-0e1f710cc9c8.png",
    title: "2024 MG ZS Excite",
    year: "2024",
    make: "MG",
    model: "ZS Excite Hybrid+ Auto MY25",
    price: "$33,690"
  }
];

const ShowroomSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 mb-12">
      <div className="flex flex-col items-center gap-4 mb-12 text-center">
        <div className="p-2 bg-blue-50 rounded-full">
          <Car className="w-6 h-6 text-[#007ac8]" />
        </div>
        <h2 className="text-2xl font-semibold">Looking for a brand new car?</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {featuredCars.map((car) => (
          <div key={car.title} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-[4/3] relative">
              <img src={car.image} alt={car.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{car.make} {car.model.split(" ")[0]}</h3>
              <p className="text-sm text-gray-600 mb-3">{car.model}</p>
              <p className="text-lg text-[#007ac8] font-semibold">from {car.price}</p>
              <p className="text-sm text-gray-500">Indicative drive away</p>
            </div>
          </div>
        ))}
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
