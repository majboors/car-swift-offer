
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { showErrorToast } from '@/utils/toast-utils';

interface Notification {
  id: string;
  notification_id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  expires_at: string | null;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasError: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  clearNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setHasError(false);
      return;
    }

    setLoading(true);
    setHasError(false);
    try {
      const { data, error } = await supabase.rpc('get_user_notifications', { p_user_id: user.id });
      
      if (error) {
        throw error;
      }
      
      setNotifications(data || []);
      setUnreadCount(data?.filter((n: Notification) => !n.read).length || 0);
      // Reset retry count on success
      setRetryCount(0);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      setHasError(true);
      
      // Only show toast error once, not on every retry
      if (retryCount === 0) {
        showErrorToast("Failed to load notifications. Will try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user || hasError) {
      setUnreadCount(0);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_unread_notification_count', {
        p_user_id: user.id
      });
      
      if (error) {
        throw error;
      }
      
      setUnreadCount(data || 0);
    } catch (error: any) {
      console.error("Error fetching unread count:", error);
      // Don't set hasError here to allow main fetch to retry
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await supabase.rpc('mark_notification_read', {
        p_user_id: user.id,
        p_notification_id: notificationId
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.notification_id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      showErrorToast("Failed to mark notification as read");
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    setHasError(false);
  };

  // Retry strategy for failed notifications
  useEffect(() => {
    if (hasError && retryCount < maxRetries && user) {
      const timer = setTimeout(() => {
        console.log(`Retrying notifications fetch (attempt ${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
        fetchNotifications();
      }, Math.min(2000 * Math.pow(2, retryCount), 30000)); // Exponential backoff with max 30s delay
      
      return () => clearTimeout(timer);
    }
  }, [hasError, retryCount, user]);

  // Initial fetch and set up event listeners
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up a polling mechanism to check for new notifications every minute
      const interval = setInterval(() => {
        // Only poll for count if we haven't had errors fetching notifications
        if (!hasError) {
          fetchUnreadCount();
        }
      }, 60000);
      
      return () => clearInterval(interval);
    } else {
      clearNotifications();
    }
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    loading,
    hasError,
    fetchNotifications,
    markAsRead,
    clearNotifications
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
