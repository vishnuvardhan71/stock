-- Supabase Database Migration Script
-- Run this in your Supabase dashboard SQL Editor

-- 1. Add user_id column to existing business tables (referencing auth.users)
-- We set the DEFAULT to auth.uid() so that if user_id is omitted in INSERTs, it automatically defaults to the active authenticated session's user.
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

ALTER TABLE sales 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- 2. Enable Row Level Security (RLS) on both tables (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- 3. Remove old permissive public policies
DROP POLICY IF EXISTS "Allow public access to products" ON products;
DROP POLICY IF EXISTS "Allow public access to sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated users all access to their own products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users all access to their own sales" ON sales;

-- 4. Create new multi-user RLS policies
-- Only authenticated users can access, create, edit, or delete their own data.
CREATE POLICY "Allow authenticated users all access to their own products"
ON products
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users all access to their own sales"
ON sales
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Helper queries for existing data migration
-- Note: If you have existing data, user_id will initially be NULL.
-- Once you register your first user, copy their User ID (UUID) from the Authentication page in Supabase,
-- paste it below, uncomment these lines, and run them to associate existing data with that user:
--
-- UPDATE products SET user_id = 'YOUR_NEW_USER_UUID' WHERE user_id IS NULL;
-- UPDATE sales SET user_id = 'YOUR_NEW_USER_UUID' WHERE user_id IS NULL;
