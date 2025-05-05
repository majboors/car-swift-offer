
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const AdminNavLink = () => {
  const { isAdmin, loading } = useAuth();

  // Add debugging to see if isAdmin is correctly set
  console.log("AdminNavLink - isAdmin:", isAdmin, "loading:", loading);

  // Don't render anything if we're loading or the user is not an admin
  if (loading || !isAdmin) return null;

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
