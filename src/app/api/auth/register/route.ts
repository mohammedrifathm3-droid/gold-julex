import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, role = 'customer', businessInfo } = await request.json()

    // Check if user already exists by email or phone
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { phone: phone || undefined }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone number already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role as string
      }
    })

    // If reseller, create reseller profile
    if (role === 'reseller' && businessInfo) {
      await db.reseller.create({
        data: {
          userId: user.id,
          gstNumber: businessInfo.gstNumber,
          businessType: businessInfo.businessType,
          businessName: businessInfo.businessName,
          address: businessInfo.address,
          city: businessInfo.city,
          state: businessInfo.state,
          pincode: businessInfo.pincode
        }
      })
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Fetch updated user with reseller info
    const updatedUser = await db.user.findUnique({
      where: { id: user.id },
      include: { reseller: true }
    })

    if (!updatedUser) {
      return NextResponse.json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    }

    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        reseller: updatedUser.reseller
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}