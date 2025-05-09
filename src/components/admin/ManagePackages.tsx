
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Plus,
  Loader,
  PackageOpen,
  Info
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Package {
  id: string;
  name: string;
  level: number;
  price: number;
  duration_days: number;
  features: string[];
  active: boolean;
}

// Define standard features for each package level
const standardFeatures = {
  level1: [
    "AI-powered one-click listing",
    "Listing stays until sold",
    "Standard search visibility",
    "Secure messaging",
    "ID-verified posting",
    "Top position in search results",
    "Higher visibility",
    "24/7 customer support"
  ],
  level2: [
    "AI-powered one-click listing",
    "Listing stays until sold",
    "Standard search visibility",
    "Secure messaging",
    "ID-verified posting",
    "Top position in search results",
    "Higher visibility",
    "24/7 customer support",
    "Featured on homepage carousel",
    "Hero exposure (1 week)"
  ],
  level3: [
    "AI-powered one-click listing",
    "Listing stays until sold",
    "Standard search visibility",
    "Secure messaging",
    "ID-verified posting",
    "Top position in search results",
    "Higher visibility",
    "24/7 customer support",
    "Featured on homepage carousel",
    "Email alerts to nearby buyers",
    "SMS notifications to local buyers",
    "Priority customer support",
    "Hero exposure (1 month)"
  ]
};

// Define feature tooltips
const featureTooltips: Record<string, string> = {
  "Hero exposure (1 week)": "Your car is placed at the very top of key pages, giving it maximum attention. More views = faster sale. Spotlight position on homepage or search. Shown to the most active buyers first.",
  "Hero exposure (1 month)": "Your car is placed at the very top of key pages, giving it maximum attention. More views = faster sale. Spotlight position on homepage or search. Shown to the most active buyers first.",
  "Featured on homepage carousel": "Your car appears in a rotating banner on the homepage. Eye-catching display. Perfect for grabbing quick attention. High engagement from serious buyers.",
};

// Package name suggestions based on level
const packageNameSuggestions: Record<number, string> = {
  1: "Top Search Results",
  2: "Premium Visibility",
  3: "Maximum Exposure"
};

// Package price suggestions based on level
const packagePriceSuggestions: Record<number, number> = {
  1: 29.99,
  2: 49.99,
  3: 79.99
};

const ManagePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentPackage, setCurrentPackage] = useState<Package | null>(null);
  const [featureInput, setFeatureInput] = useState<string>("");

  const defaultPackage: Package = {
    id: "",
    name: "",
    level: 0,
    price: 0,
    duration_days: 30,
    features: [],
    active: true,
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("listing_packages")
        .select("*")
        .order("level", { ascending: true });

      if (error) throw error;
      
      // Parse the features JSON from the database
      const parsedPackages = (data || []).map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features as string)
      }));
      
      setPackages(parsedPackages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsEditMode(false);
    setCurrentPackage({ ...defaultPackage });
    setFeatureInput("");
    setIsDialogOpen(true);
  };

  const handleEdit = (pkg: Package) => {
    setIsEditMode(true);
    setCurrentPackage({ ...pkg });
    setFeatureInput("");
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!currentPackage) return;

    let processedValue: any = value;
    if (name === "level") {
      const level = parseInt(value) || 0;
      processedValue = level;
      
      // Auto-suggest package name and price based on level
      if (level >= 1 && level <= 3) {
        setCurrentPackage(prev => {
          if (!prev) return null;
          return {
            ...prev,
            level,
            name: packageNameSuggestions[level] || prev.name,
            price: packagePriceSuggestions[level] || prev.price,
            features: getStandardFeatures(level) || prev.features,
          };
        });
        return;
      }
    } else if (name === "price") {
      processedValue = parseFloat(value) || 0;
    } else if (name === "duration_days") {
      processedValue = parseInt(value) || 30;
    }

    setCurrentPackage({
      ...currentPackage,
      [name]: processedValue,
    });
  };

  const handleActiveChange = (checked: boolean) => {
    if (!currentPackage) return;
    setCurrentPackage({
      ...currentPackage,
      active: checked,
    });
  };

  const handleAddFeature = () => {
    if (!featureInput.trim() || !currentPackage) return;
    
    setCurrentPackage({
      ...currentPackage,
      features: [...currentPackage.features, featureInput.trim()],
    });
    setFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    if (!currentPackage) return;
    
    const updatedFeatures = [...currentPackage.features];
    updatedFeatures.splice(index, 1);
    
    setCurrentPackage({
      ...currentPackage,
      features: updatedFeatures,
    });
  };

  const getStandardFeatures = (level: number): string[] => {
    switch (level) {
      case 1:
        return [...standardFeatures.level1];
      case 2:
        return [...standardFeatures.level2];
      case 3:
        return [...standardFeatures.level3];
      default:
        return [];
    }
  };

  const handleApplyStandardFeatures = () => {
    if (!currentPackage) return;
    
    const level = currentPackage.level;
    const standardFeaturesList = getStandardFeatures(level);
    
    if (standardFeaturesList.length === 0) {
      toast({
        title: "No standard features",
        description: "This level doesn't have standard features defined.",
      });
      return;
    }
    
    setCurrentPackage({
      ...currentPackage,
      features: [...standardFeaturesList],
    });
    
    toast({
      title: "Applied standard features",
      description: `Applied ${standardFeaturesList.length} standard features for level ${level}`,
    });
  };

  const hasTooltip = (feature: string): boolean => {
    return feature in featureTooltips;
  };

  const renderFeature = (feature: string, index: number) => {
    return (
      <li
        key={index}
        className="flex items-center justify-between text-sm p-1 hover:bg-gray-50 rounded"
      >
        <div className="flex items-center gap-1">
          <span>{feature}</span>
          {hasTooltip(feature) && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">{featureTooltips[feature]}</p>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
        <button
          type="button"
          onClick={() => handleRemoveFeature(index)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </li>
    );
  };

  const handleSave = async () => {
    if (!currentPackage) return;
    
    try {
      if (
        !currentPackage.name.trim() ||
        currentPackage.price < 0 ||
        currentPackage.level < 0 ||
        currentPackage.duration_days <= 0
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields with valid values.",
          variant: "destructive",
        });
        return;
      }

      if (isEditMode) {
        const { error } = await supabase
          .from("listing_packages")
          .update({
            name: currentPackage.name,
            level: currentPackage.level,
            price: currentPackage.price,
            duration_days: currentPackage.duration_days,
            features: currentPackage.features,
            active: currentPackage.active,
          })
          .eq("id", currentPackage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("listing_packages").insert({
          name: currentPackage.name,
          level: currentPackage.level,
          price: currentPackage.price,
          duration_days: currentPackage.duration_days,
          features: currentPackage.features,
          active: currentPackage.active,
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: isEditMode
          ? "Package updated successfully"
          : "Package created successfully",
      });

      setIsDialogOpen(false);
      fetchPackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("listing_packages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package deleted successfully",
      });

      fetchPackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Show feature tooltip in table
  const renderFeatureWithTooltip = (feature: string) => {
    if (!hasTooltip(feature)) return feature;
    
    return (
      <div className="flex items-center gap-1">
        {feature}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Info className="h-4 w-4 text-gray-400 cursor-help" />
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <p className="text-sm">{featureTooltips[feature]}</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Listing Packages</CardTitle>
          <CardDescription>Manage your listing subscription packages</CardDescription>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" /> New Package
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration (days)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Features</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>{pkg.name}</TableCell>
                    <TableCell>{pkg.level}</TableCell>
                    <TableCell>${pkg.price.toFixed(2)}</TableCell>
                    <TableCell>{pkg.duration_days}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          pkg.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {pkg.active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <span className="text-sm text-gray-500 cursor-pointer underline">
                            {pkg.features?.length || 0} features
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="max-h-[200px] overflow-y-auto">
                            <p className="font-medium mb-2">Features:</p>
                            <ul className="space-y-1">
                              {pkg.features?.map((feature, idx) => (
                                <li key={idx} className="text-sm flex items-center gap-1">
                                  • {renderFeatureWithTooltip(feature)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(pkg)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(pkg.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <PackageOpen className="h-12 w-12 mb-2" />
                      <h3 className="font-medium text-lg">No packages found</h3>
                      <p>Create your first package to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Package" : "Create New Package"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update the details for this package"
                  : "Fill in the details for your new listing package"}
              </DialogDescription>
            </DialogHeader>

            {currentPackage && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={currentPackage.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="e.g., Premium Package"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="level" className="text-right">
                    Level *
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Input
                      id="level"
                      name="level"
                      type="number"
                      min="1"
                      max="3"
                      value={currentPackage.level}
                      onChange={handleInputChange}
                      className="flex-1"
                      required
                    />
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="h-5 w-5 text-gray-400 cursor-help" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <p className="text-sm mb-2">Recommended levels:</p>
                        <ul className="text-sm space-y-1">
                          <li>Level 1: Top Search Results ($29.99)</li>
                          <li>Level 2: Premium Visibility ($49.99)</li>
                          <li>Level 3: Maximum Exposure ($79.99)</li>
                        </ul>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price ($) *
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentPackage.price}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration (days) *
                  </Label>
                  <Input
                    id="duration"
                    name="duration_days"
                    type="number"
                    min="1"
                    value={currentPackage.duration_days}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="active" className="text-right">
                    Active
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="active"
                      checked={currentPackage.active}
                      onCheckedChange={handleActiveChange}
                    />
                    <Label htmlFor="active">
                      {currentPackage.active ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">Features</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        onClick={handleApplyStandardFeatures}
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        disabled={currentPackage.level < 1}
                      >
                        Apply Standard Features
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        placeholder="Add a feature..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddFeature}
                        variant="secondary"
                      >
                        Add
                      </Button>
                    </div>

                    <div className="border rounded-lg p-2 max-h-[200px] overflow-y-auto">
                      {currentPackage.features.length > 0 ? (
                        <ul className="space-y-1">
                          {currentPackage.features.map((feature, index) => renderFeature(feature, index))}
                        </ul>
                      ) : (
                        <div className="text-center py-2 text-gray-500 text-sm">
                          No features added
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ManagePackages;
