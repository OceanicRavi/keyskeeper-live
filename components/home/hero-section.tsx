'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function HeroSection() {
  // Commented out existing search functionality
  // const [location, setLocation] = useState('')
  // const [checkIn, setCheckIn] = useState('')
  // const [checkOut, setCheckOut] = useState('')

  // const handleSearch = () => {
  //   // Redirect to search page with parameters
  //   const params = new URLSearchParams()
  //   if (location) params.set('location', location)
  //   if (checkIn) params.set('checkIn', checkIn)
  //   if (checkOut) params.set('checkOut', checkOut)
  //   
  //   window.location.href = `/search?${params.toString()}`
  // }

  const handleTradeMeClick = () => {
    const tradeMeUrl = process.env.NEXT_PUBLIC_TRADEME_URL || 'https://www.trademe.co.nz'
    window.open(tradeMeUrl, '_blank')
  }

  return (
    <div className="relative h-[80vh] bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Room-by-room & whole-home property management
            <span className="block text-[#FF5A5F]">built for NZ</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-12 font-light">
            We are your Keys Keeper – we take care of your property
          </p>

          {/* Trade Me Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleTradeMeClick}
              className="bg-[#FF5A5F] hover:bg-[#E8474B] text-white px-12 py-6 rounded-full text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-4"
            >
              {/* Trade Me Logo */}
              <img 
                src="/trademelogo.svg" 
                alt="Trade Me" 
                width={164} 
                height={164} 
                className="object-contain"
              />
              
              View Our Listings
              
              <ExternalLink className="h-6 w-6" />
            </Button>
          </div>

          {/* Commented out original search bar */}
          {/* 
          <div className="bg-white rounded-full shadow-2xl p-2 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-3">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Auckland, Wellington, Christchurch..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-0 p-0 text-base font-medium placeholder-gray-500 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px bg-gray-300" />

              <div className="flex-1 flex items-center px-4 py-3">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex-1">
                  <Input
                    type="date"
                    placeholder="Check in"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="border-0 p-0 text-base font-medium placeholder-gray-500 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px bg-gray-300" />

              <div className="flex-1 flex items-center px-4 py-3">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex-1">
                  <Input
                    type="date"
                    placeholder="Check out"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="border-0 p-0 text-base font-medium placeholder-gray-500 focus-visible:ring-0"
                  />
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="bg-[#FF5A5F] hover:bg-[#E8474B] text-white px-8 py-3 rounded-full h-auto font-semibold text-base"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
          */}
        </div>
      </div>
    </div>
  )
}