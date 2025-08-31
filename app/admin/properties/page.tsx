'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  Home, 
  Search, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Eye,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react'
import { supabase, Property, User } from '@/lib/supabase'
import { formatPrice } from '@/lib/stripe'
import Link from 'next/link'

export default function AdminPropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<(Property & { landlord?: User })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all')
  const [error, setError] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAccess()
    fetchProperties()
  }, [statusFilter])

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

  const fetchProperties = async () => {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          landlord:users!properties_landlord_id_fkey(id, full_name, email, phone)
        `)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('is_available', statusFilter === 'available')
      }

      const { data, error } = await query

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
      setError('Failed to fetch properties')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete)
      
      if (error) throw error
      
      await fetchProperties()
      setDeleteDialogOpen(false)
      setPropertyToDelete(null)
    } catch (error: any) {
      setError(error.message || 'Failed to delete property')
    }
  }

  const togglePropertyAvailability = async (propertyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_available: !currentStatus })
        .eq('id', propertyId)

      if (error) throw error
      await fetchProperties()
    } catch (error: any) {
      setError(error.message || 'Failed to update property status')
    }
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.suburb.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.landlord?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.landlord?.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
              <p className="text-gray-600">Manage all properties in the system</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties by title, address, or landlord..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'unavailable')}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Properties</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Properties ({filteredProperties.length})
            </CardTitle>
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
                    <th className="text-left py-3 px-4">Created</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 overflow-hidden">
                            {property.images?.[0] ? (
                              <img 
                                src={property.images[0]} 
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Home className="h-6 w-6 text-gray-400 m-3" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{property.title}</p>
                            <p className="text-sm text-gray-500 capitalize">
                              {property.bedrooms} bed • {property.bathrooms} bath • {property.property_type}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {property.landlord?.full_name || 'No name'}
                          </p>
                          <p className="text-sm text-gray-500">{property.landlord?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <div>
                            <p className="text-gray-900">{property.suburb}</p>
                            <p className="text-sm text-gray-500">{property.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(property.price_per_week)}
                          </p>
                          <p className="text-sm text-gray-500">per week</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col space-y-1">
                          <Badge className={property.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {property.is_available ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Available
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Unavailable
                              </>
                            )}
                          </Badge>
                          <Badge variant="outline" className={
                            property.compliance_status === 'compliant' ? 'text-green-700 border-green-200' :
                            property.compliance_status === 'pending' ? 'text-yellow-700 border-yellow-200' :
                            'text-red-700 border-red-200'
                          }>
                            {property.compliance_status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(property.created_at).toLocaleDateString('en-NZ')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/properties/${property.id}`}>
                            <Button variant="ghost" size="sm" title="View property">
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                          </Link>
                          <Link href={`/landlord/properties/${property.id}/edit`}>
                            <Button variant="ghost" size="sm" title="Edit property">
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePropertyAvailability(property.id, property.is_available)}
                            title={property.is_available ? 'Mark as unavailable' : 'Mark as available'}
                          >
                            {property.is_available ? (
                              <XCircle className="h-4 w-4 text-orange-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setPropertyToDelete(property.id)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Delete property"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredProperties.length === 0 && (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No properties found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Property Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.filter(p => p.is_available).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Weekly Rent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.length > 0 
                      ? formatPrice(properties.reduce((sum, p) => sum + p.price_per_week, 0) / properties.length)
                      : '$0'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.filter(p => 
                      new Date(p.created_at).getMonth() === new Date().getMonth() &&
                      new Date(p.created_at).getFullYear() === new Date().getFullYear()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Property</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Are you sure you want to delete this property? This action cannot be undone and will remove all associated data including leases, payments, and maintenance requests.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteProperty}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Property
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <BottomNavigation />
    </div>
  )

}