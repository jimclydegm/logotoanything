-- COMPLETE CLEAN-UP SCRIPT FOR VERY OLD SUPABASE VERSIONS

-- Step 1: Allow NULL emails in profiles table temporarily
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- Step 2: First let's examine what fields we have in the auth.users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 3: Find and drop CUSTOM triggers on auth.users table (preserve RI constraint triggers)
DO $$
DECLARE
    trigger_name text;
BEGIN
    FOR trigger_name IN (
        SELECT tgname FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'auth' 
        AND c.relname = 'users'
        -- Skip referential integrity constraint triggers
        AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    )
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', trigger_name);
        RAISE NOTICE 'Dropped trigger: %', trigger_name;
    END LOOP;
END $$;

-- Step 4: Drop only specific functions related to the app_metadata field
DO $$
DECLARE
    func_name text;
    func_schema text;
BEGIN
    -- Only drop functions with app_metadata in their body
    FOR func_schema, func_name IN (
        SELECT n.nspname, p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.prosrc LIKE '%app_metadata%'
    )
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I.%I CASCADE', func_schema, func_name);
            RAISE NOTICE 'Dropped function: %.%', func_schema, func_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to drop function %.%: %', func_schema, func_name, SQLERRM;
        END;
    END LOOP;
    
    -- Also drop the specific trigger function if it exists
    EXECUTE 'DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS public.create_profile_for_user() CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS public.minimal_user_handler() CASCADE';
END $$;

-- Step 5: Create a new smarter function that tries different approaches to get OAuth data
CREATE OR REPLACE FUNCTION public.extract_google_profile_data()
RETURNS trigger AS $$
DECLARE
    email_val text;
    name_val text;
    avatar_val text;
    raw_user_meta jsonb;
BEGIN
    -- Try to get email from different possible locations
    email_val := NEW.email; -- First try the direct email field
    
    -- Try to get profile data from different places depending on Supabase version
    -- Newer versions store in user_metadata, older might use raw_user_meta_data
    
    -- Extract raw user metadata (try different fields that might exist)
    BEGIN
        IF NEW.raw_user_meta_data IS NOT NULL THEN
            raw_user_meta := NEW.raw_user_meta_data;
        ELSIF NEW.raw_app_meta_data IS NOT NULL THEN
            raw_user_meta := NEW.raw_app_meta_data;
        ELSIF NEW.user_metadata IS NOT NULL THEN
            raw_user_meta := NEW.user_metadata;
        ELSE
            raw_user_meta := '{}';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        raw_user_meta := '{}';
    END;
    
    -- Try to extract name
    BEGIN
        IF raw_user_meta ? 'name' THEN
            name_val := raw_user_meta->>'name';
        ELSIF raw_user_meta ? 'full_name' THEN
            name_val := raw_user_meta->>'full_name';
        ELSE
            name_val := 'User ' || substring(NEW.id::text, 1, 8);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        name_val := 'User ' || substring(NEW.id::text, 1, 8);
    END;
    
    -- Try to extract avatar URL
    BEGIN
        IF raw_user_meta ? 'avatar_url' THEN
            avatar_val := raw_user_meta->>'avatar_url';
        ELSIF raw_user_meta ? 'picture' THEN
            avatar_val := raw_user_meta->>'picture';
        ELSE
            avatar_val := '';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        avatar_val := '';
    END;
    
    -- Insert profile with the best data we could find
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(email_val, NEW.id || '@placeholder.com'),  -- Use email if available
        COALESCE(name_val, 'User ' || substring(NEW.id::text, 1, 8)),  -- Use name if available
        COALESCE(avatar_val, '')  -- Use avatar if available
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url;
  
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- If anything goes wrong, log it but don't fail the transaction
    RAISE WARNING 'Error in extract_google_profile_data: %', SQLERRM;
    
    -- Fall back to minimal data as a last resort
    BEGIN
        INSERT INTO public.profiles (id, email, full_name, avatar_url)
        VALUES (
            NEW.id,
            NEW.id || '@placeholder.com',
            'User ' || substring(NEW.id::text, 1, 8),
            ''
        )
        ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create fallback profile: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create a new trigger with the smart function
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.extract_google_profile_data();

-- Step 7: Update any existing users with the correct profile data
DO $$
DECLARE
    user_record record;
    email_val text;
    name_val text;
    avatar_val text;
    raw_user_meta jsonb;
BEGIN
    FOR user_record IN (SELECT * FROM auth.users) LOOP
        -- Try to get email
        email_val := user_record.email;
        
        -- Extract raw user metadata
        BEGIN
            IF user_record.raw_user_meta_data IS NOT NULL THEN
                raw_user_meta := user_record.raw_user_meta_data;
            ELSIF user_record.raw_app_meta_data IS NOT NULL THEN
                raw_user_meta := user_record.raw_app_meta_data;
            ELSIF user_record.user_metadata IS NOT NULL THEN
                raw_user_meta := user_record.user_metadata;
            ELSE
                raw_user_meta := '{}';
            END IF;
        EXCEPTION WHEN OTHERS THEN
            raw_user_meta := '{}';
        END;
        
        -- Try to extract name
        BEGIN
            IF raw_user_meta ? 'name' THEN
                name_val := raw_user_meta->>'name';
            ELSIF raw_user_meta ? 'full_name' THEN
                name_val := raw_user_meta->>'full_name';
            ELSE
                name_val := 'User ' || substring(user_record.id::text, 1, 8);
            END IF;
        EXCEPTION WHEN OTHERS THEN
            name_val := 'User ' || substring(user_record.id::text, 1, 8);
        END;
        
        -- Try to extract avatar URL
        BEGIN
            IF raw_user_meta ? 'avatar_url' THEN
                avatar_val := raw_user_meta->>'avatar_url';
            ELSIF raw_user_meta ? 'picture' THEN
                avatar_val := raw_user_meta->>'picture';
            ELSE
                avatar_val := '';
            END IF;
        EXCEPTION WHEN OTHERS THEN
            avatar_val := '';
        END;
        
        -- Update profile with the best data we could find
        UPDATE public.profiles SET
            email = COALESCE(email_val, user_record.id || '@placeholder.com'),
            full_name = COALESCE(name_val, 'User ' || substring(user_record.id::text, 1, 8)),
            avatar_url = COALESCE(avatar_val, '')
        WHERE id = user_record.id;
        
        -- If profile doesn't exist, create it
        IF NOT FOUND THEN
            INSERT INTO public.profiles (id, email, full_name, avatar_url)
            VALUES (
                user_record.id,
                COALESCE(email_val, user_record.id || '@placeholder.com'),
                COALESCE(name_val, 'User ' || substring(user_record.id::text, 1, 8)),
                COALESCE(avatar_val, '')
            );
        END IF;
    END LOOP;
END $$;

-- Step 8: Show what triggers now exist on auth.users 
SELECT 
    tgname AS trigger_name,
    proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'auth' AND c.relname = 'users';

-- Alternative approach: If you're still having issues, you can completely disable the trigger
-- by setting the user signup hook to null in the supabase_config table
-- This is a last resort option:
/*
UPDATE supabase_functions.hooks
SET hook_function_id = NULL
WHERE hook_name = 'signup';
*/

-- The user can now sign in with Google, and even though the email won't be 
-- saved properly from Google, they'll still get a profile record created.
-- Later you can update your trigger to extract more information once 
-- you've upgraded your Supabase instance. 