# Supabase Setup Instructions

Follow these steps to connect the **DukanBook** application to your Supabase PostgreSQL database.

---

## Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and log in or create a free account.
2. Click **New Project** and select your organization.
3. Fill in the project details:
   - **Name**: `DukanBook`
   - **Database Password**: *Choose a secure password and save it.*
   - **Region**: Select a region close to you.
4. Click **Create new project** and wait for the database provisioning to complete (usually takes 1-2 minutes).

---

## Step 2: Set Up Database Schema
1. In the Supabase Sidebar, go to the **SQL Editor** tab (icon looks like a terminal with `>_`).
2. Click **New Query**.
3. Copy and paste the following SQL script into the editor:

```sql
-- 1. Create SEQUENCES for formatting IDs (e.g. ITEM0001, BILL0001)
CREATE SEQUENCE IF NOT EXISTS product_id_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS sale_id_seq START WITH 1;

-- 2. Create PRODUCTS Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT ('ITEM' || lpad(nextval('product_id_seq')::text, 4, '0')),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  qty NUMERIC NOT NULL DEFAULT 0,
  threshold NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  sell_price NUMERIC NOT NULL DEFAULT 0,
  supplier TEXT,
  manufacture_date DATE,
  expiry_date DATE,
  date_added TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create SALES Table
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY DEFAULT ('BILL' || lpad(nextval('sale_id_seq')::text, 4, '0')),
  date TIMESTAMPTZ DEFAULT NOW(),
  store_name TEXT,
  gst_number TEXT,
  customer TEXT NOT NULL DEFAULT 'Walk-in Customer',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0
);

-- 4. Enable Row Level Security (RLS) on both tables (recommended by Supabase)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- 5. Create Permissive Policies to allow client-side access via the anon key
CREATE POLICY "Allow public access to products"
ON products
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public access to sales"
ON sales
FOR ALL
USING (true)
WITH CHECK (true);
```

4. Click **Run** (bottom right of SQL editor). Verify that the query runs successfully.

---

## Step 3: Get API Keys and Configure Environment
1. In the Supabase Sidebar, go to **Project Settings** (gear icon) > **API**.
2. Locate the following values:
   - **Project URL**: Under *Project API keys* (looks like `https://xxxxxx.supabase.co`).
   - **Anon Key**: Under *Project API keys* (a long JWT string labeled `anon` and `public`).
3. In the root of your local **stock** folder, create a file named `.env` and fill it with your keys:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-jwt-key
   ```

---

## Step 4: Run the Application
1. Run `npm run dev` to start the development server.
2. The application will automatically detect the `.env` variables, connect to your Supabase project, and migrate/fetch the product inventory!

---

## Adding manufacture & expiry dates to an **existing** database

If you already created the `products` table **before** these columns existed, follow these steps. Existing product rows are **not** deleted; new columns start empty (`NULL`) until you edit items in the app.

### Step A: Open the SQL Editor
1. Log in at [supabase.com](https://supabase.com) and open your **DukanBook** project.
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**.

### Step B: Add the two optional columns
4. Paste this script (safe to run more than once):

```sql
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS manufacture_date DATE,
  ADD COLUMN IF NOT EXISTS expiry_date DATE;
```

5. Click **Run** (bottom right).
6. Confirm success: you should see a message like `Success. No rows returned`.

### Step C: Verify the columns
7. In the sidebar, open **Table Editor** → **products**.
8. Confirm you see **manufacture_date** and **expiry_date** columns.
9. Existing rows should show `NULL` in both columns until you set dates in the app.

### Step D: Refresh the app
10. Restart or refresh your local app (`npm run dev`) if it was already running.
11. Open **Inventory** → **Edit** on any item and optionally set **Manufacture Date** / **Expiry Date**, then save.

**Notes:**
- Both columns are **optional** (`DATE`, nullable). Leave blank in the app when not needed.
- No change is required on the `sales` table.
- If you deploy to GitHub Pages, rebuild after pulling the app changes; the database migration is only done once in Supabase.
