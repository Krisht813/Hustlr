-- Add role column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- Set krisht813@gmail.com as super_admin
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'krisht813@gmail.com';

-- If the user hasn't signed up yet, we need a trigger to auto-assign super_admin
-- Update the handle_new_user function to check for super admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
  username_suffix INT;
  user_role TEXT;
BEGIN
  -- Determine role
  IF NEW.email = 'krisht813@gmail.com' THEN
    user_role := 'super_admin';
  ELSE
    user_role := 'user';
  END IF;

  -- Generate username from OAuth metadata or email
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );

  generated_username := LOWER(REGEXP_REPLACE(generated_username, '[^a-z0-9_]', '', 'g'));

  IF LENGTH(generated_username) < 3 THEN
    generated_username := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  END IF;

  username_suffix := 0;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = 
    CASE WHEN username_suffix = 0 THEN generated_username 
         ELSE generated_username || username_suffix::TEXT END
  ) LOOP
    username_suffix := username_suffix + FLOOR(RANDOM() * 900 + 100)::INT;
  END LOOP;

  IF username_suffix > 0 THEN
    generated_username := generated_username || username_suffix::TEXT;
  END IF;

  INSERT INTO public.profiles (id, username, first_name, last_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    generated_username,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ' ', 1),
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'last_name',
      NULLIF(SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ' ', 2), ''),
      ''
    ),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    user_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policy: Only super_admin and admin can update roles
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS policy: Only super_admin can delete profiles
CREATE POLICY "Super admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
