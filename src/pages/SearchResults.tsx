import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TrustedBanner from "@/components/TrustedBanner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Filter, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "price_low" | "price_high" | "year_new" | "year_old" | "newest";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Search parameters
  const make = searchParams.get("make") || "";
  const model = searchParams.get("model") || "";
  const bodyType = searchParams.get("bodyType") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentSort = (searchParams.get("sort") as SortOption) || "newest";
  
  // State
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [carListings, setCarListings] = useState<any[]>([]);
  const [features, setFeatures] = useState<Record<string, string[]>>({});
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Pagination
  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  
  // Fetch available features from car listings
  const fetchAvailableFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from("car_listings")
        .select("features");
      
      if (error) {
        console.error("Error fetching features:", error);
        return;
      }
      
      // Extract all unique features
      const allFeatures: Record<string, Set<string>> = {};
      
      data.forEach(listing => {
        if (listing.features) {
          Object.entries(listing.features).forEach(([category, featureList]) => {
            if (!allFeatures[category]) {
              allFeatures[category] = new Set();
            }
            
            if (Array.isArray(featureList)) {
              featureList.forEach(feature => {
                allFeatures[category].add(feature);
              });
            }
          });
        }
      });
      
      // Convert sets to arrays
      const processedFeatures: Record<string, string[]> = {};
      Object.entries(allFeatures).forEach(([category, featureSet]) => {
        processedFeatures[category] = Array.from(featureSet).sort();
      });
      
      setFeatures(processedFeatures);
    } catch (error) {
      console.error("Error processing features:", error);
    }
  };
  
  // Fetch car listings matching search criteria
  const fetchListings = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from("car_listings")
        .select("*", { count: "exact" });
      
      // Apply basic filters
      if (make) {
        query = query.ilike("make", `%${make}%`);
      }
      
      if (model) {
        query = query.ilike("model", `%${model}%`);
      }
      
      if (bodyType) {
        query = query.ilike("body_type", `%${bodyType}%`);
      }
      
      // Apply feature filters
      Object.entries(selectedFeatures).forEach(([category, selectedFeatureList]) => {
        if (selectedFeatureList.length > 0) {
          // For each selected feature, we check if it exists in the features JSON
          selectedFeatureList.forEach(feature => {
            query = query.or(`features->${category}->contains("${feature}")`);
          });
        }
      });
      
      // Apply sorting
      switch (currentSort) {
        case "price_low":
          query = query.order("price", { ascending: true });
          break;
        case "price_high":
          query = query.order("price", { ascending: false });
          break;
        case "year_new":
          query = query.order("year", { ascending: false });
          break;
        case "year_old":
          query = query.order("year", { ascending: true });
          break;
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
      }
      
      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      // Execute query
      const { data, count, error } = await query
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      setCarListings(data || []);
      setTotalResults(count || 0);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load car listings. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize
  useEffect(() => {
    fetchAvailableFeatures();
  }, []);
  
  // Fetch listings when search parameters change
  useEffect(() => {
    fetchListings();
  }, [make, model, bodyType, currentPage, currentSort, selectedFeatures]);
  
  // Toggle feature selection
  const toggleFeature = (category: string, feature: string) => {
    setSelectedFeatures(prev => {
      const current = {...prev};
      
      if (!current[category]) {
        current[category] = [];
      }
      
      if (current[category].includes(feature)) {
        current[category] = current[category].filter(f => f !== feature);
      } else {
        current[category] = [...current[category], feature];
      }
      
      return current;
    });
    
    // Reset to page 1 when filters change
    if (currentPage !== 1) {
      updateSearchParam("page", "1");
    }
  };
  
  // Update search parameters
  const updateSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    setSearchParams(params);
  };
  
  // Handle sorting change
  const handleSortChange = (option: SortOption) => {
    updateSearchParam("sort", option);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedFeatures({});
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (bodyType) params.set("bodyType", bodyType);
    params.set("page", "1");
    setSearchParams(params);
  };
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <TrustedBanner />
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Search Results</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        {/* Search Summary */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {make || model || bodyType ? (
              <>
                {make} {model} {bodyType} Cars
              </>
            ) : (
              "All Cars"
            )}
          </h1>
          
          <p className="text-gray-600">
            {loading ? (
              <span className="flex items-center">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Searching...
              </span>
            ) : (
              `${totalResults} cars found`
            )}
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filter Toggle */}
          <Button 
            variant="outline" 
            className="lg:hidden flex items-center justify-between w-full mb-4"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className="flex items-center">
              <Filter className="w-4 h-4 mr-2" /> Filters
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              isSidebarOpen ? "transform rotate-180" : ""
            )} />
          </Button>
          
          {/* Sidebar Filters */}
          <div className={cn(
            "w-full lg:w-64 lg:flex flex-col",
            isSidebarOpen ? "flex" : "hidden"
          )}>
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-sm text-blue-600"
                >
                  Clear all
                </Button>
              </div>
              
              <Separator className="mb-4" />
              
              {/* Feature filters */}
              {Object.entries(features).map(([category, featureList]) => (
                <Accordion type="single" collapsible key={category} className="mb-2">
                  <AccordionItem value={category} className="border-b-0">
                    <AccordionTrigger className="py-2 font-medium">
                      {category}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-2">
                        {featureList.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${category}-${feature}`}
                              checked={selectedFeatures[category]?.includes(feature) || false}
                              onCheckedChange={() => toggleFeature(category, feature)}
                            />
                            <label 
                              htmlFor={`${category}-${feature}`} 
                              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {feature}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
              
              {Object.keys(features).length === 0 && !loading && (
                <p className="text-sm text-gray-500">No filter options available</p>
              )}
            </div>
          </div>
          
          {/* Search Results */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                <span className="text-sm font-medium">Sort by:</span>
                <select
                  className="border rounded-md p-1 text-sm"
                  value={currentSort}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                >
                  <option value="newest">Newest</option>
                  <option value="price_low">Price (Low to High)</option>
                  <option value="price_high">Price (High to Low)</option>
                  <option value="year_new">Year (Newest First)</option>
                  <option value="year_old">Year (Oldest First)</option>
                </select>
              </div>
            </div>
            
            {/* Results Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : carListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {carListings.map((car) => (
                  <Link to={`/listing/${car.id}`} key={car.id}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <div className="aspect-[4/3] relative">
                        <img 
                          src={car.images?.[0] || "/placeholder.svg"} 
                          alt={`${car.make} ${car.model}`} 
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1 text-lg">
                          {car.year} {car.make} {car.model}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {car.body_type || 'N/A'} • {car.transmission || 'N/A'}
                        </p>
                        <p className="text-lg text-[#007ac8] font-bold">
                          {formatPrice(car.price)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h3 className="text-xl font-medium mb-4">No cars match your search criteria</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search for something else.
                </p>
                <Button 
                  onClick={clearFilters}
                  className="bg-[#007ac8] hover:bg-[#0069b4] text-white"
                >
                  Clear filters
                </Button>
              </div>
            )}
            
            {/* Pagination */}
            {!loading && carListings.length > 0 && totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => updateSearchParam("page", (currentPage - 1).toString())}
                      className={cn(currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer")}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    
                    // Show limited page numbers for better UX
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => updateSearchParam("page", pageNum.toString())}
                            isActive={pageNum === currentPage}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    // Show ellipsis for skipped pages
                    if (
                      (pageNum === currentPage - 2 && pageNum > 2) ||
                      (pageNum === currentPage + 2 && pageNum < totalPages - 1)
                    ) {
                      return <PaginationItem key={`ellipsis-${pageNum}`}>...</PaginationItem>;
                    }
                    
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => updateSearchParam("page", (currentPage + 1).toString())}
                      className={cn(currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResults;
