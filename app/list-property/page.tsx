// app/list-property/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TopNavigation } from '@/components/ui/navigation'
import AddressAutocomplete, { AddressData } from '@/components/ui/address-autocomplete'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Upload, X, MapPin, Home, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface PropertyFormData {
  title: string
  description: string
  address: string
  suburb: string
  city: string
  postcode: string
  latitude?: number
  longitude?: number
  property_type: 'house' | 'apartment' | 'room' | 'studio' | 'townhouse'
  bedrooms: number
  bathrooms: number
  parking_spaces: number
  price_per_week: number
  bond_amount: number
  utilities_included: boolean
  internet_included: boolean
  is_furnished: boolean
  pets_allowed: boolean
  smoking_allowed: boolean
  available_from: string
  amenities: string[]
  images: string[]
}

const amenityOptions = [
  'WiFi', 'Parking', 'Garden', 'Balcony', 'Gym', 'Pool', 'Laundry', 
  'Dishwasher', 'Air Conditioning', 'Heating', 'Security', 'Storage'
]

export default function PropertyListingForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    address: '',
    suburb: '',
    city: 'Auckland',
    postcode: '',
    property_type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    parking_spaces: 0,
    price_per_week: 0,
    bond_amount: 0,
    utilities_included: false,
    internet_included: false,
    is_furnished: false,
    pets_allowed: false,
    smoking_allowed: false,
    available_from: new Date().toISOString().split('T')[0],
    amenities: [],
    images: []
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const handleAddressSelect = (addressData: AddressData) => {
    setFormData({
      ...formData,
      address: addressData.address,
      suburb: addressData.suburb,
      city: addressData.city,
      postcode: addressData.postcode,
      latitude: addressData.latitude,
      longitude: addressData.longitude
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({ ...formData, [name]: checked })
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    const updatedAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity]
    
    setFormData({ ...formData, amenities: updatedAmenities })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + imageFiles.length > 10) {
      setError('Maximum 10 images allowed')
      return
    }
    
    setImageFiles([...imageFiles, ...files])
    setError('')
  }

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.title || !formData.address || !formData.price_per_week) {
        throw new Error('Please fill in all required fields')
      }

      // For demo purposes, we'll create the property without image upload
      // In production, you'd upload images to storage first
      const propertyData = {
        ...formData,
        images: imageFiles.map((_, index) => `https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=800`), // Mock image URLs
        landlord_id: 'demo-landlord-id' // Replace with actual landlord ID from auth
      }

      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single()

      if (error) throw error

      router.push(`/properties/${data.id}?success=listed`)
    } catch (error: any) {
      setError(error.message || 'Failed to create property listing')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/landlord" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Landlord Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Property</h1>
          <p className="text-gray-600">Create a listing to find quality tenants</p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? 'bg-[#FF5A5F] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-[#FF5A5F]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Property Details</span>
            <span>Features & Pricing</span>
            <span>Photos & Review</span>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Property Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Property Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Modern 2BR Apartment in Auckland Central"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your property, its features, and what makes it special..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Property Address *
                  </Label>
                  <AddressAutocomplete
                    onAddressSelect={handleAddressSelect}
                    placeholder="Start typing the property address..."
                    initialValue={formData.address}
                  />
                  {formData.latitude && formData.longitude && (
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      Location verified
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="suburb" className="text-sm font-medium text-gray-700">
                      Suburb
                    </Label>
                    <Input
                      id="suburb"
                      name="suburb"
                      value={formData.suburb}
                      onChange={handleInputChange}
                      placeholder="Suburb"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                      City
                    </Label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                    >
                      <option value="Auckland">Auckland</option>
                      <option value="Wellington">Wellington</option>
                      <option value="Christchurch">Christchurch</option>
                      <option value="Hamilton">Hamilton</option>
                      <option value="Tauranga">Tauranga</option>
                      <option value="Dunedin">Dunedin</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                      Postcode
                    </Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      placeholder="1010"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="property_type" className="text-sm font-medium text-gray-700">
                    Property Type
                  </Label>
                  <select
                    id="property_type"
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="studio">Studio</option>
                    <option value="room">Room</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bedrooms" className="text-sm font-medium text-gray-700">
                      Bedrooms
                    </Label>
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
                    <Label htmlFor="bathrooms" className="text-sm font-medium text-gray-700">
                      Bathrooms
                    </Label>
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
                  <div>
                    <Label htmlFor="parking_spaces" className="text-sm font-medium text-gray-700">
                      Parking
                    </Label>
                    <Input
                      id="parking_spaces"
                      name="parking_spaces"
                      type="number"
                      min="0"
                      value={formData.parking_spaces}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep} className="bg-[#FF5A5F] hover:bg-[#E8474B]">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Features & Pricing */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Features & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_per_week" className="text-sm font-medium text-gray-700">
                      Weekly Rent (NZD) *
                    </Label>
                    <Input
                      id="price_per_week"
                      name="price_per_week"
                      type="number"
                      min="0"
                      value={formData.price_per_week}
                      onChange={handleInputChange}
                      placeholder="500"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bond_amount" className="text-sm font-medium text-gray-700">
                      Bond Amount (NZD)
                    </Label>
                    <Input
                      id="bond_amount"
                      name="bond_amount"
                      type="number"
                      min="0"
                      value={formData.bond_amount}
                      onChange={handleInputChange}
                      placeholder="2000"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="available_from" className="text-sm font-medium text-gray-700">
                    Available From
                  </Label>
                  <Input
                    id="available_from"
                    name="available_from"
                    type="date"
                    value={formData.available_from}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Property Features
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_furnished"
                        name="is_furnished"
                        checked={formData.is_furnished}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, is_furnished: !!checked })
                        }
                      />
                      <Label htmlFor="is_furnished" className="text-sm">Furnished</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="utilities_included"
                        name="utilities_included"
                        checked={formData.utilities_included}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, utilities_included: !!checked })
                        }
                      />
                      <Label htmlFor="utilities_included" className="text-sm">Utilities Included</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="internet_included"
                        name="internet_included"
                        checked={formData.internet_included}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, internet_included: !!checked })
                        }
                      />
                      <Label htmlFor="internet_included" className="text-sm">Internet Included</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pets_allowed"
                        name="pets_allowed"
                        checked={formData.pets_allowed}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, pets_allowed: !!checked })
                        }
                      />
                      <Label htmlFor="pets_allowed" className="text-sm">Pets Allowed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smoking_allowed"
                        name="smoking_allowed"
                        checked={formData.smoking_allowed}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, smoking_allowed: !!checked })
                        }
                      />
                      <Label htmlFor="smoking_allowed" className="text-sm">Smoking Allowed</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Amenities
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {amenityOptions.map((amenity) => (
                      <div
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`p-2 border rounded-lg cursor-pointer text-center text-sm transition-colors ${
                          formData.amenities.includes(amenity)
                            ? 'border-[#FF5A5F] bg-[#FF5A5F] text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep} className="bg-[#FF5A5F] hover:bg-[#E8474B]">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Photos & Review */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Photos & Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Property Photos (Max 10)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-600 mb-4">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-[#FF5A5F] hover:text-[#E8474B] font-medium">
                            Click to upload
                          </span>{' '}
                          or drag and drop
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                    </div>
                  </div>

                  {imageFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Review Your Listing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span className="font-medium">{formData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{formData.address}, {formData.suburb}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{formData.property_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bedrooms/Bathrooms:</span>
                      <span className="font-medium">{formData.bedrooms} bed • {formData.bathrooms} bath</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly Rent:</span>
                      <span className="font-medium text-[#FF5A5F]">${formData.price_per_week}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available From:</span>
                      <span className="font-medium">{new Date(formData.available_from).toLocaleDateString('en-NZ')}</span>
                    </div>
                    {formData.amenities.length > 0 && (
                      <div className="pt-2">
                        <span className="text-gray-600 text-sm">Amenities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.amenities.map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#FF5A5F] hover:bg-[#E8474B]"
                  >
                    {loading ? 'Creating Listing...' : 'Publish Listing'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  )
}