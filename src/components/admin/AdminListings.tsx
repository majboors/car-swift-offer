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
        status: item.status || 'pending',
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
        images: Array.isArray(item.images) ? item.images.map(img => String(img)) : [],
        // Add showcase flag - now that the column exists in the database
        showcase: item.showcase === true,
        // Add package level
        package_level: item.package_level || null,
        // Add other Boolean properties
        featured: item.featured || false,
        top_search: item.top_search || false,
      }));

      setListings(result);
      
      // Notify parent component if a callback was provided
      if (onListingStatusChange) {
        onListingStatusChange();
      }

      // Debug output to verify listing statuses
      console.log("Fetched listings statuses:", result.map(l => ({ id: l.id, status: l.status, make: l.make, model: l.model })));
      
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
      console.log(`Starting approval process for listing ${id} using admin_approve_listing function...`);
      
      // Call the admin_approve_listing function to bypass RLS
      const { data, error } = await supabase
        .rpc('admin_approve_listing', { listing_id: id });

      if (error) {
        console.error("Database error during approval:", error);
        throw error;
      }

      if (data === false) {
        console.warn("Admin function returned false - no rows updated");
        throw new Error("Failed to update listing status");
      }

      console.log(`Database update successful for listing ${id} using admin function. Result:`, data);

      // Update local state immediately after successful database update
      setListings(prev =>
        prev.map(l => (l.id === id ? { ...l, status: 'approved' } : l))
      );
      
      // Update dashboard stats
      if (onListingStatusChange) {
        console.log("Triggering parent dashboard refresh via onListingStatusChange callback");
        onListingStatusChange();
      }

      toast({
        title: "Success",
        description: "Listing approved successfully"
      });
      
      // Force a refresh of the listings after approval
      console.log("Refreshing listings after approval");
      await fetchListings();
      
      // Double-check that the listing now has the correct status
      const { data: verifyListing, error: verifyError } = await supabase
        .from("car_listings")
        .select("id, title, make, model, status")
        .eq("id", id)
        .single();
        
      if (verifyError) {
        console.error("Error verifying listing status:", verifyError);
      } else {
        console.log("Verified listing after approval:", verifyListing);
        if (verifyListing.status !== 'approved') {
          console.error("WARNING: Listing status is still not 'approved' after update!");
          toast({
            title: "Warning",
            description: "The listing may not have been updated correctly. Please check the status.",
            variant: "destructive"
          });
        }
      }
      
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
      console.log(`Rejecting listing ${id} using admin_reject_listing function...`);
      
      // Call the admin_reject_listing function to bypass RLS
      const { data, error } = await supabase
        .rpc('admin_reject_listing', { listing_id: id });

      if (error) {
        console.error("Database error during rejection:", error);
        throw error;
      }

      if (data === false) {
        console.warn("Admin function returned false - no rows updated");
        throw new Error("Failed to update listing status");
      }

      console.log(`Database update successful for listing ${id} using admin function`);

      // Update local state immediately after successful database update
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
      
      // Force a refresh of the listings to ensure UI is in sync with database
      await fetchListings();
      
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
          status: data.status,
          showcase: data.showcase
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
      
      // Force a refresh of the listings
      await fetchListings();
      
    } catch (err: any) {
      console.error("Error updating listing:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update listing",
        variant: "destructive"
      });
    }
  };

  const handleShowcaseToggle = async (id: string, value: boolean) => {
    try {
      console.log(`Setting listing ${id} showcase to ${value} using admin_toggle_showcase function...`);
      
      // Call the admin_toggle_showcase function to bypass RLS
      const { data, error } = await supabase
        .rpc('admin_toggle_showcase', { 
          listing_id: id,
          showcase_value: value 
        });

      if (error) {
        console.error("Database error during showcase toggle:", error);
        throw error;
      }
      
      if (data === false) {
        console.warn("Admin function returned false - no rows updated");
        throw new Error("Failed to update showcase status");
      }

      console.log(`Database update successful for listing ${id} showcase status using admin function`);

      // Update local state
      setListings(prev =>
        prev.map(l => (l.id === id ? { ...l, showcase: value } : l))
      );
      
      // Update dashboard stats
      if (onListingStatusChange) {
        onListingStatusChange();
      }

      toast({
        title: "Success",
        description: `Listing ${value ? 'added to' : 'removed from'} showcase successfully`
      });
      
      // Force a refresh of the listings
      await fetchListings();
      
    } catch (err: any) {
      console.error("Error updating showcase status:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update showcase status",
        variant: "destructive"
      });
    }
  };

  const handleFeaturedToggle = async (id: string, value: boolean) => {
    try {
      console.log(`Setting listing ${id} featured to ${value} using admin_toggle_featured function...`);
      
      // Call the admin_toggle_featured function to bypass RLS
      const { data, error } = await supabase
        .rpc('admin_toggle_featured', { 
          listing_id: id,
          featured_value: value 
        });

      if (error) {
        console.error("Database error during featured toggle:", error);
        throw error;
      }
      
      if (data === false) {
        console.warn("Admin function returned false - no rows updated");
        throw new Error("Failed to update featured status");
      }

      console.log(`Database update successful for listing ${id} featured status using admin function`);

      // Update local state
      setListings(prev =>
        prev.map(l => (l.id === id ? { ...l, featured: value } : l))
      );
      
      // Update dashboard stats
      if (onListingStatusChange) {
        onListingStatusChange();
      }

      toast({
        title: "Success",
        description: `Listing ${value ? 'added to' : 'removed from'} featured vehicles successfully`
      });
      
      // Force a refresh of the listings
      await fetchListings();
      
    } catch (err: any) {
      console.error("Error updating featured status:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update featured status",
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
    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${l.make} ${l.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
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
            onShowcaseToggle={handleShowcaseToggle}
            onFeaturedToggle={handleFeaturedToggle}
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
            onShowcaseToggle={handleShowcaseToggle}
            onFeaturedToggle={handleFeaturedToggle}
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
