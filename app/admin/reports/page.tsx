'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Home,
  DollarSign,
  Calendar,
  FileText,
  Download
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/stripe'
import Link from 'next/link'
export const metadata = {
  robots: { index: false, follow: false }
}
interface ReportData {
  totalProperties: number
  totalUsers: number
  totalLandlords: number
  totalTenants: number
  totalRevenue: number
  monthlyRevenue: number
  averageRent: number
  occupancyRate: number
  maintenanceRequests: number
  completedMaintenance: number
}

export default function AdminReportsPage() {
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAdminAccess()
    fetchReportData()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', authUser.id)
        .maybeSingle()

      if (!profile || profile.role !== 'admin') {
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/auth/login')
    }
  }

  const fetchReportData = async () => {
    try {
      // Fetch properties data
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')

      if (propertiesError) throw propertiesError

      // Fetch users data
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')

      if (usersError) throw usersError

      // Fetch payments data
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'paid')

      if (paymentsError) throw paymentsError

      // Fetch maintenance requests
      const { data: maintenance, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')

      if (maintenanceError) throw maintenanceError

      // Calculate metrics
      const totalProperties = properties?.length || 0
      const totalUsers = users?.length || 0
      const totalLandlords = users?.filter(u => u.role === 'landlord').length || 0
      const totalTenants = users?.filter(u => u.role === 'tenant').length || 0
      
      const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
      
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyRevenue = payments?.filter(payment => {
        const paymentDate = new Date(payment.created_at)
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
      }).reduce((sum, payment) => sum + payment.amount, 0) || 0

      const averageRent = totalProperties > 0 
        ? properties.reduce((sum, prop) => sum + prop.price_per_week, 0) / totalProperties 
        : 0

      const availableProperties = properties?.filter(p => p.is_available).length || 0
      const occupancyRate = totalProperties > 0 ? ((totalProperties - availableProperties) / totalProperties) * 100 : 0

      const maintenanceRequests = maintenance?.length || 0
      const completedMaintenance = maintenance?.filter(m => m.status === 'completed').length || 0

      setReportData({
        totalProperties,
        totalUsers,
        totalLandlords,
        totalTenants,
        totalRevenue,
        monthlyRevenue,
        averageRent,
        occupancyRate,
        maintenanceRequests,
        completedMaintenance
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
      setError('Failed to fetch report data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#504746] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Reports</h1>
              <p className="text-gray-600">Comprehensive analytics and insights</p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {reportData && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Home className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Properties</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.totalProperties}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(reportData.totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.occupancyRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monthly Revenue</span>
                      <span className="font-semibold">{formatPrice(reportData.monthlyRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Weekly Rent</span>
                      <span className="font-semibold">{formatPrice(reportData.averageRent)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Lifetime Revenue</span>
                      <span className="font-semibold">{formatPrice(reportData.totalRevenue)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Landlords</span>
                      <span className="font-semibold">{reportData.totalLandlords}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Tenants</span>
                      <span className="font-semibold">{reportData.totalTenants}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">User Growth Rate</span>
                      <span className="font-semibold text-green-600">+12.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Maintenance Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Maintenance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{reportData.maintenanceRequests}</p>
                    <p className="text-sm text-gray-600">Total Requests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{reportData.completedMaintenance}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {reportData.maintenanceRequests - reportData.completedMaintenance}
                    </p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}