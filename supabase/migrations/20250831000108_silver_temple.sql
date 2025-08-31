/*
  # Fix Authentication Policies

  1. Security Updates
    - Relax RLS policies to allow proper authentication flow
    - Fix user profile access for authenticated users
    - Allow public property viewing
    - Enable proper role-based access

  2. Changes
    - Update user policies for better auth flow
    - Fix property access policies
    - Add missing viewing request table
    - Improve maintenance request policies
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read own profile and public landlord info" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create more permissive user policies
CREATE POLICY "Authenticated users can read user profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

-- Admin policies
CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Fix property policies
DROP POLICY IF EXISTS "Properties are publicly readable" ON properties;
DROP POLICY IF EXISTS "Landlords can manage their properties" ON properties;

CREATE POLICY "Properties are publicly readable"
  ON properties FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Landlords can insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND (role = 'landlord' OR role = 'admin')
    )
  );

CREATE POLICY "Landlords can manage their properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND (users.id = properties.landlord_id OR users.role = 'admin')
    )
  );

CREATE POLICY "Landlords can delete their properties"
  ON properties FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND (users.id = properties.landlord_id OR users.role = 'admin')
    )
  );

-- Create viewing requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS viewing_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewer_name text NOT NULL,
  viewer_email text NOT NULL,
  viewer_phone text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time time NOT NULL,
  alternative_date date,
  alternative_time time,
  message text,
  number_of_viewers integer DEFAULT 1,
  status text CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for viewing requests
ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;

-- Viewing request policies
CREATE POLICY "Anyone can create viewing requests"
  ON viewing_requests FOR INSERT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Landlords can read viewing requests for their properties"
  ON viewing_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      JOIN users ON users.id = properties.landlord_id
      WHERE properties.id = viewing_requests.property_id
      AND users.auth_id = auth.uid()
    )
  );

-- Fix maintenance request policies
DROP POLICY IF EXISTS "Users can read relevant maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Tenants can create maintenance requests" ON maintenance_requests;

CREATE POLICY "Users can read relevant maintenance requests"
  ON maintenance_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND (
        users.id = maintenance_requests.tenant_id OR 
        users.id = maintenance_requests.assigned_to OR
        users.role = 'maintenance' OR
        users.role = 'admin' OR
        users.id IN (SELECT landlord_id FROM properties WHERE id = maintenance_requests.property_id)
      )
    )
  );

CREATE POLICY "Anyone can create maintenance requests"
  ON maintenance_requests FOR INSERT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Relevant users can update maintenance requests"
  ON maintenance_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND (
        users.id = maintenance_requests.assigned_to OR
        users.role = 'maintenance' OR
        users.role = 'admin' OR
        users.id IN (SELECT landlord_id FROM properties WHERE id = maintenance_requests.property_id)
      )
    )
  );

-- Fix inquiry policies
DROP POLICY IF EXISTS "Landlords can read inquiries for their properties" ON inquiries;

CREATE POLICY "Anyone can create inquiries"
  ON inquiries FOR INSERT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Landlords can read inquiries for their properties"
  ON inquiries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN properties ON properties.landlord_id = users.id
      WHERE users.auth_id = auth.uid()
      AND properties.id = inquiries.property_id
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Property views policies
CREATE POLICY "Anyone can create property views"
  ON property_views FOR INSERT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Property owners can read views"
  ON property_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      JOIN users ON users.id = properties.landlord_id
      WHERE properties.id = property_views.property_id
      AND users.auth_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add indexes for new table
CREATE INDEX IF NOT EXISTS idx_viewing_requests_property ON viewing_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_viewing_requests_status ON viewing_requests(status);
CREATE INDEX IF NOT EXISTS idx_viewing_requests_date ON viewing_requests(preferred_date);

-- Add updated_at trigger for viewing requests
CREATE TRIGGER update_viewing_requests_updated_at BEFORE UPDATE ON viewing_requests 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();