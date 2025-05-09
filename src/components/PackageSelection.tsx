
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Trophy, Zap } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
        
        // Parse the JSON features field into array when setting packages
        const parsedPackages = (data || []).map(pkg => ({
          ...pkg,
          features: Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features as string)
        }));
        
        setPackages(parsedPackages);
      } catch (error: any) {
        console.error('Error fetching packages:', error.message);
        toast({
          title: "Error",
          description: "Could not load packages. Please try again.",
          variant: "destructive"
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
    <div className="py-4">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Select a Package</h3>
        <p className="text-gray-500">Choose a package to enhance your listing visibility</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id} 
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
                {packageIcons[pkg.level - 1]}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">${pkg.price}</span>
              </div>
              
              <ul className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={() => onSelect(pkg.id, pkg.level)}
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

      <div className="mt-6 text-center">
        <Button
          variant="outline"
          onClick={() => onSelect('', 0)} 
          className={`min-w-[200px] ${!selectedPackageId ? 'border-[#007ac8] text-[#007ac8]' : ''}`}
        >
          Continue with standard listing
        </Button>
      </div>
    </div>
  );
};

export default PackageSelection;
