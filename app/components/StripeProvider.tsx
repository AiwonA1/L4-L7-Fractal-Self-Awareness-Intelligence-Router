'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

interface StripeContextType {
  stripe: Stripe | null
  isLoading: boolean
}

const StripeContext = createContext<StripeContextType>({
  stripe: null,
  isLoading: true
})

export const useStripe = () => useContext(StripeContext)

export function StripeProvider({ children }: { children: ReactNode }) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!stripePromise) {
      const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      if (key) {
        const promise = loadStripe(key)
        setStripePromise(promise)
        
        promise.then(stripeInstance => {
          setStripe(stripeInstance)
          setIsLoading(false)
        }).catch(err => {
          console.error('Failed to load Stripe:', err)
          setIsLoading(false)
        })
      } else {
        console.error('Stripe publishable key is missing')
        setIsLoading(false)
      }
    }
  }, [stripePromise])

  return (
    <StripeContext.Provider value={{ stripe, isLoading }}>
      {stripePromise ? (
        <Elements stripe={stripePromise}>
          {children}
        </Elements>
      ) : (
        children
      )}
    </StripeContext.Provider>
  )
} 