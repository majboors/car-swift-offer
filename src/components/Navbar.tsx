
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Navbar = () => {
  return (
    <header className="w-full">
      <div className="bg-[#007ac8] text-white py-2 text-center text-sm">
        Australia's most trusted car marketplace
      </div>
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-[#007ac8]">
                CarSwift
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-center space-x-8">
                  <Link to="/" className="text-gray-700 hover:text-[#007ac8]">Buy</Link>
                  <Link to="/" className="text-gray-700 hover:text-[#007ac8]">Sell</Link>
                  <Link to="/" className="text-gray-700 hover:text-[#007ac8]">Research</Link>
                  <Link to="/" className="text-gray-700 hover:text-[#007ac8]">Value my car</Link>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Sign up/Log in</Button>
              <Button className="bg-[#007ac8] hover:bg-[#0069b4]">Sell my car</Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
