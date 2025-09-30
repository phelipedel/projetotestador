"use client"

import { useState } from "react"
import { ShoppingCart, Trash2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import type { MobileCartItem } from "@/hooks/use-mobile-pdv"

interface MobileCartProps {
  cart: MobileCartItem[]
  total: number
  onRemoveItem: (itemId: string) => void
  onProcessSale: (paymentMethod: string) => Promise<void>
  onClearCart: () => void
  isProcessing: boolean
}

const paymentMethods = [
  { id: "dinheiro", name: "Dinheiro" },
  { id: "pix", name: "PIX" },
  { id: "cartao_debito", name: "Cartão Débito" },
  { id: "cartao_credito", name: "Cartão Crédito" },
]

export function MobileCart({ cart, total, onRemoveItem, onProcessSale, onClearCart, isProcessing }: MobileCartProps) {
  const [showPayment, setShowPayment] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleProcessSale = async (paymentMethod: string) => {
    try {
      await onProcessSale(paymentMethod)
      setShowPayment(false)
      setIsOpen(false)
    } catch (error) {
      console.error("Sale processing error:", error)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50" size="icon">
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {cart.length}
              </Badge>
            )}
          </div>
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Carrinho ({cart.length})</span>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearCart}>
                Limpar
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full mt-4">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Carrinho vazio</p>
              </div>
            ) : (
              cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.productName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">R$ {item.total.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Total and Checkout */}
          {cart.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-primary">R$ {total.toFixed(2)}</span>
              </div>

              {!showPayment ? (
                <Button onClick={() => setShowPayment(true)} className="w-full h-12" size="lg">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Finalizar Venda
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-center text-muted-foreground">Escolha a forma de pagamento:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => (
                      <Button
                        key={method.id}
                        onClick={() => handleProcessSale(method.id)}
                        disabled={isProcessing}
                        variant="outline"
                        className="h-11"
                      >
                        {isProcessing ? "..." : method.name}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={() => setShowPayment(false)} variant="ghost" size="sm" className="w-full">
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
