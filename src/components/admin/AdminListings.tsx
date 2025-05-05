
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
      console.log("Fetching listings...");
      
      // Use a direct query to fetch the listings to avoid the RPC function ambiguity
      const { data, error } = await supabase
        .from('car_listings')
        .select(`
          id, 
          user_id,
          year,
          price,
          mileage,
          images,
          created_at,
          updated_at,
          features,
          transmission,
          fuel_type,
          body_type,
          description,
          location,
          title,
          make,
          model,
          contact_email,
          contact_phone,
          car_name,
          color,
          auth.users!car_listings_user_id_fkey (email)
        `);

      if (error) {
        console.error("Error fetching listings:", error);
        setFetchError("Failed to load listings data");
        setLoading(false);
        return;
      }

      console.log("Listings data:", data);
      
      // Safety check if data is null or not an array
      if (!data || !Array.isArray(data)) {
        setListings([]);
        setLoading(false);
        return;
      }

      // Map the returned data to match our Listing type
      const result: Listing[] = data.map(item => {
        // Handle the nested user email from the join
        const userEmail = item['auth.users'] ? item['auth.users'].email : 'Unknown';
        
        return {
          id: item.id,
          title: item.title || '',
          make: item.make || '',
          model: item.model || '',
          price: item.price || 0,
          description: item.description || '',
          created_at: item.created_at || '',
          year: item.year || 0,
          user_id: item.user_id || '',
          user_email: userEmail
        };
      });

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
