
import { Loader } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ListingTableRow } from "./ListingTableRow";
import { Listing } from "@/types/admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ListingTableProps {
  listings: Listing[];
  loading: boolean;
  fetchError: string | null;
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onShowcaseToggle?: (id: string, value: boolean) => void;
  onFeaturedToggle?: (id: string, value: boolean) => void;
}

export const ListingTable = ({
  listings,
  loading,
  fetchError,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onShowcaseToggle,
  onFeaturedToggle
}: ListingTableProps) => {
  // Count pending listings
  const pendingCount = listings.filter(listing => listing.status === 'pending').length;
  
  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <InfoIcon className="h-4 w-4 text-amber-500" />
          <AlertTitle>Pending Listings</AlertTitle>
          <AlertDescription>
            There {pendingCount === 1 ? 'is' : 'are'} {pendingCount} listing{pendingCount === 1 ? '' : 's'} pending approval. Review them to make them visible to users.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Make/Model</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
                    <span>Loading listings...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : listings.length > 0 ? (
              listings.map((listing) => (
                <ListingTableRow 
                  key={listing.id} 
                  listing={listing} 
                  onEdit={onEdit} 
                  onDelete={onDelete}
                  onApprove={onApprove}
                  onReject={onReject}
                  onShowcaseToggle={onShowcaseToggle}
                  onFeaturedToggle={onFeaturedToggle}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  {fetchError ? 'Error loading listings' : 'No listings found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
