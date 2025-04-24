
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SearchForm = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 -mt-24 relative z-10 mx-4 lg:mx-auto max-w-7xl">
      <h2 className="text-xl font-semibold mb-4">Find your next car</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <select className="w-full p-2 border rounded-md">
          <option value="">All makes</option>
        </select>
        <select className="w-full p-2 border rounded-md">
          <option value="">All models</option>
        </select>
        <select className="w-full p-2 border rounded-md">
          <option value="">Body type</option>
        </select>
        <select className="w-full p-2 border rounded-md">
          <option value="">Location</option>
        </select>
      </div>
      <Button className="bg-[#007ac8] hover:bg-[#0069b4] text-white w-full md:w-auto">
        Show available cars
      </Button>
    </div>
  );
};

export default SearchForm;
