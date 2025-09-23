'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Home,
  User,
  Building,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Users,
  Shield,
  Mail
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface OnboardingData {
  businessName: string
  businessType: string
  propertyCount: string
  experience: string
  primaryLocation: string
  goals: string[]
  hasInsurance: boolean
  hasCompliance: boolean
  wantsManagement: boolean
  marketingChannels: string[]
}

export default function LandlordOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    businessType: 'individual',
    propertyCount: '1',
    experience: 'new',
    primaryLocation: '',
    goals: [],
    hasInsurance: false,
    hasCompliance: false,
    wantsManagement: false,
    marketingChannels: []
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setData(prev => ({ ...prev, [name]: checked }))
  }

  const handleArrayToggle = (array: keyof Pick<OnboardingData, 'goals' | 'marketingChannels'>, value: string) => {
    setData(prev => ({
      ...prev,
      [array]: prev[array].includes(value)
        ? prev[array].filter(item => item !== value)
        : [...prev[array], value]
    }))
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const handleComplete = async () => {
    setLoading(true)
    setError('')

    try {
      // Try multiple times to get the user (handle timing issues)
      let user = null
      for (let i = 0; i < 3; i++) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          user = authUser
          break
        }
        // Wait 1 second before retry
        if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (!user) {
        // If still no user, redirect to login
        router.push('/auth/login')
        return
      }

      // Update user profile with onboarding data
      const { error } = await supabase
        .from('users')
        .update({
          preferences: {
            onboarding_completed: true,
            business_name: data.businessName,
            business_type: data.businessType,
            property_count: data.propertyCount,
            experience: data.experience,
            primary_location: data.primaryLocation,
            goals: data.goals,
            has_insurance: data.hasInsurance,
            has_compliance: data.hasCompliance,
            wants_management: data.wantsManagement,
            marketing_channels: data.marketingChannels
          }
        })
        .eq('auth_id', user.id)

      if (error) throw error

      setOnboardingComplete(true)
    } catch (error: any) {
      setError(error.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  // Show completion screen with email verification
  if (onboardingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Account Created Successfully!
              </h1>

              <p className="text-lg text-gray-600 mb-8">
                Your landlord account has been set up. Please sign in to your dashboard.
              </p>

              <div className="space-y-4">
                <Link href="/auth/login">
                  <Button className="w-full bg-[#504746] hover:bg-[#06b6d4] py-3 text-lg">
                    Sign In to Your Account
                  </Button>
                </Link>

                <p className="text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => {
                      // In a real app, you'd trigger resend verification email
                      alert('Verification email resent!')
                    }}
                    className="text-[#504746] hover:text-[#06b6d4] underline"
                  >
                    resend verification email
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Keyskeeper
          </h1>
          <p className="text-gray-600">
            Let's set up your landlord account in just a few steps
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNumber ? 'bg-[#504746] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNumber ? 'bg-[#504746]' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Profile</span>
            <span>Business</span>
            <span>Goals</span>
            <span>Complete</span>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="businessName">Business/Trading Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={data.businessName}
                  onChange={handleInputChange}
                  placeholder="Your property business name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <select
                  id="businessType"
                  name="businessType"
                  value={data.businessType}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#504746] focus:border-[#504746]"
                >
                  <option value="individual">Individual Investor</option>
                  <option value="company">Company/Trust</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="primaryLocation">Primary Location</Label>
                <Input
                  id="primaryLocation"
                  name="primaryLocation"
                  value={data.primaryLocation}
                  onChange={handleInputChange}
                  placeholder="Auckland, Wellington, Christchurch..."
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={nextStep} className="bg-[#504746] hover:bg-[#06b6d4]">
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Property Portfolio */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Your Property Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="propertyCount">How many properties do you own?</Label>
                <select
                  id="propertyCount"
                  name="propertyCount"
                  value={data.propertyCount}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#504746] focus:border-[#504746]"
                >
                  <option value="1">1 property</option>
                  <option value="2-5">2-5 properties</option>
                  <option value="6-10">6-10 properties</option>
                  <option value="11-20">11-20 properties</option>
                  <option value="20+">20+ properties</option>
                </select>
              </div>

              <div>
                <Label htmlFor="experience">Property management experience</Label>
                <select
                  id="experience"
                  name="experience"
                  value={data.experience}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#504746] focus:border-[#504746]"
                >
                  <option value="new">New to property management</option>
                  <option value="1-2years">1-2 years experience</option>
                  <option value="3-5years">3-5 years experience</option>
                  <option value="5+years">5+ years experience</option>
                </select>
              </div>

              <div className="space-y-4">
                <Label>Current situation (check all that apply)</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasInsurance"
                      checked={data.hasInsurance}
                      onCheckedChange={(checked) => handleCheckboxChange('hasInsurance', !!checked)}
                    />
                    <Label htmlFor="hasInsurance">I have landlord insurance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasCompliance"
                      checked={data.hasCompliance}
                      onCheckedChange={(checked) => handleCheckboxChange('hasCompliance', !!checked)}
                    />
                    <Label htmlFor="hasCompliance">My properties are Healthy Homes compliant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wantsManagement"
                      checked={data.wantsManagement}
                      onCheckedChange={(checked) => handleCheckboxChange('wantsManagement', !!checked)}
                    />
                    <Label htmlFor="wantsManagement">I want full property management services</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep} className="bg-[#504746] hover:bg-[#06b6d4]">
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Goals and Preferences */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Your Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">What are your main goals? (select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Maximize rental income',
                    'Reduce vacancy periods',
                    'Automate tenant management',
                    'Ensure compliance',
                    'Minimize maintenance costs',
                    'Expand property portfolio',
                    'Improve tenant satisfaction',
                    'Reduce time spent managing'
                  ].map((goal) => (
                    <div
                      key={goal}
                      onClick={() => handleArrayToggle('goals', goal)}
                      className={`p-3 border rounded-lg cursor-pointer text-sm transition-colors ${data.goals.includes(goal)
                          ? 'border-[#504746] bg-[#504746] text-white'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {goal}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Where do you currently advertise properties?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Trade Me',
                    'Facebook Marketplace',
                    'Property management company',
                    'Word of mouth',
                    'University notice boards',
                    'Other websites',
                    'Print advertising',
                    'Not currently advertising'
                  ].map((channel) => (
                    <div
                      key={channel}
                      onClick={() => handleArrayToggle('marketingChannels', channel)}
                      className={`p-3 border rounded-lg cursor-pointer text-sm transition-colors ${data.marketingChannels.includes(channel)
                          ? 'border-[#504746] bg-[#504746] text-white'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {channel}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep} className="bg-[#504746] hover:bg-[#06b6d4]">
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete Setup */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Complete Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  You're all set!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your landlord account is ready. You can now start listing properties
                  and managing your rental business with Keyskeeper.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Next Steps:</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>List your first property</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Set up payment processing</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Configure compliance tracking</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Explore AI assistant features</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-[#504746] hover:bg-[#06b6d4]"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}