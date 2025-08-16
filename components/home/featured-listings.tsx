'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase, Property } from '@/lib/supabase'
import { formatPrice } from '@/lib/stripe'

export function FeaturedListings() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('is_available', true)
          .order('created_at', { ascending: false })
          .limit(12)

        if (error) throw error
        setProperties(data || [])
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProperties()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover quality rental properties across New Zealand
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-300 rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2" />
                  <div className="h-3 bg-gray-300 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover quality rental properties across New Zealand, from single rooms to entire homes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/search">
            <Button 
              variant="outline" 
              className="border-[#FF5A5F] text-[#FF5A5F] hover:bg-[#FF5A5F] hover:text-white px-8 py-3"
            >
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function PropertyCard({ property }: { property: Property }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const mainImage = property.images?.[0] || 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg'

  return (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/properties/${property.id}`}>
        <div className="relative">
          <div className="aspect-square overflow-hidden">
            <Image
              src={mainImage}
              alt={property.title}
              width={400}
              height={400}
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

          <div className="flex items-center justify-between">
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

          <div className="mt-3 flex flex-wrap gap-1">
            {property.is_furnished && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Furnished
              </span>
            )}
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
              {property.property_type}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}