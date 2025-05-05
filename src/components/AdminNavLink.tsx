
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const AdminNavLink = () => {
  const { isAdmin, loading, user, checkAdminStatus } = useAuth();

  // More detailed debugging to see what's happening
  console.log("AdminNavLink - isAdmin:", isAdmin, "loading:", loading, "user:", user?.id);

  // Force a check of admin status when the component mounts
  useEffect(() => {
    if (user && !loading) {
      console.log("AdminNavLink - Checking admin status");
      checkAdminStatus().then(result => {
        console.log("AdminNavLink - Admin check result:", result);
      });
    }
  }, [user, loading, checkAdminStatus]);

  // Don't render anything if we're loading or the user is not an admin
  if (loading) {
    console.log("AdminNavLink - Still loading");
    return null;
  }

  if (!isAdmin) {
    console.log("AdminNavLink - User is not admin");
    return null;
  }

  console.log("AdminNavLink - Rendering admin link");
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
