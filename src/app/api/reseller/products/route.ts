
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]

        const decoded = verifyToken(token)

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch user from DB to verify role
        const user = await db.user.findUnique({ where: { id: decoded.userId } })

        if (!user || user.role !== 'reseller') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const reseller = await db.reseller.findUnique({
            where: { userId: user.id }
        })

        if (!reseller) {
            return NextResponse.json({ error: 'Reseller profile not found' }, { status: 404 })
        }

        const body = await req.json()
        const { name, description, category, image, material } = body
        const price = parseFloat(body.price)
        const weight = parseFloat(body.weight)
        const stock = parseInt(body.stock) || 0

        if (!name || !price || !category || !image) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Helper to title case
        const toTitleCase = (str: string) => {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }

        const normalizedCategory = toTitleCase(category);

        // Find or create category
        let cat = await db.category.findFirst({
            where: {
                OR: [
                    { name: normalizedCategory },
                    { slug: category.toLowerCase() }
                ]
            }
        })

        if (!cat) {
            cat = await db.category.create({
                data: {
                    name: normalizedCategory,
                    slug: normalizedCategory.toLowerCase().replace(/ /g, '-')
                }
            })
        }

        const product = await db.product.create({
            data: {
                name,
                slug: `${name.toLowerCase().replace(/ /g, '-')}-${Date.now()}`,
                description,
                priceB2c: price,
                // Assumption: Reseller products might have a different B2B logic, but we fill B2C for homepage display
                material,
                weight,
                stockQuantity: stock,
                images: JSON.stringify([image]),
                categoryId: cat.id,
                resellerId: reseller.id,
                isActive: true, // Auto-approve for now or could be false
                isAntiTarnish: true, // Defaulting for consistency with prompt
                isWaterproof: true
            }
        })

        return NextResponse.json({ product })
    } catch (error) {
        console.error('Create product error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]

        const decoded = verifyToken(token)

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await db.user.findUnique({ where: { id: decoded.userId } })

        if (!user || user.role !== 'reseller') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const reseller = await db.reseller.findUnique({
            where: { userId: user.id }
        })

        if (!reseller) {
            return NextResponse.json({ products: [] })
        }

        const products = await db.product.findMany({
            where: { resellerId: reseller.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ products })
    } catch (error) {
        console.error('Fetch products error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
