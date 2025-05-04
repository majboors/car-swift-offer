
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type AdminUser = { id: string; user_id: string; created_at: string };

export const AdminNavLink = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Checking admin status in navbar for user:", user.id);
        
        const { data, error } = await supabase.functions.invoke<AdminUser[]>('get_all_admins', {
          method: 'POST',
        });

        if (!error && data) {
          // Check if current user is in the admin list
          const isUserAdmin = data.some((admin) => admin.user_id === user.id);
          console.log("AdminNavLink - Is user admin:", isUserAdmin, "User ID:", user.id);
          console.log("Admin data:", data);
          setIsAdmin(isUserAdmin);
        } else {
          console.error("Error checking admin status in navbar:", error);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status in navbar:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  if (isLoading || !isAdmin) return null;

  return (
    <Link 
      to="/admin" 
      className="text-sm font-medium transition-colors hover:text-primary"
    >
      Admin Dashboard
    </Link>
  );
};

export default AdminNavLink;
