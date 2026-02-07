export const WHATSAPP_NUMBER = '919940415353'

export const createWhatsAppOrder = (productName: string, price: number, quantity: number = 1) => {
  const message = `Hi 24julex! I'd like to order:\n\n📦 Product: ${productName}\n💰 Price: ₹${price}\n🔢 Quantity: ${quantity}\n💳 Total: ₹${price * quantity}\n\nPlease confirm availability and payment details.`
  return `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`
}

export const createWhatsAppInquiry = (productName?: string) => {
  const message = productName
    ? `Hi 24julex! I'm interested in ${productName}. Can you provide more details?`
    : `Hi 24julex! I'd like to inquire about your products and collections.`
  return `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`
}

export const createWhatsAppB2BInquiry = () => {
  const message = `Hi 24julex! I'm interested in your B2B reseller program. Please provide details about:\n• Wholesale pricing\n• Bulk ordering\n• Reseller benefits\n• Registration process`
  return `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`
}

export const createWhatsAppSupport = () => {
  const message = `Hi 24julex! I need assistance with my order/account.`
  return `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`
}

export const useWhatsApp = () => {
  const sendProductInquiry = (data: {
    productName: string
    price: number
    productUrl: string
    customerName?: string
    businessName?: string
    orderType: string
  }) => {
    const message = `Hi 24julex! I'd like to order:\n\n📦 Product: ${data.productName}\n💰 Price: ₹${data.price}\n🔗 Link: ${data.productUrl}\n\nCustomer: ${data.customerName || 'Guest'}${data.businessName ? `\nBusiness: ${data.businessName}` : ''}\nType: ${data.orderType}`

    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const createProductShareLink = (product: { name: string, description: string }) => {
    // This function was used in page params? No, in handleShare. 
    // Actually handleShare used navigator.share. 
    // The page.tsx imported createProductShareLink but didn't seem to use it in handleShare logic shown?
    // Wait, line 196 destructures it.
    return `Check out ${product.name}`
  }

  return { sendProductInquiry, createProductShareLink }
}