
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
    console.log("Attempting to create default admin");
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Default admin credentials
    const email = 'root@admin.com';
    const password = 'root123';

    // Check if the admin user already exists
    const { data: usersList, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error listing users:", usersError);
      throw new Error("Failed to list users");
    }
    
    // Find if email exists
    let existingUser = usersList.users.find(user => user.email === email);
    
    console.log(`Existing user check: ${existingUser ? 'Found' : 'Not found'}`);

    // If admin already exists, just return user id
    if (existingUser) {
      console.log("Admin user already exists, ensuring they're in admins table");
      
      // Make sure they're in the admins table
      const { error: adminError } = await supabaseAdmin
        .from('admins')
        .upsert({ user_id: existingUser.id })
        .select();
      
      if (adminError) {
        console.error("Error ensuring admin role:", adminError);
        throw new Error("Failed to ensure admin role");
      }
      
      return new Response(
        JSON.stringify({ message: "Default admin already exists", userId: existingUser.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new admin user
    console.log("Creating new admin user");
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
