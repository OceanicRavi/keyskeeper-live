// app/properties/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  Eye
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
  const [showImageGallery, setShowImageGallery] = useState(false)

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
          viewer_ip: null,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          session_id: null
        })
    } catch (error) {
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
        setShowShareDialog(true)
      }
    } else {
      setShowShareDialog(true)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="pt-16 pb-20">
          <div className="animate-pulse">
            <div className="h-64 sm:h-80 bg-gray-300" />
            <div className="p-4 space-y-4">
              <div className="h-6 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
              <div className="h-4 bg-gray-300 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <TopNavigation />
        <div className="text-center px-4 pt-16 pb-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h1>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Link href="/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = property.images?.filter(img => img && img.trim() !== '') || []
  const hasImages = images.length > 0
  const currentImage = hasImages ? images[currentImageIndex] : null

  const amenities = [
    { icon: Wifi, label: 'WiFi', available: property.internet_included },
    { icon: Car, label: 'Parking', available: property.parking_spaces > 0 },
    { icon: Utensils, label: 'Kitchen', available: true },
    { icon: Home, label: 'Furnished', available: property.is_furnished },
  ].filter(amenity => amenity.available)

  const reviews = [
    {
      name: 'Alex M.',
      rating: 5,
      date: '2 weeks ago',
      comment: `Great ${property.property_type} in ${property.suburb}. ${property.is_furnished ? 'Well furnished and' : ''} Very clean and comfortable.`
    },
    {
      name: 'Jordan K.',
      rating: 4,
      date: '1 month ago',
      comment: `Good location in ${property.city}. ${property.internet_included ? 'Internet is fast and' : ''} Easy access to public transport.`
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <TopNavigation />
      
      {/* Fixed Header */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/search">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Back</span>
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
                className={`h-4 w-4 ${isFavorite ? 'fill-[#504746] text-[#504746]' : ''}`} 
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          
          {/* Image Gallery Section */}
          {hasImages && (
            <div className="relative mb-6">
              <div className="h-64 sm:h-96 relative">
                <img
                  src={currentImage || images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/60 px-4 py-2 rounded-full">
                  {currentImageIndex + 1} / {images.length}
                </div>
                
                {/* View all button */}
                <button
                  onClick={() => setShowImageGallery(true)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full text-sm flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </button>
              </div>
              
              {/* Thumbnail dots */}
              {images.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-[#504746]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="px-4">
            {/* Property Info Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{property.address}, {property.suburb}, {property.city}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-[#504746] fill-current mr-1" />
                  <span className="text-lg font-medium">4.8</span>
                  <span className="text-gray-500 ml-1 text-sm">(12 reviews)</span>
                </div>
              </div>
              
              {/* Property Features */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium text-sm sm:text-base">{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium text-sm sm:text-base">{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
                {property.parking_spaces > 0 && (
                  <div className="flex items-center">
                    <Car className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-sm sm:text-base">{property.parking_spaces} parking</span>
                  </div>
                )}
                <Badge variant="secondary" className="capitalize">
                  {property.property_type}
                </Badge>
              </div>

              {/* Price */}
              <div className="flex flex-wrap items-baseline gap-3 mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {formatPrice(property.price_per_week)}
                </span>
                <span className="text-lg text-gray-600">per week</span>
                {property.bond_amount && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Bond: {formatPrice(property.bond_amount)}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <Dialog open={showViewingDialog} onOpenChange={setShowViewingDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#504746] hover:bg-[#06b6d4] text-white">
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
                  variant="outline"
                  onClick={() => {
                    const subject = encodeURIComponent(`Application for ${property.title}`)
                    const body = encodeURIComponent(`Hi, I would like to apply for the property at ${property.address}, ${property.suburb}. Please let me know the next steps.`)
                    window.location.href = `mailto:admin@keyskeeper.co.nz?subject=${subject}&body=${body}`
                  }}
                >
                  Apply Now
                </Button>
              </div>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {property.description || `Beautiful ${property.property_type} located in ${property.suburb}. This property offers ${property.bedrooms} bedroom${property.bedrooms !== 1 ? 's' : ''} and ${property.bathrooms} bathroom${property.bathrooms !== 1 ? 's' : ''}, perfect for ${property.bedrooms <= 2 ? 'individuals or couples' : 'families or groups'}. ${property.is_furnished ? 'Fully furnished and ready to move in.' : ''} ${property.utilities_included ? 'All utilities are included.' : ''}`}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Property Type</span>
                        <span className="font-medium capitalize">{property.property_type}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Furnished</span>
                        <span className="font-medium">{property.is_furnished ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Available From</span>
                        <span className="font-medium">
                          {new Date(property.available_from).toLocaleDateString('en-NZ')}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Bond</span>
                        <span className="font-medium">
                          {property.bond_amount ? formatPrice(property.bond_amount) : 'To be discussed'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Parking</span>
                        <span className="font-medium">{property.parking_spaces || 0} space{property.parking_spaces !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Pets Allowed</span>
                        <span className="font-medium">{property.pets_allowed ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Utilities Included</span>
                        <span className="font-medium">{property.utilities_included ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Internet Included</span>
                        <span className="font-medium">{property.internet_included ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Compliance Status</h3>
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
              </TabsContent>
              
              <TabsContent value="amenities" className="mt-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Amenities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {amenities.map((amenity, index) => {
                      const Icon = amenity.icon
                      return (
                        <div 
                          key={index}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200"
                        >
                          <Icon className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">
                            {amenity.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Additional Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">
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
              
              <TabsContent value="reviews" className="mt-6 space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">4.8</div>
                  <div className="flex items-center justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-[#504746] fill-current" />
                    ))}
                  </div>
                  <div className="text-gray-600">Based on 12 reviews</div>
                </div>
                
                <div className="space-y-4">
                  {reviews.map((review, index) => (
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
                                <Star key={i} className="h-4 w-4 text-[#504746] fill-current" />
                              ))}
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Contact Info */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <a
                    href={`mailto:admin@keyskeeper.co.nz?subject=Inquiry about ${property.title}`}
                    className="flex items-center text-[#504746] hover:text-[#06b6d4] transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-3" />
                    <span>admin@keyskeeper.co.nz</span>
                  </a>
                  <a
                    href="tel:+64277771486"
                    className="flex items-center text-[#504746] hover:text-[#06b6d4] transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-3" />
                    <span>+64 27 777 1486</span>
                  </a>
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Protected by Keyskeeper guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showImageGallery && hasImages && (
        <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
          <DialogContent className="max-w-4xl p-0 max-h-[90vh] overflow-hidden">
            <div className="relative">
              <img
                src={images[currentImageIndex]}
                alt={`${property.title} ${currentImageIndex + 1}`}
                className="w-full h-64 sm:h-96 object-cover"
              />
              <button
                onClick={() => setShowImageGallery(false)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
            <div className="p-4 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden ${
                      index === currentImageIndex ? 'ring-2 ring-[#504746]' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Share this property</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(window.location.href)}
                className="w-full"
              >
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const subject = encodeURIComponent(`Check out this property: ${property.title}`)
                  const body = encodeURIComponent(`I found this property that might interest you:\n\n${property.title}\n${property.address}, ${property.suburb}\n${formatPrice(property.price_per_week)} per week\n\n${window.location.href}`)
                  window.location.href = `mailto:?subject=${subject}&body=${body}`
                  setShowShareDialog(false)
                }}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  )
}