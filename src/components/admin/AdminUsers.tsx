
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from auth.users table using admin functions
      const { data: usersData, error: usersError } = await supabase
        .from("users_view")
        .select("*");

      if (usersError) {
        throw usersError;
      }

      // Get admin users
      const { data: adminsData, error: adminsError } = await supabase
        .from("admins")
        .select("user_id");

      if (adminsError) {
        throw adminsError;
      }

      const adminIds = adminsData.map((admin) => admin.user_id);

      // Combine the data
      const enhancedUsers = usersData.map((user) => ({
        ...user,
        is_admin: adminIds.includes(user.id),
      }));

      setUsers(enhancedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        // Remove admin role
        const { error } = await supabase
          .from("admins")
          .delete()
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Add admin role
        const { error } = await supabase
          .from("admins")
          .insert({ user_id: userId });

        if (error) throw error;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: !currentStatus } : user
      ));

      toast({
        title: "Success",
        description: `User ${currentStatus ? "removed from" : "added to"} administrators`,
      });
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast({
        title: "Error",
        description: "Failed to update user admin status",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Search users by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Button onClick={fetchUsers} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Admin Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_admin 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.is_admin ? "Admin" : "User"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant={user.is_admin ? "destructive" : "outline"} 
                      size="sm"
                      onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                    >
                      {user.is_admin ? "Revoke Admin" : "Make Admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
