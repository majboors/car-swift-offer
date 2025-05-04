
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminListings } from "@/components/admin/AdminListings";
import { Loader } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/Navbar";

type AdminUser = { id: string; user_id: string; created_at: string };

const Admin = () => {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      if (!user || !session) {
        console.log("No user or session found, redirecting to auth page");
        toast({
          title: "Authentication required",
          description: "Please login to access this page",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      try {
        console.log("Admin page - Checking for user:", user.id);
        
        // First create default admin if needed
        await createDefaultAdmin();
        
        // Then check admin status and wait for the result
        const isUserAdmin = await checkAdminAccess();
        console.log("Admin check result:", isUserAdmin);
        
        // Update state based on admin status
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          console.log("User is not an admin, redirecting to home page");
          toast({
            title: "Access denied",
            description: "You do not have permission to access the admin dashboard",
            variant: "destructive",
          });
          navigate("/");
        } else {
          console.log("Admin access granted, showing admin dashboard");
        }
      } catch (error) {
        console.error("Admin initialization error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while checking admin status",
          variant: "destructive",
        });
        setIsAdmin(false);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [user, session, navigate]);

  const createDefaultAdmin = async () => {
    try {
      console.log("Creating default admin from Admin page...");
      await supabase.functions.invoke('create_default_admin', {
        method: 'POST',
      });
      console.log("Default admin creation completed");
    } catch (error) {
      console.error("Failed to create default admin:", error);
    }
  };

  const checkAdminAccess = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log("Checking admin status for user:", user.id);
      
      const { data, error } = await supabase.functions.invoke<AdminUser[]>('get_all_admins', {
        method: 'POST',
      });

      console.log("Admin check data:", data);
      console.log("Admin check error:", error);

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      // Check if current user is in the admin list
      const isUserAdmin = data ? data.some((admin) => admin.user_id === user.id) : false;
      console.log("Is user admin:", isUserAdmin, "User ID:", user.id);
      
      return isUserAdmin;
    } catch (error) {
      console.error("Error checking admin access:", error);
      return false;
    }
  };

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading admin dashboard...</span>
      </div>
    );
  }

  // If not admin, will redirect in useEffect
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking admin privileges...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="listings">Manage Listings</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="listings">
            <AdminListings />
          </TabsContent>
          
          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Admin;
