import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isAntiTarnish = searchParams.get('isAntiTarnish')
    const isWaterproof = searchParams.get('isWaterproof')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (isAntiTarnish !== null) {
      where.isAntiTarnish = isAntiTarnish === 'true'
    }

    if (isWaterproof !== null) {
      where.isWaterproof = isWaterproof === 'true'
    }

    if (minPrice || maxPrice) {
      where.priceB2c = {}
      if (minPrice) where.priceB2c.gte = parseFloat(minPrice)
      if (maxPrice) where.priceB2c.lte = parseFloat(maxPrice)
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { material: { contains: search } }
      ]
    }

    // Get products
    const products = await db.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count
    const total = await db.product.count({ where })

    // Parse images JSON
    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }))

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
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

    // Extract fields
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const material = formData.get('material') as string
    const weight = parseFloat(formData.get('weight') as string)
    const priceB2c = parseFloat(formData.get('priceB2c') as string)

    // Reseller Fields
    const costRaw = formData.get('cost')
    const cost = costRaw ? parseFloat(costRaw as string) : 0

    const discountRaw = formData.get('discount')
    const discount = discountRaw ? parseFloat(discountRaw as string) : 0

    const minQuantityRaw = formData.get('minQuantity')
    const minQuantity = minQuantityRaw ? parseInt(minQuantityRaw as string) : 10

    const stockQuantity = parseInt(formData.get('stockQuantity') as string)
    const categoryId = formData.get('categoryId') as string

    // Handle features
    // We'll store features as a simple JSON array string ["Anti-Tarnish", "Waterproof", ...]
    const featuresRaw = formData.get('features') as string
    // It might come in as a JSON string from the client
    let features: string | null = null
    try {
      if (featuresRaw) {
        features = featuresRaw // Assuming it's already a JSON string or we just store the string
      }
    } catch (e) {
      console.error('Error parsing features', e)
    }

    // Handle legacy booleans for backward compatibility if features includes them
    const featuresList = featuresRaw ? JSON.parse(featuresRaw) : []
    const isAntiTarnish = featuresList.includes('Anti-Tarnish')
    const isWaterproof = featuresList.includes('Waterproof')

    // Handle Images
    const imageFiles = formData.getAll('images') as File[]
    const imageUrls: string[] = []

    for (const file of imageFiles) {
      if (file instanceof File) {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          console.warn('Missing BLOB_READ_WRITE_TOKEN, using base64 fallback for image.')
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64 = buffer.toString('base64')
          imageUrls.push(`data:${file.type};base64,${base64}`)
          continue
        }

        // Generate a unique filename
        const uniqueParams = uuidv4()
        const ext = file.name.split('.').pop()
        const filename = `${file.name.replace(/\.[^/.]+$/, "")}-${uniqueParams}.${ext}`

        const blob = await put(filename, file, { access: 'public' })
        imageUrls.push(blob.url)
      }
    }

    // Validate required fields
    if (!name || !categoryId || !priceB2c) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const product = await db.product.create({
      data: {
        name,
        slug,
        description,
        material,
        weight,
        priceB2c,
        cost,
        discount,
        minQuantity,
        stockQuantity,
        isAntiTarnish,
        isWaterproof,
        images: JSON.stringify(imageUrls),
        features: featuresRaw, // Storing what we got
        categoryId
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
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}