
import React from 'react';
import TrustedBanner from '@/components/TrustedBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Account = () => {
  const { user, username, signOut } = useAuth();

  // If not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return user?.email ? user.email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TrustedBanner />
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-md">
            <CardHeader className="flex flex-col items-center sm:flex-row sm:justify-between">
              <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-[#007ac8] text-white text-xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-4 sm:mt-0 text-center sm:text-left">
                  <CardTitle className="text-2xl">{username || 'My Account'}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <Button 
                variant="outline"
                className="mt-4 sm:mt-0"
                onClick={signOut}
              >
                Log Out
              </Button>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Link to="/dashboard" className="block">
                  <div className="rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                    <h3 className="text-lg font-medium">My Dashboard</h3>
                    <p className="text-sm text-gray-500 mt-2">View your listings, messages, and activity</p>
                  </div>
                </Link>
                
                <Link to="/dashboard/threads" className="block">
                  <div className="rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                    <h3 className="text-lg font-medium">My Messages</h3>
                    <p className="text-sm text-gray-500 mt-2">View and respond to your messages</p>
                  </div>
                </Link>
                
                <Link to="/add-listing" className="block">
                  <div className="rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                    <h3 className="text-lg font-medium">Add a Listing</h3>
                    <p className="text-sm text-gray-500 mt-2">List a new vehicle for sale</p>
                  </div>
                </Link>
                
                <Link to="/snap-ai" className="block">
                  <div className="rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                    <h3 className="text-lg font-medium">Use Snap AI</h3>
                    <p className="text-sm text-gray-500 mt-2">Identify and value your car instantly</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
