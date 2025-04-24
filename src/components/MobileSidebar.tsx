import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home, LogIn, CarFront, ShoppingBag, Bell, User, Search, CircleHelp } from "lucide-react";

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

export function MobileSidebar() {
  const location = useLocation();
  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link to="/">
          <img
            src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg"
            alt="Snap My Car"
            className="h-8 w-auto"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <LogIn className="h-5 w-5" />
                  <span className="text-base">Sign up/Log in</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator className="my-4" />

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5" />
                  <span className="text-base">Home</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="text-base">Buy</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <span className="text-base">Sell</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5" />
                  <span className="text-base">Research</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <span className="text-base">Showroom</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </SidebarMenuButton>
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

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  <span className="text-base">My account</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <CircleHelp className="h-5 w-5" />
                  <span className="text-base">Help</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
