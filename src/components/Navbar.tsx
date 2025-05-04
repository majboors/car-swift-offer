
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

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
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#007ac8] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#007ac8]"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on state */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#007ac8] hover:bg-gray-100"
          >
            Home
          </Link>
          <Link
            to="/value-my-car"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#007ac8] hover:bg-gray-100"
          >
            Value My Car
          </Link>
          
          {user ? (
            <>
              <Link
                to="/add-listing"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#007ac8] hover:bg-gray-100"
              >
                Add Listing
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#007ac8] hover:bg-gray-100"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#007ac8] hover:bg-gray-100"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
