
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

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
              <Link to="/value-my-car">Value my car</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-sm font-medium">Buy</h3>
            {buyDropdownItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.href}>{item.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>

          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-sm font-medium">Sell</h3>
            {sellDropdownItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.href}>{item.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>

          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-sm font-medium">Research</h3>
            {researchDropdownItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.href}>{item.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>

          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-sm font-medium">Showroom</h3>
            {showroomDropdownItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.href}>{item.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
