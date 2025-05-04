
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type AdminUser = { id: string; user_id: string; created_at: string };

export const AdminNavLink = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;

      try {
        // Use a more direct type casting approach
        const { data, error } = await supabase.functions.invoke('get_all_admins', {
          method: 'POST',
        }) as unknown as { 
          data: AdminUser[] | null, 
          error: Error | null 
        };

        if (!error && data) {
          // Check if current user is in the admin list
          const isUserAdmin = data.some((admin) => admin.user_id === user.id);
          setIsAdmin(isUserAdmin);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdmin();
  }, [user]);

  if (!isAdmin) return null;

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
