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
  User,
  MapPin,
  DollarSign,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  Users,
  Search
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
export const metadata = {
  robots: { index: false, follow: false }
}
interface TenantOnboardingData {
  currentLocation: string
  preferredLocations: string[]
  budgetMin: number
  budgetMax: number
  propertyTypes: string[]
  moveInDate: string
  leaseDuration: string
  roommates: string
  pets: boolean
  smoking: boolean
  employment: string
  income: string
  references: boolean
  preferences: string
}

export default function TenantOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [data, setData] = useState<TenantOnboardingData>({
    currentLocation: '',
    preferredLocations: [],
    budgetMin: 300,
    budgetMax: 800,
    propertyTypes: [],
    moveInDate: '',
    leaseDuration: '12months',
    roommates: 'open',
    pets: false,
    smoking: false,
    employment: '',
    income: '',
    references: false,
    preferences: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setData(prev => ({ ...prev, [name]: checked }))
  }

  const handleArrayToggle = (array: keyof Pick<TenantOnboardingData, 'preferredLocations' | 'propertyTypes'>, value: string) => {
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
            current_location: data.currentLocation,
            preferred_locations: data.preferredLocations,
            budget_min: data.budgetMin,
            budget_max: data.budgetMax,
            property_types: data.propertyTypes,
            move_in_date: data.moveInDate,
            lease_duration: data.leaseDuration,
            roommates: data.roommates,
            pets: data.pets,
            smoking: data.smoking,
            employment: data.employment,
            income: data.income,
            references: data.references,
            preferences: data.preferences
          }
        })
        .eq('auth_id', user.id)

      if (error) throw error

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
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
            Let's set up your tenant profile to find the perfect rental
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
            <span>Location</span>
            <span>Budget</span>
            <span>Preferences</span>
            <span>Complete</span>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Location Preferences */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="currentLocation">Current Location</Label>
                <Input
                  id="currentLocation"
                  name="currentLocation"
                  value={data.currentLocation}
                  onChange={handleInputChange}
                  placeholder="Where are you currently living?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="mb-3 block">Preferred Areas (select all that interest you)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Auckland Central', 'Ponsonby', 'Parnell', 'Newmarket',
                    'Wellington Central', 'Mount Victoria', 'Kelburn', 'Thorndon',
                    'Christchurch Central', 'Riccarton', 'Merivale', 'Ilam'
                  ].map((location) => (
                    <div
                      key={location}
                      onClick={() => handleArrayToggle('preferredLocations', location)}
                      className={`p-3 border rounded-lg cursor-pointer text-sm transition-colors ${data.preferredLocations.includes(location)
                          ? 'border-[#504746] bg-[#504746] text-white'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {location}
                    </div>
                  ))}
                </div>
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

        {/* Step 2: Budget and Timeline */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Budget and Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetMin">Minimum Budget (per week)</Label>
                  <Input
                    id="budgetMin"
                    name="budgetMin"
                    type="number"
                    value={data.budgetMin}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMax">Maximum Budget (per week)</Label>
                  <Input
                    id="budgetMax"
                    name="budgetMax"
                    type="number"
                    value={data.budgetMax}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="moveInDate">Preferred Move-in Date</Label>
                <Input
                  id="moveInDate"
                  name="moveInDate"
                  type="date"
                  value={data.moveInDate}
                  onChange={handleInputChange}
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="leaseDuration">Preferred Lease Duration</Label>
                <select
                  id="leaseDuration"
                  name="leaseDuration"
                  value={data.leaseDuration}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#504746] focus:border-[#504746]"
                >
                  <option value="6months">6 months</option>
                  <option value="12months">12 months</option>
                  <option value="18months">18 months</option>
                  <option value="24months">24 months</option>
                  <option value="flexible">Flexible</option>
                </select>
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

        {/* Step 3: Property Preferences */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Property Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Property Types (select all that interest you)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Room in shared house',
                    'Studio apartment',
                    'One bedroom apartment',
                    'Two bedroom apartment',
                    'Entire house',
                    'Townhouse'
                  ].map((type) => (
                    <div
                      key={type}
                      onClick={() => handleArrayToggle('propertyTypes', type)}
                      className={`p-3 border rounded-lg cursor-pointer text-sm transition-colors ${data.propertyTypes.includes(type)
                          ? 'border-[#504746] bg-[#504746] text-white'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="roommates">Roommate Preference</Label>
                <select
                  id="roommates"
                  name="roommates"
                  value={data.roommates}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#504746] focus:border-[#504746]"
                >
                  <option value="open">Open to roommates</option>
                  <option value="prefer">Prefer roommates</option>
                  <option value="no">No roommates</option>
                  <option value="existing">Have existing roommates</option>
                </select>
              </div>

              <div className="space-y-4">
                <Label>Additional Preferences</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pets"
                      checked={data.pets}
                      onCheckedChange={(checked) => handleCheckboxChange('pets', !!checked)}
                    />
                    <Label htmlFor="pets">I have pets</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smoking"
                      checked={data.smoking}
                      onCheckedChange={(checked) => handleCheckboxChange('smoking', !!checked)}
                    />
                    <Label htmlFor="smoking">I smoke</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="references"
                      checked={data.references}
                      onCheckedChange={(checked) => handleCheckboxChange('references', !!checked)}
                    />
                    <Label htmlFor="references">I have rental references available</Label>
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
                  Profile Complete!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your tenant profile is ready. You can now search for properties
                  and apply with just one click.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Next Steps:</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Search for properties in your preferred areas</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Book viewings instantly</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Apply to properties with one click</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Upload documents for faster applications</span>
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
                  {loading ? 'Setting up...' : 'Start Searching'}
                  <Search className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}