"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CustomerSearchModal } from "./customer-search-modal"
import type { CartItem } from "@/hooks/use-pdv"
import type { Customer } from "@/types/database"

interface ShoppingCartProps {
  cart: CartItem[]
  selectedCustomer: Customer | null
  discount: number
  subtotal: number
  total: number
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onSelectCustomer: (customer: Customer | null) => void
  onSetDiscount: (discount: number) => void
  onCheckout: () => void
}

export function ShoppingCart({
  cart,
  selectedCustomer,
  discount,
  subtotal,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onSelectCustomer,
  onSetDiscount,
  onCheckout,
}: ShoppingCartProps) {
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)

  const handleRemoveCustomer = () => {
    onSelectCustomer(null)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Carrinho de Compras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Selection */}
        <div className="space-y-2">
          <Label>Cliente</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Selecionar cliente..."
              value={selectedCustomer?.name || ""}
              readOnly
              className="flex-1"
            />
            {selectedCustomer ? (
              <Button variant="outline" size="sm" onClick={handleRemoveCustomer}>
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowCustomerSearch(true)}>
                Buscar
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Cart Items */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Carrinho vazio</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">R$ {item.unitPrice.toFixed(2)} cada</p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <span className="w-8 text-center text-sm">{item.quantity}</span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="text-right">
                  <p className="font-medium text-sm">R$ {item.total.toFixed(2)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Separator />

        {/* Discount */}
        <div className="space-y-2">
          <Label>Desconto (R$)</Label>
          <Input
            type="number"
            min="0"
            max={subtotal}
            step="0.01"
            value={discount}
            onChange={(e) => onSetDiscount(Number.parseFloat(e.target.value) || 0)}
            placeholder="0,00"
          />
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-accent">
              <span>Desconto:</span>
              <span>- R$ {discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button onClick={onCheckout} disabled={cart.length === 0} className="w-full" size="lg">
          Finalizar Venda
        </Button>
      </CardContent>

      {/* Customer Search Modal */}
      <CustomerSearchModal
        isOpen={showCustomerSearch}
        onClose={() => setShowCustomerSearch(false)}
        onSelectCustomer={onSelectCustomer}
      />
    </Card>
  )
}
