import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, hashPassword, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
        }

        const user = await db.user.findUnique({
            where: { id: decoded.userId }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const isPasswordValid = await verifyPassword(currentPassword, user.password)
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid current password' }, { status: 400 })
        }

        const hashedPassword = await hashPassword(newPassword)
        await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        return NextResponse.json({ message: 'Password changed successfully' })

    } catch (error) {
        console.error('Change password error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
