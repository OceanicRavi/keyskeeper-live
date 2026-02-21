import { Shield, Zap, Users, CreditCard, Wrench, BarChart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Shield,
    title: 'AI-Powered Compliance',
    description: 'Automated Healthy Homes compliance tracking with intelligent alerts and document management.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Users,
    title: 'Per-Room Management',
    description: 'Manage individual rooms or entire properties with separate contracts and payments.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: CreditCard,
    title: 'Seamless Payments',
    description: 'Integrated Stripe payments in NZD with automated rent collection and receipts.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Wrench,
    title: 'Smart Maintenance',
    description: 'AI categorizes maintenance requests and suggests priorities with cost estimates.',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: BarChart,
    title: 'Market Insights',
    description: 'AI-powered rent pricing suggestions based on local market data and property features.',
    color: 'bg-indigo-100 text-indigo-600',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Keyskeeper Works
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced AI technology meets practical property management. 
            Everything you need to manage rentals efficiently and compliantly in New Zealand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
              >
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-4 rounded-full ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}