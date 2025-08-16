'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Home, Search, User, Building, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TopNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/keyskeeperlogo.png"
              alt="Keyskeeper"
              width={120}
              height={70}
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-700 hover:text-[#FF5A5F]">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup?role=landlord">
              <Button className="bg-[#FF5A5F] hover:bg-[#E8474B] text-white">
                List My Property
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-[#FF5A5F] p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/auth/login" 
                className="flex items-center px-4 py-2 text-gray-700 hover:text-[#FF5A5F] hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="h-4 w-4 mr-3" />
                Sign In
              </Link>
              <Link 
                href="/auth/signup?role=landlord" 
                className="mx-4"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full bg-[#FF5A5F] hover:bg-[#E8474B] text-white">
                  List My Property
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden safe-area-pb z-50">
      <div className="grid grid-cols-4 h-16">
        <Link href="/" className="flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-[#FF5A5F]">
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Link>
        
        <Link href="/search" className="flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-[#FF5A5F]">
          <Search className="h-5 w-5" />
          <span className="text-xs">Search</span>
        </Link>
        
        <Link href="/auth/signup?role=landlord" className="flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-[#FF5A5F]">
          <Building className="h-5 w-5" />
          <span className="text-xs">List</span>
        </Link>
        
        <Link href="/auth/login" className="flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-[#FF5A5F]">
          <User className="h-5 w-5" />
          <span className="text-xs">Account</span>
        </Link>
      </div>
    </nav>
  )
}