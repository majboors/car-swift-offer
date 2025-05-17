
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Loader2, MessageSquareIcon, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Listing {
  id: string;
  title: string;
  price: number;
  year: number;
  make: string;
  model: string;
  images: string[] | any; // Updated to accept any to handle JSON
  status: string; // Added status field
}

interface UnreadCount {
  listing_id: string;
  unread_count: number;
}

const DashboardListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      
      try {
        // Fetch the user's listings
        const { data, error } = await supabase
          .from('car_listings')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        if (data) {
          // Convert the data to match our Listing type
          const typedListings = data.map(item => ({
            ...item,
            images: Array.isArray(item.images) ? item.images : 
                   (item.images ? [item.images.toString()] : [])
          })) as Listing[];
          
          setListings(typedListings);
          
          // Fetch unread message counts for each listing
          const { data: unreadData, error: unreadError } = await supabase
            .rpc('get_unread_message_count', {
              user_id: user.id
            });
            
          if (unreadError) throw unreadError;
          
          if (unreadData) {
            const unreadMap: Record<string, number> = {};
            (unreadData as UnreadCount[]).forEach(item => {
              unreadMap[item.listing_id] = item.unread_count;
            });
            setUnreadCounts(unreadMap);
          }
        }
      } catch (error: any) {
        toast({
          title: "Error loading listings",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
    
    // Set up polling for unread counts
    const interval = setInterval(async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .rpc('get_unread_message_count', {
            user_id: user.id
          });
          
        if (error) throw error;
        
        if (data) {
          const unreadMap: Record<string, number> = {};
          (data as UnreadCount[]).forEach(item => {
            unreadMap[item.listing_id] = item.unread_count;
          });
          setUnreadCounts(unreadMap);
        }
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user]);

  const getListingStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">You haven't listed any cars yet</h2>
        <p className="mb-4">When you list a car for sale, it will appear here.</p>
        <Link 
          to="/add-listing" 
          className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Add Your First Listing
        </Link>
      </div>
    );
  }

  return (
    <section aria-labelledby="my-listings-heading">
      <h1 id="my-listings-heading" className="text-2xl font-bold mb-6">My Listings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(listing => {
          // Check if this listing has unread messages
          const hasUnread = unreadCounts[listing.id] && unreadCounts[listing.id] > 0;
          const isPending = listing.status === 'pending';
          const isRejected = listing.status === 'rejected';
          
          return (
            <Card 
              key={listing.id} 
              className={cn(
                "overflow-hidden hover:shadow-lg transition-shadow border",
                hasUnread ? "border-primary border-2" : 
                isPending ? "border-amber-400 border-2" :
                isRejected ? "border-red-400 border-2" : "border-border"
              )}
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={Array.isArray(listing.images) ? listing.images[0] : ''} 
                    alt={listing.title}
                    className="w-full h-[160px] object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-[160px] flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>
              
              <CardHeader className={cn(
                "pb-2",
                hasUnread ? "bg-primary/5" : 
                isPending ? "bg-amber-50" : 
                isRejected ? "bg-red-50" : ""
              )}>
                <CardTitle className="text-lg flex justify-between items-center">
                  <Link to={`/listing/${listing.id}`} className="hover:text-primary">
                    {listing.title || `${listing.year} ${listing.make} ${listing.model}`}
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    {getListingStatusIcon(listing.status)}
                    
                    {hasUnread && (
                      <span 
                        className="bg-red-500 text-white flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                        aria-label={`${unreadCounts[listing.id]} unread messages`}
                      >
                        <MessageSquareIcon className="h-3 w-3" />
                        {unreadCounts[listing.id]}
                      </span>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="font-semibold text-lg text-primary">
                  {formatCurrency(listing.price)}
                </p>
                
                <div className="mt-2 mb-3">
                  <div className={cn(
                    "text-xs px-2 py-1 rounded-full inline-block",
                    isPending ? "bg-amber-100 text-amber-800" : 
                    isRejected ? "bg-red-100 text-red-800" :
                    "bg-green-100 text-green-800"
                  )}>
                    {isPending ? "Pending Review" : 
                     isRejected ? "Rejected" : 
                     "Approved"}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <Link 
                    to={`/listing/${listing.id}`} 
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    View Listing
                  </Link>
                  <Link 
                    to={`/dashboard/threads/${listing.id}`}
                    className={cn(
                      "text-sm flex items-center gap-1",
                      hasUnread ? "text-primary font-medium" : "text-primary"
                    )}
                  >
                    <MessageSquareIcon className="h-4 w-4" />
                    Messages 
                    {hasUnread && (
                      <span className="bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {unreadCounts[listing.id]}
                      </span>
                    )}
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default DashboardListings;
