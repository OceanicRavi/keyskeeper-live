'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react'
import { supabase, User, MaintenanceRequest } from '@/lib/supabase'
import Link from 'next/link'

export default function MaintenanceReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalCost: 0,
    averageCompletionTime: 0,
    thisMonthCompleted: 0,
    thisMonthCost: 0
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

        if (!profile || (profile.role !== 'maintenance' && profile.role !== 'admin')) {
          router.push('/dashboard')
          return
        }

        setUser(profile)
        await fetchMaintenanceReports(profile)
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const fetchMaintenanceReports = async (user: User) => {
    try {
      let query = supabase
        .from('maintenance_requests')
        .select('*, property:properties(*)')
        .eq('status', 'completed')
        .order('completed_date', { ascending: false })

      // If maintenance user, only show their completed requests
      if (user.role === 'maintenance') {
        query = query.eq('assigned_to', user.id)
      }

      const { data: completedRequests } = await query

      if (completedRequests) {
        setMaintenanceRequests(completedRequests)
        
        // Calculate statistics
        const totalCost = completedRequests.reduce((sum, req) => sum + (req.actual_cost || 0), 0)
        const thisMonth = new Date().getMonth()
        const thisYear = new Date().getFullYear()
        
        const thisMonthRequests = completedRequests.filter(req => {
          const completedDate = new Date(req.completed_date || '')
          return completedDate.getMonth() === thisMonth && completedDate.getFullYear() === thisYear
        })
        
        const thisMonthCost = thisMonthRequests.reduce((sum, req) => sum + (req.actual_cost || 0), 0)
        
        // Calculate average completion time
        const completionTimes = completedRequests
          .filter(req => req.completed_date && req.created_at)
          .map(req => {
            const created = new Date(req.created_at)
            const completed = new Date(req.completed_date!)
            return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) // days
          })
        
        const averageCompletionTime = completionTimes.length > 0 
          ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
          : 0

        setStats({
          totalCompleted: completedRequests.length,
          totalCost,
          averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
          thisMonthCompleted: thisMonthRequests.length,
          thisMonthCost
        })
      }
    } catch (error) {
      console.error('Error fetching maintenance reports:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Maintenance Reports</h1>
              <p className="text-gray-600">View completed work and performance metrics</p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCompleted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageCompletionTime} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisMonthCompleted}</p>
                  <p className="text-xs text-gray-500">${stats.thisMonthCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Completed Maintenance Reports
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No completed maintenance reports found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Request</th>
                      <th className="text-left py-3 px-4">Property</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">Completed Date</th>
                      <th className="text-left py-3 px-4">Cost</th>
                      <th className="text-left py-3 px-4">Duration</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRequests.map((request) => {
                      const createdDate = new Date(request.created_at)
                      const completedDate = new Date(request.completed_date || '')
                      const durationDays = Math.round((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <tr key={request.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{request.title}</p>
                              <p className="text-sm text-gray-600">{request.description}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{request?.property?.title || 'Unknown Property'}</p>
                              <p className="text-sm text-gray-600">
                                {request?.property?.suburb}, {request?.property?.city}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {request.priority}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {completedDate.toLocaleDateString('en-NZ')}
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            ${request.actual_cost?.toLocaleString() || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {durationDays} days
                          </td>
                          <td className="py-3 px-4">
                            <Link href={`/maintenance/requests/${request.id}`}>
                              <Button variant="ghost" size="sm" title="View full report">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
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