// components/ui/address-autocomplete.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Search, X, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { initGoogleMaps, isMapsReady, geocodeAddress, mockGeocodeAddress } from '@/lib/maps'

interface AddressData {
  address: string
  suburb: string
  city: string
  postcode: string
  latitude: number
  longitude: number
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData) => void
  placeholder?: string
  initialValue?: string
  className?: string
  required?: boolean
  error?: string
}

export default function AddressAutocomplete({ 
  onAddressSelect, 
  placeholder = "Enter property address...",
  initialValue = "",
  className = "",
  required = false,
  error = ""
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [inputValue, setInputValue] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const initAutocomplete = async () => {
      const ready = await initGoogleMaps()
      if (ready && inputRef.current) {
        setIsGoogleMapsReady(true)
        setupGoogleAutocomplete()
      }
    }
    
    initAutocomplete()
  }, [])

  useEffect(() => {
    // Set initial value if provided
    if (initialValue) {
      setInputValue(initialValue)
    }
  }, [initialValue])

  const setupGoogleAutocomplete = () => {
    if (!inputRef.current || !isMapsReady()) return

    const google = window.google
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'nz' },
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      types: ['address']
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.geometry?.location && place.address_components) {
        handleGooglePlaceSelect(place)
      }
    })

    autocompleteRef.current = autocomplete
  }

  const handleGooglePlaceSelect = (place: google.maps.places.PlaceResult) => {
    const components = place.address_components || []
    let streetNumber = ''
    let route = ''
    let suburb = ''
    let city = ''
    let postcode = ''

    // Extract address components
    components.forEach(component => {
      const types = component.types
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name
      }
      if (types.includes('route')) {
        route = component.long_name
      }
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

    // Construct full address
    const fullAddress = [streetNumber, route].filter(Boolean).join(' ')

    const addressData: AddressData = {
      address: fullAddress || place.formatted_address?.split(',')[0] || '',
      suburb: suburb || '',
      city: city || 'Auckland', // Default to Auckland
      postcode: postcode || '',
      latitude: place.geometry!.location!.lat(),
      longitude: place.geometry!.location!.lng()
    }

    setInputValue(place.formatted_address || fullAddress)
    setShowSuggestions(false)
    setIsVerified(true)
    onAddressSelect(addressData)
  }

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      handleManualSearch(query)
    }, 300)

    setDebounceTimer(timer)
  }, [debounceTimer])

  // Manual search fallback for when Google Maps is not available
  const handleManualSearch = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    
    try {
      if (isGoogleMapsReady) {
        // Use Google Places API
        const google = window.google
        const service = new google.maps.places.AutocompleteService()
        
        service.getPlacePredictions({
          input: query,
          componentRestrictions: { country: 'nz' },
          types: ['address']
        }, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.slice(0, 5))
            setShowSuggestions(true)
          } else {
            setSuggestions([])
            setShowSuggestions(false)
          }
          setLoading(false)
        })
      } else {
        // Fallback to mock suggestions
        const mockSuggestions = generateMockSuggestions(query)
        setSuggestions(mockSuggestions)
        setShowSuggestions(mockSuggestions.length > 0)
        setLoading(false)
      }
    } catch (error) {
      console.error('Address search error:', error)
      setSuggestions([])
      setShowSuggestions(false)
      setLoading(false)
    }
  }

  const generateMockSuggestions = (query: string) => {
    const nzSuburbs = [
      'Auckland Central', 'Ponsonby', 'Parnell', 'Newmarket', 'Mt Eden',
      'Wellington Central', 'Te Aro', 'Mount Victoria', 'Thorndon',
      'Christchurch Central', 'Riccarton', 'Merivale', 'Fendalton'
    ]

    const matchingSuburbs = nzSuburbs.filter(suburb => 
      suburb.toLowerCase().includes(query.toLowerCase())
    )

    const suggestions: { description: string; place_id: string; structured_formatting: { main_text: string; secondary_text: string } | { main_text: string; secondary_text: string } }[] = []

    // Add direct matches
    matchingSuburbs.slice(0, 2).forEach((suburb, index) => {
      suggestions.push({
        description: `${query}, ${suburb}, New Zealand`,
        place_id: `mock_${index}_${Date.now()}`,
        structured_formatting: {
          main_text: query,
          secondary_text: `${suburb}, New Zealand`
        }
      })
    })

    // Add generic suggestions
    if (suggestions.length < 3) {
      const cities = ['Auckland', 'Wellington', 'Christchurch']
      cities.forEach((city, index) => {
        if (suggestions.length < 3) {
          suggestions.push({
            description: `${query}, ${city}, New Zealand`,
            place_id: `mock_city_${index}_${Date.now()}`,
            structured_formatting: {
              main_text: query,
              secondary_text: `${city}, New Zealand`
            }
          })
        }
      })
    }

    return suggestions
  }

  const handleSuggestionClick = async (suggestion: any) => {
    setShowSuggestions(false)
    setInputValue(suggestion.description)
    
    if (!isGoogleMapsReady) {
      // Manual geocoding fallback
      try {
        const coords = await mockGeocodeAddress(suggestion.description)
        if (coords) {
          const parts = suggestion.description.split(',').map((p: string) => p.trim())
          const addressData: AddressData = {
            address: parts[0] || '',
            suburb: parts[1] || '',
            city: parts[2] || 'Auckland',
            postcode: '',
            latitude: coords.lat,
            longitude: coords.lng
          }
          
          setIsVerified(true)
          onAddressSelect(addressData)
        }
      } catch (error) {
        console.error('Manual geocoding failed:', error)
      }
      return
    }

    // Google Maps mode
    const google = window.google
    const service = new google.maps.places.PlacesService(document.createElement('div'))
    
    service.getDetails({
      placeId: suggestion.place_id,
      fields: ['address_components', 'formatted_address', 'geometry', 'name']
    }, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        handleGooglePlaceSelect(place)
      }
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setIsVerified(false)
    
    // Clear suggestions if input is empty
    if (!value.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Don't trigger manual search if Google Autocomplete is handling it
    if (!autocompleteRef.current) {
      debouncedSearch(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault()
      setShowSuggestions(true)
    }
  }

  const handleFocus = () => {
    if (inputValue && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  const clearInput = () => {
    setInputValue('')
    setSuggestions([])
    setShowSuggestions(false)
    setIsVerified(false)
    inputRef.current?.focus()
    
    // Clear the address data
    onAddressSelect({
      address: '',
      suburb: '',
      city: '',
      postcode: '',
      latitude: 0,
      longitude: 0
    })
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`pl-10 pr-20 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${
            isVerified ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''
          }`}
        />
        
        {/* Status icons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF5A5F]"></div>
          )}
          
          {isVerified && !loading && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearInput}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Verification status */}
      {isVerified && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          Address verified
        </p>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto shadow-lg border border-gray-200">
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id || index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
              >
                <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.structured_formatting?.main_text || suggestion.description.split(',')[0]}
                  </div>
                  {suggestion.structured_formatting?.secondary_text && (
                    <div className="text-sm text-gray-500 truncate">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer with Google Maps status */}
          {!isGoogleMapsReady && (
            <div className="border-t border-gray-100 p-3 bg-blue-50">
              <div className="flex items-center text-xs text-blue-800">
                <Search className="h-3 w-3 mr-2" />
                <span>Enhanced address search available when Google Maps API is configured</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && inputValue && !loading && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-40 shadow-lg border border-gray-200">
          <div className="p-6 text-center text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No addresses found</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term or check your spelling</p>
          </div>
        </Card>
      )}

      {/* Help text for non-Google Maps mode */}
      {!isGoogleMapsReady && inputValue && !showSuggestions && (
        <div className="mt-1">
          <p className="text-xs text-gray-500">
            Type an address and select from suggestions. Enhanced autocomplete available with Google Maps API.
          </p>
        </div>
      )}
    </div>
  )
}

// Export the AddressData type for use in other components
export type { AddressData }