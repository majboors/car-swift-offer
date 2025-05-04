
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
    console.log("get_all_admins function called");
    
    // Create Supabase client using the auth header from the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );

    // Get user info for logging purposes
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
    
    console.log("Auth user check:", authUser?.id, "Auth error:", authError);
    
    if (authError) {
      console.error("Authentication error:", authError);
    }

    // Always use admin client for admins check - bypass RLS completely
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all admins directly without RLS constraints
    const { data: admins, error: adminsError } = await supabaseAdmin
      .from('admins')
      .select('*');

    console.log("Admins data:", admins, "Admins error:", adminsError);

    if (adminsError) {
      console.error("Error fetching admins:", adminsError);
      throw adminsError;
    }

    return new Response(
      JSON.stringify(admins),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get_all_admins function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
