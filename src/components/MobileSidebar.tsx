
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Home, CarFront, Plus, LogOut, LogIn, ChevronDown, ChevronUp, Bell, ShoppingBag, Search, CircleHelp, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
    <Sidebar>
      <SidebarHeader className="border-b p-4 bg-white">
        <Link to="/">
          <img 
            src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg" 
            alt="Car Swift Offer" 
            className="h-8 w-auto" 
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link 
                to="/" 
                className={`flex items-center gap-3 ${isCurrentPath('/') ? 'text-[#007ac8] font-medium' : ''}`}
              >
                <Home className="h-5 w-5" />
                <span className="text-base">Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Buy Dropdown */}
          <SidebarMenuItem>
            <Collapsible open={openDropdowns.buy}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  className="flex items-center gap-3 justify-between w-full"
                  onClick={() => toggleDropdown('buy')}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5" />
                    <span className="text-base">Buy</span>
                  </div>
                  {openDropdowns.buy ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {buyDropdownItems.map((item) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton 
                        asChild 
                        isActive={isCurrentPath(item.href)}
                      >
                        <Link to={item.href}>{item.title}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                  <SidebarMenuSubItem>
                    <div className="pl-2 pt-2 pb-1 font-medium text-sm">Popular makes</div>
                  </SidebarMenuSubItem>
                  {popularMakes.slice(0, 6).map((make) => (
                    <SidebarMenuSubItem key={make}>
                      <SidebarMenuSubButton asChild>
                        <Link to="/cars">{make}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                  <SidebarMenuSubItem>
                    <div className="pl-2 pt-2 pb-1 font-medium text-sm">Body types</div>
                  </SidebarMenuSubItem>
                  {bodyTypes.slice(0, 5).map((type) => (
                    <SidebarMenuSubItem key={type}>
                      <SidebarMenuSubButton asChild>
                        <Link to="/cars">{type}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          {/* Sell Dropdown */}
          <SidebarMenuItem>
            <Collapsible open={openDropdowns.sell}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  className="flex items-center gap-3 justify-between w-full"
                  onClick={() => toggleDropdown('sell')}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5" />
                    <span className="text-base">Sell</span>
                  </div>
                  {openDropdowns.sell ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {sellDropdownItems.map((item) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton 
                        asChild 
                        isActive={isCurrentPath(item.href)}
                      >
                        <Link to={item.href}>{item.title}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          {/* Research Dropdown */}
          <SidebarMenuItem>
            <Collapsible open={openDropdowns.research}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  className="flex items-center gap-3 justify-between w-full"
                  onClick={() => toggleDropdown('research')}
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5" />
                    <span className="text-base">Research</span>
                  </div>
                  {openDropdowns.research ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {researchDropdownItems.map((item) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton 
                        asChild 
                        isActive={isCurrentPath(item.href)}
                      >
                        <Link to={item.href}>{item.title}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                  <SidebarMenuSubItem>
                    <div className="pl-2 pt-2 pb-1 font-medium text-sm">Popular makes</div>
                  </SidebarMenuSubItem>
                  {popularMakes.slice(0, 4).map((make) => (
                    <SidebarMenuSubItem key={make}>
                      <SidebarMenuSubButton asChild>
                        <Link to="/research">{make}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          {/* Showroom Dropdown */}
          <SidebarMenuItem>
            <Collapsible open={openDropdowns.showroom}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  className="flex items-center gap-3 justify-between w-full"
                  onClick={() => toggleDropdown('showroom')}
                >
                  <div className="flex items-center gap-3">
                    <CarFront className="h-5 w-5" />
                    <span className="text-base">Showroom</span>
                  </div>
                  {openDropdowns.showroom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {showroomDropdownItems.map((item) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton 
                        asChild 
                        isActive={isCurrentPath(item.href)}
                      >
                        <Link to={item.href}>{item.title}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                  <SidebarMenuSubItem>
                    <div className="pl-2 pt-2 pb-1 font-medium text-sm">Body types</div>
                  </SidebarMenuSubItem>
                  {bodyTypes.slice(0, 4).map((type) => (
                    <SidebarMenuSubItem key={type}>
                      <SidebarMenuSubButton asChild>
                        <Link to="/showroom">{type}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link 
                to="/value-my-car" 
                className={`flex items-center gap-3 ${isCurrentPath('/value-my-car') ? 'text-[#007ac8] font-medium' : ''}`}
              >
                <CarFront className="h-5 w-5" />
                <span className="text-base">Value my car</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator className="my-2" />
          
          {user ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/add-listing" 
                    className={`flex items-center gap-3 ${isCurrentPath('/add-listing') ? 'text-[#007ac8] font-medium' : ''}`}
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-base">Add Listing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/account" 
                    className={`flex items-center gap-3 ${isCurrentPath('/account') ? 'text-[#007ac8] font-medium' : ''}`}
                  >
                    <User className="h-5 w-5" />
                    <span className="text-base">My Account</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleSignOut} 
                  className="flex items-center gap-3"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-base">Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/auth" 
                    className={`flex items-center gap-3 ${isCurrentPath('/auth') ? 'text-[#007ac8] font-medium' : ''}`}
                  >
                    <LogIn className="h-5 w-5" />
                    <span className="text-base">Sign In / Sign Up</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/help" className="flex items-center gap-3">
                <CircleHelp className="h-5 w-5" />
                <span className="text-base">Help</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
