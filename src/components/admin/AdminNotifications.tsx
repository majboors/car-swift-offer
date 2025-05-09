
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
import { Bell, Send } from "lucide-react";

const locations = [
  'ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'
];

export default function AdminNotifications() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isGlobal, setIsGlobal] = useState(false);
  const [loading, setLoading] = useState(false);

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
    
    try {
      const { data, error } = await supabase.rpc('send_notification_to_users', {
        p_title: title,
        p_message: message,
        p_target_locations: selectedLocations,
        p_is_global: isGlobal,
        p_admin_id: user?.id
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
      
      // Reset form
      setTitle("");
      setMessage("");
      setSelectedLocations([]);
      setIsGlobal(false);
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Send Notifications</CardTitle>
        <Bell className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
