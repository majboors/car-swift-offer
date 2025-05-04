
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
    // Create Supabase client using the auth header from the request
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );
    
    // Create admin client for admin operations
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if the requesting user is authenticated
    const { data: { user: authUser }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !authUser) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if requesting user is an admin
    const { data: adminCheck, error: adminCheckError } = await adminClient
      .from('admins')
      .select('id')
      .eq('user_id', authUser.id)
      .single();

    if (adminCheckError || !adminCheck) {
      console.error("Admin check error:", adminCheckError);
      return new Response(
        JSON.stringify({ error: "Not authorized - admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin check passed, retrieving all car listings");

    // Get all car listings using the admin client to bypass RLS
    const { data: listings, error: listingsError } = await adminClient
      .from('car_listings')
      .select('*');

    if (listingsError) {
      console.error("Error fetching listings:", listingsError);
      throw listingsError;
    }

    // Get all users for adding email
    const { data: users, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users for mapping:", usersError);
      throw usersError;
    }

    // Create a map for quick user lookup
    const userMap = new Map();
    users.users.forEach((user) => {
      userMap.set(user.id, user.email);
    });

    // Add user email to each listing
    const enhancedListings = listings.map(listing => ({
      ...listing,
      user_email: userMap.get(listing.user_id) || 'Unknown'
    }));

    return new Response(
      JSON.stringify(enhancedListings),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get_car_listings_with_users function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
