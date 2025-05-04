
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
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Default admin credentials
    const email = 'root@admin.com';
    const password = 'root123';

    // Check if the admin user already exists
    const { data: existingUsers, error: existingError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existingError && existingError.message !== 'No rows found') {
      console.error("Error checking for existing user:", existingError);
      throw new Error("Failed to check for existing admin user");
    }

    // If admin already exists, just return user id
    if (existingUsers) {
      console.log("Admin user already exists");
      
      // Make sure they're in the admins table
      const { error: adminError } = await supabaseAdmin
        .from('admins')
        .upsert({ user_id: existingUsers.id })
        .select();
      
      if (adminError) {
        console.error("Error ensuring admin role:", adminError);
        throw new Error("Failed to ensure admin role");
      }
      
      return new Response(
        JSON.stringify({ message: "Default admin already exists", userId: existingUsers.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new admin user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (error) {
      console.error("Error creating admin user:", error);
      throw new Error("Failed to create admin user");
    }

    // Add user to admins table
    if (data.user) {
      const { error: adminError } = await supabaseAdmin
        .from('admins')
        .insert({ user_id: data.user.id })
        .select();
      
      if (adminError) {
        console.error("Error adding admin role:", adminError);
        throw new Error("Failed to add admin role");
      }
    }

    console.log("Default admin user created successfully");
    
    return new Response(
      JSON.stringify({ 
        message: "Default admin created successfully", 
        userId: data.user?.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in create_default_admin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
