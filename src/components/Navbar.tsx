import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg" 
                alt="Snap My Car" 
                className="h-14 w-auto object-contain"
              />
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
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost">Sign up/Log in</Button>
            <Button className="bg-[#007ac8] hover:bg-[#0069b4]">Sell my car</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
