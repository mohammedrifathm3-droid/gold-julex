'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, ShoppingBag, Heart, Settings, LogOut, Camera, ArrowRight, Shield, Award, Edit, Trash2, Loader2, Package, Clock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore, useWishlistStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  items: Array<{
    product: {
      name: string
      images: string
    }
    quantity: number
  }>
}

interface Address {
  id: string
  label: string
  fullName: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, token } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const { toast } = useToast()

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
      fetchOrders()
      fetchAddresses()
    }
  }, [isAuthenticated, user, router])

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to fetch orders", error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true)
      const res = await fetch('/api/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
      }
    } catch (error) {
      console.error("Failed to fetch addresses", error)
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleSaveAddress = async () => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      })

      if (res.ok) {
        toast({ title: "Address Saved", description: "Your address has been saved successfully." })
        setIsAddingAddress(false)
        fetchAddresses()
        setNewAddress({
          label: 'Home',
          fullName: '',
          email: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          isDefault: false
        })
      } else {
        throw new Error('Failed to save address')
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: "Address Deleted", description: "The address has been removed." })
        fetchAddresses()
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Not Supported", description: "Geolocation is not supported by your browser.", variant: "destructive" })
      return
    }

    setDetecting(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords

        // Using OpenStreetMap Nominatim with improved accuracy settings
        // Zoom 18 provides high detail reverse geocoding
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
          headers: {
            'Accept-Language': 'en'
          }
        })

        if (res.ok) {
          const data = await res.json()
          const addr = data.address

          // Build a more detailed street address
          const streetParts = [
            addr.house_number,
            addr.road,
            addr.neighbourhood,
            addr.suburb,
            addr.amenity, // Landmarks like shops or buildings
            addr.man_made
          ].filter(Boolean)

          setNewAddress(prev => ({
            ...prev,
            street: streetParts.length > 0 ? streetParts.join(', ') : data.display_name.split(',')[0],
            city: addr.city || addr.town || addr.village || addr.suburb || '',
            state: addr.state || '',
            pincode: addr.postcode || '',
            country: addr.country || 'India'
          }))

          toast({
            title: "Precise Location Detected",
            description: `Pinpointed near: ${addr.road || addr.suburb || 'your location'}`
          })
        }
      } catch (err) {
        toast({ title: "Location Error", description: "Could not refine address precisely.", variant: "destructive" })
      } finally {
        setDetecting(false)
      }
    }, (error) => {
      setDetecting(false)
      const msg = error.code === 1 ? "Please allow location access." : "Signal too weak. Try moving to a better spot."
      toast({ title: "Location Error", description: msg, variant: "destructive" })
    }, {
      enableHighAccuracy: true, // Request high precision GPS
      timeout: 10000,
      maximumAge: 0
    })
  }

  const handleSaveProfile = () => {
    // Placeholder for API call
    setTimeout(() => {
      setEditingProfile(false)
      // alert('Profile updated successfully!') 
    }, 1000)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleChangePassword = async () => {
    if (passData.newPassword !== passData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" })
      return
    }

    try {
      setLoadingPass(true)
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passData.currentPassword,
          newPassword: passData.newPassword
        })
      })

      const data = await res.json()
      if (res.ok) {
        toast({ title: "Success", description: "Password changed successfully" })
        setIsChangingPassword(false)
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        throw new Error(data.error || 'Failed to change password')
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoadingPass(false)
    }
  }

  const { items: wishlistItems } = useWishlistStore()

  if (!user) return null

  const stats = {
    totalOrders: orders.length,
    wishlistItems: wishlistItems.length,
    addressesCount: addresses.length,
    totalSpent: orders.reduce((acc, order) => acc + order.total, 0),
    averageOrderValue: orders.length > 0 ? Math.round(orders.reduce((acc, order) => acc + order.total, 0) / orders.length) : 0
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      paid: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Paid' },
      failed: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { icon: AlertCircle, color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6" />
                My Profile
              </h1>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${user.role === 'reseller'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  {user.role === 'reseller' ? 'Reseller' : 'Customer'}
                </div>
                {user.reseller?.isVerified && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Verified
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'orders', label: 'Orders', icon: ShoppingBag },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart },
                  { id: 'addresses', label: 'Addresses', icon: MapPin },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-3xl font-bold">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-yellow-400 text-black p-2 rounded-full">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                        <h2 className="font-display text-2xl font-bold text-gray-900">
                          {user.name}
                        </h2>
                        <button
                          onClick={() => setEditingProfile(!editingProfile)}
                          className="text-gray-700 hover:text-yellow-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone || 'No phone number added'}</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <Award className="w-4 h-4" />
                          <span>Member</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">{stats.totalOrders}</div>
                    <div className="text-gray-600">Total Orders</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">{stats.wishlistItems}</div>
                    <div className="text-gray-600">Wishlist Items</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">{stats.addressesCount}</div>
                    <div className="text-gray-600">Saved Addresses</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">₹{stats.totalSpent.toLocaleString()}</div>
                    <div className="text-gray-600">Total Spent</div>
                  </div>
                </div>

                {/* Business Info (for resellers) */}
                {user.role === 'reseller' && user.reseller && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h3 className="font-display text-xl font-bold text-purple-900 mb-4">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Business Name:</span>
                        <p className="font-medium text-purple-900">{user.reseller.businessName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Business Type:</span>
                        <p className="font-medium text-purple-900">{user.reseller.businessType}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">GST Number:</span>
                        <p className="font-medium text-purple-900">{user.reseller.gstNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">PIN Code:</span>
                        <p className="font-medium text-purple-900">{user.reseller.pincode || 'Not provided'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Business Address:</span>
                        <p className="font-medium text-purple-900">
                          {user.reseller.address}, {user.reseller.city}, {user.reseller.state}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {user.reseller.isVerified ? (
                            <span className="flex items-center gap-1 text-green-700 font-medium">
                              <Shield className="w-4 h-4" /> Verified Reseller
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-700 font-medium">
                              <AlertCircle className="w-4 h-4" /> Verification Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Profile Form */}
                {editingProfile && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-6">Edit Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                        <input
                          type="email"
                          disabled
                          value={profileData.email}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Add phone number"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setEditingProfile(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-gray-900">Order History</h2>

                {loadingOrders ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">Start shopping to see your orders here.</p>
                    <Link href="/products">
                      <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                        Shop Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="overflow-hidden border-0 shadow-md">
                        <CardHeader className="bg-gray-50 flex flex-row items-center justify-between p-4">
                          <div>
                            <CardTitle className="text-sm font-medium text-gray-500">
                              Order #{order.orderNumber}
                            </CardTitle>
                            <CardDescription>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(order.status)}
                            <span className="font-bold">₹{order.total.toLocaleString()}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                    {item.product.images ? (
                                      <img src={JSON.parse(item.product.images)[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                    ) : <Package className="w-6 h-6 text-gray-400" />}

                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{item.product.name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold text-gray-900">My Wishlist</h2>
                  <Link href="/wishlist">
                    <Button variant="outline" size="sm" className="gap-2">
                      View Full Wishlist <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-6">Explore our collection and save your favorites!</p>
                    <Link href="/products">
                      <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlistItems.map((product) => {
                      const images = typeof product.images === 'string'
                        ? JSON.parse(product.images)
                        : product.images;
                      return (
                        <Card key={product.id} className="overflow-hidden border-0 shadow-md group">
                          <div className="flex p-3 gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={images?.[0] || '/placeholder-jewelry.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                              <p className="text-yellow-600 font-bold mt-1 text-sm">₹{product.priceB2c.toLocaleString()}</p>
                              <div className="flex gap-2 mt-2">
                                <Link href={`/products/${product.slug}`} className="text-xs text-blue-600 hover:underline">View Product</Link>
                                <button
                                  onClick={() => useWishlistStore.getState().toggleItem(product)}
                                  className="text-xs text-red-600 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-gray-900">Saved Addresses</h2>
                  <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                    <DialogTrigger asChild>
                      <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                        Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <Button
                          variant="outline"
                          className="w-full gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                          onClick={handleDetectLocation}
                          disabled={detecting}
                        >
                          <MapPin className={`w-4 h-4 ${detecting ? 'animate-bounce' : ''}`} />
                          {detecting ? 'Detecting Location...' : 'Detect My Location'}
                        </Button>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Label (e.g. Home, Work)</Label>
                            <Input value={newAddress.label} onChange={e => setNewAddress(p => ({ ...p, label: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input value={newAddress.fullName} onChange={e => setNewAddress(p => ({ ...p, fullName: e.target.value }))} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={newAddress.email} onChange={e => setNewAddress(p => ({ ...p, email: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={newAddress.phone} onChange={e => setNewAddress(p => ({ ...p, phone: e.target.value }))} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Street Address</Label>
                          <Textarea value={newAddress.street} onChange={e => setNewAddress(p => ({ ...p, street: e.target.value }))} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>State</Label>
                            <Input value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>PIN Code</Label>
                            <Input value={newAddress.pincode} onChange={e => setNewAddress(p => ({ ...p, pincode: e.target.value }))} />
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <input
                              type="checkbox"
                              id="isDefault"
                              className="w-4 h-4 accent-yellow-400"
                              checked={newAddress.isDefault}
                              onChange={e => setNewAddress(p => ({ ...p, isDefault: e.target.checked }))}
                            />
                            <Label htmlFor="isDefault">Set as default</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingAddress(false)}>Cancel</Button>
                        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black" onClick={handleSaveAddress}>Save Address</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {loadingAddresses ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-yellow-500" /></div>
                ) : addresses.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No addresses saved yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <Card key={addr.id} className={`p-4 border-2 transition-all ${addr.isDefault ? 'border-yellow-200 bg-yellow-50/30' : 'border-transparent shadow-md'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className={`${addr.isDefault ? 'bg-yellow-400 text-black border-0' : ''}`}>
                            {addr.label}
                          </Badge>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-700 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p className="font-bold text-gray-900">{addr.fullName}</p>
                          <p>{addr.phone}</p>
                          <p className="line-clamp-2">{addr.street}</p>
                          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Security
                  </h3>
                  <div className="space-y-3">
                    <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                      <DialogTrigger asChild>
                        <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900">Change Password</span>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Current Password</Label>
                            <div className="relative">
                              <Input
                                type={showCurrentPass ? "text" : "password"}
                                value={passData.currentPassword}
                                onChange={e => setPassData(p => ({ ...p, currentPassword: e.target.value }))}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPass(!showCurrentPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>New Password</Label>
                            <div className="relative">
                              <Input
                                type={showNewPass ? "text" : "password"}
                                value={passData.newPassword}
                                onChange={e => setPassData(p => ({ ...p, newPassword: e.target.value }))}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPass(!showNewPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <div className="relative">
                              <Input
                                type={showConfirmPass ? "text" : "password"}
                                value={passData.confirmPassword}
                                onChange={e => setPassData(p => ({ ...p, confirmPassword: e.target.value }))}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsChangingPassword(false)}>Cancel</Button>
                          <Button
                            className="bg-yellow-400 hover:bg-yellow-500 text-black"
                            onClick={handleChangePassword}
                            disabled={loadingPass}
                          >
                            {loadingPass ? 'Changing...' : 'Update Password'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}