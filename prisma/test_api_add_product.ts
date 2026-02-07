
import { db } from '../src/lib/db'
import { hashPassword, generateToken } from '../src/lib/auth'

async function main() {
    console.log("Setting up Test User for API...");

    const email = `api_test_reseller_${Date.now()}@example.com`;
    const password = 'password123';

    // 1. Create User & Reseller directly in DB
    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
        data: {
            email,
            name: 'API Test Reseller',
            password: hashedPassword,
            role: 'reseller',
            reseller: {
                create: {
                    businessName: 'API Test Biz',
                    businessType: 'Retail',
                    isVerified: true
                }
            }
        },
        include: { reseller: true }
    });

    console.log(`Created User: ${user.email} (ID: ${user.id})`);

    // 2. Generate Token (simulating login)
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    console.log("Generated Token");

    // 3. Make POST request to local API
    const payload = {
        name: 'API Test Product',
        description: 'Created via test script',
        price: 500,
        category: 'earrings',
        image: 'https://example.com/earring.jpg',
        material: 'Silver',
        weight: 5
    };

    console.log("Sending Payload to API:", payload);

    try {
        const response = await fetch('http://localhost:3000/api/reseller/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const data = await response.json();

        console.log(`API Response Status: ${status}`);
        console.log("API Response Body:", JSON.stringify(data, null, 2));

        if (status === 200) {
            console.log("SUCCESS: Product added via API.");
        } else {
            console.error("FAILURE: API returned error.");
        }

    } catch (err) {
        console.error("Network/Fetch Error:", err);
    } finally {
        await db.$disconnect();
    }
}

main();
