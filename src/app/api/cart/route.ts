import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { headers } from 'next/headers'

async function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1]
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return payload
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId: user.userId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    const formattedItems = cartItems.map(item => {
      let imagesArr = []
      try {
        if (item.product.images) {
          imagesArr = typeof item.product.images === 'string'
            ? JSON.parse(item.product.images)
            : (Array.isArray(item.product.images) ? item.product.images : [])
        }
      } catch (e) {
        console.error('Failed to parse images for product', item.product.id, e)
        imagesArr = []
      }

      return {
        ...item,
        product: {
          ...item.product,
          images: imagesArr
        }
      }
    })

    return NextResponse.json({ items: formattedItems })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity, selectedSize } = await request.json()

    // check if item exists
    const existingItem = await db.cartItem.findFirst({
      where: {
        userId: user.userId,
        productId,
        selectedSize: selectedSize || null
      }
    })

    if (existingItem) {
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
      return NextResponse.json({ item: updated })
    }

    const newItem = await db.cartItem.create({
      data: {
        userId: user.userId,
        productId,
        quantity,
        selectedSize: selectedSize || null
      }
    })

    return NextResponse.json({ item: newItem })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity, selectedSize } = await request.json()

    const existingItem = await db.cartItem.findFirst({
      where: {
        userId: user.userId,
        productId,
        selectedSize: selectedSize || null
      }
    })

    if (existingItem) {
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: quantity }
      })
      return NextResponse.json({ item: updated })
    }

    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, selectedSize } = await request.json()

    const existingItem = await db.cartItem.findFirst({
      where: {
        userId: user.userId,
        productId: productId,
        selectedSize: selectedSize || null
      }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await db.cartItem.delete({
      where: { id: existingItem.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}