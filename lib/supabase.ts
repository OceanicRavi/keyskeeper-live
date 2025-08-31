import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'admin' | 'landlord' | 'tenant' | 'maintenance'
export type PropertyType = 'house' | 'apartment' | 'room' | 'studio' | 'townhouse'
export type ComplianceStatus = 'compliant' | 'pending' | 'non_compliant' | 'expired'
export type LeaseStatus = 'draft' | 'active' | 'pending' | 'terminated' | 'expired'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent'
export type MaintenanceStatus = 'open' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled'
export type InquiryStatus = 'new' | 'responded' | 'viewing_scheduled' | 'application_sent' | 'closed'

export interface User {
  id: string
  auth_id: string
  email: string
  role: UserRole
  full_name?: string
  phone?: string
  avatar_url?: string
  is_verified: boolean
  date_of_birth?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  preferences?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  landlord_id: string
  title: string
  description?: string
  address: string
  suburb: string
  city: string
  postcode?: string
  country: string
  latitude?: number
  longitude?: number
  property_type: PropertyType
  bedrooms: number
  bathrooms: number
  parking_spaces: number
  price_per_week: number
  bond_amount?: number
  utilities_included: boolean
  internet_included: boolean
  is_furnished: boolean
  pets_allowed: boolean
  smoking_allowed: boolean
  is_available: boolean
  available_from: string
  images: string[]
  amenities: string[]
  compliance_status: ComplianceStatus
  last_compliance_check?: string
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  property_id: string
  name: string
  description?: string
  price_per_week: number
  bond_amount?: number
  size_sqm?: number
  has_ensuite: boolean
  has_balcony: boolean
  window_direction?: string
  is_available: boolean
  available_from: string
  images: string[]
  amenities: string[]
  created_at: string
  updated_at: string
}

export interface Lease {
  id: string
  tenant_id: string
  property_id: string
  room_id?: string
  start_date: string
  end_date: string
  weekly_rent: number
  bond_amount: number
  bond_paid: boolean
  bond_returned: boolean
  status: LeaseStatus
  payment_frequency: 'weekly' | 'fortnightly' | 'monthly'
  lease_document_url?: string
  signed_date?: string
  termination_notice_date?: string
  termination_reason?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  lease_id: string
  tenant_id: string
  landlord_id: string
  amount: number
  currency: string
  payment_type: 'rent' | 'bond' | 'utilities' | 'maintenance' | 'late_fee'
  status: PaymentStatus
  stripe_payment_intent_id?: string
  stripe_charge_id?: string
  stripe_session_id?: string
  due_date: string
  paid_date?: string
  late_fee: number
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface MaintenanceRequest {
  property: any
  id: string
  property_id: string
  room_id?: string
  tenant_id: string
  assigned_to?: string
  title: string
  description: string
  category: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  is_emergency: boolean
  estimated_cost?: number
  actual_cost?: number
  images: string[]
  ai_suggested_category?: string
  ai_priority_score?: number
  ai_cost_estimate?: number
  scheduled_date?: string
  completed_date?: string
  contractor_name?: string
  contractor_contact?: string
  warranty_until?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  property_id?: string
  lease_id?: string
  maintenance_request_id?: string
  uploaded_by: string
  name: string
  file_url: string
  file_type: string
  file_size?: number
  document_type: 'lease' | 'compliance' | 'maintenance' | 'insurance' | 'inspection' | 'other'
  is_public: boolean
  expires_at?: string
  created_at: string
}

export interface ComplianceCheck {
  id: string
  property_id: string
  check_type: string
  requirement: string
  status: ComplianceStatus
  evidence_url?: string
  notes?: string
  inspector_name?: string
  inspection_date?: string
  due_date?: string
  next_check_date?: string
  completed_date?: string
  ai_compliance_score?: number
  cost?: number
  created_at: string
  updated_at: string
}

export interface Inquiry {
  id: string
  property_id: string
  room_id?: string
  inquirer_email: string
  inquirer_name?: string
  inquirer_phone?: string
  message: string
  status: InquiryStatus
  ai_response?: string
  ai_confidence_score?: number
  landlord_response?: string
  responded_at?: string
  viewing_date?: string
  source: string
  created_at: string
}

export interface PropertyView {
  id: string
  property_id: string
  room_id?: string
  viewer_ip?: string
  user_agent?: string
  referrer?: string
  session_id?: string
  created_at: string
}

// Helper types for forms and API responses
export interface PropertyWithLandlord extends Property {
  landlord: Pick<User, 'id' | 'full_name' | 'email' | 'phone' | 'avatar_url'>
}

export interface PropertyWithRooms extends Property {
  rooms: Room[]
}

export interface LeaseWithDetails extends Lease {
  tenant: Pick<User, 'id' | 'full_name' | 'email' | 'phone'>
  property: Pick<Property, 'id' | 'title' | 'address' | 'suburb'>
  room?: Pick<Room, 'id' | 'name'>
}

export interface MaintenanceWithDetails extends MaintenanceRequest {
  tenant: Pick<User, 'id' | 'full_name' | 'email' | 'phone'>
  property: Pick<Property, 'id' | 'title' | 'address'>
  room?: Pick<Room, 'id' | 'name'>
  assigned_user?: Pick<User, 'id' | 'full_name' | 'email' | 'phone'>
}

// Search and filter types
export interface PropertySearchFilters {
  location?: string
  suburb?: string
  property_type?: PropertyType[]
  min_price?: number
  max_price?: number
  bedrooms?: number
  bathrooms?: number
  is_furnished?: boolean
  pets_allowed?: boolean
  available_from?: string
  amenities?: string[]
}

export interface PropertySortOptions {
  field: 'price_per_week' | 'created_at' | 'bedrooms' | 'bathrooms'
  direction: 'asc' | 'desc'
}

// Database utility functions
export const getUserProfile = async (authId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .maybeSingle()
  
  if (error) return null
  return data
}

export const getPropertiesWithFilters = async (
  filters: PropertySearchFilters,
  sort: PropertySortOptions = { field: 'created_at', direction: 'desc' },
  limit = 20,
  offset = 0
) => {
  let query = supabase
    .from('properties')
    .select(`
      *,
      landlord:users!properties_landlord_id_fkey(id, full_name, email, phone, avatar_url),
      rooms(*)
    `)
    .eq('is_available', true)

  // Apply filters
  if (filters.suburb) {
    query = query.ilike('suburb', `%${filters.suburb}%`)
  }
  
  if (filters.property_type?.length) {
    query = query.in('property_type', filters.property_type)
  }
  
  if (filters.min_price) {
    query = query.gte('price_per_week', filters.min_price)
  }
  
  if (filters.max_price) {
    query = query.lte('price_per_week', filters.max_price)
  }
  
  if (filters.bedrooms) {
    query = query.gte('bedrooms', filters.bedrooms)
  }
  
  if (filters.bathrooms) {
    query = query.gte('bathrooms', filters.bathrooms)
  }
  
  if (filters.is_furnished !== undefined) {
    query = query.eq('is_furnished', filters.is_furnished)
  }
  
  if (filters.pets_allowed !== undefined) {
    query = query.eq('pets_allowed', filters.pets_allowed)
  }
  
  if (filters.available_from) {
    query = query.lte('available_from', filters.available_from)
  }

  // Apply sorting
  query = query.order(sort.field, { ascending: sort.direction === 'asc' })

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  return query
}

export const createPropertyInquiry = async (inquiry: Omit<Inquiry, 'id' | 'created_at' | 'status'>) => {
  return supabase
    .from('inquiries')
    .insert([{ ...inquiry, status: 'new' }])
    .select()
    .single()
}

export const trackPropertyView = async (view: Omit<PropertyView, 'id' | 'created_at'>) => {
  return supabase
    .from('property_views')
    .insert([view])
}

// Validation schemas (you might want to use with zod)
export const propertyCreateSchema = {
  title: 'required|string|min:5|max:100',
  description: 'string|max:2000',
  address: 'required|string|min:10|max:200',
  suburb: 'required|string|min:2|max:50',
  city: 'required|string|min:2|max:50',
  property_type: 'required|in:house,apartment,room,studio,townhouse',
  bedrooms: 'required|integer|min:0|max:20',
  bathrooms: 'required|numeric|min:0|max:10',
  price_per_week: 'required|numeric|min:50|max:5000',
  available_from: 'required|date|after_or_equal:today'
}