import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
        }

        const otpData = await (db as any).oTP.findUnique({
            where: {
                target_type: {
                    target: email,
                    type: 'email'
                }
            }
        })

        if (!otpData) {
            return NextResponse.json({ error: 'Verification code not found or expired.' }, { status: 400 })
        }

        // Check expiry
        if (new Date() > otpData.expires) {
            await (db as any).oTP.delete({ where: { id: otpData.id } })
            return NextResponse.json({ error: 'Verification code has expired.' }, { status: 400 })
        }

        // Check attempts
        if (otpData.attempts >= 5) {
            await (db as any).oTP.delete({ where: { id: otpData.id } })
            return NextResponse.json({ error: 'Too many failed attempts. Please request a new code.' }, { status: 400 })
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp, otpData.token)
        if (!isMatch) {
            // Increment attempts
            await (db as any).oTP.update({
                where: { id: otpData.id },
                data: { attempts: { increment: 1 } }
            })
            const remaining = 5 - (otpData.attempts + 1)
            return NextResponse.json({
                error: `Invalid code. ${remaining} attempts remaining.`,
                attemptsRemaining: remaining
            }, { status: 400 })
        }

        // OTP verified - delete it so it can't be reused
        await (db as any).oTP.delete({ where: { id: otpData.id } })

        return NextResponse.json({ success: true, message: 'Email verified successfully.' })
    } catch (error) {
        console.error('Check Email OTP Error:', error)
        return NextResponse.json({ error: 'Verification failed. Please try again later.' }, { status: 500 })
    }
}
