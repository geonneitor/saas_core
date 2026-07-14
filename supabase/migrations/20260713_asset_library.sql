-- ==========================================
-- Sprint 5.4: Asset Library for Tenant Landing Customization
-- Description: Allow HQ to manage a centralized library of
-- images organized by industry/vertical that tenants can
-- pick from in their LiveTrialWizard.
-- ==========================================

CREATE TABLE IF NOT EXISTS public.asset_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  category text NOT NULL CHECK (category IN ('spa', 'barber', 'clinic', 'modern', 'abstract', 'luxury', 'minimal')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_library_category ON public.asset_library(category);
CREATE INDEX IF NOT EXISTS idx_asset_library_active ON public.asset_library(is_active);

-- RLS: Anyone can read active assets (for tenant TrialWizard)
ALTER TABLE public.asset_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "asset_library_public_read" ON public.asset_library;
CREATE POLICY "asset_library_public_read"
ON public.asset_library
FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "asset_library_super_admin_all" ON public.asset_library;
CREATE POLICY "asset_library_super_admin_all"
ON public.asset_library
FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Seed with curated default images
INSERT INTO public.asset_library (name, url, category) VALUES
  -- Spa & Nails
  ('Spa Luxury 1', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop', 'spa'),
  ('Spa Nails 1', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop', 'spa'),
  ('Spa Stones', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop', 'spa'),
  ('Spa Candles', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop', 'spa'),
  -- Barber
  ('Barber Chair', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop', 'barber'),
  ('Barber Tools', 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1200&auto=format&fit=crop', 'barber'),
  ('Barber Shop', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop', 'barber'),
  -- Clinic / Aesthetic
  ('Clinic Modern', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop', 'clinic'),
  ('Clinic Clean', 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?q=80&w=1200&auto=format&fit=crop', 'clinic'),
  -- Modern / Generic
  ('Modern Tech', 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop', 'modern'),
  ('Modern Office', 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop', 'modern'),
  -- Abstract / Luxury
  ('Abstract Gold', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop', 'abstract'),
  ('Luxury Dark', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop', 'luxury'),
  -- Minimal
  ('Minimal White', 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1200&auto=format&fit=crop', 'minimal')
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
