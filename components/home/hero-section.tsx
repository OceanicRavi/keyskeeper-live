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
            <span className="block text-blue-200">built for NZ</span>
          </h1>
                    
          <p className="text-xl md:text-2xl text-gray-200 mb-12 font-light">
            We are your Keys Keeper – we take care of your property
          </p>

          {/* Property Search Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl mb-12 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Where do you want to live? (Auckland, Wellington...)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-12 py-4 text-lg border-0 focus:ring-2 focus:ring-[#FF5A5F] rounded-xl"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-[#FF5A5F] hover:bg-[#E8474B] text-white px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                Search Properties
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Auckland Central', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setLocation(city)
                    const params = new URLSearchParams()
                    params.set('location', city)
                    window.location.href = `/search?${params.toString()}`
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-[#FF5A5F] hover:bg-gray-50 rounded-full transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          {/* Buttons Container */}
          <div className="flex flex-col items-center gap-6">
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

            {/* Two Buttons Side by Side */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center mt-6">
              <Button
                onClick={handlePropertyAppraisal}
                className="bg-cyan-400 hover:bg-cyan-300 text-white px-12 py-6 rounded-full text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-4 border-2 border-transparent hover:border-cyan-200"
              >
                <FileText className="h-6 w-6" />
                Property Appraisal
                <ArrowRight className="h-6 w-6" />
              </Button>

              <Button
                onClick={handlePropertyMaintenance}
                className="bg-cyan-400 hover:bg-cyan-300 text-white px-12 py-6 rounded-full text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-4 border-2 border-transparent hover:border-cyan-200"
              >
                <Wrench className="h-6 w-6" />
                Property Maintenance
                <ArrowRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}