'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IndianRupee, Loader2 } from 'lucide-react'

interface RazorpayPaymentProps {
  amount: number
  onSuccess?: (paymentId: string) => void
  onFailure?: (error: string) => void
  className?: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayPayment({ amount, onSuccess, onFailure, className }: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      // Get auth token
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Please login to continue')
      }

      // Create order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        })
      })

      const orderData = await response.json()

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create payment order')
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1234567890',
        amount: orderData.amount,
        currency: orderData.currency,
        name: '24julex',
        description: 'Purchase of premium jewelry',
        image: '/logo.png',
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok && verifyData.success) {
              onSuccess?.(response.razorpay_payment_id)
            } else {
              throw new Error(verifyData.error || 'Payment verification failed')
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed'
            setError(errorMessage)
            onFailure?.(errorMessage)
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#FACC15' // Golden color to match brand
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      setError(errorMessage)
      onFailure?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total Amount</span>
            <div className="flex items-center space-x-2">
              <IndianRupee className="w-5 h-5" />
              <span className="text-2xl font-bold text-deep-900">{amount.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Pay with Razorpay
                <IndianRupee className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            Secure payment powered by Razorpay
          </div>
        </div>
      </CardContent>
    </Card>
  )
}