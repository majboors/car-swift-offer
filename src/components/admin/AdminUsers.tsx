// src/components/admin/AdminUsers.tsx
import React, { useState, useEffect } from "react";
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
  TableHead as Th,
  TableCell as Td,
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
import {
  User,
  AdminUserIdParams,
  EmptyParams,
  RpcUser
} from "@/types/admin";

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError(null);

    const { data: admins, error: adminsError } = await supabase
      .from<{ user_id: string }>("admins")
      .select("user_id");

    if (adminsError) {
      setFetchError("Failed to load admin data");
      setLoading(false);
      return;
    }

    const adminIds = new Set<string>(admins.map(a => a.user_id));

    const { data, error } = await supabase
      .rpc<RpcUser[], EmptyParams>("get_all_users", {});

    if (error) {
      setFetchError("Failed to load users data");
      setLoading(false);
      return;
    }

    if (!data) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const enhancedUsers: User[] = data.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      is_admin: adminIds.has(u.id)
    }));

    setUsers(enhancedUsers);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await supabase.rpc<void, AdminUserIdParams>("remove_admin", { user_id_input: userId });
      } else {
        await supabase.rpc<void, AdminUserIdParams>("add_admin", { user_id_input: userId });
      }

      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, is_admin: !currentStatus } : u
        )
      );

      toast({
        title: "Success",
        description: `User ${currentStatus ? "removed from" : "added to"} administrators`
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || `Failed to ${currentStatus ? "remove" : "add"} admin status`,
        variant: "destructive"
      });
    }
  };

  const handleAddUserSuccess = () => {
    setDialogOpen(false);
    fetchUsers();
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Search users by email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <AddUserForm onSuccess={handleAddUserSuccess} />
            </DialogContent>
          </Dialog>
          <Button onClick={fetchUsers} variant="outline" disabled={loading}>
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="bg-destructive/15 p-4 rounded-md mb-4 text-destructive">
          <p className="font-medium">Error: {fetchError}</p>
          <p className="text-sm mt-1">
            Please try refreshing or check your authentication status
          </p>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <Th>Email</Th>
              <Th>Created At</Th>
              <Th>Last Sign In</Th>
              <Th>Admin Status</Th>
              <Th>Actions</Th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <Td colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
                    <span>Loading users...</span>
                  </div>
                </Td>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <Td>{user.email}</Td>
                  <Td>{new Date(user.created_at).toLocaleString()}</Td>
                  <Td>
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleString()
                      : "Never"}
                  </Td>
                  <Td>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_admin
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.is_admin ? "Admin" : "User"}
                    </span>
                  </Td>
                  <Td>
                    <Button
                      variant={user.is_admin ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                    >
                      {user.is_admin ? "Revoke Admin" : "Make Admin"}
                    </Button>
                  </Td>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <Td colSpan={5} className="text-center py-4">
                  {fetchError ? "Error loading users" : "No users found"}
                </Td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
