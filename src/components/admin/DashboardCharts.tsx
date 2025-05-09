import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Bar, 
  XAxis, 
  YAxis, 
  BarChart, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area, 
  CartesianGrid,
  Tooltip
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface AdminStat {
  name: string;
  value: number;
  color: string;
}

interface DashboardChartsProps {
  listingsByMake: {name: string; count: number}[];
  listingsByBodyType: {name: string; count: number}[];
  listingsByMonth: {name: string; count: number}[];
  totalUsers: number;
  totalListings: number;
  activeUsers: number;
  pendingListings?: number; // New prop for pending listings
}

export const DashboardCharts = ({
  listingsByMake,
  listingsByBodyType,
  listingsByMonth,
  totalUsers,
  totalListings,
  activeUsers,
  pendingListings = 0
}: DashboardChartsProps) => {
  const [chartType, setChartType] = useState<'listings' | 'users'>('listings');
  
  const statCards: AdminStat[] = [
    { name: "Total Users", value: totalUsers, color: "#9b87f5" },
    { name: "Active Users", value: activeUsers, color: "#7E69AB" },
    { name: "Total Listings", value: totalListings, color: "#D946EF" },
    // Add pending listings stat card
    { name: "Pending Listings", value: pendingListings, color: "#F97316" },
  ];

  const COLORS = ["#9b87f5", "#7E69AB", "#6E59A5", "#F97316", "#0EA5E9", "#F0ABFC", "#42CCC8", "#6366F1", "#5EEAD4"];
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-l-4" style={{ borderLeftColor: stat.color }}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.name}</CardDescription>
              <CardTitle className="text-2xl flex items-center">
                {stat.value}
                {stat.name === "Pending Listings" && stat.value > 0 && (
                  <Badge className="ml-2 bg-amber-500">Needs Review</Badge>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      
      {/* Charts Tabs */}
      <Tabs defaultValue="listings" className="w-full"
        onValueChange={(value) => setChartType(value as 'listings' | 'users')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="listings">Listings Analytics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="listings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Listings by Make */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-md">Listings by Make</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={listingsByMake}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip />
                      <Bar dataKey="count" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Listings by Body Type */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-md">Listings by Body Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={listingsByBodyType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {listingsByBodyType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Listings Over Time */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-md">Listings Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={listingsByMonth}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#9b87f5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#9b87f5" fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-md">Users Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active Users', value: activeUsers },
                      { name: 'Inactive Users', value: totalUsers - activeUsers }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="cell-active" fill="#9b87f5" />
                    <Cell key="cell-inactive" fill="#D6BCFA" />
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
