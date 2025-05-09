
-- Create a view to access user emails more easily
CREATE OR REPLACE VIEW public.auth_users_view AS
SELECT
  id,
  email
FROM
  auth.users;

-- Set up RLS so users can only see their own email or admins can see all
ALTER VIEW public.auth_users_view ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own email
CREATE POLICY "Users can view their own email"
ON public.auth_users_view
FOR SELECT
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
