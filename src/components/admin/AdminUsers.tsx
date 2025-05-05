
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddUserForm } from "./AddUserForm";
import { Loader, UserPlus, Trash, Shield, ShieldOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) {
        throw error;
      }

      setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUserSuccess = () => {
    setShowAddUserForm(false);
    fetchUsers();
    toast({
      title: "Success",
      description: "User added successfully"
    });
  };

  const handleRemoveUser = async (userId: string, isAdmin: boolean) => {
    if (!window.confirm("Are you sure you want to remove this user?")) {
      return;
    }
    
    try {
      if (isAdmin) {
        await supabase.rpc('remove_admin', { user_id_input: userId });
      }
      
      // TODO: Add API to delete user account completely if needed
      toast({
        title: "Success",
        description: isAdmin ? "Admin privileges removed" : "User removed",
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error("Error removing user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove user",
        variant: "destructive"
      });
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        await supabase.rpc('remove_admin', { user_id_input: userId });
        toast({
          title: "Success",
          description: "Admin privileges removed"
        });
      } else {
        await supabase.rpc('add_admin', { user_id_input: userId });
        toast({
          title: "Success",
          description: "Admin privileges granted"
        });
      }
      fetchUsers();
    } catch (error: any) {
      console.error("Error toggling admin:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update admin status",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Users Management</CardTitle>
        <div className="flex items-center space-x-2">
          <Dialog open={showAddUserForm} onOpenChange={setShowAddUserForm}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add User</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <AddUserForm onSuccess={handleAddUserSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex mb-4 justify-between items-center">
          <div className="w-full max-w-sm">
            <Input 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>
          <Button 
            variant="ghost"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="ml-2"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader className="h-5 w-5 mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString() 
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                        title={user.is_admin ? "Remove Admin" : "Make Admin"}
                      >
                        {user.is_admin ? (
                          <ShieldOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Shield className="h-4 w-4 text-purple-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id, user.is_admin)}
                        title="Remove User"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
