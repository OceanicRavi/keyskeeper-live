'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, ExternalLink, ArrowRight, FileText, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <>
      <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Background Image https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2 */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
          style={{
            backgroundImage: 'url("/hero-section1.png")'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-12">
          <div className="max-w-5xl mx-auto w-full">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Room-by-room & whole-home property management
              <span className="block text-[#06b6d4]">built for NZ</span>
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
                    placeholder="Where do you want to live?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-12 py-3 md:py-4 text-base md:text-lg border-0 focus:ring-2 focus:ring-[#504746] rounded-xl"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-[#504746] hover:bg-[#06b6d4] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl flex items-center gap-2"
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
                    className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-gray-600 hover:text-[#504746] hover:bg-gray-50 rounded-full transition-colors"
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
                  className="bg-[#504746] hover:bg-[#06b6d4] text-white px-6 md:px-12 py-4 md:py-6 rounded-full text-lg md:text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 md:gap-4"
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

        {/* New Zealand Map Background Section */}
        <div className="relative bg-white py-16 overflow-hidden">
          {/* Polygon Map Background */}
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")',
              filter: 'hue-rotate(120deg) saturate(1.5) brightness(1.2)'
            }}
          />
          
          {/* Geometric NZ Map Overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg
              viewBox="0 0 1200 800"
              className="w-full h-full object-contain"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* North Island - Geometric Polygon Style */}
              <polygon
                points="600,200 650,180 700,190 720,220 740,250 760,280 750,320 730,350 700,380 670,400 640,420 610,440 580,430 560,410 540,380 530,350 540,320 560,290 580,260 590,230"
                fill="url(#gradient1)"
                stroke="#10B981"
                strokeWidth="2"
                opacity="0.8"
              />
              
              {/* South Island - Geometric Polygon Style */}
              <polygon
                points="580,460 620,450 660,470 690,500 710,540 720,580 710,620 690,650 660,680 630,700 600,710 570,700 540,680 520,650 510,620 520,580 540,540 560,500"
                fill="url(#gradient2)"
                stroke="#3B82F6"
                strokeWidth="2"
                opacity="0.8"
              />
              
              {/* Stewart Island */}
              <polygon
                points="590,720 610,715 620,725 615,735 605,740 595,735"
                fill="url(#gradient3)"
                stroke="#8B5CF6"
                strokeWidth="1"
                opacity="0.8"
              />
              
              {/* Gradients for colorful effect */}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="#059669" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="#2563EB" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.6"/>
                </linearGradient>
              </defs>
              
              {/* Decorative dots for major cities */}
              <circle cx="640" cy="280" r="4" fill="#504746" opacity="0.8"/> {/* Auckland */}
              <circle cx="620" cy="380" r="3" fill="#504746" opacity="0.8"/> {/* Wellington */}
              <circle cx="650" cy="580" r="3" fill="#504746" opacity="0.8"/> {/* Christchurch */}
              <circle cx="580" cy="320" r="2" fill="#504746" opacity="0.8"/> {/* Hamilton */}
            </svg>
          </div>
          
          {/* Content overlay */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Trusted Across New Zealand
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              From Auckland to Invercargill, we're helping Kiwis find their perfect rental 
              and manage properties with confidence.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#504746] mb-2">1,200+</div>
                <div className="text-sm text-gray-600">Properties Listed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#504746] mb-2">15+</div>
                <div className="text-sm text-gray-600">Cities Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#504746] mb-2">98%</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#504746] mb-2">24/7</div>
                <div className="text-sm text-gray-600">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}