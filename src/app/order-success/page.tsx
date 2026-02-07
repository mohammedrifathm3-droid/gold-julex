'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  CheckCircle, 
  ShoppingBag, 
  Truck, 
  ArrowRight,
  Home,
  Package,
  Star
} from 'lucide-react'

export default function OrderSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear any redirect timer if needed
    const timer = setTimeout(() => {
      // Auto redirect after 10 seconds
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="font-display text-4xl font-bold text-deep-900 mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Thank you for your order! We've received your payment and your order is now being processed.
          </p>

          {/* Order Details Card */}
          <Card className="max-w-2xl mx-auto mb-8 border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-deep-900 mb-1">Order Number</h3>
                  <p className="text-gray-600">ORD20240115001</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-deep-900 mb-1">Estimated Delivery</h3>
                  <p className="text-gray-600">3-5 Business Days</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-deep-900 mb-1">Order Total</h3>
                  <p className="text-gray-600">₹7,498</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <div className="bg-gradient-to-r from-yellow-50 to-white rounded-2xl p-8 mb-8">
            <h2 className="font-display text-2xl font-semibold text-deep-900 mb-6">
              What's Next?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-deep-900 mb-2">Order Confirmation</h3>
                  <p className="text-gray-600 text-sm">
                    You'll receive an order confirmation email shortly with all the details.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-deep-900 mb-2">Track Your Order</h3>
                  <p className="text-gray-600 text-sm">
                    Track your order status in real-time through your profile page.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-deep-900 mb-2">Customer Support</h3>
                  <p className="text-gray-600 text-sm">
                    Need help? Our support team is here to assist you.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-deep-900 mb-2">Leave a Review</h3>
                  <p className="text-gray-600 text-sm">
                    Share your experience once you receive your order.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/profile')}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
            >
              <Package className="w-5 h-5 mr-2" />
              View Order Details
            </Button>
            
            <Button
              onClick={() => router.push('/products')}
              variant="outline"
              className="border-2 border-gray-300 hover:border-yellow-400 font-semibold"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-12 text-center">
            <h3 className="font-semibold text-deep-900 mb-4">
              Questions About Your Order?
            </h3>
            <p className="text-gray-600 mb-6">
              Our customer support team is here to help you with any questions or concerns.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="flex items-center space-x-2">
                <span>WhatsApp Support</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Email Support</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-deep-900"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}