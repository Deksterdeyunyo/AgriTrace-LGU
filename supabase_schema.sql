/* 
  AGRITRACE LGU - FULL DATABASE SCHEMA
  Run this in your Supabase SQL Editor.
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Programs Table
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  funding_year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
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

-- 3. Recipients Table (RSBSA Masterlist)
CREATE TABLE IF NOT EXISTS recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rsbsa_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  farmer_type TEXT[], -- ['Rice', 'Corn', 'Livestock', etc.]
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  civil_status TEXT,
  membership TEXT, -- Farmers Association or Coop
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Distributions Table
CREATE TABLE IF NOT EXISTS distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES recipients(id),
  item_id UUID REFERENCES inventory(id),
  quantity NUMERIC NOT NULL,
  mode TEXT CHECK (mode IN ('Individual Pick-up', 'Barangay Drop-off', 'Mass Distribution')),
  signature_url TEXT,
  representative_name TEXT,
  representative_relationship TEXT,
  auth_letter_url TEXT,
  latitude DOUBLE PRECISION, -- Encoder's location at time of distribution
  longitude DOUBLE PRECISION,
  remarks TEXT,
  encoder_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;

-- 6. Policies (Authenticated access)
CREATE POLICY "Allow authenticated read on programs" ON programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on inventory" ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on recipients" ON recipients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on distributions" ON distributions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on programs" ON programs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert on inventory" ON inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert on recipients" ON recipients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert on distributions" ON distributions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on inventory" ON inventory FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated update on recipients" ON recipients FOR UPDATE TO authenticated USING (true);

-- 7. Initial Data (Optional - just one program to start)
-- INSERT INTO programs (name, funding_year) VALUES ('Rice Resiliency Project', 2025);
