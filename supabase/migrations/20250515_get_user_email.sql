
-- Create a function to safely get a user's email by their ID
-- This function is designed to be called by any authenticated user
-- but will only return the email if it exists
CREATE OR REPLACE FUNCTION public.get_user_email(user_id_input UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Try to get the user's email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id_input;
  
  RETURN user_email;
END;
$$;
