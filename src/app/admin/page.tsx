'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react'

export default function AdminDashboard() {
    const { token } = useAuthStore()
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        users: 0,
        revenue: 0
    })
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [popularProducts, setPopularProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}` }

                // Fetch Stats
                const statsRes = await fetch('/api/admin/stats', { headers })
                if (statsRes.ok) setStats(await statsRes.json())

                // Fetch Recent Orders (reusing orders API)
                const ordersRes = await fetch('/api/admin/orders', { headers })
                if (ordersRes.ok) {
                    const data = await ordersRes.json()
                    setRecentOrders(data.orders.slice(0, 5))
                }

                // Fetch Products (for "Popular", using latest for now)
                const productsRes = await fetch('/api/admin/products', { headers })
                if (productsRes.ok) {
                    const products = await productsRes.json()
                    setPopularProducts(products.slice(0, 5))
                }

            } catch (error) {
                console.error('Failed to fetch dashboard data', error)
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            fetchDashboardData()
        }
    }, [token])

    if (loading) {
        return <div className="p-8">Loading dashboard...</div>
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.revenue?.toLocaleString() || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.products}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.orders}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-gray-500">No orders yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{order.user?.name}</p>
                                            <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm font-medium">₹{order.total}</div>
                                            <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Popular Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {popularProducts.length === 0 ? (
                            <p className="text-sm text-gray-500">No products available.</p>
                        ) : (
                            <div className="space-y-4">
                                {popularProducts.map((product) => (
                                    <div key={product.id} className="flex items-center gap-4">
                                        <img
                                            src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/placeholder-jewelry.jpg'}
                                            alt={product.name}
                                            className="w-10 h-10 rounded-md object-cover"
                                        />
                                        <div className="space-y-1 overflow-hidden">
                                            <p className="text-sm font-medium leading-none truncate">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">₹{product.priceB2c}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
