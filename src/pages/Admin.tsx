
// src/pages/Admin.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminListings } from "@/components/admin/AdminListings";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import ManagePackages from "@/components/admin/ManagePackages";
import AdminNotifications from "@/components/admin/AdminNotifications";
import { Loader, BarChart, Bell } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

interface CountData {
  name: string;
  count: number;
}

interface DashboardData {
  listingsByMake: CountData[];
  listingsByBodyType: CountData[];
  listingsByMonth: CountData[];
  totalUsers: number;
  totalListings: number;
  activeUsers: number;
  pendingListings: number; // Added pending listings count
}

const Admin = () => {
  const { user, session, isAdmin, checkAdminStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    listingsByMake: [],
    listingsByBodyType: [],
    listingsByMonth: [],
    totalUsers: 0,
    totalListings: 0,
    activeUsers: 0,
    pendingListings: 0, // Initialize pending listings count
  });

  useEffect(() => {
    const initialize = async () => {
      if (!user || !session) {
        console.log("No user or session found, redirecting to auth page");
        toast({
          title: "Authentication required",
          description: "Please login to access this page",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      try {
        console.log("Admin page - Checking for user:", user.id);
        const isUserAdmin = await checkAdminStatus();
        console.log("Admin check result:", isUserAdmin);

        if (!isUserAdmin) {
          console.log("User is not an admin, redirecting to home page");
          toast({
            title: "Access denied",
            description: "You do not have permission to access the admin dashboard",
            variant: "destructive",
          });
          navigate("/");
        } else {
          console.log("Admin access granted, showing admin dashboard");
          await fetchDashboardData();
        }
      } catch (error) {
        console.error("Admin initialization error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while checking admin status",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [user, session, navigate, checkAdminStatus]);

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching dashboard data...");
      const { data: listings, error: listingsError } = await supabase
        .from("car_listings")
        .select("*");
      if (listingsError) throw listingsError;

      const { data: users, error: usersError } = await supabase.rpc("get_all_users");
      if (usersError) throw usersError;

      // Count pending listings
      const pendingListings = listings?.filter(listing => listing.status === 'pending').length || 0;
      
      // Log all listings to debug
      console.log("All listings:", listings?.map(l => ({ 
        id: l.id, 
        title: l.title,
        make: l.make,
        model: l.model,
        status: l.status 
      })));

      // Process listings by make
      const makeCount: Record<string, number> = {};
      listings?.forEach((listing) => {
        const make = listing.make || "Unknown";
        makeCount[make] = (makeCount[make] || 0) + 1;
      });

      const listingsByMake: CountData[] = Object.entries(makeCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process listings by body type
      const bodyTypeCount: Record<string, number> = {};
      listings?.forEach((listing) => {
        const bodyType = listing.body_type || "Other";
        bodyTypeCount[bodyType] = (bodyTypeCount[bodyType] || 0) + 1;
      });

      const listingsByBodyType: CountData[] = Object.entries(bodyTypeCount).map(
        ([name, count]) => ({ name, count })
      );

      // Process listings by month
      const monthCount: Record<string, number> = {};
      const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec",
      ];

      listings?.forEach((listing) => {
        const date = new Date(listing.created_at);
        const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
        monthCount[monthYear] = (monthCount[monthYear] || 0) + 1;
      });

      // Fix for TypeScript error with month sorting
      const getMonthIndex = (monthName: string): number => {
        const idx = months.indexOf(monthName);
        return idx !== -1 ? idx : -1;
      };

      const listingsByMonth: CountData[] = Object.entries(monthCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => {
          const [aMonth, aYear] = a.name.split(" ");
          const [bMonth, bYear] = b.name.split(" ");
          
          const aYearNum = parseInt(aYear, 10);
          const bYearNum = parseInt(bYear, 10);
          
          if (aYearNum !== bYearNum) {
            return aYearNum - bYearNum;
          }
          
          const aMonthIndex = getMonthIndex(aMonth);
          const bMonthIndex = getMonthIndex(bMonth);
          
          return aMonthIndex - bMonthIndex;
        });

      const activeUsers = users?.filter((u) => u.last_sign_in_at !== null).length || 0;

      setDashboardData({
        listingsByMake,
        listingsByBodyType,
        listingsByMonth,
        totalUsers: users?.length || 0,
        totalListings: listings?.length || 0,
        activeUsers,
        pendingListings,
      });
      
      console.log("Dashboard data updated with:", {
        totalListings: listings?.length || 0,
        pendingListings,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Could not load dashboard data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading admin dashboard...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking admin privileges...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="flex items-center gap-2"
          >
            <BarChart className="h-4 w-4" />
            Refresh Stats
          </Button>
        </div>

        <div className="mb-8">
          <DashboardCharts {...dashboardData} />
        </div>

        <Tabs defaultValue="listings" className="mt-6">
          <TabsList className="mb-6 grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="listings">Manage Listings</TabsTrigger>
            <TabsTrigger value="packages">Manage Packages</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <AdminListings onListingStatusChange={fetchDashboardData} />
          </TabsContent>
          
          <TabsContent value="packages">
            <ManagePackages />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>
          
          <TabsContent value="notifications">
            <AdminNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Admin;
