'use client'

import { useState } from 'react'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react'

export default function ContactPage() {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast({
            title: (
                <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Message Sent!</span>
                </div>
            ),
            description: "We've received your message and will get back to you soon.",
            duration: 5000,
        })

        setIsSubmitting(false)
        // Optional: Reset form here
        const target = e.target as HTMLFormElement
        target.reset()
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <BackButton />
                </div>
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="font-display text-4xl font-bold text-deep-900 mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions about our jewelry? Want to know more about our anti-tarnish guarantee?
                        We're here to help you find the perfect piece.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <h2 className="font-display text-2xl font-bold text-deep-900">
                            Contact Information
                        </h2>

                        <div className="grid gap-6">
                            <Card className="hover:shadow-gold transition-shadow">
                                <CardContent className="flex items-start space-x-4 p-6">
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <Phone className="w-6 h-6 text-yellow-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                                        <p className="text-gray-600">+91 96778 86632</p>
                                        <p className="text-sm text-gray-400 mt-1">Mon-Sat 10am to 7pm</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-gold transition-shadow">
                                <CardContent className="flex items-start space-x-4 p-6">
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <Mail className="w-6 h-6 text-yellow-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                                        <p className="text-gray-600">support@24julex.com</p>
                                        <p className="text-sm text-gray-400 mt-1">We reply within 24 hours</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-gold transition-shadow">
                                <CardContent className="flex items-start space-x-4 p-6">
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <MapPin className="w-6 h-6 text-yellow-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Office</h3>
                                        <p className="text-gray-600">
                                            123 Jewelry Lane, Fashion District<br />
                                            Mumbai, Maharashtra 400001
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-gold p-8">
                        <h2 className="font-display text-2xl font-bold text-deep-900 mb-6">
                            Send us a Message
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
                                    <Input id="firstName" required placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
                                    <Input id="lastName" required placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                                <Input id="email" type="email" required placeholder="john@example.com" />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
                                <Input id="subject" required placeholder="Product Inquiry" />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                                <Textarea
                                    id="message"
                                    required
                                    placeholder="How can we help you?"
                                    className="min-h-[150px]"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-medium"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    'Sending...'
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Message
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
