
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';
import { Menu } from 'lucide-react';
import { MobileSidebar } from './MobileSidebar';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-[#007ac8]">
                Car Swift Offer
              </Link>
            </div>
            
            {/* Desktop nav links */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#007ac8]">
                Home
              </Link>
              <Link to="/value-my-car" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#007ac8]">
                Value My Car
              </Link>
            </div>
          </div>
          
          {/* Right side buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Link to="/add-listing">
                  <Button variant="outline" className="border-[#007ac8] text-[#007ac8] hover:bg-[#007ac8] hover:text-white">
                    Add Listing
                  </Button>
                </Link>
                <Button onClick={handleSignOut} variant="ghost">
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-[#007ac8] hover:bg-[#0069b4]">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-full sm:w-80">
                <MobileSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
