/*
  # Enhanced Keyskeeper Database Schema

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
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For better location handling

-- Create custom types for better type safety
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'landlord', 'tenant', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_type AS ENUM ('house', 'apartment', 'room', 'studio', 'townhouse');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE compliance_status AS ENUM ('compliant', 'pending', 'non_compliant', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lease_status AS ENUM ('draft', 'active', 'pending', 'terminated', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table with enhanced fields
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'tenant',
  is_verified boolean DEFAULT false,
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_phone text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Properties table with enhanced location and features
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  address text NOT NULL,
  suburb text NOT NULL,
  city text NOT NULL DEFAULT 'Auckland',
  postcode text,
  country text NOT NULL DEFAULT 'New Zealand',
  latitude decimal(10,8),
  longitude decimal(11,8),
  property_type property_type NOT NULL DEFAULT 'house',
  bedrooms integer DEFAULT 0 CHECK (bedrooms >= 0),
  bathrooms decimal(3,1) DEFAULT 0 CHECK (bathrooms >= 0), -- Allow half baths
  parking_spaces integer DEFAULT 0 CHECK (parking_spaces >= 0),
  price_per_week decimal(10,2) NOT NULL CHECK (price_per_week > 0),
  bond_amount decimal(10,2),
  utilities_included boolean DEFAULT false,
  internet_included boolean DEFAULT false,
  is_furnished boolean DEFAULT false,
  pets_allowed boolean DEFAULT false,
  smoking_allowed boolean DEFAULT false,
  is_available boolean DEFAULT true,
  available_from date DEFAULT CURRENT_DATE,
  images text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  compliance_status compliance_status DEFAULT 'pending',
  last_compliance_check timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rooms table for per-room rentals
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price_per_week decimal(10,2) NOT NULL CHECK (price_per_week > 0),
  bond_amount decimal(10,2),
  size_sqm decimal(6,2) CHECK (size_sqm > 0),
  has_ensuite boolean DEFAULT false,
  has_balcony boolean DEFAULT false,
  window_direction text, -- 'north', 'south', 'east', 'west'
  is_available boolean DEFAULT true,
  available_from date DEFAULT CURRENT_DATE,
  images text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leases table with enhanced tracking
CREATE TABLE IF NOT EXISTS leases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  weekly_rent decimal(10,2) NOT NULL CHECK (weekly_rent > 0),
  bond_amount decimal(10,2) NOT NULL CHECK (bond_amount >= 0),
  bond_paid boolean DEFAULT false,
  bond_returned boolean DEFAULT false,
  status lease_status DEFAULT 'draft',
  payment_frequency text CHECK (payment_frequency IN ('weekly', 'fortnightly', 'monthly')) DEFAULT 'weekly',
  lease_document_url text,
  signed_date timestamptz,
  termination_notice_date date,
  termination_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure end date is after start date
  CONSTRAINT valid_lease_period CHECK (end_date > start_date)
);

-- Payments table with enhanced Stripe integration
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id uuid NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'nzd',
  payment_type text CHECK (payment_type IN ('rent', 'bond', 'utilities', 'maintenance', 'late_fee')) DEFAULT 'rent',
  status payment_status DEFAULT 'pending',
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_session_id text,
  due_date date NOT NULL,
  paid_date timestamptz,
  late_fee decimal(10,2) DEFAULT 0,
  payment_method text, -- 'card', 'bank_transfer', 'cash', etc.
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Maintenance requests with enhanced AI categorization
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  tenant_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'general',
  priority maintenance_priority DEFAULT 'medium',
  status text CHECK (status IN ('open', 'in_progress', 'waiting_parts', 'completed', 'cancelled')) DEFAULT 'open',
  is_emergency boolean DEFAULT false,
  estimated_cost decimal(10,2),
  actual_cost decimal(10,2),
  images text[] DEFAULT '{}',
  ai_suggested_category text,
  ai_priority_score integer CHECK (ai_priority_score BETWEEN 1 AND 10),
  ai_cost_estimate decimal(10,2),
  scheduled_date timestamptz,
  completed_date timestamptz,
  contractor_name text,
  contractor_contact text,
  warranty_until date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table with better organization
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  lease_id uuid REFERENCES leases(id) ON DELETE CASCADE,
  maintenance_request_id uuid REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  document_type text CHECK (document_type IN ('lease', 'compliance', 'maintenance', 'insurance', 'inspection', 'other')) DEFAULT 'other',
  is_public boolean DEFAULT false, -- For property photos, etc.
  expires_at date, -- For documents with expiry dates
  created_at timestamptz DEFAULT now()
);

-- Enhanced compliance checks
CREATE TABLE IF NOT EXISTS compliance_checks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  check_type text NOT NULL, -- 'heating', 'insulation', 'ventilation', 'moisture', 'drainage'
  requirement text NOT NULL,
  status compliance_status DEFAULT 'pending',
  evidence_url text,
  notes text,
  inspector_name text,
  inspection_date date,
  due_date date,
  next_check_date date, -- For recurring checks
  completed_date timestamptz,
  ai_compliance_score integer CHECK (ai_compliance_score BETWEEN 1 AND 100),
  cost decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inquiries table with enhanced tracking
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  inquirer_email text NOT NULL,
  inquirer_name text,
  inquirer_phone text,
  message text NOT NULL,
  status text CHECK (status IN ('new', 'responded', 'viewing_scheduled', 'application_sent', 'closed')) DEFAULT 'new',
  ai_response text,
  ai_confidence_score decimal(3,2) CHECK (ai_confidence_score BETWEEN 0 AND 1),
  landlord_response text,
  responded_at timestamptz,
  viewing_date timestamptz,
  source text DEFAULT 'website', -- 'website', 'trademe', 'facebook', etc.
  created_at timestamptz DEFAULT now()
);

-- Property views tracking for analytics
CREATE TABLE IF NOT EXISTS property_views (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  viewer_ip inet,
  user_agent text,
  referrer text,
  session_id text,
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
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for Users
CREATE POLICY "Users can read own profile and public landlord info"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.uid() = auth_id OR 
    role = 'landlord' OR 
    is_admin()
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (is_admin());

-- RLS Policies for Properties
CREATE POLICY "Properties are publicly readable"
  ON properties FOR SELECT
  TO anon, authenticated
  USING (is_available = true OR is_admin());

CREATE POLICY "Landlords can manage their properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.id = properties.landlord_id
    ) OR is_admin()
  );

-- RLS Policies for Rooms
CREATE POLICY "Rooms are publicly readable for available properties"
  ON rooms FOR SELECT
  TO anon, authenticated
  USING (
    is_available = true AND 
    EXISTS (SELECT 1 FROM properties WHERE id = rooms.property_id AND is_available = true)
    OR is_admin()
  );

CREATE POLICY "Landlords can manage rooms in their properties"
  ON rooms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      JOIN users ON users.id = properties.landlord_id
      WHERE properties.id = rooms.property_id
      AND users.auth_id = auth.uid()
    ) OR is_admin()
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
    ) OR is_admin()
  );

CREATE POLICY "Landlords and tenants can manage their leases"
  ON leases FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND (users.id = leases.tenant_id OR 
           users.id IN (SELECT landlord_id FROM properties WHERE id = leases.property_id))
    ) OR is_admin()
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
    ) OR is_admin()
  );

CREATE POLICY "System can create payments"
  ON payments FOR INSERT
  TO authenticated
  USING (true);

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
           users.role = 'maintenance' OR
           users.id IN (SELECT landlord_id FROM properties WHERE id = maintenance_requests.property_id))
    ) OR is_admin()
  );

CREATE POLICY "Tenants can create maintenance requests"
  ON maintenance_requests FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.id = maintenance_requests.tenant_id
    )
  );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_compliance_checks_updated_at BEFORE UPDATE ON compliance_checks 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_suburb ON properties(suburb);
CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(is_available, available_from);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_per_week);
CREATE INDEX IF NOT EXISTS idx_properties_compliance ON properties(compliance_status);

CREATE INDEX IF NOT EXISTS idx_rooms_property ON rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(is_available, available_from);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON rooms(price_per_week);

CREATE INDEX IF NOT EXISTS idx_leases_tenant ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_property ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_leases_dates ON leases(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_payments_lease ON payments(lease_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_landlord ON payments(landlord_id);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_maintenance_property ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tenant ON maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_assigned ON maintenance_requests(assigned_to);

CREATE INDEX IF NOT EXISTS idx_documents_property ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_lease ON documents(lease_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

CREATE INDEX IF NOT EXISTS idx_compliance_property ON compliance_checks(property_id);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON compliance_checks(status);
CREATE INDEX IF NOT EXISTS idx_compliance_due_date ON compliance_checks(due_date);

CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);

CREATE INDEX IF NOT EXISTS idx_property_views_property ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_created ON property_views(created_at);

-- Insert some sample data for development
INSERT INTO users (auth_id, email, full_name, role, is_verified) 
VALUES (gen_random_uuid(), 'admin@keyskeeper.co.nz', 'System Admin', 'admin', true)
ON CONFLICT (email) DO NOTHING;