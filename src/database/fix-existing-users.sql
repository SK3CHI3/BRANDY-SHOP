-- Fix Existing Users Script
-- Run this AFTER running the main setup script to fix any existing users

-- Function to fix user roles based on auth metadata
CREATE OR REPLACE FUNCTION fix_existing_user_roles()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  intended_role TEXT;
BEGIN
  -- Loop through all auth users and check their metadata
  FOR user_record IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data,
      p.role as current_role
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
  LOOP
    -- Get intended role from metadata
    intended_role := COALESCE(user_record.raw_user_meta_data->>'role', 'customer');
    
    -- If profile doesn't exist, create it
    IF user_record.current_role IS NULL THEN
      INSERT INTO public.profiles (id, email, full_name, role, is_verified)
      VALUES (
        user_record.id,
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'full_name', ''),
        intended_role,
        false
      );
      
      RAISE NOTICE 'Created profile for user % with role %', user_record.email, intended_role;
    
    -- If profile exists but role is wrong, update it
    ELSIF user_record.current_role != intended_role THEN
      UPDATE public.profiles 
      SET role = intended_role,
          full_name = COALESCE(user_record.raw_user_meta_data->>'full_name', full_name)
      WHERE id = user_record.id;
      
      RAISE NOTICE 'Updated role for user % from % to %', user_record.email, user_record.current_role, intended_role;
    END IF;
    
    -- If user should be an artist, ensure artist profile exists
    IF intended_role = 'artist' THEN
      INSERT INTO public.artist_profiles (id, bio, response_time, languages, skills)
      VALUES (user_record.id, '', '24 hours', ARRAY['English'], ARRAY[]::TEXT[])
      ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE 'Ensured artist profile exists for user %', user_record.email;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the fix function
SELECT fix_existing_user_roles();

-- Clean up the function (optional)
DROP FUNCTION fix_existing_user_roles();

-- Verify the results
SELECT 
  p.email,
  p.role,
  p.full_name,
  CASE WHEN ap.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_artist_profile,
  au.raw_user_meta_data->>'role' as intended_role
FROM public.profiles p
LEFT JOIN public.artist_profiles ap ON p.id = ap.id
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;
