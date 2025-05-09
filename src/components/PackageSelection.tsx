
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Trophy, Zap, Info } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface PackageSelectionProps {
  onSelect: (packageId: string, packageLevel: number) => void;
  selectedPackageId: string | null;
}

// Define feature tooltips
const featureTooltips: Record<string, string> = {
  "Hero exposure (1 week)": "Your car is placed at the very top of key pages, giving it maximum attention. More views = faster sale.\n• Spotlight position on homepage or search\n• Shown to the most active buyers first",
  "Hero exposure (1 month)": "Your car is placed at the very top of key pages, giving it maximum attention. More views = faster sale.\n• Spotlight position on homepage or search\n• Shown to the most active buyers first",
  "Featured on homepage carousel": "Your car appears in a rotating banner on the homepage.\n• Eye-catching display\n• Perfect for grabbing quick attention\n• High engagement from serious buyers",
  "Top position in search results": "Your listing will appear at the top of relevant search results.",
  "Higher visibility": "Your listing will receive increased visibility across the platform.",
  "Email alerts to nearby buyers": "We'll send email notifications about your car to potential buyers in your area.",
  "SMS notifications to local buyers": "We'll send SMS notifications about your car to potential buyers in your area.",
  "Priority customer support": "Get faster response times and dedicated support agents."
};

// Pre-defined packages that match the pricing table
const predefinedPackages = [
  {
    name: "Standard",
    level: 0,
    price: 0,
    duration_days: 30,
    features: [
      "AI-powered one-click listing",
      "Listing stays until sold",
      "Standard search visibility",
      "Secure messaging",
      "ID-verified posting"
    ]
  },
  {
    name: "Top Search Results",
    level: 1,
    price: 29.99,
    duration_days: 30,
    features: [
      "AI-powered one-click listing",
      "Listing stays until sold",
      "Standard search visibility",
      "Secure messaging",
      "ID-verified posting",
      "Top position in search results",
      "Higher visibility",
      "24/7 customer support"
    ]
  },
  {
    name: "Premium Visibility",
    level: 2,
    price: 49.99,
    duration_days: 30,
    features: [
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
    ]
  },
  {
    name: "Maximum Exposure",
    level: 3,
    price: 79.99,
    duration_days: 30,
    features: [
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
  }
];

const PackageSelection = ({ onSelect, selectedPackageId }: PackageSelectionProps) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('listing_packages')
          .select('*')
          .eq('active', true)
          .order('level', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Parse the JSON features field into array when setting packages
          const parsedPackages = data.map(pkg => ({
            ...pkg,
            features: Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features as string)
          }));
          
          setPackages(parsedPackages);
        } else {
          // If no packages in database, use predefined ones
          setPackages(predefinedPackages as Package[]);
        }
      } catch (error: any) {
        console.error('Error fetching packages:', error.message);
        // Fall back to predefined packages if there's an error
        setPackages(predefinedPackages as Package[]);
        toast({
          title: "Using default packages",
          description: "Could not load custom packages from database.",
          variant: "default"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Icons for each package level
  const packageIcons = [
    <Star className="h-6 w-6 text-yellow-500" />,
    <Trophy className="h-6 w-6 text-blue-500" />,
    <Zap className="h-6 w-6 text-purple-600" />
  ];

  // Function to render feature with tooltip if needed
  const renderFeature = (feature: string) => {
    const hasTooltip = feature in featureTooltips;
    
    return (
      <div className="flex items-start">
        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
        <span className="text-sm">{feature}</span>
        {hasTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 ml-1 text-blue-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs whitespace-pre-line">
                <p>{featureTooltips[feature]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Loading packages...</p>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="text-center p-8">
        <p>No packages are currently available. Please continue with a standard listing.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="py-4">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Select a Package</h3>
          <p className="text-gray-500">Choose a package to enhance your listing visibility</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {packages.map((pkg, index) => (
            <Card 
              key={pkg.id || `pkg-${index}`} 
              className={`relative overflow-hidden transition-all ${
                selectedPackageId === pkg.id 
                  ? 'ring-2 ring-[#007ac8] shadow-lg' 
                  : 'hover:shadow-md'
              }`}
            >
              {pkg.level === 3 && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-semibold transform rotate-0 translate-x-0 -translate-y-0">
                  Best Value
                </div>
              )}
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription>
                      {pkg.duration_days}-day visibility
                    </CardDescription>
                  </div>
                  {index > 0 && packageIcons[index - 1]}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">${pkg.price.toFixed(2)}</span>
                </div>
                
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      {renderFeature(feature)}
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={() => onSelect(pkg.id || `pkg-${index}`, pkg.level)}
                  className={`w-full ${
                    selectedPackageId === pkg.id 
                      ? 'bg-[#007ac8] hover:bg-[#0069b4]' 
                      : 'bg-white text-[#007ac8] border border-[#007ac8] hover:bg-[#f0f9ff]'
                  }`}
                >
                  {selectedPackageId === pkg.id ? 'Selected' : 'Select'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Only show standard option if there are packages beyond free tier */}
        {packages.some(pkg => pkg.price > 0) && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => onSelect('', 0)} 
              className={`min-w-[200px] ${!selectedPackageId ? 'border-[#007ac8] text-[#007ac8]' : ''}`}
            >
              Continue with standard listing
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default PackageSelection;
