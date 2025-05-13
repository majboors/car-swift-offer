
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAdmin: boolean;
  checkAdminStatus: () => Promise<boolean>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if the user email is root@admin.com (primary admin)
      if (user.email === 'root@admin.com') {
        setIsAdmin(true);
        return true;
      }
      
      // Also check the admins table for other admins
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      const isUserAdmin = !!data;
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      await checkAdminStatus();
      setLoading(false);
    };
    
    if (user) {
      checkAdmin();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const value = {
    isAdmin,
    checkAdminStatus,
    loading,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
