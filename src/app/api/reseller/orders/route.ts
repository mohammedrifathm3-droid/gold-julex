import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization required' },
                { status: 401 }
            )
        }

        const token = authHeader.substring(7)
        const decoded = verifyToken(token)

        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            )
        }

        // Verify reseller
        const user = await db.user.findUnique({
            where: { id: decoded.userId },
            include: { reseller: true }
        })

        if (!user || user.role !== 'reseller' || !user.reseller) {
            return NextResponse.json(
                { error: 'Unauthorized: Reseller access only' },
                { status: 403 }
            )
        }

        const resellerId = user.reseller.id

        // Fetch orders containing products from this reseller
        const orders = await db.order.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            resellerId: resellerId
                        }
                    }
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Filter items to only show this reseller's products and calculate their specific revenue
        const resellerOrders = orders.map(order => {
            const resellerItems = order.items.filter(item => item.product.resellerId === resellerId)
            const resellerTotal = resellerItems.reduce((sum, item) => sum + item.totalPrice, 0)

            return {
                ...order,
                items: resellerItems,
                total: resellerTotal // Override total with just the reseller's share
            }
        })

        return NextResponse.json({ orders: resellerOrders })

    } catch (error) {
        console.error('Reseller orders fetch error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
