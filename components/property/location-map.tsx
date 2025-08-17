// components/property/location-map.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Coffee, ShoppingCart, Train, GraduationCap, Car, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { initGoogleMaps, isMapsReady, calculateDistance } from '@/lib/maps'

interface LocationMapProps {
  property: {
    id: string
    title: string
    address: string
    suburb: string
    city: string
    latitude?: number
    longitude?: number
  }
}

interface NearbyPlace {
  name: string
  type: string
  distance: number
  location: { lat: number, lng: number }
  rating?: number
  icon: any
}

export default function PropertyLocationMap({ property }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [travelTime, setTravelTime] = useState<{driving?: string, walking?: string, transit?: string} | null>(null)

  const propertyLocation = property.latitude && property.longitude 
    ? { lat: property.latitude, lng: property.longitude }
    : null

  useEffect(() => {
    const initMap = async () => {
      if (!propertyLocation) {
        setLoading(false)
        return
      }

      const ready = await initGoogleMaps()
      if (ready && mapRef.current && !map) {
        const google = window.google
        
        const newMap = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: propertyLocation,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'simplified' }]
            }
          ]
        })
        
        // Add property marker
        const propertyMarker = new google.maps.Marker({
          position: propertyLocation,
          map: newMap,
          title: property.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 0C8.954 0 0 8.954 0 20c0 20 20 30 20 30s20-10 20-30c0-11.046-8.954-20-20-20z" fill="#FF5A5F"/>
                <circle cx="20" cy="20" r="8" fill="white"/>
                <path d="M16 18h8v4h-8z" fill="#FF5A5F"/>
                <path d="M14 16h12v2h-12z" fill="#FF5A5F"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 50),
            anchor: new google.maps.Point(20, 50)
          }
        })
        
        // Add info window for property
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #FF5A5F;">${property.title}</h3>
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${property.address}</p>
              <p style="margin: 0; color: #666; font-size: 14px;">${property.suburb}, ${property.city}</p>
            </div>
          `
        })
        
        propertyMarker.addListener('click', () => {
          infoWindow.open(newMap, propertyMarker)
        })
        
        setMap(newMap)
        
        // Search for nearby places
        await searchNearbyPlaces(newMap, propertyLocation)
        
        // Get user location if available
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
                      <circle cx="12" cy="12" r="5" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(24, 24)
                }
              })
              
              // Calculate travel times
              await calculateTravelTimes(userPos, propertyLocation)
            },
            (error) => {
              console.log('Geolocation not available:', error)
            }
          )
        }
        
        setLoading(false)
      }
    }
    
    initMap()
  }, [propertyLocation, map])

  const searchNearbyPlaces = async (map: google.maps.Map, center: {lat: number, lng: number}) => {
    if (!isMapsReady()) return
    
    const google = window.google
    const service = new google.maps.places.PlacesService(map)
    
    const searchTypes = [
      { type: 'supermarket', icon: ShoppingCart, label: 'Supermarket' },
      { type: 'cafe', icon: Coffee, label: 'Cafe' },
      { type: 'restaurant', icon: Coffee, label: 'Restaurant' },
      { type: 'transit_station', icon: Train, label: 'Transport' },
      { type: 'school', icon: GraduationCap, label: 'School' },
      { type: 'university', icon: GraduationCap, label: 'University' }
    ]
    
    const allPlaces: NearbyPlace[] = []
    
    for (const searchType of searchTypes) {
      try {
        const places = await new Promise<google.maps.places.PlaceResult[]>((resolve) => {
          service.nearbySearch({
            location: center,
            radius: 1500, // 1.5km radius
            type: searchType.type as any
          }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results.slice(0, 2)) // Take top 2 of each type
            } else {
              resolve([])
            }
          })
        })
        
        for (const place of places) {
          if (place.geometry?.location && place.name) {
            const distance = await calculateDistance(
              center,
              { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
            )
            
            if (distance && distance <= 1500) {
              allPlaces.push({
                name: place.name,
                type: searchType.label,
                distance,
                location: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
                rating: place.rating,
                icon: searchType.icon
              })
              
              // Add marker to map
              const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="8" fill="#10B981" stroke="white" stroke-width="2"/>
                      <circle cx="10" cy="10" r="3" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(20, 20)
                }
              })
              
              const placeInfoWindow = new google.maps.InfoWindow({
                content: `
                  <div style="padding: 8px;">
                    <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${place.name}</h4>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${searchType.label}</p>
                    <p style="margin: 0; font-size: 12px; color: #666;">${(distance / 1000).toFixed(1)}km away</p>
                    ${place.rating ? `<p style="margin: 4px 0 0 0; font-size: 12px;">⭐ ${place.rating}/5</p>` : ''}
                  </div>
                `
              })
              
              marker.addListener('click', () => {
                placeInfoWindow.open(map, marker)
              })
            }
          }
        }
      } catch (error) {
        console.error(`Error searching for ${searchType.type}:`, error)
      }
    }
    
    // Sort by distance and set
    setNearbyPlaces(allPlaces.sort((a, b) => a.distance - b.distance))
  }

  const calculateTravelTimes = async (from: {lat: number, lng: number}, to: {lat: number, lng: number}) => {
    if (!isMapsReady()) return
    
    const google = window.google
    const directionsService = new google.maps.DirectionsService()
    
    const travelModes = [
      { mode: google.maps.TravelMode.DRIVING, key: 'driving' },
      { mode: google.maps.TravelMode.WALKING, key: 'walking' },
      { mode: google.maps.TravelMode.TRANSIT, key: 'transit' }
    ]
    
    const times: any = {}
    
    for (const travel of travelModes) {
      try {
        const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
          directionsService.route({
            origin: from,
            destination: to,
            travelMode: travel.mode
          }, (result, status) => {
            if (status === 'OK' && result) {
              resolve(result)
            } else {
              reject(status)
            }
          })
        })
        
        if (result.routes[0]?.legs[0]?.duration?.text) {
          times[travel.key] = result.routes[0].legs[0].duration.text
        }
      } catch (error) {
        console.log(`${travel.key} directions not available`)
      }
    }
    
    setTravelTime(times)
  }

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  if (!propertyLocation) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Address</h3>
          <p className="text-gray-700">{property.address}, {property.suburb}, {property.city}</p>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Map will be available when property coordinates are added</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Address */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Address</h3>
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-gray-900 font-medium">{property.address}</p>
            <p className="text-gray-600">{property.suburb}, {property.city}</p>
          </div>
        </div>
      </div>

      {/* Travel Times */}
      {userLocation && travelTime && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Travel Time from Your Location</h4>
          <div className="grid grid-cols-3 gap-4">
            {travelTime.driving && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Car className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-blue-900">{travelTime.driving}</div>
                <div className="text-xs text-blue-700">Driving</div>
              </div>
            )}
            {travelTime.walking && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Navigation className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-green-900">{travelTime.walking}</div>
                <div className="text-xs text-green-700">Walking</div>
              </div>
            )}
            {travelTime.transit && (
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Train className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-purple-900">{travelTime.transit}</div>
                <div className="text-xs text-purple-700">Transit</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Map */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Location & Nearby</h4>
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-80 rounded-lg border border-gray-200"
          />
          {loading && (
            <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5A5F] mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nearby Places */}
      {nearbyPlaces.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">What's Nearby</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nearbyPlaces.slice(0, 8).map((place, index) => {
              const Icon = place.icon
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {place.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{place.type}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{formatDistance(place.distance)}</span>
                      {place.rating && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">⭐ {place.rating}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mock nearby info when map is not available */}
      {nearbyPlaces.length === 0 && !loading && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">What's Nearby</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'Countdown Supermarket', type: 'Supermarket', distance: '350m', icon: ShoppingCart },
              { name: 'Auckland Transport Hub', type: 'Transport', distance: '200m', icon: Train },
              { name: 'Local Cafe', type: 'Cafe', distance: '150m', icon: Coffee },
              { name: 'University of Auckland', type: 'University', distance: '1.2km', icon: GraduationCap }
            ].map((place, index) => {
              const Icon = place.icon
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{place.name}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{place.type}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{place.distance}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}