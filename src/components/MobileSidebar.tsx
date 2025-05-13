import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Home, CarFront, Plus, LogOut, LogIn, ChevronDown, ChevronUp, Bell, ShoppingBag, Search, CircleHelp, User, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface MobileSidebarProps {
  onNavItemClick?: () => void;
}

export function MobileSidebar({ onNavItemClick }: MobileSidebarProps) {
  const location = useLocation();
  const { user, signOut, username } = useAuth();
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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return user?.email ? user.email.substring(0, 2).toUpperCase() : 'U';
  };

  // Function to handle navigation item clicks
  const handleNavItemClick = (href: string) => {
    // Close the sidebar when a navigation item is clicked
    if (onNavItemClick) {
      onNavItemClick();
    }
  };

  // Navigation items for dropdown menus
  const buyDropdownItems = [
    { title: "All cars for sale", href: "/" },
    { title: "New cars", href: "/" },
    { title: "Used cars", href: "/" },
    { title: "Dealer cars", href: "/" },
    { title: "Private seller cars", href: "/" },
    { title: "Electric cars", href: "/" },
    { title: "Finance", href: "/" },
    { title: "Inspections", href: "/" },
  ];

  const sellDropdownItems = [
    { title: "Create an ad", href: "/" },
    { title: "Get an Instant Offer™", href: "/" },
    { title: "Manage my ad", href: "/" },
    { title: "Value my car", href: "/value-my-car" },
  ];

  const researchDropdownItems = [
    { title: "Research all cars", href: "/" },
    { title: "All news and reviews", href: "/" },
    { title: "News", href: "/" },
    { title: "Reviews", href: "/" },
    { title: "Advice", href: "/" },
    { title: "Best cars", href: "/" },
    { title: "Owner reviews", href: "/" },
    { title: "Compare cars", href: "/" },
    { title: "Electric cars", href: "/" },
    { title: "Car of the year", href: "/" },
  ];

  const showroomDropdownItems = [
    { title: "Showroom", href: "/" },
    { title: "Electric cars", href: "/" },
    { title: "Certified pre-owned", href: "/" },
    { title: "New car calendar", href: "/" },
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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      if (onNavItemClick) {
        onNavItemClick();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full bg-white overflow-y-auto touch-manipulation flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <Link to="/" onClick={() => handleNavItemClick('/')}>
          <span className="font-bold inline-block">CarTrade</span>
        </Link>
        {user && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#007ac8] text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {username || user.email?.split('@')[0]}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <nav className="space-y-4">
          <div>
            <Link 
              to="/" 
              className={`flex items-center gap-3 py-2 ${isCurrentPath('/') ? 'text-[#007ac8] font-medium' : 'text-gray-700'}`}
              onClick={() => handleNavItemClick('/')}
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
                  className="w-full flex items-center justify-between p-2 active:bg-gray-100 rounded-md touch-manipulation"
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
                      <Link 
                        to={item.href} 
                        className="block py-1.5 text-gray-700 active:text-[#007ac8] touch-manipulation"
                        onClick={() => handleNavItemClick(item.href)}
                      >
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
                        className="block py-1.5 text-gray-700 active:text-[#007ac8] touch-manipulation"
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
                        className="block py-1.5 text-gray-700 active:text-[#007ac8] touch-manipulation"
                      >
                        {type}
                      </Link>
                    ))}
                  </div>
                  <div className="pt-2">
                    <div className="font-medium text-sm py-1">Locations</div>
                    {locations.slice(0, 5).map((location) => (
                      <Link 
                        key={location} 
                        to="/cars" 
                        className="block py-1.5 text-gray-700 active:text-[#007ac8] touch-manipulation"
                      >
                        {location}
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
                  className="w-full flex items-center justify-between p-2 active:bg-gray-100 rounded-md touch-manipulation"
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
                      <Link to={item.href} className="block py-1.5 text-gray-700 active:text-[#007ac8] touch-manipulation">
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
                  className="w-full flex items-center justify-between p-2 active:bg-gray-100 rounded-md touch-manipulation"
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
                      <Link to={item.href} className="block py-1.5 text-gray-700 active:text-[#007ac8] touch-manipulation">
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
                        className="block py-1.5 text-gray-700 active:text-[#007ac8] touch-manipulation"
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
                  className="w-full flex items-center justify-between p-2 active:bg-gray-100 rounded-md touch-manipulation"
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
                      <Link to={item.href} className="block py-1.5 text-gray-700 active:text-[#007ac8] touch-manipulation">
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
                        className="block py-1.5 text-gray-700 active:text-[#007ac8] touch-manipulation"
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
              className={`flex items-center gap-3 py-2 ${isCurrentPath('/value-my-car') ? 'text-[#007ac8] font-medium' : 'text-gray-700'} touch-manipulation`}
              onClick={() => handleNavItemClick('/value-my-car')}
            >
              <CarFront className="h-5 w-5" />
              <span className="text-base">Value my car</span>
            </Link>
          </div>

          {/* Add Snap-AI Link */}
          <div>
            <Link 
              to="/snap-ai" 
              className={`flex items-center gap-3 py-2 ${isCurrentPath('/snap-ai') ? 'text-[#007ac8] font-medium' : 'text-gray-700'} touch-manipulation`}
              onClick={() => handleNavItemClick('/snap-ai')}
            >
              <Camera className="h-5 w-5" />
              <span className="text-base">Snap-AI</span>
            </Link>
          </div>

          <div className="border-t my-4"></div>
          
          {user ? (
            <>
              <div>
                <Link 
                  to="/add-listing" 
                  className={`flex items-center gap-3 py-2 ${isCurrentPath('/add-listing') ? 'text-[#007ac8] font-medium' : 'text-gray-700'} touch-manipulation`}
                  onClick={() => handleNavItemClick('/add-listing')}
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-base">Add Listing</span>
                </Link>
              </div>
              
              <div>
                <Link 
                  to="/account" 
                  className={`flex items-center gap-3 py-2 ${isCurrentPath('/account') ? 'text-[#007ac8] font-medium' : 'text-gray-700'} touch-manipulation`}
                  onClick={() => handleNavItemClick('/account')}
                >
                  <User className="h-5 w-5" />
                  <span className="text-base">My Account</span>
                </Link>
              </div>
              
              <div>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-start gap-3 p-2 active:bg-gray-100 rounded-md touch-manipulation"
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
                className={`flex items-center gap-3 py-2 ${isCurrentPath('/auth') ? 'text-[#007ac8] font-medium' : 'text-gray-700'} touch-manipulation`}
                onClick={() => handleNavItemClick('/auth')}
              >
                <LogIn className="h-5 w-5" />
                <span className="text-base">Sign In / Sign Up</span>
              </Link>
            </div>
          )}
          
          <div>
            <Link 
              to="/help" 
              className="flex items-center gap-3 py-2 text-gray-700 touch-manipulation"
              onClick={() => handleNavItemClick('/help')}
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

export default MobileSidebar;
