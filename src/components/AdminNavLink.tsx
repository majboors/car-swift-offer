
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const AdminNavLink = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;

      try {
        // Use the RPC function instead of direct table access
        const { data, error } = await supabase
          .rpc('get_all_admins');

        if (!error && data) {
          // Check if current user is in the admin list
          const isUserAdmin = data.some((admin: any) => admin.user_id === user.id);
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
