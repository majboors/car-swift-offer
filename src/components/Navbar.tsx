
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';
import { Menu, ChevronDown } from 'lucide-react';
import { MobileSidebar } from './MobileSidebar';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Navigation items for dropdown menus
  const buyItems = [
    { title: "All Cars", href: "/cars" },
    { title: "New Cars", href: "/cars/new" },
    { title: "Used Cars", href: "/cars/used" },
    { title: "Certified Pre-Owned", href: "/cars/certified" },
  ];

  const sellItems = [
    { title: "Sell Your Car", href: "/sell" },
    { title: "Trade In", href: "/trade-in" },
    { title: "Get Cash Offer", href: "/cash-offer" },
  ];

  const researchItems = [
    { title: "Compare Cars", href: "/compare" },
    { title: "Car Reviews", href: "/reviews" },
    { title: "Buying Guides", href: "/guides" },
  ];

  const showroomItems = [
    { title: "Featured Models", href: "/showroom/featured" },
    { title: "New Arrivals", href: "/showroom/new" },
    { title: "Special Offers", href: "/showroom/offers" },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-[#007ac8]">
                Car Swift Offer
              </Link>
            </div>
            
            {/* Desktop nav links */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Buy Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-[#007ac8]">
                      Buy
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white rounded-md shadow-lg w-64">
                      <div className="p-2">
                        {buyItems.map((item) => (
                          <Link 
                            key={item.title} 
                            to={item.href}
                            className="block p-2 text-sm text-gray-700 hover:bg-[#f0f9ff] hover:text-[#007ac8] rounded-md"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  {/* Sell Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-[#007ac8]">
                      Sell
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white rounded-md shadow-lg w-64">
                      <div className="p-2">
                        {sellItems.map((item) => (
                          <Link 
                            key={item.title} 
                            to={item.href}
                            className="block p-2 text-sm text-gray-700 hover:bg-[#f0f9ff] hover:text-[#007ac8] rounded-md"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  {/* Research Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-[#007ac8]">
                      Research
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white rounded-md shadow-lg w-64">
                      <div className="p-2">
                        {researchItems.map((item) => (
                          <Link 
                            key={item.title} 
                            to={item.href}
                            className="block p-2 text-sm text-gray-700 hover:bg-[#f0f9ff] hover:text-[#007ac8] rounded-md"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  {/* Showroom Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-[#007ac8]">
                      Showroom
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white rounded-md shadow-lg w-64">
                      <div className="p-2">
                        {showroomItems.map((item) => (
                          <Link 
                            key={item.title} 
                            to={item.href}
                            className="block p-2 text-sm text-gray-700 hover:bg-[#f0f9ff] hover:text-[#007ac8] rounded-md"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  {/* Value My Car Link */}
                  <NavigationMenuItem>
                    <Link to="/value-my-car" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#007ac8] flex items-center">
                      Value My Car
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          
          {/* Right side buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Link to="/add-listing">
                  <Button variant="outline" className="border-[#007ac8] text-[#007ac8] hover:bg-[#007ac8] hover:text-white">
                    Add Listing
                  </Button>
                </Link>
                <Button onClick={handleSignOut} variant="ghost">
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-[#007ac8] hover:bg-[#0069b4]">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-full sm:w-80">
                <MobileSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
