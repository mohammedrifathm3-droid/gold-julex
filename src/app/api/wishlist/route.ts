import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

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

        const items = await db.wishlistItem.findMany({
            where: { userId: user.userId },
            include: {
                product: {
                    include: {
                        category: true
                    }
                }
            }
        })

        // Transform items to parse images string to array robustly
        const formattedItems = items.map(item => {
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

        const { productId } = await request.json()

        const existing = await db.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId: user.userId,
                    productId
                }
            }
        })

        if (existing) {
            // Toggle off
            await db.wishlistItem.delete({
                where: { id: existing.id }
            })
            return NextResponse.json({ action: 'removed' })
        } else {
            // Toggle on
            await db.wishlistItem.create({
                data: {
                    userId: user.userId,
                    productId
                }
            })
            return NextResponse.json({ action: 'added' })
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
