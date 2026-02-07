import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const hashedOtp = await bcrypt.hash(otp, 10)
        const expires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        // Store OTP in database (Upsert)
        await (db as any).oTP.upsert({
            where: {
                target_type: {
                    target: email,
                    type: 'email'
                }
            },
            update: {
                token: hashedOtp,
                expires,
                createdAt: new Date()
            },
            create: {
                target: email,
                token: hashedOtp,
                type: 'email',
                expires
            }
        })

        // Send REAL email via Resend
        console.log(`\n[EMAIL OTP SYSTEM] TARGET: ${email}`)
        console.log(`[EMAIL OTP SYSTEM] CODE: ${otp}\n`)

        try {
            const { data, error } = await resend.emails.send({
                from: 'Julex <onboarding@resend.dev>',
                to: [email],
                subject: 'Your Verification Code',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #EAB308;">Verify your email</h2>
                        <p>Hi there,</p>
                        <p>Your 6-digit verification code for Julex is:</p>
                        <div style="font-size: 32px; font-weight: bold; color: #EAB308; letter-spacing: 5px; margin: 24px 0; padding: 12px; border: 2px dashed #EAB308; display: inline-block; border-radius: 8px;">
                            ${otp}
                        </div>
                        <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
                        <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Julex. All rights reserved.</p>
                    </div>
                `
            });

            if (error) {
                console.error('Resend Error:', error)

                // Restore Sandbox Fallback for easy testing
                if (process.env.NODE_ENV === 'development') {
                    return NextResponse.json({
                        message: 'OTP generated (Dev Mode)',
                        debugOtp: otp,
                        info: 'Resend unverified. Use this code to test: ' + otp
                    })
                }

                return NextResponse.json({ error: error.message || 'Failed to send email.' }, { status: 500 })
            }
        } catch (emailError: any) {
            console.error('Resend Exception:', emailError);
            return NextResponse.json({ error: 'Email service currently unavailable.' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Verification code sent to your email.' })
    } catch (error) {
        console.error('Send Email OTP Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
