'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, ArrowLeft, Home, Users, Wrench, Shield, Mail, CheckCircle } from 'lucide-react'
import { supabase, UserRole } from '@/lib/supabase'

const roleConfig = {
  landlord: {
    title: 'Landlord Account',
    description: 'Manage properties and tenants',
    icon: Home,
    color: 'bg-orange-100 text-orange-800'
  },
  tenant: {
    title: 'Tenant Account',
    description: 'Find and manage rentals',
    icon: Users,
    color: 'bg-blue-100 text-blue-800'
  },
  maintenance: {
    title: 'Maintenance Account',
    description: 'Handle property maintenance',
    icon: Wrench,
    color: 'bg-green-100 text-green-800'
  },
  admin: {
    title: 'Admin Account',
    description: 'Platform administration',
    icon: Shield,
    color: 'bg-purple-100 text-purple-800'
  }
}

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') as UserRole || 'tenant'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: defaultRole
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showEmailExists, setShowEmailExists] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShowEmailExists(false)

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle()

      if (existingUser) {
        setShowEmailExists(true)
        setLoading(false)
        return
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            auth_id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone,
            role: formData.role,
            is_verified: false
          })

        if (profileError) throw profileError

        // Redirect to onboarding based on role
        if (formData.role === 'landlord') {
          router.push('/onboarding/landlord')
        } else if (formData.role === 'tenant') {
          router.push('/onboarding/tenant')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  const currentRole = roleConfig[formData.role as UserRole]
  const RoleIcon = currentRole.icon

  // Show email exists error with sign in option
  if (showEmailExists) {
    return (
      <div className="min-h-screen bg-gray-50 flex relative overflow-hidden">
        <div 
          className="absolute right-0 top-0 w-1/2 h-full bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: 'url("/nz-map.png")',
            backgroundPosition: 'center right'
          }}
        />
        
        <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to home
            </Link>
            
            <div className="text-center">
              <Image
                src="/keyskeeper.png"
                alt="Keyskeeper"
                width={120}
                height={70}
                className="h-12 w-auto mx-auto mb-6"
              />
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <Card className="shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-orange-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Email Already Registered
                </h2>
                
                <p className="text-gray-600 mb-6">
                  An account with <strong>{formData.email}</strong> already exists. 
                  Please sign in to your existing account instead.
                </p>

                <div className="space-y-4">
                  <Link href="/auth/login">
                    <Button className="w-full bg-[#FF5A5F] hover:bg-[#E8474B]">
                      Sign In to Existing Account
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEmailExists(false)}
                    className="w-full"
                  >
                    Try Different Email
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Forgot your password?{' '}
                    <Link href="/auth/forgot-password" className="text-[#FF5A5F] hover:text-[#E8474B]">
                      Reset it here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative overflow-hidden">
      {/* New Zealand Map Background - Right Side */}
      <div 
        className="absolute right-0 top-0 w-1/2 h-full bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: 'url("/nz-map.png")',
          backgroundPosition: 'center right'
        }}
      />
      
      {/* Signup Form - Left Side */}
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>
        
        <div className="text-center">
          <Image
            src="/keyskeeper.png"
            alt="Keyskeeper"
            width={120}
            height={70}
            className="h-12 w-auto mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-gray-900">
            Join Keyskeeper
          </h2>
          <p className="mt-2 text-gray-600">
            Create your account to get started
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">Create Account</CardTitle>
            <div className="flex items-center justify-center mt-4">
              <Badge className={currentRole.color}>
                <RoleIcon className="h-3 w-3 mr-1" />
                {currentRole.title}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                  required
                >
                  <option value="tenant">Tenant - Looking for rentals</option>
                  <option value="landlord">Landlord - Property owner</option>
                  <option value="maintenance">Maintenance - Service provider</option>
                </select>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+64 27 123 4567"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pr-10"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#FF5A5F] hover:bg-[#E8474B] text-white py-3"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Sign in instead
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-[#FF5A5F] hover:text-[#E8474B]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#FF5A5F] hover:text-[#E8474B]">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{' '}
            <a href="mailto:admin@keyskeeper.co.nz" className="text-[#FF5A5F] hover:text-[#E8474B]">
              admin@keyskeeper.co.nz
            </a>
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}