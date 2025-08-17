// components/home/hero-section.tsx
'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function HeroSection() {
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const handleSearch = () => {
    // Redirect to search page with parameters
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    
    window.location.href = `/search?${params.toString()}`
  }

  return (
    <div className="relative min-h-[80vh] sm:h-[80vh] bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 py-8 sm:py-0">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Room-by-room & whole-home property management
            <span className="block text-[#FF5A5F]">built for NZ</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 md:mb-12 font-light px-2">
            We are your Keys Keeper – we take care of your property
          </p>

          {/* Search Bar - Mobile First Design */}
          <div className="bg-white rounded-2xl sm:rounded-full shadow-2xl p-3 sm:p-2 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-col md:flex-row gap-3 sm:gap-2">
              {/* Location */}
              <div className="flex-1 flex items-center px-3 sm:px-4 py-3">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <label className="block text-xs sm:hidden text-gray-500 mb-1">Location</label>
                  <Input
                    type="text"
                    placeholder="Auckland, Wellington, Christchurch..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-0 p-0 text-sm sm:text-base font-medium placeholder-gray-500 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px bg-gray-300" />

              {/* Check In */}
              <div className="flex-1 flex items-center px-3 sm:px-4 py-3">
                <Calendar className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <label className="block text-xs sm:hidden text-gray-500 mb-1">Check in</label>
                  <Input
                    type="date"
                    placeholder="Check in"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="border-0 p-0 text-sm sm:text-base font-medium placeholder-gray-500 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px bg-gray-300" />

              {/* Check Out */}
              <div className="flex-1 flex items-center px-3 sm:px-4 py-3">
                <Calendar className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <label className="block text-xs sm:hidden text-gray-500 mb-1">Check out</label>
                  <Input
                    type="date"
                    placeholder="Check out"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="border-0 p-0 text-sm sm:text-base font-medium placeholder-gray-500 focus-visible:ring-0"
                  />
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                className="bg-[#FF5A5F] hover:bg-[#E8474B] text-white px-6 sm:px-8 py-3 rounded-xl sm:rounded-full h-auto font-semibold text-sm sm:text-base w-full sm:w-auto mt-2 sm:mt-0"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}