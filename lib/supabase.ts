import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'admin' | 'landlord' | 'tenant' | 'maintenance'

export interface User {
  id: string
  email: string
  role: UserRole
  full_name?: string
  phone?: string
  avatar_url?: string
  created_at: string
}

export interface Property {
  id: string
  landlord_id: string
  title: string
  description: string
  address: string
  suburb: string
  city: string
  latitude: number
  longitude: number
  property_type: 'house' | 'apartment' | 'room'
  bedrooms: number
  bathrooms: number
  price_per_week: number
  is_furnished: boolean
  available_from: string
  images: string[]
  compliance_status: 'compliant' | 'pending' | 'non_compliant'
  created_at: string
}

export interface Room {
  id: string
  property_id: string
  name: string
  price_per_week: number
  is_available: boolean
  size_sqm?: number
  has_ensuite: boolean
  images: string[]
  created_at: string
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
  status: 'active' | 'pending' | 'terminated'
  created_at: string
}