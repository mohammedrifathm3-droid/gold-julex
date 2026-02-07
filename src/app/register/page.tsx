'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore, useCartStore } from '@/lib/store'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    businessInfo: {
      businessName: '',
      businessType: '',
      gstNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Phone number length validation
      if (formData.phone.length !== 10) {
        throw new Error('Phone number must be exactly 10 digits')
      }

      const payload = {
        ...formData,
        businessInfo: formData.role === 'reseller' ? formData.businessInfo : undefined
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      login(data.user, data.token)

      // New registrations start as non-B2B until verified
      useCartStore.getState().setIsB2B(false)

      // Redirect based on user role
      if (data.user.role === 'reseller') {
        router.push('/reseller')
      } else {
        router.push('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Numeric only validation for phone, capped at 10 digits
    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10)
      setFormData(prev => ({ ...prev, [name]: numericValue }))
      return
    }

    // Letters only for name
    if (name === 'name') {
      const alphaValue = value.replace(/[^a-zA-Z\s]/g, '')
      setFormData(prev => ({ ...prev, [name]: alphaValue }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBusinessInfoChange = (field: string, value: string) => {
    // Numeric only validation for GST and PIN code
    if (field === 'gstNumber' || field === 'pincode') {
      const numericValue = value.replace(/[^0-9]/g, '')
      setFormData(prev => ({
        ...prev,
        businessInfo: {
          ...prev.businessInfo,
          [field]: numericValue
        }
      }))
      return
    }

    // Letters only for certain business fields
    if (field === 'businessName' || field === 'city' || field === 'state') {
      const alphaValue = value.replace(/[^a-zA-Z\s]/g, '')
      setFormData(prev => ({
        ...prev,
        businessInfo: {
          ...prev.businessInfo,
          [field]: alphaValue
        }
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [field]: value
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="relative text-center mb-8">
          <div className="absolute left-0 top-0">
            <BackButton />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative w-48 h-16">
              <Image
                src="/logo.png"
                alt="24julex"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <p className="text-gray-600">Join our jewelry community today</p>
        </div>

        <Card className="shadow-gold-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl text-deep-900">Create Account</CardTitle>
            <CardDescription>
              Sign up to start shopping or join our reseller program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Account Type Selection */}
              <div className="space-y-3">
                <Label>Account Type</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer" className="font-normal">
                      <div>
                        <div className="font-medium">Customer</div>
                        <div className="text-sm text-gray-500">Shop for personal use</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reseller" id="reseller" />
                    <Label htmlFor="reseller" className="font-normal">
                      <div>
                        <div className="font-medium">Reseller</div>
                        <div className="text-sm text-gray-500">Buy wholesale for business</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="bg-gray-50 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              {/* Business Information for Resellers */}
              {formData.role === 'reseller' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-deep-900">Business Information</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        type="text"
                        placeholder="Enter business name"
                        value={formData.businessInfo.businessName}
                        onChange={(e) => handleBusinessInfoChange('businessName', e.target.value)}
                        required
                        className="bg-white border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        value={formData.businessInfo.businessType}
                        onValueChange={(value) => handleBusinessInfoChange('businessType', value)}
                      >
                        <SelectTrigger className="bg-white border-gray-200 focus:border-yellow-400 focus:ring-yellow-400">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boutique">Boutique</SelectItem>
                          <SelectItem value="jewelry-store">Jewelry Store</SelectItem>
                          <SelectItem value="online-seller">Online Seller</SelectItem>
                          <SelectItem value="wholesaler">Wholesaler</SelectItem>
                          <SelectItem value="individual">Individual Reseller</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter GST number"
                        value={formData.businessInfo.gstNumber}
                        onChange={(e) => handleBusinessInfoChange('gstNumber', e.target.value)}
                        required
                        className="bg-white border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input
                        id="pincode"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter PIN code"
                        value={formData.businessInfo.pincode}
                        onChange={(e) => handleBusinessInfoChange('pincode', e.target.value)}
                        required
                        className="bg-white border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Enter business address"
                      value={formData.businessInfo.address}
                      onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                      required
                      className="bg-white border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="Enter city"
                        value={formData.businessInfo.city}
                        onChange={(e) => handleBusinessInfoChange('city', e.target.value)}
                        required
                        className="bg-white border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="Enter state"
                        value={formData.businessInfo.state}
                        onChange={(e) => handleBusinessInfoChange('state', e.target.value)}
                        required
                        className="bg-white border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}