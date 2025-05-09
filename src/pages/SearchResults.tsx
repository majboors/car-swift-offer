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
import { ChevronDown, Filter, Loader, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

type SortOption = "price_low" | "price_high" | "year_new" | "year_old" | "newest";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Search parameters
  const make = searchParams.get("make") || "";
  const model = searchParams.get("model") || "";
  const bodyType = searchParams.get("bodyType") || "";
  const searchQuery = searchParams.get("query") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentSort = (searchParams.get("sort") as SortOption) || "newest";
  
  // State
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [carListings, setCarListings] = useState<any[]>([]);
  const [features, setFeatures] = useState<Record<string, string[]>>({});
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [carData, setCarData] = useState<any[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableBodyTypes, setAvailableBodyTypes] = useState<string[]>([]);

  // Form for editing search queries
  const form = useForm({
    defaultValues: {
      makeInput: make,
      modelInput: model,
      bodyTypeInput: bodyType,
      searchInput: searchQuery,
    }
  });
  
  // Pagination
  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  // Fetch car data for form options
  useEffect(() => {
    fetch('/public.json')
      .then(response => response.json())
      .then(data => {
        setCarData(data);
      })
      .catch(error => console.error('Error loading car data:', error));
  }, []);
  
  // Update available models when make changes
  useEffect(() => {
    if (make) {
      const models = [...new Set(
        carData
          .filter(item => item.car === make)
          .map(item => item.model)
      )].sort();
      
      setAvailableModels(models);
    } else {
      setAvailableModels([]);
    }
  }, [make, carData]);
  
  // Update available body types when model changes
  useEffect(() => {
    if (make && model) {
      const car = carData.find(
        item => item.car === make && item.model === model
      );
      
      if (car) {
        setAvailableBodyTypes(car.body_type);
      } else {
        setAvailableBodyTypes([]);
      }
    } else {
      setAvailableBodyTypes([]);
    }
  }, [model, make, carData]);

  // Update form values when search params change
  useEffect(() => {
    form.setValue("makeInput", make);
    form.setValue("modelInput", model);
    form.setValue("bodyTypeInput", bodyType);
    form.setValue("searchInput", searchQuery);
  }, [make, model, bodyType, searchQuery, form]);
  
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
        if (listing.features && typeof listing.features === 'object') {
          // Handle features as a JSON object
          Object.entries(listing.features).forEach(([category, featureList]) => {
            if (!allFeatures[category]) {
              allFeatures[category] = new Set();
            }
            
            if (Array.isArray(featureList)) {
              featureList.forEach(feature => {
                if (typeof feature === 'string') {
                  allFeatures[category].add(feature);
                }
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
      
      // Enhanced text search implementation - improved to search in more fields with better matching
      if (searchQuery) {
        // Split the search query into keywords for better partial matching
        const keywords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        
        if (keywords.length > 0) {
          console.log("Search using keywords:", keywords);
          
          // Search across multiple columns without using the problematic ::text casting
          const filterConditions: string[] = [];
          
          keywords.forEach(keyword => {
            // Add conditions for each standard text column
            filterConditions.push(
              `title.ilike.%${keyword}%`,
              `description.ilike.%${keyword}%`,
              `make.ilike.%${keyword}%`,
              `model.ilike.%${keyword}%`,
              `body_type.ilike.%${keyword}%`,
              `fuel_type.ilike.%${keyword}%`,
              `transmission.ilike.%${keyword}%`,
              `car_name.ilike.%${keyword}%`,
              `color.ilike.%${keyword}%`
            );
          });
          
          // Combine all keyword filters with OR
          if (filterConditions.length > 0) {
            const combinedFilter = filterConditions.join(',');
            console.log("Enhanced combined filter:", combinedFilter);
            query = query.or(combinedFilter);
          }
          
          console.log("Final query to be executed:", query);
        }
      }
      
      // Handle feature filtering - completely client-side approach
      let shouldApplyFeatureFilters = false;
      
      if (Object.keys(selectedFeatures).length > 0) {
        // Check if we have any selected features
        for (const category in selectedFeatures) {
          if (selectedFeatures[category].length > 0) {
            shouldApplyFeatureFilters = true;
            break;
          }
        }
      }
      
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
      
      // Apply pagination - but only if we're not going to filter by features
      // Otherwise, we'll do pagination after filtering
      if (!shouldApplyFeatureFilters) {
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);
      }
      
      // Execute query
      const { data, count, error } = await query;
      
      if (error) {
        console.error("Error details:", error);
        throw error;
      }
      
      // Post-process search for keywords in features - do this client-side since we can't reliably query JSON
      let filteredData = data || [];
      
      // If we have a search query, also filter for matches in the features object
      if (searchQuery && filteredData.length > 0) {
        const keywords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        
        if (keywords.length > 0) {
          // Additional client-side filtering for features
          filteredData = filteredData.filter(listing => {
            // If the listing already matched based on standard columns, keep it
            // If we want to search features too:
            if (listing.features) {
              const featuresStr = JSON.stringify(listing.features).toLowerCase();
              // Check if any keyword is in the features JSON
              return keywords.some(keyword => featuresStr.includes(keyword));
            }
            return true;
          });
        }
      }
      
      // If we need to filter by features, do it in memory and then paginate the results
      if (shouldApplyFeatureFilters && filteredData.length > 0) {
        console.log("Applying client-side feature filters");
        
        filteredData = filteredData.filter(listing => {
          // Check if the listing has features
          if (!listing.features) return false;
          
          // Check each selected feature category
          for (const [category, featureList] of Object.entries(selectedFeatures)) {
            // If this category has no selected features, skip it
            if (!featureList.length) continue;
            
            // Get the features in this category for the current listing
            const listingFeatures = listing.features[category];
            
            // If the listing doesn't have this category, it doesn't match
            if (!listingFeatures || !Array.isArray(listingFeatures)) return false;
            
            // Check if ANY of the selected features in this category are present
            const hasAnyFeature = featureList.some(selectedFeature => 
              listingFeatures.includes(selectedFeature)
            );
            
            // If none of the features match, this listing doesn't match
            if (!hasAnyFeature) return false;
          }
          
          // If we got here, all category checks passed
          return true;
        });
        
        // Now apply pagination to the filtered results
        const total = filteredData.length;
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, total);
        
        setTotalResults(total);
        setCarListings(filteredData.slice(start, end));
      } else {
        // No feature filtering, just use the data from the query
        setCarListings(filteredData);
        setTotalResults(count || 0);
      }
    } catch (error: any) {
      console.error("Error fetching listings:", error);
      toast({
        title: "Error",
        description: "Failed to load car listings. Please try again.",
        variant: "destructive",
      });
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
  }, [make, model, bodyType, currentPage, currentSort, selectedFeatures, searchQuery]);
  
  // Toggle feature selection
  const toggleFeature = (category: string, feature: string) => {
    console.log(`Toggling feature: ${category} - ${feature}`);
    
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
      
      console.log("Updated selected features:", current);
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
    if (searchQuery) params.set("query", searchQuery);
    params.set("page", "1");
    setSearchParams(params);
  };
  
  // Update search queries
  const updateSearch = (values: any) => {
    const params = new URLSearchParams();
    
    if (values.makeInput) params.set("make", values.makeInput);
    if (values.modelInput) params.set("model", values.modelInput);
    if (values.bodyTypeInput) params.set("bodyType", values.bodyTypeInput);
    if (values.searchInput) params.set("query", values.searchInput);
    
    params.set("page", "1");
    params.set("sort", currentSort);
    
    setSearchParams(params);
  };
  
  // Clear a specific search param
  const clearSearchParam = (param: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(param);
    setSearchParams(params);
    
    // Update form
    if (param === "make") {
      form.setValue("makeInput", "");
      form.setValue("modelInput", "");
      form.setValue("bodyTypeInput", "");
    } else if (param === "model") {
      form.setValue("modelInput", "");
      form.setValue("bodyTypeInput", "");
    } else if (param === "bodyType") {
      form.setValue("bodyTypeInput", "");
    } else if (param === "query") {
      form.setValue("searchInput", "");
    }
  };
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Get unique car makes
  const carMakes = [...new Set(carData.map(item => item.car))].sort();
  
  return (
    <div className="flex flex-col min-h-screen">
      <TrustedBanner />
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/">
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
            {make || model || bodyType || searchQuery ? (
              <>
                {make} {model} {bodyType} {searchQuery && `"${searchQuery}"`} Cars
              </>
            ) : (
              "All Cars"
            )}
          </h1>
          
          <p className="text-gray-600 mb-4">
            {loading ? (
              <span className="flex items-center">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Searching...
              </span>
            ) : (
              `${totalResults} cars found`
            )}
          </p>
          
          {/* Active filters pills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {make && (
              <div className="bg-[#E5DEFF] text-[#6E59A5] rounded-full px-3 py-1 text-sm flex items-center">
                <span>Make: {make}</span>
                <button onClick={() => clearSearchParam("make")} className="ml-2">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {model && (
              <div className="bg-[#E5DEFF] text-[#6E59A5] rounded-full px-3 py-1 text-sm flex items-center">
                <span>Model: {model}</span>
                <button onClick={() => clearSearchParam("model")} className="ml-2">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {bodyType && (
              <div className="bg-[#E5DEFF] text-[#6E59A5] rounded-full px-3 py-1 text-sm flex items-center">
                <span>Body type: {bodyType}</span>
                <button onClick={() => clearSearchParam("bodyType")} className="ml-2">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {searchQuery && (
              <div className="bg-[#E5DEFF] text-[#6E59A5] rounded-full px-3 py-1 text-sm flex items-center">
                <span>Search: {searchQuery}</span>
                <button onClick={() => clearSearchParam("query")} className="ml-2">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4">Refine Search</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(updateSearch)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="makeInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <select
                            className="w-full p-2 border rounded-md pr-8 appearance-none"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const newMake = e.target.value;
                              if (newMake !== make) {
                                form.setValue("modelInput", "");
                                form.setValue("bodyTypeInput", "");
                              }
                            }}
                          >
                            <option value="">All makes</option>
                            {carMakes.map((carMake) => (
                              <option key={carMake} value={carMake}>
                                {carMake}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="modelInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <select
                            className="w-full p-2 border rounded-md pr-8 appearance-none"
                            {...field}
                            disabled={!form.watch("makeInput")}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value !== model) {
                                form.setValue("bodyTypeInput", "");
                              }
                            }}
                          >
                            <option value="">All models</option>
                            {availableModels.map((model) => (
                              <option key={model} value={model}>
                                {model}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bodyTypeInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <select
                            className="w-full p-2 border rounded-md pr-8 appearance-none"
                            {...field}
                            disabled={!form.watch("modelInput")}
                          >
                            <option value="">All body types</option>
                            {availableBodyTypes.map((bodyType) => (
                              <option key={bodyType} value={bodyType}>
                                {bodyType}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Text search field */}
              <FormField
                control={form.control}
                name="searchInput"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Search by make, model, features (electric, leather seats, etc)..."
                          className="pl-10"
                          {...field}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="bg-[#007ac8] hover:bg-[#0069b4] text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Update Search
              </Button>
            </form>
          </Form>
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
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 bg-white rounded-lg shadow-md p-3">
              <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                <span className="text-sm font-medium">Sort by:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border border-gray-300">
                      {currentSort === "newest" && "Newest"}
                      {currentSort === "price_low" && "Price: Low to High"}
                      {currentSort === "price_high" && "Price: High to Low"}
                      {currentSort === "year_new" && "Year: Newest First"}
                      {currentSort === "year_old" && "Year: Oldest First"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => handleSortChange("newest")} 
                      className={cn(currentSort === "newest" && "bg-slate-100")}>
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("price_low")}
                      className={cn(currentSort === "price_low" && "bg-slate-100")}>
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("price_high")}
                      className={cn(currentSort === "price_high" && "bg-slate-100")}>
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("year_new")}
                      className={cn(currentSort === "year_new" && "bg-slate-100")}>
                      Year: Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("year_old")}
                      className={cn(currentSort === "year_old" && "bg-slate-100")}>
                      Year: Oldest First
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                    <Card className="h-full hover:shadow-lg transition-shadow border border-transparent hover:border-[#007ac8]">
                      <div className="aspect-[4/3] relative">
                        <img 
                          src={car.images?.[0] || "/placeholder.svg"} 
                          alt={`${car.make} ${car.model}`} 
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                        <div className="absolute top-0 right-0 bg-[#007ac8] text-white px-3 py-1 m-2 rounded-md font-semibold">
                          {car.year}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1 text-lg">
                          {car.make} {car.model}
                        </h3>
                        <div className="flex justify-between items-center">
                          <p className="text-gray-600 text-sm">
                            {car.body_type || 'N/A'} • {car.transmission || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}
                          </p>
                        </div>
                        <p className="text-lg text-[#007ac8] font-bold mt-2">
                          {formatPrice(car.price)}
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
