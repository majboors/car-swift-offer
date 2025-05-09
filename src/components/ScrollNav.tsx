
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Navigation data
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

const ScrollNav: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { user, signOut, loading } = useAuth();
  
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
              alt="CarTrade"
              className="h-8 w-auto"
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
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>
        
        {/* Right Side Utility Buttons */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="mr-1 h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            {loading ? (
              <Button variant="ghost" size="sm" disabled>
                Loading...
              </Button>
            ) : user ? (
              <div className="flex items-center gap-2">
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
                <Button size="sm" variant="default" className="h-8 px-3 py-0 text-xs">
                  Sell my car
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ScrollNav;
