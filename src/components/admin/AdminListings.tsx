
// src/components/admin/AdminListings.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { EditListingDialog } from "./listings/EditListingDialog";
import { ErrorAlert } from "./listings/ErrorAlert";
import { ListingTable } from "./listings/ListingTable";
import { ListingTableHeader } from "./listings/ListingTableHeader";
import { Listing } from "@/types/admin";

export const AdminListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      // Use a properly typed RPC call
      const { data, error } = await supabase
        .rpc('get_car_listings_with_users');

      if (error) {
        setFetchError("Failed to load listings data");
        console.error("Error fetching listings:", error);
        setLoading(false);
        return;
      }

      // Safety check if data is null or not an array
      if (!data || !Array.isArray(data)) {
        setListings([]);
        setLoading(false);
        return;
      }

      const result: Listing[] = data.map(item => ({
        id: item.id,
        title: item.title,
        make: item.make,
        model: item.model,
        price: item.price,
        description: item.description,
        created_at: item.created_at,
        year: item.year,
        user_id: item.user_id,
        user_email: item.user_email
      }));

      setListings(result);
    } catch (err) {
      console.error("Unexpected error fetching listings:", err);
      setFetchError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleEdit = (listing: Listing) => {
    setEditListing(listing);
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

      if (error) throw error;

      setListings(prev => prev.filter(l => l.id !== id));
      toast({
        title: "Success",
        description: "Listing deleted successfully"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete listing",
        variant: "destructive"
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
          description: data.description
        })
        .eq("id", id);

      if (error) throw error;

      setListings(prev =>
        prev.map(l => (l.id === id ? { ...l, ...data } : l))
      );
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Listing updated successfully"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update listing",
        variant: "destructive"
      });
    }
  };

  const filteredListings = listings.filter(l =>
    l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.model?.toLowerCase().includes(searchTerm.toLowerCase())
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
