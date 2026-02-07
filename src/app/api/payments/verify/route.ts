import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    // Verify the signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_secret'
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Update order in database
    const order = await db.order.findFirst({
      where: {
        razorpayOrderId: razorpay_order_id
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    await db.order.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully'
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}