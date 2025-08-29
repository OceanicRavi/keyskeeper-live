'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, ExternalLink, ArrowRight, FileText, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export function HeroSection() {
  const [location, setLocation] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    window.location.href = `/search?${params.toString()}`
  }

  const handleTradeMeClick = () => {
    const tradeMeUrl = process.env.NEXT_PUBLIC_TRADEME_URL || 'https://www.trademe.co.nz'
    window.open(tradeMeUrl, '_blank')
  }

  const handlePropertyAppraisal = () => {
    window.location.href = '/property-appraisal'
  }

  const handlePropertyMaintenance = () => {
    window.location.href = '/maintenance-request'
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-12">
        <div className="max-w-5xl mx-auto w-full">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Room-by-room & whole-home property management
            <span className="block text-blue-200">built for NZ</span>
          </h1>
                    
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 font-light">
            We are your Keys Keeper – we take care of your property
          </p>

          {/* Property Search Bar */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl mb-8 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Where do you want to live? (Auckland, Wellington...)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-12 py-3 md:py-4 text-base md:text-lg border-0 focus:ring-2 focus:ring-[#FF5A5F] rounded-xl"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-[#FF5A5F] hover:bg-[#E8474B] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                Search Properties
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 md:mt-4 justify-center">
              {['Auckland Central', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setLocation(city)
                    const params = new URLSearchParams()
                    params.set('location', city)
                    window.location.href = `/search?${params.toString()}`
                  }}
                  className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-gray-600 hover:text-[#FF5A5F] hover:bg-gray-50 rounded-full transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          
          {/* Buttons Container */}
          <div className="flex flex-col items-center gap-4 md:gap-6">
            {/* Trade Me Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleTradeMeClick}
                className="bg-[#FF5A5F] hover:bg-[#E8474B] text-white px-6 md:px-12 py-4 md:py-6 rounded-full text-lg md:text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 md:gap-4"
              >
                {/* Trade Me Logo */}
                <img 
                  src="/trademelogo.svg"
                  alt="Trade Me"
                  width={120}
                  height={120}
                  className="object-contain w-20 md:w-32 h-auto"
                />
                
                View Our Listings
                
                <ExternalLink className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>

            {/* Two Buttons Side by Side */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center w-full max-w-4xl">
              <Button
                onClick={handlePropertyAppraisal}
                className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 md:px-10 py-3 md:py-5 rounded-full text-base md:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 border-2 border-transparent hover:border-cyan-200 flex-1 sm:flex-none"
              >
                <FileText className="h-5 w-5 md:h-6 md:w-6" />
                Property Appraisal
                <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
              </Button>

              <Button
                onClick={handlePropertyMaintenance}
                className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 md:px-10 py-3 md:py-5 rounded-full text-base md:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 border-2 border-transparent hover:border-cyan-200 flex-1 sm:flex-none"
              >
                <Wrench className="h-5 w-5 md:h-6 md:w-6" />
                Property Maintenance
                <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}