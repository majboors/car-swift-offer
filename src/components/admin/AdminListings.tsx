
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Listing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  created_at: string;
  user_id: string;
  user_email?: string;
  description?: string;
}

// Define proper types for the RPC function returns
interface RpcListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  created_at: string;
  user_id: string;
  user_email?: string;
  description?: string;
  [key: string]: any; // For any additional properties
}

export const AdminListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    price: string;
    description: string;
  }>({
    title: "",
    price: "",
    description: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      // Use the database function to get all listings with user emails
      // Properly type the RPC return with both return type and params type (empty object since no params)
      const { data: listingsData, error: listingsError } = await supabase
        .rpc<RpcListing[], {}>('get_car_listings_with_users', {});

      if (listingsError) {
        console.error("Error fetching listings:", listingsError);
        setFetchError("Failed to load listings data");
        setLoading(false);
        return;
      }
      
      setListings(listingsData || []);
    } catch (error) {
      console.error("Error in fetchListings:", error);
      setFetchError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditListing(listing);
    setFormData({
      title: listing.title,
      price: listing.price.toString(),
      description: listing.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("car_listings")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setListings(listings.filter(listing => listing.id !== id));
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editListing) return;

    try {
      const { error } = await supabase
        .from("car_listings")
        .update({
          title: formData.title,
          price: parseFloat(formData.price),
          description: formData.description,
        })
        .eq("id", editListing.id);

      if (error) {
        throw error;
      }

      // Update local state
      setListings(listings.map(listing => 
        listing.id === editListing.id 
          ? { 
              ...listing, 
              title: formData.title, 
              price: parseFloat(formData.price),
              description: formData.description 
            } 
          : listing
      ));

      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Listing updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating listing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update listing",
        variant: "destructive",
      });
    }
  };

  const filteredListings = listings.filter(listing => 
    listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Listing Management</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Button 
            onClick={fetchListings} 
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="bg-destructive/15 p-4 rounded-md mb-4 text-destructive">
          <p className="font-medium">Error: {fetchError}</p>
          <p className="text-sm mt-1">Please try refreshing or check your authentication status</p>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Make/Model</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
                    <span>Loading listings...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>{listing.title}</TableCell>
                  <TableCell>{`${listing.make} ${listing.model}`}</TableCell>
                  <TableCell>{listing.year}</TableCell>
                  <TableCell>${listing.price.toLocaleString()}</TableCell>
                  <TableCell>{new Date(listing.created_at).toLocaleString()}</TableCell>
                  <TableCell>{listing.user_email || "Unknown"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(listing)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(listing.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  {fetchError ? 'Error loading listings' : 'No listings found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
