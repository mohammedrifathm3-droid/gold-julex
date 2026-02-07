'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore, useCartStore, useWishlistStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Heart,
  ShoppingCart,
  Store
} from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { user, isAuthenticated, logout, token } = useAuthStore()
  // Subscribe to cart items reactively
  const items = useCartStore((state) => state.items)
  const { setWishlist } = useWishlistStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate counts directly from reactive state
  const cartItemCount = mounted ? (items || []).reduce((total, item) => total + item.quantity, 0) : 0
  const wishlistItems = useWishlistStore((state) => state.items)
  const wishlistCount = mounted ? (wishlistItems || []).length : 0

  useEffect(() => {
    if (isAuthenticated && token) {
      fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.status === 401) {
            logout()
            return null
          }
          if (!res.ok) return null
          return res.json()
        })
        .then(data => {
          if (data && data.items) {
            setWishlist(data.items.map((item: any) => item.product))
          }
        })
        .catch(err => console.error('Failed to sync wishlist', err))
    }
  }, [isAuthenticated, token, setWishlist, logout])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const CartCountBadge = () => {
    if (cartItemCount <= 0) return null
    return (
      <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center p-0 rounded-full border-2 border-white z-10 animate-in zoom-in duration-300">
        {cartItemCount}
      </Badge>
    )
  }

  const WishlistCountBadge = () => {
    if (wishlistCount <= 0) return null
    return (
      <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[10px] w-5 h-5 flex items-center justify-center p-0 rounded-full border-2 border-white z-10 animate-in zoom-in duration-300">
        {wishlistCount}
      </Badge>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-32 h-12">
              <Image
                src="/logo.png"
                alt="24julex"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              All Products
            </Link>
            <Link href="/collections" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              Collections
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              About
            </Link>
            {isAuthenticated && user?.role === 'reseller' && (
              <Link href="/reseller" className="text-purple-600 hover:text-purple-700 font-medium transition-colors flex items-center space-x-1">
                <Store className="w-4 h-4" />
                <span>Reseller Portal</span>
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/profile" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-yellow-600" asChild>
              <Link href="/products">
                <Search className="w-5 h-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-yellow-600 relative" asChild>
              <Link href="/wishlist">
                <Heart className="w-5 h-5" />
                <WishlistCountBadge />
              </Link>
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-yellow-600 relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="w-5 h-5" />
                <CartCountBadge />
              </Link>
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-yellow-600 relative" asChild>
              <Link href="/wishlist">
                <Heart className="w-6 h-6" />
                <WishlistCountBadge />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-yellow-600 relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="w-6 h-6" />
                <CartCountBadge />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-yellow-600 font-medium">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-yellow-600 font-medium">
                All Products
              </Link>
              <Link href="/collections" className="text-gray-700 hover:text-yellow-600 font-medium">
                Collections
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-yellow-600 font-medium">
                About
              </Link>
              {isAuthenticated && user?.role === 'reseller' && (
                <Link href="/reseller" className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1">
                  <Store className="w-4 h-4" />
                  <span>Reseller Portal</span>
                </Link>
              )}
              {isAuthenticated && (
                <Link href="/profile" className="text-gray-700 hover:text-yellow-600 font-medium flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
              )}

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-yellow-600" asChild>
                  <Link href="/products">
                    <Search className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-yellow-600" asChild>
                  <Link href="/wishlist">
                    <Heart className="w-5 h-5" />
                  </Link>
                </Button>
              </div>

              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}