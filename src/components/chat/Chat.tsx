
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [userInitiatedScroll, setUserInitiatedScroll] = useState(false);
  
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
        // Only scroll if:
        // 1. We're getting new messages after initial load
        // 2. User is near bottom (handled by scroll handler)
        // Don't scroll if user has manually scrolled up to read previous messages
        if (initialLoadComplete && data.length > messages.length && !userInitiatedScroll) {
          setShouldScrollToBottom(true);
        }
        
        setMessages(data);
        
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
          // Don't auto-scroll on initial load
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
  
  // Handle scroll position
  useEffect(() => {
    if (!shouldScrollToBottom || !messagesEndRef.current || userInitiatedScroll) return;
    
    // Use scrollIntoView with behavior: 'auto' to prevent page scrolling
    messagesEndRef.current.scrollIntoView({ 
      behavior: 'auto', 
      block: 'end',
      inline: 'nearest'
    });
    
    setShouldScrollToBottom(false);
  }, [messages, shouldScrollToBottom, userInitiatedScroll]);
  
  // Set up scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      // Check if user is near bottom (within 100px)
      const isNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      // If user scrolls up, set userInitiatedScroll to true
      if (!isNearBottom) {
        setUserInitiatedScroll(true);
      } else {
        // If user scrolls to bottom, reset userInitiatedScroll
        setUserInitiatedScroll(false);
      }
      
      setShouldScrollToBottom(isNearBottom);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
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
      
      setNewMessage('');
      await fetchMessages(); // Fetch messages immediately after sending
      
      // Only scroll after sending if the container exists and the user hasn't scrolled up
      if (messagesContainerRef.current && !userInitiatedScroll) {
        // Use requestAnimationFrame to ensure the DOM has updated
        requestAnimationFrame(() => {
          // Scroll the message container not the whole page
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ 
              behavior: 'auto',
              block: 'end',
              inline: 'nearest'
            });
          }
        });
      }
      
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
        ref={messagesContainerRef}
        className="flex-grow p-4 overflow-y-auto" 
        style={{ maxHeight: isPopup ? '350px' : '400px' }}
        role="log"
        aria-live="polite"
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
