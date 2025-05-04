
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Home, CarFront, Plus, LogOut, LogIn, ChevronDown, ChevronUp } from "lucide-react";
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
          <span className="text-xl font-bold text-[#007ac8]">Car Swift Offer</span>
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
                    <span className="text-base">Buy</span>
                  </div>
                  {openDropdowns.buy ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {buyItems.map((item) => (
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

          {/* Sell Dropdown */}
          <SidebarMenuItem>
            <Collapsible open={openDropdowns.sell}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  className="flex items-center gap-3 justify-between w-full"
                  onClick={() => toggleDropdown('sell')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">Sell</span>
                  </div>
                  {openDropdowns.sell ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {sellItems.map((item) => (
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
                    <span className="text-base">Research</span>
                  </div>
                  {openDropdowns.research ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {researchItems.map((item) => (
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

          {/* Showroom Dropdown */}
          <SidebarMenuItem>
            <Collapsible open={openDropdowns.showroom}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  className="flex items-center gap-3 justify-between w-full"
                  onClick={() => toggleDropdown('showroom')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">Showroom</span>
                  </div>
                  {openDropdowns.showroom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {showroomItems.map((item) => (
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
              
              <SidebarSeparator className="my-2" />
              
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
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link 
                  to="/auth" 
                  className={`flex items-center gap-3 ${isCurrentPath('/auth') ? 'text-[#007ac8] font-medium' : ''}`}
                >
                  <LogIn className="h-5 w-5" />
                  <span className="text-base">Sign In</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
