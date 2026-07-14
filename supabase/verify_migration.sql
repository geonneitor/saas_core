-- =====================================================
-- VERIFICATION QUERIES FOR WHITELISTED_EMAILS MIGRATION
-- Run these in Supabase SQL Editor to verify success
-- =====================================================

-- 1. Check if the table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'whitelisted_emails'
) AS table_exists;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'whitelisted_emails'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'whitelisted_emails';

-- 4. Check if initial email was inserted
SELECT email, is_active, created_at
FROM public.whitelisted_emails;

-- 5. Check if the RPC function exists
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'is_email_whitelisted'
) AS function_exists;

-- 6. Test the RPC function
SELECT public.is_email_whitelisted('cesargeo56@gmail.com') AS is_whitelisted;

-- 7. Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'whitelisted_emails';