// app/landlord/properties/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TopNavigation } from '@/components/ui/navigation'
//import AddressAutocomplete, { AddressData } from '@/components/ui/address-autocomplete'
import { supabase, Property } from '@/lib/supabase'
import {
  ArrowLeft,
  Upload,
  X,
  MapPin,
  Home,
  DollarSign,
  Save,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
export const metadata = {
  robots: { index: false, follow: false }
}
interface PropertyFormData {
  title: string
  description: string
  address: string
  suburb: string
  city: string
  postcode: string
  latitude: number | null
  longitude: number | null
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
  is_available: boolean
  available_from: string
  amenities: string[]
  images: string[]
}

const amenityOptions = [
  'WiFi', 'Parking', 'Garden', 'Balcony', 'Gym', 'Pool', 'Laundry',
  'Dishwasher', 'Air Conditioning', 'Heating', 'Security', 'Storage'
]

// Helper function to upload images to Supabase Storage
const uploadImageToStorage = async (file: File, propertyId: string): Promise<string> => {
  console.log(`Starting upload for file: ${file.name}, size: ${file.size} bytes`)
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `properties/${propertyId}/${fileName}`

  console.log(`Uploading to path: ${filePath}`)

  // First, check if the bucket exists
/*    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
  console.log('Available buckets:', buckets?.map(b => b.name))
  
  if (bucketError) {
    console.error('Error listing buckets:', bucketError)
    throw new Error(`Storage access error: ${bucketError.message}`)
  }

  const bucketExists = buckets?.some(bucket => bucket.name === 'property-images')
  if (!bucketExists) {
    throw new Error('Storage bucket "property-images" does not exist. Please create it in your Supabase dashboard.')
  }  */

  const { data, error } = await supabase.storage
    .from('property-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  console.log('Upload successful:', data)

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('property-images')
    .getPublicUrl(filePath)

  console.log('Generated public URL:', publicUrl)
  return publicUrl
}

// Helper function to delete images from Supabase Storage
const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.indexOf('property-images')
    if (bucketIndex === -1) return // Not a storage URL
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    
    const { error } = await supabase.storage
      .from('property-images')
      .remove([filePath])

    if (error) {
      console.error('Failed to delete image from storage:', error)
    }
  } catch (error) {
    console.error('Error parsing image URL for deletion:', error)
  }
}

export default function PropertyEditPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    address: '',
    suburb: '',
    city: 'Auckland',
    postcode: '',
    latitude: null,
    longitude: null,
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
    is_available: true,
    available_from: '',
    amenities: [],
    images: []
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return

      try {
        // Check if user has access to this property
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/auth/login')
          return
        }

        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        if (data) {
          // Verify user owns this property or is admin
          const { data: userProfile } = await supabase
            .from('users')
            .select('id, role')
            .eq('auth_id', authUser.id)
            .single()

          if (!userProfile || (userProfile.role !== 'admin' && userProfile.id !== data.landlord_id)) {
            router.push('/dashboard')
            return
          }

          setProperty(data)
          setFormData({
            title: data.title || '',
            description: data.description || '',
            address: data.address || '',
            suburb: data.suburb || '',
            city: data.city || 'Auckland',
            postcode: data.postcode || '',
            latitude: data.latitude,
            longitude: data.longitude,
            property_type: data.property_type || 'apartment',
            bedrooms: data.bedrooms || 1,
            bathrooms: data.bathrooms || 1,
            parking_spaces: data.parking_spaces || 0,
            price_per_week: data.price_per_week || 0,
            bond_amount: data.bond_amount || 0,
            utilities_included: data.utilities_included || false,
            internet_included: data.internet_included || false,
            is_furnished: data.is_furnished || false,
            pets_allowed: data.pets_allowed || false,
            smoking_allowed: data.smoking_allowed || false,
            is_available: data.is_available !== false,
            available_from: data.available_from || new Date().toISOString().split('T')[0],
            amenities: data.amenities || [],
            images: data.images || []
          })
        }
      } catch (error: any) {
        setError(error.message || 'Failed to fetch property')
        console.error('Error fetching property:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [params.id])

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
    
    // Validate file sizes (5MB max per file)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setError(`Some files are too large. Maximum size is 5MB per image.`)
      return
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      setError('Please upload only image files (JPG, PNG, GIF, WebP)')
      return
    }

    // Check total image count
    if (files.length + formData.images.length + imageFiles.length > 10) {
      setError('Maximum 10 images allowed')
      return
    }

    setImageFiles([...imageFiles, ...files])
    setError('')
  }

  const removeExistingImage = (imageUrl: string) => {
    setFormData({
      ...formData,
      images: formData.images.filter(img => img !== imageUrl)
    })
    setImagesToDelete([...imagesToDelete, imageUrl])
  }

  const removeNewImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    setUploadProgress({})

    try {
      // Validate required fields
      if (!formData.title || !formData.address || !formData.price_per_week) {
        throw new Error('Please fill in all required fields')
      }

      if (!params.id) {
        throw new Error('Property ID is missing')
      }

      console.log(`Starting save process. Images to upload: ${imageFiles.length}`)

      // Step 1: Upload new images to Supabase Storage
      const newImageUrls: string[] = []
      
      if (imageFiles.length > 0) {
        console.log('Starting image uploads...')
        
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          try {
            console.log(`Uploading file ${i + 1}/${imageFiles.length}: ${file.name}`)
            setUploadProgress(prev => ({ ...prev, [file.name]: 25 }))
            
            const imageUrl = await uploadImageToStorage(file, params.id as string)
            newImageUrls.push(imageUrl)
            
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
            console.log(`Successfully uploaded: ${file.name} -> ${imageUrl}`)
          } catch (uploadError: any) {
            console.error(`Failed to upload ${file.name}:`, uploadError)
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
          }
        }
        console.log('All images uploaded successfully')
      }

      // Step 2: Delete images that were marked for deletion
      if (imagesToDelete.length > 0) {
        console.log(`Deleting ${imagesToDelete.length} images from storage...`)
        for (const imageUrl of imagesToDelete) {
          try {
            await deleteImageFromStorage(imageUrl)
            console.log(`Deleted image: ${imageUrl}`)
          } catch (deleteError) {
            console.error('Failed to delete image:', deleteError)
            // Don't throw here - we still want to update the property even if image deletion fails
          }
        }
      }

      // Step 3: Update property with new data
      console.log('Updating property in database...')
      const updatedData = {
        ...formData,
        images: [...formData.images, ...newImageUrls]
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update(updatedData)
        .eq('id', params.id)

      if (updateError) {
        console.error('Database update error:', updateError)
        throw updateError
      }

      console.log('Property updated successfully')
      setSuccess('Property updated successfully!')
      setImageFiles([])
      setImagesToDelete([])
      setUploadProgress({})

      // Refresh property data
      const { data: refreshedProperty } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single()

      if (refreshedProperty) {
        setProperty(refreshedProperty)
        setFormData(prev => ({
          ...prev,
          images: refreshedProperty.images || []
        }))
      }

    } catch (error: any) {
      console.error('Save error:', error)
      setError(error.message || 'Failed to update property')
    } finally {
      setSaving(false)
      setUploadProgress({})
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    setSaving(true)
    setError('')

    try {
      // First, delete all images from storage
      if (property?.images && property.images.length > 0) {
        for (const imageUrl of property.images) {
          try {
            await deleteImageFromStorage(imageUrl)
          } catch (deleteError) {
            console.error('Failed to delete image during property deletion:', deleteError)
          }
        }
      }

      // Then delete the property record
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      router.push('/landlord')
    } catch (error: any) {
      setError(error.message || 'Failed to delete property')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6" />
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h1>
            <p className="text-gray-600 mb-4">The property you're trying to edit doesn't exist or you don't have permission to edit it.</p>
            <Link href="/landlord">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/landlord" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Property</h1>
              <p className="text-gray-600">Update your property details and settings</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/properties/${property.id}`}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Listing
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={saving}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Basic Information
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
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Queen Street"
                  required
                  className="mb-4"
                />
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
                    required
                    className="mt-1"
                  />
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
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#504746] focus:border-[#504746]"
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
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="property_type" className="text-sm font-medium text-gray-700">
                  Property Type
                </Label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#504746] focus:border-[#504746]"
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
            </CardContent>
          </Card>

          {/* Pricing & Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing & Availability
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="is_available"
                    name="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_available: !!checked })
                    }
                  />
                  <Label htmlFor="is_available" className="text-sm">Property is available for rent</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Property Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Amenities
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {amenityOptions.map((amenity) => (
                    <div
                      key={amenity}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`p-2 border rounded-lg cursor-pointer text-center text-sm transition-colors ${formData.amenities.includes(amenity)
                          ? 'border-[#504746] bg-[#504746] text-white'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Property Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Images */}
              {formData.images.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Current Images
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExistingImage(image)}
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {imageFiles.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    New Images to Upload
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {/* Upload Progress */}
                        {uploadProgress[file.name] && uploadProgress[file.name] < 100 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                            Uploading... {uploadProgress[file.name]}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Area */}
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
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={saving}
                    />
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 5MB each. Max 10 images total.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Current: {formData.images.length + imageFiles.length}/10 images
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Link href="/landlord">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel Changes
              </Button>
            </Link>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#504746] hover:bg-[#06b6d4] flex-1 sm:flex-none"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {imageFiles.length > 0 ? 'Uploading Images...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}