-- ============================================
-- PHASE 1: FOUNDATION & AUTHENTICATION SETUP
-- Complete SQL for Supabase
-- ============================================

-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search


-- 2. FOREIGN KEY CONSTRAINTS
-- ============================================
ALTER TABLE users 
ADD CONSTRAINT fk_users_business 
FOREIGN KEY (current_business_id) REFERENCES businesses(id) ON DELETE SET NULL;

ALTER TABLE user_businesses 
ADD CONSTRAINT fk_user_businesses_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_businesses 
ADD CONSTRAINT fk_user_businesses_business 
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE business_settings 
ADD CONSTRAINT fk_business_settings_business 
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE UNIQUE;


-- 3. CREATE AUTO-TIMESTAMP TRIGGERS
-- ============================================

-- Trigger function for users table
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- Trigger function for businesses table
CREATE OR REPLACE FUNCTION update_businesses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_update_timestamp
BEFORE UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION update_businesses_updated_at();

-- Trigger function for user_businesses table
CREATE OR REPLACE FUNCTION update_user_businesses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_businesses_timestamp
BEFORE INSERT ON user_businesses
FOR EACH ROW
EXECUTE FUNCTION update_user_businesses_updated_at();

-- Trigger function for business_settings table
CREATE OR REPLACE FUNCTION update_business_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_settings_update_timestamp
BEFORE UPDATE ON business_settings
FOR EACH ROW
EXECUTE FUNCTION update_business_settings_updated_at();

-- 4. AUTO-CREATE USER ON AUTH SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    NOW(),
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new auth users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = auth.uid());

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (id = auth.uid());

-- Service role can access all user data
CREATE POLICY "Service role access all users"
ON users FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on businesses table
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Users can view their businesses
CREATE POLICY "Users can view their businesses"
ON businesses FOR SELECT
USING (
  id IN (
    SELECT business_id FROM user_businesses 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Users can update their own businesses
CREATE POLICY "Users can update their businesses"
ON businesses FOR UPDATE
USING (
  id IN (
    SELECT business_id FROM user_businesses 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- Service role can access all businesses
CREATE POLICY "Service role access all businesses"
ON businesses FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on user_businesses table
ALTER TABLE user_businesses ENABLE ROW LEVEL SECURITY;

-- Users can view their business relationships
CREATE POLICY "Users can view their user_businesses"
ON user_businesses FOR SELECT
USING (user_id = auth.uid() OR business_id IN (
  SELECT business_id FROM user_businesses 
  WHERE user_id = auth.uid()
));

-- Users can update their own relationships (limited)
CREATE POLICY "Users can manage user_businesses"
ON user_businesses FOR UPDATE
USING (
  business_id IN (
    SELECT business_id FROM user_businesses 
    WHERE user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- Service role can access all
CREATE POLICY "Service role access all user_businesses"
ON user_businesses FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on business_settings table
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Users can view settings for their businesses
CREATE POLICY "Users can view their business settings"
ON business_settings FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM user_businesses 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Users can update settings for their businesses
CREATE POLICY "Users can update their business settings"
ON business_settings FOR UPDATE
USING (
  business_id IN (
    SELECT business_id FROM user_businesses 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- Service role can access all
CREATE POLICY "Service role access all business_settings"
ON business_settings FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');


-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes on users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_current_business_id ON users(current_business_id);
CREATE INDEX idx_users_role ON users(role);

-- Indexes on businesses table
CREATE INDEX idx_businesses_name ON businesses(name);
CREATE INDEX idx_businesses_email ON businesses(email);

-- Indexes on user_businesses table
CREATE INDEX idx_user_businesses_user_id ON user_businesses(user_id);
CREATE INDEX idx_user_businesses_business_id ON user_businesses(business_id);
CREATE INDEX idx_user_businesses_role ON user_businesses(role);
CREATE INDEX idx_user_businesses_is_active ON user_businesses(is_active);

-- Indexes on business_settings table
CREATE INDEX idx_business_settings_business_id ON business_settings(business_id);


-- 7. DEFAULT VALUES FOR business_settings
-- ============================================
-- Run this manually for each business after creation:
-- INSERT INTO business_settings (
--   business_id,
--   accreditation_expiry_notice_days,
--   currency,
--   timezone,
--   created_at,
--   updated_at
-- ) VALUES (
--   'YOUR_BUSINESS_ID',
--   90,
--   'USD',
--   'America/New_York',
--   NOW(),
--   NOW()
-- );


-- 8. VERIFICATION QUERIES
-- ============================================
-- Run these to verify setup:
-- SELECT * FROM users LIMIT 1;
-- SELECT * FROM businesses LIMIT 1;
-- SELECT * FROM user_businesses LIMIT 1;
-- SELECT * FROM business_settings LIMIT 1;

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check triggers:
-- SELECT trigger_schema, trigger_name, event_object_table, action_statement 
-- FROM information_schema.triggers WHERE trigger_schema = 'public';

-- ============================================
-- PHASE 1 SETUP COMPLETE!
-- ============================================
