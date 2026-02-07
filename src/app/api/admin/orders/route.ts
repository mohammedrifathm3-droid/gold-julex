import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

async function checkAdmin(request: NextRequest) {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return false

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') return false

    return true
}

export async function GET(request: NextRequest) {
    if (!(await checkAdmin(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const orders = await db.order.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                },
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json({ orders })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    if (!(await checkAdmin(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { orderId, status } = await request.json()

        const updatedOrder = await db.order.update({
            where: { id: orderId },
            data: { status }
        })

        return NextResponse.json({ order: updatedOrder })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
