// app/search/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, Filter, Grid, List, Star, Heart, Navigation, Sliders, Calendar, Users, Home as HomeIcon, DollarSign, Bed, Bath, Car, Wifi, Search, ChevronDown, X } from 'lucide-react'
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
import { initGoogleMaps, isMapsReady, geocodeAddress, calculateDistance, searchPlaces, nzSuburbs } from '@/lib/maps'
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
  const [searchCenter, setSearchCenter] = useState<{ lat: number, lng: number } | null>(null)

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

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return

      const ready = await initGoogleMaps()
      if (ready && !map) {
        const google = window.google
        let initialCenter = { lat: -36.8485, lng: 174.7633 } // Auckland center

        // If we have a search location, try to geocode it
        if (filters.location) {
          const geocoded = await geocodeAddress(filters.location + ', New Zealand')
          if (geocoded) {
            initialCenter = geocoded
            setSearchCenter(geocoded)
          }
        }

        try {
          const newMap = new google.maps.Map(mapRef.current, {
            zoom: filters.location ? 13 : 11,
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
      const suggestions = nzSuburbs.filter(loc => 
        loc.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
      setSearchSuggestions(suggestions)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  // Fetch properties with enhanced filtering and location-based search
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

      // Location-based filtering with geocoding
      if (filters.location) {
        // Try to geocode the location first
        const geocoded = await geocodeAddress(filters.location + ', New Zealand')
        if (geocoded) {
          setSearchCenter(geocoded)
          // For now, we'll use text-based search since we don't have lat/lng in all properties
          query = query.or(`suburb.ilike.%${filters.location}%,city.ilike.%${filters.location}%,address.ilike.%${filters.location}%`)
        } else {
          query = query.or(`suburb.ilike.%${filters.location}%,city.ilike.%${filters.location}%,address.ilike.%${filters.location}%`)
        }
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

      // Calculate distances if we have a search center or user location
      const referenceLocation = searchCenter || userLocation
      if (referenceLocation && isMapsReady()) {
        propertiesWithDistance = await Promise.all(
          (data || []).map(async (property) => {
            if (property.latitude && property.longitude) {
              const distance = await calculateDistance(
                referenceLocation,
                { lat: property.latitude, lng: property.longitude }
              )
              return { ...property, distance }
            }
            return property
          })
        )

        // Sort by distance
        propertiesWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
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
              <svg width="50" height="60" viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 0C11.193 0 0 11.193 0 25c0 25 25 35 25 35s25-10 25-35c0-13.807-11.193-25-25-25z" fill="#FF5A5F"/>
                <circle cx="25" cy="25" r="12" fill="white"/>
                <text x="25" y="29" text-anchor="middle" fill="#FF5A5F" font-size="8" font-weight="bold">$${Math.round(property.price_per_week)}</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(50, 60),
            anchor: new window.google.maps.Point(25, 60)
          }
        })

        // Add click listener to marker
        marker.addListener('click', () => {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 16px; min-width: 280px; font-family: Inter, sans-serif;">
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #111827;">${property.title}</h3>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${property.suburb}, ${property.city}</p>
                <p style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #FF5A5F;">${formatPrice(property.price_per_week)}/week</p>
                <div style="margin: 8px 0; display: flex; gap: 8px;">
                  <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">${property.bedrooms} bed</span>
                  <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">${property.bathrooms} bath</span>
                  <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500; text-transform: capitalize;">${property.property_type}</span>
                </div>
                ${property.distance ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">📍 ${(property.distance / 1000).toFixed(1)}km away</p>` : ''}
                <a href="/properties/${property.id}" style="display: inline-block; margin-top: 12px; padding: 8px 16px; background: #FF5A5F; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; transition: background-color 0.2s;">View Details</a>
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
      if (searchCenter) {
        bounds.extend(searchCenter)
      }
      map.fitBounds(bounds)
      
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(map, 'bounds_changed', () => {
        if (map.getZoom() && map.getZoom()! > 16) {
          map.setZoom(16)
        }
        window.google.maps.event.removeListener(listener)
      })
    }
  }

  // Search by map area
  const handleSearchThisArea = async () => {
    if (!map) return

    const bounds = map.getBounds()
    if (!bounds) return

    const center = bounds.getCenter()
    if (center) {
      // Try to reverse geocode the center to get a readable location
      try {
        const google = window.google
        const geocoder = new google.maps.Geocoder()
        
        geocoder.geocode({ location: center }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const addressComponents = results[0].address_components
            let suburb = ''
            let city = ''
            
            addressComponents?.forEach((component) => {
              if (component.types.includes('sublocality_level_1') || component.types.includes('suburb')) {
                suburb = component.long_name
              }
              if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                city = component.long_name
              }
            })
            
            const newLocation = suburb || city || 'Current area'
            setFilters(prev => ({ ...prev, location: newLocation }))
            setSearchCenter({ lat: center.lat(), lng: center.lng() })
          }
        })
      } catch (error) {
        console.error('Reverse geocoding failed:', error)
      }
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
    setSearchCenter(null)
  }

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 'all' && value !== 'any' && value !== null && 
    !(typeof value === 'number' && (value === 0 || value === 2000))
  ).length

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
                  placeholder="Search by location, suburb, or address in New Zealand..."
                  value={filters.location}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10 py-3 text-lg"
                />
                
                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-64 overflow-y-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, location: suggestion }))
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="font-medium">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 relative"
              >
                <Sliders className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-[#FF5A5F] text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              
              <Button
                onClick={fetchProperties}
                className="bg-[#FF5A5F] hover:bg-[#E8474B] px-8 py-3"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {filters.location}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, location: '' }))}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(filters.minPrice > 0 || filters.maxPrice < 2000) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    ${filters.minPrice} - ${filters.maxPrice}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, minPrice: 0, maxPrice: 2000 }))}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.propertyType !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                    <HomeIcon className="h-3 w-3" />
                    {filters.propertyType}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, propertyType: 'all' }))}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-[#FF5A5F] hover:text-[#E8474B] text-sm"
                >
                  Clear all
                </Button>
              </div>
            )}

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
                  {(userLocation || searchCenter) && ' • Sorted by distance'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#FF5A5F] hover:bg-[#E8474B]' : ''}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-[#FF5A5F] hover:bg-[#E8474B]' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className={viewMode === 'map' ? 'bg-[#FF5A5F] hover:bg-[#E8474B]' : ''}
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
          <div className="flex h-[calc(100vh-280px)]">
            {/* Map */}
            <div className="flex-1 relative">
              <div ref={mapRef} className="w-full h-full" />
              {map && (
                <Button
                  onClick={handleSearchThisArea}
                  className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white hover:bg-gray-50 text-gray-900 border shadow-lg z-10"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Search this area
                </Button>
              )}
              
              {loading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5A5F] mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading properties...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Property List Sidebar */}
            <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Properties ({properties.length})
                  </h3>
                  {(userLocation || searchCenter) && (
                    <Badge variant="secondary" className="text-xs">
                      By distance
                    </Badge>
                  )}
                </div>
                
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
                ) : properties.length > 0 ? (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <PropertyMapCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No properties found in this area</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="mt-3"
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Grid/List View */
          <div className="px-4 py-6 pb-24">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-300" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2" />
                      <div className="h-3 bg-gray-300 rounded w-2/3 mb-2" />
                      <div className="h-5 bg-gray-300 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    viewMode={viewMode as 'grid' | 'list'}
                    showDistance={!!(userLocation || searchCenter)}
                  />
                ))}
              </div>
            ) : (
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <Link href={`/properties/${property.id}`}>
        <div className="flex">
          <div className="w-28 h-24 flex-shrink-0 relative overflow-hidden">
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex-1 p-3">
            <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
              {property.title}
            </h4>
            <p className="text-xs text-gray-500 mb-2 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {property.suburb}, {property.city}
            </p>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-[#FF5A5F]">
                {formatPrice(property.price_per_week)}/wk
              </span>
              {property.distance && (
                <span className="text-xs text-blue-600 font-medium">
                  {property.distance < 1000
                    ? `${Math.round(property.distance)}m`
                    : `${(property.distance / 1000).toFixed(1)}km`}
                </span>
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Bed className="h-3 w-3 mr-1" />
              {property.bedrooms}
              <Bath className="h-3 w-3 ml-2 mr-1" />
              {property.bathrooms}
              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs capitalize">
                {property.property_type}
              </span>
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
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
        <Link href={`/properties/${property.id}`}>
          <div className="flex">
            <div className="w-64 h-48 flex-shrink-0 relative overflow-hidden">
              <img
                src={mainImage}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {showDistance && property.distance && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  {property.distance < 1000
                    ? `${Math.round(property.distance)}m`
                    : `${(property.distance / 1000).toFixed(1)}km`}
                </div>
              )}
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
            {showDistance && property.distance && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                {property.distance < 1000
                  ? `${Math.round(property.distance)}m away`
                  : `${(property.distance / 1000).toFixed(1)}km away`}
              </Badge>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}