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
        const users = await db.user.findMany({
            include: {
                reseller: true,
                _count: {
                    select: { orders: true }
                }
            }
        })
        return NextResponse.json({ users })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    if (!(await checkAdmin(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { userId, role } = await request.json()

        // Update role
        const updatedUser = await db.user.update({
            where: { id: userId },
            data: { role }
        })

        return NextResponse.json({ user: updatedUser })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    if (!(await checkAdmin(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { userId } = await request.json()

        await db.user.delete({
            where: { id: userId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
