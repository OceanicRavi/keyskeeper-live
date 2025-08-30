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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* New Zealand Map Background */}
      <div className="absolute inset-0 opacity-5">
        <svg
          viewBox="0 0 1200 800"
          className="w-full h-full object-contain"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* North Island - Geometric Polygon Style */}
          <polygon
            points="600,200 650,180 700,190 720,220 740,250 760,280 750,320 730,350 700,380 670,400 640,420 610,440 580,430 560,410 540,380 530,350 540,320 560,290 580,260 590,230"
            fill="url(#loginGradient1)"
            stroke="#10B981"
            strokeWidth="2"
            opacity="0.8"
          />
          
          {/* South Island - Geometric Polygon Style */}
          <polygon
            points="580,460 620,450 660,470 690,500 710,540 720,580 710,620 690,650 660,680 630,700 600,710 570,700 540,680 520,650 510,620 520,580 540,540 560,500"
            fill="url(#loginGradient2)"
            stroke="#3B82F6"
            strokeWidth="2"
            opacity="0.8"
          />
          
          {/* Stewart Island */}
          <polygon
            points="590,720 610,715 620,725 615,735 605,740 595,735"
            fill="url(#loginGradient3)"
            stroke="#8B5CF6"
            strokeWidth="1"
            opacity="0.8"
          />
          
          {/* Gradients for colorful effect */}
          <defs>
            <linearGradient id="loginGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.6"/>
              <stop offset="50%" stopColor="#059669" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#047857" stopOpacity="0.6"/>
            </linearGradient>
            <linearGradient id="loginGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6"/>
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.6"/>
            </linearGradient>
            <linearGradient id="loginGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.6"/>
            </linearGradient>
          </defs>
          
          {/* Decorative dots for major cities */}
          <circle cx="640" cy="280" r="4" fill="#FF5A5F" opacity="0.8"/> {/* Auckland */}
          <circle cx="620" cy="380" r="3" fill="#FF5A5F" opacity="0.8"/> {/* Wellington */}
          <circle cx="650" cy="580" r="3" fill="#FF5A5F" opacity="0.8"/> {/* Christchurch */}
          <circle cx="580" cy="320" r="2" fill="#FF5A5F" opacity="0.8"/> {/* Hamilton */}
        </svg>
      </div>
      
      {/* Content overlay */}
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
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
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
  )
}