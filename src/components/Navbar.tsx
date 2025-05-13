import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import MobileSidebar from './MobileSidebar';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const unreadNotificationsCount = notifications.filter(notification => !notification.read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg" 
              alt="Car Trader Logo" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation - visible on md breakpoint and up */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className="text-gray-700 hover:text-[#007ac8]">Home</NavLink>
            <NavLink to="/search" className="text-gray-700 hover:text-[#007ac8]">All Cars</NavLink>
            <NavLink to="/value-my-car" className="text-gray-700 hover:text-[#007ac8]">Value My Car</NavLink>
            <NavLink to="/api-testing" className="text-gray-700 hover:text-[#007ac8]">AI Car ID</NavLink>
          </nav>
        </div>

        {/* User Navigation & Buttons */}
        <div className="flex items-center space-x-4">
          <SearchBar />

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/add-listing">
                <Button className="bg-[#007ac8] hover:bg-[#0069b4] text-white">
                  Add Listing
                </Button>
              </Link>
              
              <Link to="/dashboard">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || ""} alt={user.email || "User Avatar"} />
                  <AvatarFallback>{user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
              </Link>
              
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline">Log In</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-[#007ac8] hover:bg-[#0069b4] text-white">Sign Up</Button>
              </Link>
            </>
          )}

          {/* Mobile Navigation Button */}
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <MobileSidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Scrolling Categories Nav (Example - replace with your actual categories) */}
      {/* You can add a scrolling categories navigation here if needed */}
    </header>
  );
};

export default Navbar;
