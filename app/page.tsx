import { TopNavigation } from '@/components/ui/navigation'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedListings } from '@/components/home/featured-listings'
import { FeaturesSection } from '@/components/home/features-section'
import { HowItWorksSection } from '@/components/home/how-it-works'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { CTASection } from '@/components/home/cta-section'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <TopNavigation />
      <HeroSection />
      <FeaturedListings />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}