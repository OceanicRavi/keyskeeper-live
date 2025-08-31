'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  LayoutDashboard,
  ChevronDown
} from 'lucide-react'
import { supabase, User } from '@/lib/supabase'

export function TopNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authUser.id)
            .maybeSingle()

          setUser(profile)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle()
        
        setUser(profile)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getDashboardPath = (role: string) => {
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

  const navigation = [
    { name: 'Search', href: '/search', icon: Search },
    { name: 'For Landlords', href: '/landlord', icon: Home },
    { name: 'For Tenants', href: '/tenant', icon: Users },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/keyskeeperlogo.png"
                alt="Keyskeeper"
                width={120}
                height={70}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center text-sm font-medium transition-colors hover:text-[#FF5A5F] ${
                    pathname === item.href ? 'text-[#FF5A5F]' : 'text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                {/* Dashboard Button */}
                <Link href={getDashboardPath(user.role)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name || 'User'}
                        </p>
                        <div className="flex items-center">
                          <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-medium">{user.full_name || 'User'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardPath(user.role)} className="flex items-center">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    
                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-[#FF5A5F] hover:bg-[#E8474B]">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.href
                        ? 'bg-[#FF5A5F] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
              
              {user && (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Link
                      href={getDashboardPath(user.role)}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link
                        href="/admin/users"
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </>
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
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authUser.id)
            .maybeSingle()

          setUser(profile)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle()
        
        setUser(profile)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getDashboardPath = (role: string) => {
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

  const navigation = user ? [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Dashboard', href: getDashboardPath(user.role), icon: LayoutDashboard },
    { name: 'Profile', href: '/profile', icon: User },
  ] : [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Landlords', href: '/landlord', icon: Home },
    { name: 'Tenants', href: '/tenant', icon: Users },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50 md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-[#FF5A5F] bg-red-50'
                  : 'text-gray-600 hover:text-[#FF5A5F]'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-[#FF5A5F]' : ''}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}