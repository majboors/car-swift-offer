
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash, AlertTriangle, Globe, MapPin } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  expires_at: string | null;
  is_global: boolean;
  target_locations: string[] | null;
  admin_email: string;
}

interface NotificationsTableProps {
  onNotificationDeleted: () => void;
}

export default function NotificationsTable({ onNotificationDeleted }: NotificationsTableProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const itemsPerPage = 10;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Using the fixed database function
      const { data, error } = await supabase.rpc('get_all_notifications');
      
      if (error) {
        console.error("Notification fetch error details:", error);
        throw error;
      }
      
      console.log("Notifications fetched successfully:", data);
      setNotifications(data || []);
      setTotalCount(data.length);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDeleteClick = (id: string) => {
    setSelectedNotification(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedNotification || !user) return;
    
    try {
      const { data, error } = await supabase.rpc('delete_notification', {
        p_notification_id: selectedNotification,
        p_admin_id: user.id
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
      
      // Refresh notifications list
      fetchNotifications();
      onNotificationDeleted();
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete notification",
        variant: "destructive"
      });
    } finally {
      setDialogOpen(false);
      setSelectedNotification(null);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const pageStart = (page - 1) * itemsPerPage;
  const pageEnd = Math.min(pageStart + itemsPerPage, totalCount);
  const currentPageNotifications = notifications.slice(pageStart, pageEnd);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiration";
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading notifications...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Sent Notifications</h2>
        <Button onClick={fetchNotifications} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No notifications have been sent yet.</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">
                      {truncateText(notification.title, 30)}
                    </TableCell>
                    <TableCell>
                      {truncateText(notification.message, 40)}
                    </TableCell>
                    <TableCell>
                      {formatDate(notification.created_at)}
                    </TableCell>
                    <TableCell>
                      {notification.expires_at ? formatDate(notification.expires_at) : "No expiration"}
                    </TableCell>
                    <TableCell>
                      {notification.is_global ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Globe className="h-3 w-3" /> Global
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> 
                          {notification.target_locations && notification.target_locations.length > 0 
                            ? `${notification.target_locations.length} locations` 
                            : "No locations"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {notification.admin_email ? notification.admin_email.split('@')[0] : "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteClick(notification.id)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  
                  if (totalPages > 5) {
                    if (page > 3 && page < totalPages - 1) {
                      pageNum = page - 2 + i;
                    } else if (page >= totalPages - 1) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={pageNum === page}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && page < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Notification
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this notification and remove it from all users' notification lists. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
