'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Heart } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'
import { useAuthStore, useCartStore, useWishlistStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import ProductCard from '@/components/ProductCard'

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated, token } = useAuthStore()
  const { items: wishlistItems } = useWishlistStore()
  const { addItem } = useCartStore()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleAddAllToCart = async () => {
    if (wishlistItems.length === 0) return

    // Loop through wishlist items and add each to the cart
    for (const product of wishlistItems) {
      // Robust image parsing
      let imagesArr = []
      try {
        imagesArr = typeof product.images === 'string'
          ? JSON.parse(product.images)
          : (Array.isArray(product.images) ? product.images : [])
      } catch (e) {
        imagesArr = []
      }

      addItem({
        id: product.id,
        product: {
          id: product.id,
          name: product.name,
          priceB2c: product.priceB2c,
          priceB2b: product.priceB2b,
          images: imagesArr,
          stockQuantity: product.stockQuantity
        },
        quantity: 1
      })

      // Backend sync for authenticated users
      if (isAuthenticated && token) {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              productId: product.id,
              quantity: 1
            })
          })
        } catch (err) {
          console.error(`Failed to sync item ${product.id} with cart API`, err)
        }
      }
    }

    toast({
      title: "Success!",
      description: `Added ${wishlistItems.length} items to your cart.`,
    })
  }

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex flex-col">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              My Wishlist (0)
            </h1>
            <BackButton />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6">💝</div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
              Your wishlist is empty
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding your favorite pieces to keep track of items you love!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            My Wishlist ({wishlistItems.length})
          </h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleAddAllToCart}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold px-6"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add All to Cart
            </Button>
            <BackButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}