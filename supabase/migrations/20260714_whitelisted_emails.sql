-- Create whitelisted_emails table for dynamic email whitelist management
CREATE TABLE IF NOT EXISTS public.whitelisted_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Add comment to table
COMMENT ON TABLE public.whitelisted_emails IS 'Emails authorized to authenticate via magic link';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_whitelisted_emails_email ON public.whitelisted_emails(email);
CREATE INDEX IF NOT EXISTS idx_whitelisted_emails_active ON public.whitelisted_emails(is_active);

-- Enable RLS
ALTER TABLE public.whitelisted_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Only super_admins can read whitelisted emails
CREATE POLICY "whitelisted_emails_super_admin_read"
  ON public.whitelisted_emails
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy: Only super_admins can insert whitelisted emails
CREATE POLICY "whitelisted_emails_super_admin_insert"
  ON public.whitelisted_emails
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy: Only super_admins can update whitelisted emails
CREATE POLICY "whitelisted_emails_super_admin_update"
  ON public.whitelisted_emails
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy: Only super_admins can delete whitelisted emails
CREATE POLICY "whitelisted_emails_super_admin_delete"
  ON public.whitelisted_emails
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Insert initial whitelisted email (cesargeo56@gmail.com)
-- This will be linked to the user's auth.users.id when they first authenticate
INSERT INTO public.whitelisted_emails (email, is_active)
VALUES ('cesargeo56@gmail.com', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Create function to check if email is whitelisted
CREATE OR REPLACE FUNCTION public.is_email_whitelisted(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.whitelisted_emails 
    WHERE email = check_email AND is_active = TRUE
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_email_whitelisted(TEXT) TO authenticated;