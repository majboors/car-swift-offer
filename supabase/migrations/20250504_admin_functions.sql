
-- Function to get all users
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS SETOF auth.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
    RETURN QUERY SELECT * FROM auth.users;
  ELSE
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
END;
$$;

-- Function to get all admins
CREATE OR REPLACE FUNCTION public.get_all_admins()
RETURNS TABLE (id uuid, user_id uuid, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
    RETURN QUERY SELECT * FROM public.admins;
  ELSE
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
END;
$$;

-- Function to get all car listings with user emails
CREATE OR REPLACE FUNCTION public.get_car_listings_with_users()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  year int,
  price numeric,
  mileage int,
  images jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  features jsonb,
  transmission text,
  fuel_type text,
  body_type text,
  description text,
  location text,
  title text,
  make text,
  model text,
  contact_email text,
  contact_phone text,
  car_name text,
  color text,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
    RETURN QUERY 
    SELECT 
      cl.*,
      u.email as user_email
    FROM 
      public.car_listings cl
    JOIN 
      auth.users u ON cl.user_id = u.id;
  ELSE
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
END;
$$;

-- Function to add an admin
CREATE OR REPLACE FUNCTION public.add_admin(user_id_input uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
    INSERT INTO public.admins (user_id)
    VALUES (user_id_input)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
END;
$$;

-- Function to remove an admin
CREATE OR REPLACE FUNCTION public.remove_admin(user_id_input uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
    -- Prevent removing the last admin
    IF (SELECT COUNT(*) FROM public.admins) > 1 THEN
      DELETE FROM public.admins WHERE user_id = user_id_input;
    ELSE
      RAISE EXCEPTION 'Cannot remove the last admin';
    END IF;
  ELSE
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
END;
$$;
