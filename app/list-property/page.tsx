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
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Upload, X, MapPin, Home, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
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
}

const amenityOptions = [
  'WiFi', 'Parking', 'Garden', 'Balcony', 'Gym', 'Pool', 'Laundry', 
  'Dishwasher', 'Air Conditioning', 'Heating', 'Security', 'Storage'
]

// Helper function to generate unique filename
const generateUniqueFileName = (file: File): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  const extension = file.name.split('.').pop()?.toLowerCase()
  return `property-${timestamp}-${random}.${extension}`
}

// Helper function to validate file
const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `Invalid file type: ${file.type}. Only JPG, PNG, and WebP are allowed.` }
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 5MB.` }
  }
  
  return { isValid: true }
}

// Enhanced image upload function with proper error handling
const uploadImageToSupabase = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  // Validate file first
  const validation = validateImageFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  const fileName = generateUniqueFileName(file)
  const filePath = `property-images/${fileName}`
  
  console.log(`Uploading ${file.name} as ${filePath} (${(file.size / 1024).toFixed(1)}KB)`)
  
  try {
    // Upload file with progress tracking if supported
    const uploadOptions = {
      cacheControl: '31536000', // 1 year
      upsert: false
    }
    
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(filePath, file, uploadOptions)
    
    if (error) {
      console.error('Upload error details:', error)
      if (error.message.includes('The resource already exists')) {
        // File already exists, try with new name
        const newFileName = generateUniqueFileName(file)
        const newFilePath = `property-images/${newFileName}`
        const { data: retryData, error: retryError } = await supabase.storage
          .from('property-images')
          .upload(newFilePath, file, uploadOptions)
        
        if (retryError) {
          throw new Error(`Upload failed: ${retryError.message}`)
        }
        
        // Get public URL for the new file
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(newFilePath)
        
        console.log(`Successfully uploaded ${file.name} to ${newFilePath}`)
        return publicUrl
      } else {
        throw new Error(`Upload failed: ${error.message}`)
      }
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath)
    
    console.log(`Successfully uploaded ${file.name} to ${filePath}`)
    console.log(`Public URL: ${publicUrl}`)
    
    return publicUrl
  } catch (error) {
    console.error('Image upload error:', error)
    throw error
  }
}

// Simple progress bar component to replace the problematic one
const SimpleProgressBar = ({ value, className = "" }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out" 
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
)

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
    amenities: []
  })
  
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [individualProgress, setIndividualProgress] = useState<{ [key: string]: number }>({})

  // Step validation function
  const validateStep = (stepNumber: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    switch (stepNumber) {
      case 1: // Property Details
        if (!formData.title.trim()) errors.push('Property title is required')
        if (!formData.address.trim()) errors.push('Property address is required')
        if (!formData.suburb.trim()) errors.push('Suburb is required')
        if (!formData.city.trim()) errors.push('City is required')
        break
        
      case 2: // Features & Pricing
        if (!formData.price_per_week || formData.price_per_week <= 0) {
          errors.push('Weekly rent must be greater than $0')
        }
        if (!formData.available_from) errors.push('Available from date is required')
        break
        
      case 3: // Photos & Review - no required fields
        break
        
      default:
        break
    }
    
    return { isValid: errors.length === 0, errors }
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

  // Enhanced image upload with validation
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + imageFiles.length + uploadedImageUrls.length > 10) {
      setError('Maximum 10 images allowed')
      return
    }
    
    // Validate each file
    const invalidFiles: string[] = []
    const validFiles: File[] = []
    
    files.forEach(file => {
      const validation = validateImageFile(file)
      if (validation.isValid) {
        validFiles.push(file)
      } else {
        invalidFiles.push(`${file.name}: ${validation.error}`)
      }
    })
    
    if (invalidFiles.length > 0) {
      setError(`Invalid files: ${invalidFiles.join(', ')}`)
      return
    }
    
    if (validFiles.length > 0) {
      setImageFiles([...imageFiles, ...validFiles])
      setError('') // Clear any previous errors
    }
    
    // Reset the input
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index)
    setImageFiles(newImageFiles)
  }

  // Remove uploaded image (you might want to delete from storage too)
  const removeUploadedImage = (index: number) => {
    const newUploadedUrls = uploadedImageUrls.filter((_, i) => i !== index)
    setUploadedImageUrls(newUploadedUrls)
  }

  // Upload all images with progress tracking
  const uploadAllImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) {
      return uploadedImageUrls // Return already uploaded images
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    const newUploadedUrls: string[] = [...uploadedImageUrls]
    
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const fileKey = `${file.name}-${i}`
        
        // Set individual progress
        setIndividualProgress(prev => ({ ...prev, [fileKey]: 0 }))
        
        try {
          const imageUrl = await uploadImageToSupabase(file, (progress) => {
            setIndividualProgress(prev => ({ ...prev, [fileKey]: progress }))
          })
          
          newUploadedUrls.push(imageUrl)
          
          // Update overall progress
          const overallProgress = Math.round(((i + 1) / imageFiles.length) * 100)
          setUploadProgress(overallProgress)
          
          setIndividualProgress(prev => ({ ...prev, [fileKey]: 100 }))
          
        } catch (uploadError: any) {
          console.error(`Failed to upload ${file.name}:`, uploadError)
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }
      }
      
      setUploadedImageUrls(newUploadedUrls)
      setImageFiles([]) // Clear the files array since they're now uploaded
      return newUploadedUrls
      
    } catch (error) {
      console.error('Batch upload failed:', error)
      throw error
    } finally {
      setIsUploading(false)
      setIndividualProgress({})
    }
  }

  const nextStep = () => {
    const validation = validateStep(step)
    
    if (!validation.isValid) {
      setError(validation.errors.join(', '))
      return
    }
    
    setError('')
    setStep(step + 1)
  }
  
  const prevStep = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all steps before submission
    const step1Validation = validateStep(1)
    const step2Validation = validateStep(2)
    
    const allErrors = [...step1Validation.errors, ...step2Validation.errors]
    
    if (allErrors.length > 0) {
      setError('Please fix the following issues: ' + allErrors.join(', '))
      return
    }
    
    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')
      
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single()
      
      if (profileError || !userProfile) {
        throw new Error('User profile not found')
      }
      
      // Upload all images first
      let finalImageUrls: string[] = []
      
      if (imageFiles.length > 0 || uploadedImageUrls.length > 0) {
        try {
          finalImageUrls = await uploadAllImages()
        } catch (uploadError: any) {
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }
      }
      
      // If no images were uploaded, use a default placeholder
      if (finalImageUrls.length === 0) {
        console.warn('No images uploaded, using placeholder')
        finalImageUrls = ['https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=800']
      }
      
      // Create property data
      const propertyData = {
        title: formData.title,
        description: formData.description || null,
        address: formData.address,
        suburb: formData.suburb,
        city: formData.city,
        postcode: formData.postcode || null,
        country: 'New Zealand',
        property_type: formData.property_type,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        parking_spaces: formData.parking_spaces,
        price_per_week: formData.price_per_week,
        bond_amount: formData.bond_amount || null,
        utilities_included: formData.utilities_included,
        internet_included: formData.internet_included,
        is_furnished: formData.is_furnished,
        pets_allowed: formData.pets_allowed,
        smoking_allowed: formData.smoking_allowed,
        available_from: formData.available_from,
        amenities: formData.amenities,
        images: finalImageUrls,
        landlord_id: userProfile.id,
        is_available: true,
        compliance_status: 'pending' as const
      }

      console.log('Creating property with data:', propertyData)

      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single()

      if (error) {
        console.error('Property creation error:', error)
        throw error
      }

      console.log('Property created successfully:', data)
      
      // Success! Redirect to the property page
      router.push(`/properties/${data.id}?success=listed`)
      
    } catch (error: any) {
      console.error('Error creating property:', error)
      setError(error.message || 'Failed to create property listing')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
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
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Upload className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Uploading images...</p>
                  <SimpleProgressBar value={uploadProgress} className="mt-2" />
                  <p className="text-xs text-blue-700 mt-1">{uploadProgress}% complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                    className={`mt-1 ${!formData.title.trim() ? 'border-red-300' : ''}`}
                  />
                  {!formData.title.trim() && (
                    <p className="text-red-500 text-xs mt-1">Property title is required</p>
                  )}
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
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Queen Street"
                    className={`${!formData.address.trim() ? 'border-red-300' : ''}`}
                  />
                  {!formData.address.trim() && (
                    <p className="text-red-500 text-xs mt-1">Property address is required</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="suburb" className="text-sm font-medium text-gray-700">
                      Suburb *
                    </Label>
                    <Input
                      id="suburb"
                      name="suburb"
                      value={formData.suburb}
                      onChange={handleInputChange}
                      placeholder="Auckland Central"
                      className={`mt-1 ${!formData.suburb.trim() ? 'border-red-300' : ''}`}
                    />
                    {!formData.suburb.trim() && (
                      <p className="text-red-500 text-xs mt-1">Suburb is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                      City *
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
                      min="1"
                      value={formData.price_per_week}
                      onChange={handleInputChange}
                      placeholder="500"
                      className={`mt-1 ${formData.price_per_week <= 0 ? 'border-red-300' : ''}`}
                    />
                    {formData.price_per_week <= 0 && (
                      <p className="text-red-500 text-xs mt-1">Weekly rent must be greater than $0</p>
                    )}
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
                    Available From *
                  </Label>
                  <Input
                    id="available_from"
                    name="available_from"
                    type="date"
                    value={formData.available_from}
                    onChange={handleInputChange}
                    className={`mt-1 ${!formData.available_from ? 'border-red-300' : ''}`}
                  />
                  {!formData.available_from && (
                    <p className="text-red-500 text-xs mt-1">Available from date is required</p>
                  )}
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
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
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        JPG, PNG, WebP up to 5MB each • Max {10 - imageFiles.length} more images
                      </p>
                      {imageFiles.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''} selected
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Images Preview */}
                  {imageFiles.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Selected Images ({imageFiles.length})
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isUploading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                            </div>
                            <div className="absolute top-1 left-1">
                              <Badge variant="secondary" className="text-xs bg-white bg-opacity-90">
                                {index + 1}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Image upload tips */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>📸 Photo tips:</strong> Upload high-quality images showing different angles, rooms, and features. 
                          The first image will be your main listing photo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Review Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Review Your Listing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span className="font-medium">{formData.title || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{formData.address || 'Not set'}, {formData.suburb || 'Not set'}</span>
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
                      <span className="font-medium text-[#FF5A5F]">${formData.price_per_week || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available From:</span>
                      <span className="font-medium">
                        {formData.available_from ? new Date(formData.available_from).toLocaleDateString('en-NZ') : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Images:</span>
                      <span className="font-medium">{imageFiles.length || 0} uploaded</span>
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
                  <Button type="button" variant="outline" onClick={prevStep} disabled={loading || isUploading}>
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || isUploading}
                    className="bg-[#FF5A5F] hover:bg-[#E8474B] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isUploading ? 'Uploading Images...' : 'Creating Listing...'}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish Listing
                      </div>
                    )}
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