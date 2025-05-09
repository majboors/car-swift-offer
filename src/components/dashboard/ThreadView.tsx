
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Chat } from '@/components/chat/Chat';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronLeft, Loader2, UserIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatRelative } from 'date-fns';

interface Thread {
  user_id: string;
  email?: string;
  last_message_time: string;
  unread_count: number;
}

const ThreadView = () => {
  const { id: listingId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [listingTitle, setListingTitle] = useState('');

  useEffect(() => {
    const fetchThreads = async () => {
      if (!user || !listingId) return;
      
      try {
        // First, get the listing details
        const { data: listingData, error: listingError } = await supabase
          .from('car_listings')
          .select('title')
          .eq('id', listingId)
          .single();
          
        if (listingError) throw listingError;
        
        if (listingData) {
          setListingTitle(listingData.title);
        }
        
        // Get unique users who have sent messages related to this listing
        const { data, error } = await supabase
          .from('messages')
          .select('sender_id, inserted_at')
          .eq('listing_id', listingId)
          .neq('sender_id', user.id)
          .order('inserted_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Group by sender_id to get unique threads
          const threadMap = new Map<string, Thread>();
          
          for (const message of data) {
            if (message.sender_id && !threadMap.has(message.sender_id)) {
              // Get the user email for display
              const { data: userData } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', message.sender_id)
                .maybeSingle();
                
              // Get unread count for this thread
              const { count, error: countError } = await supabase
                .from('messages')
                .select('*', { count: 'exact' })
                .eq('listing_id', listingId)
                .eq('sender_id', message.sender_id)
                .eq('receiver_id', user.id)
                .eq('read', false);
                
              if (countError) console.error('Error getting unread count:', countError);
              
              threadMap.set(message.sender_id, {
                user_id: message.sender_id,
                email: userData?.email || 'Unknown User',
                last_message_time: message.inserted_at,
                unread_count: count || 0
              });
            }
          }
          
          setThreads(Array.from(threadMap.values()));
        }
      } catch (error: any) {
        toast({
          title: "Error loading threads",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
    
    // Set up polling to refresh threads
    const interval = setInterval(fetchThreads, 5000);
    
    return () => clearInterval(interval);
  }, [user, listingId]);

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatRelative(new Date(timestamp), new Date());
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <main className="container mx-auto py-6 px-4" aria-labelledby="threads-heading">
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/dashboard">
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/dashboard">
            My Listings
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>
            Threads for {listingTitle || 'Loading...'}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to My Listings
        </Link>
      </div>
      
      <h1 id="threads-heading" className="text-2xl font-bold mb-6">
        Messages for {listingTitle}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thread List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-lg mb-4">Conversations</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No messages yet</p>
              </div>
            ) : (
              <ul className="space-y-2" role="list">
                {threads.map(thread => (
                  <li key={thread.user_id}>
                    <Button 
                      variant={selectedThread === thread.user_id ? "default" : "outline"} 
                      className="w-full flex justify-between items-center h-auto py-3 text-left"
                      onClick={() => setSelectedThread(thread.user_id)}
                    >
                      <div className="flex items-center">
                        <div className="bg-gray-200 rounded-full p-2 mr-3">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{thread.email}</p>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(thread.last_message_time)}
                          </p>
                        </div>
                      </div>
                      
                      {thread.unread_count > 0 && (
                        <span 
                          className="bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"
                          aria-label={`${thread.unread_count} unread messages`}
                        >
                          {thread.unread_count}
                        </span>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Chat View */}
        <div className="md:col-span-2">
          {selectedThread ? (
            <Chat 
              listingId={listingId || ''}
              receiverId={selectedThread}
              className="h-full min-h-[500px]"
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-center min-h-[500px]">
              <p className="text-gray-500">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ThreadView;
