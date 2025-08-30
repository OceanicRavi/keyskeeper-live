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
  User,
  Settings
} from 'lucide-react'
import { supabase, User } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
          .single()

        if (profile) {
          setUser(profile)
          
          // Redirect to role-specific dashboard if available
          if (profile.role === 'landlord') {
            router.push('/landlord')
          } else if (profile.role === 'tenant') {
            router.push('/tenant')
          }
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
    return null // Will redirect to login
  }

  const roleConfig = {
    landlord: {
      title: 'Landlord Dashboard',
      description: 'Manage your properties and tenants',
      icon: Home,
      color: 'bg-orange-100 text-orange-800',
      href: '/landlord'
    },
    tenant: {
      title: 'Tenant Dashboard',
      description: 'Manage your rentals and payments',
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
      href: '/tenant'
    },
    maintenance: {
      title: 'Maintenance Dashboard',
      description: 'Handle property maintenance requests',
      icon: Wrench,
      color: 'bg-green-100 text-green-800',
      href: '/maintenance'
    },
    admin: {
      title: 'Admin Dashboard',
      description: 'Platform administration and oversight',
      icon: Shield,
      color: 'bg-purple-100 text-purple-800',
      href: '/admin'
    }
  }

  const currentRole = roleConfig[user.role as keyof typeof roleConfig]
  const RoleIcon = currentRole?.icon || User

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
              <User className="h-5 w-5 mr-2" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.full_name || 'User'}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <Badge className={currentRole?.color}>
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                    {user.is_verified && (
                      <Badge variant="secondary" className="ml-2">
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

        {/* Role-Specific Dashboard Access */}
        {currentRole && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <RoleIcon className="h-5 w-5 mr-2" />
                {currentRole.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {currentRole.description}
              </p>
              <Link href={currentRole.href}>
                <Button className="bg-[#FF5A5F] hover:bg-[#E8474B]">
                  Go to {user.role} Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/search">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
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
                  <Shield className="h-4 w-4 mr-2" />
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