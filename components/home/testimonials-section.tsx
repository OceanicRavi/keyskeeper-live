'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Landlord',
    location: 'Auckland',
    rating: 5,
    text: 'Keyskeeper has transformed how I manage my rental properties. The AI compliance alerts saved me from potential fines, and the per-room management is perfect for my student accommodation.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
  },
  {
    name: 'James Wilson',
    role: 'Tenant',
    location: 'Wellington',
    rating: 5,
    text: 'Found my perfect room in Wellington within days. The booking process was seamless, and paying rent online is so convenient. The maintenance requests are handled quickly too.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
  },
  {
    name: 'Emma Rodriguez',
    role: 'Property Manager',
    location: 'Christchurch',
    rating: 5,
    text: 'Managing 20+ properties became effortless with Keyskeeper. The AI assistant handles most tenant inquiries automatically, saving me hours each week.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
  },
  {
    name: 'Mike Thompson',
    role: 'Student',
    location: 'Hamilton',
    rating: 5,
    text: 'As an international student, finding accommodation was stressful until I found Keyskeeper. The platform made everything clear and transparent.',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg'
  },
  {
    name: 'Lisa Park',
    role: 'Landlord',
    location: 'Tauranga',
    rating: 5,
    text: 'The market insights feature helped me price my properties perfectly. I\'m getting better tenants and higher returns than ever before.',
    avatar: 'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg'
  }
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3)
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2)
      } else {
        setItemsPerView(1)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, testimonials.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [maxIndex])

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Community Says
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied landlords and tenants who trust Keyskeeper 
            for their rental needs across New Zealand.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(testimonials.length / itemsPerView) * 100}%`
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="px-3"
                  style={{ width: `${100 / testimonials.length}%` }}
                >
                  <Card className="h-full border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className="text-[#FF5A5F] fill-current" 
                          />
                        ))}
                      </div>
                      
                      <blockquote className="text-gray-700 mb-6 leading-relaxed">
                        "{testimonial.text}"
                      </blockquote>
                      
                      <div className="flex items-center">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {testimonial.role} • {testimonial.location}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg border-0 hover:bg-gray-50"
          >
            <ChevronLeft size={20} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg border-0 hover:bg-gray-50"
          >
            <ChevronRight size={20} />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(maxIndex + 1)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-[#FF5A5F]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}