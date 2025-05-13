import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Search, DollarSign, Camera, User, Settings, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MobileSidebar = ({ isOpen, setIsOpen }: MobileSidebarProps) => {
  const { user, logout } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        
        {/* Main Navigation Links */}
        <nav className="space-y-1">
          <SidebarLink to="/" onClick={() => setIsOpen(false)}>
            <Home className="h-5 w-5 mr-3" />
            Home
          </SidebarLink>
          
          <SidebarLink to="/search" onClick={() => setIsOpen(false)}>
            <Search className="h-5 w-5 mr-3" />
            All Cars
          </SidebarLink>
          
          <SidebarLink to="/value-my-car" onClick={() => setIsOpen(false)}>
            <DollarSign className="h-5 w-5 mr-3" />
            Value My Car
          </SidebarLink>
          
          <SidebarLink to="/api-testing" onClick={() => setIsOpen(false)}>
            <Camera className="h-5 w-5 mr-3" />
            AI Car ID
          </SidebarLink>
          
          {user && (
            <SidebarLink to="/dashboard" onClick={() => setIsOpen(false)}>
              <User className="h-5 w-5 mr-3" />
              Dashboard
            </SidebarLink>
          )}
          
          {isAdmin && (
            <SidebarLink to="/admin" onClick={() => setIsOpen(false)}>
              <Settings className="h-5 w-5 mr-3" />
              Admin
            </SidebarLink>
          )}
        </nav>
        
        {/* Categories Section */}
        <div className="py-4 border-b">
          <h4 className="font-semibold mb-2">Categories</h4>
          <nav className="space-y-1">
            {/* Add your categories here */}
            <SidebarLink to="/search?category=sedan" onClick={() => setIsOpen(false)}>Sedan</SidebarLink>
            <SidebarLink to="/search?category=suv" onClick={() => setIsOpen(false)}>SUV</SidebarLink>
            <SidebarLink to="/search?category=coupe" onClick={() => setIsOpen(false)}>Coupe</SidebarLink>
            {/* Add more categories as needed */}
          </nav>
        </div>
        
        {/* Authentication Section */}
        <div className="py-4 border-b">
          {user ? (
            <div className="space-y-2">
              <p>Logged in as {user.email}</p>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left hover:bg-gray-100 py-2 px-4 rounded-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <SidebarLink to="/auth" onClick={() => setIsOpen(false)}>
                Login
              </SidebarLink>
              <SidebarLink to="/auth" onClick={() => setIsOpen(false)}>
                Register
              </SidebarLink>
            </div>
          )}
        </div>
        
        {/* Add Listing Button */}
        <div className="mt-4">
          <Link to="/add-listing">
            <button className="w-full bg-[#007ac8] text-white py-3 rounded-md hover:bg-[#0069b4] flex items-center justify-center" onClick={() => setIsOpen(false)}>
              <Plus className="h-5 w-5 mr-2" />
              Add a Listing
            </button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface SidebarLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, children, onClick }) => (
  <Link to={to}>
    <button onClick={onClick} className="w-full text-left hover:bg-gray-100 py-2 px-4 rounded-md flex items-center">
      {children}
    </button>
  </Link>
);

export default MobileSidebar;
