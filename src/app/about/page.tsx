'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Star, Heart, Award, Users, Shield, Sparkles, Droplets, Truck, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { BackButton } from '@/components/ui/back-button'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('story')

  const stats = [
    { number: '50K+', label: 'Happy Customers', icon: Users, color: 'from-blue-400 to-blue-600' },
    { number: '200K+', label: 'Products Sold', icon: Heart, color: 'from-purple-400 to-purple-600' },
    { number: '5+', label: 'Years in Business', icon: Award, color: 'from-yellow-400 to-yellow-600' },
    { number: '500+', label: 'Cities Delivered', icon: MapPin, color: 'from-green-400 to-green-600' }
  ]

  const features = [
    {
      icon: Sparkles,
      title: 'Anti-Tarnish Technology',
      description: 'Our signature anti-tarnish coating keeps your jewelry looking brand new for years, eliminating the need for constant polishing.',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      icon: Droplets,
      title: 'Waterproof Design',
      description: 'All our jewelry is waterproof, allowing you to wear it anywhere - from the beach to the shower without worry.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'Each piece is crafted with precision and comes with our quality guarantee for complete peace of mind.',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: Truck,
      title: 'Fast Nationwide Delivery',
      description: 'Quick delivery across India with express shipping options available for urgent fashion needs.',
      color: 'from-green-400 to-green-600'
    }
  ]

  const team = [
    {
      name: 'Priya Sharma',
      role: 'Founder & CEO',
      image: 'https://picsum.photos/seed/priya/200/200',
      bio: 'Passionate about creating beautiful, durable jewelry that empowers Gen-Z to express their unique style.'
    },
    {
      name: 'Rahul Kumar',
      role: 'Head of Design',
      image: 'https://picsum.photos/seed/rahul/200/200',
      bio: 'Creative visionary behind our trending designs, bringing fresh perspectives to traditional jewelry.'
    },
    {
      name: 'Anjali Nair',
      role: 'Operations Lead',
      image: 'https://picsum.photos/seed/anjali/200/200',
      bio: 'Ensuring smooth operations and exceptional customer experience from order to delivery.'
    }
  ]

  const milestones = [
    { year: '2019', title: 'Started in Salem', description: 'Small workshop with big dreams' },
    { year: '2021', title: 'Anti-Tarnish Technology', description: 'Revolutionary coating developed' },
    { year: '2023', title: '50K+ Customers', description: 'Nationwide recognition' },
    { year: '2024', title: 'B2B Launch', description: 'Reseller program introduced' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <BackButton />
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              About 24julex
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Where Modern
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Meets Timeless
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Born in the heart of Salem, Tamil Nadu, 24julex is revolutionizing Gen-Z fashion with
              anti-tarnish, waterproof jewelry that combines traditional craftsmanship with modern technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Shop Our Collection
              </Link>
              <Link
                href="/contact"
                className="border-2 border-gray-300 hover:border-yellow-400 font-semibold px-8 py-4 rounded-2xl transition-all duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {['story', 'mission', 'values'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all ${activeTab === tab
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Our Story */}
          {activeTab === 'story' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    24julex began in 2019 as a small workshop in Salem, Tamil Nadu, with a simple mission:
                    to create beautiful jewelry that lasts. Our founder, frustrated with tarnished jewelry that
                    lost its shine after just a few wears, set out to develop a solution.
                  </p>
                  <p>
                    After years of research and development, we perfected our anti-tarnish coating technology.
                    Combined with waterproof construction, our jewelry could finally withstand the active lifestyles of
                    modern Gen-Z fashion enthusiasts.
                  </p>
                  <p>
                    Today, we're proud to serve over 50,000 customers across India and beyond. Every piece
                    that leaves our Salem workshop carries with it our promise of quality, durability, and style.
                  </p>
                </div>

                <div className="mt-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Our Milestones</h3>
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold flex-shrink-0">
                          {milestone.year}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{milestone.title}</p>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <img
                  src="https://picsum.photos/seed/workshop/600/400"
                  alt="24julex Workshop"
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-4 rounded-2xl shadow-lg transform rotate-3">
                  <p className="font-bold">Made in Salem</p>
                  <p className="text-sm">Loved Worldwide</p>
                </div>
              </div>
            </div>
          )}

          {/* Our Mission */}
          {activeTab === 'mission' && (
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-12">
                Our Mission
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-4">Empower Expression</h3>
                  <p className="text-gray-600">
                    Enable Gen-Z to express their unique style through high-quality, affordable jewelry.
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-4">Quality First</h3>
                  <p className="text-gray-600">
                    Never compromise on quality. Every piece must meet our highest standards.
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-4">Customer Joy</h3>
                  <p className="text-gray-600">
                    Create delightful experiences that bring customers back again and again.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-white rounded-2xl p-8">
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-6 text-center">
                  Our Promise to You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Always Shining</p>
                      <p className="text-sm text-gray-600">Anti-tarnish guarantee</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Droplets className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Worry-Free Wear</p>
                      <p className="text-sm text-gray-600">Waterproof protection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Truck className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Quick Delivery</p>
                      <p className="text-sm text-gray-600">Fast nationwide shipping</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Quality Assured</p>
                      <p className="text-sm text-gray-600">100% satisfaction guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Our Values */}
          {activeTab === 'values' && (
            <div className="max-w-6xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-12 text-center">
                Our Values
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-8 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind 24julex, working together to bring you the best in jewelry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg text-center p-8">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
                  {member.role}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-black mb-8">
            Get in Touch
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-black">
              <MapPin className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Visit Our Workshop</h3>
              <p className="text-sm">
                123 Jewelry Street<br />
                Salem, Tamil Nadu 636001
              </p>
            </div>

            <div className="text-black">
              <Phone className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-sm">
                +91 99404 15353<br />
                Mon-Sat: 9AM-7PM
              </p>
            </div>

            <div className="text-black">
              <Mail className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-sm">
                hello@24julex.com<br />
                support@24julex.com
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+919940415353"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-black font-semibold px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
            <a
              href="https://wa.me/919940415353" target="_blank" rel="noopener noreferrer"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-black font-semibold px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-sm"></div>
              </div>
              WhatsApp Us
            </a>
            <a
              href="https://instagram.com/24julex"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-black font-semibold px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <div className="w-5 h-5 bg-white/30 rounded-full"></div>
              Follow on Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}