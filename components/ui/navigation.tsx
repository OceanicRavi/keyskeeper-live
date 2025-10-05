// File: components/ui/navigation.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Menu,
  X,
  Home,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Users,
  Wrench,
  Plus,
  Eye,
  BarChart3
} from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'
import { supabase, User as UserProfile, UserRole } from '@/lib/supabase'

// Helper function to get dashboard path based on role - defined before components
const getDashboardPath = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/dashboard'
    case 'landlord':
      return '/dashboard'
    case 'tenant':
      return '/dashboard'
    case 'maintenance':
      return '/dashboard'
    default:
      return '/dashboard'
  }
}

// Helper function to get role icon
const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return Shield
    case 'landlord':
      return Home
    case 'tenant':
      return Users
    case 'maintenance':
      return Wrench
    default:
      return User
  }
}

// Helper function to get role color
const getRoleColor = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800'
    case 'landlord':
      return 'bg-orange-100 text-orange-800'
    case 'tenant':
      return 'bg-blue-100 text-blue-800'
    case 'maintenance':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function TopNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Get initial session and user
    const getInitialAuth = async () => {
      try {
        // Check current session first
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setIsAuthenticated(true)

          // Get user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .maybeSingle()

          if (profile) {
            setUser(profile)
          }
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching initial auth:', error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)

      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true)

        // Get user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle()

        if (profile) {
          setUser(profile)
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setUser(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setIsAuthenticated(false)
      setIsUserMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const closeMenus = () => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.user-menu') && !target.closest('.mobile-menu')) {
        closeMenus()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const RoleIcon = user ? getRoleIcon(user.role) : User

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/keyskeeper.png"
              alt="Keyskeeper"
              width={120}
              height={70}
              className="h-14 w-auto"
            />
            <span className="text-3xl font-bold text-gray-700 drop-shadow-lg hover:text-[#504746] transition-colors duration-300">
              <span style={{ color: '#504746' }}>K</span>eys<span style={{ color: '#504746' }}>K</span>eeper
            </span>
          </Link>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : isAuthenticated && user ? (
              <div className="relative user-menu">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <RoleIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.full_name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center mt-2">
                        <Badge className={getRoleColor(user.role)}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {user.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        href={getDashboardPath(user.role)}
                        onClick={closeMenus}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <BarChart3 className="h-4 w-4 mr-3" />
                        Dashboard
                      </Link>

                      {user.role === 'landlord' && (
                        <Link
                          href="/list-property"
                          onClick={closeMenus}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4 mr-3" />
                          List Property
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          href="/admin/users"
                          onClick={closeMenus}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Users className="h-4 w-4 mr-3" />
                          Manage Users
                        </Link>
                      )}

                      <Link
                        href="/search"
                        onClick={closeMenus}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Search className="h-4 w-4 mr-3" />
                        Browse Properties
                      </Link>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-[#504746]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-[#504746] hover:bg-[#06b6d4] text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-[#504746] hover:bg-gray-50"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 bg-white">
              {isAuthenticated && user && (
                <div className="px-3 py-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <RoleIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <Badge className={`${getRoleColor(user.role)} mt-1`}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <Link
                href="/search"
                onClick={closeMenus}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#504746] hover:bg-gray-50 rounded-md"
              >
                Browse Properties
              </Link>

              {/* Fixed: Change /landlord to /landlord (marketing page) */}
              <Link
                href="/landlord"
                onClick={closeMenus}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#504746] hover:bg-gray-50 rounded-md"
              >
                For Landlords
              </Link>

              {/* Fixed: Change /tenant to /tenant (marketing page) */}
              <Link
                href="/tenant"
                onClick={closeMenus}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#504746] hover:bg-gray-50 rounded-md"
              >
                For Tenants
              </Link>

              <Link
                href="/property-appraisal"
                onClick={closeMenus}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#504746] hover:bg-gray-50 rounded-md"
              >
                Free Appraisal
              </Link>

              {isAuthenticated && user ? (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <Link
                    href={getDashboardPath(user.role)}
                    onClick={closeMenus}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-[#504746] hover:bg-gray-50 rounded-md"
                  >
                    <BarChart3 className="h-5 w-5 mr-3" />
                    Dashboard
                  </Link>

                  {user.role === 'landlord' && (
                    <Link
                      href="/list-property"
                      onClick={closeMenus}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-[#504746] hover:bg-gray-50 rounded-md"
                    >
                      <Plus className="h-5 w-5 mr-3" />
                      List Property
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      href="/admin/users"
                      onClick={closeMenus}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-[#504746] hover:bg-gray-50 rounded-md"
                    >
                      <Users className="h-5 w-5 mr-3" />
                      Manage Users
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                  <Link href="/auth/login" onClick={closeMenus}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-[#504746]">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={closeMenus}>
                    <Button className="w-full bg-[#504746] hover:bg-[#06b6d4] text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export function BottomNavigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  // components/ui/navigation.tsx - Add these to footer
  const importantLinks = [
    { href: '/search', text: 'Search Properties', priority: 'high' },
    { href: '/landlord', text: 'For Landlords', priority: 'high' },
    { href: '/tenant', text: 'For Tenants', priority: 'high' },
    { href: '/property-appraisal', text: 'Property Appraisal' },
    { href: '/maintenance-request', text: 'Maintenance Request' },
    // Location pages
    { href: '/search?location=Auckland', text: 'Properties in Auckland' },
    { href: '/search?location=Wellington', text: 'Properties in Wellington' },
    { href: '/search?location=Christchurch', text: 'Properties in Christchurch' },
  ]
  useEffect(() => {
    const getInitialAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setIsAuthenticated(true)

          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .maybeSingle()

          if (profile) {
            setUser(profile)
          }
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setIsAuthenticated(false)
        setUser(null)
      }
    }

    getInitialAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true)

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle()

        if (profile) {
          setUser(profile)
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      active: pathname === '/'
    },
    {
      href: '/search',
      icon: Search,
      label: 'Search',
      active: pathname === '/search'
    },
    {
      href: isAuthenticated && user ? getDashboardPath(user.role) : '/dashboard',
      icon: BarChart3,
      label: 'Dashboard',
      active: pathname === '/dashboard' || pathname === '/landlord' || pathname === '/tenant'
    },
    {
      href: isAuthenticated && user ? '/profile' : '/auth/login',
      icon: User,
      label: isAuthenticated && user ? 'Profile' : 'Sign In',
      active: pathname === '/profile' || pathname === '/auth/login' || pathname === '/auth/signup'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb md:hidden z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${item.active
                ? 'text-[#504746] bg-red-50'
                : 'text-gray-600 hover:text-[#504746] hover:bg-gray-50'
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