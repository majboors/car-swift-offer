
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Listing } from "@/types/admin";

interface EditListingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  onSave: (id: string, data: { title: string; price: number; description: string }) => Promise<void>;
}

export const EditListingDialog = ({ 
  isOpen, 
  onClose, 
  listing, 
  onSave 
}: EditListingDialogProps) => {
  const [formData, setFormData] = useState<{
    title: string;
    price: string;
    description: string;
  }>({
    title: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title,
        price: listing.price.toString(),
        description: listing.description || "",
      });
    }
  }, [listing]);

  const handleSaveChanges = async () => {
    if (!listing) return;
    
    await onSave(listing.id, {
      title: formData.title,
      price: parseFloat(formData.price),
      description: formData.description,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Listing title"
              />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Price"
              />
            </div>
            <div className="col-span-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                rows={5}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
