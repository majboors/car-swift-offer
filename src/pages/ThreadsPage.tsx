
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TrustedBanner from '@/components/TrustedBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ThreadView from '@/components/dashboard/ThreadView';
import { Loader2 } from 'lucide-react';

const ThreadsPage: React.FC = () => {
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
    return <Navigate to="/auth?redirect=/dashboard/threads" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TrustedBanner />
      <Navbar />
      
      <div className="flex-grow">
        <ThreadView />
      </div>
      
      <Footer />
    </div>
  );
};

export default ThreadsPage;
