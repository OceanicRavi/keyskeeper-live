// Stripe integration - will be enabled when API keys are added
// import { loadStripe } from '@stripe/stripe-js'
// import Stripe from 'stripe'

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
// export { stripePromise }

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// })

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(price)
}

// Mock Stripe functions for development
export const stripePromise = Promise.resolve(null)
export const stripe = null