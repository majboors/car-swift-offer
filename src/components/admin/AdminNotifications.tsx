
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
import { Bell, Send, Clock } from "lucide-react";

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
        description: "Notification sent successfully",
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
      </CardContent>
    </Card>
  );
}
