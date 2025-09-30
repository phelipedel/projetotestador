"use client"

import { useState } from "react"
import { Package, Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/types/database"

interface MobileProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onQuickSale: (product: Product, paymentMethod: string) => Promise<void>
}

const quickPaymentMethods = [
  { id: "dinheiro", name: "Dinheiro" },
  { id: "pix", name: "PIX" },
  { id: "cartao_debito", name: "Débito" },
]

export function MobileProductCard({ product, onAddToCart, onQuickSale }: MobileProductCardProps) {
  const [showQuickSale, setShowQuickSale] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleQuickSale = async (paymentMethod: string) => {
    setProcessing(true)
    try {
      await onQuickSale(product, paymentMethod)
      setShowQuickSale(false)
    } catch (error) {
      console.error("Quick sale error:", error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card className="touch-manipulation">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Info */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground">{product.sku}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                <Badge variant={product.stock > product.minStock ? "secondary" : "destructive"} className="text-xs">
                  {product.stock}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!showQuickSale ? (
            <div className="flex gap-2">
              <Button
                onClick={() => onAddToCart(product)}
                disabled={product.stock <= 0}
                variant="outline"
                size="sm"
                className="flex-1 h-11"
              >
                <Plus className="h-4 w-4 mr-1" />
                Carrinho
              </Button>
              <Button
                onClick={() => setShowQuickSale(true)}
                disabled={product.stock <= 0}
                size="sm"
                className="flex-1 h-11"
              >
                <Zap className="h-4 w-4 mr-1" />
                Venda Rápida
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-center text-muted-foreground">Escolha a forma de pagamento:</p>
              <div className="grid grid-cols-1 gap-1">
                {quickPaymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    onClick={() => handleQuickSale(method.id)}
                    disabled={processing}
                    size="sm"
                    className="h-9 text-xs"
                  >
                    {processing ? "Processando..." : method.name}
                  </Button>
                ))}
              </div>
              <Button onClick={() => setShowQuickSale(false)} variant="ghost" size="sm" className="w-full h-8 text-xs">
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
