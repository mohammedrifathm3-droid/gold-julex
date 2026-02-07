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

        const addresses = await (db as any).address.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ addresses })
    } catch (error) {
        console.error('Fetch addresses error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        // If setting as default, unset others first
        if (data.isDefault) {
            await (db as any).address.updateMany({
                where: { userId: user.userId, isDefault: true },
                data: { isDefault: false }
            })
        }

        const address = await (db as any).address.create({
            data: {
                ...data,
                userId: user.userId
            }
        })

        return NextResponse.json({ address })
    } catch (error) {
        console.error('Create address error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) {
            return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
        }

        await (db as any).address.delete({
            where: { id, userId: user.userId }
        })

        return NextResponse.json({ message: 'Address deleted' })
    } catch (error) {
        console.error('Delete address error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
