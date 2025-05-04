
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
        const { data, error } = await supabase
          .from("admins")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setIsAdmin(true);
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
