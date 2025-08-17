// app/search/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, Filter, Grid, List, Star, Heart, Navigation } from 'lucide-react'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, Property } from '@/lib/supabase'
import { formatPrice } from '@/lib/stripe'
import { initGoogleMaps, isMapsReady, geocodeAddress, calculateDistance } from '@/lib/maps'
import Link from 'next/link'

interface PropertyWithDistance extends Property {
  distance?: number
}

export default function SearchPageWithMap() {
  const searchParams = useSearchParams()
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [properties, setProperties] = useState<PropertyWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)

  // Search filters
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [propertyType, setPropertyType] = useState('all')
  const [bedrooms, setBedrooms] = useState('any')

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) {
        console.log('Map ref not ready')
        return
      }

      const ready = await initGoogleMaps()
      console.log('Google Maps ready:', ready)

      if (ready && !map) {
        const google = window.google
        const initialCenter = { lat: -36.8485, lng: 174.7633 } // Auckland center

        try {
          const newMap = new google.maps.Map(mapRef.current, {
            zoom: 11,
            center: initialCenter,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          })

          setMap(newMap)
          console.log('Map initialized successfully:', newMap)

          // Try to get user's location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userPos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                }
                setUserLocation(userPos)
                newMap.setCenter(userPos)

                // Add user location marker
                new google.maps.Marker({
                  position: userPos,
                  map: newMap,
                  title: 'Your Location',
                  icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                      <circle cx="10" cy="10" r="4" fill="white"/>
                    </svg>
                  `),
                    scaledSize: new google.maps.Size(20, 20)
                  }
                })
              },
              (error) => {
                console.log('Geolocation error:', error)
              }
            )
          }
        } catch (error) {
          console.error('Map creation failed:', error)
        }
      }
    }

    // Only initialize when switching to map view
    if (viewMode === 'map') {
      initMap()
    }
  }, [viewMode, map]) // Changed dependency from [map] to [viewMode, map]

  // Fetch properties and calculate distances
  useEffect(() => {
    fetchProperties()
  }, [location, minPrice, maxPrice, propertyType, bedrooms, userLocation])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_available', true)

      if (location) {
        query = query.or(`suburb.ilike.%${location}%,city.ilike.%${location}%,address.ilike.%${location}%`)
      }

      if (minPrice) {
        query = query.gte('price_per_week', parseFloat(minPrice))
      }

      if (maxPrice) {
        query = query.lte('price_per_week', parseFloat(maxPrice))
      }

      if (propertyType !== 'all') {
        query = query.eq('property_type', propertyType)
      }

      if (bedrooms !== 'any') {
        query = query.eq('bedrooms', parseInt(bedrooms))
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      let propertiesWithDistance = data || []

      // Calculate distances if user location is available
      if (userLocation && isMapsReady()) {
        propertiesWithDistance = await Promise.all(
          (data || []).map(async (property) => {
            if (property.latitude && property.longitude) {
              const distance = await calculateDistance(
                userLocation,
                { lat: property.latitude, lng: property.longitude }
              )
              return { ...property, distance }
            }
            return property
          })
        )

        // Sort by distance
        propertiesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      }

      setProperties(propertiesWithDistance)
      updateMapMarkers(propertiesWithDistance)
      console.log('Properties with coordinates:', propertiesWithDistance.filter(p => p.latitude && p.longitude))
      console.log('Map object:', map)
      console.log('Maps ready:', isMapsReady())
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateMapMarkers = (props: PropertyWithDistance[]) => {
    if (!map || !isMapsReady()) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))

    const newMarkers = props
      .filter(prop => prop.latitude && prop.longitude)
      .map(property => {
        const marker = new window.google.maps.Marker({
          position: { lat: property.latitude!, lng: property.longitude! },
          map: map,
          title: property.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 16 16 24 16 24s16-8 16-24c0-8.837-7.163-16-16-16z" fill="#FF5A5F"/>
                <circle cx="16" cy="16" r="6" fill="white"/>
                <text x="16" y="20" text-anchor="middle" fill="#FF5A5F" font-size="8" font-weight="bold">$${Math.round(property.price_per_week)}</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 40),
            anchor: new window.google.maps.Point(16, 40)
          }
        })

        // Add click listener to marker
        marker.addListener('click', () => {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${property.title}</h3>
                <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${property.suburb}, ${property.city}</p>
                <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #FF5A5F;">${formatPrice(property.price_per_week)}/week</p>
                <div style="margin: 4px 0;">
                  <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-right: 4px;">${property.bedrooms} bed</span>
                  <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${property.bathrooms} bath</span>
                </div>
                ${property.distance ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">📍 ${(property.distance / 1000).toFixed(1)}km away</p>` : ''}
                <a href="/properties/${property.id}" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #FF5A5F; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">View Details</a>
              </div>
            `
          })
          infoWindow.open(map, marker)
        })

        return marker
      })

    setMarkers(newMarkers)

    // Adjust map bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      newMarkers.forEach(marker => {
        const position = marker.getPosition()
        if (position) bounds.extend(position)
      })
      if (userLocation) {
        bounds.extend(userLocation)
      }
      map.fitBounds(bounds)
    }
  }

  // Search by map area
  const handleSearchThisArea = () => {
    if (!map) return

    const bounds = map.getBounds()
    if (!bounds) return

    const center = bounds.getCenter()
    if (center) {
      setLocation(`${center.lat().toFixed(4)}, ${center.lng().toFixed(4)}`)
    }
  }

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4">
            {/* Location Search */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Auckland, Wellington, or enter address..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white min-w-max"
              >
                <option value="all">All Types</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="room">Room</option>
              </select>

              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white min-w-max"
              >
                <option value="any">Any Beds</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>

              <Input
                placeholder="Min $"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-20 text-sm"
                type="number"
              />

              <Input
                placeholder="Max $"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 text-sm"
                type="number"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {properties.length} properties found
                {userLocation && ' • Sorted by distance'}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <MapPin className="h-4 w-4" />
                  Map
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {viewMode === 'map' ? (
          <div className="flex h-[calc(100vh-200px)]">
            {/* Map */}
            <div className="flex-1 relative">
              <div ref={mapRef} className="w-full h-full" />
              {map && (
                <Button
                  onClick={handleSearchThisArea}
                  className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white hover:bg-gray-50 text-gray-900 border shadow-lg"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Search this area
                </Button>
              )}
            </div>

            {/* Property List Sidebar */}
            <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Properties ({properties.length})
                </h3>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <PropertyMapCard key={property.id} property={property} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Grid/List View */
          <div className="px-4 py-6 pb-24">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-300" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2" />
                      <div className="h-3 bg-gray-300 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    viewMode={viewMode as 'grid' | 'list'}
                    showDistance={!!userLocation}
                  />
                ))}
              </div>
            )}

            {!loading && properties.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No properties found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or explore different locations.
                  </p>
                  <Button onClick={() => {
                    setLocation('')
                    setMinPrice('')
                    setMaxPrice('')
                    setPropertyType('all')
                    setBedrooms('any')
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}

// Compact property card for map sidebar
function PropertyMapCard({ property }: { property: PropertyWithDistance }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const mainImage = property.images?.[0] || 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg'

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <Link href={`/properties/${property.id}`}>
        <div className="flex">
          <div className="w-24 h-20 flex-shrink-0">
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 p-3">
            <h4 className="font-medium text-sm text-gray-900 line-clamp-1 mb-1">
              {property.title}
            </h4>
            <p className="text-xs text-gray-500 mb-2">
              {property.suburb}, {property.city}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-900">
                {formatPrice(property.price_per_week)}/wk
              </span>
              {property.distance && (
                <span className="text-xs text-gray-500">
                  {property.distance < 1000
                    ? `${Math.round(property.distance)}m`
                    : `${(property.distance / 1000).toFixed(1)}km`}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  )
}

// Enhanced property card with distance
function PropertyCard({
  property,
  viewMode,
  showDistance
}: {
  property: PropertyWithDistance
  viewMode: 'grid' | 'list'
  showDistance: boolean
}) {
  const [isFavorite, setIsFavorite] = useState(false)
  const mainImage = property.images?.[0] || 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg'

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <Link href={`/properties/${property.id}`}>
          <div className="flex">
            <div className="w-48 h-32 flex-shrink-0">
              <img
                src={mainImage}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {property.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsFavorite(!isFavorite)
                  }}
                >
                  <Heart
                    size={16}
                    className={isFavorite ? 'fill-[#FF5A5F] text-[#FF5A5F]' : 'text-gray-400'}
                  />
                </Button>
              </div>

              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin size={14} className="mr-1" />
                {property.suburb}, {property.city}
                {showDistance && property.distance && (
                  <span className="ml-2 text-blue-600">
                    • {property.distance < 1000
                      ? `${Math.round(property.distance)}m away`
                      : `${(property.distance / 1000).toFixed(1)}km away`}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(property.price_per_week)}
                  </span>
                  <span className="text-sm text-gray-500"> / week</span>
                </div>
                <div className="flex items-center">
                  <Star size={14} className="text-[#FF5A5F] fill-current mr-1" />
                  <span className="text-sm">4.8</span>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {property.bedrooms} bed • {property.bathrooms} bath
                </Badge>
                {property.is_furnished && (
                  <Badge variant="secondary" className="text-xs">
                    Furnished
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/properties/${property.id}`}>
        <div className="relative">
          <div className="aspect-video overflow-hidden">
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFavorite(!isFavorite)
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart
              size={16}
              className={isFavorite ? 'fill-[#FF5A5F] text-[#FF5A5F]' : 'text-gray-600'}
            />
          </button>

          {showDistance && property.distance && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
              {property.distance < 1000
                ? `${Math.round(property.distance)}m`
                : `${(property.distance / 1000).toFixed(1)}km`}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {property.title}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin size={14} className="mr-1" />
                {property.suburb}, {property.city}
              </div>
            </div>
            <div className="flex items-center ml-2">
              <Star size={14} className="text-[#FF5A5F] fill-current" />
              <span className="text-sm font-medium ml-1">4.8</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-semibold text-gray-900">
                {formatPrice(property.price_per_week)}
              </span>
              <span className="text-sm text-gray-500"> / week</span>
            </div>
            <div className="text-xs text-gray-500">
              {property.bedrooms} bed • {property.bathrooms} bath
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {property.is_furnished && (
              <Badge variant="secondary" className="text-xs">
                Furnished
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs capitalize">
              {property.property_type}
            </Badge>
            <Badge
              variant={property.compliance_status === 'compliant' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {property.compliance_status === 'compliant' ? 'Compliant' : 'Pending'}
            </Badge>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}