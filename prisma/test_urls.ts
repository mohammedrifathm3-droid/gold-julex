
const hdImages = {
    necklaces: [
        'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=2574&auto=format&fit=crop', // Gold necklace
        'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2515&auto=format&fit=crop', // Pendant
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2670&auto=format&fit=crop', // Layered
        'https://images.unsplash.com/photo-1515562141207-7a88fb052571?q=80&w=2670&auto=format&fit=crop', // Pearl
    ],
    earrings: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2670&auto=format&fit=crop', // Diamond studs
        'https://images.unsplash.com/photo-1630019852942-e5e1237eab24?q=80&w=2574&auto=format&fit=crop', // Gold hoops
        'https://images.unsplash.com/photo-1617038224558-2838cb1d4835?q=80&w=2308&auto=format&fit=crop', // Drop
        'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?q=80&w=2670&auto=format&fit=crop', // Elegant
    ],
    bracelets: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2670&auto=format&fit=crop', // Gold chain
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2675&auto=format&fit=crop', // Cuff
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2670&auto=format&fit=crop', // Charm
        'https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=2670&auto=format&fit=crop', // Minimal
    ],
    rings: [
        'https://images.unsplash.com/photo-1605100804763-ebea243bc305?q=80&w=2670&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1598560976505-1a7653a43695?q=80&w=2670&auto=format&fit=crop'
    ]
}

async function checkUrl(url, category, index, failures) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
            const msg = `[FAIL] ${category}[${index}] (${response.status}): ${url}`;
            console.error(msg);
            failures.push(msg);
        } else {
            console.log(`[OK] ${category}[${index}]`);
        }
    } catch (e) {
        const msg = `[ERROR] ${category}[${index}]: ${e.message} - ${url}`;
        console.error(msg);
        failures.push(msg);
    }
}

async function main() {
    const failures = [];
    for (const [category, urls] of Object.entries(hdImages)) {
        for (let i = 0; i < urls.length; i++) {
            await checkUrl(urls[i], category, i, failures);
        }
    }

    if (failures.length > 0) {
        console.log("\nSUMMARY OF FAILURES:");
        failures.forEach(f => console.log(f));
    } else {
        console.log("\nALL URLS OK");
    }
}

main();
