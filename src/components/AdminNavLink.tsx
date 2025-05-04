
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const AdminNavLink = () => {
  const { isAdmin, loading } = useAuth();

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
