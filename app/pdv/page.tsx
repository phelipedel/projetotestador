"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/components/auth/auth-provider"
import { ProductGrid } from "@/components/pdv/product-grid"
import { ShoppingCart } from "@/components/pdv/shopping-cart"
import { PaymentModal } from "@/components/pdv/payment-modal"
import { usePDV } from "@/hooks/use-pdv"
import type { Product } from "@/types/database"

export default function PDVPage() {
  const { user, logout } = useAuthContext()
  const router = useRouter()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const {
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
  } = usePDV()

  const handleAddToCart = (product: Product) => {
    addToCart(product)
  }

  const handleCheckout = () => {
    setShowPaymentModal(true)
  }

  const handleConfirmSale = async (paymentMethod: string, notes?: string) => {
    try {
      const saleData = {
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name || "",
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        subtotal,
        discount,
        total,
        paymentMethod,
        notes: notes || "",
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user?.firebaseUser?.getIdToken()}`,
        },
        body: JSON.stringify(saleData),
      })

      if (response.ok) {
        clearCart()
        setShowPaymentModal(false)
        // Show success message or redirect
        alert("Venda realizada com sucesso!")
      } else {
        throw new Error("Erro ao processar venda")
      }
    } catch (error) {
      console.error("Error confirming sale:", error)
      alert("Erro ao processar venda. Tente novamente.")
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Fire ERP - PDV</h1>
              <p className="text-sm text-muted-foreground">Operador: {user?.displayName || user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Products Section */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductGrid onAddToCart={handleAddToCart} />
            </CardContent>
          </Card>
        </div>

        {/* Shopping Cart Section */}
        <div className="w-96 p-6 border-l border-border">
          <ShoppingCart
            cart={cart}
            selectedCustomer={selectedCustomer}
            discount={discount}
            subtotal={subtotal}
            total={total}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onSelectCustomer={setSelectedCustomer}
            onSetDiscount={setDiscount}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cart={cart}
        customer={selectedCustomer}
        total={total}
        discount={discount}
        onConfirmSale={handleConfirmSale}
      />
    </div>
  )
}
