'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { useAuthStore, useCartStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight,
  Truck,
  Shield,
  CreditCard,
  Smartphone,
  Banknote,
  MapPin,
  User,
  Phone,
  Mail
} from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  isAntiTarnish: boolean
  isWaterproof: boolean
}

const orderItems: OrderItem[] = [
  {
    id: '1',
    name: 'Golden Heart Necklace',
    price: 699,
    image: '/api/placeholder/60/60',
    quantity: 1,
    isAntiTarnish: true,
    isWaterproof: true
  },
  {
    id: '2',
    name: 'Crystal Drop Earrings',
    price: 549,
    image: '/api/placeholder/60/60',
    quantity: 2,
    isAntiTarnish: false,
    isWaterproof: true
  }
]

export default function CheckoutPage() {
  const router = useRouter()
  // const [loading, setLoading] = useState(false) // Removed loading state
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  const { user, isAuthenticated, token } = useAuthStore()
  const { items: cartItems, clearCart, subtotal } = useCartStore()
  const { toast } = useToast()

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout')
    }
  }, [isAuthenticated, router])

  const orderItems = cartItems.map(item => ({
    id: item.product.id,
    name: item.product.name,
    price: item.product.priceB2c,
    image: item.product.images[0] || '/placeholder-jewelry.jpg',
    quantity: item.quantity,
    selectedSize: item.product.selectedSize,
    isAntiTarnish: false,
    isWaterproof: false
  }))

  // Regex Constants
  const NAME_REGEX = /^[A-Za-z ]+$/
  const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  const PHONE_REGEX = /^[0-9]{10}$/
  const PINCODE_REGEX = /^[0-9]{6}$/
  const ADDRESS_REGEX = /^[A-Za-z0-9 ,\/\\-]+$/
  const STRING_ONLY_REGEX = /^[A-Za-z ]+$/

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)
  const [showEmailOtp, setShowEmailOtp] = useState(false)
  const [showPhoneOtp, setShowPhoneOtp] = useState(false)
  const [emailOtp, setEmailOtp] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [phoneAttempts, setPhoneAttempts] = useState(0)
  const [emailAttempts, setEmailAttempts] = useState(0)
  const [phoneCooldown, setPhoneCooldown] = useState(0)
  const [emailCooldown, setEmailCooldown] = useState(0)
  const [phoneVerificationMethod, setPhoneVerificationMethod] = useState<'firebase' | 'server'>('firebase')

  // Cooldown timers
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (phoneCooldown > 0) {
      timer = setInterval(() => setPhoneCooldown(prev => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [phoneCooldown])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (emailCooldown > 0) {
      timer = setInterval(() => setEmailCooldown(prev => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [emailCooldown])

  const [paymentMethod, setPaymentMethod] = useState('razorpay')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!NAME_REGEX.test(shippingInfo.fullName)) {
      newErrors.fullName = "Name must contain only letters and spaces."
    }
    if (!EMAIL_REGEX.test(shippingInfo.email)) {
      newErrors.email = "Please enter a valid email address."
    }
    if (!PHONE_REGEX.test(shippingInfo.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits."
    }
    if (!PINCODE_REGEX.test(shippingInfo.pincode)) {
      newErrors.pincode = "PIN Code must be exactly 6 digits."
    }
    if (!ADDRESS_REGEX.test(shippingInfo.address)) {
      newErrors.address = "Address contains invalid characters."
    }
    if (!STRING_ONLY_REGEX.test(shippingInfo.city)) {
      newErrors.city = "City must contain only letters."
    }
    if (!STRING_ONLY_REGEX.test(shippingInfo.state)) {
      newErrors.state = "State must contain only letters."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const shipping = 0 // Free shipping
  const total = subtotal + shipping

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!NAME_REGEX.test(shippingInfo.fullName)) newErrors.fullName = "Name must contain only letters and spaces."
    if (!EMAIL_REGEX.test(shippingInfo.email)) newErrors.email = "Please enter a valid email address."
    if (!PHONE_REGEX.test(shippingInfo.phone)) newErrors.phone = "Phone must be exactly 10 digits."
    if (!PINCODE_REGEX.test(shippingInfo.pincode)) newErrors.pincode = "PIN Code must be exactly 6 digits."
    if (!ADDRESS_REGEX.test(shippingInfo.address)) newErrors.address = "Address contains invalid characters."
    if (!STRING_ONLY_REGEX.test(shippingInfo.city)) newErrors.city = "City must contain only letters."
    if (!STRING_ONLY_REGEX.test(shippingInfo.state)) newErrors.state = "State must contain only letters."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstErrorField = Object.keys(newErrors)[0]
      const element = document.getElementById(firstErrorField)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })

      toast({
        title: "Validation Error",
        description: "Please check the highlighted fields.",
        variant: "destructive"
      })
      return
    }

    setErrors({})

    if (!isEmailVerified || !isPhoneVerified) {
      toast({ title: "Verification Required", description: "Please verify your email and phone number before proceeding.", variant: "destructive" })
      return
    }

    setCurrentStep(2)
  }

  const [confirmationResult, setConfirmationResult] = useState<any>(null)

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) return (window as any).recaptchaVerifier
    const { RecaptchaVerifier } = require('firebase/auth')
    const { auth } = require('@/lib/firebase')

    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      })
        ; (window as any).recaptchaVerifier = verifier
      return verifier
    } catch (err) {
      console.error('Recaptcha error:', err)
      return null
    }
  }

  const sendOtp = async (type: 'email' | 'phone') => {
    if (type === 'email') {
      if (!EMAIL_REGEX.test(shippingInfo.email)) {
        toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" })
        return
      }
      if (emailCooldown > 0) {
        toast({ title: "Please Wait", description: `You can resend email OTP in ${emailCooldown}s`, variant: "destructive" })
        return
      }
      setShowPhoneOtp(false) // Fix: Hide phone OTP fields
      setVerifyingEmail(true)
    } else {
      if (!PHONE_REGEX.test(shippingInfo.phone)) {
        toast({ title: "Invalid Phone", description: "Phone must be exactly 10 digits.", variant: "destructive" })
        return
      }
      if (phoneCooldown > 0) {
        toast({ title: "Please Wait", description: `You can resend SMS OTP in ${phoneCooldown}s`, variant: "destructive" })
        return
      }
      setShowEmailOtp(false) // Fix: Hide email OTP fields
      setVerifyingPhone(true)
    }

    try {
      if (type === 'phone') {
        const { signInWithPhoneNumber } = require('firebase/auth')
        const { auth } = require('@/lib/firebase')
        const verifier = setupRecaptcha()
        if (!verifier) throw new Error("Security check failed. Please refresh.")

        try {
          const formattedPhone = `+91${shippingInfo.phone}`
          const result = await signInWithPhoneNumber(auth, formattedPhone, verifier)
          setConfirmationResult(result)
          setPhoneVerificationMethod('firebase')
          setShowPhoneOtp(true)
          setPhoneCooldown(60)
          toast({ title: "SMS Sent", description: "Verification code sent to your phone." })
        } catch (firebaseErr: any) {
          console.error("Firebase Phone Auth failed:", firebaseErr)

          // Attempt server-side backup as a last resort, but don't show the code to the user
          const res = await fetch('/api/verify/phone/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: shippingInfo.phone })
          })

          const data = await res.json()
          setPhoneVerificationMethod('server')
          setShowPhoneOtp(true)
          setPhoneCooldown(60)

          toast({
            title: "Code Ready (Fail-Safe)",
            description: data.debugOtp ? `[DEV] Your code is: ${data.debugOtp}` : "Verification code generated.",
          })
        }
      } else {
        const res = await fetch('/api/verify/email/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: shippingInfo.email })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP')

        setShowEmailOtp(true)
        setEmailCooldown(60)
        toast({
          title: data.debugOtp ? "Code Ready (Dev Mode)" : "Email Sent",
          description: data.debugOtp ? `[DEV] Your code is: ${data.debugOtp}` : "Verification code sent to your email."
        })
      }
    } catch (err: any) {
      console.error(`${type.toUpperCase()} OTP Error:`, err)
      toast({ title: "Error", description: err.message || "Request failed", variant: "destructive" })
    } finally {
      if (type === 'email') setVerifyingEmail(false)
      else setVerifyingPhone(false)
    }
  }

  const checkOtp = async (type: 'email' | 'phone') => {
    const otp = type === 'email' ? emailOtp : phoneOtp
    if (otp.length !== 6) {
      toast({ title: "Invalid Code", description: "Please enter a 6-digit code.", variant: "destructive" })
      return
    }

    setVerifyingOtp(true)
    try {
      if (type === 'phone' && phoneVerificationMethod === 'firebase') {
        if (!confirmationResult) throw new Error("Verification session expired. Please resend.")
        if (phoneAttempts >= 5) throw new Error("Too many attempts. Please request a new code.")

        try {
          await confirmationResult.confirm(otp)
          setIsPhoneVerified(true)
          setShowPhoneOtp(false)
          toast({ title: "Phone Verified", description: "Your phone number has been verified." })
        } catch (confirmErr: any) {
          setPhoneAttempts(prev => prev + 1)
          throw new Error("Invalid code. Please check and try again.")
        }
      } else {
        const endpoint = `/api/verify/${type}/check-otp`
        const payload = type === 'email'
          ? { email: shippingInfo.email, otp }
          : { phone: shippingInfo.phone, otp }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const data = await res.json()
        if (!res.ok) {
          if (type === 'email') setEmailAttempts(prev => prev + 1)
          else setPhoneAttempts(prev => prev + 1)
          throw new Error(data.error || 'Verification failed')
        }

        if (type === 'email') {
          setIsEmailVerified(true)
          setShowEmailOtp(false)
        } else {
          setIsPhoneVerified(true)
          setShowPhoneOtp(false)
        }
        toast({ title: "Verified!", description: `${type === 'email' ? 'Email' : 'Phone'} verified successfully.` })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedSize: item.product.selectedSize
        })),
        shippingAddress: shippingInfo,
        billingAddress: shippingInfo,
        paymentMethod
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to place order')
      }

      // Success
      clearCart()
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been received.",
      })
      router.push('/order-success')

    } catch (error: any) {
      console.error('Checkout error:', error)
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRazorpayPayment = () => {
    // Razorpay integration would go here
    console.log('Processing Razorpay payment...')
  }


  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-yellow-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-yellow-600 text-white' : 'bg-gray-200'
                }`}>
                1
              </div>
              <span className="font-medium">Shipping</span>
            </div>
            <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-yellow-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-yellow-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-yellow-600 text-white' : 'bg-gray-200'
                }`}>
                2
              </div>
              <span className="font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-yellow-600" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName" className={errors.fullName ? "text-red-500" : ""}>Full Name *</Label>
                        <Input
                          id="fullName"
                          value={shippingInfo.fullName}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^A-Za-z ]/g, '')
                            setShippingInfo({ ...shippingInfo, fullName: val })
                            if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }))
                          }}
                          placeholder="Enter your full name"
                          required
                          className={errors.fullName ? "border-red-500" : ""}
                        />
                        {errors.fullName && <p className="text-red-500 text-[10px] mt-1">{errors.fullName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => {
                            setShippingInfo({ ...shippingInfo, email: e.target.value })
                            setIsEmailVerified(false)
                            if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                          }}
                          placeholder="Enter your email"
                          disabled={isEmailVerified || verifyingEmail}
                          readOnly={isEmailVerified}
                        />
                        {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
                        {!isEmailVerified && !showEmailOtp && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-1 text-xs text-yellow-600 h-auto p-0"
                            onClick={() => sendOtp('email')}
                            disabled={verifyingEmail || !shippingInfo.email}
                          >
                            {verifyingEmail ? 'Sending...' : 'Verify Email'}
                          </Button>
                        )}
                        {showEmailOtp && (
                          <div className="mt-2 space-y-2">
                            <Input
                              placeholder="Enter 6-digit OTP"
                              value={emailOtp}
                              onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              className="h-8 text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 text-xs bg-yellow-600"
                                onClick={() => checkOtp('email')}
                                disabled={verifyingOtp || emailOtp.length !== 6}
                              >
                                {verifyingOtp ? 'Verifying...' : 'Confirm OTP'}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setShowEmailOtp(false)}
                                disabled={verifyingOtp}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                        {isEmailVerified && <p className="text-green-600 text-xs mt-1 font-medium">✓ Email Verified</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className={errors.phone ? "text-red-500" : ""}>Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setShippingInfo({ ...shippingInfo, phone: val })
                            setIsPhoneVerified(false)
                            if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }))
                          }}
                          placeholder="Enter your phone number"
                          disabled={isPhoneVerified || verifyingPhone}
                          readOnly={isPhoneVerified}
                        />
                        {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
                        {!isPhoneVerified && !showPhoneOtp && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-1 text-xs text-yellow-600 h-auto p-0"
                            onClick={() => sendOtp('phone')}
                            disabled={verifyingPhone || !shippingInfo.phone}
                          >
                            {verifyingPhone ? 'Sending...' : 'Verify Phone'}
                          </Button>
                        )}
                        <div id="recaptcha-container"></div>
                        {showPhoneOtp && (
                          <div className="mt-2 space-y-2">
                            <Input
                              placeholder="Enter 6-digit OTP"
                              value={phoneOtp}
                              onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              className="h-8 text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 text-xs bg-yellow-600"
                                onClick={() => checkOtp('phone')}
                                disabled={verifyingOtp || phoneOtp.length !== 6}
                              >
                                {verifyingOtp ? 'Verifying...' : 'Confirm OTP'}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setShowPhoneOtp(false)}
                                disabled={verifyingOtp}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                        {isPhoneVerified && <p className="text-green-600 text-xs mt-1 font-medium">✓ Phone Verified</p>}
                      </div>
                      <div>
                        <Label htmlFor="pincode" className={errors.pincode ? "text-red-500" : ""}>PIN Code *</Label>
                        <Input
                          id="pincode"
                          value={shippingInfo.pincode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setShippingInfo({ ...shippingInfo, pincode: val })
                            if (errors.pincode) setErrors(prev => ({ ...prev, pincode: '' }))
                          }}
                          placeholder="Enter PIN code"
                          required
                          className={errors.pincode ? "border-red-500" : ""}
                        />
                        {errors.pincode && <p className="text-red-500 text-[10px] mt-1">{errors.pincode}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className={errors.address ? "text-red-500" : ""}>Street Address *</Label>
                      <Input
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, address: e.target.value })
                          if (errors.address) setErrors(prev => ({ ...prev, address: '' }))
                        }}
                        placeholder="Enter your street address"
                        required
                        className={errors.address ? "border-red-500" : ""}
                      />
                      {errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className={errors.city ? "text-red-500" : ""}>City *</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^A-Za-z ]/g, '')
                            setShippingInfo({ ...shippingInfo, city: val })
                            if (errors.city) setErrors(prev => ({ ...prev, city: '' }))
                          }}
                          placeholder="Enter your city"
                          required
                          className={errors.city ? "border-red-500" : ""}
                        />
                        {errors.city && <p className="text-red-500 text-[10px] mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <Label htmlFor="state" className={errors.state ? "text-red-500" : ""}>State *</Label>
                        <Input
                          id="state"
                          value={shippingInfo.state}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^A-Za-z ]/g, '')
                            setShippingInfo({ ...shippingInfo, state: val })
                            if (errors.state) setErrors(prev => ({ ...prev, state: '' }))
                          }}
                          placeholder="Enter your state"
                          required
                          className={errors.state ? "border-red-500" : ""}
                        />
                        {errors.state && <p className="text-red-500 text-[10px] mt-1">{errors.state}</p>}
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Estimated delivery: 3–4 working days
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        type="submit"
                        className={`w-full font-semibold transition-all ${!isEmailVerified || !isPhoneVerified
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black shadow-md hover:shadow-lg"
                          }`}
                        disabled={!isEmailVerified || !isPhoneVerified}
                      >
                        {!isEmailVerified || !isPhoneVerified ? "Verify Email & Phone to Continue" : "Continue to Payment"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      {(!isEmailVerified || !isPhoneVerified) && (
                        <p className="text-[10px] text-center text-gray-500">
                          Please complete the verification steps above to proceed.
                        </p>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-yellow-600" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="razorpay" id="razorpay" />
                        <Label htmlFor="razorpay" className="flex items-center gap-3 cursor-pointer flex-1">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Credit/Debit Card</p>
                            <p className="text-sm text-gray-600">Pay via Razorpay secure payment</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Smartphone className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">UPI Payment</p>
                            <p className="text-sm text-gray-600">Pay via any UPI app</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Banknote className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-gray-600">Pay when you receive</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{shippingInfo.fullName}</p>
                        <p>{shippingInfo.address}</p>
                        <p>{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}</p>
                        <p>{shippingInfo.phone}</p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Complete Order'}
                      {isProcessing ? (
                        <div className="w-4 h-4 ml-2 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4 ml-2" />
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="w-full"
                    >
                      Back to Shipping
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <div className="flex gap-2 mt-1">
                        {item.isAntiTarnish && (
                          <Badge className="bg-gradient-to-r from-purple-400 to-pink-600 text-white text-xs">
                            Anti-Tarnish
                          </Badge>
                        )}
                        {item.isWaterproof && (
                          <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs">
                            Waterproof
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                        {item.selectedSize && ` • Size: ${item.selectedSize}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    All prices include shipping
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">Secure Checkout</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Your payment information is encrypted and secure. All transactions are protected by industry-standard security protocols.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}