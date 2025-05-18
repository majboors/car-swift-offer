import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Send, Clock, List, InfoIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import NotificationsTable from "./NotificationsTable";

const locations = [
  'ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'
];

// Predefined duration options in hours
const durationOptions = [
  { value: "1", label: "1 hour" },
  { value: "4", label: "4 hours" },
  { value: "8", label: "8 hours" },
  { value: "24", label: "1 day" },
  { value: "72", label: "3 days" },
  { value: "168", label: "1 week" },
  { value: "720", label: "30 days" },
  { value: "0", label: "No expiration" },
];

export default function AdminNotifications() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isGlobal, setIsGlobal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState<string>("0"); // Default: no expiration
  const [customDuration, setCustomDuration] = useState<string>(""); // For custom duration input
  const [showInfoAlert, setShowInfoAlert] = useState(true);

  const handleLocationChange = (value: string) => {
    if (selectedLocations.includes(value)) {
      setSelectedLocations(selectedLocations.filter(loc => loc !== value));
    } else {
      setSelectedLocations([...selectedLocations, value]);
    }
  };

  const handleGlobalChange = (checked: boolean) => {
    setIsGlobal(checked);
    if (checked) {
      setSelectedLocations([]);
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    // Reset custom duration if a predefined option is selected
    if (value !== "custom") {
      setCustomDuration("");
    }
  };

  // Calculate expiration date/time preview
  const getExpirationPreview = () => {
    if (duration === "0") return "No expiration";
    
    const hours = duration === "custom" && customDuration ? parseInt(customDuration) : parseInt(duration);
    if (isNaN(hours) || hours <= 0) return "Invalid duration";
    
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hours);
    return expirationDate.toLocaleString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Message is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!isGlobal && selectedLocations.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one location or make it a global notification",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    // Get duration in hours
    let durationHours: number | null = null;
    if (duration !== "0") {
      durationHours = duration === "custom" && customDuration 
        ? parseInt(customDuration) 
        : parseInt(duration);
      
      if (isNaN(durationHours) || durationHours <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid duration",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }
    
    try {
      const { data, error } = await supabase.rpc('send_notification_to_users', {
        p_title: title,
        p_message: message,
        p_target_locations: selectedLocations,
        p_is_global: isGlobal,
        p_admin_id: user?.id,
        p_duration_hours: durationHours
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: isGlobal 
          ? "Global notification sent to all users" 
          : `Notification sent to users in selected locations: ${selectedLocations.join(", ")}`,
      });
      
      // Reset form
      setTitle("");
      setMessage("");
      setSelectedLocations([]);
      setIsGlobal(false);
      setDuration("0");
      setCustomDuration("");
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle notifications refresh when a notification is deleted
  const handleNotificationDeleted = () => {
    toast({
      title: "Success",
      description: "Notification deleted successfully",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Notifications Management</CardTitle>
        <Bell className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" /> Send Notifications
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <List className="h-4 w-4" /> Manage Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="send" className="space-y-4">
            {showInfoAlert && (
              <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <AlertTitle>Notification System Updated</AlertTitle>
                <AlertDescription>
                  The notification system now ensures all users receive notifications. Global notifications are sent to all users, 
                  while location-based notifications are sent only to users who have selected matching locations in their profiles.
                </AlertDescription>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowInfoAlert(false)}
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  placeholder="Enter notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Notification Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="global-notification" 
                  checked={isGlobal} 
                  onCheckedChange={handleGlobalChange} 
                />
                <Label htmlFor="global-notification">Send to all users (global notification)</Label>
              </div>
              
              {!isGlobal && (
                <div className="space-y-2">
                  <Label>Target Locations</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {locations.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`location-${location}`}
                          checked={selectedLocations.includes(location)}
                          onChange={() => handleLocationChange(location)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`location-${location}`}>{location}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="duration">Notification Duration</Label>
                </div>
                <Select value={duration} onValueChange={handleDurationChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Duration Options</SelectLabel>
                      {durationOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom duration (hours)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                {duration === "custom" && (
                  <div className="mt-2">
                    <Label htmlFor="custom-duration">Custom Duration (hours)</Label>
                    <Input
                      id="custom-duration"
                      type="number"
                      placeholder="Enter hours"
                      min="1"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                    />
                  </div>
                )}
                
                {duration !== "0" && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium">Expires at: </span>
                    {getExpirationPreview()}
                  </div>
                )}
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Notification
                  </span>
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="manage">
            <NotificationsTable onNotificationDeleted={handleNotificationDeleted} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
