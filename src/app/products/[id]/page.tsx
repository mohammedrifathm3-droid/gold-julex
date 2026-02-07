'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCartStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import {
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  Sparkles,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  MessageCircle
} from 'lucide-react'

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
  sizes?: string[]
  category: {
    name: string
    slug: string
  }
  rating?: number
  reviews?: number
}

// ... existing productData and relatedProducts ...
const relatedProducts = [
  {
    id: '5',
    name: 'Pearl Stud Earrings',
    price: 399,
    image: '/api/placeholder/300/300',
    rating: 4.5,
    isAntiTarnish: true
  },
  {
    id: '6',
    name: 'Chain Link Bracelet',
    price: 529,
    image: '/api/placeholder/300/300',
    rating: 4.8,
    isAntiTarnish: true
  },
  {
    id: '7',
    name: 'Layered Necklace Set',
    price: 749,
    image: '/api/placeholder/300/300',
    rating: 4.9,
    isAntiTarnish: true
  },
  {
    id: '8',
    name: 'Statement Cocktail Ring',
    price: 599,
    image: '/api/placeholder/300/300',
    rating: 4.7,
    isWaterproof: true
  }
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedTab, setSelectedTab] = useState('description')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = params.id as string
        const res = await fetch(`/api/products/${productId}`)
        if (!res.ok) throw new Error('Product not found')
        const data = await res.json()
        setProduct(data)
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0])
        }
      } catch (err) {
        console.error('Fetch error:', err)
        router.push('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id, router])

  const { addItem } = useCartStore()
  const { toast } = useToast()

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      id: Math.random().toString(36).substr(2, 9),
      product: {
        id: product.id,
        name: product.name,
        priceB2c: product.priceB2c,
        priceB2b: product.priceB2b,
        images: product.images,
        stockQuantity: product.stockQuantity,
        selectedSize: selectedSize
      },
      quantity: quantity
    })

    toast({
      title: "Added to Cart",
      description: `${product.name} (${selectedSize ? `Size: ${selectedSize}, ` : ''}Qty: ${quantity}) has been added to your cart.`,
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  const handleWhatsAppOrder = () => {
    if (!product) return

    const message = `Hi! I'm interested in purchasing ${product.name} (₹${product.priceB2c}). Quantity: ${quantity}. Please assist me with the order.`
    const whatsappUrl = `https://wa.me/919940415353?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="animate-pulse">
          <div className="bg-gray-200 h-96" />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-gray-200 h-96 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span>Products</span>
          <ChevronRight className="w-4 h-4" />
          <span>{product.category.name}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg bg-gray-50">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isAntiTarnish && (
                  <Badge className="bg-gradient-to-r from-purple-400 to-pink-600 text-white">
                    Anti-Tarnish
                  </Badge>
                )}
                {product.isWaterproof && (
                  <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                    Waterproof
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all ${selectedImage === index
                    ? 'border-yellow-400 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-20 h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category.name}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">₹{product.priceB2c}</span>
                <span className="text-sm text-gray-500">incl. shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Truck className="w-4 h-4" />
                <span>Free shipping across India</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y">
              <div>
                <span className="text-sm text-gray-600">Material</span>
                <p className="font-medium">{product.material}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Weight</span>
                <p className="font-medium">{product.weight}g</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Stock</span>
                <p className="font-medium text-green-600">{product.stockQuantity} available</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Delivery</span>
                <p className="font-medium">5-10 business days</p>
              </div>
            </div>

            <div className="space-y-4">
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <span className="text-sm font-medium">Select Size (US):</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedSize === size
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className="flex-1 bg-black hover:bg-gray-800 text-white font-semibold"
                >
                  Buy Now
                </Button>
              </div>

              <Button
                onClick={handleWhatsAppOrder}
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Order via WhatsApp
              </Button>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <Sparkles className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Anti-Tarnish</p>
                <p className="text-xs text-gray-600">Long-lasting shine</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Waterproof</p>
                <p className="text-xs text-gray-600">Wear anywhere</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-gray-600">All orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-4">
                      {product.description} This exquisite piece combines modern design with timeless elegance,
                      perfect for any occasion from casual outings to formal events.
                    </p>
                    <p className="text-gray-600 mb-4">
                      Crafted with precision and attention to detail, this jewelry piece features our signature
                      anti-tarnish coating that ensures it maintains its brilliant shine for years to come.
                    </p>
                    <h4 className="font-semibold mb-2">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Premium {product.material} construction</li>
                      <li>Lightweight design at {product.weight}g</li>
                      <li>Hypoallergenic and skin-friendly</li>
                      <li>Perfect for gifting</li>
                      <li>Comes with elegant packaging</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Product Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Product ID</span>
                        <span className="font-medium">{product.id}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Material</span>
                        <span className="font-medium">{product.material}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Weight</span>
                        <span className="font-medium">{product.weight}g</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Category</span>
                        <span className="font-medium">{product.category.name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Anti-Tarnish</span>
                        <span className="font-medium">{product.isAntiTarnish ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Waterproof</span>
                        <span className="font-medium">{product.isWaterproof ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Shipping & Delivery</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-medium">Free Shipping</h4>
                        <p className="text-gray-600">Free shipping on all orders across India. No minimum purchase required.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-medium">Secure Packaging</h4>
                        <p className="text-gray-600">All items are carefully packaged to prevent damage during transit.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-yellow-600 mt-1" />
                      <div>
                        <h4 className="font-medium">Delivery Time</h4>
                        <p className="text-gray-600">Standard delivery: 5-10 business days. Express delivery: 1-2 business days.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <h4 className="font-medium">Order Tracking</h4>
                        <p className="text-gray-600">Track your order in real-time through WhatsApp or our website.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{product.rating}</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">{product.reviews} reviews</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="font-medium">Priya S.</span>
                        <span className="text-sm text-gray-600">2 days ago</span>
                      </div>
                      <p className="text-gray-600">Absolutely love this piece! The quality is amazing and it doesn't tarnish at all. Worth every penny!</p>
                    </div>
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <Star className="w-4 h-4 text-gray-300" />
                        </div>
                        <span className="font-medium">Anjali M.</span>
                        <span className="text-sm text-gray-600">1 week ago</span>
                      </div>
                      <p className="text-gray-600">Beautiful design and great quality. Shipping was fast too. Highly recommend!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  {relatedProduct.isAntiTarnish && (
                    <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-400 to-pink-600 text-white text-xs">
                      Anti-Tarnish
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{relatedProduct.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">₹{relatedProduct.price}</span>
                    <Button size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}