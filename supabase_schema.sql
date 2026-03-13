/*
  SQL SCHEMA FOR SUPABASE SQL EDITOR
  Run this in your Supabase SQL Editor to set up the tables.

  -- 1. Programs
  CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    funding_year INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- 2. Inventory
  CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    supplier TEXT NOT NULL,
    storage_location TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    expiry_date DATE,
    reorder_level NUMERIC DEFAULT 10,
    supporting_doc_url TEXT,
    program_id UUID REFERENCES programs(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- 3. Recipients (RSBSA Masterlist)
  CREATE TABLE recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rsbsa_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    farmer_type TEXT[],
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    civil_status TEXT,
    membership TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- 4. Distributions
  CREATE TABLE distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES recipients(id),
    item_id UUID REFERENCES inventory(id),
    quantity NUMERIC NOT NULL,
    mode TEXT CHECK (mode IN ('Individual Pick-up', 'Barangay Drop-off', 'Mass Distribution')),
    signature_url TEXT,
    representative_name TEXT,
    representative_relationship TEXT,
    auth_letter_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    remarks TEXT,
    encoder_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- 5. Enable RLS
  ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
  ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
  ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;

  -- 6. Basic Policies (Adjust as needed for production)
  CREATE POLICY "Allow authenticated read" ON programs FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Allow authenticated read" ON inventory FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Allow authenticated read" ON recipients FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Allow authenticated read" ON distributions FOR SELECT TO authenticated USING (true);
  
  CREATE POLICY "Allow authenticated insert" ON distributions FOR INSERT TO authenticated WITH CHECK (true);
*/
