'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  ArrowLeft,
  User as UserIcon,
  Home,
  Calendar,
  DollarSign
} from 'lucide-react'
import { supabase, User, MaintenanceRequest } from '@/lib/supabase'
import Link from 'next/link'

export default function MaintenanceUrgentPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [urgentRequests, setUrgentRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [requestToAccept, setRequestToAccept] = useState<string | null>(null)

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
          if (profile.role !== 'maintenance' && profile.role !== 'admin') {
            router.push('/dashboard')
            return
          }
          setUser(profile)
          await fetchUrgentRequests(profile)
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

  const fetchUrgentRequests = async (user: User) => {
    try {
      const { data: requests } = await supabase
        .from('maintenance_requests')
        .select('*, property:properties(*)')
        .eq('priority', 'urgent')
        .order('created_at', { ascending: false })
      
      setUrgentRequests(requests || [])
    } catch (error) {
      console.error('Error fetching urgent requests:', error)
    }
  }

  const handleAcceptRequest = async () => {
    if (!requestToAccept || !user) return
    
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_to: user.id,
          status: 'in_progress'
        })
        .eq('id', requestToAccept)

      if (error) throw error
      
      // Refresh data
      await fetchUrgentRequests(user)
      setAcceptDialogOpen(false)
      setRequestToAccept(null)
    } catch (error) {
      console.error('Error accepting maintenance request:', error)
    }
  }

  const openAcceptDialog = (requestId: string) => {
    setRequestToAccept(requestId)
    setAcceptDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#504746] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading urgent requests...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              Urgent Maintenance Requests
            </h1>
            <p className="text-gray-600">High priority requests requiring immediate attention</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Urgent</p>
                  <p className="text-2xl font-bold text-gray-900">{urgentRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unassigned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {urgentRequests.filter(req => !req.assigned_to).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {urgentRequests.filter(req => req.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Urgent Maintenance Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {urgentRequests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Urgent Requests</h3>
                <p className="text-gray-600">All urgent maintenance requests have been addressed!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {urgentRequests.map((request) => (
                  <div key={request.id} className="border border-red-200 bg-red-50 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{request.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Home className="h-4 w-4 mr-1" />
                            Property: {request.property?.title || 'Unknown Property'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            Reported: {new Date(request.created_at).toLocaleDateString('en-NZ')}
                          </div>
                          {request.estimated_cost && (
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="h-4 w-4 mr-1" />
                              Est. Cost: ${request.estimated_cost}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge className="bg-red-100 text-red-800">
                            URGENT
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {request.status.replace('_', ' ')}
                          </Badge>
                          {request.assigned_to && (
                            <Badge variant="secondary">
                              <UserIcon className="h-3 w-3 mr-1" />
                              Assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/maintenance/requests/${request.id}`}>
                          <Button size="sm" variant="outline" title="View details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!request.assigned_to && (
                          <Button 
                            size="sm" 
                            onClick={() => openAcceptDialog(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            title="Accept request"
                          >
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accept Confirmation Dialog */}
        <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accept Maintenance Request</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Are you sure you want to accept this urgent maintenance request? This will assign the request to you and change its status to "In Progress".
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAcceptRequest}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Accept Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <BottomNavigation />
    </div>
  )
}