/*
  # Initial Keyskeeper Database Schema

  1. New Tables
    - `users` - User profiles with roles (admin, landlord, tenant, maintenance)
    - `properties` - Property listings with location and compliance data
    - `rooms` - Individual rooms within properties
    - `leases` - Rental agreements linking tenants to properties/rooms
    - `payments` - Payment records with Stripe integration
    - `maintenance_requests` - Maintenance tickets with AI categorization
    - `documents` - File storage links for properties and leases
    - `compliance_checks` - Healthy Homes compliance tracking
    - `inquiries` - Property inquiries with AI response tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure user data based on roles and ownership

  3. Features
    - AI-powered maintenance categorization
    - Compliance status tracking
    - Multi-role access control
    - Stripe payment integration
    - Document management system
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  role text NOT NULL CHECK (role IN ('admin', 'landlord', 'tenant', 'maintenance')) DEFAULT 'tenant',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  address text NOT NULL,
  suburb text NOT NULL,
  city text NOT NULL DEFAULT 'Auckland',
  country text NOT NULL DEFAULT 'New Zealand',
  latitude decimal(10,8),
  longitude decimal(11,8),
  property_type text NOT NULL CHECK (property_type IN ('house', 'apartment', 'room')) DEFAULT 'house',
  bedrooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  price_per_week decimal(10,2) NOT NULL,
  bond_amount decimal(10,2),
  is_furnished boolean DEFAULT false,
  is_available boolean DEFAULT true,
  available_from date DEFAULT CURRENT_DATE,
  images text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  compliance_status text CHECK (compliance_status IN ('compliant', 'pending', 'non_compliant')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rooms table for per-room rentals
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price_per_week decimal(10,2) NOT NULL,
  bond_amount decimal(10,2),
  size_sqm decimal(5,2),
  has_ensuite boolean DEFAULT false,
  is_available boolean DEFAULT true,
  available_from date DEFAULT CURRENT_DATE,
  images text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leases table
CREATE TABLE IF NOT EXISTS leases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  weekly_rent decimal(10,2) NOT NULL,
  bond_amount decimal(10,2) NOT NULL,
  status text CHECK (status IN ('draft', 'active', 'pending', 'terminated', 'expired')) DEFAULT 'draft',
  payment_frequency text CHECK (payment_frequency IN ('weekly', 'fortnightly', 'monthly')) DEFAULT 'weekly',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table with Stripe integration
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id uuid REFERENCES leases(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES users(id) ON DELETE CASCADE,
  landlord_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'nzd',
  payment_type text CHECK (payment_type IN ('rent', 'bond', 'utilities', 'maintenance')) DEFAULT 'rent',
  status text CHECK (status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  stripe_payment_intent_id text,
  stripe_charge_id text,
  due_date date NOT NULL,
  paid_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Maintenance requests with AI categorization
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES users(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'general',
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status text CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  estimated_cost decimal(10,2),
  actual_cost decimal(10,2),
  images text[] DEFAULT '{}',
  ai_suggested_category text,
  ai_priority_score integer CHECK (ai_priority_score BETWEEN 1 AND 10),
  scheduled_date date,
  completed_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table for file storage
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  lease_id uuid REFERENCES leases(id) ON DELETE CASCADE,
  maintenance_request_id uuid REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  document_type text CHECK (document_type IN ('lease', 'compliance', 'maintenance', 'insurance', 'other')) DEFAULT 'other',
  created_at timestamptz DEFAULT now()
);

-- Compliance checks table
CREATE TABLE IF NOT EXISTS compliance_checks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  check_type text NOT NULL,
  requirement text NOT NULL,
  status text CHECK (status IN ('compliant', 'pending', 'non_compliant', 'not_applicable')) DEFAULT 'pending',
  evidence_url text,
  notes text,
  due_date date,
  completed_date timestamptz,
  ai_compliance_score integer CHECK (ai_compliance_score BETWEEN 1 AND 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inquiries table with AI response tracking
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  inquirer_email text NOT NULL,
  inquirer_name text,
  inquirer_phone text,
  message text NOT NULL,
  status text CHECK (status IN ('new', 'responded', 'viewing_scheduled', 'closed')) DEFAULT 'new',
  ai_response text,
  ai_confidence_score decimal(3,2) CHECK (ai_confidence_score BETWEEN 0 AND 1),
  landlord_response text,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

-- RLS Policies for Properties
CREATE POLICY "Properties are publicly readable"
  ON properties FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Landlords can manage their properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.id = properties.landlord_id
    )
  );

-- RLS Policies for Rooms
CREATE POLICY "Rooms are publicly readable"
  ON rooms FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Landlords can manage rooms in their properties"
  ON rooms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      JOIN users ON users.id = properties.landlord_id
      WHERE properties.id = rooms.property_id
      AND users.auth_id = auth.uid()
    )
  );

-- RLS Policies for Leases
CREATE POLICY "Users can read their own leases"
  ON leases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND (users.id = leases.tenant_id OR 
           users.id IN (SELECT landlord_id FROM properties WHERE id = leases.property_id))
    )
  );

-- RLS Policies for Payments
CREATE POLICY "Users can read their own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND (users.id = payments.tenant_id OR users.id = payments.landlord_id)
    )
  );

-- RLS Policies for Maintenance Requests
CREATE POLICY "Users can read relevant maintenance requests"
  ON maintenance_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND (users.id = maintenance_requests.tenant_id OR 
           users.id = maintenance_requests.assigned_to OR
           users.id IN (SELECT landlord_id FROM properties WHERE id = maintenance_requests.property_id))
    )
  );

-- RLS Policies for Documents
CREATE POLICY "Users can read relevant documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND (users.id = documents.uploaded_by OR 
           users.id IN (SELECT landlord_id FROM properties WHERE id = documents.property_id) OR
           users.id IN (SELECT tenant_id FROM leases WHERE id = documents.lease_id))
    )
  );

-- RLS Policies for Compliance Checks
CREATE POLICY "Users can read compliance for their properties"
  ON compliance_checks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN properties ON properties.landlord_id = users.id
      WHERE users.auth_id = auth.uid()
      AND properties.id = compliance_checks.property_id
    )
  );

-- RLS Policies for Inquiries
CREATE POLICY "Landlords can read inquiries for their properties"
  ON inquiries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN properties ON properties.landlord_id = users.id
      WHERE users.auth_id = auth.uid()
      AND properties.id = inquiries.property_id
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_suburb ON properties(suburb);
CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(is_available, available_from);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(is_available, available_from);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_leases_tenant ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_property ON leases(property_id);