
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Bell, LayoutDashboard, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Navigation data - Updated to point to search page with appropriate queries
const buyDropdownItems = [
  { title: "All cars for sale", href: "/search" },
  { title: "New cars", href: "/search?condition=new" },
  { title: "Used cars", href: "/search?condition=used" },
  { title: "Dealer cars", href: "/search?sellerType=dealer" },
  { title: "Private seller cars", href: "/search?sellerType=private" },
  { title: "Electric cars", href: "/search?fuelType=electric" },
  { title: "Finance", href: "/search?financeAvailable=true" },
  { title: "Inspections", href: "/search?inspected=true" },
];

// Updated sell dropdown items to all point to add-listing
const sellDropdownItems = [
  { title: "Create an ad", href: "/add-listing" },
  { title: "Get an Instant Offer™", href: "/add-listing" },
  { title: "Manage my ad", href: "/add-listing" },
  { title: "Value my car", href: "/value-my-car" },
];

const ScrollNav: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { user, signOut, loading } = useAuth();
  
  if (!visible) return null; // Only render when visible is true
  
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md transform transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container flex h-12 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <img
              src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg"
              alt="Snap My Car"
              className="h-10 w-auto"
            />
          </Link>
          <nav className="hidden md:flex gap-4 items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Buy Dropdown - Compact Version */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-8 py-1 text-sm">Buy</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-2 p-4 w-[500px]">
                      <ul className="space-y-1">
                        {buyDropdownItems.map((item) => (
                          <li key={item.title}>
                            <Link to={item.href} className="text-sm hover:text-primary">
                              {item.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Value my car</h4>
                        <Link to="/value-my-car" className="text-sm hover:text-primary block mb-2">Get a valuation</Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Sell Dropdown - Compact Version */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-8 py-1 text-sm">Sell</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid p-4 w-[200px] gap-1">
                      {sellDropdownItems.map((item) => (
                        <li key={item.title}>
                          <Link to={item.href} className="text-sm hover:text-primary">
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Value My Car - Direct Link */}
                <NavigationMenuItem>
                  <Link to="/value-my-car" className="text-sm block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    Value my car
                  </Link>
                </NavigationMenuItem>
                
                {/* Snap-AI - Direct Link */}
                <NavigationMenuItem>
                  <Link to="/snap-ai" className="text-sm block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    Snap-AI
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>
        
        {/* Right Side Utility Buttons */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center gap-2">
            {user && <NotificationDropdown />}
            
            {loading ? (
              <Button variant="ghost" size="sm" disabled>
                Loading...
              </Button>
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Dashboard Link */}
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-1 text-xs text-gray-700 hover:text-primary px-2 py-1 rounded-md hover:bg-gray-100"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                {/* Messages Link */}
                <Link 
                  to="/dashboard/threads" 
                  className="flex items-center gap-1 text-xs text-gray-700 hover:text-primary px-2 py-1 rounded-md hover:bg-gray-100"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </Link>
                
                <Link to="/add-listing">
                  <Button size="sm" className="h-8 px-3 py-0 text-xs">
                    Add Listing
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 py-0 text-xs"
                  onClick={() => signOut()}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="sm" variant="ghost" className="h-8 px-3 py-0 text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link to="/add-listing">
                  <Button size="sm" variant="default" className="h-8 px-3 py-0 text-xs">
                    Sell my car
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ScrollNav;
