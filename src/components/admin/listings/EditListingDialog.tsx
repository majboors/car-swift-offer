
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Listing } from "@/types/admin";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface EditListingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  onSave: (id: string, data: any) => void;
}

export const EditListingDialog = ({
  isOpen,
  onClose,
  listing,
  onSave
}: EditListingDialogProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        make: listing.make || '',
        model: listing.model || '',
        year: listing.year || 0,
        price: listing.price || 0,
        description: listing.description || '',
        mileage: listing.mileage || 0,
        color: listing.color || '',
        transmission: listing.transmission || '',
        fuel_type: listing.fuel_type || '',
        body_type: listing.body_type || '',
        location: listing.location || '',
        contact_email: listing.contact_email || '',
        contact_phone: listing.contact_phone || '',
        features: listing.features || [],
        images: listing.images || [],
        status: listing.status || 'pending', // Include status in form data
      });
    }
  }, [listing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" || name === "year" || name === "mileage"
        ? Number(value)
        : value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleSubmit = async () => {
    if (!listing) return;
    
    setIsLoading(true);
    try {
      await onSave(listing.id, formData);
      toast({
        title: "Success",
        description: "Listing updated successfully",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive"
      });
      console.error("Error updating listing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Listing
            {formData.status && getStatusBadge(formData.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Input
              id="make"
              name="make"
              value={formData.make || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              value={formData.model || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              type="number"
              value={formData.year || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage</Label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              value={formData.mileage || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              name="color"
              value={formData.color || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Input
              id="transmission"
              name="transmission"
              value={formData.transmission || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel_type">Fuel Type</Label>
            <Input
              id="fuel_type"
              name="fuel_type"
              value={formData.fuel_type || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_type">Body Type</Label>
            <Input
              id="body_type"
              name="body_type"
              value={formData.body_type || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              value={formData.contact_email || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              value={formData.contact_phone || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              value={formData.description || ''}
              onChange={handleChange}
            />
          </div>

          {formData.images && formData.images.length > 0 && (
            <div className="md:col-span-2 space-y-2">
              <Label>Images</Label>
              <div className="grid grid-cols-3 gap-2">
                {formData.images.map((url: string, index: number) => (
                  <img 
                    key={index} 
                    src={url} 
                    alt={`Listing image ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
