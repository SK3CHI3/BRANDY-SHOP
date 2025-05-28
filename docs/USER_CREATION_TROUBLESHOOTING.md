# 🔧 User Creation Troubleshooting Guide

## 🚨 Issue: "Database error failed to save the new user"

This error occurs when new users try to register as customers or artists. Here's how to diagnose and fix it.

## 🔍 **Root Cause Analysis**

The error typically happens due to:

1. **Missing RLS Policies**: No INSERT policy for the `profiles` table
2. **Database Trigger Issues**: The `handle_new_user()` trigger function failing
3. **Permission Problems**: Insufficient permissions for authenticated users
4. **Network/Timeout Issues**: Database operations timing out

## 🛠️ **Step-by-Step Fix**

### **Step 1: Apply Database Fixes**

Run the SQL script `src/database/fix-user-creation.sql` in your Supabase SQL Editor:

```sql
-- This script adds missing policies and fixes permissions
-- Copy and paste the entire content of fix-user-creation.sql
```

### **Step 2: Verify Database Setup**

Check if the policies were created correctly:

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'artist_profiles')
ORDER BY tablename, cmd;
```

Expected policies:
- `profiles`: SELECT (public), INSERT (authenticated), UPDATE (authenticated)
- `artist_profiles`: SELECT (public), INSERT (authenticated), UPDATE (authenticated)

### **Step 3: Test the Trigger Function**

Verify the trigger is working:

```sql
-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### **Step 4: Check Existing Users**

See if there are users without profiles:

```sql
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
```

## 🧪 **Testing the Fix**

### **Test 1: Customer Registration**
1. Open the app in incognito mode
2. Click "Sign Up"
3. Fill in details with role "Customer"
4. Submit the form
5. Check browser console for any errors

### **Test 2: Artist Registration**
1. Try registering as an "Artist"
2. Verify both `profiles` and `artist_profiles` are created

### **Test 3: Database Verification**
After successful registration, check:

```sql
-- Verify profile was created
SELECT * FROM profiles WHERE email = 'test@example.com';

-- If artist, verify artist profile
SELECT * FROM artist_profiles WHERE id = (
  SELECT id FROM profiles WHERE email = 'test@example.com'
);
```

## 🔧 **Common Issues & Solutions**

### **Issue 1: RLS Policy Missing**
**Error**: `new row violates row-level security policy`
**Solution**: Run the fix script to add INSERT policies

### **Issue 2: Trigger Function Failing**
**Error**: Silent failure, no profile created
**Solution**: Check Supabase logs and update trigger function

### **Issue 3: Permission Denied**
**Error**: `permission denied for table profiles`
**Solution**: Grant proper permissions to authenticated role

### **Issue 4: Email Already Exists**
**Error**: `duplicate key value violates unique constraint`
**Solution**: User already exists, try signing in instead

## 📊 **Monitoring & Debugging**

### **Browser Console Logs**
Look for these log messages:
- ✅ `User signup completed successfully`
- ❌ `Error creating profile manually:`
- ❌ `Database error: Failed to create user profile`

### **Supabase Dashboard**
1. Go to **Authentication > Users** to see if user was created
2. Go to **Table Editor > profiles** to check profile creation
3. Go to **Logs** to see any database errors

### **Network Tab**
Check for failed API requests:
- `POST /auth/v1/signup` - Should return 200
- `POST /rest/v1/profiles` - Should return 201

## 🚀 **Prevention**

### **Regular Checks**
1. Monitor user registration success rate
2. Check for users without profiles weekly
3. Verify RLS policies after database updates

### **Error Handling**
The updated AuthContext now provides:
- Better error messages
- Detailed console logging
- Fallback profile creation
- Proper timeout handling

## 📞 **Getting Help**

If the issue persists:

1. **Check Supabase Logs**: Look for specific error messages
2. **Browser Console**: Copy any error messages
3. **Database State**: Run the verification queries
4. **Contact Support**: Include all error details and logs

## 🔄 **Recovery Steps**

If users are stuck with broken accounts:

```sql
-- Fix existing users without profiles
INSERT INTO public.profiles (id, email, full_name, role, is_verified)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'customer'),
  false
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

---

**✅ After applying these fixes, user registration should work smoothly!**
