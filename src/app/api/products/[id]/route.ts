import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      features: product.features ? JSON.parse(product.features) : []
    }

    return NextResponse.json(formattedProduct)

  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()

    // Extract basic fields
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const material = formData.get('material') as string
    const categoryId = formData.get('categoryId') as string
    const stockQuantity = parseInt(formData.get('stockQuantity') as string)
    const weight = parseFloat(formData.get('weight') as string)
    const priceB2c = parseFloat(formData.get('priceB2c') as string)

    // Reseller Fields
    const costRaw = formData.get('cost')
    const cost = costRaw ? parseFloat(costRaw as string) : null

    const discountRaw = formData.get('discount')
    const discount = discountRaw ? parseFloat(discountRaw as string) : null

    const minQuantityRaw = formData.get('minQuantity')
    const minQuantity = minQuantityRaw ? parseInt(minQuantityRaw as string) : null

    // Handle features
    const featuresRaw = formData.get('features') as string
    const featuresList = featuresRaw ? JSON.parse(featuresRaw) : []
    const isAntiTarnish = featuresList.includes('Anti-Tarnish')
    const isWaterproof = featuresList.includes('Waterproof')

    // Handle Images
    // formData.getAll('images') can contain both Strings (existing URLs) and Files (new uploads)
    const imageEntries = formData.getAll('images')
    const finalImageUrls: string[] = []

    for (const entry of imageEntries) {
      if (entry instanceof File) {
        // It's a new file, save it
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          console.warn('Missing BLOB_READ_WRITE_TOKEN, using base64 fallback for image in PUT.')
          const bytes = await entry.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64 = buffer.toString('base64')
          finalImageUrls.push(`data:${entry.type};base64,${base64}`)
          continue
        }
        const blob = await put(entry.name, entry, { access: 'public' })
        finalImageUrls.push(blob.url)
      } else if (typeof entry === 'string') {
        // It's an existing URL
        finalImageUrls.push(entry)
      }
    }

    const product = await db.product.update({
      where: { id },
      data: {
        name,
        description,
        material,
        categoryId,
        stockQuantity,
        weight,
        priceB2c,
        cost,
        discount,
        minQuantity: minQuantity || undefined,
        isAntiTarnish,
        isWaterproof,
        features: featuresRaw,
        images: JSON.stringify(finalImageUrls)
      },
      include: {
        category: true
      }
    })

    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      features: product.features ? JSON.parse(product.features) : []
    }

    return NextResponse.json(formattedProduct)

  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })

  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}