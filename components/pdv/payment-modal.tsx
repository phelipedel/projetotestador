"use client"

import { useState } from "react"
import { collection, addDoc, doc, writeBatch, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { generateReceipt } from "@/lib/export-utils"
import { CreditCard, Banknote, Smartphone, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { CartItem } from "@/hooks/use-pdv"
import type { Customer } from "@/types/database"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  customer: Customer | null
  total: number
  discount: number
  onConfirmSale: (paymentMethod: string, notes?: string) => void
}

const paymentMethods = [
  { id: "dinheiro", name: "Dinheiro", icon: Banknote },
  { id: "cartao_debito", name: "Cartão Débito", icon: CreditCard },
  { id: "cartao_credito", name: "Cartão Crédito", icon: CreditCard },
  { id: "pix", name: "PIX", icon: Smartphone },
  { id: "boleto", name: "Boleto", icon: FileText },
]

export function PaymentModal({ isOpen, onClose, cart, customer, total, discount, onConfirmSale }: PaymentModalProps) {
  const [selectedPayment, setSelectedPayment] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleConfirm = async () => {
    if (!selectedPayment) return

    console.log("[PDV FIREBASE] Iniciando finalização de venda")
    setLoading(true)

    if (!db) {
      console.error("[PDV FIREBASE ERROR] Firebase não está configurado!")
      toast({
        title: "Erro",
        description: "Firebase não está configurado.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const batch = writeBatch(db)

      const saleRef = doc(collection(db, "sales"))
      const saleData = {
        items: cart.map((item) => ({
          productId: item.id,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        customerId: customer?.id || null,
        customerName: customer?.name || "Cliente não informado",
        subtotal: total + discount,
        discount: discount,
        total: total,
        paymentMethod: selectedPayment,
        notes: notes || null,
        createdAt: serverTimestamp(),
        status: "completed",
      }
      batch.set(saleRef, saleData)
      console.log("[PDV FIREBASE] Venda adicionada ao batch")

      const transactionRef = doc(collection(db, "financial_transactions"))
      const transactionData = {
        type: "receita",
        category: "Vendas",
        description: `Venda PDV #${saleRef.id.substring(0, 8).toUpperCase()}`,
        amount: total,
        date: serverTimestamp(),
        paymentMethod: selectedPayment,
        saleId: saleRef.id,
        status: "pago",
      }
      batch.set(transactionRef, transactionData)
      console.log("[PDV FIREBASE] Transação financeira adicionada ao batch")

      await batch.commit()
      console.log("[PDV FIREBASE SUCCESS] Venda e transação salvas com sucesso!")

      toast({
        title: "Venda finalizada!",
        description: "Venda registrada com sucesso.",
      })

      const receiptData = {
        items: cart.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        total: total,
        paymentMethod: paymentMethods.find((m) => m.id === selectedPayment)?.name || selectedPayment,
      }
      generateReceipt(receiptData, saleRef.id)

      await onConfirmSale(selectedPayment, notes)
      onClose()
    } catch (error: any) {
      console.error("[PDV FIREBASE ERROR] Erro ao finalizar venda:", error)
      console.error("[PDV FIREBASE ERROR] Código do erro:", error.code)
      console.error("[PDV FIREBASE ERROR] Mensagem do erro:", error.message)
      console.error("[PDV FIREBASE ERROR] Stack trace:", error.stack)

      toast({
        title: "Erro ao finalizar venda",
        description: error.message || "Ocorreu um erro ao processar a venda.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Finalizar Venda</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sale Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo da Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <p className="text-sm">{customer?.name || "Cliente não informado"}</p>
              </div>

              <div className="space-y-2">
                <Label>Itens ({cart.length})</Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.productName}
                      </span>
                      <span>R$ {item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R$ {(total + discount).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-accent">
                    <span>Desconto:</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-primary">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Forma de Pagamento</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <Button
                      key={method.id}
                      variant={selectedPayment === method.id ? "default" : "outline"}
                      onClick={() => setSelectedPayment(method.id)}
                      className="justify-start h-12"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {method.name}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre a venda..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={!selectedPayment || loading} className="flex-1">
                {loading ? "Processando..." : "Confirmar Venda"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
