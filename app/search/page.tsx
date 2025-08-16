'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, Filter, Grid, List, Star, Heart } from 'lucide-react'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, Property } from '@/lib/supabase'
import { formatPrice } from '@/lib/stripe'
import Link from 'next/link'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMap, setShowMap] = useState(false)
  
  // Search filters
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [propertyType, setPropertyType] = useState('all')
  const [bedrooms, setBedrooms] = useState('any')

  useEffect(() => {
    fetchProperties()
  }, [location, minPrice, maxPrice, propertyType, bedrooms])

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
      setProperties(data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
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
                  placeholder="Auckland, Wellington, Christchurch..."
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
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24 text-sm"
                type="number"
              />
              
              <Input
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24 text-sm"
                type="number"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {properties.length} properties found
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
                  variant="outline"
                  size="sm"
                  disabled
                  className="opacity-50"
                  title="Map view available when Google Maps API is added"
                >
                  Map (Coming Soon)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
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
                viewMode={viewMode} 
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

      <BottomNavigation />
    </div>
  )
}

function PropertyCard({ property, viewMode }: { property: Property, viewMode: 'grid' | 'list' }) {
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