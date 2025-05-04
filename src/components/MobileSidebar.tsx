
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
import { Home, CarFront, Plus, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function MobileSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isCurrentPath = (path: string) => location.pathname === path;

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
