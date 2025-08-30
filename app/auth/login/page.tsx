'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user profile to determine role and redirect
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', data.user.id)
        .single()

      // Redirect based on role
      if (profile?.role === 'landlord') {
        router.push('/dashboard/landlord')
      } else if (profile?.role === 'tenant') {
        router.push('/dashboard/tenant')
      } else if (profile?.role === 'maintenance') {
        router.push('/dashboard/maintenance')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
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
      
      {/* Login Form - Left Side */}
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
          
          <div className="text-center">
            <Image
              src="/keyskeeperlogo.png"
              alt="Keyskeeper"
              width={120}
              height={70}
              className="h-12 w-auto mx-auto mb-6"
            />
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-gray-600">
              Sign in to your Keyskeeper account
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-xl">Sign In</CardTitle>
            </CardHeader>
            
            <CardContent>
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pr-10"
                      placeholder="Enter your password"
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="text-[#FF5A5F] hover:text-[#E8474B]">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#FF5A5F] hover:bg-[#E8474B] text-white py-3"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Don&apos;t have an account?</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link href="/auth/signup">
                    <Button variant="outline" className="w-full">
                      Create new account
                    </Button>
                  </Link>
                </div>
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