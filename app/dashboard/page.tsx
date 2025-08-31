'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Users, 
  Wrench, 
  Shield, 
  ArrowRight,
  User as UserIcon,
  Settings,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { supabase, User, Property } from '@/lib/supabase'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalViewings: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', authUser.id)
          .maybeSingle()

        if (profile) {
          setUser(profile)
          await fetchDashboardData(profile)
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const fetchDashboardData = async (user: User) => {
    try {
      if (user.role === 'landlord') {
        // Fetch landlord's properties
        const { data: userProperties } = await supabase
          .from('properties')
          .select('*')
          .eq('landlord_id', user.id)
          .order('created_at', { ascending: false })
        
        setProperties(userProperties || [])
        setStats(prev => ({ ...prev, totalProperties: userProperties?.length || 0 }))
      } else if (user.role === 'admin') {
        // Fetch all properties and users for admin
        const [propertiesRes, usersRes] = await Promise.all([
          supabase.from('properties').select('*').order('created_at', { ascending: false }),
          supabase.from('users').select('*')
        ])
        
        setProperties(propertiesRes.data || [])
        setStats({
          totalProperties: propertiesRes.data?.length || 0,
          totalUsers: usersRes.data?.length || 0,
          totalViewings: 0, // You can implement this
          totalRevenue: 0 // You can implement this
        })
      } else if (user.role === 'tenant') {
        // Fetch available properties for tenant
        const { data: availableProperties } = await supabase
          .from('properties')
          .select('*')
          .eq('is_available', true)
          .order('created_at', { ascending: false })
          .limit(6)
        
        setProperties(availableProperties || [])
      } else if (user.role === 'maintenance') {
        // Fetch maintenance requests for maintenance user
        const { data: maintenanceRequests } = await supabase
          .from('maintenance_requests')
          .select('*, property:properties(*)')
          .or('assigned_to.eq.' + user.id + ',assigned_to.is.null')
          .order('created_at', { ascending: false })
          .limit(10)
        
        // For maintenance users, we'll use properties array to store maintenance data
        setProperties([])
        setStats({
          totalProperties: 0,
          totalUsers: 0,
          totalViewings: maintenanceRequests?.length || 0,
          totalRevenue: 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
      
      if (error) throw error
      
      // Refresh properties
      if (user) {
        await fetchDashboardData(user)
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Failed to delete property')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Render different dashboard views based on user role
  if (user.role === 'landlord') {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Landlord Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.full_name || user.email}</p>
            </div>
            <Link href="/list-property">
              <Button className="bg-[#FF5A5F] hover:bg-[#E8474B]">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Home className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Add more stats cards as needed */}
          </div>

          {/* Properties Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Your Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No properties listed yet</p>
                  <Link href="/list-property">
                    <Button className="bg-[#FF5A5F] hover:bg-[#E8474B]">
                      <Plus className="h-4 w-4 mr-2" />
                      List Your First Property
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Property</th>
                        <th className="text-left py-3 px-4">Location</th>
                        <th className="text-left py-3 px-4">Price</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((property) => (
                        <tr key={property.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3">
                                {property.images?.[0] && (
                                  <img 
                                    src={property.images[0]} 
                                    alt={property.title}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{property.title}</p>
                                <p className="text-sm text-gray-500 capitalize">{property.property_type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {property.suburb}, {property.city}
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            ${property.price_per_week}/week
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={property.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {property.is_available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Link href={`/properties/${property.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteProperty(property.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <BottomNavigation />
      </div>
    )
  }

  if (user.role === 'tenant') {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.full_name || user.email}</p>
            </div>
            <Link href="/search">
              <Button className="bg-[#FF5A5F] hover:bg-[#E8474B]">
                <Search className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/search">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Search className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Properties</h3>
                  <p className="text-gray-600">Find your perfect rental</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/maintenance-request">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Wrench className="h-8 w-8 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Maintenance Request</h3>
                  <p className="text-gray-600">Report any issues</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Viewings</h3>
                <p className="text-gray-600">Scheduled appointments</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-200 rounded-lg mb-4">
                        {property.images?.[0] && (
                          <img 
                            src={property.images[0]} 
                            alt={property.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{property.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{property.suburb}, {property.city}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#FF5A5F]">${property.price_per_week}/week</span>
                        <Link href={`/properties/${property.id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation />
      </div>
    )
  }

  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">System overview and management</p>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Home className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Wrench className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Maintenance Requests</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$24,500</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Manage system users and their roles</p>
                <div className="flex space-x-2">
                  <Link href="/admin/users">
                    <Button size="sm">View All Users</Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button size="sm" variant="outline">Add User</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Property Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Oversee all property listings</p>
                <div className="flex space-x-2">
                  <Button size="sm">View All Properties</Button>
                  <Button size="sm" variant="outline">Property Reports</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Properties Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Property</th>
                      <th className="text-left py-3 px-4">Landlord</th>
                      <th className="text-left py-3 px-4">Location</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.slice(0, 10).map((property) => (
                      <tr key={property.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{property.title}</p>
                          <p className="text-sm text-gray-500 capitalize">{property.property_type}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {property.landlord_id}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {property.suburb}, {property.city}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          ${property.price_per_week}/week
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={property.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {property.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteProperty(property.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation />
      </div>
    )
  }

  if (user.role === 'maintenance') {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Maintenance Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.full_name || user.email}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Urgent Requests</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed Today</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">$3,200</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Urgent Requests</h3>
                <p className="text-gray-600">View and respond to urgent maintenance</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule</h3>
                <p className="text-gray-600">Manage your maintenance schedule</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
                <p className="text-gray-600">View completed work reports</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Maintenance Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: '1',
                    title: 'Leaking tap in kitchen',
                    property: '123 Queen Street, Auckland',
                    priority: 'high',
                    status: 'open',
                    created: '2 hours ago'
                  },
                  {
                    id: '2',
                    title: 'Broken window latch',
                    property: '456 King Street, Wellington',
                    priority: 'medium',
                    status: 'in_progress',
                    created: '1 day ago'
                  },
                  {
                    id: '3',
                    title: 'Heating not working',
                    property: '789 Main Road, Christchurch',
                    priority: 'urgent',
                    status: 'open',
                    created: '30 minutes ago'
                  }
                ].map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{request.title}</h4>
                      <p className="text-sm text-gray-600">{request.property}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={
                          request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {request.priority}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {request.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500">{request.created}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation />
      </div>
    )
  }

  // Default dashboard (fallback)
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Keyskeeper
          </h1>
          <p className="text-gray-600">
            Hello {user.full_name || user.email}, manage your account and access your dashboard
          </p>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.full_name || 'User'}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <Badge className={
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'landlord' ? 'bg-orange-100 text-orange-800' :
                      user.role === 'tenant' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'maintenance' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                      {user.role === 'landlord' && <Home className="h-3 w-3 mr-1" />}
                      {user.role === 'tenant' && <Users className="h-3 w-3 mr-1" />}
                      {user.role === 'maintenance' && <Wrench className="h-3 w-3 mr-1" />}
                      {user.role}
                    </Badge>
                    {user.is_verified && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/search">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Search Properties
                </Button>
              </Link>
              <Link href="/list-property">
                <Button variant="outline" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  List Property
                </Button>
              </Link>
              <Link href="/maintenance-request">
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="h-4 w-4 mr-2" />
                  Maintenance Request
                </Button>
              </Link>
              <Link href="/property-appraisal">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Property Appraisal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  )
}