
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { formatRelative } from 'date-fns';
import { SendIcon, XIcon } from 'lucide-react';

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
}

export const Chat: React.FC<ChatProps> = ({ 
  listingId, 
  receiverId,
  onClose,
  className = ''
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  
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
        setMessages(data);
        
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
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
      fetchMessages(); // Fetch messages immediately after sending
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
    <aside className={`flex flex-col border rounded-lg shadow-md bg-white ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <h2 className="text-lg font-semibold">Conversation</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat">
            <XIcon className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Messages Container */}
      <div 
        className="flex-grow p-4 overflow-y-auto" 
        style={{ maxHeight: '400px' }}
        role="log"
        aria-live="polite"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
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
                      ? 'bg-blue-500 text-white'
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
        >
          <SendIcon className="h-4 w-4 mr-1" />
          Send
        </Button>
      </form>
    </aside>
  );
};

export default Chat;
