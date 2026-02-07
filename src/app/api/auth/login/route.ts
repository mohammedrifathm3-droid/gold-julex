import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawIdentifier = (body.identifier || '').trim()
    const rawPassword = (body.password || '').trim()

    if (!rawIdentifier || !rawPassword) {
      return NextResponse.json(
        { error: 'Email/Phone and password are required' },
        { status: 400 }
      )
    }

    // Normalize identifier: if it looks like a phone number, strip non-digits for comparison
    const normalizedIdentifier = rawIdentifier.includes('@') ? rawIdentifier : rawIdentifier.replace(/[^0-9]/g, '')

    // Find user by email OR phone
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: rawIdentifier },
          { phone: rawIdentifier },
          { phone: normalizedIdentifier }
        ]
      },
      include: {
        reseller: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(rawPassword, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        reseller: user.reseller
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}