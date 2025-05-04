
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

interface ListingTableProps {
  listings: Listing[];
  loading: boolean;
  fetchError: string | null;
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
}

export const ListingTable = ({
  listings,
  loading,
  fetchError,
  onEdit,
  onDelete
}: ListingTableProps) => {
  return (
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
          ) : listings.length > 0 ? (
            listings.map((listing) => (
              <ListingTableRow 
                key={listing.id} 
                listing={listing} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
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
  );
};
