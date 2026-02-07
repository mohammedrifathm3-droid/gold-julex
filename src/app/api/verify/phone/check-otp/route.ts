import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { phone, otp } = await request.json()

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 })
        }

        const otpData = await (db as any).oTP.findUnique({
            where: {
                target_type: {
                    target: phone,
                    type: 'phone'
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

        // OTP verified - delete it
        await (db as any).oTP.delete({ where: { id: otpData.id } })

        return NextResponse.json({ success: true, message: 'Phone verified successfully.' })
    } catch (error) {
        console.error('Check Phone OTP Error:', error)
        return NextResponse.json({ error: 'Verification failed.' }, { status: 500 })
    }
}
