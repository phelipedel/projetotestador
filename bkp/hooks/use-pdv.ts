"use client"

import { useState, useCallback } from "react"
import type { Product, Customer, SaleItem } from "@/types/database"

export interface CartItem extends SaleItem {
  id: string
}

export function usePDV() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [discount, setDiscount] = useState(0)

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id)

      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total: (item.quantity + quantity) * item.unitPrice,
              }
            : item,
        )
      }

      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total: product.price * quantity,
      }

      return [...prevCart, newItem]
    })
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              total: quantity * item.unitPrice,
            }
          : item,
      ),
    )
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setSelectedCustomer(null)
    setDiscount(0)
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const total = subtotal - discount

  return {
    cart,
    selectedCustomer,
    discount,
    subtotal,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setSelectedCustomer,
    setDiscount,
  }
}
