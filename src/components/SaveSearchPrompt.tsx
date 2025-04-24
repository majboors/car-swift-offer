
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const SaveSearchPrompt = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
          <Heart className="w-6 h-6 text-[#007ac8]" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Sign up to save searches</h3>
        <p className="text-gray-600 mb-4">Find your saved searches right here. Get alerts for new listings.</p>
        <Button variant="outline" className="hover:bg-[#007ac8] hover:text-white">
          Sign up or log in
        </Button>
      </div>
    </div>
  );
};

export default SaveSearchPrompt;
