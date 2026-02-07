import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

        const [productCount, orderCount, userCount, totalRevenue] = await Promise.all([
            db.product.count(),
            db.order.count(),
            db.user.count(),
            db.order.aggregate({
                _sum: {
                    total: true
                },
                where: {
                    status: 'paid'
                }
            })
        ])

        return NextResponse.json({
            products: productCount,
            orders: orderCount,
            users: userCount,
            revenue: totalRevenue._sum.total || 0
        })

    } catch (error) {
        console.error('Stats fetch error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
