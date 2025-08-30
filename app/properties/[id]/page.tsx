// app/properties/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Heart, 
  Share, 
  Star, 
  MapPin, 
  Bed, 
  Bath, 
  Home,
  Wifi,
  Car,
  Utensils,
  Tv,
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  X
} from 'lucide-react'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { supabase, Property } from '@/lib/supabase'
import { formatPrice } from '@/lib/stripe'
import PropertyLocationMap from '@/components/property/location-map'
import ViewingRequest from '@/components/property/viewing-request'

export default function PropertyDetailsPage() {
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showViewingDialog, setShowViewingDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        setProperty(data)
        
        // Track property view
        if (data) {
          await trackPropertyView(data.id)
        }
      } catch (error) {
        console.error('Error fetching property:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProperty()
    }
  }, [params.id])

  const trackPropertyView = async (propertyId: string) => {
    try {
      await supabase
        .from('property_views')
        .insert({
          property_id: propertyId,
          viewer_ip: null, // Will be handled by server
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          session_id: null
        })
    } catch (error) {
      // Silent fail for analytics
      console.debug('Failed to track property view:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share && property) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title} in ${property.suburb}`,
          url: window.location.href
        })
      } catch (error) {
        // Fall back to custom share dialog
        setShowShareDialog(true)
      }
    } else {
      setShowShareDialog(true)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-300" />
          <div className="p-4 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-4 bg-gray-300 rounded w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h1>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Link href="/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = property.images?.length ? property.images : [
    'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
  ]

  const amenities = [
    { icon: Wifi, label: 'WiFi', available: property.internet_included || true },
    { icon: Car, label: 'Parking', available: property.parking_spaces > 0 },
    { icon: Utensils, label: 'Kitchen', available: true },
    { icon: Tv, label: 'TV', available: property.is_furnished },
    { icon: Home, label: 'Furnished', available: property.is_furnished },
  ]

  return (
    <div className="min-h-screen bg-white">
      <TopNavigation />
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/search">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorite ? 'fill-[#FF5A5F] text-[#FF5A5F]' : ''}`} 
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-video overflow-hidden">
          <Image
            src={images[currentImageIndex]}
            alt={property.title}
            width={800}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
        
        {images.length > 1 && (
          <>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Image navigation arrows */}
            {currentImageIndex > 0 && (
              <button
                onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            
            {currentImageIndex < images.length - 1 && (
              <button
                onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            )}
          </>
        )}

        {/* Image counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-lg text-sm">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-32">
        {/* Title and Rating */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900 flex-1 mr-4">
              {property.title}
            </h1>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-[#FF5A5F] fill-current mr-1" />
              <span className="text-sm font-medium">4.8</span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{property.address}, {property.suburb}, {property.city}</span>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center">
              <Bed className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-700">{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-700">{property.bathrooms} bath</span>
            </div>
            {property.parking_spaces > 0 && (
              <div className="flex items-center">
                <Car className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-700">{property.parking_spaces} parking</span>
              </div>
            )}
            <Badge variant="secondary" className="capitalize">
              {property.property_type}
            </Badge>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(property.price_per_week)}
            </span>
            <span className="text-gray-600">per week</span>
            {property.bond_amount && (
              <span className="text-sm text-gray-500 ml-4">
                Bond: {formatPrice(property.bond_amount)}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {property.description || 'Beautiful property in a great location with modern amenities and easy access to public transport. Perfect for professionals or students looking for quality accommodation.'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-medium capitalize">{property.property_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Furnished</span>
                    <span className="font-medium">{property.is_furnished ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available From</span>
                    <span className="font-medium">
                      {new Date(property.available_from).toLocaleDateString('en-NZ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bond</span>
                    <span className="font-medium">
                      {property.bond_amount ? formatPrice(property.bond_amount) : 'TBD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parking</span>
                    <span className="font-medium">{property.parking_spaces || 0} spaces</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pets Allowed</span>
                    <span className="font-medium">{property.pets_allowed ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilities Included</span>
                    <span className="font-medium">{property.utilities_included ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Internet Included</span>
                    <span className="font-medium">{property.internet_included ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Compliance Status</h3>
                <div className="flex items-center space-x-2">
                  {property.compliance_status === 'compliant' ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">Healthy Homes Compliant</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-700 font-medium">Compliance Pending</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="amenities" className="mt-6">
            <div className="grid grid-cols-2 gap-4">
              {amenities.map((amenity, index) => {
                const Icon = amenity.icon
                return (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      amenity.available ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      amenity.available ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      amenity.available ? 'text-green-900' : 'text-gray-500'
                    }`}>
                      {amenity.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Additional amenities from property data */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Additional Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="location" className="mt-6">
            <PropertyLocationMap property={{
              id: property.id,
              title: property.title,
              address: property.address,
              suburb: property.suburb,
              city: property.city,
              latitude: property.latitude,
              longitude: property.longitude
            }} />
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">4.8</div>
                  <div className="flex items-center justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-[#FF5A5F] fill-current" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">12 reviews</div>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    name: 'Sarah M.',
                    rating: 5,
                    date: '2 weeks ago',
                    comment: 'Great location and very clean. The landlord is responsive and helpful.'
                  },
                  {
                    name: 'James K.',
                    rating: 5,
                    date: '1 month ago',
                    comment: 'Perfect for students. Close to university and public transport.'
                  }
                ].map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{review.name}</span>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-[#FF5A5F] fill-current" />
                            ))}
                          </div>
                          <p className="text-gray-700 text-sm">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-pb z-50">
        <div className="flex space-x-3">
          <Dialog open={showViewingDialog} onOpenChange={setShowViewingDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Viewing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
              <ViewingRequest
                propertyId={property.id}
                propertyTitle={property.title}
                propertyAddress={`${property.address}, ${property.suburb}, ${property.city}`}
                onSuccess={() => setShowViewingDialog(false)}
                onCancel={() => setShowViewingDialog(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            className="flex-1 bg-[#FF5A5F] hover:bg-[#E8474B]"
            onClick={() => {
              // For now, redirect to contact or show info
              window.location.href = `mailto:admin@keyskeeper.co.nz?subject=Application for ${property.title}&body=I would like to apply for the property at ${property.address}`
            }}
          >
            Apply Now
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Weekly rent: {formatPrice(property.price_per_week)}</span>
          {property.bond_amount && (
            <span>Bond: {formatPrice(property.bond_amount)}</span>
          )}
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Share this property</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(window.location.href)}
                  className="flex-1"
                >
                  Copy Link
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const subject = encodeURIComponent(`Check out this property: ${property.title}`)
                    const body = encodeURIComponent(`I found this property that might interest you:\n\n${property.title}\n${property.address}, ${property.suburb}\n${formatPrice(property.price_per_week)} per week\n\n${window.location.href}`)
                    window.location.href = `mailto:?subject=${subject}&body=${body}`
                  }}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  )
}