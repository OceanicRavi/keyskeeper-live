// File: app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, ArrowLeft, Mail, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showEmailVerificationError, setShowEmailVerificationError] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShowEmailVerificationError(false)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Get user profile to determine role and redirect
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('auth_id', data.user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          setShowEmailVerificationError(true)
          setLoading(false)
          return
        }

        // If no profile exists, user likely needs to verify email
        if (!profile) {
          console.log('No user profile found - showing email verification screen')
          setShowEmailVerificationError(true)
          setLoading(false)
          return
        }

        // Check if user is verified
/*         if (profile && !profile.is_verified) {
          console.log('User profile found but not verified')
          setShowEmailVerificationError(true)
          setLoading(false)
          return
        } */

        // Always redirect to /dashboard - let the dashboard handle role-specific content
        console.log('Redirecting user with role:', profile.role, 'to dashboard')
        router.push('/dashboard')

      } else {
        throw new Error('Authentication failed - no user data returned')
      }
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else if (error.message.includes('Email not confirmed')) {
        setShowEmailVerificationError(true)
        setLoading(false)
        return
      } else {
        setError(error.message || 'An error occurred during login')
      }
    } finally {
      setLoading(false)
    }
  }

  // Show email verification error
  if (showEmailVerificationError) {
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
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Email Verification Required
                </h2>

                <p className="text-gray-600 mb-6">
                  Please verify your email address before signing in. We may have sent a verification
                  link to <strong>{email}</strong>.
                </p>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Mail className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Check Your Email</span>
                  </div>
                  <p className="text-xs text-blue-800">
                    Look for an email from Keyskeeper (may be from supabase.io domain).
                    Check your spam/junk folder if you don't see it in your inbox.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => setShowEmailVerificationError(false)}
                    className="w-full bg-[#504746] hover:bg-[#06b6d4]"
                  >
                    Try Signing In Again
                  </Button>

                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        setLoading(true)

                        // Try to resend verification email
                        const { error } = await supabase.auth.resend({
                          type: 'signup',
                          email: email,
                        })

                        if (error) {
                          console.error('Resend error:', error)

                          // Handle different error types
                          if (error.message.includes('rate limit') ||
                            error.message.includes('too many requests')) {
                            alert('Rate limit reached. Supabase allows only 4 emails per hour on the free plan. Please try again later or contact support.')
                          } else if (error.message.includes('User not found')) {
                            alert('User not found. Please try signing up again.')
                          } else {
                            alert('Error: ' + error.message + '\n\nNote: Email delivery issues are common with Supabase\'s default email service. Please contact admin@keyskeeper.co.nz for manual verification.')
                          }
                        } else {
                          alert('Verification request sent!\n\nIMPORTANT:\n• Check your spam/junk folder\n• Look for emails from supabase.io domain\n• Default email service has delivery limitations\n• Contact admin@keyskeeper.co.nz if you don\'t receive it within 10 minutes')
                        }
                      } catch (error: any) {
                        console.error('Unexpected error:', error)
                        alert('Unable to send verification email due to service limitations. Please contact admin@keyskeeper.co.nz for immediate verification.')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Need help? Contact us at{' '}
                    <a href="mailto:admin@keyskeeper.co.nz" className="text-[#504746] hover:text-[#06b6d4]">
                      admin@keyskeeper.co.nz
                    </a>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    For immediate access, we can manually verify your account.
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

      {/* Login Form - Left Side */}
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
                    <Link href="/auth/forgot-password" className="text-[#504746] hover:text-[#06b6d4]">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#504746] hover:bg-[#06b6d4] text-white py-3"
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
              <a href="mailto:admin@keyskeeper.co.nz" className="text-[#504746] hover:text-[#06b6d4]">
                admin@keyskeeper.co.nz
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}