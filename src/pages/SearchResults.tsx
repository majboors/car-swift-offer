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
import { Badge } from "@/components/ui/badge";
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
import { ChevronDown, Filter, Loader, Search, Star, Trophy, X } from "lucide-react";
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
  const showFeatured = searchParams.get("showFeatured") !== "false"; // Default to true
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentSort = (searchParams.get("sort") as SortOption) || "newest";
  
  // State
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [carListings, setCarListings] = useState<any[]>([]);
  const [showcaseListings, setShowcaseListings] = useState<any[]>([]);
  const [features, setFeatures] = useState<Record<string, string[]>>({});
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [carData, setCarData] = useState<any[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableBodyTypes, setAvailableBodyTypes] = useState<string[]>([]);
  const [showFeaturedToggle, setShowFeaturedToggle] = useState(showFeatured);

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
    setShowFeaturedToggle(showFeatured);
  }, [make, model, bodyType, searchQuery, showFeatured, form]);
  
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
  
  // Function to fetch showcase and featured listings separately
  const fetchShowcaseListings = async () => {
    try {
      console.log("Fetching showcase listings separately");
      const { data, error } = await supabase
        .from("car_listings")
        .select("*")
        .eq("status", "approved")
        .eq("showcase", true)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching showcase listings:", error);
        return [];
      }
      
      console.log(`Found ${data?.length || 0} showcase listings`);
      
      // Debug each showcase listing
      data?.forEach((item, index) => {
        console.log(`Showcase #${index + 1}:`, {
          id: item.id,
          title: item.title || "No title",
          make: item.make || "No make",
          model: item.model || "No model",
          showcase: item.showcase,
          featured: item.featured,
          package_level: item.package_level
        });
      });
      
      return data || [];
    } catch (error) {
      console.error("Error fetching showcase listings:", error);
      return [];
    }
  };

  // Fetch car listings matching search criteria
  const fetchListings = async () => {
    setLoading(true);
    console.log("Fetching listings with the following criteria:");
    console.log("- Make:", make || "Any");
    console.log("- Model:", model || "Any");
    console.log("- Body type:", bodyType || "Any");
    console.log("- Search query:", searchQuery || "None");
    console.log("- Show featured:", showFeatured);
    console.log("- Page:", currentPage);
    console.log("- Sort:", currentSort);
    
    try {
      // Get showcase listings separately (these will always be included)
      const showcaseItems = await fetchShowcaseListings();
      setShowcaseListings(showcaseItems);
      
      // Force fresh data with cache-busting timestamp
      const timestamp = new Date().getTime();
      
      // Main query for regular search results
      let query = supabase
        .from("car_listings")
        .select("*", { count: "exact", head: false })
        .eq("status", "approved"); // Only show approved listings
      
      console.log("Building search query with timestamp:", timestamp);
      
      // Apply basic filters (but more lenient than before)
      if (make) {
        // Use ilike to match partial strings and be case insensitive
        query = query.ilike("make", `%${make}%`);
        console.log(`Applied make filter: %${make}%`);
      }
      
      if (model) {
        query = query.ilike("model", `%${model}%`);
        console.log(`Applied model filter: %${model}%`);
      }
      
      if (bodyType) {
        query = query.ilike("body_type", `%${bodyType}%`);
        console.log(`Applied body_type filter: %${bodyType}%`);
      }
      
      // Enhanced text search implementation with better partial matching
      if (searchQuery) {
        // Split the search query into keywords for better partial matching
        const keywords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        
        if (keywords.length > 0) {
          console.log("Search using keywords:", keywords);
          
          // Use OR conditions to match any of the keywords across all searchable fields
          let orConditions: string[] = [];
          
          // For each keyword, create search conditions across all searchable fields
          keywords.forEach(keyword => {
            // Create a condition for each searchable column
            const searchableColumns = [
              "title", "description", "make", "model", "body_type", 
              "fuel_type", "transmission", "car_name", "color"
            ];
            
            searchableColumns.forEach(column => {
              orConditions.push(`${column}.ilike.%${keyword}%`);
            });
          });
          
          // Join all conditions with commas for the OR query
          if (orConditions.length > 0) {
            const combinedFilter = orConditions.join(',');
            console.log("Enhanced combined filter:", combinedFilter);
            query = query.or(combinedFilter);
          }
        }
      }

      // Include showcase/featured only if the toggle is on
      if (!showFeaturedToggle) {
        query = query.eq("showcase", false).eq("featured", false);
        console.log("Excluding showcase and featured listings");
      }
      
      // Execute query
      const { data, count, error } = await query;
      
      if (error) {
        console.error("Error details:", error);
        throw error;
      }
      
      console.log(`Query returned ${data?.length || 0} regular results`);
      
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
      
      // Post-process search for keywords in features - do this client-side since we can't reliably query JSON
      let filteredData = data || [];
      
      // If we have a search query, also filter for matches in the features object
      if (searchQuery && filteredData.length > 0) {
        const keywords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        
        if (keywords.length > 0) {
          // Add this for debugging
          console.log("Filtering for keywords in features:", keywords);
          console.log("Initial data count:", filteredData.length);
          
          // Additional client-side filtering for features
          const additionalMatches = filteredData.filter(listing => {
            if (listing.features) {
              const featuresStr = JSON.stringify(listing.features).toLowerCase();
              // Check if any keyword is in the features JSON
              return keywords.some(keyword => featuresStr.includes(keyword));
            }
            return false;  // Don't include if no features
          });
          
          // Add any matches from features to the results if they're not already included
          additionalMatches.forEach(match => {
            if (!filteredData.some(item => item.id === match.id)) {
              filteredData.push(match);
            }
          });
          
          console.log("After including feature matches:", filteredData.length);
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
      }

      // Combine regular listings with showcase listings if showFeatured is true and deduplicate
      let combinedListings = [...filteredData];
      
      // Add showcase items if they're not already in the results
      if (showFeaturedToggle && showcaseItems.length > 0) {
        // Add all showcase items that aren't already in the results
        showcaseItems.forEach(showcase => {
          if (!combinedListings.some(item => item.id === showcase.id)) {
            combinedListings.push(showcase);
          }
        });
        
        console.log(`Combined ${filteredData.length} regular listings with ${showcaseItems.length} showcase listings`);
        console.log(`Total listings after combining: ${combinedListings.length}`);
      }
      
      // Custom sort that prioritizes showcase, featured, and package_level
      combinedListings.sort((a, b) => {
        // Showcase items first
        if (a.showcase && !b.showcase) return -1;
        if (!a.showcase && b.showcase) return 1;
        
        // Featured items next
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then by package level
        const levelA = typeof a.package_level === 'number' ? a.package_level : 0;
        const levelB = typeof b.package_level === 'number' ? b.package_level : 0;
        if (levelA !== levelB) return levelB - levelA;  // Higher package levels first
        
        // Then by the selected sort
        switch (currentSort) {
          case "price_low":
            return a.price - b.price;
          case "price_high":
            return b.price - a.price;
          case "year_new":
            return b.year - a.year;
          case "year_old":
            return a.year - b.year;
          case "newest":
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
      
      // Now paginate the sorted results
      const total = combinedListings.length;
      const start = (currentPage - 1) * itemsPerPage;
      const end = Math.min(start + itemsPerPage, total);
      
      const paginatedData = combinedListings.slice(start, end);
      
      // Debug what's in the final results
      console.log("Final search results:");
      console.log(`- Total results: ${total}`);
      console.log(`- Page ${currentPage}: showing ${paginatedData.length} results (items ${start+1}-${end} of ${total})`);
      
      // Check for showcase and featured items in results
      const showcaseInResults = paginatedData.filter(item => item.showcase).length;
      const featuredInResults = paginatedData.filter(item => item.featured).length;
      const premiumInResults = paginatedData.filter(item => item.package_level === 3).length;
      
      console.log(`- Showcase items in current page: ${showcaseInResults}`);
      console.log(`- Featured items in current page: ${featuredInResults}`);
      console.log(`- Premium items in current page: ${premiumInResults}`);
      
      setTotalResults(total);
      setCarListings(paginatedData);
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
  }, [make, model, bodyType, currentPage, currentSort, selectedFeatures, searchQuery, showFeatured]);
  
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
  
  // Toggle featured/showcase items
  const toggleFeaturedItems = () => {
    const newValue = !showFeaturedToggle;
    setShowFeaturedToggle(newValue);
    updateSearchParam("showFeatured", newValue.toString());
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
    params.set("showFeatured", showFeaturedToggle.toString());
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
    params.set("showFeatured", showFeaturedToggle.toString());
    
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
  
  // Get friendly listing type name and icon
  const getListingType = (car: any) => {
    if (car.showcase) return { name: "Showcase", Icon: Trophy, variant: "showcase" };
    if (car.featured) return { name: "Featured", Icon: Star, variant: "featured" };
    if (car.package_level === 3) return { name: "Premium", Icon: Trophy, variant: "premium" };
    if (car.package_level === 2) return { name: "Enhanced", Icon: null, variant: "outline" };
    return null;
  };
  
  // Helper function to get title text
  const getCarTitle = (car: any): string => {
    if (car.title) return car.title;
    
    const year = car.year || "";
    const make = car.make || "";
    const model = car.model || "";
    
    if (year && make && model) {
      return `${year} ${make} ${model}`;
    } else if (make && model) {
      return `${make} ${model}`;
    } else if (make) {
      return make;
    } else if (model) {
      return model;
    }
    
    return "Unlisted Vehicle";
  };
  
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showFeatured" 
                    checked={showFeaturedToggle}
                    onCheckedChange={toggleFeaturedItems}
                  />
                  <label 
                    htmlFor="showFeatured" 
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Show featured & showcase vehicles
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-[#007ac8] hover:bg-[#0069b4] text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Update Search
                </Button>
              </div>
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
              <>
                {/* Display showcase listings at the top if present */}
                {showFeaturedToggle && showcaseListings.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                      Featured Vehicles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {carListings
                        .filter(car => car.showcase || car.featured)
                        .slice(0, 3) // Show at most 3 featured listings
                        .map((car) => (
                          <Link to={`/listing/${car.id}`} key={car.id}>
                            <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group bg-yellow-50 border-yellow-200">
                              <div className="relative">
                                {/* Show appropriate badge based on listing type */}
                                {getListingType(car) && (
                                  <Badge 
                                    variant={getListingType(car)?.variant as any} 
                                    className="absolute top-2 right-2 z-10"
                                  >
                                    {getListingType(car)?.Icon && (
                                      <span>{getListingType(car)?.Icon && React.createElement(getListingType(car)?.Icon, { className: "w-3 h-3 mr-1" })}</span>
                                    )}
                                    {getListingType(car)?.name}
                                  </Badge>
                                )}
                                <div className="aspect-video bg-gray-100 overflow-hidden">
                                  {car.images && car.images.length > 0 ? (
                                    <img
                                      src={Array.isArray(car.images) ? car.images[0] : car.images}
                                      alt={getCarTitle(car)}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                      <span className="text-gray-400">No image available</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-lg line-clamp-1">
                                  {getCarTitle(car)}
                                </h3>
                                <p className="text-lg font-bold text-[#007ac8] mb-2">
                                  {formatPrice(car.price)}
                                </p>
                                <div className="text-sm text-gray-600 space-y-1">
                                  {car.year && <p>Year: {car.year}</p>}
                                  {car.mileage && <p>Mileage: {car.mileage.toLocaleString()} km</p>}
                                  {car.location && <p>Location: {car.location}</p>}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Regular search results */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {carListings
                    .filter(car => !showcaseListings.some(s => s.id === car.id && (car.showcase || car.featured)))
                    .map((car) => (
                      <Link to={`/listing/${car.id}`} key={car.id}>
                        <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                          <div className="relative">
                            {/* Show appropriate badge based on listing type */}
                            {getListingType(car) && (
                              <Badge 
                                variant={getListingType(car)?.variant as any} 
                                className="absolute top-2 right-2 z-10"
                              >
                                {getListingType(car)?.Icon && (
                                  <span>{getListingType(car)?.Icon && React.createElement(getListingType(car)?.Icon, { className: "w-3 h-3 mr-1" })}</span>
                                )}
                                {getListingType(car)?.name}
                              </Badge>
                            )}
                            <div className="aspect-video bg-gray-100 overflow-hidden">
                              {car.images && car.images.length > 0 ? (
                                <img
                                  src={Array.isArray(car.images) ? car.images[0] : car.images}
                                  alt={getCarTitle(car)}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400">No image available</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg line-clamp-1">
                              {getCarTitle(car)}
                            </h3>
                            <p className="text-lg font-bold text-[#007ac8] mb-2">
                              {formatPrice(car.price)}
                            </p>
                            <div className="text-sm text-gray-600 space-y-1">
                              {car.year && <p>Year: {car.year}</p>}
                              {car.mileage && <p>Mileage: {car.mileage.toLocaleString()} km</p>}
                              {car.location && <p>Location: {car.location}</p>}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && updateSearchParam("page", (currentPage - 1).toString())}
                          className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>
                      
                      {Array.from({length: totalPages}).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => updateSearchParam("page", (i + 1).toString())}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && updateSearchParam("page", (currentPage + 1).toString())}
                          className={cn(currentPage >= totalPages && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search filters</p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResults;
