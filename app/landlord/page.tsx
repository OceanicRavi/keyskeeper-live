import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  DollarSign, 
  FileCheck, 
  Users, 
  Wrench, 
  BarChart,
  ArrowRight,
  CheckCircle,
  Clock,
  Home
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Bot,
    title: 'AI-Assisted Leasing',
    description: 'Automated responses to tenant inquiries with 95% accuracy. Handle 10x more leads without lifting a finger.',
    benefits: ['24/7 instant responses', 'Pre-qualify tenants', 'Schedule viewings automatically']
  },
  {
    icon: Users,
    title: 'Per-Room Contracts',
    description: 'Manage individual rooms or entire properties with separate contracts, payments, and tenant profiles.',
    benefits: ['Individual room pricing', 'Separate utility billing', 'Flexible lease terms']
  },
  {
    icon: DollarSign,
    title: 'Online Payments',
    description: 'Automated rent collection in NZD via Stripe. Never chase rent payments again.',
    benefits: ['Automatic recurring payments', 'Instant notifications', 'Full payment history']
  },
  {
    icon: FileCheck,
    title: 'Compliance Tracking',
    description: 'AI monitors Healthy Homes compliance and alerts you before inspections are due.',
    benefits: ['Automated compliance calendar', 'Document storage', 'Penalty prevention']
  },
  {
    icon: Wrench,
    title: 'Smart Maintenance',
    description: 'AI categorizes and prioritizes maintenance requests with cost estimates.',
    benefits: ['Priority scoring', 'Contractor matching', 'Cost tracking']
  },
  {
    icon: BarChart,
    title: 'Market Insights',
    description: 'AI-powered rent pricing suggestions based on local market data and property features.',
    benefits: ['Optimal pricing recommendations', 'Market trend analysis', 'Revenue optimization']
  }
]

const stats = [
  { label: 'Average Rent Increase', value: '15%', description: 'with AI pricing' },
  { label: 'Time Saved', value: '20hrs', description: 'per property/month' },
  { label: 'Vacancy Rate', value: '3%', description: 'vs 8% industry avg' },
  { label: 'Compliance Rate', value: '100%', description: 'with AI monitoring' }
]

export default function LandlordPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#FF5A5F] to-[#E8474B] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2 mb-6">
            <Home className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">For Property Owners</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            AI-Powered Property Management
            <span className="block text-orange-200">Built for NZ Landlords</span>
          </h1>
          
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            From single rooms to entire portfolios, Keyskeeper's AI handles tenant inquiries, 
            compliance tracking, and maintenance—so you can focus on growing your investments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?role=landlord">
              <Button size="lg" className="bg-white text-[#FF5A5F] hover:bg-gray-50 px-8 py-4 text-lg font-semibold">
                Start Managing With Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold bg-transparent">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#FF5A5F] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Properties
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From AI-powered tenant screening to automated compliance tracking, 
              we've built the complete toolkit for modern landlords.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="h-full hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-[#FF5A5F]/10 rounded-lg mr-4">
                        <Icon className="h-6 w-6 text-[#FF5A5F]" />
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
              Your Command Center
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Monitor all your properties, tenants, and financials from one beautiful dashboard
            </p>
          </div>

          <Card className="overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-[#FF5A5F] to-[#E8474B] p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-xl font-semibold">Landlord Dashboard</h3>
                  <p className="text-white/80">Welcome back, Mittal</p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  8 Properties
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-800 font-medium">Monthly Revenue</span>
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-900">$8,400</div>
                  <div className="text-sm text-green-700">+12% vs last month</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-800 font-medium">Occupancy Rate</span>
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">97%</div>
                  <div className="text-sm text-blue-700">23/24 rooms occupied</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-800 font-medium">Maintenance</span>
                    <Wrench className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-900">3</div>
                  <div className="text-sm text-orange-700">pending requests</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm">Rent payment received - Room 3A</span>
                    </div>
                    <span className="text-xs text-gray-500">2 hrs ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm">New application - Auckland Property</span>
                    </div>
                    <span className="text-xs text-gray-500">4 hrs ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm">Compliance check due - Wellington St</span>
                    </div>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Property Management?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the growing community of NZ landlords using AI to maximize returns 
            and minimize hassles. Set up takes less than 10 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?role=landlord">
              <Button size="lg" className="bg-[#FF5A5F] hover:bg-[#E8474B] px-8 py-4 text-lg font-semibold">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="mailto:admin@keyskeeper.co.nz">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold bg-transparent">
                Schedule Demo
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-400 mt-6">
            Questions? Contact Mittal at admin@keyskeeper.co.nz or +64 27 777 1486
          </p>
        </div>
      </section>

      <BottomNavigation />
    </div>
  )
}