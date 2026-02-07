import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const db = new PrismaClient()

async function main() {
    const email = 'testreseller@example.com'
    const password = await hash('password123', 12)

    // Cleanup if exists
    try {
        const existing = await db.user.findUnique({ where: { email } })
        if (existing) {
            await db.user.delete({ where: { email } })
        }
    } catch (e) { }

    const user = await db.user.create({
        data: {
            name: 'Test Reseller',
            email,
            password,
            role: 'reseller',
            reseller: {
                create: {
                    businessName: 'Test Jewels',
                    businessType: 'Retail',
                    isVerified: true
                }
            }
        }
    })

    console.log(`Created reseller: ${user.email} / password123`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
