'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar,
  Clock,
  ArrowLeft,
  User as UserIcon,
  Home,
  MapPin,
  Edit,
  CheckCircle,
  AlertTriangle,
  Plus
} from 'lucide-react'
import { supabase, User, MaintenanceRequest } from '@/lib/supabase'
import Link from 'next/link'

export default function MaintenanceSchedulePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [scheduledRequests, setScheduledRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [requestToSchedule, setRequestToSchedule] = useState<string | null>(null)
  const [scheduleData, setScheduleData] = useState({
    scheduled_date: '',
    scheduled_time: '',
    notes: ''
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
          if (profile.role !== 'maintenance' && profile.role !== 'admin') {
            router.push('/dashboard')
            return
          }
          setUser(profile)
          await fetchScheduledRequests(profile)
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

  const fetchScheduledRequests = async (user: User) => {
    try {
      const { data: requests } = await supabase
        .from('maintenance_requests')
        .select('*, property:properties(*)')
        .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
        .in('status', ['in_progress', 'open'])
        .order('scheduled_date', { ascending: true, nullsLast: true })
      
      setScheduledRequests(requests || [])
    } catch (error) {
      console.error('Error fetching scheduled requests:', error)
    }
  }

  const handleScheduleRequest = async () => {
    if (!requestToSchedule || !user) return
    
    try {
      const scheduledDateTime = scheduleData.scheduled_date && scheduleData.scheduled_time
        ? `${scheduleData.scheduled_date}T${scheduleData.scheduled_time}:00`
        : null

      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_to: user.id,
          status: 'in_progress',
          scheduled_date: scheduledDateTime
        })
        .eq('id', requestToSchedule)

      if (error) throw error
      
      // Refresh data
      await fetchScheduledRequests(user)
      setScheduleDialogOpen(false)
      setRequestToSchedule(null)
      setScheduleData({ scheduled_date: '', scheduled_time: '', notes: '' })
    } catch (error) {
      console.error('Error scheduling maintenance request:', error)
    }
  }

  const openScheduleDialog = (requestId: string) => {
    setRequestToSchedule(requestId)
    setScheduleDialogOpen(true)
  }

  const markAsCompleted = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          status: 'completed',
          completed_date: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error
      
      // Refresh data
      if (user) {
        await fetchScheduledRequests(user)
      }
    } catch (error) {
      console.error('Error marking request as completed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const todayRequests = scheduledRequests.filter(req => 
    req.scheduled_date && 
    new Date(req.scheduled_date).toDateString() === new Date().toDateString()
  )

  const upcomingRequests = scheduledRequests.filter(req => 
    req.scheduled_date && 
    new Date(req.scheduled_date) > new Date() &&
    new Date(req.scheduled_date).toDateString() !== new Date().toDateString()
  )

  const unscheduledRequests = scheduledRequests.filter(req => !req.scheduled_date)

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
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              Maintenance Schedule
            </h1>
            <p className="text-gray-600">Manage your maintenance appointments and schedule</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{todayRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unscheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{unscheduledRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{scheduledRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        {todayRequests.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <Calendar className="h-5 w-5 mr-2" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayRequests.map((request) => (
                  <div key={request.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        <p className="text-gray-700 mb-2">{request.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Home className="h-4 w-4 mr-1" />
                            {request.property?.title || 'Unknown Property'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {request.scheduled_date ? new Date(request.scheduled_date).toLocaleTimeString('en-NZ', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 'No time set'}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
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
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          size="sm" 
                          onClick={() => markAsCompleted(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          title="Mark as completed"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Schedule */}
        {upcomingRequests.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Upcoming Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        <p className="text-gray-700 mb-2">{request.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Home className="h-4 w-4 mr-1" />
                            {request.property?.title || 'Unknown Property'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {request.scheduled_date ? new Date(request.scheduled_date).toLocaleDateString('en-NZ') : 'No date set'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {request.scheduled_date ? new Date(request.scheduled_date).toLocaleTimeString('en-NZ', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 'No time set'}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge className={
                            request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openScheduleDialog(request.id)}
                          title="Reschedule"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => markAsCompleted(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          title="Mark as completed"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unscheduled Requests */}
        {unscheduledRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Unscheduled Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unscheduledRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        <p className="text-gray-700 mb-2">{request.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Home className="h-4 w-4 mr-1" />
                            {request.property?.title || 'Unknown Property'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            Created: {new Date(request.created_at).toLocaleDateString('en-NZ')}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge className={
                            request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {request.status.replace('_', ' ')}
                          </Badge>
                          {!request.assigned_to && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                              Unassigned
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          size="sm" 
                          onClick={() => openScheduleDialog(request.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          title="Schedule this request"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {scheduledRequests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scheduled Maintenance</h3>
              <p className="text-gray-600">No maintenance requests are currently scheduled.</p>
            </CardContent>
          </Card>
        )}

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduled_date">Date</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={scheduleData.scheduled_date}
                    onChange={(e) => setScheduleData({...scheduleData, scheduled_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduled_time">Time</Label>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={scheduleData.scheduled_time}
                    onChange={(e) => setScheduleData({...scheduleData, scheduled_time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                  placeholder="Any additional notes for this appointment..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleRequest}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Schedule Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <BottomNavigation />
    </div>
  )
}