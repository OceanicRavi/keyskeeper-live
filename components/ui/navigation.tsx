'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  User, 
  Settings, 
  LogOut,
  Shield,
  Users,
  Wrench,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react'
import { supabase, User as UserProfile } from '@/lib/supabase'

export function TopNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [authUser, setAuthUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setAuthUser(session.user)
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthUser(session.user)
        await fetchUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null)
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }

      if (data) {
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setAuthUser(null)
      setUser(null)
      setShowUserMenu(false)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield
      case 'landlord': return Home
      case 'tenant': return Users
      case 'maintenance': return Wrench
      default: return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'landlord': return 'bg-orange-100 text-orange-800'
      case 'tenant': return 'bg-blue-100 text-blue-800'
      case 'maintenance': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'landlord': return '/landlord'
      case 'tenant': return '/tenant'
      case 'admin': return '/dashboard'
      case 'maintenance': return '/dashboard'
      default: return '/dashboard'
    }
  }

  const navigationItems = [
    { href: '/search', label: 'Search Properties', icon: Search },
    { href: '/landlord', label: 'For Landlords', icon: Home },
    { href: '/tenant', label: 'For Tenants', icon: Users },
  ]

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/keyskeeperlogo.png"
                alt="Keyskeeper"
                width={120}
                height={70}
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center text-sm font-medium transition-colors hover:text-[#FF5A5F] ${
                      pathname === item.href ? 'text-[#FF5A5F]' : 'text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* User Menu / Auth Buttons */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : authUser && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {user.role}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {user.full_name || 'User'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="mt-1">
                              <Badge className={getRoleColor(user.role)}>
                                {(() => {
                                  const RoleIcon = getRoleIcon(user.role)
                                  return (
                                    <>
                                      <RoleIcon className="h-3 w-3 mr-1" />
                                      {user.role}
                                    </>
                                  )
                                })()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          href={getDashboardPath(user.role)}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-3" />
                          Dashboard
                        </Link>
                        
                        <Link
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Account Settings
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-[#FF5A5F]">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-[#FF5A5F] hover:bg-[#E8474B] text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-[#FF5A5F] hover:bg-gray-50"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-[#FF5A5F] text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#FF5A5F]'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Link>
                )
              })}

              {authUser && user && (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <Link
                      href={getDashboardPath(user.role)}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#FF5A5F]"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-3" />
                      Dashboard
                    </Link>
                    
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#FF5A5F]"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Account Settings
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}

              {!authUser && (
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-[#FF5A5F]">
                      <User className="h-4 w-4 mr-3" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-[#FF5A5F] hover:bg-[#E8474B] text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  )
}

export function BottomNavigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authUser.id)
            .maybeSingle()
          
          if (profile) {
            setUser(profile)
          }
        }
      } catch (error) {
        console.error('Error fetching user for bottom nav:', error)
      }
    }

    fetchUser()
  }, [])

  const bottomNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    ...(user ? [
      { href: getDashboardPath(user.role), label: 'Dashboard', icon: LayoutDashboard },
      { href: '/profile', label: 'Profile', icon: User }
    ] : [
      { href: '/auth/login', label: 'Sign In', icon: User }
    ])
  ]

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'landlord': return '/landlord'
      case 'tenant': return '/tenant'
      case 'admin': return '/dashboard'
      case 'maintenance': return '/dashboard'
      default: return '/dashboard'
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb md:hidden z-50">
      <div className="grid grid-cols-4 h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive
                  ? 'text-[#FF5A5F] bg-red-50'
                  : 'text-gray-600 hover:text-[#FF5A5F] hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}