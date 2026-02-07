'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Image from 'next/image'

const AVAILABLE_FEATURES = [
    "Anti-Tarnish",
    "Waterproof",
    "Hypoallergenic",
    "Fade Resistant",
    "Nickel Free"
]

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const { token } = useAuthStore()
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        material: '',
        weight: '',
        priceB2c: '',
        cost: '',
        discount: '',
        minQuantity: '10',
        stockQuantity: '',
        categoryId: '',
    })

    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

    // Existing URLs
    const [existingImages, setExistingImages] = useState<string[]>([])
    // New Files
    const [newImages, setNewImages] = useState<File[]>([])
    // All previews (existing URLs + new File previews)
    const [previews, setPreviews] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch(`/api/products/${params.id}`)
                ])

                const categoriesData = await catRes.json()
                setCategories(categoriesData)

                if (prodRes.ok) {
                    const product = await prodRes.json()
                    setFormData({
                        name: product.name,
                        description: product.description || '',
                        material: product.material,
                        weight: product.weight.toString(),
                        priceB2c: product.priceB2c.toString(),
                        cost: product.cost ? product.cost.toString() : '',
                        discount: product.discount ? product.discount.toString() : '',
                        minQuantity: product.minQuantity ? product.minQuantity.toString() : '10',
                        stockQuantity: product.stockQuantity.toString(),
                        categoryId: product.category?.id || product.categoryId,
                    })

                    if (product.features) {
                        setSelectedFeatures(product.features)
                    }

                    if (product.images && product.images.length > 0) {
                        setExistingImages(product.images)
                        setPreviews(product.images)
                    }
                } else {
                    alert('Product not found')
                    router.push('/admin/products')
                }
            } catch (error) {
                console.error('Error fetching data', error)
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            fetchData()
        }
    }, [token, params.id, router])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)

            const totalImages = existingImages.length + newImages.length + files.length
            if (totalImages > 4) {
                alert('You can only have up to 4 images')
                return
            }

            setNewImages([...newImages, ...files])

            const newFilePreviews = files.map(file => URL.createObjectURL(file))
            setPreviews([...previews, ...newFilePreviews])
        }
    }

    const removeImage = (index: number) => {
        // If index is less than existingImages.length, it's an existing image
        if (index < existingImages.length) {
            const newExisting = [...existingImages]
            newExisting.splice(index, 1)
            setExistingImages(newExisting)
        } else {
            // It's a new image
            const newIndex = index - existingImages.length
            const newNewImages = [...newImages]
            newNewImages.splice(newIndex, 1)
            setNewImages(newNewImages)

            const urlToRevoke = previews[index]
            if (urlToRevoke.startsWith('blob:')) {
                URL.revokeObjectURL(urlToRevoke)
            }
        }

        const newPreviews = [...previews]
        newPreviews.splice(index, 1)
        setPreviews(newPreviews)
    }

    const toggleFeature = (feature: string) => {
        setSelectedFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const data = new FormData()
            data.append('name', formData.name)
            data.append('description', formData.description)
            data.append('material', formData.material)
            data.append('weight', formData.weight)
            data.append('priceB2c', formData.priceB2c)

            // Reseller Fields
            if (formData.cost) data.append('cost', formData.cost)
            if (formData.discount) data.append('discount', formData.discount)
            if (formData.minQuantity) data.append('minQuantity', formData.minQuantity)

            data.append('stockQuantity', formData.stockQuantity)
            data.append('categoryId', formData.categoryId)

            data.append('features', JSON.stringify(selectedFeatures))

            // Append existing images as strings
            existingImages.forEach(url => {
                data.append('images', url)
            })

            // Append new images as Files
            newImages.forEach(file => {
                data.append('images', file)
            })

            const res = await fetch(`/api/products/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            })

            if (res.ok) {
                router.push('/admin/products')
            } else {
                alert('Failed to update product')
            }
        } catch (error) {
            console.error('Update error:', error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-10">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Edit Product</h2>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={value => setFormData({ ...formData, categoryId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-1/3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between font-normal text-left">
                                            {selectedFeatures.length > 0
                                                ? <span className="truncate">{selectedFeatures.length} selected</span>
                                                : <span className="text-muted-foreground">Select features</span>}
                                            <div className="opacity-50">
                                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>Product Features</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {AVAILABLE_FEATURES.map(feature => (
                                            <DropdownMenuCheckboxItem
                                                key={feature}
                                                checked={selectedFeatures.includes(feature)}
                                                onCheckedChange={() => toggleFeature(feature)}
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                {feature}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price B2C (₹)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                required
                                value={formData.priceB2c}
                                onChange={e => setFormData({ ...formData, priceB2c: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                required
                                value={formData.stockQuantity}
                                onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Reseller Fields */}
                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Reseller Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cost">Cost (₹)</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    min="0"
                                    value={formData.cost}
                                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discount">Discount (%)</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.discount}
                                    onChange={e => setFormData({ ...formData, discount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minQuantity">Min Quantity</Label>
                                <Input
                                    id="minQuantity"
                                    type="number"
                                    min="1"
                                    value={formData.minQuantity}
                                    onChange={e => setFormData({ ...formData, minQuantity: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight (g)</Label>
                            <Input
                                id="weight"
                                type="number"
                                step="0.1"
                                min="0"
                                required
                                value={formData.weight}
                                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="material">Material</Label>
                            <Input
                                id="material"
                                required
                                value={formData.material}
                                onChange={e => setFormData({ ...formData, material: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Images (Max 4)</Label>
                        <div className="grid grid-cols-4 gap-4 mt-2">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative aspect-square border rounded-lg overflow-hidden group">
                                    <Image
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {previews.length < 4 && (
                                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                                    <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500">Upload</span>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </Label>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
