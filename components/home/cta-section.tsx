import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Home, Search, Mail, Phone, User } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#FF5A5F] to-[#E8474B]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          Whether you're looking to rent a room or manage properties, 
          Keyskeeper makes it simple, secure, and smart.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/list-property">
            <Button 
              size="lg" 
              className="bg-white text-[#FF5A5F] hover:bg-gray-50 px-8 py-4 text-lg font-semibold w-full sm:w-auto group"
            >
              <Home className="mr-2 h-5 w-5" />
              List My Property
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <Link href="/search">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-[#FF5A5F] px-8 py-4 text-lg font-semibold w-full sm:w-auto group bg-transparent"
            >
              <Search className="mr-2 h-5 w-5" />
              Find a Room
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="mt-16 pt-16 border-t border-white/20">
          <div className="text-center">
            <p className="text-white/80 mb-6 text-lg">Contact us directly</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-white">
              <a 
                href="mailto:admin@keyskeeper.co.nz"
                className="flex items-center gap-3 hover:text-white/80 transition-colors group"
              >
                <Mail className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">admin@keyskeeper.co.nz</span>
              </a>
              
              <a 
                href="tel:+64277771486"
                className="flex items-center gap-3 hover:text-white/80 transition-colors group"
              >
                <Phone className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">+64 27 777 1486</span>
              </a>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/70">
              <User className="h-4 w-4" />
              <span>Director: Mittal Dholakiya</span>
            </div>
          </div>
        </div>

        {/* Created by section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="text-center">
            <p className="text-white/60 text-sm">
              Created by{' '}
              <a 
                href="https://novanexus.nz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-white/80 transition-colors font-medium underline decoration-white/30 hover:decoration-white/60"
              >
                Novanexus.nz
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}