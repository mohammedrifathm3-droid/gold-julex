import { useState } from 'react'
import {
  createWhatsAppOrder,
  createWhatsAppInquiry,
  createWhatsAppB2BInquiry,
  createWhatsAppSupport
} from '@/lib/whatsapp'

interface ProductInquiryParams {
  productName: string
  price: number
  productUrl: string
  customerName?: string
  businessName?: string
  orderType?: 'B2C' | 'B2B'
}

interface ShareLinkParams {
  productName: string
  productUrl: string
  description?: string
}

export const useWhatsApp = () => {
  const [isLoading, setIsLoading] = useState(false)

  const sendProductInquiry = (params: ProductInquiryParams) => {
    setIsLoading(true)

    const message = `Hi 24julex! I'm interested in this product:\n\n📦 *${params.productName}*\n💰 Price: ₹${params.price}\n🔗 Link: ${params.productUrl}\n${params.customerName ? `👤 Name: ${params.customerName}` : ''}\n${params.businessName ? `🏢 Business: ${params.businessName}` : ''}\n${params.orderType ? `📋 Order Type: ${params.orderType}` : ''}\n\nPlease help me with the order.`

    const whatsappUrl = `https://wa.me/919677886632?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, '_blank')
    setIsLoading(false)
  }

  const createProductShareLink = (params: ShareLinkParams) => {
    const message = `Check out this beautiful jewelry from 24julex!\n\n✨ *${params.productName}*\n${params.description ? params.description : ''}\n🔗 ${params.productUrl}\n\nUse code "SAVE10" for 10% off!`

    return `https://wa.me/919940415353?text=${encodeURIComponent(message)}`
  }

  const sendOrderMessage = (productName: string, price: number, quantity: number = 1) => {
    setIsLoading(true)
    const whatsappUrl = createWhatsAppOrder(productName, price, quantity)
    window.open(whatsappUrl, '_blank')
    setIsLoading(false)
  }

  const sendGeneralInquiry = (productName?: string) => {
    setIsLoading(true)
    const whatsappUrl = createWhatsAppInquiry(productName)
    window.open(whatsappUrl, '_blank')
    setIsLoading(false)
  }

  const sendB2BInquiry = () => {
    setIsLoading(true)
    const whatsappUrl = createWhatsAppB2BInquiry()
    window.open(whatsappUrl, '_blank')
    setIsLoading(false)
  }

  const sendSupportMessage = () => {
    setIsLoading(true)
    const whatsappUrl = createWhatsAppSupport()
    window.open(whatsappUrl, '_blank')
    setIsLoading(false)
  }

  return {
    isLoading,
    sendProductInquiry,
    createProductShareLink,
    sendOrderMessage,
    sendGeneralInquiry,
    sendB2BInquiry,
    sendSupportMessage
  }
}