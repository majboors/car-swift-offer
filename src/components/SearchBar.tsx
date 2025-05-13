
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex w-full max-w-sm items-center relative">
        <Search className="absolute left-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search cars..."
          className="pl-9 pr-16 h-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button 
          type="submit" 
          size="sm" 
          variant="ghost" 
          className="absolute right-0 h-9 text-gray-500 hover:text-[#007ac8]"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
