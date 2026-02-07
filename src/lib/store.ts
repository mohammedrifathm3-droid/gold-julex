import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'reseller' | 'admin'
  reseller?: {
    id: string
    businessName: string
    businessType?: string
    gstNumber?: string
    isVerified: boolean
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    priceB2c: number
    priceB2b?: number
    images: string[]
    stockQuantity: number
    selectedSize?: string
  }
  quantity: number
}

interface CartState {
  items: CartItem[]
  subtotal: number
  isB2B: boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setIsB2B: (isB2B: boolean) => void
  setItems: (items: CartItem[]) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      isB2B: false,
      setIsB2B: (isB2B) => {
        set({ isB2B })
        const items = get().items || []
        const subtotal = items.reduce((total, item) => {
          const price = isB2B && item.product.priceB2b
            ? item.product.priceB2b
            : item.product.priceB2c
          return total + (price * item.quantity)
        }, 0)
        set({ subtotal })
      },
      setItems: (items) => {
        const subtotal = items.reduce((total, item) => {
          const price = get().isB2B && item.product.priceB2b
            ? item.product.priceB2b
            : item.product.priceB2c
          return total + (price * item.quantity)
        }, 0)
        set({ items, subtotal })
      },
      addItem: (newItem) => {
        set((state) => {
          const items = [...(state.items || [])]
          const existingItemIndex = items.findIndex(item => item.product.id === newItem.product.id)

          if (existingItemIndex > -1) {
            items[existingItemIndex] = {
              ...items[existingItemIndex],
              quantity: items[existingItemIndex].quantity + newItem.quantity
            }
          } else {
            items.push(newItem)
          }

          const subtotal = items.reduce((total, item) => {
            const price = state.isB2B && item.product.priceB2b
              ? item.product.priceB2b
              : item.product.priceB2c
            return total + (price * item.quantity)
          }, 0)

          return { items, subtotal }
        })
      },
      removeItem: (productId) => {
        set((state) => {
          const items = (state.items || []).filter(item => item.product.id !== productId)
          const subtotal = items.reduce((total, item) => {
            const price = state.isB2B && item.product.priceB2b
              ? item.product.priceB2b
              : item.product.priceB2c
            return total + (price * item.quantity)
          }, 0)
          return { items, subtotal }
        })
      },
      updateQuantity: (productId, quantity) => {
        set((state) => {
          const items = (state.items || []).map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          )
          const subtotal = items.reduce((total, item) => {
            const price = state.isB2B && item.product.priceB2b
              ? item.product.priceB2b
              : item.product.priceB2c
            return total + (price * item.quantity)
          }, 0)
          return { items, subtotal }
        })
      },
      clearCart: () => {
        set({ items: [], subtotal: 0 })
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false
    }
  )
)

interface WishlistState {
  items: any[] // Array of full product objects
  addItem: (product: any) => void
  removeItem: (productId: string) => void
  toggleItem: (product: any) => void
  setWishlist: (products: any[]) => void
  isInWishlist: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items || []
        if (!items.find((item) => item.id === product.id)) {
          set({ items: [...items, product] })
        }
      },
      removeItem: (productId) => {
        set({ items: (get().items || []).filter((item) => item.id !== productId) })
      },
      toggleItem: (product) => {
        const items = get().items || []
        const exists = items.find((item) => item.id === product.id)
        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) })
        } else {
          set({ items: [...items, product] })
        }
      },
      setWishlist: (items) => set({ items: items || [] }),
      isInWishlist: (productId) => (get().items || []).some((item) => item.id === productId)
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)