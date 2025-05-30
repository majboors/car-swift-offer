
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );
    
    // Create admin client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if the requesting user is an admin
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: adminCheck, error: adminError } = await supabaseClient
      .from('admins')
      .select('id')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (adminError || !adminCheck) {
      return new Response(
        JSON.stringify({ error: "Not authorized - admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { email, password, make_admin } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the new user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (error) {
      console.error("Error creating user:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If make_admin is true, add to admins table
    if (make_admin && data.user) {
      const { error: adminInsertError } = await supabaseAdmin
        .from('admins')
        .insert({ user_id: data.user.id });
      
      if (adminInsertError) {
        console.error("Error making user admin:", adminInsertError);
        return new Response(
          JSON.stringify({ 
            warning: "User created but could not be made admin",
            userId: data.user.id
          }),
          { status: 207, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        id: data.user?.id,
        email: data.user?.email,
        is_admin: make_admin
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in admin_add_user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
