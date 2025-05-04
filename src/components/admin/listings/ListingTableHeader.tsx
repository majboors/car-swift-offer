
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";

interface ListingTableHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const ListingTableHeader = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  loading
}: ListingTableHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold">Listing Management</h2>
      <div className="flex gap-4">
        <Input
          placeholder="Search listings..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-80"
        />
        <Button 
          onClick={onRefresh} 
          variant="outline"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>
    </div>
  );
};
