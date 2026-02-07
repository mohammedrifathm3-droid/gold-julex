
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Clear existing data
    await prisma.product.deleteMany({})
    await prisma.category.deleteMany({})

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'admin',
        },
    })

    console.log({ admin })

    // Create Categories
    const categories = [
        { name: 'Necklaces', slug: 'necklaces', description: 'Elegant necklaces and pendants' },
        { name: 'Earrings', slug: 'earrings', description: 'Stunning earrings for every occasion' },
        { name: 'Bracelets', slug: 'bracelets', description: 'Beautiful bracelets' },
        { name: 'Rings', slug: 'rings', description: 'Exquisite rings' },
    ]

    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
            },
        })

        // Create dummy products for each category
        const products = [
            {
                name: `Classic ${cat.name} 1`,
                description: `Beautiful handcrafted ${cat.slug} perfect for daily wear. Anti-tarnish and waterproof.`,
                material: 'Stainless Steel',
                weight: 5.5,
                priceB2c: 499,
                priceB2b: 299,
                stockQuantity: 50,
                isAntiTarnish: true,
                isWaterproof: true,
                images: JSON.stringify(['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop']),
            },
            {
                name: `Premium ${cat.name} 2`,
                description: `Luxury ${cat.slug} with rhinestone accents. Perfect for parties and special occasions.`,
                material: 'Gold Plated',
                weight: 8.2,
                priceB2c: 799,
                priceB2b: 499,
                stockQuantity: 30,
                isAntiTarnish: true,
                isWaterproof: false,
                images: JSON.stringify(['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop']),
            },
            {
                name: `Minimalist ${cat.name} 3`,
                description: `Simple and elegant ${cat.slug} design. A timeless piece for your collection.`,
                material: 'Silver Plated',
                weight: 4.0,
                priceB2c: 399,
                priceB2b: 199,
                stockQuantity: 100,
                isAntiTarnish: false,
                isWaterproof: true,
                images: JSON.stringify(['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop']),
            },
            {
                name: `Statement ${cat.name} 4`,
                description: `Bold ${cat.slug} that stands out. Make a statement with this unique piece.`,
                material: 'Brass',
                weight: 12.0,
                priceB2c: 899,
                priceB2b: 599,
                stockQuantity: 20,
                isAntiTarnish: true,
                isWaterproof: true,
                images: JSON.stringify(['https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop']),
            },
            {
                name: `Designer ${cat.name} 5`,
                description: `Exclusive designer ${cat.slug}. Limited edition handcrafted jewelry.`,
                material: 'Rose Gold',
                weight: 6.5,
                priceB2c: 699,
                priceB2b: 399,
                stockQuantity: 40,
                isAntiTarnish: true,
                isWaterproof: true,
                images: JSON.stringify(['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop']),
            }
        ]

        for (const prod of products) {
            const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            await prisma.product.upsert({
                where: { slug: slug },
                update: {},
                create: {
                    ...prod,
                    slug: slug,
                    categoryId: category.id
                }
            })
        }
    }



    // Specialized Categories
    const specializedCategories = [
        { name: 'Anti-Tarnish Collection', slug: 'anti-tarnish', description: 'Signature anti-tarnish jewelry that stays brilliant forever.' },
        { name: 'Waterproof Collection', slug: 'waterproof', description: 'Jewelry that can handle water, sweat, and adventure.' },
        { name: 'New Arrivals', slug: 'new-arrivals', description: 'The latest additions to our collection.' },
        { name: 'Bridal Collection', slug: 'bridal', description: 'Elegant pieces perfect for weddings and special celebrations.' },
        { name: 'Minimalist Collection', slug: 'minimalist', description: 'Simple, elegant designs for everyday wear.' }
    ]

    const jewelryTypes = ['Necklace', 'Earrings', 'Ring', 'Bracelet', 'Chain', 'Pendant', 'Anklet']
    const materials = ['Gold Plated', 'Silver Plated', 'Rose Gold', 'Oxidized Silver', 'Premium Brass']

    for (const cat of specializedCategories) {
        const category = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
            },
        })

        // Generate properties based on category
        const isAntiTarnish = cat.slug === 'anti-tarnish' || cat.slug === 'waterproof' || Math.random() > 0.5
        const isWaterproof = cat.slug === 'waterproof' || Math.random() > 0.7

        const products = []
        for (let i = 1; i <= 8; i++) {
            // Randomize Product Name
            const type = jewelryTypes[Math.floor(Math.random() * jewelryTypes.length)]
            const material = materials[Math.floor(Math.random() * materials.length)]
            const name = `${cat.name.split(' ')[0]} ${material} ${type}`

            // Randomize Date (Last 60 days)
            const date = new Date()
            date.setDate(date.getDate() - Math.floor(Math.random() * 60))

            // Randomize Price (300 - 800)
            const price = 300 + Math.floor(Math.random() * 501) // 300 to 800

            products.push({
                name: name,
                description: `Exquisite ${type} from our ${cat.name}. Handcrafted with ${material} for perfection.`,
                material: material,
                weight: 5.0 + Math.random() * 10,
                priceB2c: price,
                priceB2b: Math.floor(price * 0.6), // 60% of B2C
                stockQuantity: 20 + Math.floor(Math.random() * 50),
                isAntiTarnish: isAntiTarnish,
                isWaterproof: isWaterproof,
                createdAt: date,
                images: JSON.stringify([
                    [
                        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=800&auto=format&fit=crop'
                    ][i % 5]
                ]),
            })
        }

        for (const prod of products) {
            const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000)
            await prisma.product.upsert({
                where: { slug: slug },
                update: {},
                create: {
                    ...prod,
                    slug: slug,
                    categoryId: category.id
                }
            })
        }
    }

}


main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
