
import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Home, CarFront, Plus, LogOut, LogIn, ChevronDown, ChevronUp, Bell, ShoppingBag, Search, CircleHelp, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isCurrentPath = (path: string) => location.pathname === path;

  // State to track which dropdowns are open
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    buy: false,
    sell: false,
    research: false,
    showroom: false,
  });

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }));
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

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="border-b p-4 flex items-center">
        <Link to="/">
          <img 
            src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg" 
            alt="Car Swift Offer" 
            className="h-8 w-auto" 
          />
        </Link>
      </div>
      <div className="p-4">
        <nav className="space-y-4">
          <div>
            <Link 
              to="/" 
              className={`flex items-center gap-3 py-2 ${isCurrentPath('/') ? 'text-[#007ac8] font-medium' : 'text-gray-700'}`}
            >
              <Home className="h-5 w-5" />
              <span className="text-base">Home</span>
            </Link>
          </div>

          {/* Buy Dropdown */}
          <div>
            <Collapsible open={openDropdowns.buy}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-md"
                  onClick={() => toggleDropdown('buy')}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5" />
                    <span className="text-base">Buy</span>
                  </div>
                  {openDropdowns.buy ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-8 mt-2 border-l pl-4 space-y-2">
                  {buyDropdownItems.map((item) => (
                    <div key={item.title}>
                      <Link to={item.href} className="block py-1.5 text-gray-700 hover:text-[#007ac8]">
                        {item.title}
                      </Link>
                    </div>
                  ))}
                  <div className="pt-2">
                    <div className="font-medium text-sm py-1">Popular makes</div>
                    {popularMakes.slice(0, 6).map((make) => (
                      <Link 
                        key={make} 
                        to="/cars" 
                        className="block py-1.5 text-gray-700 hover:text-[#007ac8]"
                      >
                        {make}
                      </Link>
                    ))}
                  </div>
                  <div className="pt-2">
                    <div className="font-medium text-sm py-1">Body types</div>
                    {bodyTypes.slice(0, 5).map((type) => (
                      <Link 
                        key={type} 
                        to="/cars" 
                        className="block py-1.5 text-gray-700 hover:text-[#007ac8]"
                      >
                        {type}
                      </Link>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Sell Dropdown */}
          <div>
            <Collapsible open={openDropdowns.sell}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-md"
                  onClick={() => toggleDropdown('sell')}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5" />
                    <span className="text-base">Sell</span>
                  </div>
                  {openDropdowns.sell ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-8 mt-2 border-l pl-4 space-y-2">
                  {sellDropdownItems.map((item) => (
                    <div key={item.title}>
                      <Link to={item.href} className="block py-1.5 text-gray-700 hover:text-[#007ac8]">
                        {item.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Research Dropdown */}
          <div>
            <Collapsible open={openDropdowns.research}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-md"
                  onClick={() => toggleDropdown('research')}
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5" />
                    <span className="text-base">Research</span>
                  </div>
                  {openDropdowns.research ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-8 mt-2 border-l pl-4 space-y-2">
                  {researchDropdownItems.map((item) => (
                    <div key={item.title}>
                      <Link to={item.href} className="block py-1.5 text-gray-700 hover:text-[#007ac8]">
                        {item.title}
                      </Link>
                    </div>
                  ))}
                  <div className="pt-2">
                    <div className="font-medium text-sm py-1">Popular makes</div>
                    {popularMakes.slice(0, 4).map((make) => (
                      <Link 
                        key={make} 
                        to="/research" 
                        className="block py-1.5 text-gray-700 hover:text-[#007ac8]"
                      >
                        {make}
                      </Link>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Showroom Dropdown */}
          <div>
            <Collapsible open={openDropdowns.showroom}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-md"
                  onClick={() => toggleDropdown('showroom')}
                >
                  <div className="flex items-center gap-3">
                    <CarFront className="h-5 w-5" />
                    <span className="text-base">Showroom</span>
                  </div>
                  {openDropdowns.showroom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-8 mt-2 border-l pl-4 space-y-2">
                  {showroomDropdownItems.map((item) => (
                    <div key={item.title}>
                      <Link to={item.href} className="block py-1.5 text-gray-700 hover:text-[#007ac8]">
                        {item.title}
                      </Link>
                    </div>
                  ))}
                  <div className="pt-2">
                    <div className="font-medium text-sm py-1">Body types</div>
                    {bodyTypes.slice(0, 4).map((type) => (
                      <Link 
                        key={type} 
                        to="/showroom" 
                        className="block py-1.5 text-gray-700 hover:text-[#007ac8]"
                      >
                        {type}
                      </Link>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div>
            <Link 
              to="/value-my-car" 
              className={`flex items-center gap-3 py-2 ${isCurrentPath('/value-my-car') ? 'text-[#007ac8] font-medium' : 'text-gray-700'}`}
            >
              <CarFront className="h-5 w-5" />
              <span className="text-base">Value my car</span>
            </Link>
          </div>

          <div className="border-t my-4"></div>
          
          {user ? (
            <>
              <div>
                <Link 
                  to="/add-listing" 
                  className={`flex items-center gap-3 py-2 ${isCurrentPath('/add-listing') ? 'text-[#007ac8] font-medium' : 'text-gray-700'}`}
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-base">Add Listing</span>
                </Link>
              </div>
              
              <div>
                <Link 
                  to="/account" 
                  className={`flex items-center gap-3 py-2 ${isCurrentPath('/account') ? 'text-[#007ac8] font-medium' : 'text-gray-700'}`}
                >
                  <User className="h-5 w-5" />
                  <span className="text-base">My Account</span>
                </Link>
              </div>
              
              <div>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-start gap-3 p-2 hover:bg-gray-100 rounded-md"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-base">Sign Out</span>
                </Button>
              </div>
            </>
          ) : (
            <div>
              <Link 
                to="/auth" 
                className={`flex items-center gap-3 py-2 ${isCurrentPath('/auth') ? 'text-[#007ac8] font-medium' : 'text-gray-700'}`}
              >
                <LogIn className="h-5 w-5" />
                <span className="text-base">Sign In / Sign Up</span>
              </Link>
            </div>
          )}
          
          <div>
            <Link 
              to="/help" 
              className="flex items-center gap-3 py-2 text-gray-700"
            >
              <CircleHelp className="h-5 w-5" />
              <span className="text-base">Help</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
