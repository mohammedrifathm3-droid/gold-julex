
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const hdImages = {
    necklaces: [
        'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2515&auto=format&fit=crop', // Pendant (Good)
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2670&auto=format&fit=crop', // Layered (Good)
    ],
    earrings: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2670&auto=format&fit=crop', // Diamond studs (Good)
        'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?q=80&w=2670&auto=format&fit=crop', // Elegant (Good)
    ],
    bracelets: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2670&auto=format&fit=crop', // Gold chain (Good)
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2675&auto=format&fit=crop', // Cuff (Good)
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2670&auto=format&fit=crop', // Charm (Good)
        'https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=2670&auto=format&fit=crop', // Minimal (Good)
    ],
    rings: [
        // Using a bracelet image as fallback since all ring images were broken
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2670&auto=format&fit=crop'
    ]
}

const newProducts = [
    {
        name: "Ethereal Pearl Necklace",
        description: "Hand-picked freshwater pearls on a delicate gold chain. Perfect for elegant occasions.",
        priceB2c: 2499,
        material: "Gold Plated",
        weight: 12,
        categoryName: "Necklaces",
        image: hdImages.necklaces[3]
    },
    {
        name: "Classic Gold Hoops",
        description: "Timeless gold hoops that go with everything. Waterproof and anti-tarnish.",
        priceB2c: 1299,
        material: "18k Gold Vermeil",
        weight: 5,
        categoryName: "Earrings",
        image: hdImages.earrings[1]
    },
    {
        name: "Diamond Solitaire Pendant",
        description: "A stunning single crystal pendant suspended on a fine chain.",
        priceB2c: 1899,
        material: "Sterling Silver",
        weight: 3,
        categoryName: "Necklaces",
        image: hdImages.necklaces[1]
    },
    {
        name: "Modern Cuff Bracelet",
        description: "Sleek and modern gold cuff bracelet for a bold statement.",
        priceB2c: 1599,
        material: "Gold Plated",
        weight: 15,
        categoryName: "Bracelets",
        image: hdImages.bracelets[1]
    }
]

async function main() {
    console.log("Starting HD Image Update...")

    // 1. Fetch all products
    const products = await prisma.product.findMany({
        include: { category: true }
    })

    console.log(`Found ${products.length} existing products.`)

    // 2. Update existing products with HD images
    let necklaceIdx = 0
    let earringIdx = 0
    let braceletIdx = 0
    let ringIdx = 0

    for (const product of products) {
        let newImage = ''
        const catName = product.category?.name?.toLowerCase() || ''
        const prodName = product.name.toLowerCase()

        if (catName.includes('necklace') || prodName.includes('necklace') || prodName.includes('chain')) {
            newImage = hdImages.necklaces[necklaceIdx % hdImages.necklaces.length]
            necklaceIdx++
        } else if (catName.includes('earring') || prodName.includes('earring') || prodName.includes('stud')) {
            newImage = hdImages.earrings[earringIdx % hdImages.earrings.length]
            earringIdx++
        } else if (catName.includes('bracelet') || prodName.includes('bracelet') || prodName.includes('cuff')) {
            newImage = hdImages.bracelets[braceletIdx % hdImages.bracelets.length]
            braceletIdx++
        } else {
            newImage = hdImages.rings[ringIdx % hdImages.rings.length] || hdImages.necklaces[0]
            ringIdx++
        }

        console.log(`Updating ${product.name} with HD image...`)
        await prisma.product.update({
            where: { id: product.id },
            data: {
                images: JSON.stringify([newImage]),
                isAntiTarnish: true, // As per goal
                isWaterproof: true  // As per goal
            }
        })
    }

    // 3. Add new products if count < 12
    if (products.length < 12) {
        console.log("Adding new products to reach target...")
        const needed = 12 - products.length

        // Ensure categories exist
        const cats = await prisma.category.findMany()

        for (let i = 0; i < Math.min(needed, newProducts.length + 5); i++) { // Add enough
            // Cycle through newProducts template
            const template = newProducts[i % newProducts.length]
            // Find or create category
            let category = cats.find(c => c.name === template.categoryName)
            if (!category) {
                category = await prisma.category.create({
                    data: {
                        name: template.categoryName,
                        slug: template.categoryName.toLowerCase().replace(' ', '-')
                    }
                })
                cats.push(category)
            }

            await prisma.product.create({
                data: {
                    name: i >= newProducts.length ? `${template.name} ${i}` : template.name,
                    slug: `${template.name.toLowerCase().replace(/ /g, '-')}-${Date.now()}-${i}`,
                    description: template.description,
                    material: template.material,
                    weight: template.weight,
                    priceB2c: template.priceB2c,
                    images: JSON.stringify([template.image]),
                    categoryId: category.id,
                    isAntiTarnish: true,
                    isWaterproof: true
                }
            })
            console.log(`Added new product: ${template.name}`)
        }
    }

    console.log("Done!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
