'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Phone,
  MessageCircle
} from 'lucide-react'
import { useAuthStore, useCartStore, useWishlistStore } from '@/lib/store'
import { useWhatsApp } from '@/lib/whatsapp'
import { toast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  description: string
  priceB2c: number
  priceB2b?: number
  images: any
  stockQuantity: number
  isAntiTarnish: boolean
  isWaterproof: boolean
  material: string
  weight: number
  category: {
    name: string
    slug: string
  }
  isNew?: boolean
  discount?: number
  rating?: number
  reviews?: number
  specifications?: {
    dimensions?: string
    karat?: string
    plating?: string
    stoneType?: string
    claspType?: string
    warranty?: string
  }
  sizes?: string[]
  careInstructions?: string[]
  shippingInfo?: {
    processingTime: string
    deliveryTime: string
    freeShippingAbove: number
  }
}


export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, token } = useAuthStore()
  const { sendProductInquiry } = useWhatsApp()
  const addItem = useCartStore((state) => state.addItem)
  const { isInWishlist, toggleItem: toggleWishlistStore } = useWishlistStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [showAddedToCart, setShowAddedToCart] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  const isWishlisted = product ? isInWishlist(product.id) : false

  // Set default quantity for resellers
  useEffect(() => {
    if (user?.role === 'reseller') {
      setQuantity(10)
    }
  }, [user])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          console.log('Product data:', data) // Debugging
          setProduct(data)
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0])
          }
        } else {
          console.error('Product not found')
        }
      } catch (error) {
        console.error('Error fetching product', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleAddToCart = async () => {
    if (!product) return

    // Ring size validation
    if (product.category.slug === 'rings' && !selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a ring size before adding to cart.",
        variant: "destructive"
      })
      return
    }

    addItem({
      id: product.id,
      product: {
        id: product.id,
        name: product.name,
        priceB2c: product.priceB2c,
        priceB2b: product.priceB2b,
        images: product.images,
        stockQuantity: product.stockQuantity,
        selectedSize: selectedSize || undefined // Add selected size to cart item
      },
      quantity: quantity
    })

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
            quantity: quantity,
            size: selectedSize
          })
        })
      } catch (err) {
        console.error('Failed to sync with cart API', err)
      }
    }

    setShowAddedToCart(true)
    setTimeout(() => setShowAddedToCart(false), 3000)
  }

  const handleToggleWishlist = async () => {
    if (!product) return

    toggleWishlistStore(product)

    if (isAuthenticated && token) {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: product.id
          })
        })
      } catch (err) {
        console.error('Failed to sync with wishlist API', err)
      }
    }
  }

  const handleWhatsAppOrder = () => {
    if (!product) return

    sendProductInquiry({
      productName: product.name,
      price: user?.role === 'reseller' && user.reseller?.isVerified && product.priceB2b
        ? product.priceB2b
        : product.priceB2c,
      productUrl: window.location.href,
      customerName: user?.name,
      businessName: user?.reseller?.businessName,
      orderType: user?.role === 'reseller' ? 'B2B' : 'B2C'
    })
  }

  const handleShare = async () => {
    if (!product) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    const minQuantity = user?.role === 'reseller' ? 10 : 1
    if (product && newQuantity >= minQuantity && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity)
    }
  }

  const productImages = (() => {
    if (!product?.images) return ['/placeholder-jewelry.jpg']
    try {
      return typeof product.images === 'string' ? JSON.parse(product.images) : product.images
    } catch (e) {
      return ['/placeholder-jewelry.jpg']
    }
  })()

  const displayPrice = product ? (user?.role === 'reseller' && user.reseller?.isVerified && product.priceB2b
    ? product.priceB2b
    : product.priceB2c) : 0

  const originalPrice = product && product.discount
    ? Math.round(product.priceB2c * (1 + product.discount / 100))
    : (product ? product.priceB2c : 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 aspect-square rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-deep-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/products')}>Back to Products</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <span className="hover:text-yellow-600 cursor-pointer" onClick={() => router.push('/')}>
            Home
          </span>
          <span className="mx-2">/</span>
          <span className="hover:text-yellow-600 cursor-pointer" onClick={() => router.push('/products')}>
            Products
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Added to Cart Alert */}
        {showAddedToCart && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Check className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Product added to cart successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {Boolean(product.isAntiTarnish) && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm font-medium flex items-center space-x-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Anti-Tarnish</span>
                  </Badge>
                )}
                {Boolean(product.isWaterproof) && (
                  <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm font-medium flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Waterproof</span>
                  </Badge>
                )}
                {Boolean(product.isNew) && (
                  <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white text-sm font-medium">
                    New Arrival
                  </Badge>
                )}
                {Boolean(product.discount) && (
                  <Badge className="bg-gradient-to-r from-red-400 to-red-600 text-white text-sm font-medium">
                    -{product.discount}% OFF
                  </Badge>
                )}
              </div>

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % productImages.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                      ? 'border-yellow-400 shadow-gold'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {product.category?.name && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    {product.category.name}
                  </Badge>
                )}
                {Boolean(product.rating) && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                  </div>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-deep-900 mb-4">
                {product.name}
              </h1>

              <p className="text-gray-600 text-base leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-deep-900">₹{displayPrice}</span>
                {Boolean(product.discount) && (
                  <span className="text-xl text-gray-500 line-through">₹{originalPrice}</span>
                )}
                {user?.role === 'reseller' && user.reseller?.isVerified && product.priceB2b && (
                  <Badge className="bg-green-100 text-green-800 text-sm">
                    Reseller Price
                  </Badge>
                )}
              </div>

              {Boolean(product.discount) && displayPrice > 0 && originalPrice > 0 && (
                <p className="text-green-600 font-medium">
                  You save ₹{originalPrice - displayPrice} ({product.discount}% off)
                </p>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Material</p>
                <p className="font-medium text-deep-900">{product.material}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Weight</p>
                <p className="font-medium text-deep-900">{product.weight}g</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Stock</p>
                <p className="font-medium text-deep-900">{product.stockQuantity} units</p>
              </div>
            </div>

            {product.category.slug === 'rings' && product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-deep-900">Select Ring Size:</span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm text-yellow-600 font-medium hover:text-yellow-700 transition-colors"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-medium transition-all ${selectedSize === size
                        ? 'border-yellow-400 bg-yellow-50 text-yellow-700 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-deep-900">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= (user?.role === 'reseller' ? 10 : 1)}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="w-16 text-center font-medium text-lg">
                    {quantity}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stockQuantity}
                    className="h-10 w-10 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  ({product.stockQuantity} available)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold py-3"
                  disabled={product.stockQuantity === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleWhatsAppOrder}
                  className="border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Order via WhatsApp
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={handleToggleWishlist}
                  className={`flex items-center space-x-2 ${isWishlisted ? 'text-red-500' : 'text-gray-600'}`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-600"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Boolean(product.isAntiTarnish) && (
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-deep-900">Anti-Tarnish</p>
                    <p className="text-sm text-gray-600">Stays shiny forever</p>
                  </div>
                </div>
              )}

              {Boolean(product.isWaterproof) && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-deep-900">Waterproof</p>
                    <p className="text-sm text-gray-600">Wear anywhere</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="care">Care Instructions</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-semibold text-deep-900 mb-4">Product Details</h3>
                <div className="prose max-w-none text-gray-600">
                  <p>{product.description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-semibold text-deep-900 mb-4">Specifications</h3>
                <p className="text-gray-600">Material: {product.material}</p>
                <p className="text-gray-600">Weight: {product.weight}g</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-semibold text-deep-900 mb-4">Care Instructions</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Clean with soft cloth after each use</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Avoid contact with perfumes and chemicals</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-semibold text-deep-900 mb-4">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-deep-900">Processing Time</p>
                      <p className="text-sm text-gray-600">3-5 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-deep-900">Delivery Time</p>
                      <p className="text-sm text-gray-600">5-10 business days</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Free shipping on orders above ₹999
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showSizeGuide} onOpenChange={setShowSizeGuide}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-deep-900 border-b pb-4">
              Ring Size Guide
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-100">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>All our rings follow standard US sizing. For the best fit, measure the inside diameter of a ring that fits you well.</span>
              </p>
            </div>

            <div className="overflow-hidden border rounded-xl">
              <table className="w-full text-sm text-black">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">US Size</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Inside Diameter</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Circumference</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-black">
                  {[
                    { size: '5', mm: '15.7 mm', circum: '49.3 mm' },
                    { size: '6', mm: '16.5 mm', circum: '51.8 mm' },
                    { size: '7', mm: '17.3 mm', circum: '54.4 mm' },
                    { size: '8', mm: '18.1 mm', circum: '56.9 mm' },
                    { size: '9', mm: '18.9 mm', circum: '59.5 mm' },
                    { size: '10', mm: '19.8 mm', circum: '62.1 mm' },
                  ].map((row) => (
                    <tr key={row.size} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">Size {row.size}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{row.mm}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{row.circum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 space-y-4">
              <h4 className="font-semibold text-deep-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                How to measure:
              </h4>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-4">
                <li>Wrap a piece of string or paper around your finger.</li>
                <li>Mark where the ends meet.</li>
                <li>Measure the length against a ruler in millimeters.</li>
                <li>Compare with the "Circumference" in the chart above.</li>
              </ol>
            </div>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold mt-2"
            onClick={() => setShowSizeGuide(false)}
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}