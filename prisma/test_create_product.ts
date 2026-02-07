
import { db } from '../src/lib/db'

async function main() {
    console.log("Testing Product Creation...");

    // 1. Mock Data
    const categoryName = 'necklaces';
    const productName = 'Test Necklace ' + Date.now();

    // 2. Simulate Logic from Route
    let cat = await db.category.findFirst({
        where: { name: { contains: categoryName } }
    });

    if (!cat) {
        console.log("Category not found with contains, trying exact match normalization");
        const normalized = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        cat = await db.category.findFirst({ where: { name: normalized } });

        if (!cat) {
            console.log("Creating new category:", normalized);
            cat = await db.category.create({
                data: {
                    name: normalized,
                    slug: normalized.toLowerCase()
                }
            });
        }
    }

    console.log("Using Category:", cat.id, cat.name);

    // 3. Create Product (Simulate Reseller)
    // Find a reseller first
    const reseller = await db.reseller.findFirst();
    if (!reseller) {
        console.error("No reseller found in DB to test with!");
        return;
    }

    console.log("Using Reseller:", reseller.id);

    try {
        const product = await db.product.create({
            data: {
                name: productName,
                slug: `${productName.toLowerCase().replace(/ /g, '-')}`,
                description: 'Test Description',
                priceB2c: 999,
                material: 'Gold Plated',
                weight: 10,
                images: JSON.stringify(['https://example.com/image.jpg']),
                categoryId: cat.id,
                resellerId: reseller.id,
                isActive: true,
                isAntiTarnish: true,
                isWaterproof: true
            }
        });
        console.log("Product Created Successfully:", product.id);
    } catch (e) {
        console.error("Product Creation Failed:", e);
    } finally {
        await db.$disconnect();
    }
}

main();
