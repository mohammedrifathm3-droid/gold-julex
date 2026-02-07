import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { phone } = await request.json()

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const hashedOtp = await bcrypt.hash(otp, 10)
        const expires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        // Store OTP in database (Upsert)
        await (db as any).oTP.upsert({
            where: {
                target_type: {
                    target: phone,
                    type: 'phone'
                }
            },
            update: {
                token: hashedOtp,
                expires,
                createdAt: new Date(),
                attempts: 0
            },
            create: {
                target: phone,
                token: hashedOtp,
                type: 'phone',
                expires
            }
        })

        // In production, you would integrate an SMS provider like Twilio/Vonage here.
        // For this project, we primarily use Firebase Client SDK for SMS.
        // This server route acts as a SECURE BACKUP for development/troubleshooting.

        console.log(`\n--------------------------------------------`)
        console.log(`[BACKUP OTP SYSTEM] PHONE: ${phone}`)
        console.log(`[BACKUP OTP SYSTEM] CODE: ${otp}`)
        console.log(`--------------------------------------------\n`)

        return NextResponse.json({
            message: 'OTP processed',
            info: 'Code sent via backup channel.'
        })
    } catch (error) {
        console.error('Send Phone OTP Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
