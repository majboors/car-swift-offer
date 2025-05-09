
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Listing } from "@/types/admin";
import { Check, X, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ListingTableRowProps {
  listing: Listing;
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onShowcaseToggle?: (id: string, value: boolean) => void;
}

export const ListingTableRow = ({ 
  listing, 
  onEdit, 
  onDelete,
  onApprove,
  onReject,
  onShowcaseToggle
}: ListingTableRowProps) => {
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

  return (
    <TableRow key={listing.id}>
      <TableCell>
        <div className="flex items-center gap-2">
          {listing.title}
          <div className="flex gap-1">
            {isPremium && <Badge variant="premium">Premium</Badge>}
            {isShowcase && <Badge variant="showcase">Showcase</Badge>}
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
          {/* Show approve button for both pending and rejected listings */}
          {(listing.status === 'pending' || listing.status === 'rejected') && onApprove && (
            <Button 
              variant="outline" 
              size="sm"
              className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
              onClick={() => onApprove(listing.id)}
            >
              <Check className="h-4 w-4 mr-1" /> Approve
            </Button>
          )}
          
          {/* Show reject button only for pending listings */}
          {listing.status === 'pending' && onReject && (
            <Button 
              variant="outline" 
              size="sm"
              className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
              onClick={() => onReject(listing.id)}
            >
              <X className="h-4 w-4 mr-1" /> Reject
            </Button>
          )}
          
          {/* Showcase toggle - only for approved listings */}
          {listing.status === 'approved' && onShowcaseToggle && (
            <div className="flex items-center gap-1 ml-1">
              <Switch 
                id={`showcase-${listing.id}`}
                checked={isShowcase} 
                onCheckedChange={(checked) => onShowcaseToggle(listing.id, checked)}
                className="data-[state=checked]:bg-[#007ac8]"
              />
              <label 
                htmlFor={`showcase-${listing.id}`} 
                className="text-xs whitespace-nowrap cursor-pointer"
              >
                Showcase
              </label>
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
