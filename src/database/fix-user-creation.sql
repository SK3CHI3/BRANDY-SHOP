-- Fix User Creation Issues
-- Run this SQL in your Supabase SQL Editor to fix user registration problems

-- 1. Add missing INSERT policy for profiles table
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Add missing INSERT policy for artist_profiles table
DROP POLICY IF EXISTS "Artists can insert own profile" ON artist_profiles;
CREATE POLICY "Artists can insert own profile" ON artist_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Ensure the trigger function has proper permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table with proper error handling
  INSERT INTO public.profiles (id, email, full_name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    false
  );
  
  -- If the user is an artist, create artist profile
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'artist' THEN
    INSERT INTO public.artist_profiles (id, response_time, languages, skills, total_earnings, completed_orders, rating, total_reviews)
    VALUES (
      NEW.id,
      '24 hours',
      ARRAY['English'],
      ARRAY[]::TEXT[],
      0,
      0,
      0,
      0
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.artist_profiles TO authenticated;

-- 6. Test the setup by checking existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'artist_profiles')
ORDER BY tablename, cmd;

-- 7. Check if there are any existing users without profiles
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'role' as intended_role,
  p.role as current_role,
  CASE 
    WHEN p.id IS NULL THEN 'Missing Profile'
    WHEN p.role != COALESCE(au.raw_user_meta_data->>'role', 'customer') THEN 'Role Mismatch'
    ELSE 'OK'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;
