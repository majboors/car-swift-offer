
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { MobileSidebar } from "./MobileSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { AdminNavLink } from "./AdminNavLink";
import { Bell } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink
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

export function Navbar() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MobileSidebar />
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold inline-block">CarTrade</span>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            {/* Main Navigation Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                {/* Buy Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Buy</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-3 p-4 w-[800px]">
                      <div>
                        <h3 className="font-medium mb-2 text-sm">Primary Links</h3>
                        <ul className="space-y-2">
                          {buyDropdownItems.map((item) => (
                            <li key={item.title}>
                              <Link to={item.href} className="text-sm hover:text-primary">
                                {item.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2 text-sm">Popular Makes</h3>
                        <ul className="grid grid-cols-2 gap-2">
                          {popularMakes.map((make) => (
                            <li key={make}>
                              <Link to="/" className="text-sm hover:text-primary">
                                {make}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="mb-4">
                          <h3 className="font-medium mb-2 text-sm">Body Types</h3>
                          <ul className="grid grid-cols-2 gap-2">
                            {bodyTypes.map((type) => (
                              <li key={type}>
                                <Link to="/" className="text-sm hover:text-primary">
                                  {type}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2 text-sm">Locations</h3>
                          <ul className="grid grid-cols-2 gap-2">
                            {locations.map((location) => (
                              <li key={location}>
                                <Link to="/" className="text-sm hover:text-primary">
                                  {location}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Sell Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Sell</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid p-4 w-[200px] gap-2">
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

                {/* Research Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Research</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-2 p-4 w-[600px]">
                      <div>
                        <h3 className="font-medium mb-2 text-sm">Research Links</h3>
                        <ul className="space-y-2">
                          {researchDropdownItems.map((item) => (
                            <li key={item.title}>
                              <Link to={item.href} className="text-sm hover:text-primary">
                                {item.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2 text-sm">Popular Makes</h3>
                        <ul className="grid grid-cols-2 gap-2">
                          {popularMakes.map((make) => (
                            <li key={make}>
                              <Link to="/" className="text-sm hover:text-primary">
                                {make}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Showroom Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Showroom</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-2 p-4 w-[500px]">
                      <div>
                        <h3 className="font-medium mb-2 text-sm">Showroom Links</h3>
                        <ul className="space-y-2">
                          {showroomDropdownItems.map((item) => (
                            <li key={item.title}>
                              <Link to={item.href} className="text-sm hover:text-primary">
                                {item.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2 text-sm">Popular Body Types</h3>
                        <ul className="space-y-2">
                          {bodyTypes.map((type) => (
                            <li key={type}>
                              <Link to="/" className="text-sm hover:text-primary">
                                {type}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Value My Car (single link) */}
                <NavigationMenuItem>
                  <Link to="/value-my-car" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    Value my car
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <AdminNavLink />
          </nav>
        </div>
        
        {/* Right Side Utility Buttons */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="mr-2">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            {loading ? (
              <Button variant="ghost" size="sm" disabled>
                Loading...
              </Button>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link to="/add-listing">
                  <Button size="sm" className="px-4">
                    Add Listing
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-4"
                  onClick={() => signOut()}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="sm" variant="ghost">
                    Sign In
                  </Button>
                </Link>
                <Button size="sm" variant="default" className="ml-2">
                  Sell my car
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

// Need to add a default export to match the import in Index.tsx
export default Navbar;
