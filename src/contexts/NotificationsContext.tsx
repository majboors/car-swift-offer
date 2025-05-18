
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { showErrorToast, showNetworkError } from '@/utils/toast-utils';

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
  ensureUserProfile: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [networkErrorShown, setNetworkErrorShown] = useState(false);
  const maxRetries = 3;

  // New function to ensure user has a profile
  const ensureUserProfile = async () => {
    if (!user) return;
    
    try {
      // Call the function we created in the SQL migration
      await supabase.rpc('ensure_user_profile', { user_id_input: user.id });
      console.log("User profile check completed");
    } catch (error: any) {
      console.error("Error ensuring user profile:", error);
    }
  };

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
      // First ensure user has a profile
      await ensureUserProfile();
      
      // Then fetch notifications
      const { data, error } = await supabase.rpc('get_user_notifications', { p_user_id: user.id });
      
      if (error) {
        throw error;
      }
      
      setNotifications(data || []);
      setUnreadCount(data?.filter((n: Notification) => !n.read).length || 0);
      
      // Reset retry count and network error flag on success
      setRetryCount(0);
      setNetworkErrorShown(false);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      setHasError(true);
      
      // Only show toast error once per session, not on every retry
      if (!networkErrorShown) {
        setNetworkErrorShown(true);
        
        // Check if it's a network error
        if (error.message && error.message.includes("NetworkError")) {
          showNetworkError();
        } else {
          showErrorToast("Failed to load notifications. Will try again later.");
        }
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
    setRetryCount(0);
    setNetworkErrorShown(false);
  };

  // Retry strategy for failed notifications with increased delay
  useEffect(() => {
    if (hasError && retryCount < maxRetries && user) {
      // Exponential backoff with jitter for more reliable retries
      const baseDelay = 3000; // 3 seconds base
      const jitter = Math.random() * 1000; // Random value between 0-1000ms
      const delay = Math.min(baseDelay * Math.pow(2, retryCount) + jitter, 30000); // Max 30s delay
      
      console.log(`Retrying notifications fetch (attempt ${retryCount + 1}/${maxRetries})...`);
      
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchNotifications();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [hasError, retryCount, user]);

  // Initial fetch and set up event listeners
  useEffect(() => {
    if (user) {
      // Call ensureUserProfile first before fetching notifications
      ensureUserProfile().then(() => {
        fetchNotifications();
      });
      
      // Poll for new notifications less frequently (every 2 minutes)
      // to reduce network requests that might fail
      const interval = setInterval(() => {
        // Only poll if we haven't had persistent errors
        if (!(hasError && retryCount >= maxRetries)) {
          fetchUnreadCount();
        }
      }, 120000); // 2 minutes
      
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
    clearNotifications,
    ensureUserProfile
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
