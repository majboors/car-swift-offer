
import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Search, DollarSign, Camera, User, Settings, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const MobileSidebar = () => {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Main Navigation Links */}
      <SheetHeader className="border-b pb-4 mb-4">
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>
      
      <nav className="space-y-1">
        <SidebarLink to="/">
          <Home className="h-5 w-5 mr-3" />
          Home
        </SidebarLink>
        
        <SidebarLink to="/search">
          <Search className="h-5 w-5 mr-3" />
          All Cars
        </SidebarLink>
        
        <SidebarLink to="/value-my-car">
          <DollarSign className="h-5 w-5 mr-3" />
          Value My Car
        </SidebarLink>
        
        <SidebarLink to="/api-testing">
          <Camera className="h-5 w-5 mr-3" />
          AI Car ID
        </SidebarLink>
        
        {user && (
          <SidebarLink to="/dashboard">
            <User className="h-5 w-5 mr-3" />
            Dashboard
          </SidebarLink>
        )}
        
        {isAdmin && (
          <SidebarLink to="/admin">
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
          <SidebarLink to="/search?category=sedan">Sedan</SidebarLink>
          <SidebarLink to="/search?category=suv">SUV</SidebarLink>
          <SidebarLink to="/search?category=coupe">Coupe</SidebarLink>
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
                signOut();
              }}
              className="w-full text-left hover:bg-gray-100 py-2 px-4 rounded-md"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <SidebarLink to="/auth">
              Login
            </SidebarLink>
            <SidebarLink to="/auth">
              Register
            </SidebarLink>
          </div>
        )}
      </div>
      
      {/* Add Listing Button */}
      <div className="mt-4">
        <Link to="/add-listing">
          <button className="w-full bg-[#007ac8] text-white py-3 rounded-md hover:bg-[#0069b4] flex items-center justify-center">
            <Plus className="h-5 w-5 mr-2" />
            Add a Listing
          </button>
        </Link>
      </div>
    </div>
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
