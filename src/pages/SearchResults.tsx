
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TrustedBanner from "@/components/TrustedBanner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Filter, Loader, Search, X, Package2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [premiumListings, setPremiumListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState(searchParams.get("query") || "");
  const [selectedMake, setSelectedMake] = useState(searchParams.get("make") || "");
  const [selectedModel, setSelectedModel] = useState(searchParams.get("model") || "");
  const [selectedBodyType, setSelectedBodyType] = useState(searchParams.get("bodyType") || "");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [yearRange, setYearRange] = useState({ min: "", max: "" });
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  
  // For mobile filter toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const { toast } = useToast();
  const itemsPerPage = 10; // Number of listings per page
  
  const form = useForm({
    defaultValues: {
      search: searchText
    }
  });
  
  useEffect(() => {
    fetchListings();
  }, [currentPage, searchParams]);
  
  const fetchListings = async () => {
    setLoading(true);
    try {
      const showFeatured = searchParams.get("showFeatured") !== "false";
      
      // Construct the search query
      let query = supabase
        .from("car_listings")
        .select("*, users(full_name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      // Apply search filters from URL parameters
      const searchQuery = searchParams.get("query");
      const makeFilter = searchParams.get("make");
      const modelFilter = searchParams.get("model");
      const bodyTypeFilter = searchParams.get("bodyType");
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`);
      }
      
      if (makeFilter) {
        query = query.eq("make", makeFilter);
      }
      
      if (modelFilter) {
        query = query.eq("model", modelFilter);
      }
      
      if (bodyTypeFilter) {
        query = query.eq("body_type", bodyTypeFilter);
      }

      // First fetch all premium (package level 3) listings regardless of pagination
      let premiumQuery = query.eq("package_level", 3);
      const { data: premiumData } = await premiumQuery;
      setPremiumListings(premiumData || []);
      
      // Then fetch regular listings (excluding premium ones for this page)
      // Apply pagination to regular listings
      const startIdx = (currentPage - 1) * itemsPerPage;
      let regularQuery = query.neq("package_level", 3).range(startIdx, startIdx + itemsPerPage - 1);
      
      // Execute the queries
      const { data: regularData, error, count } = await regularQuery;
      
      if (error) throw error;
      
      // Get total count for pagination
      const { count: totalCount } = await query.neq("package_level", 3).count();
      setTotalCount(totalCount || 0);
      
      // Set listings data
      setListings(regularData || []);
      
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch listings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (formValues) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (formValues.search) {
      newParams.set("query", formValues.search);
    } else {
      newParams.delete("query");
    }
    
    setSearchParams(newParams);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSelectedMake("");
    setSelectedModel("");
    setSelectedBodyType("");
    setPriceRange({ min: "", max: "" });
    setYearRange({ min: "", max: "" });
    setTransmission("");
    setFuelType("");
    setSearchText("");
    form.reset({ search: "" });
  };
  
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  // Get unique makes, models, body types for filters
  const uniqueMakes = [...new Set(listings.map(listing => listing.make))];
  
  // Helper function to format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Search header */}
      <div className="bg-[#007ac8] text-white py-8">
        <div className="container mx-auto px-4">
          <Form {...form} onSubmit={form.handleSubmit(handleSearch)}>
            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Search for cars..." 
                          className="pl-10 h-12 bg-white text-black" 
                          {...field}
                        />
                        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="h-12 px-6 bg-white text-[#007ac8] hover:bg-gray-100">
                Search
              </Button>
            </div>
          </Form>
        </div>
      </div>
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <Breadcrumb className="text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Search Results</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar - desktop */}
          <div className="hidden md:block w-64 shrink-0">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                </div>
                
                <Accordion type="multiple" className="space-y-4">
                  {/* Make filter */}
                  <AccordionItem value="make" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm font-medium">
                      Make
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <div className="space-y-2">
                        {uniqueMakes.map((make) => (
                          <div key={make} className="flex items-center">
                            <Checkbox 
                              id={`make-${make}`} 
                              checked={selectedMake === make}
                              onCheckedChange={() => {
                                const newParams = new URLSearchParams(searchParams);
                                if (selectedMake === make) {
                                  newParams.delete("make");
                                  setSelectedMake("");
                                } else {
                                  newParams.set("make", make);
                                  setSelectedMake(make);
                                }
                                setSearchParams(newParams);
                              }}
                            />
                            <label 
                              htmlFor={`make-${make}`}
                              className="ml-2 text-sm"
                            >
                              {make}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* Price Range filter */}
                  <AccordionItem value="price" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm font-medium">
                      Price Range
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                          className="text-sm"
                        />
                        <span className="flex items-center">-</span>
                        <Input 
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* Year Range filter */}
                  <AccordionItem value="year" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm font-medium">
                      Year
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="From"
                          value={yearRange.min}
                          onChange={(e) => setYearRange({...yearRange, min: e.target.value})}
                          className="text-sm"
                        />
                        <span className="flex items-center">-</span>
                        <Input 
                          placeholder="To"
                          value={yearRange.max}
                          onChange={(e) => setYearRange({...yearRange, max: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
          
          {/* Mobile filters button */}
          <div className="md:hidden mb-4">
            <Button 
              className="w-full flex justify-between items-center"
              variant="outline"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <span className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${mobileFiltersOpen ? 'transform rotate-180' : ''}`} />
            </Button>
            
            {mobileFiltersOpen && (
              <Card className="mt-2">
                <CardContent className="p-4">
                  {/* Mobile filters content */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Filters</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                  
                  {/* Mobile filters */}
                  {/* You can add mobile-optimized filters here */}
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Main content */}
          <div className="flex-grow">
            {/* Sort and results count */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <p className="text-gray-600 mb-2 md:mb-0">
                {loading ? "Loading..." : `${totalCount} results found`}
              </p>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Sort by:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      {sortBy === "newest" ? "Newest" : 
                       sortBy === "oldest" ? "Oldest" : 
                       sortBy === "price_low_high" ? "Price: Low to High" :
                       "Price: High to Low"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                      Oldest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price_low_high")}>
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price_high_low")}>
                      Price: High to Low
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Premium listings section */}
            {premiumListings.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <Package2 className="mr-2 h-5 w-5 text-[#007ac8]" />
                  Premium Listings
                </h2>
                <div className="space-y-4">
                  {premiumListings.map(listing => (
                    <Link to={`/listing/${listing.id}`} key={listing.id}>
                      <Card className="overflow-hidden hover:shadow-md transition-shadow border-2 border-[#007ac8]/20">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 relative">
                            {/* Listing image */}
                            <img 
                              src={listing.images?.[0] || "/placeholder.svg"} 
                              alt={listing.title}
                              className="w-full h-48 md:h-full object-cover"
                            />
                            
                            {/* Premium badge */}
                            <div className="absolute top-2 left-2 bg-[#007ac8] text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
                              <Package2 className="mr-1 h-3 w-3" />
                              Premium
                            </div>
                          </div>
                          
                          <div className="p-4 md:p-6 md:w-2/3">
                            <h3 className="text-xl font-bold mb-2">{listing.title}</h3>
                            <p className="text-lg font-bold text-[#007ac8] mb-2">
                              {formatPrice(listing.price)}
                            </p>
                            
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm text-gray-600">
                              <div>{listing.year}</div>
                              <div>{listing.make} {listing.model}</div>
                              {listing.mileage && <div>{listing.mileage.toLocaleString()} km</div>}
                              {listing.transmission && <div>{listing.transmission}</div>}
                              {listing.fuel_type && <div>{listing.fuel_type}</div>}
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-500">
                              <div>{listing.location || 'Location not specified'}</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
                
                <Separator className="my-6" />
              </div>
            )}
            
            {/* Loading state */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {/* Regular listings */}
                {listings.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No listings found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listings.map(listing => (
                      <Link to={`/listing/${listing.id}`} key={listing.id}>
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3">
                              <img 
                                src={listing.images?.[0] || "/placeholder.svg"} 
                                alt={listing.title}
                                className="w-full h-48 md:h-full object-cover"
                              />
                            </div>
                            
                            <div className="p-4 md:p-6 md:w-2/3">
                              <h3 className="text-xl font-bold mb-2">{listing.title}</h3>
                              <p className="text-lg font-bold text-[#007ac8] mb-2">
                                {formatPrice(listing.price)}
                              </p>
                              
                              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm text-gray-600">
                                <div>{listing.year}</div>
                                <div>{listing.make} {listing.model}</div>
                                {listing.mileage && <div>{listing.mileage.toLocaleString()} km</div>}
                                {listing.transmission && <div>{listing.transmission}</div>}
                                {listing.fuel_type && <div>{listing.fuel_type}</div>}
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-500">
                                <div>{listing.location || 'Location not specified'}</div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            isActive={page === currentPage}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Add default export to fix the import issue
export default SearchResults;
