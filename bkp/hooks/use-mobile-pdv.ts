"use client"

import { useState, useCallback } from "react"
import type { Product, SaleItem } from "@/types/database"

export interface MobileCartItem extends SaleItem {
  id: string
}

export function useMobilePDV() {
  const [cart, setCart] = useState<MobileCartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

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

      const newItem: MobileCartItem = {
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

  const quickSale = useCallback(async (product: Product, paymentMethod: string) => {
    setIsProcessing(true)
    try {
      const saleData = {
        items: [
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPrice: product.price,
            total: product.price,
          },
        ],
        subtotal: product.price,
        discount: 0,
        total: product.price,
        paymentMethod,
        notes: "Venda rápida mobile",
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      })

      if (!response.ok) {
        throw new Error("Erro ao processar venda")
      }

      return await response.json()
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const processSale = useCallback(
    async (paymentMethod: string) => {
      if (cart.length === 0) return

      setIsProcessing(true)
      try {
        const subtotal = cart.reduce((sum, item) => sum + item.total, 0)

        const saleData = {
          items: cart.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
          subtotal,
          discount: 0,
          total: subtotal,
          paymentMethod,
          notes: "Venda mobile",
        }

        const response = await fetch("/api/sales", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saleData),
        })

        if (!response.ok) {
          throw new Error("Erro ao processar venda")
        }

        const result = await response.json()
        setCart([])
        return result
      } finally {
        setIsProcessing(false)
      }
    },
    [cart],
  )

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const total = cart.reduce((sum, item) => sum + item.total, 0)

  return {
    cart,
    total,
    isProcessing,
    addToCart,
    quickSale,
    processSale,
    removeFromCart,
    clearCart,
  }
}
