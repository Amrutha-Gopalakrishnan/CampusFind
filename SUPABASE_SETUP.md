# Supabase Setup Guide for CampusFind

## Understanding the Error

The error you're seeing:
```
GET /rest/v1/profiles?select=*&email=eq.23127006%40srcas.ac.in 403 (Forbidden)
Error: permission denied for table users
```

This is a **Row Level Security (RLS)** issue in Supabase. RLS is blocking access to the `profiles` table.

## Fix: Configure Supabase Row Level Security

### Step 1: Go to Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on **"Authentication"** in the left sidebar
4. Then click on **"Policies"**

### Step 2: Enable RLS on Profiles Table
1. Click on **"Table Editor"** in the left sidebar
2. Find the `profiles` table
3. Click on it and scroll to **"RLS Policies"**
4. Enable RLS if it's not already enabled

### Step 3: Create Policy for Profiles Table

Click **"New Policy"** and create these policies:

#### Policy 1: Allow users to read their own profile
```sql
-- Policy Name: Users can view own profile
-- Target roles: authenticated
-- USING expression:
auth.uid() = id
-- WITH CHECK expression:
(Leave empty)
```

#### Policy 2: Allow users to update their own profile
```sql
-- Policy Name: Users can update own profile
-- Target roles: authenticated
-- USING expression:
auth.uid() = id
-- WITH CHECK expression:
auth.uid() = id
```

#### Policy 3: Allow users to insert their own profile
```sql
-- Policy Name: Users can insert own profile
-- Target roles: authenticated
-- USING expression:
true
-- WITH CHECK expression:
auth.uid() = id
```

### Step 4: Configure URL Redirects

1. Go to **Authentication** → **URL Configuration**
2. Add these URLs to **"Redirect URLs"**:
   - `http://localhost:5173/verified` (for development)
   - `https://your-vercel-domain.vercel.app/verified`
   - `https://your-vercel-domain.vercel.app/reset-password`

### Step 5: Email Templates (Optional)

You can customize email templates at:
**Authentication** → **Email Templates**

Recommended templates:
1. **Confirm signup** - Used for email verification
2. **Reset password** - Used for password reset

---

## Testing the Fix

After setting up RLS policies:

1. Try signing up with a new account
2. Check your email for verification link
3. Click the verification link
4. You should be redirected to `/verified` and auto-login

## Troubleshooting

### Still getting 403 errors?
- Check that RLS is enabled on the `profiles` table
- Verify that the policies are created correctly
- Make sure the user is authenticated (has a valid session)

### Email not sending?
- Check **Authentication** → **Providers** → Email is enabled
- Verify SMTP settings if using dry_run security settings
- Check spam folder

### Profile not being created?
- Ensure the RPC function `create_user_profile` exists
- Check that the function has proper permissions
- Verify the function in SQL Editor

---

## Quick SQL to Check Policies

Run this in **SQL Editor** to check your current policies:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';
```

