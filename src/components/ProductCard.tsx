'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, ShoppingCart, Sparkles, Shield, Check, Loader2, Share2 } from 'lucide-react'
import { useAuthStore, useCartStore, useWishlistStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  description: string
  priceB2c: number
  priceB2b?: number
  images: string[]
  stockQuantity: number
  isAntiTarnish: boolean
  isWaterproof: boolean
  material: string
  weight: number
  category: {
    name: string
    slug: string
  }
}

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'featured'
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  // const [isWishlisted, setIsWishlisted] = useState(false) // Removed local state
  const [isAdding, setIsAdding] = useState(false)
  const { user, isAuthenticated } = useAuthStore()
  const addItem = useCartStore((state) => state.addItem)
  const { isInWishlist, toggleItem: toggleWishlistStore } = useWishlistStore()
  const { toast } = useToast()

  const isWishlisted = isInWishlist(product.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)

    // Simulate a small delay for better UX (optional, but helps see the spinner)
    await new Promise(resolve => setTimeout(resolve, 500))

    addItem({
      id: product.id,
      product: {
        id: product.id,
        name: product.name,
        priceB2c: product.priceB2c,
        priceB2b: product.priceB2b,
        images: product.images || [],
        stockQuantity: product.stockQuantity
      },
      quantity: 1
    })

    toast({
      title: (
        <div className="flex items-center space-x-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>Added to cart</span>
        </div>
      ),
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    })

    if (isAuthenticated) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useAuthStore.getState().token}`
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1
          })
        })
      } catch (error) {
        console.error('Failed to sync cart', error)
      }
    }

    setIsAdding(false)
  }

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to wishlist",
        variant: "destructive"
      })
      return
    }

    const wasWishlisted = isWishlisted

    // Optimistic update using new store toggle method
    toggleWishlistStore(product)

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        },
        body: JSON.stringify({
          productId: product.id
        })
      })

      if (res.status === 401) {
        useAuthStore.getState().logout()
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        })
        return
      }

      if (!res.ok) {
        // Revert if failed
        toggleWishlistStore(product)
      } else {
        toast({
          title: wasWishlisted ? "Removed from wishlist" : "Added to wishlist",
          description: wasWishlisted ? "Item removed from your wishlist" : "Item saved to your wishlist",
        })
      }
    } catch (error) {
      console.error('Failed to toggle wishlist', error)
      // Revert if failed
      toggleWishlistStore(product)
    }
  }

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const message = `Hi! I'm interested in this product:\n\n*${product.name}*\n\nPrice: ₹${user?.role === 'reseller' && user.reseller?.isVerified && product.priceB2b ? product.priceB2b : product.priceB2c}\n\nProduct Link: ${window.location.origin}/product/${product.id}\n\nPlease help me with the order.`
    const whatsappUrl = `https://wa.me/919940415353?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const displayPrice = user?.role === 'reseller' && user.reseller?.isVerified && product.priceB2b
    ? product.priceB2b
    : product.priceB2c

  const mainImage = (() => {
    try {
      if (!product.images) return '/placeholder-jewelry.jpg'
      const imagesArr = typeof product.images === 'string'
        ? JSON.parse(product.images)
        : product.images

      if (Array.isArray(imagesArr) && imagesArr.length > 0) {
        return imagesArr[0]
      }
    } catch (e) {
      console.error('Failed to parse product images', e)
    }
    return '/placeholder-jewelry.jpg'
  })()

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-gold-lg ${variant === 'featured' ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="block relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'
              }`}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {Boolean(product.isAntiTarnish) && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-medium flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Anti-Tarnish</span>
              </Badge>
            )}
            {Boolean(product.isWaterproof) && (
              <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs font-medium flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Waterproof</span>
              </Badge>
            )}
            {variant === 'featured' && (
              <Badge className="bg-gradient-to-r from-purple-400 to-pink-600 text-white text-xs font-medium">
                Featured
              </Badge>
            )}
          </div>

          {/* Wishlist & Share Buttons - Higher Z-index to be clickable over overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 rounded-full p-2 shadow-sm transition-all duration-300"
              onClick={toggleWishlist}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-700 hover:text-blue-500 rounded-full p-2 shadow-sm transition-all duration-300"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const url = `${window.location.origin}/product/${product.id}`
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    text: product.description,
                    url: url
                  }).catch(() => { })
                } else {
                  navigator.clipboard.writeText(url)
                  toast({
                    title: "Link Copied",
                    description: "Product link copied to clipboard",
                  })
                }
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions Overlay - Lower Z-index relative to icons */}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center space-x-2 transition-opacity duration-300 z-10 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
            <Button
              size="sm"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium disabled:opacity-70 pointer-events-auto"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white hover:bg-gray-50 text-green-600 border-green-600 hover:border-green-700 font-medium pointer-events-auto"
              onClick={handleWhatsAppOrder}
            >
              WhatsApp
            </Button>
          </div>
        </div>


        {/* Product Info */}
        <div className="p-4">
          <div className="mb-2">
            {product.category?.name && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                {product.category.name}
              </Badge>
            )}
          </div>

          <div className="mb-2">
            <Link href={`/product/${product.id}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />
            <h3 className="font-display font-semibold text-deep-900 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors relative z-10">
              {product.name}
            </h3>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-deep-900">₹{displayPrice}</span>
                {/* MRP Display Logic */}
                {(!user?.role || user?.role !== 'reseller') && (
                  <>
                    <span className="text-xs text-gray-500 line-through">₹{Math.floor(displayPrice * 1.4)}</span>
                    <span className="text-xs text-green-600 font-bold">(30% OFF)</span>
                  </>
                )}
                {user?.role === 'reseller' && user.reseller?.isVerified && product.priceB2b && (
                  <span className="text-sm text-gray-500 line-through">₹{product.priceB2c}</span>
                )}
              </div>
              {user?.role === 'reseller' && user.reseller?.isVerified && product.priceB2b && (
                <span className="text-xs text-green-600 font-medium">Reseller Price</span>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              {Boolean(product.isWaterproof) && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Waterproof</span>}
              {Boolean(product.isAntiTarnish) && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">Anti-Tarnish</span>}
            </div>
          </div>

          {/* Stock Status */}
          {product.stockQuantity <= 5 && (
            <div className="text-xs text-orange-600 font-medium mb-3">
              Only {product.stockQuantity} left in stock!
            </div>
          )}

          {/* Mobile Actions */}
          <div className="md:hidden flex space-x-2 relative z-10">
            <Button
              size="sm"
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium disabled:opacity-70"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white hover:bg-gray-50 text-green-600 border-green-600 hover:border-green-700 font-medium"
              onClick={handleWhatsAppOrder}
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}