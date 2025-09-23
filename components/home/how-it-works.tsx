import { Search, Calendar, Key, CreditCard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Search & Discover',
    description: 'Browse properties by location, price, and amenities. Filter by rooms or entire properties.',
    image: 'https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg'
  },
  {
    icon: Calendar,
    step: '02',
    title: 'Book Viewing',
    description: 'Schedule viewings instantly through our platform. Get AI-powered property insights.',
    image: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg'
  },
  {
    icon: Key,
    step: '03',
    title: 'Apply & Move In',
    description: 'Submit your reusable tenant profile. Fast approvals with digital contract signing.',
    image: 'https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg'
  },
  {
    icon: CreditCard,
    step: '04',
    title: 'Manage & Pay',
    description: 'Pay rent online, request maintenance, and manage your tenancy through our dashboard.',
    image: 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg'
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From search to move-in, we've streamlined the entire rental process 
            to be fast, transparent, and stress-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-[#504746] text-white rounded-full text-sm font-bold mr-3">
                      {step.step}
                    </div>
                    <div className="p-2 bg-[#504746]/10 rounded-lg">
                      <Icon size={20} className="text-[#504746]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}