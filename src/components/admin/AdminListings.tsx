import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { EditListingDialog } from "./listings/EditListingDialog";
import { ErrorAlert } from "./listings/ErrorAlert";
import { ListingTable } from "./listings/ListingTable";
import { ListingTableHeader } from "./listings/ListingTableHeader";
import { Listing, RpcListing, EmptyParams } from "@/types/admin";

export const AdminListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editListing, setEditListing] = useState<Listing | null>(null);
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
      // Specify RpcListing[] as the return type
      const { data, error: listingsError } = await supabase
        .rpc<RpcListing[]>('get_car_listings_with_users', {});

      if (listingsError) {
        console.error("Error fetching listings:", listingsError);
        setFetchError("Failed to load listings data");
        setLoading(false);
        return;
      }
      
      // Type assertion to ensure TypeScript understands the data structure
      setListings(data || []);
    } catch (error) {
      console.error("Error in fetchListings:", error);
      setFetchError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditListing(listing);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      supabase
        .from("car_listings")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            throw error;
          }

          setListings(listings.filter(listing => listing.id !== id));
          toast({
            title: "Success",
            description: "Listing deleted successfully",
          });
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

  const handleSaveEdit = async (
    id: string, 
    data: { title: string; price: number; description: string }
  ) => {
    try {
      const { error } = await supabase
        .from("car_listings")
        .update({
          title: data.title,
          price: data.price,
          description: data.description,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setListings(listings.map(listing => 
        listing.id === id 
          ? { 
              ...listing, 
              title: data.title, 
              price: data.price,
              description: data.description 
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
      <ListingTableHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchListings}
        loading={loading}
      />

      {fetchError && <ErrorAlert message={fetchError} />}

      <ListingTable
        listings={filteredListings}
        loading={loading}
        fetchError={fetchError}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditListingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        listing={editListing}
        onSave={handleSaveEdit}
      />
    </div>
  );
};
