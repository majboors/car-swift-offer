
-- Function to get a user's email by their ID
CREATE OR REPLACE FUNCTION public.get_user_email(user_id_input UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id_input;
  
  RETURN user_email;
END;
$$;
