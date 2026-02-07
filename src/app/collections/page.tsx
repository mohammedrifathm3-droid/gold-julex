'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, ShoppingBag, TrendingUp, Sparkles, Shield, Heart, Star, ArrowRight } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'

// Collections data with dummy images
const collections = [
  {
    id: 1,
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Elegant necklaces and pendants that add sophistication to any outfit. From delicate chains to statement pieces.',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=800&auto=format&fit=crop',
    productCount: 24,
    featured: true,
    badge: 'Bestseller',
    stats: { views: 15420, orders: 892, rating: 4.8 },
    icon: '📿'
  },
  {
    id: 2,
    name: 'Earrings',
    slug: 'earrings',
    description: 'Stunning earrings from classic studs to dramatic drops. Perfect for every occasion and style.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    productCount: 18,
    featured: true,
    badge: 'Trending',
    stats: { views: 12350, orders: 734, rating: 4.7 },
    icon: '👂'
  },
  {
    id: 3,
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Beautiful bracelets that adorn your wrist with elegance. From delicate chains to bold cuffs.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
    productCount: 15,
    featured: true,
    badge: 'New',
    stats: { views: 8920, orders: 456, rating: 4.6 },
    icon: '⚓'
  },
  {
    id: 4,
    name: 'Rings',
    slug: 'rings',
    description: 'Exquisite rings for every moment. Promise rings, engagement rings, and fashion statements.',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop',
    productCount: 20,
    featured: false,
    stats: { views: 10680, orders: 623, rating: 4.9 },
    icon: '💍'
  },
  {
    id: 5,
    name: 'Anti-Tarnish Collection',
    slug: 'anti-tarnish',
    description: 'Our signature anti-tarnish jewelry that stays brilliant forever. No polishing required.',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop',
    productCount: 32,
    featured: true,
    badge: 'Exclusive',
    stats: { views: 18760, orders: 1024, rating: 4.8 },
    icon: '✨'
  },
  {
    id: 6,
    name: 'Waterproof Collection',
    slug: 'waterproof',
    description: 'Jewelry that can handle water, sweat, and adventure. Wear it anywhere, anytime.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    productCount: 28,
    featured: false,
    stats: { views: 14230, orders: 789, rating: 4.7 },
    icon: '💧'
  },
  {
    id: 7,
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'The latest additions to our collection. Be the first to own these stunning pieces.',
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop',
    productCount: 12,
    featured: true,
    badge: 'Just In',
    stats: { views: 5680, orders: 234, rating: 4.9 },
    icon: '🆕'
  },
  {
    id: 8,
    name: 'Bridal Collection',
    slug: 'bridal',
    description: 'Elegant pieces perfect for weddings and special celebrations. Timeless beauty for your big day.',
    image: 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=800&auto=format&fit=crop',
    productCount: 16,
    featured: false,
    stats: { views: 9870, orders: 445, rating: 4.9 },
    icon: '👰'
  },
  {
    id: 9,
    name: 'Minimalist Collection',
    slug: 'minimalist',
    description: 'Simple, elegant designs for everyday wear. Less is more with these subtle beauties.',
    image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?q=80&w=800&auto=format&fit=crop',
    productCount: 14,
    featured: false,
    stats: { views: 7230, orders: 367, rating: 4.6 },
    icon: '⭕'
  }
]

export default function CollectionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredCollection, setHoveredCollection] = useState<number | null>(null)

  const filteredCollections = selectedCategory === 'all'
    ? collections
    : collections.filter(c => c.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Explore Collections
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Curated Collections
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                For Every Style
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover our carefully curated collections, each designed to match your unique style and occasion.
              From everyday elegance to statement pieces.
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-2xl font-medium transition-all ${selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
              >
                All Collections
              </button>
              <button
                onClick={() => setSelectedCategory('featured')}
                className={`px-4 py-2 rounded-2xl font-medium transition-all ${selectedCategory === 'featured'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
              >
                Featured Only
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Featured Collections */}
        {selectedCategory === 'all' && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Featured Collections
              </h2>
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-full text-sm font-medium">
                {collections.filter(c => c.featured).length} Collections
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.filter(c => c.featured).map((collection) => (
                <Link
                  key={collection.id}
                  href={`/products?category=${collection.slug}`}
                  className="group"
                >
                  <div
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                    onMouseEnter={() => setHoveredCollection(collection.id)}
                    onMouseLeave={() => setHoveredCollection(null)}
                  >
                    {/* Collection Image */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Badge */}
                      {collection.badge && (
                        <div className="absolute top-4 left-4">
                          <div className="bg-gradient-to-r from-red-400 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            {collection.badge}
                          </div>
                        </div>
                      )}

                      {/* Quick Stats on Hover */}
                      {hoveredCollection === collection.id && (
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white text-sm">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{collection.stats.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ShoppingBag className="w-4 h-4" />
                              <span>{collection.stats.orders}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{collection.stats.rating}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Collection Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{collection.icon}</span>
                          <h3 className="font-display text-xl font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                            {collection.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{collection.productCount}</div>
                          <div className="text-sm text-gray-500">Products</div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                        {collection.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {collection.stats.orders} orders this month
                        </span>
                        <span className="text-yellow-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Explore Collection
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Collections */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold text-gray-900">
              {selectedCategory === 'featured' ? 'Featured Collections' : 'All Collections'}
            </h2>
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
              {filteredCollections.length} Collections
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/products?category=${collection.slug}`}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-0.5">
                  {/* Collection Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badge */}
                    {collection.badge && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-gradient-to-r from-red-400 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {collection.badge}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Collection Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{collection.icon}</span>
                      <h3 className="font-display text-lg font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                        {collection.name}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                      {collection.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {collection.productCount} items
                      </div>
                      {collection.stats && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{collection.stats.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Special Features Section */}
        <div className="mt-20 bg-gradient-to-r from-yellow-50 to-white rounded-3xl p-8">
          <h2 className="font-display text-2xl font-semibold text-gray-900 mb-8 text-center">
            Why Choose 24julex Collections?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Anti-Tarnish Technology</h3>
              <p className="text-gray-600 text-sm">
                Our signature anti-tarnish coating keeps your jewelry looking brand new for years.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Waterproof Design</h3>
              <p className="text-gray-600 text-sm">
                Wear your jewelry anywhere - from the beach to the shower without worry.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Curated for You</h3>
              <p className="text-gray-600 text-sm">
                Each collection is designed to match your style, occasion, and personality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}