
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { formatRelative } from 'date-fns';
import { SendIcon, XIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  sender_id: string | null;
  receiver_id: string | null;
  inserted_at: string;
}

interface ChatProps {
  listingId: string;
  receiverId?: string;
  onClose?: () => void;
  className?: string;
  isPopup?: boolean;
}

export const Chat: React.FC<ChatProps> = ({ 
  listingId, 
  receiverId,
  onClose,
  className = '',
  isPopup = false
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('listing_id', listingId)
        .or(`sender_id.eq.${user?.id || null},receiver_id.eq.${user?.id || null}`)
        .order('inserted_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
      
      if (data) {
        // Check if there are new messages before updating state
        const hasNewMessages = initialLoadComplete && data.length > messages.length;
        
        setMessages(data);
        
        // Don't auto-scroll on initial load, only when new messages arrive AND user hasn't scrolled up
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        } else if (hasNewMessages && !userScrolled && scrollContainerRef.current) {
          // Check if user is already near bottom (within 100px)
          const { scrollHeight, scrollTop, clientHeight } = scrollContainerRef.current;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
          
          if (isNearBottom) {
            // Smoothly scroll to new messages
            setTimeout(() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'end'
                });
              }
            }, 100);
          }
        }
        
        // Mark messages as read if the user is the receiver
        if (user && receiverId) {
          try {
            await supabase.rpc('mark_messages_as_read', {
              p_listing_id: listingId,
              p_sender_id: receiverId,
              p_receiver_id: user.id
            });
          } catch (error) {
            console.error('Error marking messages as read:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Start polling when component mounts
  useEffect(() => {
    fetchMessages();
    
    // Set up polling interval (every 3 seconds)
    const interval = window.setInterval(fetchMessages, 3000);
    setPollingInterval(interval);
    
    return () => {
      // Clean up polling when component unmounts
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [listingId, user?.id, receiverId]);
  
  // Initial scroll to bottom after messages load
  useEffect(() => {
    if (initialLoadComplete && !userScrolled && messagesEndRef.current && messages.length > 0) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
      }, 100);
    }
  }, [initialLoadComplete, messages.length]);
  
  // Handle scroll events
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollHeight, scrollTop, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // If user scrolls up more than 100px from bottom, mark as user scrolled
    if (distanceFromBottom > 100) {
      setUserScrolled(true);
    } else {
      // If user scrolls back to bottom, reset userScrolled
      setUserScrolled(false);
    }
  };
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    setSending(true);
    
    try {
      const messageData = {
        listing_id: listingId,
        content: newMessage,
        sender_id: user ? user.id : null,
        receiver_id: receiverId || null
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(messageData);
        
      if (error) {
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Clear the input field immediately
      setNewMessage('');
      
      // Fetch new messages
      await fetchMessages();
      
      // Reset userScrolled to scroll to the bottom after sending
      setUserScrolled(false);
      
      // Scroll to bottom smoothly - but contained within the chat area
      setTimeout(() => {
        if (messagesEndRef.current && scrollContainerRef.current) {
          // Using scrollIntoView with the container's scrolling
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }
      }, 100);
      
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatRelative(new Date(timestamp), new Date());
    } catch (error) {
      return 'Unknown time';
    }
  };
  
  const isOwnMessage = (senderId: string | null) => {
    return user?.id === senderId;
  };

  return (
    <aside className={`flex flex-col border rounded-lg shadow-md bg-white ${isPopup ? 'h-full' : ''} ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b bg-primary text-white">
        <h2 className="text-lg font-semibold">Conversation</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-primary-dark">
            <XIcon className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Messages Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-grow p-4 overflow-y-auto" 
        style={{ maxHeight: isPopup ? '350px' : '400px' }}
        role="log"
        aria-live="polite"
        onScroll={handleScroll}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <div className="h-2 w-2 bg-primary rounded-full"></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-500">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <SendIcon className="h-6 w-6 text-primary" />
            </div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex flex-col ${isOwnMessage(message.sender_id) ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`px-4 py-2 rounded-lg max-w-[80%] ${
                    isOwnMessage(message.sender_id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
                <span 
                  className="text-xs text-gray-500 mt-1"
                  aria-label="Message sent"
                >
                  {formatTimestamp(message.inserted_at)}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <form 
        onSubmit={sendMessage}
        className="border-t p-3 flex gap-2 items-center"
      >
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          className="flex-grow"
          aria-label="Message input"
        />
        <Button 
          type="submit" 
          disabled={sending || !newMessage.trim()}
          aria-label="Send message"
          className="bg-primary hover:bg-primary/90"
        >
          <SendIcon className="h-4 w-4 mr-1" />
          Send
        </Button>
      </form>
    </aside>
  );
};

export default Chat;
