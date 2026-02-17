import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Shield, 
  Clock,
  ArrowRight,
  CheckCircle,
  Users,
  Search
} from 'lucide-react'
import Link from 'next/link'
export const metadata = {
  title: 'Find Rentals in New Zealand | Keyskeeper',
  alternates: { canonical: 'https://www.keyskeeper.co.nz/tenant' }
}
const features = [
  {
    icon: Calendar,
    title: 'Book Viewings Instantly',
    description: 'See available time slots and book property viewings without waiting for callbacks.',
    benefits: ['Real-time availability', 'Instant confirmation', 'Automated reminders']
  },
  {
    icon: FileText,
    title: 'Reusable Profile',
    description: 'Create your tenant profile once and apply to multiple properties with one click.',
    benefits: ['Pre-filled applications', 'Document storage', 'Reference verification']
  },
  {
    icon: CreditCard,
    title: 'Pay Rent Online',
    description: 'Secure payments in NZD with automatic receipts and payment history.',
    benefits: ['Automatic payments', 'Payment reminders', 'Digital receipts']
  },
  {
    icon: MessageSquare,
    title: 'Maintenance Requests',
    description: 'Report issues with photos and get real-time updates on repair progress.',
    benefits: ['Photo attachments', 'Progress tracking', 'Direct communication']
  },
  {
    icon: Shield,
    title: 'Compliance Protection',
    description: 'Know your rights with AI-powered compliance checking and tenant advocacy.',
    benefits: ['Rights information', 'Compliance alerts', 'Legal protection']
  },
  {
    icon: Search,
    title: 'Smart Matching',
    description: 'AI suggests properties that match your preferences, budget, and lifestyle.',
    benefits: ['Personalized recommendations', 'Budget matching', 'Lifestyle preferences']
  }
]

const benefits = [
  {
    title: 'Fast Applications',
    description: 'Pre-approved profiles mean faster application processing',
    stat: '24hr avg approval time'
  },
  {
    title: 'Lower Costs',
    description: 'No hidden fees or agent commissions',
    stat: 'Save up to $500'
  },
  {
    title: 'Better Support',
    description: '24/7 AI assistant plus human support when needed',
    stat: '95% satisfaction rate'
  }
]

export default function TenantPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2 mb-6">
            <Users className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">For Renters</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect Room
            <span className="block text-blue-200">in New Zealand</span>
          </h1>
          
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            From student accommodation to professional flatshares, discover quality 
            rental properties with transparent pricing and instant booking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold">
                <Search className="mr-2 h-5 w-5" />
                Start Searching
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/auth/signup?role=tenant">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold bg-transparent">
                Join the Waitlist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Tenants Love Keyskeeper
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've eliminated the frustrations of traditional rental processes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="text-3xl font-bold text-[#504746] mb-2">
                    {benefit.stat}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need as a Tenant
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From search to move-out, we've got every step of your rental journey covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="h-full hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-6">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Tenant Dashboard
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your rental, payments, and maintenance all in one place
            </p>
          </div>

          <Card className="overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-xl font-semibold">Tenant Dashboard</h3>
                  <p className="text-white/80">Welcome back, Sarah</p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Room 3A
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-800 font-medium">Next Payment</span>
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-900">$420</div>
                  <div className="text-sm text-green-700">Due in 5 days</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-800 font-medium">Lease Status</span>
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">Active</div>
                  <div className="text-sm text-blue-700">8 months remaining</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-800 font-medium">Maintenance</span>
                    <MessageSquare className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-900">1</div>
                  <div className="text-sm text-orange-700">request in progress</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="outline" className="justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Rent
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Lease
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find and secure your next rental in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Search Properties',
                description: 'Browse rooms and properties by location, price, and preferences',
                icon: Search
              },
              {
                step: '02',
                title: 'Create Profile',
                description: 'Build your reusable tenant profile with documents and references',
                icon: FileText
              },
              {
                step: '03',
                title: 'Book & Apply',
                description: 'Schedule viewings and submit applications with one click',
                icon: Calendar
              },
              {
                step: '04',
                title: 'Move In',
                description: 'Sign lease digitally and start managing everything online',
                icon: CheckCircle
              }
            ].map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                    <span className="text-lg font-bold">{step.step}</span>
                  </div>
                  <Icon className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Next Home?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied tenants who found their perfect rental 
            through Keyskeeper. Start your search today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-[#504746] hover:bg-[#06b6d4] px-8 py-4 text-lg font-semibold">
                <Search className="mr-2 h-5 w-5" />
                Start Searching
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/auth/signup?role=tenant">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold bg-transparent">
                Create Profile
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-400 mt-6">
            Questions? We're here to help at admin@keyskeeper.co.nz
          </p>
        </div>
      </section>

      <BottomNavigation />
    </div>
  )
}