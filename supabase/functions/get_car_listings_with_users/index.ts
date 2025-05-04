
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("get_car_listings_with_users function called");
    
    // Create admin client for direct admin operations with service role key
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create auth client from request for user verification
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { 
          headers: { Authorization: req.headers.get('Authorization')! } 
        },
      }
    );
    
    // First verify the user is authenticated
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    console.log("Auth check result:", user ? "User authenticated" : "Auth failed", authError);
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("User authenticated:", user.id);

    // Then check if the user is an admin
    const { data: admins, error: adminsError } = await adminClient
      .from('admins')
      .select('*')
      .eq('user_id', user.id);
    
    console.log("Admin check data:", admins, "Admin check error:", adminsError);

    if (adminsError) {
      console.error("Error checking admin status:", adminsError);
      return new Response(
        JSON.stringify({ error: "Error checking admin status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!admins || admins.length === 0) {
      console.error("User is not an admin:", user.id);
      return new Response(
        JSON.stringify({ error: "Not authorized - admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin check passed, retrieving all car listings");

    // Get all car listings using the admin client
    const { data: listings, error: listingsError } = await adminClient
      .from('car_listings')
      .select('*');

    if (listingsError) {
      console.error("Error fetching listings:", listingsError);
      return new Response(
        JSON.stringify({ error: listingsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully fetched listings, count:", listings?.length || 0);

    // Get all users for adding email using admin.listUsers()
    const { data, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users for mapping:", usersError);
      return new Response(
        JSON.stringify({ error: usersError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a map for quick user lookup
    const userMap = new Map();
    data.users.forEach((user) => {
      userMap.set(user.id, user.email);
    });

    // Add user email to each listing
    const enhancedListings = listings.map(listing => ({
      ...listing,
      user_email: userMap.get(listing.user_id) || 'Unknown'
    }));

    console.log("Successfully enhanced listings with user emails");

    return new Response(
      JSON.stringify(enhancedListings),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get_car_listings_with_users function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
