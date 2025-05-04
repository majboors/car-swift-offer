
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Listing } from "@/types/admin";

interface ListingTableRowProps {
  listing: Listing;
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
}

export const ListingTableRow = ({ listing, onEdit, onDelete }: ListingTableRowProps) => {
  return (
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
