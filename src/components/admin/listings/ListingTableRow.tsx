import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Listing } from "@/types/admin";
import { Check, X, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ListingTableRowProps {
  listing: Listing;
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onShowcaseToggle?: (id: string, value: boolean) => void;
  onFeaturedToggle?: (id: string, value: boolean) => void;
}

export const ListingTableRow = ({ 
  listing, 
  onEdit, 
  onDelete,
  onApprove,
  onReject,
  onShowcaseToggle,
  onFeaturedToggle
}: ListingTableRowProps) => {
  const [isLoading, setIsLoading] = useState<{
    approve: boolean;
    reject: boolean;
    showcase: boolean;
    featured: boolean;
  }>({
    approve: false,
    reject: false,
    showcase: false,
    featured: false
  });

  const getStatusBadge = () => {
    switch(listing.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const isPremium = listing.package_level === 3;
  const isShowcase = listing.showcase === true;
  const isFeatured = listing.featured === true;
  
  const handleApprove = async (id: string) => {
    try {
      setIsLoading(prev => ({ ...prev, approve: true }));
      console.log(`Approve button clicked for listing ${id}`);
      
      if (onApprove) {
        await onApprove(id);
      }
    } catch (error) {
      console.error("Error in approve handler:", error);
      toast({
        title: "Error",
        description: "Failed to approve listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, approve: false }));
    }
  };
  
  const handleReject = async (id: string) => {
    try {
      setIsLoading(prev => ({ ...prev, reject: true }));
      console.log(`Reject button clicked for listing ${id}`);
      
      if (onReject) {
        await onReject(id);
      }
    } catch (error) {
      console.error("Error in reject handler:", error);
      toast({
        title: "Error",
        description: "Failed to reject listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, reject: false }));
    }
  };
  
  const handleShowcaseToggle = async (id: string, value: boolean) => {
    try {
      setIsLoading(prev => ({ ...prev, showcase: true }));
      console.log(`Showcase toggle clicked for listing ${id}, value: ${value}`);
      
      if (onShowcaseToggle) {
        await onShowcaseToggle(id, value);
      }
    } catch (error) {
      console.error("Error in showcase toggle handler:", error);
      toast({
        title: "Error",
        description: "Failed to update showcase status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, showcase: false }));
    }
  };

  const handleFeaturedToggle = async (id: string, value: boolean) => {
    try {
      setIsLoading(prev => ({ ...prev, featured: true }));
      console.log(`Featured toggle clicked for listing ${id}, value: ${value}`);
      
      if (onFeaturedToggle) {
        await onFeaturedToggle(id, value);
      }
    } catch (error) {
      console.error("Error in featured toggle handler:", error);
      toast({
        title: "Error",
        description: "Failed to update featured status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, featured: false }));
    }
  };

  return (
    <TableRow key={listing.id}>
      <TableCell>
        <div className="flex items-center gap-2">
          {listing.title}
          <div className="flex gap-1">
            {isPremium && <Badge variant="premium">Premium</Badge>}
            {isShowcase && <Badge variant="showcase">Showcase</Badge>}
            {isFeatured && <Badge variant="secondary">Featured</Badge>}
          </div>
        </div>
      </TableCell>
      <TableCell>{`${listing.make} ${listing.model}`}</TableCell>
      <TableCell>{listing.year}</TableCell>
      <TableCell>${listing.price.toLocaleString()}</TableCell>
      <TableCell>{getStatusBadge()}</TableCell>
      <TableCell>{new Date(listing.created_at).toLocaleString()}</TableCell>
      <TableCell>{listing.user_email || "Unknown"}</TableCell>
      <TableCell>
        <div className="flex gap-1 flex-wrap">
          {/* Only show approve button for pending listings */}
          {listing.status === 'pending' && onApprove && (
            <Button 
              variant="outline" 
              size="sm"
              className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
              onClick={() => handleApprove(listing.id)}
              disabled={isLoading.approve}
            >
              <Check className="h-4 w-4 mr-1" /> {isLoading.approve ? 'Processing...' : 'Approve'}
            </Button>
          )}
          
          {/* Only show reject button for pending listings */}
          {listing.status === 'pending' && onReject && (
            <Button 
              variant="outline" 
              size="sm"
              className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
              onClick={() => handleReject(listing.id)}
              disabled={isLoading.reject}
            >
              <X className="h-4 w-4 mr-1" /> {isLoading.reject ? 'Processing...' : 'Reject'}
            </Button>
          )}
          
          {/* For rejected listings, show only approve button to allow re-approval */}
          {listing.status === 'rejected' && onApprove && (
            <Button 
              variant="outline" 
              size="sm"
              className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
              onClick={() => handleApprove(listing.id)}
              disabled={isLoading.approve}
            >
              <Check className="h-4 w-4 mr-1" /> {isLoading.approve ? 'Processing...' : 'Approve'}
            </Button>
          )}
          
          {/* Toggles - only for approved listings */}
          {listing.status === 'approved' && (
            <div className="flex flex-col gap-1 ml-1">
              {/* Showcase toggle */}
              {onShowcaseToggle && (
                <div className="flex items-center gap-1">
                  <Switch 
                    id={`showcase-${listing.id}`}
                    checked={isShowcase} 
                    onCheckedChange={(checked) => handleShowcaseToggle(listing.id, checked)}
                    className="data-[state=checked]:bg-[#007ac8]"
                    disabled={isLoading.showcase}
                  />
                  <label 
                    htmlFor={`showcase-${listing.id}`} 
                    className="text-xs whitespace-nowrap cursor-pointer"
                  >
                    {isLoading.showcase ? 'Updating...' : 'Showcase'}
                  </label>
                </div>
              )}
              
              {/* Featured toggle */}
              {onFeaturedToggle && (
                <div className="flex items-center gap-1">
                  <Switch 
                    id={`featured-${listing.id}`}
                    checked={isFeatured} 
                    onCheckedChange={(checked) => handleFeaturedToggle(listing.id, checked)}
                    className="data-[state=checked]:bg-[#e9542f]"
                    disabled={isLoading.featured}
                  />
                  <label 
                    htmlFor={`featured-${listing.id}`} 
                    className="text-xs whitespace-nowrap cursor-pointer"
                  >
                    {isLoading.featured ? 'Updating...' : 'Featured'}
                  </label>
                </div>
              )}
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(listing)}
          >
            Edit
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(listing.id)}
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
