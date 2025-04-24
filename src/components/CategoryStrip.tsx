
const categories = [
  { name: "Family", image: "/lovable-uploads/81f60840-ae50-493d-83c5-1fd76ee68afa.png" },
  { name: "First car", image: "/lovable-uploads/017bcd51-4a8d-41cf-b0c7-c4ac29688026.png" },
  { name: "Green", image: "/lovable-uploads/dbfca8c9-20cf-495f-a562-6daf731aa402.png" },
  { name: "Offroad 4x4", image: "/lovable-uploads/718f76b2-f919-4358-94d5-81148a0d1815.png" },
  { name: "Performance", image: "/lovable-uploads/07920f46-b9e4-4757-9140-0e1f710cc9c8.png" },
];

const CategoryStrip = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex overflow-x-auto space-x-8 pb-4">
        {categories.map((category) => (
          <div key={category.name} className="flex flex-col items-center min-w-[100px]">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2">
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
