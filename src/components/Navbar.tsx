
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MobileSidebar } from "./MobileSidebar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

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

const Navbar = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="w-full bg-white shadow-md border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center gap-3">
              {isMobile && (
                <SidebarTrigger className="h-8 w-8 text-gray-700" />
              )}
              <Link to="/" className="flex items-center">
                <img
                  src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg"
                  alt="Snap My Car"
                  className="h-10 w-auto max-w-full object-contain"
                />
              </Link>
              <div className="hidden md:block ml-4">
                <NavigationMenu className="h-auto">
                  <NavigationMenuList className="h-auto">
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-8 py-1 text-sm">Buy</NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white absolute z-50 shadow-lg rounded-md">
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
                                to="/"
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
                                  to="/"
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
                                  to="/"
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

                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-6 py-0 text-xs">Sell</NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white absolute z-50 shadow-lg rounded-md p-4">
                        <div className="w-48">
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

                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-6 py-0 text-xs">Research</NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white absolute z-50 shadow-lg rounded-md">
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
                            {popularMakes.map((make) => (
                              <Link
                                key={make}
                                to="/"
                                className="block py-1 text-sm hover:text-[#007ac8]"
                              >
                                {make}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-6 py-0 text-xs">Showroom</NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white absolute z-50 shadow-lg rounded-md">
                        <div className="grid grid-cols-2 gap-4 p-4 w-[600px]">
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
                            {bodyTypes.map((type) => (
                              <Link
                                key={type}
                                to="/"
                                className="block py-1 text-sm hover:text-[#007ac8]"
                              >
                                {type}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <Link to="/value-my-car" className="text-gray-700 hover:text-[#007ac8] py-0 px-3 block text-xs">
                        Value my car
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" className="h-10 py-2 text-sm">Sign up/Log in</Button>
              <Button className="bg-[#007ac8] hover:bg-[#0069b4] h-10 py-2 text-sm">
                Sell my car
              </Button>
            </div>
          </div>
        </nav>
        {isMobile && <MobileSidebar />}
      </div>
    </SidebarProvider>
  );
};

export default Navbar;
