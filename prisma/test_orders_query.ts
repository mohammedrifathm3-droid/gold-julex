
import { db } from '../src/lib/db'

async function main() {
    try {
        console.log("Testing Order Query...");

        // 1. Check if we can count orders
        const count = await db.order.count();
        console.log(`Total orders in DB: ${count}`);

        // 2. Try the exact query structure from route.ts (without userId filter first)
        const orders = await db.order.findMany({
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        console.log(`Fetched ${orders.length} orders successfully.`);
        if (orders.length > 0) {
            console.log("Sample order ID:", orders[0].id);
        }

    } catch (error) {
        console.error("Query failed:", error);
    } finally {
        await db.$disconnect();
    }
}

main();
