'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/lib/store'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function AddProductPage() {
    const router = useRouter()
    const { token, user } = useAuthStore()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState('')
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories')
                if (res.ok) {
                    const data = await res.json()
                    setCategories(data)
                }
            } catch (err) {
                console.error('Failed to fetch categories', err)
            }
        }
        fetchCategories()
    }, [])

    if (!user?.reseller) {
        router.push('/reseller')
        return null
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        // Convert numeric strings
        const payload = {
            name: data.name,
            description: data.description,
            price: parseFloat(data.price as string),
            category: category, // Use state value
            image: data.image,
            material: data.material || 'Gold Plated',
            weight: parseFloat(data.weight as string) || 10,
            stock: parseInt(data.stock as string) || 10
        }

        console.log('Sending payload:', payload);

        try {
            const res = await fetch('/api/reseller/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            const responseData = await res.json()

            if (!res.ok) {
                throw new Error(responseData.error || 'Failed to create product')
            }

            toast({
                title: "Success",
                description: "Product added successfully",
            })
            router.push('/reseller')
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to add product',
                variant: "destructive"
            })
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <Link href="/reseller" className="flex items-center text-gray-600 mb-6 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>Add New Product</CardTitle>
                        <CardDescription>Add a product to your reseller catalog</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" name="name" required placeholder="e.g. Gold Plated Necklace" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₹)</Label>
                                    <Input id="price" name="price" type="number" min="0" required placeholder="999" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight (g)</Label>
                                    <Input id="weight" name="weight" type="number" min="0" defaultValue="10" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock Quantity</Label>
                                <Input id="stock" name="stock" type="number" min="1" required defaultValue="10" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select onValueChange={setCategory} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.length > 0 ? (
                                            categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.name}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <>
                                                <SelectItem value="necklaces">Necklaces</SelectItem>
                                                <SelectItem value="earrings">Earrings</SelectItem>
                                                <SelectItem value="bracelets">Bracelets</SelectItem>
                                                <SelectItem value="rings">Rings</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" required placeholder="Product details..." />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Image URL</Label>
                                <Input id="image" name="image" type="url" required placeholder="https://images.unsplash.com/..." />
                                <p className="text-xs text-muted-foreground">Provide a direct link to a high-quality image (Unsplash, Pexels, etc.)</p>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Add Product
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
