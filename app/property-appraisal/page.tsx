'use client'

import { useState } from 'react'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Home, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  CheckCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

interface AppraisalFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  propertyAddress: string
  suburb: string
  city: string
  propertyType: string
  bedrooms: string
  bathrooms: string
  landSize: string
  yearBuilt: string
  currentValue: string
  reasonForAppraisal: string
  additionalInfo: string
  preferredContactTime: string
  preferredContactMethod: string
}

export default function PropertyAppraisalPage() {
  const [formData, setFormData] = useState<AppraisalFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyAddress: '',
    suburb: '',
    city: 'Auckland',
    propertyType: 'house',
    bedrooms: '',
    bathrooms: '',
    landSize: '',
    yearBuilt: '',
    currentValue: '',
    reasonForAppraisal: 'selling',
    additionalInfo: '',
    preferredContactTime: 'anytime',
    preferredContactMethod: 'email'
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Submit the appraisal request
      const response = await fetch('/api/send-appraisal-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit appraisal request')
      }

      setSuccess(true)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        propertyAddress: '',
        suburb: '',
        city: 'Auckland',
        propertyType: 'house',
        bedrooms: '',
        bathrooms: '',
        landSize: '',
        yearBuilt: '',
        currentValue: '',
        reasonForAppraisal: 'selling',
        additionalInfo: '',
        preferredContactTime: 'anytime',
        preferredContactMethod: 'email'
      })
    } catch (error: any) {
      setError(error.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Appraisal Request Submitted!
              </h1>
              <p className="text-gray-600 mb-8">
                Thank you for your property appraisal request. Our team will review your information and contact you within 24 hours with a comprehensive market analysis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-[#FF5A5F] hover:bg-[#E8474B]">
                    Back to Home
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => setSuccess(false)}
                >
                  Submit Another Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Free Property Appraisal
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get an accurate market valuation of your property from our experienced team. 
              We provide comprehensive analysis to help you make informed decisions.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Market Analysis</h3>
              <p className="text-sm text-gray-600">
                Comprehensive market data and comparable sales analysis
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Accurate Valuation</h3>
              <p className="text-sm text-gray-600">
                Professional assessment based on current market conditions
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Detailed Report</h3>
              <p className="text-sm text-gray-600">
                Written report with recommendations and market insights
              </p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Home className="h-6 w-6 mr-3 text-[#FF5A5F]" />
              Property Appraisal Request
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+64 27 123 4567"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="propertyAddress">Property Address *</Label>
                    <Input
                      id="propertyAddress"
                      name="propertyAddress"
                      value={formData.propertyAddress}
                      onChange={handleInputChange}
                      placeholder="123 Queen Street"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="suburb">Suburb *</Label>
                      <Input
                        id="suburb"
                        name="suburb"
                        value={formData.suburb}
                        onChange={handleInputChange}
                        placeholder="Auckland Central"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                        required
                      >
                        <option value="Auckland">Auckland</option>
                        <option value="Wellington">Wellington</option>
                        <option value="Christchurch">Christchurch</option>
                        <option value="Hamilton">Hamilton</option>
                        <option value="Tauranga">Tauranga</option>
                        <option value="Dunedin">Dunedin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="propertyType">Property Type *</Label>
                      <select
                        id="propertyType"
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                        required
                      >
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="unit">Unit</option>
                        <option value="land">Land</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        name="bedrooms"
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        name="bathrooms"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="landSize">Land Size (sqm)</Label>
                      <Input
                        id="landSize"
                        name="landSize"
                        type="number"
                        value={formData.landSize}
                        onChange={handleInputChange}
                        placeholder="600"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearBuilt">Year Built</Label>
                      <Input
                        id="yearBuilt"
                        name="yearBuilt"
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        value={formData.yearBuilt}
                        onChange={handleInputChange}
                        placeholder="1990"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="currentValue">Current Estimated Value (Optional)</Label>
                    <Input
                      id="currentValue"
                      name="currentValue"
                      value={formData.currentValue}
                      onChange={handleInputChange}
                      placeholder="$800,000"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Appraisal Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appraisal Details</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="reasonForAppraisal">Reason for Appraisal *</Label>
                    <select
                      id="reasonForAppraisal"
                      name="reasonForAppraisal"
                      value={formData.reasonForAppraisal}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      required
                    >
                      <option value="selling">Considering selling</option>
                      <option value="refinancing">Refinancing</option>
                      <option value="insurance">Insurance purposes</option>
                      <option value="investment">Investment analysis</option>
                      <option value="curiosity">Just curious about value</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                      placeholder="Any recent renovations, unique features, or specific questions about your property..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                    <select
                      id="preferredContactMethod"
                      name="preferredContactMethod"
                      value={formData.preferredContactMethod}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="both">Both email and phone</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="preferredContactTime">Best Time to Contact</Label>
                    <select
                      id="preferredContactTime"
                      name="preferredContactTime"
                      value={formData.preferredContactTime}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                    >
                      <option value="anytime">Anytime</option>
                      <option value="morning">Morning (9am - 12pm)</option>
                      <option value="afternoon">Afternoon (12pm - 5pm)</option>
                      <option value="evening">Evening (5pm - 8pm)</option>
                      <option value="weekends">Weekends only</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">What You'll Receive</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-blue-800">Current market value estimate</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-blue-800">Comparable sales analysis</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-blue-800">Market trends report</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-blue-800">Rental yield analysis</span>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#FF5A5F] hover:bg-[#E8474B] py-4 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? 'Submitting Request...' : 'Get Free Appraisal'}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                By submitting this form, you agree to be contacted by Keyskeeper regarding your property appraisal.
                We respect your privacy and will not share your information with third parties.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need to speak with someone immediately?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:admin@keyskeeper.co.nz"
              className="flex items-center justify-center gap-2 text-[#FF5A5F] hover:text-[#E8474B] font-medium"
            >
              <Mail className="h-5 w-5" />
              admin@keyskeeper.co.nz
            </a>
            <a
              href="tel:+64277771486"
              className="flex items-center justify-center gap-2 text-[#FF5A5F] hover:text-[#E8474B] font-medium"
            >
              <Phone className="h-5 w-5" />
              +64 27 777 1486
            </a>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}