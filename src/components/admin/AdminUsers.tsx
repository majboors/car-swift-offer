
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
import { AddUserForm } from "./AddUserForm";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

interface AdminUser {
  id: string;
  user_id: string;
  created_at: string;
}

interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  [key: string]: any; // For any additional properties
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Create default admin on component mount
    createDefaultAdmin();
    fetchUsers();
  }, []);

  const createDefaultAdmin = async () => {
    try {
      await supabase.functions.invoke('create_default_admin', {
        method: 'POST',
      });
    } catch (error) {
      console.error("Failed to create default admin:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Use a more direct type casting approach
      const { data: usersData, error: usersError } = await supabase.functions.invoke('get_all_users', {
        method: 'POST',
      }) as unknown as { 
        data: SupabaseUser[] | null, 
        error: Error | null 
      };

      if (usersError) {
        throw usersError;
      }

      if (!usersData) {
        setUsers([]);
        return;
      }

      // Use the same approach for get_all_admins
      const { data: adminsData, error: adminsError } = await supabase.functions.invoke('get_all_admins', {
        method: 'POST',
      }) as unknown as { 
        data: AdminUser[] | null, 
        error: Error | null 
      };

      if (adminsError) {
        throw adminsError;
      }

      // Create a map of admin user IDs for faster lookups
      const adminIds = adminsData ? adminsData.map((admin) => admin.user_id) : [];

      // Combine the data to create our enhanced users array
      const enhancedUsers: User[] = usersData.map((user) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
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
        // Use updated type casting approach for remove_admin
        const { error } = await supabase.functions.invoke('remove_admin', {
          method: 'POST',
          body: { user_id_input: userId }
        }) as unknown as {
          data: null,
          error: Error | null
        };

        if (error) throw error;
      } else {
        // Use updated type casting approach for add_admin
        const { error } = await supabase.functions.invoke('add_admin', {
          method: 'POST',
          body: { user_id_input: userId }
        }) as unknown as {
          data: null,
          error: Error | null
        };

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

  const handleAddUserSuccess = () => {
    setDialogOpen(false);
    fetchUsers();
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
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Add New User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <AddUserForm onSuccess={handleAddUserSuccess} />
            </DialogContent>
          </Dialog>

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
