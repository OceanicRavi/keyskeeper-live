// app/list-property/page.tsx
'use client'

import { useState, useEffect } from 'react'
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
import { ArrowLeft, Upload, X, Home, DollarSign, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import Link from 'next/link'

interface PropertyFormData {
  title: string
  description: string
  address: string
  suburb: string
  city: string
  postcode: string
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
  compliance_status: 'compliant' | 'pending' | 'non_compliant'
}

const amenityOptions = [
  'WiFi', 'Parking', 'Garden', 'Balcony', 'Gym', 'Pool', 'Laundry', 
  'Dishwasher', 'Air Conditioning', 'Heating', 'Security', 'Storage'
]

const generateUniqueFileName = (file: File): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  return `property-${timestamp}-${random}.${extension}`
}

const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `${file.name}: Invalid file type. Only JPG, PNG, and WebP are allowed.` 
    }
  }
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `${file.name}: File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.` 
    }
  }
  
  return { isValid: true }
}

const uploadImageToSupabase = async (file: File): Promise<string> => {
  // Validate file
  const validation = validateImageFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  const fileName = generateUniqueFileName(file)
  const filePath = `property-images/${fileName}`
  
  console.log(`Uploading ${file.name} as ${filePath} (${(file.size / 1024).toFixed(1)}KB)`)
  
  try {
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false
      })
    
    if (error) {
      console.error('Upload error:', error)
      
      // If file already exists (shouldn't happen with unique names, but handle it)
      if (error.message.includes('already exists')) {
        // Try again with a new unique name
        const retryFileName = generateUniqueFileName(file)
        const retryFilePath = `property-images/${retryFileName}`
        
        const { data: retryData, error: retryError } = await supabase.storage
          .from('property-images')
          .upload(retryFilePath, file, {
            cacheControl: '31536000',
            upsert: false
          })
        
        if (retryError) {
          throw new Error(`Upload failed after retry: ${retryError.message}`)
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(retryFilePath)
        
        console.log(`Successfully uploaded ${file.name} (retry) to ${retryFilePath}`)
        return publicUrl
      }
      
      throw new Error(`Upload failed: ${error.message}`)
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath)
    
    console.log(`Successfully uploaded ${file.name}: ${publicUrl}`)
    return publicUrl
    
  } catch (error: any) {
    console.error('Image upload error:', error)
    throw new Error(`Failed to upload ${file.name}: ${error.message}`)
  }
}

const SimpleProgressBar = ({ value }: { value: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
)

export default function PropertyListingForm() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [canAddProperty, setCanAddProperty] = useState(false)
  
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
    compliance_status: 'pending'
  })
  
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    checkUserAccess()
  }, [router])

  const checkUserAccess = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/auth/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single()

      if (profileError || !profile) {
        console.error('Profile error:', profileError)
        router.push('/auth/login')
        return
      }

      setCurrentUser(profile)
      
      // Both admin and landlord can add properties
      const hasAccess = profile.role === 'admin' || profile.role === 'landlord'
      setCanAddProperty(hasAccess)
      setIsAdmin(profile.role === 'admin')
      
      if (!hasAccess) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking access:', error)
      router.push('/auth/login')
    }
  }

  const validateStep = (stepNumber: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    switch (stepNumber) {
      case 1:
        if (!formData.title.trim()) errors.push('Property title is required')
        if (!formData.address.trim()) errors.push('Property address is required')
        if (!formData.suburb.trim()) errors.push('Suburb is required')
        if (!formData.city.trim()) errors.push('City is required')
        break
        
      case 2:
        if (!formData.price_per_week || formData.price_per_week <= 0) {
          errors.push('Weekly rent must be greater than $0')
        }
        if (!formData.available_from) errors.push('Available from date is required')
        break
        
      case 3:
        // No required fields in step 3
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + imageFiles.length > 10) {
      setError('Maximum 10 images allowed')
      return
    }
    
    const invalidFiles: string[] = []
    const validFiles: File[] = []
    
    files.forEach(file => {
      const validation = validateImageFile(file)
      if (validation.isValid) {
        validFiles.push(file)
      } else {
        invalidFiles.push(validation.error || '')
      }
    })
    
    if (invalidFiles.length > 0) {
      setError(invalidFiles.join(' | '))
      return
    }
    
    if (validFiles.length > 0) {
      setImageFiles([...imageFiles, ...validFiles])
      setError('')
    }
    
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
  }

  const uploadAllImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) {
      return []
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    const uploadedUrls: string[] = []
    
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        
        try {
          console.log(`Uploading image ${i + 1}/${imageFiles.length}: ${file.name}`)
          const imageUrl = await uploadImageToSupabase(file)
          uploadedUrls.push(imageUrl)
          
          const progress = Math.round(((i + 1) / imageFiles.length) * 100)
          setUploadProgress(progress)
          
          console.log(`Upload ${i + 1}/${imageFiles.length} complete`)
        } catch (uploadError: any) {
          console.error(`Failed to upload ${file.name}:`, uploadError)
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }
      }
      
      console.log(`All ${uploadedUrls.length} images uploaded successfully`)
      return uploadedUrls
      
    } catch (error: any) {
      console.error('Batch upload failed:', error)
      throw error
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const nextStep = () => {
    const validation = validateStep(step)
    
    if (!validation.isValid) {
      setError(validation.errors.join(', '))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    setError('')
    setStep(step + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const prevStep = () => {
    setError('')
    setStep(step - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all steps
    const step1Validation = validateStep(1)
    const step2Validation = validateStep(2)
    
    const allErrors = [...step1Validation.errors, ...step2Validation.errors]
    
    if (allErrors.length > 0) {
      setError('Please fix the following: ' + allErrors.join(', '))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    setLoading(true)
    setError('')

    try {
      // Get authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        throw new Error('Not authenticated')
      }
      
      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, role')
        .eq('auth_id', authUser.id)
        .single()
      
      if (profileError || !userProfile) {
        throw new Error('User profile not found')
      }

      // Check if user has permission
      if (userProfile.role !== 'admin' && userProfile.role !== 'landlord') {
        throw new Error('You do not have permission to add properties')
      }
      
      console.log('Starting property creation for user:', userProfile.id)
      
      // Upload images
      let finalImageUrls: string[] = []
      
      if (imageFiles.length > 0) {
        console.log(`Uploading ${imageFiles.length} images...`)
        try {
          finalImageUrls = await uploadAllImages()
          console.log(`Successfully uploaded ${finalImageUrls.length} images`)
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError)
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }
      }
      
      // Use placeholder if no images uploaded
      if (finalImageUrls.length === 0) {
        console.log('No images uploaded, using placeholder')
        finalImageUrls = ['https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=800']
      }
      
      // Determine compliance status
      const complianceStatus = isAdmin ? formData.compliance_status : 'pending'
      
      // Prepare property data
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
        compliance_status: complianceStatus
      }

      console.log('Creating property with data:', propertyData)

      // Insert property
      const { data, error: insertError } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single()

      if (insertError) {
        console.error('Property creation error:', insertError)
        throw new Error(`Database error: ${insertError.message}`)
      }

      if (!data) {
        throw new Error('Property created but no data returned')
      }

      console.log('Property created successfully:', data.id)
      
      // Success! Redirect to property page
      setSuccess(true)
      setTimeout(() => {
        router.push(`/properties/${data.id}?success=listed`)
      }, 1500)
      
    } catch (error: any) {
      console.error('Error creating property:', error)
      setError(error.message || 'Failed to create property listing. Please try again.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  if (!canAddProperty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#504746] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
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
                Property Listed Successfully!
              </h1>
              <p className="text-gray-600 mb-8">
                Your property has been created. Redirecting to property page...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
          
          {isAdmin && (
            <Badge className="mt-2 bg-purple-100 text-purple-800">
              <Shield className="h-3 w-3 mr-1" />
              Admin Mode
            </Badge>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? 'bg-[#504746] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-[#504746]' : 'bg-gray-200'
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

        {isUploading && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Upload className="h-5 w-5 text-blue-600 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Uploading images...</p>
                  <SimpleProgressBar value={uploadProgress} />
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
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Modern 2BR Apartment in Auckland Central"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
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
                  <Label htmlFor="address">Property Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Queen Street"
                    className="mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="suburb">Suburb *</Label>
                    <Input
                      id="suburb"
                      name="suburb"
                      value={formData.suburb}
                      onChange={handleInputChange}
                      placeholder="Auckland Central"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  <div>
                    <Label htmlFor="postcode">Postcode</Label>
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
                  <Label htmlFor="property_type">Property Type</Label>
                  <select
                    id="property_type"
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  <div>
                    <Label htmlFor="parking_spaces">Parking</Label>
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
                  <Button type="button" onClick={nextStep} className="bg-[#504746] hover:bg-[#06b6d4]">
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
                    <Label htmlFor="price_per_week">Weekly Rent (NZD) *</Label>
                    <Input
                      id="price_per_week"
                      name="price_per_week"
                      type="number"
                      min="1"
                      value={formData.price_per_week}
                      onChange={handleInputChange}
                      placeholder="500"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bond_amount">Bond Amount (NZD)</Label>
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
                  <Label htmlFor="available_from">Available From *</Label>
                  <Input
                    id="available_from"
                    name="available_from"
                    type="date"
                    value={formData.available_from}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>

                {/* Admin-only compliance status */}
                {isAdmin && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <Label htmlFor="compliance_status" className="flex items-center mb-2">
                      <Shield className="h-4 w-4 mr-2 text-purple-600" />
                      Compliance Status (Admin Only)
                    </Label>
                    <select
                      id="compliance_status"
                      name="compliance_status"
                      value={formData.compliance_status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-purple-300 rounded-md"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="compliant">Compliant</option>
                      <option value="non_compliant">Non-Compliant</option>
                    </select>
                    <p className="text-xs text-purple-700 mt-2">
                      Set property compliance status for Healthy Homes standards
                    </p>
                  </div>
                )}

                <div>
                  <Label className="mb-3 block">Property Features</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_furnished"
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
                  <Label className="mb-3 block">Amenities</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {amenityOptions.map((amenity) => (
                      <div
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`p-2 border rounded-lg cursor-pointer text-center text-sm transition-colors ${
                          formData.amenities.includes(amenity)
                            ? 'border-[#504746] bg-[#504746] text-white'
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
                  <Button type="button" onClick={nextStep} className="bg-[#504746] hover:bg-[#06b6d4]">
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
                  <Label className="mb-3 block">Property Photos (Optional, Max 10)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-600 mb-4">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-[#504746] hover:text-[#06b6d4] font-medium">
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
                          disabled={isUploading || imageFiles.length >= 10}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        JPG, PNG, WebP up to 5MB each • {10 - imageFiles.length} more allowed
                      </p>
                      {imageFiles.length > 0 && (
                        <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                          {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''} ready to upload
                        </Badge>
                      )}
                    </div>
                  </div>

                  {imageFiles.length > 0 && (
                    <div className="mt-4">
                      <Label className="mb-3 block">Selected Images ({imageFiles.length})</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"
                              disabled={isUploading}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <Badge variant="secondary" className="absolute top-1 left-1 text-xs">
                              {index + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
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
                      <span className="font-medium text-[#504746]">${formData.price_per_week}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available From:</span>
                      <span className="font-medium">
                        {new Date(formData.available_from).toLocaleDateString('en-NZ')}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600">Compliance:</span>
                        <Badge className={
                          formData.compliance_status === 'compliant' ? 'bg-green-100 text-green-800' :
                          formData.compliance_status === 'non_compliant' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {formData.compliance_status}
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Images:</span>
                      <span className="font-medium">{imageFiles.length || 'Using placeholder'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep} disabled={loading || isUploading}>
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || isUploading}
                    className="bg-[#504746] hover:bg-[#06b6d4]"
                  >
                    {loading || isUploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isUploading ? 'Uploading...' : 'Creating...'}
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