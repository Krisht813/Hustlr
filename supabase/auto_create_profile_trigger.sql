-- Auto-create a profile when a new user signs up (works for email, Google, GitHub)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
  username_suffix INT;
BEGIN
  -- Generate username from OAuth metadata or email
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'user_name',           -- GitHub username
    NEW.raw_user_meta_data->>'preferred_username',   -- Some OAuth providers
    NEW.raw_user_meta_data->>'username',             -- Manual signup
    SPLIT_PART(NEW.email, '@', 1)                    -- Fallback: email prefix
  );

  -- Ensure username is lowercase and clean
  generated_username := LOWER(REGEXP_REPLACE(generated_username, '[^a-z0-9_]', '', 'g'));

  -- If username is too short, use email prefix
  IF LENGTH(generated_username) < 3 THEN
    generated_username := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  END IF;

  -- Handle duplicate usernames by appending random numbers
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

  INSERT INTO public.profiles (id, username, first_name, last_name, email, avatar_url)
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
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
