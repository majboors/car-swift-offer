
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TrustedBanner from '@/components/TrustedBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DashboardListings from '@/components/dashboard/DashboardListings';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TrustedBanner />
        <Navbar />
        <div className="flex-grow flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth?redirect=/dashboard" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TrustedBanner />
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600 mb-6">Manage your listings and messages</p>
          
          <Separator className="my-6" />
          
          <DashboardListings />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
