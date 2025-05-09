
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { EditListingDialog } from "./listings/EditListingDialog";
import { ErrorAlert } from "./listings/ErrorAlert";
import { ListingTable } from "./listings/ListingTable";
import { ListingTableHeader } from "./listings/ListingTableHeader";
import { Listing } from "@/types/admin";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminListingsProps {
  onListingStatusChange?: () => void;
}

export const AdminListings: React.FC<AdminListingsProps> = ({ 
  onListingStatusChange 
}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');

  const fetchListings = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      console.log("Fetching listings...");
      
      // First fetch all listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('car_listings')
        .select('*');

      if (listingsError) {
        console.error("Error fetching listings:", listingsError);
        setFetchError("Failed to load listings data");
        setLoading(false);
        return;
      }

      if (!listingsData || !Array.isArray(listingsData)) {
        setListings([]);
        setLoading(false);
        return;
      }

      // Get all unique user IDs from the listings
      const userIds = [...new Set(listingsData.map(listing => listing.user_id))];
      
      // For now, we'll use a simplified approach without the join
      const result: Listing[] = listingsData.map(item => ({
        id: item.id,
        title: item.title || '',
        make: item.make || '',
        model: item.model || '',
        price: item.price || 0,
        description: item.description || '',
        created_at: item.created_at || '',
        year: item.year || 0,
        user_id: item.user_id || '',
        user_email: 'User ID: ' + item.user_id.substring(0, 8) + '...',
        status: item.status || 'pending', // Add status field
        // Additional fields needed for the expanded edit dialog
        mileage: item.mileage || 0,
        color: item.color || '',
        transmission: item.transmission || '',
        fuel_type: item.fuel_type || '',
        body_type: item.body_type || '',
        location: item.location || '',
        contact_email: item.contact_email || '',
        contact_phone: item.contact_phone || '',
        // Convert features and images to string arrays or empty arrays if null
        features: Array.isArray(item.features) ? item.features.map(f => String(f)) : [],
        images: Array.isArray(item.images) ? item.images.map(img => String(img)) : []
      }));

      setListings(result);
      
      // Notify parent component if a callback was provided
      if (onListingStatusChange) {
        onListingStatusChange();
      }
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
      
      // Update dashboard stats
      if (onListingStatusChange) {
        onListingStatusChange();
      }
      
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

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("car_listings")
        .update({ status: 'approved' })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setListings(prev =>
        prev.map(l => (l.id === id ? { ...l, status: 'approved' } : l))
      );
      
      // Update dashboard stats
      if (onListingStatusChange) {
        onListingStatusChange();
      }

      toast({
        title: "Success",
        description: "Listing approved successfully"
      });
    } catch (err: any) {
      console.error("Error approving listing:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to approve listing",
        variant: "destructive"
      });
    }
  };
  
  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("car_listings")
        .update({ status: 'rejected' })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setListings(prev =>
        prev.map(l => (l.id === id ? { ...l, status: 'rejected' } : l))
      );
      
      // Update dashboard stats
      if (onListingStatusChange) {
        onListingStatusChange();
      }

      toast({
        title: "Success",
        description: "Listing rejected successfully"
      });
    } catch (err: any) {
      console.error("Error rejecting listing:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to reject listing",
        variant: "destructive"
      });
    }
  };

  const handleSaveEdit = async (id: string, data: any) => {
    try {
      console.log("Saving listing with data:", data);

      const { error } = await supabase
        .from("car_listings")
        .update({
          title: data.title,
          make: data.make,
          model: data.model,
          year: data.year,
          price: data.price,
          mileage: data.mileage,
          color: data.color,
          transmission: data.transmission,
          fuel_type: data.fuel_type,
          body_type: data.body_type,
          description: data.description,
          location: data.location,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          features: data.features,
          images: data.images,
          status: data.status // Include status in update
        })
        .eq("id", id);

      if (error) throw error;

      setListings(prev =>
        prev.map(l => (l.id === id ? { ...l, ...data } : l))
      );
      setIsDialogOpen(false);
      
      // Update dashboard stats
      if (onListingStatusChange) {
        onListingStatusChange();
      }
      
      toast({
        title: "Success",
        description: "Listing updated successfully"
      });
    } catch (err: any) {
      console.error("Error updating listing:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update listing",
        variant: "destructive"
      });
    }
  };

  // Filter listings based on tab and search term
  const getFilteredListings = () => {
    let filtered = listings;
    
    // First filter by tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(l => l.status === 'pending');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(l => l.status === 'approved');
    }
    
    // Then filter by search term
    return filtered.filter(l =>
      l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <Card className="p-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'pending' | 'approved')}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Listings</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {listings.filter(l => l.status === 'pending').length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {listings.filter(l => l.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ListingTableHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={fetchListings}
            loading={loading}
          />
          {fetchError && <ErrorAlert message={fetchError} />}
          <ListingTable
            listings={getFilteredListings()}
            loading={loading}
            fetchError={fetchError}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <ListingTableHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={fetchListings}
            loading={loading}
          />
          {fetchError && <ErrorAlert message={fetchError} />}
          <ListingTable
            listings={getFilteredListings()}
            loading={loading}
            fetchError={fetchError}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>
        
        <TabsContent value="approved">
          <ListingTableHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={fetchListings}
            loading={loading}
          />
          {fetchError && <ErrorAlert message={fetchError} />}
          <ListingTable
            listings={getFilteredListings()}
            loading={loading}
            fetchError={fetchError}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>
      </Tabs>
      
      <EditListingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        listing={editListing}
        onSave={handleSaveEdit}
      />
    </Card>
  );
};
