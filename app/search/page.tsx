'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, Filter, Grid, List, Star, Heart, Navigation, Sliders, Calendar, Users, Home as HomeIcon, DollarSign, Bed, Bath, Car, Wifi, Search } from 'lucide-react'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { supabase, Property } from '@/lib/supabase'
import { formatPrice } from '@/lib/stripe'
import { initGoogleMaps, isMapsReady, geocodeAddress, calculateDistance, searchPlaces } from '@/lib/maps'
import Link from 'next/link'

interface PropertyWithDistance extends Property {
  distance?: number
}

interface SearchFilters {
  location: string
  minPrice: number
  maxPrice: number
  propertyType: string
  bedrooms: string
  bathrooms: string
  isFurnished: boolean | null
  petsAllowed: boolean | null
  utilitiesIncluded: boolean | null
  availableFrom: string
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
  const [showFilters, setShowFilters] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Enhanced search filters
  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get('location') || '',
    minPrice: 0,
    maxPrice: 2000,
    propertyType: 'all',
    bedrooms: 'any',
    bathrooms: 'any',
    isFurnished: null,
    petsAllowed: null,
    utilitiesIncluded: null,
    availableFrom: ''
  })

  // Popular locations in NZ
  const popularLocations = [
    'Auckland Central', 'Ponsonby', 'Parnell', 'Newmarket', 'Mt Eden',
    'Wellington Central', 'Te Aro', 'Mount Victoria', 'Kelburn',
    'Christchurch Central', 'Riccarton', 'Merivale', 'Fendalton',
    'Hamilton East', 'Tauranga', 'Mount Maunganui', 'Rotorua',
    'Dunedin Central', 'Queenstown', 'Nelson', 'Palmerston North'
  ]

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return

      const ready = await initGoogleMaps()
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
              },
              {
                featureType: 'transit',
                elementType: 'labels',
                stylers: [{ visibility: 'simplified' }]
              }
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          })

          setMap(newMap)

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

    if (viewMode === 'map') {
      initMap()
    }
  }, [viewMode, map])

  // Handle location search with suggestions
  const handleLocationSearch = async (query: string) => {
    setFilters(prev => ({ ...prev, location: query }))
    
    if (query.length > 2) {
      const suggestions = popularLocations.filter(loc => 
        loc.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
      setSearchSuggestions(suggestions)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  // Fetch properties with enhanced filtering
  useEffect(() => {
    fetchProperties()
  }, [filters, userLocation])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_available', true)

      // Location filter
      if (filters.location) {
        query = query.or(`suburb.ilike.%${filters.location}%,city.ilike.%${filters.location}%,address.ilike.%${filters.location}%`)
      }

      // Price filters
      if (filters.minPrice > 0) {
        query = query.gte('price_per_week', filters.minPrice)
      }
      if (filters.maxPrice < 2000) {
        query = query.lte('price_per_week', filters.maxPrice)
      }

      // Property type filter
      if (filters.propertyType !== 'all') {
        query = query.eq('property_type', filters.propertyType)
      }

      // Bedroom filter
      if (filters.bedrooms !== 'any') {
        query = query.gte('bedrooms', parseInt(filters.bedrooms))
      }

      // Bathroom filter
      if (filters.bathrooms !== 'any') {
        query = query.gte('bathrooms', parseInt(filters.bathrooms))
      }

      // Feature filters
      if (filters.isFurnished !== null) {
        query = query.eq('is_furnished', filters.isFurnished)
      }
      if (filters.petsAllowed !== null) {
        query = query.eq('pets_allowed', filters.petsAllowed)
      }
      if (filters.utilitiesIncluded !== null) {
        query = query.eq('utilities_included', filters.utilitiesIncluded)
      }

      // Available from filter
      if (filters.availableFrom) {
        query = query.lte('available_from', filters.availableFrom)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100)

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
              <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 0C8.954 0 0 8.954 0 20c0 20 20 30 20 30s20-10 20-30c0-8.837-8.954-20-20-20z" fill="#FF5A5F"/>
                <circle cx="20" cy="20" r="8" fill="white"/>
                <text x="20" y="24" text-anchor="middle" fill="#FF5A5F" font-size="6" font-weight="bold">$${Math.round(property.price_per_week)}</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 50),
            anchor: new window.google.maps.Point(20, 50)
          }
        })

        // Add click listener to marker
        marker.addListener('click', () => {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; min-width: 250px;">
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
      setFilters(prev => ({ 
        ...prev, 
        location: `${center.lat().toFixed(4)}, ${center.lng().toFixed(4)}` 
      }))
    }
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: 0,
      maxPrice: 2000,
      propertyType: 'all',
      bedrooms: 'any',
      bathrooms: 'any',
      isFurnished: null,
      petsAllowed: null,
      utilitiesIncluded: null,
      availableFrom: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      {/* Enhanced Search Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-6">
            {/* Main Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by location, suburb, or address..."
                  value={filters.location}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10 py-3 text-lg"
                />
                
                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, location: suggestion }))
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                          {suggestion}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3"
              >
                <Sliders className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <Button
                onClick={fetchProperties}
                className="bg-[#FF5A5F] hover:bg-[#E8474B] px-8 py-3"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Price Range */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Price Range (per week)
                      </Label>
                      <div className="space-y-3">
                        <Slider
                          value={[filters.minPrice, filters.maxPrice]}
                          onValueChange={([min, max]) => 
                            setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))
                          }
                          max={2000}
                          min={0}
                          step={50}
                          className="w-full"
                        />
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>${filters.minPrice}</span>
                          <span>${filters.maxPrice}+</span>
                        </div>
                      </div>
                    </div>

                    {/* Property Type */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Property Type
                      </Label>
                      <select
                        value={filters.propertyType}
                        onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      >
                        <option value="all">All Types</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="studio">Studio</option>
                        <option value="room">Room</option>
                      </select>
                    </div>

                    {/* Bedrooms */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Bedrooms
                      </Label>
                      <select
                        value={filters.bedrooms}
                        onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      >
                        <option value="any">Any</option>
                        <option value="1">1+ Bedroom</option>
                        <option value="2">2+ Bedrooms</option>
                        <option value="3">3+ Bedrooms</option>
                        <option value="4">4+ Bedrooms</option>
                      </select>
                    </div>

                    {/* Available From */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Available From
                      </Label>
                      <Input
                        type="date"
                        value={filters.availableFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, availableFrom: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Feature Checkboxes */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Label className="text-sm font-medium text-gray-700 mb-4 block">
                      Property Features
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="furnished"
                          checked={filters.isFurnished === true}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, isFurnished: checked ? true : null }))
                          }
                        />
                        <Label htmlFor="furnished" className="text-sm">Furnished</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pets"
                          checked={filters.petsAllowed === true}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, petsAllowed: checked ? true : null }))
                          }
                        />
                        <Label htmlFor="pets" className="text-sm">Pets Allowed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="utilities"
                          checked={filters.utilitiesIncluded === true}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, utilitiesIncluded: checked ? true : null }))
                          }
                        />
                        <Label htmlFor="utilities" className="text-sm">Utilities Included</Label>
                      </div>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                    <Button 
                      onClick={() => setShowFilters(false)}
                      className="bg-[#FF5A5F] hover:bg-[#E8474B]"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Summary and View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{properties.length}</span> properties found
                  {userLocation && ' • Sorted by distance'}
                </p>
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {filters.location}
                  </Badge>
                )}
              </div>
              
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
                  <MapPin className="h-4 w-4 mr-1" />
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
          <div className="flex h-[calc(100vh-250px)]">
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
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
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
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    No properties found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or explore different locations across New Zealand.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={clearFilters} className="bg-[#FF5A5F] hover:bg-[#E8474B]">
                      Clear All Filters
                    </Button>
                    <Button variant="outline" onClick={() => setFilters(prev => ({ ...prev, location: 'Auckland' }))}>
                      Search Auckland
                    </Button>
                  </div>
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
          <div className="w-28 h-24 flex-shrink-0">
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 p-3">
            <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
              {property.title}
            </h4>
            <p className="text-xs text-gray-500 mb-2">
              {property.suburb}, {property.city}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#FF5A5F]">
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
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <Bed className="h-3 w-3 mr-1" />
              {property.bedrooms}
              <Bath className="h-3 w-3 ml-2 mr-1" />
              {property.bathrooms}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  )
}

// Enhanced property card with distance and better design
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
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <Link href={`/properties/${property.id}`}>
          <div className="flex">
            <div className="w-64 h-48 flex-shrink-0">
              <img
                src={mainImage}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 mb-2">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-gray-500 mb-3">
                    <MapPin size={16} className="mr-2" />
                    {property.suburb}, {property.city}
                    {showDistance && property.distance && (
                      <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {property.distance < 1000
                          ? `${Math.round(property.distance)}m away`
                          : `${(property.distance / 1000).toFixed(1)}km away`}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsFavorite(!isFavorite)
                  }}
                >
                  <Heart
                    size={20}
                    className={isFavorite ? 'fill-[#FF5A5F] text-[#FF5A5F]' : 'text-gray-400'}
                  />
                </Button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(property.price_per_week)}
                  </span>
                  <span className="text-gray-500 ml-1">/ week</span>
                </div>
                <div className="flex items-center">
                  <Star size={16} className="text-[#FF5A5F] fill-current mr-1" />
                  <span className="font-medium">4.8</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center text-gray-600">
                  <Bed className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.bedrooms} bed</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Bath className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.bathrooms} bath</span>
                </div>
                {property.parking_spaces > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Car className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.parking_spaces} parking</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {property.property_type}
                </Badge>
                {property.is_furnished && (
                  <Badge variant="secondary">Furnished</Badge>
                )}
                {property.pets_allowed && (
                  <Badge variant="secondary">Pets OK</Badge>
                )}
                {property.internet_included && (
                  <Badge variant="secondary">
                    <Wifi className="h-3 w-3 mr-1" />
                    WiFi
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
    <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <Link href={`/properties/${property.id}`}>
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
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
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
          >
            <Heart
              size={18}
              className={isFavorite ? 'fill-[#FF5A5F] text-[#FF5A5F]' : 'text-gray-600'}
            />
          </button>

          {showDistance && property.distance && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full shadow-lg">
              {property.distance < 1000
                ? `${Math.round(property.distance)}m`
                : `${(property.distance / 1000).toFixed(1)}km`}
            </div>
          )}

          {property.compliance_status === 'compliant' && (
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              ✓ Compliant
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                {property.title}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin size={14} className="mr-1" />
                {property.suburb}, {property.city}
              </div>
            </div>
            <div className="flex items-center ml-2">
              <Star size={14} className="text-[#FF5A5F] fill-current" />
              <span className="text-sm font-medium ml-1">4.8</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.bedrooms}
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.bathrooms}
            </div>
            {property.parking_spaces > 0 && (
              <div className="flex items-center">
                <Car className="h-4 w-4 mr-1" />
                {property.parking_spaces}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(property.price_per_week)}
              </span>
              <span className="text-sm text-gray-500"> / week</span>
            </div>
            <Badge variant="secondary" className="capitalize">
              {property.property_type}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1">
            {property.is_furnished && (
              <Badge variant="outline" className="text-xs">
                Furnished
              </Badge>
            )}
            {property.pets_allowed && (
              <Badge variant="outline" className="text-xs">
                Pets OK
              </Badge>
            )}
            {property.internet_included && (
              <Badge variant="outline" className="text-xs">
                <Wifi className="h-3 w-3 mr-1" />
                WiFi
              </Badge>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}