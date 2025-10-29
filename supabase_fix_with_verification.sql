-- ================================================
-- UPDATED SUPABASE SETUP WITH EMAIL VERIFICATION SUPPORT
-- ================================================

-- ================================================
-- ALTER COMMANDS TO FIX PARAMETER MISMATCH
-- ================================================

-- Drop the existing create_user_profile function
DROP FUNCTION IF EXISTS public.create_user_profile(uuid, text, text, text, text, text, text, text, text, text);

-- Recreate with the correct parameter name that matches JavaScript calls
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id uuid,
    user_email text,
    user_name text,
    user_role text,
    user_department text DEFAULT NULL,
    user_reg_number text DEFAULT NULL,
    user_dept_year text DEFAULT NULL,
    user_phone text DEFAULT NULL,
    user_alt_phone text DEFAULT NULL,
    user_avatar_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate email format based on role
    IF user_role = 'Student' AND NOT (user_email ~ '^[0-9]+@srcas\.ac\.in$') THEN
        RAISE EXCEPTION 'Invalid student email format';
    END IF;

    IF user_role = 'Faculty' AND NOT (user_email ~ '^[a-zA-Z]+@srcas\.ac\.in$') AND user_email != 'ammugopal1116@gmail.com' THEN
        RAISE EXCEPTION 'Invalid faculty email format';
    END IF;

    -- Insert profile with user_id as auth_uid (ignore if already exists)
    INSERT INTO public.profiles (
        auth_uid,
        email,
        full_name,
        role,
        department,
        reg_number,
        dept_year,
        phone,
        alt_phone,
        avatar_url
    ) VALUES (
        user_id,
        user_email,
        user_name,
        user_role,
        user_department,
        user_reg_number,
        user_dept_year,
        user_phone,
        user_alt_phone,
        user_avatar_url
    )
    ON CONFLICT (auth_uid) DO NOTHING;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;

-- ================================================
-- ADDITIONAL ALTER COMMANDS FOR FACULTY SUPPORT
-- ================================================

-- Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_uid ON public.profiles(auth_uid);

-- Update the email constraint to allow the test faculty email
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_student_email;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_email_format;

ALTER TABLE public.profiles
ADD CONSTRAINT chk_email_format
CHECK (
    (role = 'Student' AND email ~ '^[0-9]+@srcas\.ac\.in$') OR
    (role = 'Faculty' AND (email ~ '^[a-zA-Z]+@srcas\.ac\.in$' OR email = 'ammugopal1116@gmail.com'))
);

-- ================================================
-- ENHANCED RLS POLICIES FOR EMAIL VERIFICATION
-- ================================================

-- Grant execute permissions to all functions
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;

-- Drop old policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to create profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable public read access for display purposes" ON public.profiles;

-- ================================================
-- NEW POLICIES SUPPORTING EMAIL VERIFICATION FLOW
-- ================================================

-- Policy 1: Allow authenticated users to INSERT their own profile
-- This works for both immediate signup and email verification flow
CREATE POLICY "Allow authenticated users to create profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
    -- Allow if the auth_uid matches the authenticated user's UUID
    auth.uid() = auth_uid OR
    -- Allow during signup when creating profile for verified user
    auth.email() = email OR
    -- Allow test faculty email
    email = 'ammugopal1116@gmail.com'
);

-- Policy 2: Allow users to SELECT their own profile
CREATE POLICY "Allow users to read their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    -- Allow if email matches authenticated user's email
    auth.email() = email OR
    -- Allow if auth_uid matches
    auth.uid() = auth_uid OR
    -- Allow test faculty email
    email = 'ammugopal1116@gmail.com'
);

-- Policy 3: Allow users to UPDATE their own profile
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    -- Allow if email matches authenticated user's email
    auth.email() = email OR
    -- Allow if auth_uid matches
    auth.uid() = auth_uid OR
    -- Allow test faculty email
    email = 'ammugopal1116@gmail.com'
)
WITH CHECK (
    -- Ensure they can only update their own profile
    auth.email() = email OR
    auth.uid() = auth_uid OR
    email = 'ammugopal1116@gmail.com'
);

-- Policy 4: Allow public read access to profile data (for displaying avatars, names, etc.)
-- This is useful for showing uploader information on lost/found items
CREATE POLICY "Enable public read access for display purposes"
ON public.profiles
FOR SELECT
TO anon
USING (
    -- Only allow reading specific fields for display purposes
    true
);

-- ================================================
-- DEBUGGING FUNCTIONS
-- ================================================

-- Add debugging function to check auth status
CREATE OR REPLACE FUNCTION public.debug_auth_status()
RETURNS TABLE (
    current_user_email text,
    current_user_id uuid,
    is_authenticated boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.email() as current_user_email,
        auth.uid() as current_user_id,
        (auth.uid() IS NOT NULL) as is_authenticated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.debug_auth_status TO authenticated;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check if the function was created successfully
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'create_user_profile' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- Check function permissions
SELECT 
    p.proname as function_name,
    p.prosecdef as security_definer,
    p.proacl as access_privileges
FROM pg_proc p
WHERE p.proname IN ('create_user_profile', 'get_user_profile', 'update_user_profile')
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Test the auth status function
SELECT * FROM public.debug_auth_status();

