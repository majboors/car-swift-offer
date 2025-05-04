
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';
import { Menu, ChevronDown, Bell, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileSidebar } from './MobileSidebar';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

const Navbar: React.FC = () => {
  const { user, signOut, username } = useAuth();
  const isMobile = useIsMobile();

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

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return user?.email ? user.email.substring(0, 2).toUpperCase() : 'U';
  };

  // Navigation items for dropdown menus
  const buyDropdownItems = [
    { title: "All cars for sale", href: "/cars" },
    { title: "New cars", href: "/cars/new" },
    { title: "Used cars", href: "/cars/used" },
    { title: "Dealer cars", href: "/cars/dealer" },
    { title: "Private seller cars", href: "/cars/private" },
    { title: "Electric cars", href: "/cars/electric" },
    { title: "Finance", href: "/finance" },
    { title: "Inspections", href: "/inspections" },
  ];

  const sellDropdownItems = [
    { title: "Create an ad", href: "/create-ad" },
    { title: "Get an Instant Offer™", href: "/instant-offer" },
    { title: "Manage my ad", href: "/manage-ad" },
    { title: "Value my car", href: "/value-my-car" },
  ];

  const researchDropdownItems = [
    { title: "Research all cars", href: "/research" },
    { title: "All news and reviews", href: "/news-reviews" },
    { title: "News", href: "/news" },
    { title: "Reviews", href: "/reviews" },
    { title: "Advice", href: "/advice" },
    { title: "Best cars", href: "/best-cars" },
    { title: "Owner reviews", href: "/owner-reviews" },
    { title: "Compare cars", href: "/compare" },
    { title: "Electric cars", href: "/electric" },
    { title: "Car of the year", href: "/car-of-year" },
  ];

  const showroomDropdownItems = [
    { title: "Showroom", href: "/showroom" },
    { title: "Electric cars", href: "/showroom/electric" },
    { title: "Certified pre-owned", href: "/showroom/certified" },
    { title: "New car calendar", href: "/showroom/calendar" },
  ];

  const popularMakes = [
    "Audi", "BMW", "Ford", "Holden", "Hyundai", "Kia", "Mazda",
    "Mercedes-Benz", "Mitsubishi", "Nissan", "Tesla", "Toyota"
  ];

  const bodyTypes = [
    "Cab Chassis", "Convertible", "Coupe", "Hatch", "Sedan",
    "SUV", "Ute", "Van", "Wagon"
  ];

  const locations = [
    "ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"
  ];

  return (
    <div className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-[#007ac8]">
                <img 
                  src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg" 
                  alt="Car Swift Offer" 
                  className="h-10 w-auto" 
                />
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
                    <NavigationMenuContent className="bg-white rounded-md shadow-lg">
                      <div className="grid grid-cols-3 gap-4 p-4 w-[800px]">
                        <div>
                          {buyDropdownItems.map((item) => (
                            <Link 
                              key={item.title} 
                              to={item.href}
                              className="block py-2 text-sm hover:text-[#007ac8]"
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Popular makes</h3>
                          {popularMakes.map((make) => (
                            <Link
                              key={make}
                              to="/cars"
                              className="block py-1 text-sm hover:text-[#007ac8]"
                            >
                              {make}
                            </Link>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium mb-2">Body types</h3>
                            {bodyTypes.map((type) => (
                              <Link
                                key={type}
                                to="/cars"
                                className="block py-1 text-sm hover:text-[#007ac8]"
                              >
                                {type}
                              </Link>
                            ))}
                          </div>
                          <div>
                            <h3 className="font-medium mb-2">Location</h3>
                            {locations.map((location) => (
                              <Link
                                key={location}
                                to="/cars"
                                className="block py-1 text-sm hover:text-[#007ac8]"
                              >
                                {location}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  {/* Sell Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-[#007ac8]">
                      Sell
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white rounded-md shadow-lg">
                      <div className="p-4 w-[200px]">
                        {sellDropdownItems.map((item) => (
                          <Link 
                            key={item.title} 
                            to={item.href}
                            className="block py-2 text-sm hover:text-[#007ac8]"
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
                    <NavigationMenuContent className="bg-white rounded-md shadow-lg">
                      <div className="grid grid-cols-2 gap-4 p-4 w-[600px]">
                        <div>
                          {researchDropdownItems.map((item) => (
                            <Link 
                              key={item.title} 
                              to={item.href}
                              className="block py-2 text-sm hover:text-[#007ac8]"
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Popular makes</h3>
                          {popularMakes.slice(0, 8).map((make) => (
                            <Link
                              key={make}
                              to="/research"
                              className="block py-1 text-sm hover:text-[#007ac8]"
                            >
                              {make}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  {/* Showroom Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-[#007ac8]">
                      Showroom
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white rounded-md shadow-lg">
                      <div className="grid grid-cols-2 gap-4 p-4 w-[500px]">
                        <div>
                          {showroomDropdownItems.map((item) => (
                            <Link 
                              key={item.title} 
                              to={item.href}
                              className="block py-2 text-sm hover:text-[#007ac8]"
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Popular body types</h3>
                          {bodyTypes.slice(0, 6).map((type) => (
                            <Link
                              key={type}
                              to="/showroom"
                              className="block py-1 text-sm hover:text-[#007ac8]"
                            >
                              {type}
                            </Link>
                          ))}
                        </div>
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
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Bell className="h-5 w-5" />
            </Button>
            {user ? (
              <>
                <div className="flex items-center gap-2 mr-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#007ac8] text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {username || user.email?.split('@')[0]}
                  </span>
                </div>
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
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="h-10 py-2 text-sm">
                    Sign In / Sign Up
                  </Button>
                </Link>
                <Link to="/sell">
                  <Button className="bg-[#007ac8] hover:bg-[#0069b4]">
                    Sell My Car
                  </Button>
                </Link>
              </>
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
    </div>
  );
};

export default Navbar;
