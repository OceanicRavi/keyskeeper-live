/// <reference types="google.maps" />
import { Loader } from '@googlemaps/js-api-loader'

// Simple interface to avoid complex Google types
interface GoogleMaps {
  maps: any
}

interface SimpleLocation {
  lat: number
  lng: number
}

interface SimplePlace {
  name: string
  address: string
  location: SimpleLocation
  suburb?: string
  city?: string
  postcode?: string
  placeId?: string
}

let mapsLoader: Loader | null = null
let isLoading = false
let isLoaded = false

// Initialize Google Maps
export const initGoogleMaps = async (): Promise<boolean> => {
  // Return early if already loaded
  if (isLoaded) return true
  
  // Return early if already loading
  if (isLoading) return false
  
  // Check if API key exists
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.warn('Google Maps API key not found')
    return false
  }

  try {
    isLoading = true
    
    if (!mapsLoader) {
      mapsLoader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry'],
        region: 'NZ',
        language: 'en',
      })
    }

    await mapsLoader.load()
    isLoaded = true
    isLoading = false
    return true
  } catch (error) {
    console.error('Failed to load Google Maps:', error)
    isLoading = false
    return false
  }
}

// Check if Google Maps is ready
export const isMapsReady = (): boolean => {
  return isLoaded && typeof window !== 'undefined' && !!window.google?.maps
}

// Geocode an address
export const geocodeAddress = async (address: string): Promise<SimpleLocation | null> => {
  const ready = await initGoogleMaps()
  if (!ready || !isMapsReady()) return null

  try {
    const geocoder = new window.google.maps.Geocoder()
    
    return new Promise((resolve) => {
      geocoder.geocode(
        {
          address,
          region: 'NZ',
          componentRestrictions: { country: 'NZ' }
        },
        (results: any, status: any) => {
          if (status === 'OK' && results?.[0]) {
            const location = results[0].geometry.location
            resolve({
              lat: location.lat(),
              lng: location.lng()
            })
          } else {
            resolve(null)
          }
        }
      )
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Reverse geocode coordinates
export const reverseGeocode = async (location: SimpleLocation): Promise<SimplePlace | null> => {
  const ready = await initGoogleMaps()
  if (!ready || !isMapsReady()) return null

  try {
    const geocoder = new window.google.maps.Geocoder()
    
    return new Promise((resolve) => {
      geocoder.geocode(
        { location: { lat: location.lat, lng: location.lng } },
        (results: any, status: any) => {
          if (status === 'OK' && results?.[0]) {
            const result = results[0]
            const components = result.address_components || []
            
            let suburb = ''
            let city = ''
            let postcode = ''
            
            components.forEach((component: any) => {
              const types = component.types || []
              if (types.includes('sublocality_level_1') || types.includes('suburb')) {
                suburb = component.long_name
              }
              if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                city = component.long_name
              }
              if (types.includes('postal_code')) {
                postcode = component.long_name
              }
            })

            resolve({
              name: result.formatted_address,
              address: result.formatted_address,
              location,
              suburb,
              city,
              postcode,
              placeId: result.place_id
            })
          } else {
            resolve(null)
          }
        }
      )
    })
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

// Search for places
export const searchPlaces = async (query: string, location?: SimpleLocation): Promise<SimplePlace[]> => {
  const ready = await initGoogleMaps()
  if (!ready || !isMapsReady()) return []

  try {
    const tempDiv = document.createElement('div')
    const service = new window.google.maps.places.PlacesService(tempDiv)
    
    return new Promise((resolve) => {
      const request: any = {
        query,
        region: 'NZ'
      }

      if (location) {
        request.location = new window.google.maps.LatLng(location.lat, location.lng)
        request.radius = 50000
      }

      service.textSearch(request, (results: any, status: any) => {
        if (status === 'OK' && results) {
          const places: SimplePlace[] = results.map((place: any) => ({
            name: place.name || '',
            address: place.formatted_address || '',
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            },
            placeId: place.place_id
          }))
          resolve(places)
        } else {
          resolve([])
        }
      })
    })
  } catch (error) {
    console.error('Places search error:', error)
    return []
  }
}

// Calculate distance between two points
export const calculateDistance = async (from: SimpleLocation, to: SimpleLocation): Promise<number | null> => {
  const ready = await initGoogleMaps()
  if (!ready || !isMapsReady()) return null

  try {
    const fromLatLng = new window.google.maps.LatLng(from.lat, from.lng)
    const toLatLng = new window.google.maps.LatLng(to.lat, to.lng)
    
    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng)
    return distance
  } catch (error) {
    console.error('Distance calculation error:', error)
    return null
  }
}

// Mock implementations for development
export const mockGeocodeAddress = async (address: string): Promise<SimpleLocation> => {
  // Mock Auckland coordinates with slight randomization
  return {
    lat: -36.8485 + (Math.random() - 0.5) * 0.1,
    lng: 174.7633 + (Math.random() - 0.5) * 0.1
  }
}

export const mockSearchPlaces = async (query: string): Promise<SimplePlace[]> => {
  const mockPlaces = [
    'Auckland Central', 'Ponsonby', 'Parnell', 'Newmarket', 'Mt Eden',
    'Grey Lynn', 'Kingsland', 'Morningside', 'St Lukes', 'Sandringham'
  ]
  
  return mockPlaces
    .filter(name => name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(name => ({
      name,
      address: `${name}, Auckland, New Zealand`,
      location: {
        lat: -36.8485 + (Math.random() - 0.5) * 0.1,
        lng: 174.7633 + (Math.random() - 0.5) * 0.1
      },
      suburb: name,
      city: 'Auckland'
    }))
}

// Utility functions
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// New Zealand suburbs for autocomplete
export const nzSuburbs = [
  // Auckland
  'Auckland Central', 'Ponsonby', 'Parnell', 'Newmarket', 'Mt Eden', 'Grey Lynn',
  'Kingsland', 'Morningside', 'Remuera', 'Epsom', 'Grafton', 'Freemans Bay',
  'Herne Bay', 'St Marys Bay', 'Devonport', 'Takapuna', 'Milford', 'Browns Bay',
  'Manukau', 'Papakura', 'Henderson', 'New Lynn', 'Glen Eden', 'Titirangi',
  
  // Wellington
  'Wellington Central', 'Te Aro', 'Mount Victoria', 'Oriental Bay', 'Thorndon',
  'Kelburn', 'Karori', 'Island Bay', 'Newtown', 'Mount Cook', 'Johnsonville',
  
  // Christchurch
  'Christchurch Central', 'Riccarton', 'Merivale', 'Fendalton', 'Ilam',
  'Addington', 'Sydenham', 'St Albans', 'Papanui', 'Linwood', 'Sumner',
  
  // Other cities
  'Hamilton East', 'Hamilton West', 'Tauranga', 'Mount Maunganui', 'Rotorua',
  'Palmerston North', 'Napier', 'Hastings', 'New Plymouth', 'Whangarei',
  'Dunedin Central', 'Invercargill', 'Nelson', 'Blenheim', 'Timaru'
]

// Export types for external use
export type { SimpleLocation as Location, SimplePlace as PlaceResult }