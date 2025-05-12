
import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, BellDot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export default function NotificationDropdown() {
  const { notifications, unreadCount, loading, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const formatExpirationTime = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expirationDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `Expires in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    }
    
    if (diffHours < 24) {
      return `Expires in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `Expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <>
              <BellDot className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 font-medium">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-red-100 text-red-600 rounded-full px-2 py-1">
              {unreadCount} unread
            </span>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b last:border-0 cursor-pointer transition hover:bg-muted ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleMarkAsRead(notification.notification_id)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{notification.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm mt-1 text-muted-foreground">
                  {notification.message}
                </p>
                {notification.expires_at && (
                  <div className="mt-1 text-xs text-amber-600">
                    {formatExpirationTime(notification.expires_at)}
                  </div>
                )}
                {!notification.read && (
                  <div className="flex justify-end mt-2">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                  </div>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
