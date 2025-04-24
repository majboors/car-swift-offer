
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarCard {
  image: string;
  title: string;
  price: string;
}

const featuredCars: CarCard[] = [
  {
    image: "/lovable-uploads/81f60840-ae50-493d-83c5-1fd76ee68afa.png",
    title: "2024 Toyota RAV4",
    price: "$39,990"
  },
  {
    image: "/lovable-uploads/017bcd51-4a8d-41cf-b0c7-c4ac29688026.png",
    title: "2024 Honda CR-V",
    price: "$42,990"
  },
  {
    image: "/lovable-uploads/dbfca8c9-20cf-495f-a562-6daf731aa402.png",
    title: "2024 Tesla Model Y",
    price: "$65,990"
  },
  {
    image: "/lovable-uploads/718f76b2-f919-4358-94d5-81148a0d1815.png",
    title: "2024 BMW X3",
    price: "$72,990"
  },
  {
    image: "/lovable-uploads/07920f46-b9e4-4757-9140-0e1f710cc9c8.png",
    title: "2024 Mercedes GLC",
    price: "$78,990"
  }
];

const ShowroomSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-50 rounded-full">
          <Car className="w-6 h-6 text-[#007ac8]" />
        </div>
        <h2 className="text-2xl font-semibold">New Car Showroom</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {featuredCars.map((car) => (
          <div key={car.title} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-video relative">
              <img src={car.image} alt={car.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{car.title}</h3>
              <p className="text-lg text-[#007ac8]">{car.price}</p>
              <p className="text-sm text-gray-500">Indicative drive away</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" className="hover:bg-[#007ac8] hover:text-white">
          Discover the new car showroom
        </Button>
      </div>
    </section>
  );
};

export default ShowroomSection;
